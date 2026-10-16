/* PerfilWiki 1.1.0. Shared history and statistics/pageviews coordinator.
 * Daniel G Rego, CC BY-SA 4.0. Caller supplies an anonymous read-only transport. */
(function (root, factory) {
    var common = typeof module === 'object' && module.exports;
    var api = factory(common ? require('./PageviewsCore.js') : root.PerfilWikiPageviewsCore,
        common ? require('./History.js') : root.PerfilWikiHistory,
        common ? require('./Statistics.js') : root.PerfilWikiStatistics);
    if (common) { module.exports = api; } else { root.PerfilWikiCoordinator = api; }
}(typeof window !== 'undefined' ? window : this, function (pageviews, historyCore, statisticsCore) {
    'use strict';
    function identity(config) { return { user: config.user, project: config.project }; }
    function activityFrom(history, previous, config, now) {
        if (history.complete) {
            var entries = historyCore.richToActivityEntries(history);
            return { identity: identity(config), entries: entries, complete: true, capturedAt: history.capturedAt,
                lastAttemptAt: now, fullScanAt: history.fullScanAt, scanMode: history.scanMode,
                pagesFetched: history.pagesFetched || 0, summary: pageviews.summarize(entries, {config: config, now: now}),
                cacheHit: !!history.cacheHit, stale: !!history.stale || !!history.pending, error: history.error || null };
        }
        if (previous && previous.complete && previous.identity.user === config.user && previous.identity.project === config.project) {
            return Object.assign({}, previous, {summary: pageviews.summarize(previous.entries, {config: config, now: now}),
                lastAttemptAt: now, stale: true, error: history.error || null});
        }
        return { identity: identity(config), entries: [], complete: false, capturedAt: null, lastAttemptAt: now,
            fullScanAt: null, scanMode: 'full', pagesFetched: 0, summary: null, cacheHit: false, stale: true, error: history.error || null };
    }
    function validateState(state) {
        var check = pageviews.validateState(state);
        if (!check.valid) { return check; }
        var user = state.config.user, now = state.capturedAt;
        if (state.history) {
            var history = historyCore.validate(state.history, {user: user, now: now});
            if (!history.valid) { return history; }
            if (state.history.complete && JSON.stringify(historyCore.richToActivityEntries(state.history)) !== JSON.stringify(state.activity.entries)) {
                return { valid: false, errors: ['O painel e os contadores usam históricos diferentes.'] };
            }
        }
        if (state.statistics) {
            var stats = statisticsCore.validate(state.statistics, {user: user, now: now});
            if (!stats.valid) { return stats; }
            var stamps = state.statistics.metricUpdatedAt, metrics = state.statistics.metrics;
            if (state.activity.complete && stamps.bestStreak === state.activity.capturedAt &&
                metrics.bestStreak !== state.activity.summary.bestStreak) {
                return {valid: false, errors: ['A melhor sequência difere do histórico consultado.']};
            }
            if (state.history && state.history.complete && stamps.reverts === state.history.capturedAt) {
                var reverts = state.history.entries.filter(function (entry) {
                    return entry[8].some(function (tag) { return ['mw-rollback', 'mw-undo', 'mw-manual-revert'].indexOf(tag) >= 0; });
                }).length;
                if (metrics.reverts !== reverts) { return {valid: false, errors: ['As reversões diferem do histórico consultado.']}; }
            }
            if (state.history && state.history.complete && ['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].some(function (key) {
                return stamps[key] === state.history.capturedAt;
            })) {
                var byteTotals = statisticsCore.byteTotals(state.history,user,now);
                if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].some(function (key) {
                    return stamps[key] === state.history.capturedAt && metrics[key] !== byteTotals[key];
                })) { return {valid:false, errors:['As contagens de bytes diferem do histórico consultado.']}; }
            }
        }
        return check;
    }
    async function update(options) {
        var requestLimit = options.maxRequests === undefined ? 40 : options.maxRequests, requests = 0;
        if (!Number.isInteger(requestLimit) || requestLimit < 1 || requestLimit > 1000 || typeof options.requestJson !== 'function') { throw new Error('Orçamento de consultas inválido.'); }
        function budgetError() { var error = new Error('O orçamento de consultas foi concluído.'); error.code = 'request-budget'; return error; }
        function dispatch(url) {
            if (requests >= requestLimit) { return Promise.reject(budgetError()); }
            requests += 1; return options.requestJson(url);
        }
        var config = Object.assign({}, pageviews.DEFAULT_CONFIG, options.config || {});
        var now = new Date(options.now === undefined ? Date.now() : options.now).toISOString();
        var previous = options.previous || null;
        if (previous && (!validateState(previous).valid || previous.config.user !== config.user || previous.config.timeZone !== config.timeZone)) { previous = null; }
        // The two collectors classify overlapping page IDs in different batch
        // orders. Share each verified response instead of fetching it twice.
        var metadata = new Map(), metadataJobs = new Map(), previousMetadata = new Map();
        if (previous && previous.statistics) {
            Object.keys(previous.statistics.pageInfo || {}).forEach(function (id) {
                var record = previous.statistics.pageInfo[id];
                if (Date.parse(record.checkedAt) >= Date.parse(now) - 86400000) {
                    var page = Object.assign({},record); delete page.checkedAt;
                    previousMetadata.set(Number(id),page);
                }
            });
        }
        function metadataIds(address) {
            try {
                var url = new URL(address), params = url.searchParams;
                if (url.origin !== 'https://pt.wikipedia.org' || url.pathname !== '/w/api.php' ||
                    params.get('action') !== 'query' || params.get('format') !== 'json' || params.get('formatversion') !== '2' ||
                    params.get('prop') !== 'info' || Array.from(params.keys()).some(function (key) {
                        return ['action','format','formatversion','origin','maxlag','prop','pageids'].indexOf(key) < 0;
                    })) { return null; }
                var ids = String(params.get('pageids') || '').split('|').map(Number);
                return ids.length && ids.length <= 50 && ids.every(function (id) { return Number.isSafeInteger(id) && id > 0; }) &&
                    new Set(ids).size === ids.length ? ids : null;
            } catch (_) { return null; }
        }
        async function metadataRequest(address, allowPrevious) {
            var ids = metadataIds(address);
            if (!ids) { return dispatch(address); }
            function available(id) { return metadata.get(id) || allowPrevious && previousMetadata.get(id); }
            var missing = ids.filter(function (id) { return !available(id) && !metadataJobs.has(id); });
            if (missing.length) {
                var url = new URL(address); url.searchParams.set('pageids',missing.join('|'));
                var job = Promise.resolve().then(function () { return dispatch(url.toString()); }).then(function (response) {
                    var pages = response && response.query && response.query.pages, expected = new Set(missing), accepted = [];
                    if (!response || response.batchcomplete !== true || response.continue || response.error ||
                        response.warnings && Object.keys(response.warnings).length || !Array.isArray(pages) || pages.length !== missing.length) {
                        throw new Error('Metadados compartilhados incompletos.');
                    }
                    pages.forEach(function (page) {
                        if (!page || !expected.delete(page.pageid)) { throw new Error('Metadados compartilhados inválidos.'); }
                        accepted.push(page);
                    });
                    accepted.forEach(function (page) { metadata.set(page.pageid,JSON.parse(JSON.stringify(page))); });
                });
                missing.forEach(function (id) { metadataJobs.set(id,job); });
                job.finally(function () { missing.forEach(function (id) { if (metadataJobs.get(id) === job) { metadataJobs.delete(id); } }); }).catch(function () {});
            }
            await Promise.all(ids.map(function (id) { return metadataJobs.get(id) || Promise.resolve(); }));
            return {batchcomplete:true,query:{pages:ids.map(function (id) {
                var page = available(id); if (!page) { throw new Error('Metadados compartilhados ausentes.'); }
                return JSON.parse(JSON.stringify(page));
            })}};
        }
        var requestJson = function (url) { return metadataRequest(url,false); };
        var viewRequestJson = function (url) { return metadataRequest(url,true); };
        var history = previous && previous.history || null;
        var activity = activityFrom(history || {complete:false,error:null}, previous && previous.activity, config, now);
        var statistics = previous && previous.statistics || null, latestViews = null, statsError = null;
        function stateWith(views) {
            var customComplete = !options.customRange || !!(views.periods.custom && views.periods.custom.complete);
            return {profileSchema: 1, schemaVersion: 4, config: config, capturedAt: now, activity: activity,
                history: history, statistics: statistics, pageviews: views,
                complete: !!activity.complete && !!views.complete && customComplete && !!statistics && !statistics.pending && !(history && history.pending),
                fresh: !activity.stale && !views.stale && customComplete && !!statistics && !statistics.errors.length && !statistics.pending && !(history && history.pending) && !statsError,
                cacheDiscarded: !!options.previous && !previous};
        }
        async function publish(views) {
            latestViews = views;
            if (options.onProgress) { await options.onProgress(stateWith(views)); }
        }
        // Independent identity counters should not wait behind a complete
        // account-history scan. This bounded first pass never visits other wikis.
        var identityBudget = Math.min(3, Math.max(0,requestLimit - 1));
        var needsIdentity = !statistics || !statistics.metricUpdatedAt.edits || !statistics.metricUpdatedAt.registration ||
            options.includeEarliestRegistration === true && !statistics.registrationCoverage;
        if (needsIdentity && identityBudget) {
            statistics = await statisticsCore.collect({user:config.user,now:now,history:history,activity:activity,
                previous:statistics,requestJson:requestJson,maxRequests:identityBudget,deferDetails:true,
                includeEarliestRegistration:options.includeEarliestRegistration === true,includeUserGroups:options.includeUserGroups === true});
            if (options.onProgress && !activity.complete) {
                var initialViews = await pageviews.collectPageviews(Object.assign({},options,{config:config,now:now,
                    previous:previous,activity:activity,requestJson:viewRequestJson,maxRequests:1,metadataOnly:true,onProgress:undefined}));
                await publish(initialViews);
            }
        }
        history = await historyCore.collect({user: config.user, now: now, previous: previous && previous.history,
            requestJson: requestJson, maxRequests: Math.min(options.historyBudget || (previous && previous.history && previous.history.complete ? 20 : 30),Math.max(1,requestLimit - requests)), fullRescanMs: config.fullRescanMs,
            refreshMs: config.activityRefreshMs, force: config.activityRefreshMs === 0});
        activity = activityFrom(history, previous && previous.activity, config, now);
        // The early empty-candidate checkpoint belongs to the pre-history stage.
        latestViews = null;
        var statsOptions = {user: config.user, now: now, history: history, activity: activity,
            previous: statistics, requestJson: requestJson, maxRequests: Math.min(options.statisticsBudget ||
                (previous && previous.pageviews && previous.pageviews.metadata && previous.pageviews.metadata.complete ? 20 : 3),requestLimit),
            force: !!options.forceStatistics, includeThanksSent: options.includeThanksSent === true,
            includeEarliestRegistration: options.includeEarliestRegistration === true, includeUserGroups: options.includeUserGroups === true};
        var historyChanged = history.complete && (!previous || !previous.history || !previous.history.complete || previous.history.capturedAt !== history.capturedAt);
        var serviceErrors = statistics && statistics.errors.some(function (error) { return error !== 'Histórico local completo indisponível'; });
        var newlyEnabledGroups = options.includeUserGroups === true && statistics && !statistics.userGroups &&
            statistics.errors.indexOf('Estatutos na ptwiki') < 0;
        var statsCoolingDown = serviceErrors && !historyChanged && Date.parse(now) - Date.parse(statistics.capturedAt) < 300000 && !options.forceStatistics && !newlyEnabledGroups;
        var statsJob = (statsCoolingDown ? Promise.resolve(statistics) : statisticsCore.collect(statsOptions)).then(async function (value) {
                statistics = value;
                if (latestViews && options.onProgress) { await options.onProgress(stateWith(latestViews)); }
            });
        // Avoid a rejected promise escaping while pageview requests are still running.
        statsJob = statsJob.catch(function (error) { statsError = error; });
        var views = await pageviews.collectPageviews(Object.assign({}, options, {config: config, now: now,
            previous: previous, activity: activity, requestJson:viewRequestJson, onProgress: publish}));
        latestViews = views;
        await statsJob;
        if (statsError && !statistics) { throw statsError; }
        if (statsError) {
            statistics = JSON.parse(JSON.stringify(statistics));
            statistics.capturedAt = now;
            statistics.errors = ['Consulta de contadores incompleta'];
            statistics.pending = true;
        }
        var state = stateWith(views);
        var result = validateState(state);
        if (!result.valid) { throw new Error('Os dados integrados são inválidos: ' + result.errors.join(', ')); }
        return state;
    }
    return Object.freeze(Object.assign({}, pageviews, {update: update, validateState: validateState, activityFrom: activityFrom}));
}));
