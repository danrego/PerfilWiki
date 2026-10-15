/* PerfilWiki 1.0.0. Shared history and statistics/pageviews coordinator.
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
        }
        return check;
    }
    async function update(options) {
        var config = Object.assign({}, pageviews.DEFAULT_CONFIG, options.config || {});
        var now = new Date(options.now === undefined ? Date.now() : options.now).toISOString();
        var previous = options.previous || null;
        if (previous && (!validateState(previous).valid || previous.config.user !== config.user || previous.config.timeZone !== config.timeZone)) { previous = null; }
        var history = await historyCore.collect({user: config.user, now: now, previous: previous && previous.history,
            requestJson: options.requestJson, maxRequests: options.historyBudget || 20, fullRescanMs: config.fullRescanMs,
            refreshMs: config.activityRefreshMs, force: config.activityRefreshMs === 0});
        var activity = activityFrom(history, previous && previous.activity, config, now);
        var statistics = previous && previous.statistics || null, latestViews = null;
        function stateWith(views) {
            return {profileSchema: 1, schemaVersion: 4, config: config, capturedAt: now, activity: activity,
                history: history, statistics: statistics, pageviews: views,
                complete: !!activity.complete && !!views.complete && !!statistics && !statistics.pending && !history.pending,
                fresh: !activity.stale && !views.stale && !!statistics && !statistics.errors.length && !statistics.pending && !history.pending && !statsError,
                cacheDiscarded: !!options.previous && !previous};
        }
        async function publish(views) {
            latestViews = views;
            if (options.onProgress) { await options.onProgress(stateWith(views)); }
        }
        var statsOptions = {user: config.user, now: now, history: history, activity: activity,
            previous: statistics, requestJson: options.requestJson, maxRequests: options.statisticsBudget || 20,
            force: !!options.forceStatistics};
        var historyChanged = history.complete && (!previous || !previous.history || !previous.history.complete || previous.history.capturedAt !== history.capturedAt);
        var serviceErrors = statistics && statistics.errors.some(function (error) { return error !== 'Histórico local completo indisponível'; });
        var statsCoolingDown = serviceErrors && !historyChanged && Date.parse(now) - Date.parse(statistics.capturedAt) < 300000 && !options.forceStatistics;
        var statsJob = (statsCoolingDown ? Promise.resolve(statistics) : statisticsCore.collect(statsOptions)).then(async function (value) {
                statistics = value;
                if (latestViews && options.onProgress) { await options.onProgress(stateWith(latestViews)); }
            });
        // Avoid a rejected promise escaping while pageview requests are still running.
        var statsError = null;
        statsJob = statsJob.catch(function (error) { statsError = error; });
        var views = await pageviews.collectPageviews(Object.assign({}, options, {config: config, now: now,
            previous: previous, activity: activity, onProgress: publish}));
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
