/* PerfilWiki 1.0.1. Daniel G Rego, CC BY-SA 4.0. Built from src, without seeded metrics. */

;

/* PerfilWiki 1.0.0. Configuration and anonymous-source boundary. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiConfiguration = api; }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';
    var BLACKLIST = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
    function title(value) {
        return typeof value === 'string' && value.length > 0 && value.length <= 512 && !/[\x00-\x1f\x7f<>\[\]{}|#]/.test(value);
    }
    function resolve(mw, win) {
        var input = win.PerfilWikiConfig || {};
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(function (k) { return ['user','timeZone','stylesPage','documentationPage'].indexOf(k) < 0; })) { throw new Error('Opção de configuração desconhecida.'); }
        var user = input.user === undefined ? mw.config.get('wgUserName') : input.user;
        if (typeof user !== 'string') { throw new Error('Informe um nome de usuário.'); }
        user = user.replace(/_/g, ' ').trim().normalize('NFC');
        if (!title(user) || user.length > 255 || /[:/]/.test(user)) { throw new Error('Nome de usuário inválido.'); }
        var zone = input.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        if (typeof zone !== 'string') { throw new Error('Fuso inválido.'); }
        new Intl.DateTimeFormat('pt-BR', {timeZone: zone}).format(new Date(0));
        var stylesPage = input.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos';
        var documentationPage = input.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki';
        if (!title(stylesPage) || !title(documentationPage)) { throw new Error('Título de página inválido.'); }
        return {metrics: {user:user, project:'pt.wikipedia.org', timeZone:zone, activityRefreshMs:300000,
            fullRescanMs:2592000000, pageviewsRefreshMs:86400000, rankLimit:1000}, stylesPage:stylesPage, documentationPage:documentationPage};
    }
    function requestAllowed(value) {
        try {
            var url = new URL(value);
            if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) { return false; }
            if (url.href === BLACKLIST) { return true; }
            if (url.pathname === '/w/api.php' && /(^|\.)(wikipedia|wikimedia|wikidata|wiktionary|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|mediawiki|wikifunctions)\.org$/.test(url.hostname)) {
                return url.searchParams.getAll('action').length === 1 && url.searchParams.get('action') === 'query' &&
                    !url.searchParams.has('assert') && !url.searchParams.has('assertuser') &&
                    !url.searchParams.has('token') && !url.searchParams.has('csrftoken') &&
                    url.searchParams.getAll('meta').every(function (v) { return v.split('|').indexOf('tokens') < 0; });
            }
            if (url.origin === 'https://wikimedia.org') {
                return !url.search && (url.pathname.indexOf('/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/') === 0 ||
                    /^\/api\/rest_v1\/metrics\/pageviews\/top\/pt\.wikipedia\.org\/all-access\/\d{4}\/\d{2}\/(?:\d{2}|all-days)$/.test(url.pathname));
            }
            return url.origin === 'https://xtools.wmcloud.org' && /^\/api\/user\/pages_count\/[a-z0-9-]+\.wikipedia\.org\/[^/]+\/0\/noredirects\/all$/.test(url.pathname) && !url.search;
        } catch (_) { return false; }
    }
    return Object.freeze({resolve:resolve, requestAllowed:requestAllowed, validTitle:title});
}));

;

/* PerfilWiki 1.0.0, pageview engine derived from RitmoPU 8.0.3. CC BY-SA 4.0.
 * Author: Daniel G Rego. Public GET data only; no authentication or wiki writes. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    if (root) { root.PerfilWikiPageviewsCore = api; }
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var DAY = 86400000;
    var DEFAULT_CONFIG = Object.freeze({
        user: '',
        project: 'pt.wikipedia.org',
        timeZone: 'UTC',
        activityRefreshMs: 300000,
        fullRescanMs: 30 * DAY,
        pageviewsRefreshMs: DAY,
        rankLimit: 1000
    });
    var own = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
    var assertedFlag = function (object, key) {
        return !!object && own(object, key) && (object[key] === true || object[key] === 1 || object[key] === '');
    };
    var formatters = new Map();

    function fail(message, code) {
        var error = new Error(message);
        error.code = code || 'invalid-data';
        throw error;
    }

    function errorInfo(error) {
        return {
            code: error && error.code ? String(error.code) : 'request-failed',
            message: error && error.message ? String(error.message) : 'Request failed.'
        };
    }

    function nowDate(value) {
        var result = value === undefined ? new Date() : new Date(value);
        if (!Number.isFinite(result.getTime())) { fail('Invalid current time.'); }
        return result;
    }

    function normalizeConfig(input, expectedRankLimit) {
        var config = Object.assign({}, DEFAULT_CONFIG, input || {});
        if (input && own(input, 'timezone') && !own(input, 'timeZone')) { config.timeZone = input.timezone; }
        config.user = String(config.user || '').trim();
        if (!config.user) { fail('A Wikipedia username is required.'); }
        // This panel has an explicit Portuguese Wikipedia scope.
        if (config.project !== 'pt.wikipedia.org') { fail('Only pt.wikipedia.org is supported.'); }
        ['activityRefreshMs', 'fullRescanMs', 'pageviewsRefreshMs'].forEach(function (key) {
            if (!Number.isFinite(config[key]) || config[key] < 0) { fail('Invalid cache duration: ' + key); }
        });
        var requiredRankLimit = expectedRankLimit === 100 || expectedRankLimit === 250 ? expectedRankLimit : 1000;
        if (config.rankLimit !== requiredRankLimit) { fail('The visible exact ranking contains at most ' + requiredRankLimit + ' articles.'); }
        localDate(new Date(0), config.timeZone);
        return {
            user: config.user,
            project: config.project,
            timeZone: config.timeZone,
            activityRefreshMs: config.activityRefreshMs,
            fullRescanMs: config.fullRescanMs,
            pageviewsRefreshMs: config.pageviewsRefreshMs,
            rankLimit: requiredRankLimit
        };
    }

    function localDate(value, timeZone) {
        var date = nowDate(value);
        var zone = timeZone || DEFAULT_CONFIG.timeZone;
        var formatter = formatters.get(zone);
        if (!formatter) {
            formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit'
            });
            formatters.set(zone, formatter);
        }
        var parts = formatter.formatToParts(date);
        var fields = {};
        parts.forEach(function (part) { fields[part.type] = part.value; });
        return fields.year + '-' + fields.month + '-' + fields.day;
    }

    function validDate(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) { return false; }
        var date = new Date(value + 'T00:00:00.000Z');
        return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function addDate(value, amount) {
        if (!validDate(value) || !Number.isInteger(amount)) { fail('Invalid calendar date or day offset.'); }
        return new Date(new Date(value + 'T00:00:00.000Z').getTime() + amount * DAY).toISOString().slice(0, 10);
    }

    function validTimestamp(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
            Number.isFinite(new Date(value).getTime()) && validDate(value.slice(0, 10));
    }

    // Compact, lossless fields used by this panel: revision, page, namespace, title, UTC time, creation flag.
    function unpackEntry(entry) {
        if (Array.isArray(entry)) {
            return { revid: entry[0], pageid: entry[1], ns: entry[2], title: entry[3], timestamp: entry[4], isNew: entry[5] === 1 || entry[5] === true };
        }
        return {
            revid: entry && entry.revid,
            pageid: entry && entry.pageid,
            ns: entry && entry.ns,
            title: entry && entry.title,
            timestamp: entry && entry.timestamp,
            // formatversion=2 returns boolean flags, including new:false.
            // The empty string is the older API representation of an asserted flag.
            isNew: !!entry && (entry.isNew === true || entry.isNew === 1 || assertedFlag(entry, 'new'))
        };
    }

    function packEntry(raw) {
        var entry = unpackEntry(raw);
        if (!Number.isSafeInteger(entry.revid) || entry.revid <= 0 ||
            !Number.isSafeInteger(entry.pageid) || entry.pageid < 0 ||
            !Number.isInteger(entry.ns) || entry.ns < 0 ||
            typeof entry.title !== 'string' || !validTimestamp(entry.timestamp)) {
            fail('An edit has invalid revision, page, title, or time data.');
        }
        return [entry.revid, entry.pageid, entry.ns, entry.title,
            new Date(entry.timestamp).toISOString(), entry.isNew ? 1 : 0];
    }

    function compareEntries(left, right) {
        return right[4].localeCompare(left[4]) || right[0] - left[0];
    }

    function summarize(rawEntries, options) {
        options = options || {};
        var config = normalizeConfig(options.config || { timeZone: options.timeZone || options.timezone || DEFAULT_CONFIG.timeZone });
        var now = nowDate(options.now);
        var today = localDate(now, config.timeZone);
        var start = addDate(today, -29);
        var counts = Object.create(null);
        var entries = [];
        var seen = new Set();
        var excludedEdits = 0;
        var statisticsTitle = 'Usuário:' + config.user + '/PU/Estatísticas';
        (rawEntries || []).forEach(function (raw) {
            var entry = packEntry(raw);
            if (new Date(entry[4]).getTime() > now.getTime()) { fail('Contribution history contains a future edit.'); }
            if (!seen.has(entry[0])) {
                seen.add(entry[0]);
                // The pre-existing statistics updater must not maintain its own streak.
                if (entry[3] === statisticsTitle || entry[3] === 'User:' + config.user + '/PU/Estatísticas') {
                    excludedEdits += 1;
                    return;
                }
                entries.push(entry);
                var date = localDate(entry[4], config.timeZone);
                if (date > today) { fail('Contribution history contains a future local day.'); }
                counts[date] = (counts[date] || 0) + 1;
            }
        });
        entries.sort(compareEntries);
        var activeDates = Object.keys(counts).sort();
        var bestStreak = 0;
        var bestStart = null;
        var bestEnd = null;
        var run = 0;
        var runStart = null;
        var previousDate = null;
        activeDates.forEach(function (date) {
            if (previousDate !== null && addDate(previousDate, 1) === date) { run += 1; }
            else { run = 1; runStart = date; }
            // A tie uses the most recent completed run.
            if (run >= bestStreak) { bestStreak = run; bestStart = runStart; bestEnd = date; }
            previousDate = date;
        });
        var cursor = counts[today] ? today : addDate(today, -1);
        var streakEnd = counts[cursor] ? cursor : null;
        var currentStreak = 0;
        while (counts[cursor]) { currentStreak += 1; cursor = addDate(cursor, -1); }
        var articles = new Set();
        var edits30 = 0;
        var activeDays30 = 0;
        activeDates.forEach(function (date) {
            if (date >= start && date <= today) { activeDays30 += 1; edits30 += counts[date]; }
        });
        entries.forEach(function (entry) {
            var date = localDate(entry[4], config.timeZone);
            if (entry[2] === 0 && entry[1] > 0 && date >= start && date <= today) { articles.add(entry[1]); }
        });
        var weekday = new Date(today + 'T00:00:00.000Z').getUTCDay();
        var currentMonday = addDate(today, -((weekday + 6) % 7));
        var gridStart = addDate(currentMonday, -77);
        var weeks = [];
        for (var w = 0; w < 12; w += 1) {
            var weekStart = addDate(gridStart, w * 7);
            var days = [];
            for (var d = 0; d < 7; d += 1) {
                var day = addDate(weekStart, d);
                days.push({ date: day, count: counts[day] || 0, future: day > today, today: day === today });
            }
            weeks.push({ start: weekStart, days: days });
        }
        return {
            asOf: now.toISOString(), timeZone: config.timeZone, today: today,
            start: gridStart, end: addDate(currentMonday, 6),
            activityPeriod: { start: start, end: today, days: 30, basis: 'local', timeZone: config.timeZone },
            currentStreak: currentStreak, bestStreak: bestStreak,
            currentStreakStart: currentStreak ? addDate(cursor, 1) : null,
            currentStreakEnd: streakEnd,
            pendingToday: currentStreak > 0 && !counts[today],
            bestStreakStart: bestStart, bestStreakEnd: bestEnd,
            todayEdits: counts[today] || 0, activeDays30: activeDays30, edits30: edits30,
            articles30: articles.size, distinctArticles30: articles.size,
            totalEdits: entries.length, totalActiveDays: activeDates.length,
            historyEdits: seen.size, excludedEdits: excludedEdits,
            averageEditsPerDay30: edits30 / 30,
            counts: counts, weeks: weeks, gridStart: gridStart,
            gridEnd: addDate(currentMonday, 6),
            firstEditAt: entries.length ? entries[entries.length - 1][4] : null,
            lastEditAt: entries.length ? entries[0][4] : null
        };
    }

    function identity(config) { return { user: config.user, project: config.project }; }
    function sameIdentity(section, config) {
        return !!section && !!section.identity && section.identity.user === config.user && section.identity.project === config.project;
    }
    function sectionPrevious(previous, name, config) {
        var section = previous && previous[name] ? previous[name] : previous;
        return sameIdentity(section, config) && (name !== 'pageviews' || (section.rankLimit === config.rankLimit && section.metricVersion === METRIC_VERSION && section.totalModel === TOTAL_MODEL)) ? section : null;
    }

    function apiUrl(config, parameters) {
        var url = new URL('https://' + config.project + '/w/api.php');
        var params = Object.assign({ action: 'query', format: 'json', formatversion: 2, origin: '*', maxlag: 5 }, parameters);
        Object.keys(params).forEach(function (key) {
            if (params[key] !== undefined && params[key] !== null) { url.searchParams.set(key, String(params[key])); }
        });
        return url.toString();
    }

    function checkedResponse(response) {
        if (!response || typeof response !== 'object' || Array.isArray(response)) { fail('The service returned an invalid response.'); }
        if (response.error) { fail('The service reported an error.', response.error.code || 'api-error'); }
        if (response.warnings && Object.keys(response.warnings).length) { fail('The service returned a warning; the response is incomplete.', 'api-warning'); }
        return response;
    }

    function requireRequest(options) {
        if (!options || typeof options.requestJson !== 'function') { fail('requestJson(url) is required.'); }
        return options.requestJson;
    }

    async function collectActivity(options) {
        options = options || {};
        var requestJson = requireRequest(options);
        var config = normalizeConfig(options.config);
        var now = nowDate(options.now);
        var capturedAt = now.toISOString();
        var previous = sectionPrevious(options.previous, 'activity', config);
        var fullScan = !previous || !previous.complete || !validTimestamp(previous.fullScanAt) ||
            now.getTime() - new Date(previous.fullScanAt).getTime() >= config.fullRescanMs;
        if (previous && !fullScan && validTimestamp(previous.capturedAt) &&
            now.getTime() >= new Date(previous.capturedAt).getTime() &&
            now.getTime() - new Date(previous.capturedAt).getTime() < config.activityRefreshMs) {
            return Object.assign({}, previous, {
                summary: summarize(previous.entries, { config: config, now: now }), cacheHit: true,
                stale: false, error: null
            });
        }
        try {
            var baseEntries = previous ? previous.entries.map(packEntry).sort(compareEntries) : [];
            var lowerBound = !fullScan && baseEntries.length ?
                new Date(new Date(baseEntries[0][4]).getTime() - DAY).toISOString() : null;
            var parameters = {
                list: 'usercontribs', ucuser: config.user, uclimit: 500,
                ucprop: 'ids|title|timestamp|flags', ucdir: 'older', ucstart: capturedAt
            };
            if (lowerBound) { parameters.ucend = lowerBound; }
            var fetched = new Map();
            var continuation = {};
            var seenContinuations = new Set();
            var pagesFetched = 0;
            while (true) {
                var response = checkedResponse(await requestJson(apiUrl(config, Object.assign({}, parameters, continuation))));
                if (!response.query || !Array.isArray(response.query.usercontribs)) { fail('Contribution history is missing from the response.'); }
                var added = 0;
                response.query.usercontribs.forEach(function (raw) {
                    var entry = packEntry(raw);
                    var time = new Date(entry[4]).getTime();
                    if (time > now.getTime() || (lowerBound && time < new Date(lowerBound).getTime())) {
                        fail('Contribution history falls outside the requested time bounds.');
                    }
                    if (!fetched.has(entry[0])) { fetched.set(entry[0], entry); added += 1; }
                    else if (JSON.stringify(fetched.get(entry[0])) !== JSON.stringify(entry)) { fail('A revision was returned with conflicting data.'); }
                });
                pagesFetched += 1;
                if (!response.continue) {
                    if (!assertedFlag(response, 'batchcomplete')) { fail('Contribution history has no completion marker.', 'incomplete-history'); }
                    break;
                }
                if (!response.continue || typeof response.continue !== 'object' ||
                    typeof response.continue.uccontinue !== 'string' || !response.continue.uccontinue || !added) {
                    fail('Contribution pagination made no progress.', 'pagination-no-progress');
                }
                var token = response.continue.uccontinue;
                if (seenContinuations.has(token)) { fail('Contribution pagination repeated a continuation.', 'pagination-duplicate'); }
                seenContinuations.add(token);
                continuation = { uccontinue: token };
                if (own(response.continue, 'continue')) {
                    if (typeof response.continue.continue !== 'string') { fail('Invalid continuation data.'); }
                    continuation.continue = response.continue.continue;
                }
            }
            var merged = new Map();
            if (!fullScan && lowerBound) {
                baseEntries.forEach(function (entry) {
                    if (entry[4] < lowerBound) { merged.set(entry[0], entry); }
                });
            }
            fetched.forEach(function (entry, revid) { merged.set(revid, entry); });
            var entries = Array.from(merged.values()).sort(compareEntries);
            return {
                identity: identity(config), entries: entries, complete: true,
                capturedAt: capturedAt, lastAttemptAt: capturedAt,
                fullScanAt: fullScan ? capturedAt : previous.fullScanAt,
                scanMode: fullScan ? 'full' : 'incremental', pagesFetched: pagesFetched,
                summary: summarize(entries, { config: config, now: now }),
                cacheHit: false, stale: false, error: null
            };
        } catch (error) {
            if (previous && previous.complete) {
                return Object.assign({}, previous, {
                    summary: summarize(previous.entries, { config: config, now: now }),
                    lastAttemptAt: capturedAt, cacheHit: false, stale: true, error: errorInfo(error)
                });
            }
            return {
                identity: identity(config), entries: [], complete: false, capturedAt: null,
                lastAttemptAt: capturedAt, fullScanAt: null, scanMode: 'full', pagesFetched: 0,
                summary: null, cacheHit: false, stale: true, error: errorInfo(error)
            };
        }
    }

    function viewPeriod(now) {
        // A complete UTC day ends at midnight. Late/missing AQS data remains unavailable.
        var end = addDate(now.toISOString().slice(0, 10), -1);
        return { start: addDate(end, -29), end: end, days: 30, basis: 'UTC' };
    }

    function articleCandidates(entries) {
        var byPage = new Map();
        entries.map(packEntry).sort(compareEntries).forEach(function (entry) {
            if (entry[2] !== 0 || entry[1] <= 0) { return; }
            if (!byPage.has(entry[1])) {
                byPage.set(entry[1], { pageid: entry[1], title: entry[3], firstEditAt: entry[4], lastEditAt: entry[4], revid: entry[0], creationDate: null });
            }
            var known = byPage.get(entry[1]);
            if (entry[4] < known.firstEditAt) { known.firstEditAt = entry[4]; }
            if (entry[5] === 1) {
                var candidate = byPage.get(entry[1]);
                var date = entry[4].slice(0, 10);
                if (!candidate.creationDate || date < candidate.creationDate) { candidate.creationDate = date; }
            }
        });
        return Array.from(byPage.values()).sort(function (a, b) {
            return b.lastEditAt.localeCompare(a.lastEditAt) || b.revid - a.revid;
        });
    }

    function viewUrl(config, title, period) {
        var article = encodeURIComponent(title.replace(/ /g, '_'));
        var stamp = function (date) { return date.replace(/-/g, '') + '00'; };
        return 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/' +
            config.project + '/all-access/user/' + article + '/daily/' + stamp(period.start) + '/' + stamp(period.end);
    }

    function blankRow(article) {
        return {
            pageid: article.pageid, title: article.title, lastEditAt: article.lastEditAt,
            creationDate: article.creationDate || null,
            creationEvidence: article.creationEvidence || (article.creationDate ? { type: 'user-new-flag' } : null),
            views: null, status: 'unavailable', daily: []
        };
    }

    async function firstRevisionCreation(article, requestJson, config) {
        var response = checkedResponse(await requestJson(apiUrl(config, {
            prop: 'revisions', pageids: article.pageid, rvprop: 'ids|timestamp', rvdir: 'newer', rvlimit: 1
        })));
        // rvlimit=1 deliberately does not exhaust the revision list. Its continuation is expected.
        if (response.continue && (typeof response.continue !== 'object' ||
            typeof response.continue.rvcontinue !== 'string' || !response.continue.rvcontinue ||
            Object.keys(response.continue).some(function (key) { return key !== 'continue' && key !== 'rvcontinue'; }))) {
            fail('The first-revision response has invalid continuation data.');
        }
        if (!response.query || !Array.isArray(response.query.pages) || response.query.pages.length !== 1) {
            fail('The first-revision response has no single requested page.');
        }
        var page = response.query.pages[0];
        if (!page || page.pageid !== article.pageid || page.ns !== 0 || page.title !== article.title ||
            assertedFlag(page, 'missing') || assertedFlag(page, 'invalid') || assertedFlag(page, 'redirect') ||
            !Array.isArray(page.revisions) || page.revisions.length !== 1) {
            fail('The first-revision response has invalid page metadata.');
        }
        var revision = page.revisions[0];
        if (!revision || !Number.isSafeInteger(revision.revid) || revision.revid <= 0 ||
            revision.parentid !== 0 || !validTimestamp(revision.timestamp) ||
            new Date(revision.timestamp).getTime() > new Date(article.lastEditAt).getTime()) {
            fail('The first visible revision does not verify the page creation date.', 'creation-unverified');
        }
        var timestamp = new Date(revision.timestamp).toISOString();
        return {
            creationDate: timestamp.slice(0, 10),
            creationEvidence: { type: 'first-revision', revid: revision.revid, parentid: 0, timestamp: timestamp }
        };
    }

    function validatedViewRow(article, period, response, config) {
        checkedResponse(response);
        if (!Array.isArray(response.items)) { fail('Daily article views are missing.'); }
        var daily = new Map();
        response.items.forEach(function (item) {
            if (!item || typeof item.timestamp !== 'string' || !/^\d{8}00$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views < 0 || item.agent !== 'user' ||
                item.access !== 'all-access' || item.granularity !== 'daily' ||
                typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
                typeof item.article !== 'string' || item.article.replace(/ /g, '_') !== article.title.replace(/ /g, '_')) {
                fail('An article view item has invalid metadata or a view count.');
            }
            var date = item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6) + '-' + item.timestamp.slice(6, 8);
            if (!validDate(date) || date < period.start || date > period.end || daily.has(date)) {
                fail('Article views contain duplicate dates or dates outside the requested period.');
            }
            daily.set(date, item.views);
        });
        var rows = [];
        var views = 0;
        for (var offset = 0; offset < 30; offset += 1) {
            var date = addDate(period.start, offset);
            var count = daily.get(date);
            if (count === undefined) {
                if (article.creationDate && date < article.creationDate) { count = 0; }
                else { fail('Article views are missing at least one day.', 'missing-interval'); }
            }
            if (article.creationDate && date < article.creationDate && count !== 0) {
                fail('Article views precede the known page creation date.');
            }
            views += count;
            if (!Number.isSafeInteger(views)) { fail('The article view total is outside the safe integer range.'); }
            rows.push({ date: date, views: count });
        }
        return Object.assign(blankRow(article), { views: views, status: 'available', daily: rows });
    }

    function zeroBeforeCreation(article, period) {
        var daily = [];
        for (var offset = 0; offset < 30; offset += 1) { daily.push({ date: addDate(period.start, offset), views: 0 }); }
        return Object.assign(blankRow(article), { views: 0, status: 'verified-zero', daily: daily });
    }

    function sortedViewRows(rows) {
        return rows.slice().sort(function (a, b) {
            if (a.views === null && b.views !== null) { return 1; }
            if (a.views !== null && b.views === null) { return -1; }
            if (a.views !== null && b.views !== null && a.views !== b.views) { return b.views - a.views; }
            return b.lastEditAt.localeCompare(a.lastEditAt) || a.pageid - b.pageid;
        });
    }

    function normalizedTitle(title) { return title.replace(/ /g, '_'); }

    // Verified against the public refinery blacklist on 2026-10-13. No PT-specific
    // entries existed. '-' is excluded separately by the daily-top loader.
    var TOP_BOUND_EXCLUDED_TITLES = Object.freeze(['-']);
    var TOP_BOUND_SOURCE = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/hql/cassandra/daily/load_cassandra_pageview_top_articles_daily.hql';
    var TOP_BLACKLIST_URL = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';

    function universeFingerprint(candidates) {
        return candidates.slice().sort(function (a, b) { return a.pageid - b.pageid; }).map(function (article) { return article.pageid + '@' + article.firstEditAt; }).join(',');
    }

    function clone(value) { return JSON.parse(JSON.stringify(value)); }

    function compactRow(row) {
        return Object.assign({}, row, { daily: row.daily.map(function (item) { return typeof item === 'number' ? item : item.views; }) });
    }

    function expandedRow(row, period) {
        return Object.assign({}, row, { daily: row.daily.map(function (count, index) { return { date: addDate(period.start, index), views: count }; }) });
    }

    function topUrl(config, date) {
        return 'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/' + config.project +
            '/all-access/' + date.slice(0, 4) + '/' + date.slice(5, 7) + '/' + date.slice(8, 10);
    }

    function validatedTopDay(response, date, cohort, config) {
        checkedResponse(response);
        if (!Array.isArray(response.items) || response.items.length !== 1) { fail('The daily top feed has no single requested day.'); }
        var item = response.items[0];
        if (!item || typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
            item.access !== 'all-access' || (own(item, 'agent') && item.agent !== 'user') ||
            String(item.year) !== date.slice(0, 4) || String(item.month).padStart(2, '0') !== date.slice(5, 7) ||
            String(item.day).padStart(2, '0') !== date.slice(8, 10) || !Array.isArray(item.articles) || !item.articles.length || item.articles.length > 1000 || item.articles[0].rank !== 1) {
            fail('The daily top feed has incorrect project, date, access, or agent metadata.');
        }
        var titles = new Set();
        var counts = new Map();
        var previousViews = Infinity;
        var previousRank = 0;
        item.articles.forEach(function (article, index) {
            if (!article || typeof article.article !== 'string' || !article.article ||
                !Number.isSafeInteger(article.views) || article.views <= 0 ||
                !Number.isInteger(article.rank) || article.rank < 1 || article.rank > 1000 ||
                article.views > previousViews || article.rank < previousRank ||
                article.rank !== (article.views === previousViews ? previousRank : index + 1)) {
                fail('The daily top feed is not a valid descending ranking.');
            }
            var title = normalizedTitle(article.article);
            if (titles.has(title)) { fail('The daily top feed repeats an article.'); }
            titles.add(title);
            counts.set(title, article.views);
            previousViews = article.views;
            previousRank = article.rank;
        });
        // Official SQL excludes the entire tie group crossing rank 1000. Its
        // output can contain fewer than 1000 rows; absent ordinary titles still
        // cannot exceed the minimum returned value. The agent filter is 'user'.
        var known = {};
        cohort.forEach(function (article) {
            var views = counts.get(normalizedTitle(article.title));
            if (views !== undefined) { known[article.pageid] = views; }
        });
        return {
            date: date, status: 'available', cutoff: previousViews, known: known,
            coverage: { articleCount: item.articles.length, minRank: item.articles[0].rank,
                maxRank: previousRank, source: 'AQS-daily-top-user', agent: 'user', access: 'all-access',
                project: config.project, sourceDefinition: TOP_BOUND_SOURCE }, error: null
        };
    }

    var PERIOD_IDS = Object.freeze(['30d', '90d', '12m', 'since']);
    var METRIC_VERSION = 'after-first-edit-v1';
    var TOTAL_MODEL = 'all-periods-all-eligible-v1';
    function grandForModel(model, id) { return model === TOTAL_MODEL || (model === 'since-all-eligible-v1' && id === 'since'); }
    var COVERAGE_FLOOR = '2015-07-01';

    function addMonthsClamped(date, amount) {
        if (!validDate(date) || !Number.isInteger(amount)) { fail('Invalid month offset.'); }
        var original = new Date(date + 'T00:00:00Z');
        var target = new Date(Date.UTC(original.getUTCFullYear(), original.getUTCMonth() + amount, 1));
        var lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
        target.setUTCDate(Math.min(original.getUTCDate(), lastDay));
        return target.toISOString().slice(0, 10);
    }

    function periodsFor(value) {
        var today = nowDate(value).toISOString().slice(0, 10);
        var end = addDate(today, -1);
        var annualStart = addMonthsClamped(today, -12);
        return {
            '30d': { start: addDate(end, -29), end: end, days: 30, basis: 'UTC' },
            '90d': { start: addDate(end, -89), end: end, days: 90, basis: 'UTC' },
            '12m': { start: annualStart, end: end, days: Math.round((Date.parse(end) - Date.parse(annualStart)) / DAY) + 1, basis: 'UTC' },
            'since': { start: COVERAGE_FLOOR, end: end, days: Math.round((Date.parse(end) - Date.parse(COVERAGE_FLOOR)) / DAY) + 1, basis: 'UTC' }
        };
    }

    function countStart(article) {
        if (!validTimestamp(article.firstEditAt)) { fail('The first public edit timestamp is missing.'); }
        var next = addDate(article.firstEditAt.slice(0, 10), 1);
        return next < COVERAGE_FLOOR ? COVERAGE_FLOOR : next;
    }

    function effectivePeriod(article, period) {
        var start = countStart(article);
        if (period.start > start) { start = period.start; }
        return { start: start, end: period.end, days: Math.max(0, Math.round((Date.parse(period.end) - Date.parse(start)) / DAY) + 1), basis: 'UTC' };
    }

    function sourceForArticles(periods, articles) {
        var start = periods['12m'].start;
        articles.forEach(function (article) { var first = countStart(article); if (first < start) { start = first; } });
        return { start: start, end: periods['12m'].end, days: Math.round((Date.parse(periods['12m'].end) - Date.parse(start)) / DAY) + 1, basis: 'UTC' };
    }

    function sourceOf(periods) { return periods.sourcePeriod || periods['12m']; }

    var ZERO_DOCUMENTATION = 'https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/troubleshooting.html';
    function expectedControlTitles(source) { return source.start < '2022-11-30' ? ['China', 'Portugal'] : ['China', 'ChatGPT']; }

    function validAvailabilityProof(proof, source, config, captureAt) {
        if (!proof || proof.complete !== true || proof.kind !== 'aqs-documented-omitted-zero' ||
            proof.documentation !== ZERO_DOCUMENTATION || proof.project !== config.project ||
            JSON.stringify(proof.sourcePeriod) !== JSON.stringify(source) || !validTimestamp(proof.capturedAt) ||
            proof.capturedAt.slice(0, 10) <= source.end || Date.parse(proof.capturedAt) > Date.parse(captureAt) ||
            !Array.isArray(proof.controls) || proof.controls.length !== 2) { return false; }
        var titles = new Set();
        return proof.controls.every(function (control) {
            if (!control || expectedControlTitles(source).indexOf(control.title) < 0 || titles.has(control.title) ||
                control.requestUrl !== viewUrl(config, control.title, source) || control.project !== config.project ||
                control.agent !== 'user' || control.access !== 'all-access' || control.granularity !== 'daily' ||
                !validTimestamp(control.capturedAt) || control.capturedAt.slice(0, 10) <= source.end || Date.parse(control.capturedAt) > Date.parse(proof.capturedAt) ||
                !Array.isArray(control.daily) || control.daily.length !== source.days) { return false; }
            titles.add(control.title);
            return control.daily.every(function (day, index) {
                return day && day.date === addDate(source.start, index) && Number.isSafeInteger(day.views) && day.views >= 0;
            });
        }) && titles.size === 2;
    }

    function availabilityControl(title, periods, response, config, capturedAt) {
        var article = { pageid: 1, title: title, firstEditAt: '2015-06-30T00:00:00.000Z', lastEditAt: capturedAt };
        var series = validatedSeries(article, periods, response, config, capturedAt);
        if (series.missing.length || series.reportedDays !== sourceOf(periods).days) { fail('The availability control lacks explicit dates.', 'availability-unverified'); }
        var counts = new Map(response.items.map(function (item) {
            return [item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6) + '-' + item.timestamp.slice(6, 8), item.views];
        }));
        return { title: title, requestUrl: viewUrl(config, title, sourceOf(periods)), capturedAt: capturedAt,
            project: config.project, agent: 'user', access: 'all-access', granularity: 'daily',
            daily: Array.from({ length: sourceOf(periods).days }, function (_, index) {
                var date = addDate(sourceOf(periods).start, index); return { date: date, views: counts.get(date) };
            }) };
    }

    function normalizedProblemPath(value) {
        if (typeof value !== 'string') { return null; }
        var path = value;
        if (/^https:\/\//.test(path)) {
            try {
                var parsed = new URL(path);
                if (parsed.search || parsed.hash || ['wikimedia.org', 'analytics.wikimedia.org'].indexOf(parsed.hostname) < 0) { return null; }
                path = parsed.pathname;
                if (parsed.hostname === 'analytics.wikimedia.org' && path.indexOf('/v1/pageviews/') === 0) { path = '/analytics.wikimedia.org' + path; }
            } catch (_) { return null; }
        }
        var match = path.match(/^\/(?:api\/rest_v1\/metrics|metrics|analytics\.wikimedia\.org\/v1)\/pageviews\/per-article\/(.+)$/);
        if (!match) { return null; }
        try { return decodeURIComponent(match[1]); } catch (_) { return null; }
    }

    function documentedEmptyError(error, url) {
        var problem = error && error.problem;
        var knownType = !!problem && (['https://mediawiki.org/wiki/HyperSwitch/errors/not_found', 'https://restbase.org/errors/not_found'].indexOf(problem.type) >= 0 ||
            (problem.type === 'about:blank' && problem.status === 404 && problem.title === 'Not Found'));
        return !!error && (own(error, 'status') ? error.status === 404 : error.code === 404) && error.requestUrl === url &&
            knownType &&
            problem.method === 'get' && normalizedProblemPath(problem.uri) !== null && normalizedProblemPath(problem.uri) === normalizedProblemPath(url);
    }

    function refreshSeriesStats(series, periods, article) {
        var source = sourceOf(periods);
        series.firstEditAt = article.firstEditAt;
        series.countStartDate = countStart(article);
        series.creationDate = article.creationDate || null;
        series.creationEvidence = article.creationEvidence || (article.creationDate ? { type: 'user-new-flag' } : null);
        if (article.creationDate && series.firstNonZeroDate && series.firstNonZeroDate < article.creationDate) { series.titleHistoryBeforePageCreation = true; }
        else { delete series.titleHistoryBeforePageCreation; }
        series.missing = series.missing.filter(function (index) { return addDate(source.start, index) >= series.countStartDate; });
        PERIOD_IDS.forEach(function (id) {
            var period = effectivePeriod(article, periods[id]);
            var missing = series.missing.filter(function (index) { var date = addDate(source.start, index); return date >= period.start && date <= period.end; }).length;
            series.covered[id] = period.days - missing;
            series.totals[id] = missing ? null : series.partialSums[id];
        });
        series.status = series.missing.length ? (series.validated ? 'partial' : 'unavailable') : 'available';
        return series;
    }

    function emptySeries(article, periods, capturedAt, error) {
        var source = sourceOf(periods);
        return refreshSeriesStats({ pageid: article.pageid, title: article.title,
            lastEditAt: article.lastEditAt, sourcePeriod: source, capturedAt: capturedAt,
            totals: {}, partialSums: { '30d': 0, '90d': 0, '12m': 0, 'since': 0 }, covered: {},
            missing: Array.from({ length: source.days }, function (_, index) { return index; }),
            firstNonZeroDate: null, validated: false, creationChecked: !!article.creationDate,
            error: error || null }, periods, article);
    }

    function validatedSeries(article, periods, response, config, capturedAt, availabilityProof) {
        checkedResponse(response);
        if (!Array.isArray(response.items)) { fail('The annual daily series is missing.'); }
        var source = sourceOf(periods);
        var daily = new Map();
        var firstNonZeroDate = null;
        response.items.forEach(function (item) {
            if (!item || typeof item.timestamp !== 'string' || !/^\d{8}00$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views < 0 || item.agent !== 'user' || item.access !== 'all-access' ||
                item.granularity !== 'daily' || typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
                typeof item.article !== 'string' || normalizedTitle(item.article) !== normalizedTitle(article.title)) {
                fail('An annual view item has invalid metadata or views.');
            }
            var date = item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6) + '-' + item.timestamp.slice(6, 8);
            if (!validDate(date) || date < source.start || date > source.end || daily.has(date)) { fail('The annual series contains duplicate or out-of-range dates.'); }
            if (item.views && (!firstNonZeroDate || date < firstNonZeroDate)) { firstNonZeroDate = date; }
            daily.set(date, item.views);
        });
        var series = emptySeries(article, periods, capturedAt);
        series.validated = true;
        series.reportedDays = daily.size;
        var documentedZeros = validAvailabilityProof(availabilityProof, source, config, capturedAt);
        series.missing = [];
        series.firstNonZeroDate = firstNonZeroDate;
        for (var index = 0; index < source.days; index += 1) {
            var date = addDate(source.start, index);
            if (!daily.has(date)) {
                if (documentedZeros) { series.zeroBasis = 'aqs-documented-omitted-zero'; series.availabilityProofAt = availabilityProof.capturedAt; }
                else { series.missing.push(index); }
                continue;
            }
            var views = daily.get(date);
            PERIOD_IDS.forEach(function (id) {
                if (date >= effectivePeriod(article, periods[id]).start && date <= periods[id].end) {
                    series.partialSums[id] += views;
                    if (!Number.isSafeInteger(series.partialSums[id])) { fail('A view total exceeds the safe integer range.'); }
                }
            });
        }
        return refreshSeriesStats(series, periods, article);
    }

    function periodBounds(state, id) {
        var period = state.periods[id].period;
        var excluded = new Set(state.boundExcludedTitles);
        return state.metadata.cohort.map(function (article) {
            var series = state.series[article.pageid];
            var aggregate = state.aggregateTotals[article.pageid] && state.aggregateTotals[article.pageid][id];
            if (aggregate) { return { article: article, exact: aggregate.total, lower: aggregate.total, upper: aggregate.total, missingDates: [] }; }
            if (!series) { return { article: article, exact: null, lower: 0, upper: null, missingDates: [] }; }
            if (series.totals[id] !== null) {
                return { article: article, exact: series.totals[id], lower: series.totals[id], upper: series.totals[id], missingDates: [] };
            }
            var lower = series.partialSums[id];
            var upper = lower;
            var bounded = true;
            var dates = [];
            series.missing.forEach(function (index) {
                var date = addDate(series.sourcePeriod.start, index);
                if (date < countStart(article) || date < period.start || date > period.end) { return; }
                dates.push(date);
                var day = state.topDays[date];
                if (excluded.has(normalizedTitle(article.title)) || !state.blacklist.complete || !day || day.status !== 'available') { bounded = false; return; }
                if (own(day.known, article.pageid)) { lower += day.known[article.pageid]; upper += day.known[article.pageid]; }
                else { upper += day.cutoff; }
            });
            if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper)) { fail('A period bound exceeds the safe integer range.'); }
            return { article: article, exact: null, lower: lower, upper: bounded ? upper : null, missingDates: dates };
        });
    }

    function rowForPeriod(article, series, id, state) {
        var aggregate = state.aggregateTotals[article.pageid] && state.aggregateTotals[article.pageid][id];
        return { pageid: article.pageid, title: article.title, lastEditAt: article.lastEditAt,
            firstEditAt: article.firstEditAt, countFromDate: effectivePeriod(article, state.periods[id].period).start,
            coverageTruncated: id === 'since' && addDate(article.firstEditAt.slice(0, 10), 1) < COVERAGE_FLOOR,
            creationDate: series.creationDate, creationEvidence: series.creationEvidence,
            views: aggregate ? aggregate.total : series.totals[id], status: 'available', sourcePeriod: aggregate ? aggregate.period : series.sourcePeriod,
            sourceGranularity: aggregate ? 'monthly' : 'daily',
            coveredDays: aggregate ? effectivePeriod(article, state.periods[id].period).days : series.covered[id], dailyCoveredDays: series.covered[id], capturedAt: aggregate ? aggregate.capturedAt : series.capturedAt };
    }

    function monthSlices(period) {
        var slices = [];
        var month = period.start.slice(0, 7) + '-01';
        while (month <= period.end) {
            var next = addMonthsClamped(month, 1);
            slices.push({ month: month.slice(0, 7), start: month < period.start ? period.start : month,
                end: addDate(next, -1) > period.end ? period.end : addDate(next, -1) });
            month = next;
        }
        return slices;
    }

    function monthlyUrl(config, article, period) {
        return viewUrl(config, article.title, period).replace('/daily/', '/monthly/');
    }

    function validatedAggregate(article, period, response, config, capturedAt, earlierTitleHistory) {
        checkedResponse(response);
        if (!Array.isArray(response.items)) { fail('The monthly range aggregate is missing.'); }
        var slices = monthSlices(period);
        var expected = new Set(slices.map(function (slice) { return slice.month; }));
        var counts = new Map();
        response.items.forEach(function (item) {
            if (!item || typeof item.timestamp !== 'string' || !/^\d{6}0100$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views < 0 || item.agent !== 'user' || item.access !== 'all-access' ||
                item.granularity !== 'monthly' || typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
                typeof item.article !== 'string' || normalizedTitle(item.article) !== normalizedTitle(article.title)) {
                fail('A monthly range item has invalid metadata or views.');
            }
            var month = item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6);
            if (!validDate(month + '-01') || !expected.has(month) || counts.has(month)) { fail('The monthly range contains duplicate or out-of-range months.'); }
            counts.set(month, item.views);
        });
        var titleHistoryBeforePageCreation = !!earlierTitleHistory || !!(article.creationDate && slices.some(function (slice) {
            return slice.end < article.creationDate && (counts.get(slice.month) || 0) > 0;
        }));
        var total = 0;
        var buckets = slices.map(function (slice) {
            var views = counts.get(slice.month);
            var beforeCreation = false;
            var inferredZero = views === undefined && beforeCreation && !titleHistoryBeforePageCreation;
            if (views === undefined) {
                if (inferredZero) { views = 0; }
                else { fail('At least one queried month has no published aggregate.', 'missing-monthly-interval'); }
            }
            total += views;
            if (!Number.isSafeInteger(total)) { fail('The monthly range total exceeds the safe integer range.'); }
            return Object.assign({}, slice, { views: views, verifiedBeforeCreation: !!inferredZero });
        });
        return { pageid: article.pageid, title: article.title, period: period, granularity: 'monthly',
            total: total, buckets: buckets, capturedAt: capturedAt,
            firstEditAt: article.firstEditAt, creationDate: article.creationDate || null, creationEvidence: article.creationEvidence || null,
            titleHistoryBeforePageCreation: titleHistoryBeforePageCreation };
    }

    function snapshotV3(state) {
        return { identity: state.identity, scope: state.scope, rankLimit: state.rankLimit,
            capturedAt: state.capturedAt, historyCapturedAt: state.historyCapturedAt, metricVersion: METRIC_VERSION, totalModel: state.totalModel,
            periods: clone(state.periods), allPeriodsComplete: state.allPeriodsComplete };
    }

    function refreshV3(state, projectionModel) {
        var model = projectionModel === undefined ? state.totalModel : projectionModel;
        var legacyTopTotals = model == null;
        var eligible = state.metadata.cohort.length;
        PERIOD_IDS.forEach(function (id) {
            var result = state.periods[id];
            var bounds = periodBounds(state, id);
            var exact = bounds.filter(function (bound) { return bound.exact !== null; }).map(function (bound) { return rowForPeriod(bound.article, state.series[bound.article.pageid], id, state); });
            exact = sortedViewRows(exact);
            var rows = exact.slice(0, Math.min(state.rankLimit, eligible));
            var unknown = bounds.filter(function (bound) { return bound.exact === null; });
            var unbounded = unknown.filter(function (bound) { return bound.upper === null; }).length;
            var maximum = unbounded ? null : unknown.reduce(function (value, bound) { return Math.max(value, bound.upper); }, -1);
            var needed = Math.min(state.rankLimit, eligible);
            var cutoff = needed && rows.length === needed ? rows[needed - 1].views : null;
            var complete = state.metadata.complete && (eligible === 0 ||
                (rows.length === needed && !unbounded && (!unknown.length || cutoff > maximum)));
            var grand = grandForModel(model, id);
            var allExact = state.metadata.complete && unknown.length === 0;
            var rankedTotal = complete ? rows.reduce(function (sum, row) { return sum + row.views; }, 0) : null;
            result.rows = rows;
            result.rankingComplete = complete;
            result.complete = grand ? allExact : complete;
            result.allArticleTotal = grand && allExact ? exact.reduce(function (sum, row) { return sum + row.views; }, 0) : null;
            result.totalScope = grand ? 'all-eligible-articles' : 'ranked-top-' + state.rankLimit;
            result.total = grand ? result.allArticleTotal : rankedTotal;
            if (!legacyTopTotals) { result.rankedTotal = rankedTotal; }
            if ([result.total, result.allArticleTotal, rankedTotal].some(function (value) { return value !== null && !Number.isSafeInteger(value); })) { fail('The article view total exceeds the safe integer range.'); }
            result.proof = { kind: unknown.length ? 'daily-top-upper-bounds' : 'exhaustive-published-period-totals', strict: true,
                metadataComplete: state.metadata.complete, eligible: eligible, exactArticles: exact.length,
                truncatedArticles: id === 'since' ? state.metadata.cohort.filter(function (article) { return addDate(article.firstEditAt.slice(0, 10), 1) < COVERAGE_FLOOR; }).length : 0,
                uncertainArticles: unknown.length, unboundedRemaining: unbounded,
                cutoff: cutoff, remainingMaxUpper: maximum, complete: legacyTopTotals ? complete : result.complete };
            if (!legacyTopTotals) { result.proof.rankingComplete = complete; result.proof.totalComplete = result.complete; }
        });
        state.allPeriodsComplete = PERIOD_IDS.every(function (id) { return state.periods[id].complete; });
        var active = state.periods[state.activePeriod];
        state.period = active.period; state.rows = active.rows; state.total = active.total;
        state.totalScope = active.totalScope; state.allArticleTotal = active.allArticleTotal;
        if (!legacyTopTotals) { state.rankedTotal = active.rankedTotal; }
        state.rankingComplete = active.rankingComplete; state.complete = state.allPeriodsComplete;
        state.proof = active.proof;
        state.workPeriod = active.complete ? (PERIOD_IDS.find(function (id) { return !state.periods[id].complete; }) || state.activePeriod) : state.activePeriod;
        var workResult = state.periods[state.workPeriod];
        var allArticlesNeeded = grandForModel(model, state.workPeriod);
        var neededDates = new Set();
        var missingSeries = 0;
        var unavailable = 0;
        var creationNeeded = 0;
        state.metadata.cohort.forEach(function (article) {
            var series = state.series[article.pageid];
            if (!series) { missingSeries += 1; }
            else if (!series.validated && series.status !== 'available') { unavailable += 1; }
            
        });
        var activeBounds = periodBounds(state, state.workPeriod);
        var aggregateNeeded = 0;
        activeBounds.forEach(function (bound) {
            if (bound.exact !== null) { return; }
            if (!allArticlesNeeded && workResult.proof.cutoff !== null && bound.upper !== null && bound.upper < workResult.proof.cutoff) { return; }
            if (!state.aggregateFailures[bound.article.pageid + ':' + state.workPeriod]) { aggregateNeeded += 1; }
            if (state.boundExcludedTitles.indexOf(normalizedTitle(bound.article.title)) >= 0) { return; }
            bound.missingDates.forEach(function (date) { if (!state.topDays[date]) { neededDates.add(date); } });
        });
        var metadataRemaining = state.candidates.length - state.metadata.cursor;
        state.progress = Object.assign({}, state.progress, {
            candidates: state.candidates.length, resolved: state.metadata.cursor, eligible: eligible,
            collectedArticles: Object.keys(state.series).length, unavailable: unavailable,
            metadataRemaining: metadataRemaining, seriesRemaining: missingSeries, creationRemaining: creationNeeded,
            feedRemaining: neededDates.size, feedDays: Object.keys(state.topDays).filter(function (date) { return state.topDays[date].status === 'available'; }).length,
            aggregateRemaining: aggregateNeeded,
            pending: state.allPeriodsComplete ? 0 : metadataRemaining + missingSeries + unavailable + creationNeeded + neededDates.size + aggregateNeeded,
            workPeriod: state.workPeriod, resumable: !state.allPeriodsComplete && !state.error
        });
        state.stale = !state.allPeriodsComplete;
        state.phase = state.allPeriodsComplete ? 'complete' : (metadataRemaining ? 'metadata' : (missingSeries || creationNeeded ? 'annual-series' : 'bounds'));
        if (state.allPeriodsComplete) { state.error = null; }
        return Array.from(neededDates).sort();
    }

    function newStateV3(config, now, activity, candidates, previous) {
        var definitions = periodsFor(now);
        var periods = {};
        PERIOD_IDS.forEach(function (id) { periods[id] = { period: definitions[id], rows: [], rankingComplete: false, complete: false, total: null, totalScope: 'ranked-top-1000', allArticleTotal: null, proof: null }; });
        var reusable = previous && previous.periods['12m'].period.start === definitions['12m'].start && previous.periods['12m'].period.end === definitions['12m'].end ? clone(previous.series) : {};
        return { identity: identity(config), scope: 'all-distinct-edited-existing-mainspace-nonredirect-articles', metricVersion: METRIC_VERSION, totalModel: TOTAL_MODEL, rankLimit: 1000,
            sourcePeriod: sourceForArticles(definitions, candidates),
            activePeriod: '30d', periods: periods, startedAt: now.toISOString(), capturedAt: now.toISOString(), lastAttemptAt: now.toISOString(),
            historyCapturedAt: activity.capturedAt, candidates: candidates, universeFingerprint: universeFingerprint(candidates),
            metadata: { cursor: 0, complete: candidates.length === 0, cohort: [], excluded: [] }, series: {}, reusableSeries: reusable,
            availabilityProof: previous && validAvailabilityProof(previous.availabilityProof, sourceForArticles(definitions, candidates), config, now.toISOString()) ? clone(previous.availabilityProof) : null,
            availabilityAttemptAt: null,
            aggregateTotals: {}, aggregateFailures: {},
            reusableAggregates: previous && previous.periods['12m'].period.start === definitions['12m'].start && previous.periods['12m'].period.end === definitions['12m'].end ? clone(previous.aggregateTotals || {}) : {},
            topDays: {}, boundExcludedTitles: Array.from(new Set(TOP_BOUND_EXCLUDED_TITLES.concat(previous && previous.boundExcludedTitles || []))),
            blacklist: { complete: false, source: TOP_BLACKLIST_URL, snapshotAt: null, excludedTitles: [] },
            progress: { requests: 0, totalRequests: 0 }, error: null, stale: true, phase: 'metadata', cacheHit: false,
            lastCompleteSnapshot: previous && previous.allPeriodsComplete ? snapshotV3(previous) : (previous && previous.lastCompleteSnapshot) || null };
    }

    async function collectPageviews(options) {
        options = options || {};
        var requestJson = requireRequest(options);
        var config = normalizeConfig(options.config);
        var now = nowDate(options.now);
        var previous = sectionPrevious(options.previous, 'pageviews', config);
        var activity = options.activity || (options.previous && options.previous.activity);
        var activePeriod = options.activePeriod || (previous && previous.activePeriod) || '30d';
        if (PERIOD_IDS.indexOf(activePeriod) < 0) { fail('Unknown view period.'); }
        if (!activity || !activity.complete) {
            var unavailable = previous ? clone(previous) : newStateV3(config, now, { capturedAt: null }, [], null);
            unavailable.activePeriod = activePeriod; unavailable.metadata.complete = false;
            unavailable.error = { code: 'activity-unavailable', message: 'Complete contribution history is unavailable.' };
            refreshV3(unavailable); return unavailable;
        }
        var candidates = articleCandidates(activity.entries);
        var definitions = periodsFor(now);
        var fingerprint = universeFingerprint(candidates);
        // An unfinished snapshot also belongs to its original history and UTC
        // windows. Rebuild metadata when either changes, retaining reusable
        // series through newStateV3 instead of producing an invalid checkpoint.
        var unchangedCandidates = previous && JSON.stringify(previous.candidates) === JSON.stringify(candidates);
        var previousCandidates = new Map(previous ? previous.candidates.map(function (article) { return [article.pageid, article]; }) : []);
        var sameArticleIdentity = previous && candidates.every(function (article) {
            var old = previousCandidates.get(article.pageid);
            return old && old.title === article.title && old.creationDate === article.creationDate;
        });
        var resume = previous && previous.periods['12m'].period.start === definitions['12m'].start &&
            previous.periods['12m'].period.end === definitions['12m'].end && previous.universeFingerprint === fingerprint &&
            (unchangedCandidates || previous.metadata.complete && sameArticleIdentity);
        var state = resume && !options.restartPageviews ? clone(previous) : newStateV3(config, now, activity, candidates, previous);
        if (resume && !options.restartPageviews && !unchangedCandidates) {
            // A later edit does not change the first-edit cutoff or pageviews.
            // Metadata is complete, so changing candidate order cannot skip a
            // partially classified batch. Keep the already collected scores.
            var currentCandidates = new Map(candidates.map(function (article) { return [article.pageid, article]; }));
            state.candidates = candidates;
            state.historyCapturedAt = activity.capturedAt;
            state.metadata.cohort.forEach(function (article) {
                var currentArticle = currentCandidates.get(article.pageid);
                article.lastEditAt = currentArticle.lastEditAt; article.revid = currentArticle.revid;
                if (state.series[article.pageid]) { state.series[article.pageid].lastEditAt = currentArticle.lastEditAt; }
            });
        }
        if (options.restartPageviews) { state.reusableSeries = {}; state.reusableAggregates = {}; }
        var oldCaptureAt = state.capturedAt;
        state.capturedAt = now.toISOString(); state.lastAttemptAt = now.toISOString(); state.activePeriod = activePeriod;
        state.error = null; state.cacheHit = !!resume; state.progress.requests = 0;
        var maxRequests = options.maxRequests === undefined ? 40 : options.maxRequests;
        if (maxRequests !== Infinity && (!Number.isInteger(maxRequests) || maxRequests < 1)) { fail('Invalid request budget.'); }
        var checkpointEvery = options.checkpointEvery === undefined ? 8 : options.checkpointEvery;
        if (!Number.isInteger(checkpointEvery) || checkpointEvery < 1) { fail('Invalid checkpoint interval.'); }
        var requests = 0; var completedRequests = 0;
        async function request(url) {
            if (options.signal && options.signal.aborted) { fail('Collection was paused.', 'aborted'); }
            if (requests >= maxRequests) { fail('The request budget is exhausted.', 'request-budget'); }
            requests += 1; state.progress.requests = requests; state.progress.totalRequests += 1;
            try { return await requestJson(url); } finally { completedRequests += 1; }
        }
        async function checkpoint(force) {
            if (force || completedRequests >= checkpointEvery) {
                refreshV3(state);
                completedRequests = 0;
                if (options.onProgress) { await options.onProgress(clone(state)); }
            }
        }
        try {
            refreshV3(state);
            if (state.allPeriodsComplete) { state.capturedAt = oldCaptureAt; await checkpoint(true); return state; }
            while (!state.metadata.complete && requests < maxRequests) {
                var batch = state.candidates.slice(state.metadata.cursor, state.metadata.cursor + 50);
                var response = checkedResponse(await request(apiUrl(config, { prop: 'info', pageids: batch.map(function (article) { return article.pageid; }).join('|') })));
                if (response.continue || !assertedFlag(response, 'batchcomplete') || !response.query || !Array.isArray(response.query.pages)) { fail('Current article metadata is incomplete.'); }
                var pages = new Map(); var requested = new Set(batch.map(function (article) { return article.pageid; }));
                response.query.pages.forEach(function (page) {
                    if (!page || !Number.isSafeInteger(page.pageid) || !requested.has(page.pageid) || pages.has(page.pageid)) { fail('Current metadata has invalid or duplicate page IDs.'); }
                    pages.set(page.pageid, page);
                });
                var additions = []; var exclusions = [];
                var knownTitles = new Set(state.metadata.cohort.map(function (article) { return normalizedTitle(article.title); }));
                batch.forEach(function (article) {
                    var page = pages.get(article.pageid);
                    if (!page) { fail('Current metadata omitted a requested page.'); }
                    if (assertedFlag(page, 'missing') || assertedFlag(page, 'invalid') || assertedFlag(page, 'redirect') || page.ns !== 0) {
                        exclusions.push({ pageid: article.pageid, reason: assertedFlag(page, 'redirect') ? 'redirect' : (page.ns !== 0 ? 'namespace' : 'missing') });
                    } else {
                        if (typeof page.title !== 'string' || !page.title || knownTitles.has(normalizedTitle(page.title))) { fail('Current metadata has missing or duplicate titles.'); }
                        knownTitles.add(normalizedTitle(page.title)); additions.push(Object.assign({}, article, { title: page.title }));
                    }
                });
                state.metadata.cohort = state.metadata.cohort.concat(additions); state.metadata.excluded = state.metadata.excluded.concat(exclusions);
                state.metadata.cursor += batch.length; state.metadata.complete = state.metadata.cursor === state.candidates.length;
                await checkpoint(false);
            }
            if (!state.metadata.complete) { await checkpoint(true); return state; }
            var periodDefinitions = {}; PERIOD_IDS.forEach(function (id) { periodDefinitions[id] = state.periods[id].period; });
            state.sourcePeriod = sourceForArticles(periodDefinitions, state.metadata.cohort);
            periodDefinitions.sourcePeriod = state.sourcePeriod;
            if (!validAvailabilityProof(state.availabilityProof, sourceOf(periodDefinitions), config, now.toISOString()) &&
                (!state.availabilityAttemptAt || options.retryUnavailableSeries)) {
                var controls = [];
                var controlTitles = expectedControlTitles(sourceOf(periodDefinitions));
                for (var controlIndex = 0; controlIndex < controlTitles.length; controlIndex += 1) {
                    try {
                        var controlTitle = controlTitles[controlIndex];
                        controls.push(availabilityControl(controlTitle, periodDefinitions,
                            await request(viewUrl(config, controlTitle, sourceOf(periodDefinitions))), config, now.toISOString()));
                    } catch (controlError) {
                        if (controlError.code === 'request-budget' || controlError.code === 'aborted') { throw controlError; }
                    }
                }
                state.availabilityAttemptAt = now.toISOString();
                if (controls.length === 2) {
                    state.availabilityProof = { complete: true, kind: 'aqs-documented-omitted-zero', documentation: ZERO_DOCUMENTATION,
                        project: config.project, sourcePeriod: sourceOf(periodDefinitions), capturedAt: now.toISOString(), controls: controls };
                }
                await checkpoint(false);
            }
            var zerosVerified = validAvailabilityProof(state.availabilityProof, sourceOf(periodDefinitions), config, now.toISOString());
            state.metadata.cohort.forEach(function (article) {
                var reusable = state.reusableSeries[article.pageid];
                if (reusable && reusable.title === article.title && reusable.firstEditAt === article.firstEditAt && JSON.stringify(reusable.sourcePeriod) === JSON.stringify(state.sourcePeriod)) { state.series[article.pageid] = Object.assign({}, reusable, { lastEditAt: article.lastEditAt }); }
                var aggregates = state.reusableAggregates[article.pageid];
                if (aggregates && Object.keys(aggregates).every(function (id) { return aggregates[id].title === article.title; })) { state.aggregateTotals[article.pageid] = aggregates; }
            });
            state.reusableSeries = {}; state.reusableAggregates = {};
            var attempted = new Set();
            while (requests < maxRequests) {
                var queue = state.metadata.cohort.filter(function (article) {
                    var series = state.series[article.pageid];
                    return !attempted.has(article.pageid) && (!series || (options.retryUnavailableSeries && !series.validated) ||
                        (zerosVerified && series.validated && series.missing.length));
                });
                if (!queue.length) { break; }
                queue.sort(function (a, b) { return (state.series[a.pageid] ? 1 : 0) - (state.series[b.pageid] ? 1 : 0); });
                var work = queue.slice(0, Math.min(2, maxRequests - requests));
                work.forEach(function (article) { attempted.add(article.pageid); });
                await Promise.all(work.map(async function (article) {
                    var series = state.series[article.pageid];
                    try {
                        if (!series || (options.retryUnavailableSeries && !series.validated) || (zerosVerified && series.validated && series.missing.length)) {
                            series = validatedSeries(article, periodDefinitions, await request(viewUrl(config, article.title, sourceOf(periodDefinitions))), config, now.toISOString(), state.availabilityProof);
                        }
                        state.series[article.pageid] = series;
                    } catch (error) {
                        if (error.code !== 'request-budget' && error.code !== 'aborted') {
                            series = emptySeries(article, periodDefinitions, now.toISOString(), errorInfo(error));
                            var articleUrl = viewUrl(config, article.title, sourceOf(periodDefinitions));
                            if (zerosVerified && documentedEmptyError(error, articleUrl)) {
                                series.validated = true; series.missing = []; series.reportedDays = 0;
                                series.zeroBasis = 'aqs-documented-empty-series'; series.availabilityProofAt = state.availabilityProof.capturedAt;
                                series.zeroEvidence = { requestUrl: articleUrl, status: 404, problem: clone(error.problem) };
                                series.error = null; refreshSeriesStats(series, periodDefinitions, article);
                            }
                            state.series[article.pageid] = series;
                        }
                    }
                }));
                await checkpoint(false);
            }
            var neededDates = refreshV3(state);
            if (state.allPeriodsComplete) { state.lastCompleteSnapshot = snapshotV3(state); await checkpoint(true); return state; }
            if (state.progress.seriesRemaining || state.progress.creationRemaining || requests >= maxRequests) { await checkpoint(true); return state; }
            if (neededDates.length && !state.blacklist.complete && !state.blacklist.error && requests < maxRequests) {
                try {
                    var blacklist = checkedResponse(await request(TOP_BLACKLIST_URL));
                    if (blacklist.project !== config.project || blacklist.source !== TOP_BLACKLIST_URL || !validTimestamp(blacklist.snapshotAt) ||
                        !Array.isArray(blacklist.excludedTitles) || blacklist.excludedTitles.some(function (title) { return typeof title !== 'string' || !title; })) { fail('The daily-top exclusion list is invalid.', 'top-exclusions-unavailable'); }
                    state.boundExcludedTitles = Array.from(new Set(state.boundExcludedTitles.concat(blacklist.excludedTitles.map(normalizedTitle))));
                    state.blacklist = { complete: true, source: TOP_BLACKLIST_URL, snapshotAt: blacklist.snapshotAt, excludedTitles: state.boundExcludedTitles.slice() };
                } catch (error) {
                    if (error.code === 'request-budget' || error.code === 'aborted') { throw error; }
                    state.blacklist.error = errorInfo(error);
                }
            }
            neededDates = refreshV3(state);
            if (state.blacklist.complete) {
                var feedWorkPeriod = state.workPeriod;
                for (var dateIndex = 0; dateIndex < neededDates.length && requests < maxRequests; dateIndex += 1) {
                    var date = neededDates[dateIndex];
                    try { state.topDays[date] = validatedTopDay(await request(topUrl(config, date)), date, state.metadata.cohort, config); }
                    catch (error) {
                        if (error.code === 'request-budget' || error.code === 'aborted') { throw error; }
                        state.topDays[date] = { date: date, status: 'unavailable', cutoff: null, known: {}, coverage: null, error: errorInfo(error) };
                    }
                    await checkpoint(false);
                    refreshV3(state);
                    if (state.allPeriodsComplete || state.workPeriod !== feedWorkPeriod) { break; }
                }
            }
            refreshV3(state);
            if (!state.allPeriodsComplete && requests < maxRequests && (!state.progress.feedRemaining || state.blacklist.error)) {
                var attemptedAggregates = new Set();
                var aggregatePeriod = state.workPeriod;
                while (!state.periods[aggregatePeriod].complete && requests < maxRequests) {
                    var bounds = periodBounds(state, aggregatePeriod);
                    var cutoff = state.periods[aggregatePeriod].proof.cutoff;
                    var needEveryArticle = grandForModel(state.totalModel, aggregatePeriod);
                    var contenders = bounds.filter(function (bound) {
                        var key = bound.article.pageid + ':' + aggregatePeriod;
                        return bound.exact === null && (needEveryArticle || cutoff === null || bound.upper === null || bound.upper >= cutoff) && !attemptedAggregates.has(key) &&
                            (options.retryUnavailableAggregates || !state.aggregateFailures[key]);
                    }).sort(function (a, b) {
                        if (a.upper === null && b.upper !== null) { return -1; }
                        if (a.upper !== null && b.upper === null) { return 1; }
                        return (b.upper || 0) - (a.upper || 0) || b.lower - a.lower;
                    });
                    if (!contenders.length) { break; }
                    var work = contenders.slice(0, Math.min(2, maxRequests - requests));
                    await Promise.all(work.map(async function (bound) {
                        var article = bound.article; var key = article.pageid + ':' + aggregatePeriod;
                        attemptedAggregates.add(key);
                        try {
                            var result = validatedAggregate(article, effectivePeriod(article, state.periods[aggregatePeriod].period),
                                await request(monthlyUrl(config, article, effectivePeriod(article, state.periods[aggregatePeriod].period))), config, now.toISOString(),
                                state.series[article.pageid].titleHistoryBeforePageCreation);
                            if (result.total < state.series[article.pageid].partialSums[aggregatePeriod]) { fail('The published aggregate is below already verified daily views.'); }
                            if (!state.aggregateTotals[article.pageid]) { state.aggregateTotals[article.pageid] = {}; }
                            state.aggregateTotals[article.pageid][aggregatePeriod] = result; delete state.aggregateFailures[key];
                        } catch (error) {
                            if (error.code !== 'request-budget' && error.code !== 'aborted') { state.aggregateFailures[key] = { capturedAt: now.toISOString(), error: errorInfo(error) }; }
                        }
                    }));
                    await checkpoint(false);
                    refreshV3(state);
                }
            }
            refreshV3(state);
            if (state.allPeriodsComplete) { state.lastCompleteSnapshot = snapshotV3(state); }
            else if (requests < maxRequests && !state.progress.metadataRemaining && !state.progress.seriesRemaining &&
                !state.progress.creationRemaining && (!state.progress.feedRemaining || state.blacklist.error) && !state.progress.aggregateRemaining) {
                state.error = { code: 'period-views-incomplete', message: 'Unavailable article dates still prevent completing the article totals.' };
            }
            await checkpoint(true); return state;
        } catch (error) {
            if (error.code !== 'request-budget' && error.code !== 'aborted') { state.error = errorInfo(error); }
            await checkpoint(true); return state;
        }
    }

    function streakGoal(current, best) {
        if (!Number.isSafeInteger(current) || current < 0 || (best !== undefined && (!Number.isSafeInteger(best) || best < current))) {
            fail('Invalid current or best editing streak.');
        }
        best = best === undefined ? current : best;
        var milestones = [30, 45, 60, 90, 100, 150, 200, 365, 500, 730, 1000];
        while (milestones[milestones.length - 1] <= Math.max(current, best)) { milestones.push(milestones[milestones.length - 1] + 365); }
        var completed = milestones.filter(function (milestone) { return milestone <= best; });
        var next = milestones.find(function (milestone) { return milestone > current; });
        return { current: current, best: best, completed: completed,
            lastCompleted: completed.length ? completed[completed.length - 1] : null,
            next: next, remaining: next - current, progress: current / next };
    }

    function validateV3(section, captureAt, check, expectedRankLimit, projectionModel) {
        var expectedModel = projectionModel === undefined ? TOTAL_MODEL : projectionModel;
        var legacyTopTotals = expectedModel == null;
        var label = 'Article ranking: ';
        check(legacyTopTotals ? !own(section, 'totalModel') : section.totalModel === expectedModel, label + 'invalid cumulative total model.');
        check(section.metricVersion === METRIC_VERSION && section.scope === 'all-distinct-edited-existing-mainspace-nonredirect-articles' && section.rankLimit === expectedRankLimit && PERIOD_IDS.indexOf(section.activePeriod) >= 0, label + 'invalid scope or period.');
        check(validTimestamp(section.startedAt) && validTimestamp(section.capturedAt) && Date.parse(section.startedAt) <= Date.parse(section.capturedAt) && Date.parse(section.capturedAt) <= Date.parse(captureAt), label + 'invalid capture times.');
        var definitions = periodsFor(section.startedAt);
        check(!!section.periods && PERIOD_IDS.every(function (id) { return section.periods[id] && JSON.stringify(section.periods[id].period) === JSON.stringify(definitions[id]); }), label + 'frozen period definitions do not match the anchor date.');
        check(Array.isArray(section.candidates) && !!section.metadata && Array.isArray(section.metadata.cohort) && Array.isArray(section.metadata.excluded), label + 'metadata is missing.');
        if (!Array.isArray(section.candidates) || !section.metadata || !Array.isArray(section.metadata.cohort)) { return; }
        var candidateIds = new Set(); var candidateFirst = new Map();
        section.candidates.forEach(function (article) {
            check(Number.isSafeInteger(article.pageid) && article.pageid > 0 && !candidateIds.has(article.pageid) && typeof article.title === 'string' && !!article.title && validTimestamp(article.lastEditAt) && validTimestamp(article.firstEditAt) && article.firstEditAt <= article.lastEditAt, label + 'invalid candidate.');
            candidateIds.add(article.pageid); candidateFirst.set(article.pageid, article.firstEditAt);
        });
        check(section.universeFingerprint === universeFingerprint(section.candidates), label + 'universe fingerprint mismatch.');
        check(Number.isInteger(section.metadata.cursor) && section.metadata.cursor >= 0 && section.metadata.cursor <= section.candidates.length, label + 'invalid metadata cursor.');
        var classified = new Set(); var titles = new Set(); var articles = new Map();
        section.metadata.cohort.forEach(function (article) {
            check(candidateIds.has(article.pageid) && !classified.has(article.pageid) && typeof article.title === 'string' && !!article.title && !titles.has(normalizedTitle(article.title)) && validTimestamp(article.lastEditAt) && validTimestamp(article.firstEditAt) && article.firstEditAt === candidateFirst.get(article.pageid) && article.firstEditAt <= article.lastEditAt, label + 'invalid eligible article.');
            classified.add(article.pageid); titles.add(normalizedTitle(article.title)); articles.set(article.pageid, article);
        });
        section.metadata.excluded.forEach(function (article) {
            check(candidateIds.has(article.pageid) && !classified.has(article.pageid) && ['missing', 'redirect', 'namespace'].indexOf(article.reason) >= 0, label + 'invalid excluded article.'); classified.add(article.pageid);
        });
        check(classified.size === section.metadata.cursor && section.candidates.slice(0, section.metadata.cursor).every(function (article) { return classified.has(article.pageid); }) &&
            (!section.metadata.complete || section.metadata.cursor === section.candidates.length), label + 'metadata is incomplete or omits candidates.');
        check(Array.isArray(section.boundExcludedTitles) && section.boundExcludedTitles.indexOf('-') >= 0 && !!section.blacklist, label + 'exclusion coverage is missing.');
        if (section.blacklist && section.blacklist.complete) {
            check(section.blacklist.source === TOP_BLACKLIST_URL && validTimestamp(section.blacklist.snapshotAt) && Date.parse(section.blacklist.snapshotAt) <= Date.parse(captureAt) &&
                Array.isArray(section.blacklist.excludedTitles) && section.blacklist.excludedTitles.every(function (title) { return section.boundExcludedTitles.indexOf(title) >= 0; }), label + 'invalid live exclusion list.');
        }
        var source = sourceForArticles(definitions, section.metadata.complete ? section.metadata.cohort : section.candidates);
        check(JSON.stringify(section.sourcePeriod) === JSON.stringify(source), label + 'source interval does not cover lifetime and rolling periods.');
        // The same controls and source interval apply to every cached article.
        // Validate their observations once, retaining the per-series chronology
        // check below. This does not bypass any zero-availability evidence.
        var availabilityValid = !!section.availabilityProof && validAvailabilityProof(section.availabilityProof, source, DEFAULT_CONFIG, captureAt);
        if (section.availabilityProof) { check(availabilityValid, label + 'invalid annual availability proof.'); }
        if (section.availabilityAttemptAt) {
            check(validTimestamp(section.availabilityAttemptAt) && Date.parse(section.availabilityAttemptAt) <= Date.parse(captureAt), label + 'invalid availability attempt time.');
        }
        function validateSeriesCache(series) {
            check(Number.isSafeInteger(series.pageid) && series.pageid > 0 && typeof series.title === 'string' && !!series.title && validTimestamp(series.lastEditAt) && validTimestamp(series.capturedAt) && Date.parse(series.capturedAt) <= Date.parse(captureAt), label + 'invalid cached article.');
            check(validTimestamp(series.firstEditAt) && series.countStartDate === countStart(series), label + 'invalid first-edit cutoff.');
            check(JSON.stringify(series.sourcePeriod) === JSON.stringify(source) && Array.isArray(series.missing) && !!series.partialSums && !!series.totals && !!series.covered, label + 'invalid series projection.');
            var seenMissing = new Set();
            (series.missing || []).forEach(function (index) {
                check(Number.isInteger(index) && index >= 0 && index < source.days && !seenMissing.has(index), label + 'invalid or duplicate missing-date index.'); seenMissing.add(index);
                check(addDate(source.start, index) >= countStart(series), label + 'a pre-first-edit date cannot remain unknown.');
            });
            PERIOD_IDS.forEach(function (id) {
                var period = effectivePeriod(series, definitions[id]);
                var missing = (series.missing || []).filter(function (index) { var date = addDate(source.start, index); return date >= period.start && date <= period.end; }).length;
                check(Number.isSafeInteger(series.partialSums[id]) && series.partialSums[id] >= 0 && series.covered[id] === period.days - missing &&
                    series.totals[id] === (missing ? null : series.partialSums[id]), label + 'period coverage or totals do not match the missing dates.');
            });
            check(series.partialSums['30d'] <= series.partialSums['90d'] && series.partialSums['90d'] <= series.partialSums['12m'] && series.partialSums['12m'] <= series.partialSums['since'], label + 'nested period sums are inconsistent.');
            check(!series.firstNonZeroDate || (validDate(series.firstNonZeroDate) && series.firstNonZeroDate >= source.start && series.firstNonZeroDate <= source.end), label + 'invalid first positive date.');
            check(!!series.titleHistoryBeforePageCreation === !!(series.creationDate && series.firstNonZeroDate && series.firstNonZeroDate < series.creationDate), label + 'invalid prior-title-history flag.');
            check(!series.creationDate || validDate(series.creationDate), label + 'invalid creation date.');
            if (series.creationEvidence && series.creationEvidence.type === 'first-revision') {
                check(series.creationEvidence.parentid === 0 && Number.isSafeInteger(series.creationEvidence.revid) && series.creationEvidence.revid > 0 && validTimestamp(series.creationEvidence.timestamp) && series.creationEvidence.timestamp.slice(0, 10) === series.creationDate, label + 'invalid creation evidence.');
            }
            check(['available', 'partial', 'unavailable'].indexOf(series.status) >= 0 && (series.status !== 'available' || series.missing.length === 0), label + 'invalid series status.');
            if (own(series, 'reportedDays')) {
                check(Number.isInteger(series.reportedDays) && series.reportedDays >= 0 && series.reportedDays <= source.days, label + 'invalid explicit reported-day count.');
            }
            if (series.zeroBasis) {
                check(['aqs-documented-omitted-zero', 'aqs-documented-empty-series'].indexOf(series.zeroBasis) >= 0 &&
                    availabilityValid && Date.parse(section.availabilityProof.capturedAt) <= Date.parse(series.capturedAt) &&
                    series.availabilityProofAt === section.availabilityProof.capturedAt && series.validated === true &&
                    series.status === 'available' && series.missing.length === 0 && Number.isInteger(series.reportedDays) && series.reportedDays < source.days,
                    label + 'zero-filled article lacks matching availability evidence.');
                if (series.zeroBasis === 'aqs-documented-empty-series') {
                    var evidence = series.zeroEvidence;
                    check(!!evidence && evidence.status === 404 && series.reportedDays === 0 && !series.firstNonZeroDate &&
                        PERIOD_IDS.every(function (id) { return series.partialSums[id] === 0; }) &&
                        documentedEmptyError({ status: 404, requestUrl: evidence.requestUrl, problem: evidence.problem }, viewUrl(DEFAULT_CONFIG, series.title, source)),
                        label + 'empty series lacks a matching AQS not-found response.');
                } else { check(!series.zeroEvidence, label + 'omitted-day series has incompatible not-found evidence.'); }
            } else { check(!series.availabilityProofAt && !series.zeroEvidence, label + 'article zero evidence has no declared basis.'); }
        }
        check(!!section.series && typeof section.series === 'object' && !!section.topDays && typeof section.topDays === 'object', label + 'series or feed cache is missing.');
        Object.keys(section.series || {}).forEach(function (id) {
            var series = section.series[id]; var article = articles.get(Number(id));
            check(!!article && series.pageid === Number(id) && series.title === article.title && series.firstEditAt === article.firstEditAt, label + 'cached series is outside the universe or first-edit history.'); validateSeriesCache(series);
        });
        Object.keys(section.reusableSeries || {}).forEach(function (id) { validateSeriesCache(section.reusableSeries[id]); });
        function validateAggregateCache(result, id, key, requireMembership) {
            var article = articles.get(Number(key));
            check(PERIOD_IDS.indexOf(id) >= 0 && (!requireMembership || (!!article && article.title === result.title)) && result.pageid === Number(key) &&
                result.granularity === 'monthly' && JSON.stringify(result.period) === JSON.stringify(effectivePeriod(article || result, definitions[id])) &&
                validTimestamp(result.capturedAt) && Date.parse(result.capturedAt) <= Date.parse(captureAt) && Number.isSafeInteger(result.total) && result.total >= 0,
                label + 'invalid published monthly aggregate.');
            var slices = monthSlices(effectivePeriod(article || result, definitions[id]));
            check(Array.isArray(result.buckets) && result.buckets.length === slices.length, label + 'monthly aggregate lacks expected calendar buckets.');
            var sum = 0;
            (result.buckets || []).forEach(function (bucket, index) {
                var expected = slices[index];
                check(!!expected && bucket.month === expected.month && bucket.start === expected.start && bucket.end === expected.end &&
                    Number.isSafeInteger(bucket.views) && bucket.views >= 0, label + 'invalid monthly bucket interval.');
                if (bucket.verifiedBeforeCreation) { check(!!result.creationDate && !result.titleHistoryBeforePageCreation && bucket.end < result.creationDate && bucket.views === 0, label + 'unverified pre-creation bucket zero.'); }
                sum += bucket.views;
            });
            check(sum === result.total, label + 'monthly bucket sum mismatch.');
        }
        check(!!section.aggregateTotals && !!section.aggregateFailures && !!section.reusableAggregates, label + 'monthly aggregate caches are missing.');
        Object.keys(section.aggregateTotals || {}).forEach(function (key) {
            Object.keys(section.aggregateTotals[key]).forEach(function (id) { validateAggregateCache(section.aggregateTotals[key][id], id, key, true); });
        });
        Object.keys(section.reusableAggregates || {}).forEach(function (key) {
            Object.keys(section.reusableAggregates[key]).forEach(function (id) { validateAggregateCache(section.reusableAggregates[key][id], id, key, false); });
        });
        Object.keys(section.topDays || {}).forEach(function (date) {
            var day = section.topDays[date];
            check(validDate(date) && date >= source.start && date <= source.end && day.date === date && ['available', 'unavailable'].indexOf(day.status) >= 0, label + 'invalid cached feed date.');
            if (day.status === 'available') {
                check(Number.isSafeInteger(day.cutoff) && day.cutoff > 0 && !!day.coverage && day.coverage.source === 'AQS-daily-top-user' && day.coverage.agent === 'user' &&
                    day.coverage.access === 'all-access' && day.coverage.project === 'pt.wikipedia.org' && day.coverage.sourceDefinition === TOP_BOUND_SOURCE &&
                    Number.isInteger(day.coverage.articleCount) && day.coverage.articleCount > 0 && day.coverage.articleCount <= 1000 && day.coverage.minRank === 1 &&
                    Number.isInteger(day.coverage.maxRank) && day.coverage.maxRank >= 1 && day.coverage.maxRank <= 1000, label + 'invalid daily-feed coverage.');
                Object.keys(day.known || {}).forEach(function (id) { check(articles.has(Number(id)) && Number.isSafeInteger(day.known[id]) && day.known[id] >= day.cutoff, label + 'invalid listed-article views.'); });
            } else { check(day.cutoff === null && Object.keys(day.known || {}).length === 0, label + 'unavailable feed provides bounds.'); }
        });
        var expected = clone(section); refreshV3(expected, expectedModel);
        PERIOD_IDS.forEach(function (id) {
            var actual = section.periods[id]; var computed = expected.periods[id];
            check(actual.totalScope === computed.totalScope && actual.allArticleTotal === computed.allArticleTotal && (legacyTopTotals || actual.rankedTotal === computed.rankedTotal) && actual.rows.length <= expectedRankLimit &&
                JSON.stringify(actual.rows) === JSON.stringify(computed.rows) && JSON.stringify(actual.proof) === JSON.stringify(computed.proof) &&
                actual.total === computed.total && actual.rankingComplete === computed.rankingComplete && actual.complete === computed.complete, label + 'unproved or mismatched ' + id + ' ranking.');
        });
        ['period', 'rows', 'total', 'proof', 'complete', 'rankingComplete', 'allPeriodsComplete', 'totalScope', 'allArticleTotal'].concat(legacyTopTotals ? [] : ['rankedTotal']).forEach(function (key) {
            check(JSON.stringify(section[key]) === JSON.stringify(expected[key]), label + 'active-period alias mismatch: ' + key);
        });
        if (section.lastCompleteSnapshot) {
            check((legacyTopTotals ? !own(section.lastCompleteSnapshot, 'totalModel') : section.lastCompleteSnapshot.totalModel === expectedModel) && section.lastCompleteSnapshot.metricVersion === METRIC_VERSION && section.lastCompleteSnapshot.rankLimit === 1000 && !!section.lastCompleteSnapshot.periods && PERIOD_IDS.every(function (id) {
                var result = section.lastCompleteSnapshot.periods[id];
                return result && Array.isArray(result.rows) && result.rows.length <= 1000 && result.rows.every(function (row) { return validTimestamp(row.firstEditAt) && row.countFromDate === effectivePeriod(row, result.period).start; }) && result.totalScope === (grandForModel(expectedModel, id) ? 'all-eligible-articles' : 'ranked-top-' + expectedRankLimit) &&
                    (!result.rankingComplete || (legacyTopTotals ? result.total : result.rankedTotal) === result.rows.reduce(function (sum, row) { return sum + row.views; }, 0)) &&
                    (!result.complete || (result.proof.complete && (grandForModel(expectedModel, id) ? Number.isSafeInteger(result.allArticleTotal) && result.allArticleTotal >= result.rankedTotal && result.total === result.allArticleTotal : result.total === result.rows.reduce(function (sum, row) { return sum + row.views; }, 0))));
            }), label + 'invalid prior snapshot.');
        }
    }

    function validateStateForRank(state, expectedRankLimit, projectionModel) {
        var errors = [];
        function check(condition, message) { if (!condition) { errors.push(message); } }
        try {
            check(!!state && typeof state === 'object' && state.schemaVersion === 4, 'Unsupported state schema.');
            if (!state || typeof state !== 'object') { return { valid: false, errors: errors }; }
            check(!!state.config && typeof state.config === 'object', 'State configuration is missing.');
            var config = normalizeConfig(state.config, expectedRankLimit);
            check(validTimestamp(state.capturedAt), 'Invalid state capture time.');
            var activity = state.activity;
            check(sameIdentity(activity, config), 'Activity identity does not match the state.');
            check(!!activity && Array.isArray(activity.entries), 'Contribution history is missing.');
            if (activity && Array.isArray(activity.entries)) {
                var revids = new Set();
                activity.entries.forEach(function (raw) {
                    var entry = packEntry(raw);
                    check(!revids.has(entry[0]), 'Duplicate cached revision.');
                    revids.add(entry[0]);
                    check(new Date(entry[4]).getTime() <= new Date(state.capturedAt).getTime(), 'Cached edit is in the future.');
                    if (activity.capturedAt) {
                        check(new Date(entry[4]).getTime() <= new Date(activity.capturedAt).getTime(), 'Cached edit follows its activity capture time.');
                    }
                });
                if (activity.complete) {
                    check(validTimestamp(activity.capturedAt) && validTimestamp(activity.fullScanAt), 'Complete activity has no capture or full-scan time.');
                    check(new Date(activity.fullScanAt).getTime() <= new Date(activity.capturedAt).getTime() &&
                        new Date(activity.capturedAt).getTime() <= new Date(state.capturedAt).getTime(), 'Activity capture and full-scan times are inconsistent.');
                    check(!!activity.summary && validTimestamp(activity.summary.asOf), 'Complete activity has no valid summary.');
                    if (activity.summary && validTimestamp(activity.summary.asOf)) {
                        check(new Date(activity.summary.asOf).getTime() <= new Date(state.capturedAt).getTime(), 'Activity summary is in the future.');
                        var expected = summarize(activity.entries, { config: Object.assign({}, config, { rankLimit: 1000 }), now: activity.summary.asOf });
                        Object.keys(expected).forEach(function (key) {
                            if (key !== 'counts') {
                                check(JSON.stringify(activity.summary[key]) === JSON.stringify(expected[key]), 'Cached summary mismatch: ' + key);
                            }
                        });
                        var actualCounts = activity.summary.counts || {};
                        check(Object.keys(actualCounts).length === Object.keys(expected.counts).length &&
                            Object.keys(expected.counts).every(function (date) { return actualCounts[date] === expected.counts[date]; }), 'Cached daily edit counts mismatch.');
                    }
                } else { check(activity.entries.length === 0 && activity.summary === null, 'Incomplete first scan must not expose partial activity.'); }
            }
            check(sameIdentity(state.pageviews, config), 'Article-view identity does not match the state.');
            if (state.pageviews) {
                check(JSON.stringify(state.pageviews.candidates) === JSON.stringify(articleCandidates(activity.entries)), 'First-edit candidate history does not match the complete public contributions.');
                validateV3(state.pageviews, state.capturedAt, check, expectedRankLimit, projectionModel);
            }
        } catch (error) { errors.push(errorInfo(error).message); }
        return { valid: errors.length === 0, errors: errors };
    }

    function validateState(state) { return validateStateForRank(state, 1000); }

    function upgradeAllArticleTotalCache(previous) {
        if (validateState(previous).valid) { return clone(previous); }
        var oldModel = previous && previous.pageviews && own(previous.pageviews, 'totalModel') ? previous.pageviews.totalModel : null;
        if ((oldModel !== null && oldModel !== 'since-all-eligible-v1') || !validateStateForRank(previous, 1000, oldModel).valid) { fail('The previous after-first-edit cache is invalid.', 'invalid-legacy-cache'); }
        var state = clone(previous);
        state.pageviews.totalModel = TOTAL_MODEL;
        state.pageviews.lastCompleteSnapshot = null;
        refreshV3(state.pageviews);
        if (state.pageviews.allPeriodsComplete) { state.pageviews.lastCompleteSnapshot = snapshotV3(state.pageviews); }
        state.complete = state.activity.complete && state.pageviews.complete;
        state.fresh = !state.activity.stale && !state.pageviews.stale;
        var validation = validateState(state);
        if (!validation.valid) { fail('The cumulative total cache upgrade failed: ' + validation.errors.join('; '), 'invalid-upgraded-cache'); }
        return state;
    }

    function upgradeAfterFirstEditCache(previous) {
        if (validateState(previous).valid) { return clone(previous); }
        if (previous && previous.schemaVersion === 4) { return upgradeAllArticleTotalCache(previous); }
        if (!previous || previous.schemaVersion !== 3 || !previous.activity || !previous.activity.complete ||
            !previous.config || typeof previous.config.user !== 'string' || !previous.config.user || previous.config.project !== DEFAULT_CONFIG.project ||
            !validTimestamp(previous.capturedAt)) { fail('The prior public activity cache is invalid.', 'invalid-legacy-cache'); }
        var config = normalizeConfig(Object.assign({}, previous.config, { rankLimit: 1000 }));
        var activity = clone(previous.activity);
        var candidates = articleCandidates(activity.entries);
        var pageviews = newStateV3(config, nowDate(previous.capturedAt), activity, candidates, null);
        var oldMetadata = previous.pageviews && sameIdentity(previous.pageviews, config) && previous.pageviews.metadata;
        if (oldMetadata && Array.isArray(oldMetadata.cohort) && Array.isArray(oldMetadata.excluded)) {
            var byId = new Map(candidates.map(function (article) { return [article.pageid, article]; }));
            pageviews.metadata = { cursor: oldMetadata.cursor, complete: oldMetadata.complete,
                cohort: oldMetadata.cohort.map(function (old) {
                    var candidate = byId.get(old.pageid);
                    if (!candidate || typeof old.title !== 'string' || !old.title) { fail('Legacy metadata is outside the public contribution history.', 'invalid-legacy-cache'); }
                    return Object.assign({}, candidate, { title: old.title });
                }), excluded: clone(oldMetadata.excluded) };
            pageviews.sourcePeriod = sourceForArticles(periodsFor(pageviews.startedAt), pageviews.metadata.complete ? pageviews.metadata.cohort : candidates);
        }
        refreshV3(pageviews);
        var state = { schemaVersion: 4, config: config, capturedAt: previous.capturedAt, activity: activity,
            pageviews: pageviews, complete: activity.complete && pageviews.complete, fresh: !activity.stale && !pageviews.stale, cacheDiscarded: false };
        var validation = validateState(state);
        if (!validation.valid) { fail('The prior activity and metadata cannot be upgraded: ' + validation.errors.join('; '), 'invalid-legacy-cache'); }
        return state;
    }

    function upgradeRankingCache(previous) { return upgradeAfterFirstEditCache(previous); }

    async function update(options) {
        options = options || {};
        var config = normalizeConfig(options.config);
        var now = nowDate(options.now);
        var previous = options.previous || null;
        var cacheDiscarded = false;
        if (previous && (previous.schemaVersion === 3 || (previous.schemaVersion === 4 && (!previous.pageviews || previous.pageviews.totalModel !== TOTAL_MODEL)))) {
            try { previous = upgradeRankingCache(previous); } catch (_) { previous = null; cacheDiscarded = true; }
        }
        if (previous && (!validateState(previous).valid || !previous.config ||
            previous.config.user !== config.user || previous.config.project !== config.project)) {
            previous = null;
            cacheDiscarded = true;
        }
        var common = Object.assign({}, options, { config: config, now: now, requestJson: requireRequest(options), previous: previous });
        var activity = await collectActivity(common);
        function stateWith(pageviews) {
            return { schemaVersion: 4, config: config, capturedAt: now.toISOString(), activity: activity,
                pageviews: pageviews, complete: activity.complete && pageviews.complete,
                fresh: !activity.stale && !pageviews.stale, cacheDiscarded: cacheDiscarded };
        }
        var progressCallback = options.onProgress ? async function (pageviews) { await options.onProgress(stateWith(pageviews)); } : undefined;
        var pageviews = await collectPageviews(Object.assign({}, common, { activity: activity, onProgress: progressCallback }));
        return stateWith(pageviews);
    }

    return Object.freeze({
        DEFAULT_CONFIG: DEFAULT_CONFIG, localDate: localDate, addDate: addDate, dateAdd: addDate,
        summarize: summarize, collectActivity: collectActivity, collectPageviews: collectPageviews,
        update: update, validateState: validateState, upgradeRankingCache: upgradeRankingCache, upgradeAfterFirstEditCache: upgradeAfterFirstEditCache, upgradeAllArticleTotalCache: upgradeAllArticleTotalCache, packEntry: packEntry, unpackEntry: unpackEntry,
        streakGoal: streakGoal, TOP_BLACKLIST_URL: TOP_BLACKLIST_URL,
        periodsFor: periodsFor, addMonthsClamped: addMonthsClamped, PERIOD_IDS: PERIOD_IDS,
        METRIC_VERSION: METRIC_VERSION, TOTAL_MODEL: TOTAL_MODEL, COVERAGE_FLOOR: COVERAGE_FLOOR, effectivePeriod: effectivePeriod,
        viewPeriod: function (now) { return viewPeriod(nowDate(now)); }
    });
}));

;

/* PerfilWiki 1.0.0: shared, public Portuguese Wikipedia contribution history. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    if (root) { root.PerfilWikiHistory = api; }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var PROJECT = 'pt.wikipedia.org';
    var DAY = 86400000;
    var LIMITS = Object.freeze({ entries: 1000000, cursors: 10000, requests: 200, tags: 256 });
    var own = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
    var object = function (value) { return !!value && typeof value === 'object' && !Array.isArray(value); };

    function fail(code, message) {
        var error = new Error(message);
        error.code = code;
        throw error;
    }

    function username(value) {
        if (typeof value !== 'string' || !value.trim() || value.length > 255 || /[\x00-\x1f\x7f]/.test(value)) {
            fail('invalid-user', 'A valid Wikipedia username is required.');
        }
        return value.trim();
    }

    function currentTime(value) {
        var date = value === undefined ? new Date() : new Date(value);
        if (value === null || !Number.isFinite(date.getTime())) { fail('invalid-now', 'The current time is invalid.'); }
        return date;
    }

    function timestamp(value) {
        if (typeof value !== 'string') { fail('invalid-timestamp', 'An ISO UTC timestamp is required.'); }
        var match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
        var date = new Date(value);
        var expected = match && match[1] + '.' + ((match[2] || '') + '000').slice(0, 3) + 'Z';
        if (!match || !Number.isFinite(date.getTime()) || date.toISOString() !== expected) {
            fail('invalid-timestamp', 'An ISO UTC timestamp is invalid.');
        }
        return expected;
    }

    function text(value, max, label) {
        if (typeof value !== 'string' || !value.length || value.length > max || /[\x00-\x1f\x7f]/.test(value)) {
            fail('invalid-entry', 'An edit has an invalid ' + label + '.');
        }
        return value;
    }

    function tags(value) {
        if (!Array.isArray(value) || value.length > LIMITS.tags) { fail('invalid-entry', 'An edit has invalid tags.'); }
        var result = Array.from(value, function (tag) { return text(tag, 255, 'tag'); }).sort();
        for (var i = 1; i < result.length; i += 1) {
            if (result[i] === result[i - 1]) { fail('invalid-entry', 'An edit repeats a tag.'); }
        }
        return result;
    }

    function packEntry(raw, user, upper, lower, fromApi) {
        if (!fromApi && (!Array.isArray(raw) || raw.length !== 9)) {
            fail('invalid-entry', 'Cached edits must contain nine fields.');
        }
        if (fromApi && !object(raw)) { fail('invalid-entry', 'An edit must be an API object.'); }
        if (fromApi) {
            ['new', 'minor', 'top', 'patrolled', 'autopatrolled'].forEach(function (flag) {
                if (own(raw, flag) && typeof raw[flag] !== 'boolean') {
                    fail('invalid-entry', 'API edit flags must use formatversion 2 booleans.');
                }
            });
        }
        var result = fromApi ? [raw.revid, raw.pageid, raw.ns, raw.title, raw.timestamp,
            raw.new === true ? 1 : 0, raw.parentid, raw.user, raw.tags] : raw;
        if (!Number.isSafeInteger(result[0]) || result[0] <= 0 ||
            !Number.isSafeInteger(result[1]) || result[1] < 0 ||
            !Number.isSafeInteger(result[2]) || result[2] < 0 ||
            !Number.isSafeInteger(result[6]) || result[6] < 0 || result[6] === result[0] ||
            (result[5] !== 0 && result[5] !== 1)) {
            fail('invalid-entry', 'An edit has invalid identifiers or creation flag.');
        }
        if (typeof result[7] !== 'string' || result[7] !== user || username(result[7]) !== result[7]) {
            fail('wrong-identity', 'An edit belongs to another user or omits its user.');
        }
        var time = timestamp(result[4]);
        if (time > upper || (lower && time < lower)) {
            fail('invalid-bounds', 'An edit falls outside the requested time bounds.');
        }
        return [result[0], result[1], result[2], text(result[3], 1024, 'title'), time,
            result[5], result[6], result[7], tags(result[8])];
    }

    function compare(left, right) { return right[4].localeCompare(left[4]) || right[0] - left[0]; }
    function equal(left, right) { return JSON.stringify(left) === JSON.stringify(right); }

    function cachedEntries(input, user, upper, lower) {
        if (!Array.isArray(input) || input.length > LIMITS.entries) { fail('invalid-cache', 'The history array exceeds its limit or is missing.'); }
        var seen = new Set();
        var last = null;
        return Array.from(input, function (raw) {
            var entry = packEntry(raw, user, upper, lower, false);
            if (seen.has(entry[0])) { fail('invalid-cache', 'Cached revisions must be unique.'); }
            if (last && compare(last, entry) > 0) { fail('invalid-cache', 'Cached edits are out of order.'); }
            seen.add(entry[0]);
            last = entry;
            return entry;
        });
    }

    function cursor(input) {
        if (!object(input) || typeof input.uccontinue !== 'string' || !input.uccontinue ||
            input.uccontinue.length > 2048 || /[\x00-\x1f\x7f]/.test(input.uccontinue)) {
            fail('invalid-continuation', 'The continuation cursor is invalid.');
        }
        var result = { uccontinue: input.uccontinue };
        Object.keys(input).forEach(function (key) {
            if (key !== 'uccontinue' && key !== 'continue') { fail('invalid-continuation', 'The continuation contains an unexpected parameter.'); }
        });
        if (own(input, 'continue')) {
            if (typeof input.continue !== 'string' || input.continue.length > 2048 || /[\x00-\x1f\x7f]/.test(input.continue)) {
                fail('invalid-continuation', 'The generic continuation cursor is invalid.');
            }
            result.continue = input.continue;
        }
        return result;
    }

    function baseState(input, user, now) {
        if (!object(input) || input.user !== user || input.project !== PROJECT) {
            fail('wrong-identity', 'The cached history has a different user or project.');
        }
        if (typeof input.complete !== 'boolean' || typeof input.stale !== 'boolean' || typeof input.cacheHit !== 'boolean' ||
            (input.scanMode !== 'full' && input.scanMode !== 'incremental')) {
            fail('invalid-cache', 'The cached history has invalid status fields.');
        }
        if (input.error !== null && (!object(input.error) || typeof input.error.code !== 'string' ||
            !input.error.code || input.error.code.length > 100 || typeof input.error.message !== 'string' || input.error.message.length > 500)) {
            fail('invalid-cache', 'The cached history has an invalid error.');
        }
        if ((!input.stale && input.error !== null) || (input.cacheHit && input.stale)) {
            fail('invalid-cache', 'The cached freshness and error fields are inconsistent.');
        }
        var result = {
            user: user, project: PROJECT, entries: [], complete: input.complete,
            capturedAt: null, fullScanAt: null, scanMode: input.scanMode,
            cacheHit: input.cacheHit, stale: input.stale, error: input.error ? { code: input.error.code, message: input.error.message } : null,
            pending: null
        };
        if (input.complete) {
            result.capturedAt = timestamp(input.capturedAt);
            result.fullScanAt = timestamp(input.fullScanAt);
            if (result.fullScanAt > result.capturedAt || result.capturedAt > now) {
                fail('invalid-cache', 'The cached history has inconsistent or future timestamps.');
            }
            result.entries = cachedEntries(input.entries, user, result.capturedAt, null);
        } else if (input.capturedAt !== null || input.fullScanAt !== null || !Array.isArray(input.entries) || input.entries.length ||
            input.scanMode !== 'full' || !input.stale || input.cacheHit) {
            fail('invalid-cache', 'An incomplete cold scan must not expose contributions.');
        }
        return result;
    }

    function pendingState(input, base, now) {
        if (!object(input) || input.version !== 1 || input.user !== base.user || input.project !== PROJECT ||
            (input.scanMode !== 'full' && input.scanMode !== 'incremental')) {
            fail('invalid-pending', 'The pending scan has a different identity or schema.');
        }
        var anchor = timestamp(input.anchor);
        if (anchor > now || (base.capturedAt && anchor < base.capturedAt) ||
            input.baseCapturedAt !== base.capturedAt || input.baseFullScanAt !== base.fullScanAt) {
            fail('invalid-pending', 'The pending scan has inconsistent or future timestamps.');
        }
        var lower = input.lowerBound === null ? null : timestamp(input.lowerBound);
        if (input.scanMode === 'incremental') {
            if (!base.complete || lower !== overlapStart(base) || lower > anchor) {
                fail('invalid-pending', 'The incremental scan has invalid base history or bounds.');
            }
        } else if (lower !== null) { fail('invalid-pending', 'A full scan cannot have a lower time bound.'); }
        if (!Number.isSafeInteger(input.pagesFetched) || input.pagesFetched < 1 || input.pagesFetched > LIMITS.cursors ||
            !Array.isArray(input.seenCursors) || input.seenCursors.length !== input.pagesFetched) {
            fail('invalid-pending', 'The pending pagination history exceeds its limit or is invalid.');
        }
        var next = cursor(input.cursor);
        var seen = new Set();
        Array.from(input.seenCursors).forEach(function (value) {
            cursor({ uccontinue: value });
            if (seen.has(value)) { fail('invalid-pending', 'The pending scan repeats a cursor.'); }
            seen.add(value);
        });
        if (input.seenCursors[input.seenCursors.length - 1] !== next.uccontinue) {
            fail('invalid-pending', 'The pending cursor does not match its pagination history.');
        }
        var entries = cachedEntries(input.entries, base.user, anchor, lower);
        if (!entries.length) { fail('invalid-pending', 'A continuing scan must contain contributions.'); }
        return {
            version: 1, user: base.user, project: PROJECT, scanMode: input.scanMode,
            anchor: anchor, lowerBound: lower, baseCapturedAt: base.capturedAt, baseFullScanAt: base.fullScanAt,
            entries: entries, cursor: next, seenCursors: input.seenCursors.slice(), pagesFetched: input.pagesFetched
        };
    }

    function validate(state, options) {
        try {
            options = options || {};
            var user = username(options.user);
            var now = currentTime(options.now).toISOString();
            var base = baseState(state, user, now);
            if (state.pending !== null) {
                pendingState(state.pending, base, now);
                if (!state.stale || state.cacheHit) { fail('invalid-pending', 'Pending history must be stale and cannot be a cache hit.'); }
            }
            return { valid: true, errors: [] };
        } catch (error) {
            return { valid: false, errors: [error.message || 'The history is invalid.'] };
        }
    }

    function overlapStart(base) {
        var latest = base.entries.length ? base.entries[0][4] : base.capturedAt;
        return new Date(new Date(latest).getTime() - DAY).toISOString();
    }

    function apiUrl(user, stage) {
        var url = new URL('https://' + PROJECT + '/w/api.php');
        var params = {
            action: 'query', format: 'json', formatversion: 2, origin: '*', maxlag: 5,
            list: 'usercontribs', ucuser: user, ucprop: 'ids|title|timestamp|flags|tags',
            ucdir: 'older', uclimit: 500, ucstart: stage.anchor
        };
        if (stage.lowerBound) { params.ucend = stage.lowerBound; }
        if (stage.cursor) { Object.assign(params, stage.cursor); }
        Object.keys(params).forEach(function (key) { url.searchParams.set(key, String(params[key])); });
        return url.toString();
    }

    function responseEntries(response) {
        if (!object(response)) { fail('invalid-response', 'The service returned an invalid response.'); }
        if (own(response, 'error')) { fail('api-error', 'The service reported an API error.'); }
        if (own(response, 'warnings') && (!object(response.warnings) || Object.keys(response.warnings).length)) {
            fail('api-warning', 'The service returned an incomplete response warning.');
        }
        if (!object(response.query) || !Array.isArray(response.query.usercontribs) || response.query.usercontribs.length > 500) {
            fail('invalid-response', 'The contribution batch is invalid or missing.');
        }
        if (own(response, 'batchcomplete') && typeof response.batchcomplete !== 'boolean') {
            fail('invalid-response', 'Completion flags must use formatversion 2 booleans.');
        }
        return response.query.usercontribs;
    }

    function errorInfo(error) {
        return { code: String(error && error.code || 'request-failed').slice(0, 100),
            message: String(error && error.message || 'The history request failed.').slice(0, 500) };
    }

    function duration(value, fallback, name) {
        if (value === undefined) { return fallback; }
        if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) { fail('invalid-options', name + ' must be a non-negative duration.'); }
        return value;
    }

    function emptyState(user) {
        return { user: user, project: PROJECT, entries: [], complete: false, capturedAt: null, fullScanAt: null,
            scanMode: 'full', cacheHit: false, stale: true, error: null, pending: null };
    }

    // requestJson receives a URL for a public GET. It must not add authentication or write parameters.
    // force bypasses the freshness cache. It does not discard a valid resumable scan.
    async function collect(options) {
        options = options || {};
        var user = username(options.user);
        var now = currentTime(options.now).toISOString();
        var nowMs = new Date(now).getTime();
        var budget = options.maxRequests === undefined ? 20 : options.maxRequests;
        var fullRescanMs = duration(options.fullRescanMs, 30 * DAY, 'fullRescanMs');
        var refreshMs = duration(options.refreshMs, 300000, 'refreshMs');
        if (!Number.isSafeInteger(budget) || budget < 1 || budget > LIMITS.requests ||
            (options.force !== undefined && typeof options.force !== 'boolean')) {
            fail('invalid-options', 'maxRequests must be an integer from 1 to ' + LIMITS.requests + ', and force must be boolean.');
        }
        if (typeof options.requestJson !== 'function') { fail('invalid-options', 'requestJson(url) is required.'); }

        var base = emptyState(user);
        var stage = null;
        if (options.previous) {
            try {
                base = baseState(options.previous, user, now);
                if (options.previous.pending !== null) {
                    try { stage = pendingState(options.previous.pending, base, now); }
                    catch (ignorePending) { stage = null; }
                }
            } catch (ignoreCache) { base = emptyState(user); }
        }
        var full = !base.complete || nowMs - new Date(base.fullScanAt).getTime() >= fullRescanMs;
        if (!stage && base.complete && !base.stale && !base.error && !full && !options.force &&
            nowMs - new Date(base.capturedAt).getTime() < refreshMs) {
            base.cacheHit = true;
            return base;
        }
        if (!stage) {
            stage = { version: 1, user: user, project: PROJECT, scanMode: full ? 'full' : 'incremental',
                anchor: now, lowerBound: full ? null : overlapStart(base), baseCapturedAt: base.capturedAt,
                baseFullScanAt: base.fullScanAt, entries: [], cursor: null, seenCursors: [], pagesFetched: 0 };
        }
        base.cacheHit = false;
        base.stale = true;
        base.error = null;
        var fetched = new Map(stage.entries.map(function (entry) { return [entry[0], entry]; }));
        var seenCursors = new Set(stage.seenCursors);

        try {
            for (var request = 0; request < budget; request += 1) {
                var response = await options.requestJson(apiUrl(user, stage));
                var batch = responseEntries(response);
                var page = Array.from(batch, function (raw) { return packEntry(raw, user, stage.anchor, stage.lowerBound, true); });
                var additions = new Map();
                var boundary = stage.entries.length ? stage.entries[stage.entries.length - 1] : null;
                page.forEach(function (entry, index) {
                    if (index && compare(page[index - 1], entry) > 0) { fail('pagination-no-progress', 'The contribution batch is out of order.'); }
                    var existing = fetched.get(entry[0]) || additions.get(entry[0]);
                    if (existing && !equal(existing, entry)) { fail('conflicting-revision', 'A revision was repeated with conflicting data.'); }
                    if (!existing) {
                        if (boundary && compare(boundary, entry) >= 0) {
                            fail('pagination-no-progress', 'The contribution cursor did not move to older edits.');
                        }
                        additions.set(entry[0], entry);
                    }
                });
                if (fetched.size + additions.size > LIMITS.entries) { fail('history-limit', 'The contribution history exceeds the entry limit.'); }
                var next = null;
                if (own(response, 'continue')) {
                    next = cursor(response.continue);
                    if (!additions.size) { fail('pagination-no-progress', 'The contribution cursor returned no new revisions.'); }
                    if (seenCursors.has(next.uccontinue)) { fail('pagination-loop', 'The contribution cursor repeated.'); }
                    if (stage.pagesFetched >= LIMITS.cursors) { fail('history-limit', 'The contribution scan exceeds the cursor limit.'); }
                } else if (response.batchcomplete !== true) {
                    fail('incomplete-history', 'The contribution history has no completion marker.');
                }
                // Commit a page only after all its entries and continuation have passed validation.
                additions.forEach(function (entry, revid) { fetched.set(revid, entry); });
                // Every new entry is older than the previous boundary, so appending keeps the cache ordered.
                stage.entries = stage.entries.concat(Array.from(additions.values()));
                stage.pagesFetched += 1;
                if (!next) {
                    var merged = new Map();
                    if (stage.scanMode === 'incremental') {
                        base.entries.forEach(function (entry) {
                            if (entry[4] < stage.lowerBound) { merged.set(entry[0], entry); }
                        });
                    }
                    fetched.forEach(function (entry, revid) { merged.set(revid, entry); });
                    if (merged.size > LIMITS.entries) { fail('history-limit', 'The merged history exceeds the entry limit.'); }
                    return { user: user, project: PROJECT, entries: Array.from(merged.values()).sort(compare), complete: true,
                        capturedAt: stage.anchor, fullScanAt: stage.scanMode === 'full' ? stage.anchor : base.fullScanAt,
                        scanMode: stage.scanMode, cacheHit: false, stale: nowMs - new Date(stage.anchor).getTime() >= refreshMs,
                        error: null, pending: null };
                }
                stage.cursor = next;
                stage.seenCursors.push(next.uccontinue);
                seenCursors.add(next.uccontinue);
            }
            base.pending = stage;
            return base;
        } catch (error) {
            base.error = errorInfo(error);
            // A failed page never advances the persisted cursor or contaminates the complete history.
            base.pending = stage.cursor && stage.pagesFetched === stage.seenCursors.length ? stage : null;
            return base;
        }
    }

    function richToActivityEntries(history) {
        if (!history || history.complete !== true) { fail('incomplete-history', 'A complete history is required for activity statistics.'); }
        var checked = validate(history, { user: history.user, now: new Date() });
        if (!checked.valid) { fail('invalid-cache', checked.errors[0]); }
        return history.entries.map(function (entry) { return entry.slice(0, 6); });
    }

    return Object.freeze({ collect: collect, validate: validate, richToActivityEntries: richToActivityEntries, limits: LIMITS });
}));

;

/* PerfilWiki 1.0.0. Public statistics collectors, without DOM, timers or personal data. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiStatistics = api; }
}(typeof globalThis === 'object' ? globalThis : this, function () {
    'use strict';
    var DAY = 86400000, GLOBAL_TTL = 300000, MAX_PROJECTS = 2000, MAX_PAGES = 200000, MAX_LOGS = 250000;
    var METRICS = ['edits', 'thanks', 'articles', 'edited', 'technicalCreated', 'reverts', 'bestStreak', 'registration'];
    var PROJECT = 'pt.wikipedia.org';
    var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function integer(value) { return Number.isSafeInteger(value) && value >= 0; }
    function positive(value) { return integer(value) && value > 0; }
    function username(value) { return typeof value === 'string' && value === value.trim() && value.length > 0 && value.length <= 255 && !/[\x00-\x1f\x7f|<>\[\]{}#]/.test(value); }
    function validTime(value, now) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return false; }
        var time = Date.parse(value);
        return Number.isFinite(time) && new Date(time).toISOString().replace('.000Z', 'Z') === value.replace('.000Z', 'Z') && (now === undefined || time <= now);
    }
    function object(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
    function flag(o, key) { return own(o, key) && (o[key] === true || o[key] === 1 || o[key] === ''); }
    function projectKey(value) { return typeof value === 'string' && value.length <= 64 && /^[a-z0-9_]+$/.test(value) && ['__proto__', 'constructor', 'prototype'].indexOf(value) < 0; }
    function allowedOrigin(value) {
        var url = new URL(value);
        if (url.protocol !== 'https:' || url.username || url.password || url.port ||
            !/(^|\.)(wikipedia|wikimedia|wikidata|wiktionary|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|mediawiki|wikifunctions)\.org$/.test(url.hostname)) {
            throw new Error('Endereço de projeto inválido.');
        }
        return url.origin;
    }
    function queryUrl(origin, params) {
        var url = new URL('/w/api.php', allowedOrigin(origin));
        var all = Object.assign({ action: 'query', format: 'json', formatversion: 2, origin: '*', maxlag: 5 }, params);
        Object.keys(all).forEach(function (key) { url.searchParams.set(key, String(all[key])); });
        return url.toString();
    }
    function responseData(data) {
        if (!object(data) || data.error || data.warnings && Object.keys(data.warnings).length) {
            var error = new Error('Resposta pública incompleta.');
            error.code = data && data.error && data.error.code;
            error.detail = data && JSON.stringify(data.error || data.warnings || {});
            throw error;
        }
        return data;
    }
    function completed(data) { return !data.continue && flag(data, 'batchcomplete'); }
    function safeSum(values) {
        var sum = values.reduce(function (a, b) { if (!integer(b)) { throw new Error('Contagem incompleta.'); } return a + b; }, 0);
        if (!integer(sum)) { throw new Error('Contagem fora do limite numérico.'); }
        return sum;
    }
    function technicalSubpageExcluded(title) {
        var value = title.replace(/_/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (/(?:^|[._ -])(?:test|tests|teste|testes|spec)\.js$/.test(value.split(':').pop())) { return true; }
        return value.split('/').slice(1).some(function (part) {
            return /^(?:doc|documentacao|documentation|teste|testes|test|tests|testcases|casos de teste|sandbox|caixa de areia)(?:$|[ ._-])/.test(part) ||
                /(?:^|[._ -])(?:test|tests|teste|testes|spec)\.js$/.test(part);
        });
    }
    function technicalKind(page) {
        if (!page || page.missing || page.redirect || typeof page.title !== 'string' || !page.title || typeof page.contentmodel !== 'string' || technicalSubpageExcluded(page.title)) { return null; }
        var model = page.contentmodel.toLowerCase();
        if (page.ns === 10 && model === 'wikitext' && !/\.(?:css|json|js)$/i.test(page.title)) { return 'template'; }
        if (page.ns === 828 && model === 'scribunto') { return 'module'; }
        if ((page.ns === 2 || page.ns === 8) && model === 'javascript') { return 'script'; }
        return null;
    }
    function blank(user, now) {
        var metrics = {}, updated = {};
        METRICS.forEach(function (key) { metrics[key] = null; updated[key] = null; });
        return { schema: 1, user: user, project: PROJECT, capturedAt: now, metrics: metrics, metricUpdatedAt: updated,
            errors: [], pending: false, projects: {}, pageInfo: {}, global: null, metadataScan: null, articlesScan: null };
    }
    function validate(state, options) {
        options = options || {};
        var errors = [], now = options.now === undefined ? Date.now() : new Date(options.now).getTime();
        function check(condition, message) { if (!condition && errors.length < 100) { errors.push(message); } }
        function time(value) { return validTime(value, now); }
        function optionalTime(value) { return value === null || time(value); }
        try {
            check(Number.isFinite(now), 'Horário inválido.');
            check(object(state) && state.schema === 1 && state.project === PROJECT && username(state.user), 'Identidade ou formato inválido.');
            if (!object(state)) { return { valid: false, errors: errors }; }
            check(!options.user || state.user === options.user, 'O cache pertence a outro usuário.');
            check(time(state.capturedAt), 'Horário futuro ou inválido no cache.');
            check(object(state.metrics) && object(state.metricUpdatedAt), 'Métricas ausentes.');
            METRICS.forEach(function (key) {
                var value = state.metrics && state.metrics[key], updated = state.metricUpdatedAt && state.metricUpdatedAt[key];
                check(key === 'registration' ? value === null || time(value) : value === null || integer(value), 'Métrica inválida: ' + key);
                check(optionalTime(updated), 'Horário da métrica inválido: ' + key);
                check(value === null || updated !== null, 'Métrica sem horário: ' + key);
            });
            check(Array.isArray(state.errors) && state.errors.length <= 100 && Array.from(state.errors).every(function (e) { return typeof e === 'string' && e.length <= 300; }), 'Erros inválidos.');
            check(typeof state.pending === 'boolean', 'Fila inválida.');
            check(object(state.projects) && Object.keys(state.projects).length <= MAX_PROJECTS, 'Projetos inválidos.');
            Object.keys(state.projects || {}).forEach(function (key) {
                var p = state.projects[key];
                check(projectKey(key) && object(p) && p.url === allowedOrigin(p.url) && integer(p.editcount), 'Projeto inválido.');
                ['thanks', 'articles'].forEach(function (field) { check(p[field] === null || integer(p[field]), 'Contagem de projeto inválida.'); check(optionalTime(p[field + 'At']), 'Horário de projeto inválido.'); });
                if (p.thanksScan) {
                    var scan = p.thanksScan;
                    check(object(scan) && time(scan.anchorAt) && Array.isArray(scan.logids) && scan.logids.length <= MAX_LOGS && Array.from(scan.logids).every(positive) && new Set(scan.logids).size === scan.logids.length, 'Fila de agradecimentos inválida.');
                    check(Array.isArray(scan.seen) && scan.seen.length <= 2000 && Array.from(scan.seen).every(function (s) { return typeof s === 'string' && s.length > 0 && s.length <= 1024; }) && new Set(scan.seen).size === scan.seen.length, 'Cursores inválidos.');
                    check(scan.continuation === null || object(scan.continuation) && typeof scan.continuation.lecontinue === 'string' && scan.continuation.lecontinue.length > 0 && scan.continuation.lecontinue.length <= 1024 &&
                        Object.keys(scan.continuation).every(function (k) { return k === 'lecontinue' || k === 'continue'; }) && (!own(scan.continuation, 'continue') || typeof scan.continuation.continue === 'string'), 'Continuação inválida.');
                }
            });
            check(object(state.pageInfo) && Object.keys(state.pageInfo).length <= MAX_PAGES, 'Metadados inválidos.');
            Object.keys(state.pageInfo || {}).forEach(function (key) {
                var p = state.pageInfo[key];
                check(/^[1-9]\d*$/.test(key) && positive(Number(key)) && object(p) && p.pageid === Number(key) && time(p.checkedAt) && typeof p.missing === 'boolean' && typeof p.redirect === 'boolean', 'Página inválida.');
                if (!p.missing) { check(integer(p.ns) && typeof p.title === 'string' && p.title.length > 0 && p.title.length <= 1024 && typeof p.contentmodel === 'string' && p.contentmodel.length > 0 && p.contentmodel.length <= 128, 'Tipo de página inválido.'); }
            });
            if (state.global) {
                var global = state.global;
                check(object(global) && time(global.infoAt) && time(global.anchorAt) && optionalTime(global.thanksCompleteAt) && integer(global.editcount) && Array.isArray(global.accountKeys) && global.accountKeys.length <= MAX_PROJECTS && new Set(global.accountKeys).size === global.accountKeys.length && Array.from(global.accountKeys).every(function (k) { return projectKey(k) && own(state.projects, k); }), 'Fotografia global inválida.');
            }
            ['metadataScan', 'articlesScan'].forEach(function (key) {
                var scan = state[key];
                if (scan) { check(object(scan) && time(scan.anchorAt) && typeof scan.force === 'boolean' && typeof scan.complete === 'boolean', 'Conferência pendente inválida.'); }
            });
        } catch (_) { errors.push('Cache inválido.'); }
        return { valid: errors.length === 0, errors: errors };
    }
    function validateHistory(history, user, now) {
        if (!history || history.user !== user || history.project !== PROJECT || history.complete !== true || !Array.isArray(history.entries) || history.entries.length > 2000000 || !validTime(history.capturedAt, now)) { throw new Error('Histórico local completo indisponível.'); }
        var seen = new Map();
        Array.from(history.entries).forEach(function (entry) {
            if (!Array.isArray(entry) || entry.length !== 9 || !positive(entry[0]) || !integer(entry[1]) || !integer(entry[2]) || typeof entry[3] !== 'string' || !entry[3] || entry[3].length > 1024 || !validTime(entry[4], now) ||
                (entry[5] !== 0 && entry[5] !== 1) || !integer(entry[6]) || entry[7] !== user || !Array.isArray(entry[8]) || entry[8].length > 500 || Array.from(entry[8]).some(function (t) { return typeof t !== 'string' || !t || t.length > 255; })) { throw new Error('Provas do histórico local inválidas.'); }
            var previous = seen.get(entry[0]);
            if (previous && JSON.stringify(previous) !== JSON.stringify(entry)) { throw new Error('Revisão com provas conflitantes.'); }
            seen.set(entry[0], entry);
        });
        return Array.from(seen.values());
    }
    function articleCount(data, user, host) {
        responseData(data);
        if (data.username !== user || data.project !== host || Number(data.namespace) !== 0 || data.redirects !== 'noredirects' || data.deleted !== 'all' || !object(data.counts)) { throw new Error('Resposta do XTools inválida.'); }
        if (!Object.keys(data.counts).length) { return 0; }
        if (!data.counts['0'] || !integer(data.counts['0'].count)) { throw new Error('Total de artigos incompleto.'); }
        return data.counts['0'].count;
    }
    async function collect(options) {
        options = options || {};
        var user = options.user, date = options.now === undefined ? new Date() : new Date(options.now), nowMs = date.getTime();
        if (!username(user) || !Number.isFinite(nowMs) || typeof options.requestJson !== 'function') { throw new Error('Usuário, horário ou transporte inválido.'); }
        var now = date.toISOString(), limit = options.maxRequests === undefined ? 20 : options.maxRequests;
        if (!Number.isInteger(limit) || limit < 1 || limit > 1000) { throw new Error('Orçamento de consultas inválido.'); }
        var state = options.previous && validate(options.previous, { user: user, now: now }).valid ? clone(options.previous) : blank(user, now);
        state.capturedAt = now; state.errors = []; state.pending = false;
        var remaining = limit;
        function error(label) { if (state.errors.length < 100 && state.errors.indexOf(label) < 0) { state.errors.push(label); } }
        function setMetric(key, value, at) { state.metrics[key] = value; state.metricUpdatedAt[key] = at || now; }
        async function request(url) { if (!remaining) { throw new Error('Orçamento esgotado.'); } remaining -= 1; return responseData(await options.requestJson(url)); }
        var entries = null;
        try { entries = validateHistory(options.history, user, nowMs); }
        catch (_) { error('Histórico local completo indisponível'); }
        var activity = options.activity;
        if (activity && activity.complete && activity.identity && activity.identity.user === user && activity.identity.project === PROJECT && validTime(activity.capturedAt, nowMs) && activity.summary && integer(activity.summary.bestStreak)) {
            setMetric('bestStreak', activity.summary.bestStreak, activity.capturedAt);
        }
        if (entries) {
            setMetric('reverts', entries.filter(function (entry) { return entry[8].some(function (tag) { return ['mw-rollback', 'mw-undo', 'mw-manual-revert'].indexOf(tag) >= 0; }); }).length, options.history.capturedAt);
        }
        var needsGlobal = !state.global || state.global.thanksCompleteAt && (options.force || nowMs - Date.parse(state.global.infoAt) >= GLOBAL_TTL);
        if (needsGlobal) {
            if (!remaining) { state.pending = true; }
            else {
                try {
                    var data = await request(queryUrl('https://' + PROJECT, { meta: 'globaluserinfo', guiuser: user, guiprop: 'editcount|merged' }));
                    var info = data.query && data.query.globaluserinfo;
                    if (!info || info.name !== user || !integer(info.editcount) || !Array.isArray(info.merged) || info.merged.length > MAX_PROJECTS || info.editcount > 0 && !info.merged.length || !completed(data)) { throw new Error('Identidade global incompleta.'); }
                    var projects = {}, keys = [];
                    Array.from(info.merged).forEach(function (account) {
                        if (!account || !projectKey(account.wiki) || own(projects, account.wiki) || !integer(account.editcount)) { throw new Error('Projeto global inválido.'); }
                        var origin = allowedOrigin(account.url), old = state.projects[account.wiki];
                        var p = old && old.url === origin ? clone(old) : { url: origin, editcount: 0, thanks: null, thanksAt: null, articles: null, articlesAt: null, thanksScan: null };
                        p.editcount = account.editcount;
                        // This optimization only reuses a previously verified zero.
                        if (p.editcount === 0 && p.thanks === 0) { p.thanksAt = now; p.thanksScan = null; }
                        else { p.thanksScan = { anchorAt: now, logids: [], continuation: null, seen: [] }; }
                        projects[account.wiki] = p; keys.push(account.wiki);
                    });
                    state.projects = projects;
                    state.global = { anchorAt: now, infoAt: now, editcount: info.editcount, accountKeys: keys.sort(), thanksCompleteAt: null };
                    setMetric('edits', info.editcount);
                } catch (_) { error('Contribuições globais'); }
            }
        }
        if (!state.metricUpdatedAt.registration || options.force || nowMs - Date.parse(state.metricUpdatedAt.registration) >= DAY) {
            if (remaining) {
                try {
                    var local = await request(queryUrl('https://' + PROJECT, { list: 'users', ususers: user, usprop: 'registration' }));
                    var users = local.query && local.query.users;
                    if (!completed(local) || !Array.isArray(users) || users.length !== 1 || users[0].name !== user || flag(users[0], 'missing') || flag(users[0], 'invalid') || (users[0].registration !== null && !validTime(users[0].registration, nowMs))) { throw new Error('Inscrição local inválida.'); }
                    setMetric('registration', users[0].registration);
                } catch (_) { error('Data de ingresso na ptwiki'); }
            } else { state.pending = true; }
        }
        var pageids = entries ? Array.from(new Set(entries.map(function (entry) { return entry[1]; }).filter(positive))).sort(function (a, b) { return a - b; }) : [];
        if (pageids.length > MAX_PAGES) { error('Limite de páginas locais excedido'); entries = null; }
        if (entries) {
            var wanted = new Set(pageids);
            Object.keys(state.pageInfo).forEach(function (id) { if (!wanted.has(Number(id))) { delete state.pageInfo[id]; } });
            var meta = state.metadataScan;
            if (!meta || meta.complete) { meta = state.metadataScan = { anchorAt: now, force: !!options.force, complete: false }; }
            var threshold = Date.parse(meta.anchorAt) - (meta.force ? 0 : DAY);
            var missing = pageids.filter(function (id) { return !state.pageInfo[id] || Date.parse(state.pageInfo[id].checkedAt) < threshold; });
            var metadataBudget = Math.min(remaining, Math.max(1, Math.ceil(remaining / 3)));
            while (missing.length && metadataBudget > 0 && remaining > 0) {
                var chunk = missing.slice(0, 50); metadataBudget -= 1;
                try {
                    var response = await request(queryUrl('https://' + PROJECT, { prop: 'info', pageids: chunk.join('|') }));
                    var pages = response.query && response.query.pages;
                    if (!completed(response) || !Array.isArray(pages) || pages.length !== chunk.length) { throw new Error('Metadados incompletos.'); }
                    var expected = new Set(chunk), checked = [];
                    Array.from(pages).forEach(function (page) {
                        if (!page || !expected.delete(page.pageid) || flag(page, 'invalid') || own(page, 'missing') && typeof page.missing !== 'boolean' || own(page, 'redirect') && typeof page.redirect !== 'boolean') { throw new Error('Página inesperada.'); }
                        var record = { pageid: page.pageid, checkedAt: now, missing: flag(page, 'missing'), redirect: flag(page, 'redirect') };
                        if (!record.missing) {
                            if (!integer(page.ns) || typeof page.title !== 'string' || !page.title || page.title.length > 1024 || typeof page.contentmodel !== 'string' || !page.contentmodel || page.contentmodel.length > 128) { throw new Error('Tipo de página incompleto.'); }
                            record.ns = page.ns; record.title = page.title; record.contentmodel = page.contentmodel;
                        }
                        checked.push(record);
                    });
                    checked.forEach(function (page) { state.pageInfo[page.pageid] = page; });
                    missing = missing.slice(chunk.length);
                } catch (_) { error('Situação atual das páginas da ptwiki'); break; }
            }
            meta.complete = missing.length === 0;
            if (meta.complete) {
                var localEvidenceAt = new Date(pageids.reduce(function (oldest, id) { return Math.min(oldest, Date.parse(state.pageInfo[id].checkedAt)); }, Date.parse(options.history.capturedAt))).toISOString();
                setMetric('edited', pageids.filter(function (id) { var p = state.pageInfo[id]; return !p.missing && !p.redirect && p.ns === 0; }).length, localEvidenceAt);
                var creations = new Set(entries.filter(function (e) { return e[5] === 1 && e[6] === 0 && e[7] === user && e[1] > 0; }).map(function (e) { return e[1]; }));
                setMetric('technicalCreated', Array.from(creations).filter(function (id) { return !!technicalKind(state.pageInfo[id]); }).length, localEvidenceAt);
            } else { state.pending = true; }
        }
        var global = state.global;
        if (global) {
            var thanksBudget = Math.min(remaining, Math.max(1, Math.ceil(remaining / 2)));
            for (var index = 0; index < global.accountKeys.length && thanksBudget > 0 && remaining > 0; index += 1) {
                var key = global.accountKeys[index], project = state.projects[key], scan = project.thanksScan;
                if (!scan) { continue; }
                while (scan && thanksBudget > 0 && remaining > 0) {
                    thanksBudget -= 1;
                    try {
                        var params = Object.assign({ list: 'logevents', letype: 'thanks', letitle: 'User:' + user, leprop: 'ids|type|timestamp', lelimit: 500, ledir: 'older', lestart: scan.anchorAt }, scan.continuation || {});
                        var logs = await request(queryUrl(project.url, params)), events = logs.query && logs.query.logevents;
                        if (!Array.isArray(events)) { throw new Error('Agradecimentos incompletos.'); }
                        var ids = new Set(scan.logids), added = 0;
                        Array.from(events).forEach(function (event) {
                            if (!event || event.type !== 'thanks' || !positive(event.logid) || !validTime(event.timestamp, Date.parse(scan.anchorAt))) { throw new Error('Agradecimento inválido.'); }
                            if (!ids.has(event.logid)) { ids.add(event.logid); added += 1; }
                        });
                        if (ids.size > MAX_LOGS) { throw new Error('Limite do histórico de agradecimentos excedido.'); }
                        var continuation = null, seen = scan.seen.slice();
                        if (logs.continue) {
                            var c = logs.continue;
                            if (!object(c) || typeof c.lecontinue !== 'string' || !c.lecontinue || c.lecontinue.length > 1024 || seen.indexOf(c.lecontinue) >= 0 || !added || seen.length >= 2000 ||
                                Object.keys(c).some(function (k) { return k !== 'continue' && k !== 'lecontinue'; }) || own(c, 'continue') && typeof c.continue !== 'string') { throw new Error('Paginação de agradecimentos inválida.'); }
                            continuation = { lecontinue: c.lecontinue }; if (own(c, 'continue')) { continuation.continue = c.continue; } seen.push(c.lecontinue);
                        } else if (!completed(logs)) { throw new Error('Agradecimentos sem conclusão.'); }
                        scan.logids = Array.from(ids); scan.seen = seen; scan.continuation = continuation;
                        if (!continuation) { project.thanks = ids.size; project.thanksAt = scan.anchorAt; project.thanksScan = null; scan = null; }
                    } catch (failure) {
                        var detail = String(failure && (failure.detail || failure.message) || '');
                        if (key === 'loginwiki' && (failure.unsupportedThanks || /thanks/i.test(detail) && /badvalue|unrecognized/i.test(String(failure.code || '') + detail))) {
                            project.thanks = 0; project.thanksAt = scan.anchorAt; project.thanksScan = null;
                        } else { error('Agradecimentos: ' + key); }
                        break;
                    }
                }
            }
            var thanksComplete = global.accountKeys.every(function (key) { var p = state.projects[key]; return !p.thanksScan && integer(p.thanks) && validTime(p.thanksAt, nowMs) && Date.parse(p.thanksAt) >= Date.parse(global.anchorAt); });
            if (thanksComplete) { setMetric('thanks', safeSum(global.accountKeys.map(function (key) { return state.projects[key].thanks; })), global.anchorAt); if (!global.thanksCompleteAt) { global.thanksCompleteAt = now; } }
            else { state.pending = true; }
            var wikipediaKeys = global.accountKeys.filter(function (key) { return key !== 'testwiki' && key !== 'test2wiki' && new URL(state.projects[key].url).hostname.endsWith('.wikipedia.org'); });
            var articleScan = state.articlesScan;
            if (!articleScan || articleScan.complete) { articleScan = state.articlesScan = { anchorAt: now, force: !!options.force, complete: false }; }
            var articlesThreshold = Date.parse(articleScan.anchorAt) - (articleScan.force ? 0 : DAY);
            var articlePending = wikipediaKeys.filter(function (key) { var p = state.projects[key]; return p.articles === null || !p.articlesAt || Date.parse(p.articlesAt) < articlesThreshold; });
            for (var a = 0; a < articlePending.length && remaining > 0; a += 1) {
                var wiki = articlePending[a], p = state.projects[wiki], host = new URL(p.url).hostname;
                try {
                    var count = articleCount(await request('https://xtools.wmcloud.org/api/user/pages_count/' + encodeURIComponent(host) + '/' + encodeURIComponent(user) + '/0/noredirects/all'), user, host);
                    p.articles = count; p.articlesAt = now;
                } catch (_) { error('Artigos criados: ' + wiki); }
            }
            articleScan.complete = wikipediaKeys.every(function (key) { var p = state.projects[key]; return integer(p.articles) && p.articlesAt && Date.parse(p.articlesAt) >= articlesThreshold; });
            if (articleScan.complete) {
                var articlesEvidenceAt = new Date(wikipediaKeys.reduce(function (oldest, key) { return Math.min(oldest, Date.parse(state.projects[key].articlesAt)); }, Date.parse(global.infoAt))).toISOString();
                setMetric('articles', safeSum(wikipediaKeys.map(function (key) { return state.projects[key].articles; })), articlesEvidenceAt);
            }
            else { state.pending = true; }
        } else { state.pending = true; }
        state.errors.sort();
        var checkedState = validate(state, { user: user, now: now });
        if (!checkedState.valid) { throw new Error('As estatísticas coletadas são inválidas: ' + checkedState.errors.join(' ')); }
        return state;
    }
    return Object.freeze({ collect: collect, validate: validate, technicalKind: technicalKind, technicalSubpageExcluded: technicalSubpageExcluded, articleCount: articleCount, allowedOrigin: allowedOrigin });
}));

;

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

;

/* Dados opcionais de apresentação. Não altera métricas nem publica edições. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiPresenter = api; }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';
    var DAY = 86400000;
    var periods = ['30d', '90d', '12m', 'since'];
    var relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' });
    var absolute = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
    function timestamp(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
        var date = new Date(value);
        if (!Number.isFinite(date.getTime()) || date.toISOString().replace('.000Z', 'Z') !== value.replace('.000Z', 'Z')) { return null; }
        return date.toISOString();
    }
    function nowValue(value) {
        var result = value === undefined ? Date.now() : new Date(value).getTime();
        return Number.isFinite(result) ? result : null;
    }
    function lastEditAt(state) {
        var activity = state && state.activity;
        var entries = activity && Array.isArray(activity.entries) ? activity.entries : [];
        var latest = null;
        entries.forEach(function (entry) {
            var raw = Array.isArray(entry) && entry[4];
            // ISO dates sort chronologically. Most histories already start with
            // the newest edit, so avoid parsing every older date on each paint.
            if (typeof raw !== 'string' || latest && raw <= latest) { return; }
            var value = timestamp(raw);
            if (value && (!latest || value > latest)) { latest = value; }
        });
        return latest || timestamp(activity && activity.summary && activity.summary.lastEditAt);
    }
    function relativeTime(value, now) {
        var stamp = timestamp(value), reference = nowValue(now);
        if (!stamp || reference === null || Date.parse(stamp) > reference + 60000) { return null; }
        var seconds = Math.max(0, Math.floor((reference - Date.parse(stamp)) / 1000));
        if (seconds < 60) { return 'há menos de 1 minuto'; }
        if (seconds < 3600) { return relative.format(-Math.floor(seconds / 60), 'minute'); }
        if (seconds < 86400) { return relative.format(-Math.floor(seconds / 3600), 'hour'); }
        return relative.format(-Math.floor(seconds / 86400), 'day');
    }
    function absoluteTime(value) {
        var stamp = timestamp(value);
        return stamp ? absolute.format(new Date(stamp)) + ' UTC' : null;
    }
    function featuredArticles(state) {
        var data = state && state.pageviews;
        var seen = new Set(), articles = [];
        periods.forEach(function (key) {
            var profile = data && data.periods && data.periods[key];
            var previous = data && data.lastCompleteSnapshot && data.lastCompleteSnapshot.periods && data.lastCompleteSnapshot.periods[key];
            var displayed = profile && !profile.complete && (profile.lastCompleteSnapshot || previous) || profile;
            var rows = displayed && Array.isArray(displayed.rows) ? displayed.rows : [];
            rows.slice().sort(function (a, b) {
                return (b.views == null ? -1 : b.views) - (a.views == null ? -1 : a.views) || String(a.title).localeCompare(String(b.title), 'pt');
            }).slice(0, 10).forEach(function (row) {
                if (Number.isSafeInteger(row.pageid) && row.pageid > 0 && typeof row.title === 'string' && row.title.length > 0 && row.title.length <= 512 && !seen.has(row.pageid)) {
                    seen.add(row.pageid); articles.push({ pageid: row.pageid, title: row.title });
                }
            });
        });
        return articles;
    }
    function imageRequest(articles) {
        if (!Array.isArray(articles) || !articles.length || articles.length > 40 || articles.some(function (row) { return !row || !Number.isSafeInteger(row.pageid) || row.pageid <= 0; })) { return null; }
        var url = new URL('https://pt.wikipedia.org/w/api.php');
        var parameters = { action: 'query', format: 'json', formatversion: '2', origin: '*', prop: 'pageimages', piprop: 'thumbnail|name', pilicense: 'free', pithumbsize: '96', pilimit: '50', pageids: articles.map(function (row) { return row.pageid; }).join('|') };
        Object.keys(parameters).forEach(function (key) { url.searchParams.set(key, parameters[key]); });
        return url.href;
    }
    function safeFile(value) {
        return typeof value === 'string' && value.length > 0 && value.length <= 512 && value.trim() === value && !/[\u0000-\u001f\u007f\u2028\u2029\[\]{}|<>#%:\\/]/.test(value) && /\.(?:jpe?g|png|gif|webp|svg|tiff?|avif)$/i.test(value);
    }
    function imageSource(value) {
        try {
            if (typeof value !== 'string' || value.length > 4096) { return null; }
            var url = new URL(value);
            if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash || ['upload.wikimedia.org', 'thumb.wikimedia.org'].indexOf(url.hostname) < 0 ||
                !/^\/wikipedia\/(?:commons|pt)\/thumb\/[a-f0-9]\/[a-f0-9]{2}\/[^/]+\/[^/]+$/.test(url.pathname) || /[\u0000-\u001f\u007f\\]/.test(decodeURIComponent(url.pathname))) { return null; }
            var safe = true;
            url.searchParams.forEach(function (_, key) { if (['utm_source', 'utm_campaign', 'utm_content'].indexOf(key) < 0) { safe = false; } });
            if (!safe) { return null; }
            url.search = '';
            return url.href;
        } catch (_) { return null; }
    }
    function validateImage(page, capturedAt) {
        var stamp = timestamp(capturedAt);
        if (!page || !stamp || !Number.isSafeInteger(page.pageid) || page.pageid <= 0 || page.ns !== 0 || typeof page.title !== 'string' || !page.title || page.title.length > 512 ||
            !safeFile(page.pageimage) || !page.thumbnail || !Number.isSafeInteger(page.thumbnail.width) || page.thumbnail.width < 1 || page.thumbnail.width > 4096 ||
            !Number.isSafeInteger(page.thumbnail.height) || page.thumbnail.height < 1 || page.thumbnail.height > 4096) { return null; }
        var src = imageSource(page.thumbnail.source);
        return src ? { pageid: page.pageid, title: page.title, file: page.pageimage, src: src, capturedAt: stamp } : null;
    }
    function normalizeImages(raw, now) {
        var result = Object.create(null), reference = nowValue(now);
        if (!raw || typeof raw !== 'object' || Array.isArray(raw) || reference === null || Object.keys(raw).length > 80) { return result; }
        Object.keys(raw).forEach(function (key) {
            var entry = raw[key];
            if (!entry || String(entry.pageid) !== key || !Number.isSafeInteger(entry.pageid) || entry.pageid <= 0 || !timestamp(entry.capturedAt) ||
                Date.parse(entry.capturedAt) > reference + 60000 || reference - Date.parse(entry.capturedAt) >= 7 * DAY) { return; }
            var normalized = validateImage({ pageid: entry.pageid, ns: 0, title: entry.title, pageimage: entry.file, thumbnail: { source: entry.src, width: 96, height: 96 } }, entry.capturedAt);
            if (normalized) { result[key] = normalized; }
        });
        return result;
    }
    function imageFor(images, row) {
        var image = images && row && images[row.pageid];
        if (!image || image.pageid !== row.pageid || image.title !== row.title || !safeFile(image.file) || !imageSource(image.src) || !timestamp(image.capturedAt)) { return null; }
        return image;
    }
    return Object.freeze({ lastEditAt: lastEditAt, relativeTime: relativeTime, absoluteTime: absoluteTime, featuredArticles: featuredArticles,
        imageRequest: imageRequest, validateImage: validateImage, normalizeImages: normalizeImages, imageFor: imageFor });
}));

;

/* Interface do painel Atividade na Wikipédia. Nenhuma requisição ou edição. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Presenter.js') : root.PerfilWikiPresenter);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiActivityView = api; }
}(typeof window !== 'undefined' ? window : this, function (presenter) {
    'use strict';
    var palette = ['#eaecf0', '#d6e7ff', '#9fc5ff', '#5c99ee', '#3366cc'];
    var months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    var weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    var numberFormatter = new Intl.NumberFormat('pt-BR');
    function escape(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function number(value) { return Number.isSafeInteger(value) ? numberFormatter.format(value) : 'Aguardando dados'; }
    function shortDate(value) {
        var p = value.split('-').map(Number);
        return p[2] + ' ' + months[p[1] - 1];
    }
    function range(period) {
        return shortDate(period.start) + (period.start.slice(0, 4) !== period.end.slice(0, 4) ? ' de ' + period.start.slice(0, 4) : '') + ' a ' + shortDate(period.end) + ' de ' + period.end.slice(0, 4);
    }
    function wikiLink(title, label, wiki, external) {
        if (wiki && !external) {
            // Titles are public API titles. Escape parser delimiters defensively.
            return '[[' + title.replace(/[\[\]{}|<>\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + '|' + escape(label).replace(/[\[\]{}|\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + ']]';
        }
        var href = external || 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
        return wiki ? '[' + href + ' ' + escape(label) + ']' : '<a href="' + escape(href) + '" style="color:#36c;text-decoration:none;">' + escape(label) + '</a>';
    }
    function streakGoal(current, best) {
        var goals = [7, 14, 30, 45, 60, 90, 100, 150, 200, 250, 365, 500, 730, 1000];
        var maximum = Math.max(current, best || 0);
        while (goals[goals.length - 1] <= maximum) { goals.push(goals[goals.length - 1] + 365); }
        var nextIndex = goals.findIndex(function (days) { return days > current; });
        var earned = goals.filter(function (days) { return days <= maximum; });
        return { current: current, next: goals[nextIndex], following: goals[nextIndex + 1] || goals[nextIndex] + 365,
            achieved: earned.length ? earned[earned.length - 1] : 0,
            remaining: goals[nextIndex] - current, percent: Math.min(100, current / goals[nextIndex] * 100) };
    }
    function render(state, wiki, allRows) {
        var a = state.activity && state.activity.summary;
        var p = state.pageviews;
        var user = state.config && state.config.user || '';
        var activityZone = state.config && state.config.timeZone || 'UTC';
        var presentation = allRows && typeof allRows === 'object' ? allRows : {};
        if (!a) { return '<div id="dan-pu-ritmo">As estatísticas ainda não foram consultadas.</div>'; }
        var h = [];
        h.push('<div id="dan-pu-ritmo" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-project="pt.wikipedia.org" style="clear:both;box-sizing:border-box;margin:2.1em 0;padding:24px;border:1px solid #c8ccd1;border-radius:12px;background:#fff;color:#202122;font-size:14px;line-height:1.5;">');
        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:20px;margin-bottom:25px;">');
        var lastEdit = presenter && presenter.lastEditAt(state);
        var lastExact = lastEdit && presenter.absoluteTime(lastEdit);
        var lastLabel = wiki ? lastExact : lastEdit && presenter.relativeTime(lastEdit, presentation.now);
        h.push('<div style="flex:1 1 300px;min-width:0;"><div style="font-family:Georgia,serif;font-size:29px;font-weight:bold;line-height:1.2;margin-bottom:7px;">Atividade na Wikipédia</div><div style="color:#54595d;font-size:16px;">' + escape(user) + '</div>');
        h.push('<div class="dan-pu-last-edit-line" style="margin-top:10px;color:#54595d;font-size:12px;">' + (wiki ? 'Última edição consultada' : 'Última edição') + ' · <span class="dan-pu-last-edit" data-live="' + (wiki ? 'false' : 'true') + '"' + (lastEdit ? ' data-timestamp="' + escape(lastEdit) + '" title="' + escape(lastExact) + '"' : '') + '>' + escape(lastLabel || (lastEdit ? 'Horário indisponível' : 'Nenhuma edição encontrada')) + '</span></div></div>');
        var goal = streakGoal(a.currentStreak, a.bestStreak);
        // Wikipedia removes numeric ARIA attributes from saved markup. A static
        // image label preserves the full value for visitors; the owner's live
        // DOM uses the native progressbar semantics.
        var goalAria = wiki ? 'role="img" aria-label="' + a.currentStreak + ' de ' + goal.next + ' dias seguidos, faltam ' + goal.remaining + ' dias"' :
            'role="progressbar" aria-label="Meta de dias seguidos" aria-valuemin="0" aria-valuemax="' + goal.next + '" aria-valuenow="' + a.currentStreak + '"';
        h.push('<div style="flex:1 1 300px;background:#faf7ef;border-radius:10px;padding:16px 20px;">');
        h.push('<div style="display:flex;align-items:center;gap:24px;"><div style="flex:1;"><div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(a.currentStreak) + '</div><div style="color:#54595d;">dias seguidos</div></div><div style="flex:1.5;min-width:140px;"><div style="color:#54595d;font-size:12px;">Próxima meta</div><div style="font-size:24px;font-weight:700;line-height:1.4;">' + number(goal.next) + ' dias</div><div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#54595d;margin:4px 0;">' + number(a.currentStreak) + ' de ' + number(goal.next) + '<span>Faltam ' + number(goal.remaining) + '</span></div><div ' + goalAria + ' style="height:7px;border-radius:4px;background:#e5e1d7;overflow:hidden;"><div style="height:7px;width:' + goal.percent.toFixed(2) + '%;background:#36c;border-radius:4px;"></div></div></div></div>');
        h.push('<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:13px;padding-top:11px;border-top:1px solid #e5e1d7;font-size:12px;"><span style="color:#246342;font-weight:600;">' + (goal.achieved ? '✓ ' + number(goal.achieved) + ' dias alcançados' : 'Seu primeiro marco: 7 dias') + '</span><span style="color:#54595d;">Depois: ' + number(goal.following) + ' dias</span></div></div></div>');
        h.push('<div style="border:1px solid #d8dce3;border-radius:10px;padding:18px;margin-bottom:20px;">');
        h.push('<div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:7px 14px;margin-bottom:18px;"><strong style="font-family:Georgia,serif;font-size:20px;">12 semanas</strong><span style="color:#54595d;">' + shortDate(a.gridStart) + ' a ' + shortDate(a.today) + '</span><span style="margin-left:auto;color:#54595d;font-size:12px;">Edições por dia</span></div>');
        var weeks = a.weeks;
        var max = Math.max.apply(null, weeks.flatMap(function (w) { return w.days.map(function (d) { return d.count || 0; }); }));
        var legend = palette.map(function (color) { return '<span style="display:inline-block;width:15px;height:15px;border-radius:3px;background:' + color + ';vertical-align:middle;"></span>'; }).join(' ');
        h.push('<div style="overflow-x:auto;"><div style="min-width:240px;display:grid;grid-template-columns:28px 1fr;gap:8px;">');
        h.push('<div style="display:grid;grid-template-rows:repeat(7,24px);gap:3px;font-size:11px;color:#54595d;">' + weekdays.map(function (d) { return '<span style="display:flex;align-items:center;">' + d + '</span>'; }).join('') + '</div>');
        h.push('<div role="img" aria-label="' + escape(a.edits30 + ' edições em ' + a.activeDays30 + ' dos últimos 30 dias. Fuso ' + activityZone + '.') + '" style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));grid-template-rows:repeat(7,24px);grid-auto-flow:column;gap:3px;">');
        weeks.forEach(function (week) {
            week.days.forEach(function (day) {
                var bucket = !day.count ? 0 : Math.max(1, Math.min(4, Math.ceil(Math.log(1 + day.count) / Math.log(1 + Math.max(2, max)) * 4)));
                var label = day.future ? shortDate(day.date) + ', dia ainda não concluído' : shortDate(day.date) + ': ' + number(day.count) + ' edições';
                h.push('<span data-date="' + day.date + '" data-count="' + day.count + '" title="' + escape(label) + '" style="display:block;border-radius:3px;background:' + (day.future ? '#f8f9fa' : palette[bucket]) + ';' + (day.date === a.today ? 'outline:2px solid #202122;outline-offset:1px;' : '') + '"></span>');
            });
        });
        h.push('</div><span></span><div style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));gap:3px;font-size:9px;color:#54595d;">' + weeks.map(function (w) { var date = w.start.split('-').map(Number); return '<span style="text-align:center;white-space:nowrap;">' + date[2] + '/' + date[1] + '</span>'; }).join('') + '</div></div></div>');
        h.push('<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:17px;font-size:12px;color:#54595d;"><span>' + number(a.edits30) + ' edições · ' + number(a.articles30) + ' artigos diferentes editados nos últimos 30 dias</span><span>Nenhuma ' + legend + ' Mais edições</span></div></div>');
        h.push('<div class="dan-pu-readership" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-project="pt.wikipedia.org" data-metric-version="after-first-edit-v1" data-total-model="all-periods-all-eligible-v1" style="border:1px solid #d8dce3;border-radius:10px;padding:18px;">');
        h.push('<div style="font-family:Georgia,serif;font-size:23px;font-weight:bold;line-height:1.25;margin-bottom:5px;">Visualizações dos artigos editados por ' + escape(user) + '.</div>');
        h.push('<div style="color:#54595d;font-size:12px;">Somente após sua primeira edição em cada artigo.</div>');
        var explanation = 'Os períodos somam as visitas recebidas depois da sua primeira edição em cada artigo. Os totais abrangem todos os artigos elegíveis, mesmo quando a lista mostra apenas uma parte. A contagem de visualizações começa no dia seguinte à primeira edição, em UTC. As sequências usam o fuso ' + escape(activityZone) + '. A última edição corresponde ao histórico consultado, que pode ter sido atualizado antes desta visita.';
        if (wiki) {
            h.push('<div class="dan-pu-data-help">' + wikiLink(presentation.documentationPage ? presentation.documentationPage + '#Como_os_dados_são_contados' : 'Usuário:Daniel G Rego/PerfilWiki#Como_os_dados_são_contados', 'Sobre estes dados', true) + '</div>');
        } else {
            h.push('<details class="dan-pu-data-help"><summary>Sobre estes dados</summary><div>' + explanation + '</div></details>');
        }
        var keys = ['30d', '90d', '12m', 'since'];
        var labels = { '30d': '30 dias', '90d': '90 dias', '12m': '12 meses', 'since': 'Total acumulado' };
        var titles = { '30d': 'Visualizações nos últimos 30 dias', '90d': 'Visualizações nos últimos 90 dias', '12m': 'Visualizações nos últimos 12 meses', 'since': 'Visualizações acumuladas' };
        keys.forEach(function (key) { h.push('<span id="dan-pu-view-' + key + '" class="dan-pu-view-target" aria-hidden="true"></span>'); });
        h.push('<div class="dan-pu-period-tabs plainlinks" role="navigation" aria-label="Período de visualizações">');
        keys.forEach(function (key) {
            h.push(wiki ? '<span id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '">[{{fullurl:{{FULLPAGENAME}}}}#dan-pu-view-' + key + ' ' + labels[key] + ']</span>' :
                '<a id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '" href="#dan-pu-view-' + key + '">' + labels[key] + '</a>');
        });
        h.push('</div>');
        keys.forEach(function (key) {
            var profile = p && p.periods && p.periods[key];
            var previousProfile = p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.periods && p.lastCompleteSnapshot.periods[key];
            var needsPrevious = profile && !profile.complete;
            var data = needsPrevious && (profile.lastCompleteSnapshot || previousProfile) || profile;
            // The display cap never changes the all-article totals or cached proofs.
            var rows = (data && data.rows || []).slice().sort(function (x, y) { return (y.views == null ? -1 : y.views) - (x.views == null ? -1 : x.views) || x.title.localeCompare(y.title, 'pt'); }).slice(0, 500);
            var eligible = data && data.proof && Number.isSafeInteger(data.proof.eligible) ? data.proof.eligible : (p && p.metadata && p.metadata.cohort ? p.metadata.cohort.length : 0);
            var requestedRows = allRows && allRows.visibleCounts && allRows.visibleCounts[key];
            var expanded = allRows === true || allRows && allRows.expanded && allRows.expanded[key];
            var visibleRows = Math.min(rows.length, expanded ? rows.length : Number.isSafeInteger(requestedRows) ? Math.max(10, requestedRows) : 10);
            var exact = !!data && data.rankingComplete;
            h.push('<div id="dan-pu-period-' + key + '" class="dan-pu-period dan-pu-period-' + key + '">');
            h.push('<div style="font-size:17px;font-weight:600;margin-bottom:8px;">' + titles[key] + '</div>');
            var totalExact = exact && data.complete && Number.isSafeInteger(data.allArticleTotal);
            if (totalExact) {
                h.push('<div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(data.allArticleTotal) + '</div>');
                h.push('<div style="color:#54595d;font-size:13px;margin:4px 0 10px;">nos ' + number(eligible) + ' artigos editados por você</div>');
            } else { h.push('<div style="color:#54595d;margin:4px 0 10px;">Somando as visualizações de todos os artigos editados.</div>'); }
            if (data && data.period) { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:4px;">' + (key === 'since' ? 'Até ' + shortDate(data.period.end) + ' de ' + data.period.end.slice(0, 4) : range(data.period)) + ' · UTC</div>'); }
            if (key === 'since' && data && data.proof && data.proof.truncatedArticles > 0) {
                h.push('<div style="color:#54595d;font-size:12px;margin-bottom:8px;">Histórico disponível desde 1 jul. de 2015. Artigos editados antes disso têm contagem parcial.</div>');
            }
            if (key !== 'since') { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:17px;">Todo o histórico · ' + number(eligible) + ' artigos editados</div>'); }
            if (rows.length) {
                var sorted = rows;
                h.push('<div style="display:flex;justify-content:space-between;gap:12px;padding-bottom:8px;border-bottom:1px solid #c8ccd1;color:#54595d;font-size:12px;"><span>' + (exact ? 'Artigo' : 'Ordem provisória') + '</span><span>Visualizações</span></div>');
                function renderRow(row, index) {
                    var countedFrom = row.countFromDate || data.period.start;
                    var details = 'https://pageviews.wmcloud.org/?project=pt.wikipedia.org&platform=all-access&agent=user&start=' + countedFrom + '&end=' + data.period.end + '&pages=' + encodeURIComponent(row.title.replace(/ /g, '_'));
                    var firstDate = key === 'since' && row.firstEditAt ? row.firstEditAt.slice(0, 10) : null;
                    var firstLabel = firstDate ? '<span class="dan-pu-view-first">Primeira edição: ' + shortDate(firstDate) + ' de ' + firstDate.slice(0, 4) + '</span>' : '';
                    var pending = '<span class="dan-pu-view-pending"><span aria-hidden="true">◷</span> Aguardando dados</span>';
                    var viewLabel = Number.isSafeInteger(row.views) ? countedFrom <= data.period.end ? wikiLink('', number(row.views), wiki, details) : number(row.views) : pending;
                    // Keep the rank as real text. CSS Grid positions it without
                    // a wrapper. The lifetime date stays outside the article link.
                    var articleLabel = wikiLink(row.title, row.title, wiki);
                    if (firstLabel) { articleLabel = '<span class="dan-pu-view-title">' + articleLabel + firstLabel + '</span>'; }
                    var linkedViews = Number.isSafeInteger(row.views) && countedFrom <= data.period.end;
                    if (!linkedViews) { viewLabel = '<span class="dan-pu-view-views">' + viewLabel + '</span>'; }
                    if (index < 10) {
                        var image = presenter && presenter.imageFor(presentation.images, row);
                        var picture = image ? (wiki ? '[[Ficheiro:' + image.file + '|48x48px|link=|alt=]]' : '<img class="dan-pu-thumb" src="' + escape(image.src) + '" alt="" width="48" height="48" loading="lazy" decoding="async" crossorigin="anonymous" referrerpolicy="no-referrer">') : '<span class="dan-pu-thumb-placeholder" aria-hidden="true">▧</span>';
                        h.push('<div class="dan-pu-view-row" data-layout="featured" data-shade="' + (index % 2 ? 'alternate' : 'plain') + '" style="display:grid;grid-template-columns:24px 48px minmax(0,1fr) max-content;column-gap:12px;">' +
                            '<span class="dan-pu-view-rank">' + (index + 1) + '</span><span class="dan-pu-view-image" aria-hidden="true" data-pageid="' + row.pageid + '" data-title="' + escape(row.title) + '">' + picture + '</span>' +
                            '<span class="dan-pu-featured-title">' + wikiLink(row.title, row.title, wiki) + firstLabel + '</span><span class="dan-pu-featured-views">' + viewLabel + '</span></div>');
                    } else {
                        h.push('<div class="dan-pu-view-row" data-layout="compact">' + (index + 1) + articleLabel + viewLabel + '</div>');
                    }
                }
                sorted.slice(0, wiki ? 10 : visibleRows).forEach(renderRow);
                if (sorted.length > 10) {
                    if (wiki) {
                        var stages = 0;
                        for (var start = 10; start < sorted.length; start += 100) {
                            var chunk = sorted.slice(start, start + 100);
                            h.push('<div class="dan-pu-native-more mw-collapsible mw-collapsed" data-expandtext="Mostrar mais ' + chunk.length + '" data-collapsetext="' + (start === 10 ? 'Mostrar só 10' : 'Ocultar esta etapa') + '"><div class="mw-collapsible-content">');
                            chunk.forEach(function (row, index) { renderRow(row, index + start); });
                            stages += 1;
                        }
                        for (var stage = 0; stage < stages; stage += 1) { h.push('</div></div>'); }
                    } else {
                        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:13px;">');
                        h.push('<span style="color:#54595d;font-size:12px;">Exibindo ' + number(visibleRows) + ' de ' + number(sorted.length) + ' artigos</span>');
                        if (visibleRows < sorted.length) {
                            h.push('<span id="dan-pu-ritmo-expand-' + key + '">' + wikiLink('Especial:Contribuições/' + user, 'Mostrar mais ' + Math.min(100, sorted.length - visibleRows), false) + '</span>');
                        }
                        if (visibleRows > 10) {
                            h.push('<span id="dan-pu-ritmo-collapse-' + key + '">' + wikiLink('Especial:Contribuições/' + user, 'Mostrar só 10', false) + '</span>');
                        }
                        h.push('</div>');
                    }
                }
            }
            if (profile && !profile.complete && p && p.progress) {
                h.push('<div role="status" style="margin-top:12px;color:#54595d;font-size:12px;">Consulta em andamento · ' + number(p.progress.collectedArticles || p.progress.checked || p.progress.available || 0) + ' artigos consultados</div>');
            }
            var stamp = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' }).format(new Date(data && data.capturedAt || (data !== profile && p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.capturedAt) || p && p.capturedAt || state.capturedAt));
            h.push('<div style="margin-top:15px;color:#54595d;font-size:11px;">Atualizado em ' + escape(stamp) + ' UTC</div></div>');
        });
        h.push('</div><div id="dan-pu-ritmo-install" style="margin-top:18px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;">Gostou deste painel? ' + wikiLink(presentation.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki', 'Veja como adicionar à sua página de usuário.', wiki) + '</div></div>');
        // Newlines between inline cells make the wiki parser insert a paragraph
        // inside the CSS grid. Keep the exported HTML fragment contiguous.
        return (wiki ? '<templatestyles src="' + escape(presentation.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos') + '" />' : '') + h.join('');
    }
    return Object.freeze({ streakGoal: streakGoal, html: function (s, all) { return render(s, false, all); }, wikitext: function (s, options) { return render(s, true, options || false); } });
}));

;

/* Reversible local JSON cache dictionary. No network, DOM, or wiki writes. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    if (root) { root.PerfilWikiCache = api; }
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';
    var FORMAT = 'dan-pu-cache-dictionary-v1';
    var PACKED_LIMIT = 4000000;
    var EXPANDED_LIMIT = 12000000;
    var DICTIONARY_LIMIT = 100000;
    var BLOCK_LIMIT = 4096;
    var SHORT_INDEX_LIMIT = 0xd700;
    var STRING_TOKEN = /"(?:[^"\\]|\\.)*"/g;
    function fail() { throw new Error('Invalid or oversized local cache dictionary.'); }
    function repeatedArrays(payload) {
        var starts = [], counts = new Map();
        for (var index = 0; index < payload.length; index += 1) {
            if (payload[index] === '[' || payload[index] === '{') {
                starts.push({ at: index, close: payload[index] === '[' ? ']' : '}' });
            } else if (payload[index] === ']' || payload[index] === '}') {
                var opening = starts.pop();
                if (!opening || opening.close !== payload[index]) { fail(); }
                var start = opening.at, length = index - start + 1;
                if (opening.close === ']' && length >= 2048 || opening.close === '}' && length >= 24 && length <= 512) {
                    var value = payload.slice(start, index + 1);
                    counts.set(value, (counts.get(value) || 0) + 1);
                }
            }
        }
        if (starts.length) { fail(); }
        var candidates = Array.from(counts.keys()).filter(function (value) { return value[0] === '[' && counts.get(value) > 1; }).sort(function (a, b) { return b.length - a.length; });
        var arrays = [];
        candidates.forEach(function (value) {
            if (arrays.length >= 128) { return; }
            var pieces = payload.split(value);
            if (pieces.length < 3) { return; }
            payload = pieces.join('$' + arrays.length.toString(36) + ';');
            arrays.push(value);
        });
        // Replace small repeated objects in one pass. Array blocks remain
        // nonrecursive, and their large contents are never rescanned per object.
        var objectCounts = new Map(), occurrences = [], stack = [];
        for (var at = 0; at < payload.length; at += 1) {
            var character = payload[at];
            if (character === '[' || character === '{') { stack.push({ at: at, close: character === '[' ? ']' : '}' }); }
            else if (character === ']' || character === '}') {
                var open = stack.pop();
                if (!open || open.close !== character) { fail(); }
                var size = at - open.at + 1;
                if (character === '}' && size >= 24 && size <= 512) {
                    var object = payload.slice(open.at, at + 1);
                    if (object.indexOf('$') < 0) {
                        objectCounts.set(object, (objectCounts.get(object) || 0) + 1);
                        occurrences.push({ start: open.at, end: at + 1, value: object });
                    }
                }
            }
        }
        if (stack.length) { fail(); }
        occurrences.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
        var pieces = [], cursor = 0, objectIndexes = new Map();
        occurrences.forEach(function (occurrence) {
            if (occurrence.start < cursor || objectCounts.get(occurrence.value) < 2) { return; }
            var index = objectIndexes.get(occurrence.value);
            if (index === undefined) {
                if (arrays.length >= BLOCK_LIMIT) { return; }
                index = arrays.length; arrays.push(occurrence.value); objectIndexes.set(occurrence.value, index);
            }
            pieces.push(payload.slice(cursor, occurrence.start), '$' + index.toString(36) + ';'); cursor = occurrence.end;
        });
        pieces.push(payload.slice(cursor)); payload = pieces.join('');
        return { payload: payload, arrays: arrays };
    }
    function packJson(raw) {
        if (typeof raw !== 'string' || raw.length > EXPANDED_LIMIT) { fail(); }
        if (raw.length <= 100000) { return raw; }
        JSON.parse(raw);
        var dictionary = [], indexes = new Map();
        var payload = raw.replace(STRING_TOKEN, function (token) {
            var index = indexes.get(token);
            if (index === undefined) {
                index = dictionary.length;
                if (index >= DICTIONARY_LIMIT) { fail(); }
                dictionary.push(token); indexes.set(token, index);
            }
            return index < SHORT_INDEX_LIMIT ? '@' + String.fromCharCode(0x100 + index) : '@!' + index.toString(36) + ';';
        });
        var repeated = repeatedArrays(payload);
        var packed = JSON.stringify({ format: FORMAT, encoding: 'unicode-index', dictionary: dictionary,
            arrays: repeated.arrays, payload: repeated.payload });
        if (packed.length > PACKED_LIMIT) { fail(); }
        return packed.length < raw.length ? packed : raw;
    }
    function unpack(raw, parsedValue) {
        if (typeof raw !== 'string' || raw.length > PACKED_LIMIT) { fail(); }
        var envelope = JSON.parse(raw);
        if (!envelope || envelope.format !== FORMAT) { return parsedValue ? envelope : raw; }
        if (!Array.isArray(envelope.dictionary) || envelope.dictionary.length > DICTIONARY_LIMIT || typeof envelope.payload !== 'string') { fail(); }
        envelope.dictionary.forEach(function (token) {
            if (typeof token !== 'string' || token[0] !== '"' || token[token.length - 1] !== '"' || typeof JSON.parse(token) !== 'string') { fail(); }
        });
        if (envelope.encoding !== 'unicode-index' && envelope.encoding !== undefined) { fail(); }
        var payload = envelope.payload;
        if (envelope.arrays !== undefined) {
            if (!Array.isArray(envelope.arrays) || envelope.arrays.length > BLOCK_LIMIT) { fail(); }
            envelope.arrays.forEach(function (array) {
                if (typeof array !== 'string' || !((array[0] === '[' && array[array.length - 1] === ']') ||
                    (array[0] === '{' && array[array.length - 1] === '}')) || array.indexOf('$') >= 0 || array.length > EXPANDED_LIMIT) { fail(); }
            });
            var arrayExpandedLength = payload.length;
            payload = payload.replace(/\$([0-9a-z]+);/g, function (token, digits) {
                var index = parseInt(digits, 36);
                if (!Number.isSafeInteger(index) || index < 0 || index >= envelope.arrays.length || index.toString(36) !== digits) { fail(); }
                var value = envelope.arrays[index];
                arrayExpandedLength += value.length - token.length;
                if (arrayExpandedLength > EXPANDED_LIMIT) { fail(); }
                return value;
            });
        }
        if (payload.length > EXPANDED_LIMIT) { fail(); }
        var expandedLength = payload.length;
        function restore(token, index) {
            if (!Number.isSafeInteger(index) || index < 0 || index >= envelope.dictionary.length) { fail(); }
            var value = envelope.dictionary[index];
            expandedLength += value.length - token.length;
            if (expandedLength > EXPANDED_LIMIT) { fail(); }
            return value;
        }
        var expanded = envelope.encoding === 'unicode-index' ?
            payload.replace(/@(?:([\u0100-\ud7ff])|!([0-9a-z]+);)/g, function (token, character, digits) {
                var index = character ? character.charCodeAt(0) - 0x100 : parseInt(digits, 36);
                if (digits && (index < SHORT_INDEX_LIMIT || index.toString(36) !== digits)) { fail(); }
                return restore(token, index);
            }) : payload.replace(/@([0-9a-z]+);/g, function (token, digits) {
                var index = parseInt(digits, 36);
                if (index.toString(36) !== digits) { fail(); }
                return restore(token, index);
            });
        if (expanded.length > EXPANDED_LIMIT) { fail(); }
        var value = JSON.parse(expanded);
        return parsedValue ? value : expanded;
    }
    function unpackJson(raw) { return unpack(raw, false); }
    function parseJson(raw) { return unpack(raw, true); }
    return Object.freeze({ packJson: packJson, unpackJson: unpackJson, parseJson: parseJson, format: FORMAT,
        packedLimit: PACKED_LIMIT, expandedLimit: EXPANDED_LIMIT });
}));

;

/* PerfilWiki 1.0.0. Statistics cards, compatible with existing RitmoPU markup.
 * Daniel G Rego, CC BY-SA 4.0. No requests, timers, or wiki writes. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiCardsView = api; }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';
    var formatter = new Intl.NumberFormat('pt-BR');
    var fields = [
        ['tenure', 'perfilwiki-anos', 'Na Wikipédia', '🌱', 'dan-pu-stat-tenure'],
        ['bestStreak', 'dan-pu-ritmo-melhor-sequencia', 'Melhor sequência', '🔥', ''],
        ['thanks', 'dan-pu-agradecimentos', 'Agradecimentos recebidos', '💛', ''],
        ['edits', 'dan-pu-edicoes', 'Contribuições', '✍️', 'dan-pu-stat-primary'],
        ['reverts', 'dan-pu-reversoes', 'Reversões', '🛡️', ''],
        ['edited', 'dan-pu-editados', 'Artigos diferentes editados', '🛠️', ''],
        ['articles', 'dan-pu-artigos', 'Artigos criados', '📚', ''],
        ['technicalCreated', 'dan-pu-criados-tecnicos', 'Predefinições, módulos e scripts criados', '🧩', '']
    ];
    function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
    function years(registration, now) {
        var start = new Date(registration), end = new Date(now);
        if (!registration || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) { return null; }
        var value = end.getUTCFullYear() - start.getUTCFullYear();
        if (end.getUTCMonth() < start.getUTCMonth() || end.getUTCMonth() === start.getUTCMonth() && end.getUTCDate() < start.getUTCDate()) { value -= 1; }
        return Math.max(0, value);
    }
    function values(statistics, activity, now) {
        var result = Object.assign({}, statistics && statistics.metrics || {});
        result.tenure = years(result.registration, now || Date.now());
        if (activity && activity.complete && activity.summary) { result.bestStreak = activity.summary.bestStreak; }
        return result;
    }
    function label(value, key) {
        if (!Number.isSafeInteger(value) || value < 0) { return 'Aguardando dados'; }
        return formatter.format(value) + (key === 'bestStreak' ? value === 1 ? ' dia' : ' dias' : key === 'tenure' ? value === 1 ? ' ano' : ' anos' : '');
    }
    function render(statistics, activity, options) {
        options = options || {};
        var user = options.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || '';
        if (statistics && statistics.user !== user || activity && activity.identity && activity.identity.user !== user) { throw new Error('Os contadores pertencem a outro usuário.'); }
        var data = values(statistics, activity, options.now);
        var html = '<div id="dan-pu-estatisticas" class="dan-pu-stats" data-perfilwiki-user="' + escape(user) + '">';
        fields.forEach(function (field) {
            var text = label(data[field[0]], field[0]);
            if (options.wiki && field[0] === 'tenure' && data.registration) {
                var date = new Date(data.registration);
                text = '{{Tempo decorrido|' + date.getUTCDate() + '|' + (date.getUTCMonth() + 1) + '|' + date.getUTCFullYear() + '|prec=ano}}';
            }
            html += '<div class="dan-pu-stat-card' + (field[4] ? ' ' + field[4] : '') + '"><div class="dan-pu-stat-icon" aria-hidden="true">' + field[3] + '</div><div class="dan-pu-stat-value"><span id="' + field[1] + '">' + text + '</span></div><div class="dan-pu-stat-label">' + field[2] + '</div></div>';
        });
        return html + '</div>';
    }
    function paint(document, statistics, activity, now) {
        var data = values(statistics, activity, now);
        fields.forEach(function (field) {
            var element = document.getElementById(field[1]);
            if (element && Number.isSafeInteger(data[field[0]]) && data[field[0]] >= 0) { element.textContent = label(data[field[0]], field[0]); }
        });
    }
    return Object.freeze({ html: render, wikitext: function (s, a, options) { return render(s, a, Object.assign({}, options, { wiki: true })); }, paint: paint, years: years });
}));

;

(function (root) { root.PerfilWikiStyleText = ".dan-pu-stats {\n display: grid;\n grid-template-columns: repeat(auto-fit,minmax(min(100%,max(136px,calc((100% - 36px) / 4))),1fr));\n grid-auto-rows: 1fr;\n min-width: 0;\n gap: 12px;\n margin: 0.6em 0 2.1em;\n color: #202122;\n font-size: 14px;\n line-height: 1.5;\n}\n.dan-pu-stat-card {\n min-width: 0;\n box-sizing: border-box;\n border: 1px solid #d8dce3;\n border-radius: 10px;\n background: #fff;\n padding: 18px 16px;\n}\n.dan-pu-stat-icon { display: none; }\n.dan-pu-stat-value {\n color: #202122;\n font-size: 28px;\n font-weight: 700;\n line-height: 1.2;\n margin-bottom: 8px;\n font-variant-numeric: tabular-nums;\n overflow-wrap: anywhere;\n}\n.dan-pu-stat-label { color: #54595d; font-size: 13px; line-height: 1.4; }\n.dan-pu-stat-tenure { background: #faf7ef; border-color: #e5e1d7; }\n.dan-pu-stat-primary .dan-pu-stat-value { color: #36c; }\n@media (max-width: 600px) {\n .dan-pu-stat-card { padding: 16px 14px; }\n .dan-pu-stat-value { font-size: 26px; }\n}\n\n.dan-pu-readership .dan-pu-view-target { display: block; position: relative; top: -12px; height: 0; width: 0; overflow: hidden; }\n.dan-pu-period-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 20px; }\n.dan-pu-period-tabs a { display: inline-block; padding: 7px 14px; border: 1px solid #c8ccd1; border-radius: 6px; background: #fff; color: #54595d; font-size: 13px; text-decoration: none; }\n.dan-pu-period-tabs a:hover { border-color: #36c; color: #36c; text-decoration: none; }\n.dan-pu-period-tabs a:focus { outline: 2px solid #36c; outline-offset: 2px; }\n.dan-pu-period-tabs a.dan-pu-tab-30d,\n.dan-pu-period-tabs .dan-pu-tab-30d a { background: #eaf3ff; border-color: #36c; color: #2454a6; font-weight: 600; }\n.dan-pu-readership .dan-pu-period { display: none; }\n.dan-pu-readership .dan-pu-period-30d { display: block; }\n#dan-pu-view-90d:target ~ .dan-pu-period-30d,\n#dan-pu-view-12m:target ~ .dan-pu-period-30d,\n#dan-pu-view-since:target ~ .dan-pu-period-30d { display: none; }\n#dan-pu-view-90d:target ~ .dan-pu-period-90d,\n#dan-pu-view-12m:target ~ .dan-pu-period-12m,\n#dan-pu-view-since:target ~ .dan-pu-period-since { display: block; }\n#dan-pu-view-90d:target ~ .dan-pu-period-tabs a.dan-pu-tab-30d,\n#dan-pu-view-90d:target ~ .dan-pu-period-tabs .dan-pu-tab-30d a,\n#dan-pu-view-12m:target ~ .dan-pu-period-tabs a.dan-pu-tab-30d,\n#dan-pu-view-12m:target ~ .dan-pu-period-tabs .dan-pu-tab-30d a,\n#dan-pu-view-since:target ~ .dan-pu-period-tabs a.dan-pu-tab-30d,\n#dan-pu-view-since:target ~ .dan-pu-period-tabs .dan-pu-tab-30d a { background: #fff; border-color: #c8ccd1; color: #54595d; font-weight: 400; }\n#dan-pu-view-90d:target ~ .dan-pu-period-tabs a.dan-pu-tab-90d,\n#dan-pu-view-90d:target ~ .dan-pu-period-tabs .dan-pu-tab-90d a,\n#dan-pu-view-12m:target ~ .dan-pu-period-tabs a.dan-pu-tab-12m,\n#dan-pu-view-12m:target ~ .dan-pu-period-tabs .dan-pu-tab-12m a,\n#dan-pu-view-since:target ~ .dan-pu-period-tabs a.dan-pu-tab-since,\n#dan-pu-view-since:target ~ .dan-pu-period-tabs .dan-pu-tab-since a { background: #eaf3ff; border-color: #36c; color: #2454a6; font-weight: 600; }\n.dan-pu-native-more { margin-top: 13px; }\n.dan-pu-native-more .mw-collapsible-toggle { float: none; display: inline-block; margin: 0 0 10px; }\n@media print {\n .dan-pu-period-tabs { display: none; }\n .dan-pu-readership .dan-pu-period { display: block !important; margin-top: 25px; }\n}\n\n.dan-pu-view-row { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #eaecf0; padding: 12px 0; }\n.dan-pu-view-rank { width: 32px; color: #72777d; flex: none; font-size: 12px; }\n.dan-pu-view-title { min-width: 0; flex: 1; overflow-wrap: anywhere; }\n.dan-pu-view-views { text-align: right; white-space: nowrap; font-size: 13px; }\n.dan-pu-view-first { display: block; color: #72777d; font-size: 11px; margin-top: 3px; }\n\n\n.dan-pu-focus-layout {\n display: grid;\n grid-template-columns: minmax(210px,1fr) minmax(0,1.5fr);\n align-items: start;\n gap: 20px;\n margin: 1.2em 0 2.1em;\n font-size: 14px;\n line-height: 1.6;\n}\n.dan-pu-focus-aside {\n display: grid;\n gap: 14px;\n min-width: 0;\n}\n.dan-pu-focus-projects { min-width: 0; }\n.dan-pu-focus-projects ul { margin: 0; padding-left: 1.35em; }\n.dan-pu-focus-projects li { margin-bottom: 14px; }\n.dan-pu-focus-projects li:last-child { margin-bottom: 0; }\n@media (max-width: 600px) {\n .dan-pu-focus-layout { grid-template-columns: minmax(0,1fr); gap: 20px; }\n}\n\n/* Compact rows preserve real rank text and both destinations. Old rows remain supported. */\n.dan-pu-view-row[data-layout=\"compact\"] {\n display: grid;\n grid-template-columns: 32px minmax(0,1fr) max-content;\n column-gap: 12px;\n color: #72777d;\n font-size: 12px;\n}\n.dan-pu-view-row[data-layout=\"compact\"] > a:first-of-type,\n.dan-pu-view-row[data-layout=\"compact\"] > .dan-pu-view-title {\n grid-column: 2;\n min-width: 0;\n font-size: 14px;\n overflow-wrap: anywhere;\n}\n.dan-pu-view-row[data-layout=\"compact\"] > a:nth-of-type(2),\n.dan-pu-view-row[data-layout=\"compact\"] > .dan-pu-view-title + a,\n.dan-pu-view-row[data-layout=\"compact\"] > .dan-pu-view-views {\n grid-column: 3;\n text-align: right;\n white-space: nowrap;\n font-size: 13px;\n}\n\n/* Featured rows have explicit cells, so optional pictures never shift links. */\n.dan-pu-view-row[data-layout=\"featured\"] {\n box-sizing: border-box;\n min-height: 68px;\n padding: 10px 9px;\n border-bottom: 0;\n border-radius: 5px;\n}\n.dan-pu-view-row[data-layout=\"featured\"][data-shade=\"alternate\"] { background: #f8f9fa; }\n.dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-rank { width: auto; font-variant-numeric: tabular-nums; }\n.dan-pu-view-image {\n display: flex;\n align-items: center;\n justify-content: center;\n width: 48px;\n height: 48px;\n overflow: hidden;\n border-radius: 5px;\n background: #eaecf0;\n}\n.dan-pu-view-image img { display: block; width: 48px; height: 48px; object-fit: cover; }\n.dan-pu-thumb-placeholder { display: block; color: #72777d; font-size: 25px; line-height: 1; }\n.dan-pu-featured-title { min-width: 0; overflow-wrap: anywhere; font-size: 14px; }\n.dan-pu-featured-title > a { font-weight: 600; }\n.dan-pu-featured-views { text-align: right; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }\n.dan-pu-featured-views > a { white-space: nowrap; }\n.dan-pu-view-pending { display: inline-block; color: #54595d; font-size: 12px; font-weight: 400; }\n.dan-pu-data-help { margin-top: 8px; color: #54595d; font-size: 12px; }\n.dan-pu-data-help summary { width: fit-content; color: #36c; cursor: pointer; }\n.dan-pu-data-help > div { max-width: 65em; padding: 9px 12px; border-left: 2px solid #c8ccd1; margin-top: 8px; }\n.dan-pu-data-help summary:focus,\n#dan-pu-ritmo a:focus,\n#dan-pu-ritmo button:focus { outline: 2px solid #36c; outline-offset: 3px; }\n@media (max-width: 600px) {\n .dan-pu-stats { clear: both; }\n #dan-pu-ritmo { padding: 14px !important; }\n #dan-pu-ritmo .dan-pu-readership { padding: 12px !important; }\n}\n@media (max-width: 520px) {\n #dan-pu-ritmo .dan-pu-view-row[data-layout=\"featured\"] {\n  grid-template-columns: 18px 40px minmax(0,1fr) !important;\n  gap: 3px 8px;\n  padding: 10px 6px;\n }\n .dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-rank { grid-column: 1; grid-row: 1 / span 2; }\n .dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-image { grid-column: 2; grid-row: 1 / span 2; width: 40px; height: 40px; }\n .dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-image img { width: 40px; height: 40px; }\n .dan-pu-featured-title { grid-column: 3; grid-row: 1; }\n .dan-pu-featured-views { grid-column: 3; grid-row: 2; text-align: left; font-size: 13px; }\n}\n@media print {\n .dan-pu-view-image { background: transparent; }\n .dan-pu-data-help > div { display: block; }\n}\n"; }(window));

;

/* PerfilWiki 1.0.1. Shared scheduler and anonymous transport. Daniel G Rego, CC BY-SA 4.0. */
(function (win) {
    'use strict';
    var mw = win.mw, core = win.PerfilWikiCoordinator, view = win.PerfilWikiActivityView, codec = win.PerfilWikiCache, presenter = win.PerfilWikiPresenter;
    if (!mw || !core || !view || !codec || !presenter || !mw.config || mw.config.get('wgDBname') !== 'ptwiki' ||
        mw.config.get('wgAction') !== 'view' || win.PerfilWiki) { return; }
    if (win.DanPURitmo || win.DanPUStats) {
        if (mw.notify) { mw.notify('Retire as chamadas antigas de RitmoPU e EstatisticasPU do common.js antes de carregar PerfilWiki.', {type:'warn'}); }
        return;
    }
    var configured, profileOptions;
    try { profileOptions = win.PerfilWikiConfiguration.resolve(mw, win); configured = profileOptions.metrics; }
    catch (error) { if (win.console) { win.console.warn('PerfilWiki: configuração inválida.', error); } return; }
    if (!mw.config.get('wgUserName') || mw.config.get('wgUserName') !== configured.user) { return; }
    var relevantUser = mw.config.get('wgRelevantUserName') || String(mw.config.get('wgTitle') || '').split('/')[0].replace(/_/g, ' ');
    var namespace = mw.config.get('wgNamespaceNumber');
    if (relevantUser !== configured.user || namespace !== 2) { return; }
    var defaultUser = false;
    var PREFIX = 'perfilwiki-v1-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-';
    if (win.PerfilWikiStyleText && !win.document.getElementById('perfilwiki-style-v1')) {
        var style = win.document.createElement('style'); style.id = 'perfilwiki-style-v1'; style.textContent = win.PerfilWikiStyleText;
        (win.document.head || win.document.documentElement).appendChild(style);
    }
    var REFRESH = 300000;
    var BLACKLIST_URL = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
    var queryAnchor = null, nextRequestAt = 0;
    var periodKeys = ['30d', '90d', '12m', 'since'];
    var visibleCounts = { '30d': 10, '90d': 10, '12m': 10, 'since': 10 };
    var activePeriod = '30d', priorityChanged = false;
    function periodFromHash() {
        var hash = win.location && win.location.hash || '';
        var match = /^#dan-pu-view-(30d|90d|12m|since)$/.exec(hash);
        return match ? match[1] : null;
    }
    activePeriod = periodFromHash() || activePeriod;
    var current = null, started = false, running = false, suspended = false, timer;
    var lifecycle = 0, releaseActiveLease = null, nextCheck = 0;
    var cachedRaw = null, cachedState = null;
    var controllers = new Set(), pauses = Object.create(null);
    var active = 0, waiters = [];
    var images = Object.create(null), imageAttempts = Object.create(null), brokenImages = new Set();
    var imagesLoaded = false, imagesInFlight = false, imageTimer, clockTimer;
    function storageGet(key) { try { return win.localStorage.getItem(PREFIX + key); } catch (_) { return null; } }
    function storageSet(key, value) {
        try {
            var encoded = key === 'cache' ? codec.packJson(value) : value;
            try { win.localStorage.setItem(PREFIX + key, encoded); }
            catch (error) {
                if (key !== 'cache' || !error || (error.name !== 'QuotaExceededError' && error.code !== 22 && error.code !== 1014)) { throw error; }
                if (defaultUser) {
                    ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'].forEach(function (version) { win.localStorage.removeItem('dan-pu-ritmo-' + version + '-cache'); });
                }
                win.localStorage.setItem(PREFIX + key, encoded);
            }
        } catch (_) { /* In-memory results remain usable. */ }
    }
    function validatedCache(raw, upgrade) {
        try {
            if (!raw || raw.length > 4000000) { return null; }
            var state = codec.parseJson(raw);
            if (Date.parse(state.capturedAt) > Date.now() + 60000) { return null; }
            if (upgrade) {
                var upgradeCache = state.schemaVersion === 4 ? core.upgradeAllArticleTotalCache : core.upgradeAfterFirstEditCache;
                if (typeof upgradeCache !== 'function') { return null; }
                state = upgradeCache(state);
            }
            if (!state.config || state.config.user !== configured.user || state.config.project !== configured.project || state.config.timeZone !== configured.timeZone) { return null; }
            return Date.parse(state.capturedAt) <= Date.now() + 60000 && core.validateState(state).valid ? state : null;
        } catch (_) { return null; }
    }
    function readCache() {
        var raw = storageGet('cache');
        if (cachedState && raw === cachedRaw && Date.parse(cachedState.capturedAt) <= Date.now() + 60000) { return cachedState; }
        var cached = validatedCache(raw, false);
        cachedRaw = cached ? raw : null; cachedState = cached;
        if (cached) { return cached; }
        var legacyKeys = ['dan-pu-ritmo-v8-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-cache', 'dan-pu-ritmo-v8-cache', 'dan-pu-ritmo-v7-cache', 'dan-pu-ritmo-v6-cache', 'dan-pu-ritmo-v5-cache', 'dan-pu-ritmo-v4-cache', 'dan-pu-ritmo-v3-cache'];
        for (var index = 0; index < legacyKeys.length; index += 1) {
            try {
                var legacyRaw = win.localStorage.getItem(legacyKeys[index]);
                var upgraded = validatedCache(legacyRaw, false) || validatedCache(legacyRaw, true);
                if (upgraded) { storageSet('cache', JSON.stringify(upgraded)); return upgraded; }
            } catch (_) { /* Try the other strictly validated legacy cache. */ }
        }
        return null;
    }
    function readImages() {
        if (imagesLoaded) { return; }
        imagesLoaded = true;
        try {
            var raw = storageGet('images-v1');
            if (raw && raw.length <= 262144) { images = presenter.normalizeImages(JSON.parse(raw), Date.now()); }
        } catch (_) { /* Optional image metadata never invalidates statistics. */ }
    }
    function imageSlots() {
        var target = win.document.getElementById('dan-pu-ritmo');
        return target && typeof target.querySelectorAll === 'function' ? Array.from(target.querySelectorAll('.dan-pu-view-image[data-pageid]')) : [];
    }
    function placeholder(slot) {
        var fallback = win.document.createElement('span');
        fallback.className = 'dan-pu-thumb-placeholder'; fallback.textContent = '▧'; fallback.setAttribute('aria-hidden', 'true');
        slot.replaceChildren(fallback);
    }
    function patchImages() {
        imageSlots().forEach(function (slot) {
            var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
            var image = presenter.imageFor(images, row);
            var existing = slot.querySelector('img');
            if (!image || brokenImages.has(image.src)) {
                if (existing) { placeholder(slot); }
                return;
            }
            var element = existing;
            if (!element || element.getAttribute('src') !== image.src) {
                element = win.document.createElement('img'); element.className = 'dan-pu-thumb'; element.alt = '';
                element.width = 48; element.height = 48; element.loading = 'lazy'; element.decoding = 'async';
                element.crossOrigin = 'anonymous'; element.referrerPolicy = 'no-referrer'; element.src = image.src;
                slot.replaceChildren(element);
            }
            if (!element.danPURitmoBound) {
                element.danPURitmoBound = true;
                element.addEventListener('error', function () { brokenImages.add(image.src); if (element.parentNode === slot) { placeholder(slot); } }, { once: true });
            }
        });
    }
    function updateClock() {
        if (suspended || win.document.hidden) { return; }
        var target = win.document.getElementById('dan-pu-ritmo');
        if (target && typeof target.querySelectorAll === 'function') {
            Array.from(target.querySelectorAll('.dan-pu-last-edit[data-live="true"]')).forEach(function (label) {
                var value = presenter.relativeTime(label.getAttribute('data-timestamp'), Date.now());
                if (value && label.textContent !== value) { label.textContent = value; }
            });
        }
    }
    function startClock() {
        win.clearTimeout(clockTimer); updateClock();
        if (!suspended && !win.document.hidden && win.document.getElementById('dan-pu-ritmo')) {
            clockTimer = win.setTimeout(function () { startClock(); }, 60020 - Date.now() % 60000);
        }
    }
    function queueImages() {
        win.clearTimeout(imageTimer);
        if (suspended || imagesInFlight || win.document.hidden || !imageSlots().length) { return; }
        imageTimer = win.setTimeout(function () { collectImages(); }, 1800);
    }
    async function collectImages() {
        if (suspended || imagesInFlight || win.document.hidden) { return; }
        var epoch = lifecycle, requested = [], seen = new Set(), now = Date.now();
        imageSlots().forEach(function (slot) {
            var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
            var attempt = imageAttempts[row.pageid];
            if (Number.isSafeInteger(row.pageid) && row.pageid > 0 && row.title && row.title.length <= 512 && !seen.has(row.pageid) && requested.length < 40 &&
                !presenter.imageFor(images, row) && !(attempt && attempt.title === row.title && now - attempt.at < 3600000)) {
                seen.add(row.pageid); requested.push(row); imageAttempts[row.pageid] = { title: row.title, at: now };
            }
        });
        var url = presenter.imageRequest(requested);
        if (!url) { return; }
        imagesInFlight = true;
        try {
            var response = await sharedRequestJson(url, epoch);
            checkLifecycle(epoch);
            if (!response.query || !Array.isArray(response.query.pages) || response.query.pages.length > 50 || response.continue) { throw new Error('Metadados de imagem incompletos.'); }
            var capturedAt = new Date().toISOString();
            response.query.pages.forEach(function (page) {
                var expected = requested.find(function (row) { return row.pageid === page.pageid && row.title === page.title; });
                var image = expected && presenter.validateImage(page, capturedAt);
                if (image) { images[image.pageid] = image; }
            });
            var retained = Object.create(null);
            imageSlots().forEach(function (slot) {
                var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
                var image = presenter.imageFor(images, row);
                if (image) { retained[image.pageid] = image; }
            });
            images = presenter.normalizeImages(retained, Date.now());
            storageSet('images-v1', JSON.stringify(images)); patchImages();
        } catch (error) {
            requested.forEach(function (row) {
                var attempt = imageAttempts[row.pageid];
                if (!attempt || attempt.title !== row.title || attempt.at !== now) { return; }
                if (suspended || epoch !== lifecycle || error.code === 'aborted') { delete imageAttempts[row.pageid]; }
                else { attempt.at = Date.now() - 3300000; }
            });
        } finally {
            imagesInFlight = false;
            if (!suspended) { queueImages(); }
        }
    }
    function enhancePresentation() {
        patchImages(); startClock(); queueImages();
    }
    function bindControls() {
        periodKeys.forEach(function (key) {
            var tab = win.document.getElementById('dan-pu-ritmo-tab-' + key);
            if (tab && !tab.danPURitmoBound) {
                tab.addEventListener('click', function () { choosePeriod(key); }); tab.danPURitmoBound = true;
            }
            var expand = win.document.getElementById('dan-pu-ritmo-expand-' + key);
            var collapse = win.document.getElementById('dan-pu-ritmo-collapse-' + key);
            var pageviews = current && current.pageviews;
            var section = pageviews && pageviews.periods && pageviews.periods[key];
            var previousProfile = pageviews && pageviews.lastCompleteSnapshot && pageviews.lastCompleteSnapshot.periods && pageviews.lastCompleteSnapshot.periods[key];
            var needsPrevious = section && !section.complete;
            var displayed = section && needsPrevious && (section.lastCompleteSnapshot || previousProfile) || section;
            if (!displayed || !Array.isArray(displayed.rows) || displayed.rows.length <= 10) { return; }
            var total = Math.min(500, displayed.rows.length);
            visibleCounts[key] = Math.min(total, Math.max(10, visibleCounts[key]));
            function bindButton(container, label, handler) {
                if (!container) { return; }
                var button = win.document.createElement('button'); button.type = 'button'; button.textContent = label;
                button.style.cssText = 'border:0;background:none;color:#36c;font:inherit;padding:0;cursor:pointer;text-decoration:underline;';
                button.addEventListener('click', handler); container.replaceChildren(button);
            }
            if (visibleCounts[key] < total) {
                bindButton(expand, 'Mostrar mais ' + Math.min(100, total - visibleCounts[key]), function () {
                    visibleCounts[key] = Math.min(total, visibleCounts[key] + 100); paint(current);
                });
            }
            if (visibleCounts[key] > 10) {
                bindButton(collapse, 'Mostrar só 10', function () { visibleCounts[key] = 10; paint(current); });
            }
        });
    }
    function applyPeriodVisibility() {
        periodKeys.forEach(function (key) {
            var selected = key === activePeriod;
            var section = win.document.getElementById('dan-pu-period-' + key);
            if (section) { section.style.display = selected ? 'block' : 'none'; }
            var tab = win.document.getElementById('dan-pu-ritmo-tab-' + key);
            if (tab) {
                var pill = tab.querySelector && tab.querySelector('a') || tab;
                pill.style.background = selected ? '#eaf3ff' : '#fff';
                pill.style.borderColor = selected ? '#36c' : '#c8ccd1';
                pill.style.color = selected ? '#2454a6' : '#54595d';
                pill.style.fontWeight = selected ? '600' : '400';
                pill.setAttribute('aria-current', selected ? 'true' : 'false');
            }
        });
    }
    function choosePeriod(key) {
        if (periodKeys.indexOf(key) < 0) { return; }
        var changed = key !== activePeriod;
        activePeriod = key; applyPeriodVisibility();
        if (!changed || !current || !current.pageviews || current.pageviews.allPeriodsComplete) { return; }
        priorityChanged = true;
        if (started && !running && !suspended) { refresh(false, true); }
    }
    function currentMetricReadership(element) {
        return element && element.getAttribute('data-perfilwiki-user') === configured.user && element.getAttribute('data-perfilwiki-project') === 'pt.wikipedia.org' && element.getAttribute('data-metric-version') === 'after-first-edit-v1' &&
            element.getAttribute('data-total-model') === 'all-periods-all-eligible-v1';
    }
    function paint(state) {
        if (state && win.PerfilWikiCardsView) { win.PerfilWikiCardsView.paint(win.document, state.statistics, state.activity, Date.now()); }
        var target = win.document.getElementById('dan-pu-ritmo');
        if (!target || !state || !state.activity || !state.activity.complete) { return; }
        var pageviews = state.pageviews;
        var hasCompleteProfile = periodKeys.some(function (key) {
            var profile = pageviews && pageviews.periods && pageviews.periods[key];
            var previous = pageviews && pageviews.lastCompleteSnapshot && pageviews.lastCompleteSnapshot.periods && pageviews.lastCompleteSnapshot.periods[key];
            return profile && (profile.complete || profile.lastCompleteSnapshot && profile.lastCompleteSnapshot.complete) || previous && previous.complete;
        });
        var previousReadership = target.querySelector && target.querySelector('.dan-pu-readership');
        var preserved = !hasCompleteProfile && currentMetricReadership(previousReadership) ? previousReadership : null;
        readImages();
        var help = target.querySelector && target.querySelector('details.dan-pu-data-help');
        var helpOpen = help && help.open;
        target.outerHTML = view.html(state, { visibleCounts: visibleCounts, images: images, now: Date.now(), stylesPage: profileOptions.stylesPage, documentationPage: profileOptions.documentationPage });
        if (preserved) {
            var updated = win.document.getElementById('dan-pu-ritmo');
            var readership = updated && updated.querySelector('.dan-pu-readership');
            if (readership) { readership.replaceWith(preserved); }
        }
        var best = win.document.getElementById('dan-pu-ritmo-melhor-sequencia');
        if (best) { var days = state.activity.summary.bestStreak; best.textContent = new Intl.NumberFormat('pt-BR').format(days) + (days === 1 ? ' dia' : ' dias'); }
        bindControls(); applyPeriodVisibility();
        if (helpOpen) {
            var nextTarget = win.document.getElementById('dan-pu-ritmo');
            var nextHelp = nextTarget && nextTarget.querySelector('details.dan-pu-data-help');
            if (nextHelp) { nextHelp.open = true; }
        }
        enhancePresentation();
    }
    function requestAllowed(url) { return win.PerfilWikiConfiguration.requestAllowed(url); }
    function canonicalRequest(url) { var value = new URL(url); value.searchParams.sort(); return value.toString(); }
    var sharedRequests = new Map();
    function sharedRequestJson(url, epoch) {
        var key = canonicalRequest(url);
        if (sharedRequests.has(key)) { return sharedRequests.get(key); }
        var request = requestJson(url, epoch);
        sharedRequests.set(key, request);
        request.catch(function () { if (sharedRequests.get(key) === request) { sharedRequests.delete(key); } });
        return request;
    }
    function servicePause(origin, until) {
        try {
            var shared = JSON.parse(storageGet('pausas') || '{}');
            if (shared && typeof shared === 'object' && !Array.isArray(shared)) {
                Object.keys(shared).forEach(function (key) { if (Number.isFinite(shared[key])) { pauses[key] = Math.max(pauses[key] || 0, shared[key]); } });
            }
        } catch (_) { /* Use the in-memory pause. */ }
        if (until !== undefined) { pauses[origin] = Math.max(pauses[origin] || 0, until); storageSet('pausas', JSON.stringify(pauses)); }
        return pauses[origin] || 0;
    }
    function checkLifecycle(epoch) {
        if (suspended || epoch !== lifecycle) {
            var error = new Error('Página suspensa.'); error.code = 'aborted'; throw error;
        }
    }
    async function requestJson(url, requestEpoch) {
        var epoch = requestEpoch === undefined ? lifecycle : requestEpoch;
        checkLifecycle(epoch);
        if (!requestAllowed(url)) { throw new Error('A consulta não pertence às fontes públicas do painel.'); }
        if (active >= 2) { await new Promise(function (resolve) { waiters.push(resolve); }); } else { active += 1; }
        var controller, timeout;
        try {
            checkLifecycle(epoch);
            var origin = new URL(url).origin;
            if (servicePause(origin) > Date.now()) { throw new Error('O serviço pediu uma pausa nas consultas.'); }
            var wait = Math.max(0, nextRequestAt - Date.now());
            nextRequestAt = Math.max(nextRequestAt, Date.now()) + 500;
            if (wait) { await new Promise(function (resolve) { win.setTimeout(resolve, wait); }); }
            checkLifecycle(epoch);
            if (servicePause(origin) > Date.now()) { throw new Error('Consulta pausada.'); }
            controller = new AbortController(); controllers.add(controller);
            timeout = win.setTimeout(function () { controller.abort(); }, 20000);
            var response = await win.fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store', signal: controller.signal });
            checkLifecycle(epoch);
            if (!response.ok) {
                if (response.status === 429 || response.status === 503) {
                    var retry = response.headers.get('Retry-After');
                    var delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 :
                        retry && Number.isFinite(Date.parse(retry)) ? Date.parse(retry) - Date.now() : REFRESH;
                    servicePause(origin, Date.now() + Math.max(5000, delay));
                }
                var httpError = new Error('HTTP ' + response.status); httpError.code = response.status;
                if (response.status === 404) {
                    httpError.status = 404;
                    var requestUrl = new URL(url);
                    if (requestUrl.origin === 'https://wikimedia.org' && requestUrl.pathname.indexOf('/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/') === 0) {
                        httpError.requestUrl = url;
                        try { httpError.problem = await response.json(); } catch (_) { /* A proxy response is not analytics evidence. */ }
                    }
                }
                throw httpError;
            }
            if (url === BLACKLIST_URL) {
                var sourceText = await response.text();
                checkLifecycle(epoch);
                if (sourceText.length > 256000) { throw new Error('A lista de exclusões excede o tamanho esperado.'); }
                var excludedTitles = [];
                sourceText.split(/\r?\n/).forEach(function (line) {
                    if (!line.trim()) { return; }
                    var fields = line.split('\t');
                    if (fields.length !== 2 || !/^[a-z0-9._-]+$/.test(fields[0]) || !fields[1].trim()) { throw new Error('Lista de exclusões inválida.'); }
                    if (fields[0] === 'pt.wikipedia' || fields[0] === 'pt.wikipedia.org') { excludedTitles.push(fields[1].replace(/ /g, '_')); }
                });
                return { project: 'pt.wikipedia.org', source: BLACKLIST_URL, snapshotAt: queryAnchor || new Date().toISOString(), excludedTitles: excludedTitles };
            }
            var data = await response.json();
            checkLifecycle(epoch);
            if (data.error || data.warnings && Object.keys(data.warnings).length) {
                var failure = new Error('Consulta pública incompleta.');
                failure.code = data.error && data.error.code || 'api-warning';
                failure.detail = JSON.stringify(data.error || data.warnings);
                throw failure;
            }
            return data;
        } finally {
            if (timeout) { win.clearTimeout(timeout); }
            if (controller) { controllers.delete(controller); }
            if (waiters.length) { waiters.shift()(); } else { active -= 1; }
        }
    }
    function notify(message, type) { if (mw.notify) { mw.notify(message, { tag: 'dan-pu-ritmo', type: type || 'info' }); } }
    function schedule(delay) {
        win.clearTimeout(timer);
        if (!suspended) { timer = win.setTimeout(function () { refresh(false); }, delay === undefined ? REFRESH : delay); }
    }
    async function withLease(task) {
        var now = Date.now(), lease;
        var epoch = lifecycle;
        try { lease = JSON.parse(storageGet('bloqueio') || 'null'); } catch (_) { lease = null; }
        if (lease && lease.expires > now) { return false; }
        var token = now + '-' + Math.random().toString(36).slice(2);
        storageSet('bloqueio', JSON.stringify({ token: token, expires: now + 120000 }));
        function owns() {
            if (suspended || epoch !== lifecycle) { return false; }
            var raw = storageGet('bloqueio');
            if (raw === null) { return !suspended; }
            try { return !suspended && JSON.parse(raw).token === token; } catch (_) { return false; }
        }
        if (!owns()) { return false; }
        var heartbeat = win.setInterval(function () {
            if (owns()) { storageSet('bloqueio', JSON.stringify({ token: token, expires: Date.now() + 120000 })); }
        }, 30000);
        function release() {
            win.clearInterval(heartbeat);
            try {
                var finalLease = JSON.parse(storageGet('bloqueio') || 'null');
                if (finalLease && finalLease.token === token) { storageSet('bloqueio', JSON.stringify({ token: token, expires: 0 })); }
            } catch (_) { /* Its deadline still releases an unreadable lease. */ }
        }
        releaseActiveLease = release;
        try { await task(owns); return true; }
        finally { release(); if (releaseActiveLease === release) { releaseActiveLease = null; } }
    }
    async function refresh(manual, priority) {
        if (!started || running || suspended || !win.document.getElementById('dan-pu-ritmo')) { return; }
        var epoch = lifecycle;
        var cached = readCache();
        if (cached && cached !== current && (!current || Date.parse(cached.capturedAt) >= Date.parse(current.capturedAt))) { current = cached; paint(current); }
        var storedDeadline = Number(storageGet('proxima-consulta')) || 0;
        if (!Number.isFinite(storedDeadline) || storedDeadline > Date.now() + REFRESH + 60000) { storedDeadline = 0; }
        if (!Number.isFinite(nextCheck) || nextCheck > Date.now() + REFRESH + 60000) { nextCheck = 0; }
        var deadline = Math.max(nextCheck, storedDeadline);
        if (!manual && !priority && deadline > Date.now() && deadline < Date.now() + REFRESH + 60000) { schedule(Math.max(1000, deadline - Date.now())); return; }
        if (!manual && win.document.hidden) { schedule(); return; }
        running = true;
        async function collect(owns) {
            if (manual) { notify('Consultando as estatísticas…'); }
            var config = Object.assign({}, configured);
            if (manual) { config.activityRefreshMs = 0; }
            queryAnchor = new Date().toISOString(); sharedRequests.clear();
            var requestedPeriod = activePeriod; priorityChanged = false;
            var next = await core.update({ requestJson: function (url) { checkLifecycle(epoch); return sharedRequestJson(url, epoch); }, previous: current, config: config, now: queryAnchor, activePeriod: requestedPeriod, maxRequests: 40,
                retryUnavailableSeries: !!manual, retryUnavailableAggregates: !!manual, forceStatistics: !!manual,
                onProgress: function (partial) {
                    if (!owns() || suspended || !core.validateState(partial).valid) { return; }
                    current = partial; storageSet('cache', JSON.stringify(current)); paint(current);
                }
            });
            next.config = Object.assign({}, configured);
            if (!owns()) { return; }
            if (!core.validateState(next).valid) { throw new Error('Os dados novos não passaram pela conferência.'); }
            current = next;
            storageSet('cache', JSON.stringify(current));
            paint(current);
            if (manual) {
                if (next.pageviews && !next.pageviews.allPeriodsComplete && !next.pageviews.error) {
                    notify('Calculando as visualizações de todos os artigos editados por você. O painel acompanha a consulta.');
                } else { notify(next.fresh ? 'Painel atualizado nesta tela.' : 'Os dados disponíveis foram atualizados. As consultas incompletas mantiveram seus últimos resultados.', next.fresh ? 'success' : 'warn'); }
            }
        }
        try {
            var complete;
            if (win.navigator.locks && win.navigator.locks.request) {
                complete = await win.navigator.locks.request(PREFIX + 'consulta', { ifAvailable: true }, function (lock) { return lock ? withLease(collect) : false; });
            } else { complete = await withLease(collect); }
            if (!complete && manual) { notify('Outra aba já está consultando o painel.'); }
        } catch (error) {
            win.console.warn('Atividade na Wikipédia: os dados anteriores foram mantidos.', error);
            if (manual) { notify('Não foi possível concluir a consulta. O painel anterior foi mantido.', 'warn'); }
        } finally {
            running = false;
            if (!suspended && epoch !== lifecycle) { schedule(1500); }
            else if (!suspended) {
                var views = current && current.pageviews;
                var continuing = views && !views.allPeriodsComplete && views.progress && views.progress.pending > 0 && !views.error || current && (current.history && current.history.pending && !current.history.error || current.statistics && current.statistics.pending && !current.statistics.errors.length);
                var delay = priorityChanged && views && !views.allPeriodsComplete ? 0 : (continuing ? 15000 : REFRESH);
                nextCheck = Date.now() + delay;
                storageSet('proxima-consulta', String(nextCheck)); schedule(delay);
            }
        }
    }
    function download() {
        if (!current || !current.activity.complete) { notify('Aguarde a primeira consulta completa.', 'warn'); return; }
        var markup = view.wikitext(current, { images: images, stylesPage: profileOptions.stylesPage, documentationPage: profileOptions.documentationPage });
        var blob = new Blob([markup + '\n'], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_atividade.wiki';
        link.click(); win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function downloadCards() {
        if (!current || !current.statistics) { notify('Aguarde a primeira consulta dos contadores.', 'warn'); return; }
        var markup = '<templatestyles src="' + profileOptions.stylesPage.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" />' +
            win.PerfilWikiCardsView.wikitext(current.statistics, current.activity, {user: configured.user, now: Date.now()});
        var url = URL.createObjectURL(new Blob([markup + '\n'], {type:'text/plain;charset=utf-8'}));
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_contadores.wiki'; link.click();
        win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function begin() {
        if (started || !win.document.getElementById('dan-pu-ritmo')) { return; }
        started = true; readImages(); current = readCache();
        var cards = win.document.getElementById('dan-pu-estatisticas');
        if (cards && !win.document.getElementById('perfilwiki-anos')) {
            var tenure = cards.querySelector('.dan-pu-stat-tenure .dan-pu-stat-value');
            if (tenure) { var tenureValue = win.document.createElement('span'); tenureValue.id = 'perfilwiki-anos'; tenureValue.append.apply(tenureValue, Array.from(tenure.childNodes)); tenure.appendChild(tenureValue); }
        }
        if (cards && cards.getAttribute('data-perfilwiki-user') !== configured.user) {
            ['dan-pu-edicoes','dan-pu-agradecimentos','dan-pu-artigos','dan-pu-editados','dan-pu-criados-tecnicos','dan-pu-reversoes','dan-pu-ritmo-melhor-sequencia','perfilwiki-anos'].forEach(function (id) {
                var number = win.document.getElementById(id); if (number) { number.textContent = 'Aguardando dados'; }
            });
            cards.setAttribute('data-perfilwiki-user', configured.user);
        }

        if (current) { paint(current); }
        else {
            var target = win.document.getElementById('dan-pu-ritmo');
            if (target && target.getAttribute('data-perfilwiki-user') !== configured.user) {
                target.textContent = 'Consultando a atividade de ' + configured.user + '.';
                target.setAttribute('data-perfilwiki-user', configured.user);
                target.setAttribute('data-perfilwiki-project', configured.project);
            }
            var readership = target && target.querySelector('.dan-pu-readership');
            if (readership && !currentMetricReadership(readership)) {
                var pending = win.document.createElement('div');
                pending.textContent = 'Consultando visualizações após sua primeira edição em cada artigo.';
                readership.replaceChildren(pending);
            }
            bindControls(); applyPeriodVisibility(); enhancePresentation();
        }
        mw.loader.using(['mediawiki.util']).then(function () {
            var refreshLink = mw.util.addPortletLink('p-tb', '#', 'Atualizar estatísticas', 't-perfilwiki-refresh');
            var downloadLink = mw.util.addPortletLink('p-tb', '#', 'Baixar painel atualizado', 't-perfilwiki-download');
            var cardsLink = mw.util.addPortletLink('p-tb', '#', 'Baixar contadores atualizados', 't-perfilwiki-cards');
            if (cardsLink) { cardsLink.addEventListener('click', function (event) { event.preventDefault(); downloadCards(); }); }
            if (refreshLink) { refreshLink.addEventListener('click', function (event) { event.preventDefault(); refresh(true); }); }
            if (downloadLink) { downloadLink.addEventListener('click', function (event) { event.preventDefault(); download(); }); }
            schedule(1500);
        });
    }
    win.PerfilWiki = Object.freeze({ version: '1.0.1', readOnly: true, refreshInterval: REFRESH,
        refresh: function () { return refresh(true); }, download: download, downloadActivity: download, downloadCards: downloadCards,
        getState: function () { return current ? JSON.parse(JSON.stringify(current)) : null; } });
    // Compatibility sentinels stop old loaders from starting a second scheduler.
    win.DanPURitmo = win.PerfilWiki; win.DanPUStats = win.PerfilWiki;
    win.addEventListener('storage', function (event) {
        if (event.key === PREFIX + 'cache') { var state = readCache(); if (state && state !== current && (!current || Date.parse(state.capturedAt) >= Date.parse(current.capturedAt))) { current = state; paint(state); } }
    });
    win.addEventListener('focus', function () { refresh(false); startClock(); queueImages(); });
    win.addEventListener('hashchange', function () { choosePeriod(periodFromHash() || '30d'); });
    win.document.addEventListener('visibilitychange', function () {
        if (!win.document.hidden) { refresh(false); startClock(); queueImages(); }
        else { win.clearTimeout(clockTimer); win.clearTimeout(imageTimer); }
    });
    win.addEventListener('pagehide', function () {
        suspended = true; lifecycle += 1; win.clearTimeout(timer); win.clearTimeout(clockTimer); win.clearTimeout(imageTimer);
        controllers.forEach(function (controller) { controller.abort(); });
        if (releaseActiveLease) { releaseActiveLease(); }
    });
    win.addEventListener('pageshow', function () { if (suspended) { suspended = false; schedule(1500); startClock(); queueImages(); } });
    if (mw.hook) { mw.hook('wikipage.content').add(begin); }
    if (win.document.readyState === 'loading') { win.document.addEventListener('DOMContentLoaded', begin, { once: true }); }
    else { begin(); }
}(window));
