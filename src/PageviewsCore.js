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

    // Streaming scans keep the history-derived interval fixed while metadata
    // excludes pages. Older caches retain their original eligible-cohort rule.
    function sourceForState(periods, state) {
        return sourceForArticles(periods, state.sourceBasis === 'history-candidates-v1' || !state.metadata.complete ? state.candidates : state.metadata.cohort);
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

    function sourceIndex(date, source) { return Math.round((Date.parse(date) - Date.parse(source.start)) / DAY); }
    function refreshSeriesStats(series, periods, article) {
        var source = sourceOf(periods);
        series.firstEditAt = article.firstEditAt;
        series.countStartDate = countStart(article);
        series.creationDate = article.creationDate || null;
        series.creationEvidence = article.creationEvidence || (article.creationDate ? { type: 'user-new-flag' } : null);
        if (article.creationDate && series.firstNonZeroDate && series.firstNonZeroDate < series.creationDate) { series.titleHistoryBeforePageCreation = true; }
        else { delete series.titleHistoryBeforePageCreation; }
        var firstIndex = Math.max(0,sourceIndex(series.countStartDate,source));
        series.missing = series.missing.filter(function (index) { return index >= firstIndex; });
        PERIOD_IDS.forEach(function (id) {
            var period = effectivePeriod(article, periods[id]), startIndex = sourceIndex(period.start,source), endIndex = sourceIndex(period.end,source);
            var missing = series.missing.filter(function (index) { return index >= startIndex && index <= endIndex; }).length;
            series.covered[id] = period.days - missing;
            series.totals[id] = missing ? null : series.partialSums[id];
        });
        series.status = series.missing.length ? (series.validated ? 'partial' : 'unavailable') : 'available';
        return series;
    }

    function emptySeries(article, periods, capturedAt, error, requestPeriod) {
        var source = sourceOf(periods), firstIndex = Math.max(0,sourceIndex(countStart(article),source));
        var series = { pageid: article.pageid, title: article.title,
            lastEditAt: article.lastEditAt, sourcePeriod: source, capturedAt: capturedAt,
            totals: {}, partialSums: { '30d': 0, '90d': 0, '12m': 0, 'since': 0 }, covered: {},
            missing: Array.from({ length: Math.max(0,source.days-firstIndex) }, function (_, index) { return index + firstIndex; }),
            firstNonZeroDate: null, validated: false, creationChecked: !!article.creationDate,
            error: error || null };
        if (requestPeriod) { series.requestPeriod = clone(requestPeriod); }
        return refreshSeriesStats(series, periods, article);
    }

    function validatedSeries(article, periods, response, config, capturedAt, availabilityProof, requestPeriod) {
        checkedResponse(response);
        if (!Array.isArray(response.items)) { fail('The annual daily series is missing.'); }
        var source = sourceOf(periods), queried = requestPeriod || source;
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
            if (!validDate(date) || date < queried.start || date > queried.end || daily.has(date)) { fail('The annual series contains duplicate or out-of-range dates.'); }
            if (item.views && (!firstNonZeroDate || date < firstNonZeroDate)) { firstNonZeroDate = date; }
            daily.set(date, item.views);
        });
        var series = emptySeries(article, periods, capturedAt, null, requestPeriod);
        series.validated = true;
        series.reportedDays = daily.size;
        var documentedZeros = validAvailabilityProof(availabilityProof, source, config, capturedAt);
        series.missing = [];
        series.firstNonZeroDate = firstNonZeroDate;
        var firstIndex = Math.max(0,sourceIndex(countStart(article),source));
        var bounds = {};
        PERIOD_IDS.forEach(function (id) {
            var period = effectivePeriod(article,periods[id]);
            bounds[id] = {start:sourceIndex(period.start,source),end:sourceIndex(period.end,source)};
        });
        for (var index = firstIndex; index < source.days; index += 1) {
            var date = addDate(source.start, index);
            if (!daily.has(date)) {
                if (documentedZeros) { series.zeroBasis = 'aqs-documented-omitted-zero'; series.availabilityProofAt = availabilityProof.capturedAt; }
                else { series.missing.push(index); }
                continue;
            }
            var views = daily.get(date);
            PERIOD_IDS.forEach(function (id) {
                if (index >= bounds[id].start && index <= bounds[id].end) {
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
        state.stale = !state.allPeriodsComplete || state.periods['12m'].period.end !== periodsFor(state.capturedAt)['12m'].end;
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
            sourceBasis: candidates.length > 50 ? 'history-candidates-v1' : 'eligible-cohort-v1',
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

    async function collectFixedPageviews(options) {
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
        var unchangedCandidates = previous && JSON.stringify(previous.candidates) === JSON.stringify(candidates);
        // Finish a recent in-progress calculation before moving its UTC end
        // date. Otherwise short visits spanning midnight repeatedly discard the
        // same work. The displayed period dates remain the original dates.
        var pinnedWindow = previous && !previous.allPeriodsComplete && !options.restartPageviews &&
            now.getTime() >= Date.parse(previous.startedAt) && now.getTime() - Date.parse(previous.startedAt) <= 7 * DAY &&
            previous.periods['12m'].period.end !== definitions['12m'].end &&
            JSON.stringify(unchangedCandidates ? sourceForState(periodsFor(previous.startedAt),previous) :
                sourceForArticles(periodsFor(previous.startedAt), candidates)) === JSON.stringify(previous.sourcePeriod);
        var projectionNow = pinnedWindow ? nowDate(previous.startedAt) : now;
        if (pinnedWindow) { definitions = periodsFor(projectionNow); }
        // An unfinished snapshot also belongs to its original history and UTC
        // windows. Rebuild metadata when either changes, retaining reusable
        // series through newStateV3 instead of producing an invalid checkpoint.
        var previousCandidates = new Map(previous ? previous.candidates.map(function (article) { return [article.pageid, article]; }) : []);
        var sameArticleIdentity = previous && candidates.every(function (article) {
            var old = previousCandidates.get(article.pageid);
            return old && old.title === article.title && old.creationDate === article.creationDate;
        });
        var resume = previous && previous.periods['12m'].period.start === definitions['12m'].start &&
            previous.periods['12m'].period.end === definitions['12m'].end && previous.universeFingerprint === fingerprint &&
            (unchangedCandidates || previous.metadata.complete && sameArticleIdentity);
        var state = resume && !options.restartPageviews ? clone(previous) : newStateV3(config, projectionNow, activity, candidates, previous);
        // Editing an already known article can reorder the history candidates.
        // Rebase classifications by page ID instead of trusting their old array
        // positions. This map comes only from the validated previous snapshot.
        var priorClassifications = new Map();
        if (previous && !resume && !options.restartPageviews && now.getTime() - Date.parse(previous.startedAt) <= 7 * DAY &&
            previous.periods['12m'].period.start === definitions['12m'].start && previous.periods['12m'].period.end === definitions['12m'].end &&
            JSON.stringify(previous.sourcePeriod) === JSON.stringify(state.sourcePeriod)) {
            previous.metadata.cohort.forEach(function (article) {
                priorClassifications.set(article.pageid, {article:article});
            });
            previous.metadata.excluded.forEach(function (article) {
                priorClassifications.set(article.pageid, {excluded:article});
            });
        }
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
        function metadataSource() {
            var definitions={};PERIOD_IDS.forEach(function(id){definitions[id]=state.periods[id].period;});
            state.sourcePeriod=sourceForState(definitions,state);
            Object.keys(state.reusableSeries).forEach(function(id){if(JSON.stringify(state.reusableSeries[id].sourcePeriod)!==JSON.stringify(state.sourcePeriod))delete state.reusableSeries[id];});
            if(state.availabilityProof&&!validAvailabilityProof(state.availabilityProof,state.sourcePeriod,config,now.toISOString())){state.availabilityProof=null;state.availabilityAttemptAt=null;}
        }
        var periodDefinitions = null, zerosVerified = false, seriesPrepared = false, attempted = new Set();
        async function prepareSeries() {
            if (seriesPrepared) { return; }
            metadataSource();
            periodDefinitions = {}; PERIOD_IDS.forEach(function (id) { periodDefinitions[id] = state.periods[id].period; });
            state.sourcePeriod = sourceForState(periodDefinitions,state);
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
            zerosVerified = validAvailabilityProof(state.availabilityProof, sourceOf(periodDefinitions), config, now.toISOString());
            seriesPrepared = true;
        }
        function reuseClassified() {
            state.metadata.cohort.forEach(function (article) {
                var reusable = state.reusableSeries[article.pageid];
                if (reusable && reusable.title === article.title && reusable.firstEditAt === article.firstEditAt && JSON.stringify(reusable.sourcePeriod) === JSON.stringify(state.sourcePeriod)) { state.series[article.pageid] = Object.assign({}, reusable, { lastEditAt: article.lastEditAt }); delete state.reusableSeries[article.pageid]; }
                var aggregates = state.reusableAggregates[article.pageid];
                if (aggregates && Object.keys(aggregates).every(function (id) { return aggregates[id].title === article.title; })) { state.aggregateTotals[article.pageid] = aggregates; delete state.reusableAggregates[article.pageid]; }
            });
        }
        async function collectSeries(articles, publishFirst) {
            var previewPublished = false;
            while (requests < maxRequests) {
                var queue = articles.filter(function (article) {
                    var series = state.series[article.pageid];
                    return !attempted.has(article.pageid) && (!series || (options.retryUnavailableSeries && !series.validated) ||
                        (zerosVerified && series.validated && series.missing.length));
                });
                if (!queue.length) { break; }
                queue.sort(function (a, b) { return (state.series[a.pageid] ? 1 : 0) - (state.series[b.pageid] ? 1 : 0); });
                var work = queue.slice(0, Math.min(2, maxRequests - requests));
                work.forEach(function (article) { attempted.add(article.pageid); });
                await Promise.all(work.map(async function (article) {
                    var series = state.series[article.pageid], requestPeriod = effectivePeriod(article,sourceOf(periodDefinitions));
                    try {
                        if (requestPeriod.days === 0) {
                            series = emptySeries(article,periodDefinitions,now.toISOString(),null,requestPeriod);
                            series.validated = true; series.reportedDays = 0; series.coverageBasis = 'before-first-edit';
                        } else if (!series || (options.retryUnavailableSeries && !series.validated) || (zerosVerified && series.validated && series.missing.length)) {
                            series = validatedSeries(article, periodDefinitions, await request(viewUrl(config, article.title, requestPeriod)), config, now.toISOString(), state.availabilityProof,requestPeriod);
                        }
                        state.series[article.pageid] = series;
                    } catch (error) {
                        if (error.code !== 'request-budget' && error.code !== 'aborted') {
                            series = emptySeries(article, periodDefinitions, now.toISOString(), errorInfo(error),requestPeriod);
                            var articleUrl = viewUrl(config, article.title, requestPeriod);
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
                await checkpoint(!!publishFirst && !previewPublished); previewPublished = true;
            }
        }
        try {
            metadataSource();
            refreshV3(state);
            if (state.allPeriodsComplete) { state.capturedAt = oldCaptureAt; await checkpoint(true); return state; }
            while (!state.metadata.complete && requests < maxRequests) {
                var batch = state.candidates.slice(state.metadata.cursor, state.metadata.cursor + 50);
                var carried = new Map();
                batch.forEach(function (article) {
                    var prior = priorClassifications.get(article.pageid), oldCandidate = previousCandidates.get(article.pageid);
                    if (prior && oldCandidate && oldCandidate.firstEditAt === article.firstEditAt && oldCandidate.title === article.title &&
                        (!prior.article || prior.article.title === article.title)) { carried.set(article.pageid,prior); }
                });
                var unknown = batch.filter(function (article) { return !carried.has(article.pageid); });
                var response = unknown.length ? checkedResponse(await request(apiUrl(config, { prop: 'info', pageids: unknown.map(function (article) { return article.pageid; }).join('|') }))) :
                    {batchcomplete:true,query:{pages:[]}};
                if (response.continue || !assertedFlag(response, 'batchcomplete') || !response.query || !Array.isArray(response.query.pages)) { fail('Current article metadata is incomplete.'); }
                var pages = new Map(); var requested = new Set(unknown.map(function (article) { return article.pageid; }));
                response.query.pages.forEach(function (page) {
                    if (!page || !Number.isSafeInteger(page.pageid) || !requested.has(page.pageid) || pages.has(page.pageid)) { fail('Current metadata has invalid or duplicate page IDs.'); }
                    pages.set(page.pageid, page);
                });
                var additions = []; var exclusions = [];
                var knownTitles = new Set(state.metadata.cohort.map(function (article) { return normalizedTitle(article.title); }));
                batch.forEach(function (article) {
                    var prior = carried.get(article.pageid);
                    if (prior) {
                        if (prior.excluded) { exclusions.push(clone(prior.excluded)); return; }
                        if (knownTitles.has(normalizedTitle(prior.article.title))) { fail('Current metadata resolves to duplicate titles.'); }
                        knownTitles.add(normalizedTitle(prior.article.title));
                        additions.push(Object.assign({},article,{title:prior.article.title})); return;
                    }
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
                if(state.metadata.complete)metadataSource();
                await checkpoint(false);
                if (state.sourceBasis === 'history-candidates-v1' && !state.metadata.complete && options.metadataOnly !== true) {
                    reuseClassified();
                    var preview = state.metadata.cohort.slice(0,10);
                    if (preview.some(function (article) { return !state.series[article.pageid]; })) {
                        await prepareSeries();
                        await collectSeries(preview,true);
                    }
                }
            }
            if (!state.metadata.complete) { await checkpoint(true); return state; }
            metadataSource();
            if (options.metadataOnly === true) { await checkpoint(true); return state; }
            await prepareSeries();
            reuseClassified();
            state.reusableSeries = {}; state.reusableAggregates = {};
            await collectSeries(state.metadata.cohort,false);
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

    function normalizeCustomRange(value, now) {
        if (value === undefined || value === null) { return null; }
        if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 2 ||
            Object.keys(value).some(function (key) { return key !== 'start' && key !== 'end'; }) ||
            !validDate(value.start) || !validDate(value.end) || value.start < COVERAGE_FLOOR || value.end < value.start ||
            value.end > addDate(nowDate(now).toISOString().slice(0,10),-1)) { fail('Escolha datas completas entre 01/07/2015 e o último dia UTC encerrado.', 'invalid-custom-range'); }
        return {start:value.start,end:value.end};
    }
    function customDefinition(range) {
        return {start:range.start,end:range.end,days:Math.round((Date.parse(range.end)-Date.parse(range.start))/DAY)+1,basis:'UTC'};
    }
    function customFingerprint(articles) {
        return JSON.stringify(articles.map(function (a) { return [a.pageid,a.title,a.firstEditAt]; }).sort(function (a,b) { return a[0]-b[0]; }));
    }
    function customSource(range, articles) {
        var starts = articles.map(function (article) { return effectivePeriod(article,customDefinition(range)); }).filter(function (period) { return period.days > 0; }).map(function (period) { return period.start; });
        return customDefinition({start:starts.length ? starts.sort()[0] : range.start,end:range.end});
    }
    function customProofValid(proof, source, config, at) {
        return !!proof && !!proof.sourcePeriod && proof.sourcePeriod.start <= source.start && proof.sourcePeriod.end >= source.end &&
            validAvailabilityProof(proof,proof.sourcePeriod,config,at);
    }
    function fixedProjection(section) {
        var result = clone(section);
        delete result.customRange; delete result.customCache; delete result.customProgress;
        if (result.periods) { delete result.periods.custom; }
        return result;
    }
    function customRow(article, entry, period) {
        return {pageid:article.pageid,title:article.title,lastEditAt:article.lastEditAt,firstEditAt:article.firstEditAt,
            countFromDate:effectivePeriod(article,period).start,coverageTruncated:false,creationDate:article.creationDate || null,
            creationEvidence:article.creationEvidence || null,views:entry.total,status:'available',sourcePeriod:entry.period,
            sourceGranularity:entry.basis === 'fixed-period' ? 'cached-period' : 'daily',coveredDays:entry.period.days,
            dailyCoveredDays:entry.period.days,capturedAt:entry.capturedAt};
    }
    function projectCustom(section) {
        var cache = section.customCache, period = customDefinition(section.customRange), articles = section.metadata.cohort;
        var exact = articles.filter(function (article) { var entry=cache.series[article.pageid];return entry && entry.status === 'available'; });
        var rows = sortedViewRows(exact.map(function (article) { return customRow(article,cache.series[article.pageid],period); }));
        var complete = section.metadata.complete && exact.length === articles.length;
        var total = complete ? rows.reduce(function (sum,row) { return sum+row.views; },0) : null;
        var ranked = rows.slice(0,500), rankedTotal = complete ? ranked.reduce(function (sum,row) { return sum+row.views; },0) : null;
        if (total !== null && !Number.isSafeInteger(total)) { fail('O total de visualizações excedeu o limite numérico.'); }
        return {period:period,rows:ranked,rankingComplete:complete,complete:complete,total:total,totalScope:'all-eligible-articles',
            allArticleTotal:total,rankedTotal:rankedTotal,proof:{kind:'exhaustive-custom-daily-totals',strict:true,metadataComplete:section.metadata.complete,
                eligible:articles.length,exactArticles:exact.length,uncertainArticles:articles.length-exact.length,truncatedArticles:0,
                unboundedRemaining:articles.length-exact.length,cutoff:complete && ranked.length ? ranked[ranked.length-1].views : null,
                remainingMaxUpper:complete ? -1 : null,complete:complete,rankingComplete:complete,totalComplete:complete}};
    }
    function installCustomProjection(section) {
        var result = projectCustom(section), cache = section.customCache;
        if (!result.complete && cache.lastCompleteSnapshot) { result.lastCompleteSnapshot=clone(cache.lastCompleteSnapshot); }
        section.periods.custom=result;
        section.customProgress={requests:cache.requests,totalRequests:cache.totalRequests,eligible:section.metadata.cohort.length,
            completed:result.proof.exactArticles,pending:section.metadata.complete ? result.proof.uncertainArticles : section.candidates.length-section.metadata.cursor,
            resumable:!result.complete && !cache.error,error:cache.error};
        return result;
    }
    function newCustomCache(section,range,previous,now) {
        var fingerprint=customFingerprint(section.metadata.cohort), same=previous && JSON.stringify(previous.range)===JSON.stringify(range);
        var source=customSource(range,section.metadata.cohort), entries={};
        if (same && section.metadata.complete) {
            section.metadata.cohort.forEach(function (article) {
                var entry=previous.series[article.pageid];
                if (entry && entry.title===article.title && entry.firstEditAt===article.firstEditAt) entries[article.pageid]=clone(entry);
            });
        }
        return {version:1,identity:section.identity,range:range,sourcePeriod:source,cohortFingerprint:fingerprint,capturedAt:now,
            series:entries,controls:same && JSON.stringify(previous.sourcePeriod)===JSON.stringify(source) ? clone(previous.controls) : [],
            controlAttempts:same && JSON.stringify(previous.sourcePeriod)===JSON.stringify(source) ? clone(previous.controlAttempts) : {},availabilityProof:same && customProofValid(previous.availabilityProof,source,DEFAULT_CONFIG,now) ? clone(previous.availabilityProof) : null,
            lastCompleteSnapshot:same && previous.cohortFingerprint===fingerprint ? clone(previous.lastCompleteSnapshot) : null,
            requests:0,totalRequests:same ? previous.totalRequests : 0,error:null};
    }
    function customEntry(article,range,now) {
        return {pageid:article.pageid,title:article.title,firstEditAt:article.firstEditAt,period:effectivePeriod(article,customDefinition(range)),
            capturedAt:now,status:'unavailable',total:null,partialTotal:0,missingDates:[],reportedDays:0,basis:'daily',error:null};
    }
    function parseCustomDaily(article,range,response,config,now,proof) {
        checkedResponse(response);
        if (!response || !Array.isArray(response.items)) { fail('A série do intervalo personalizado está incompleta.'); }
        var entry=customEntry(article,range,now), counts=new Map();
        Array.from(response.items).forEach(function (item) {
            if (!item || typeof item.timestamp!=='string' || !/^\d{8}00$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views<0 || item.agent!=='user' || item.access!=='all-access' || item.granularity!=='daily' ||
                typeof item.project!=='string' || item.project.replace(/\.org$/,'')!==config.project.replace(/\.org$/,'') ||
                typeof item.article!=='string' || normalizedTitle(item.article)!==normalizedTitle(article.title)) { fail('Uma observação do intervalo personalizado é inválida.'); }
            var date=item.timestamp.slice(0,4)+'-'+item.timestamp.slice(4,6)+'-'+item.timestamp.slice(6,8);
            if (!validDate(date) || date<entry.period.start || date>entry.period.end || counts.has(date)) { fail('A série personalizada contém datas repetidas ou fora do intervalo.'); }
            counts.set(date,item.views);
        });
        entry.reportedDays=counts.size;
        var zeroProof=customProofValid(proof,entry.period,config,now);
        for(var day=entry.period.start;day<=entry.period.end;day=addDate(day,1)) {
            if (!counts.has(day)) { if (!zeroProof) entry.missingDates.push(day); else entry.zeroBasis='aqs-documented-omitted-zero'; }
            else entry.partialTotal+=counts.get(day);
            if (!Number.isSafeInteger(entry.partialTotal)) fail('Uma soma personalizada excedeu o limite numérico.');
        }
        if (!entry.missingDates.length) { entry.status='available';entry.total=entry.partialTotal; }
        return entry;
    }
    function reusableCustomFixed(section,article,range,now) {
        var matched=PERIOD_IDS.find(function (id) { var p=section.periods[id].period;return p.start===range.start && p.end===range.end; });
        if (!matched) return null;
        var series=section.series[article.pageid], aggregate=section.aggregateTotals[article.pageid] && section.aggregateTotals[article.pageid][matched];
        var total=aggregate ? aggregate.total : series && series.totals[matched];
        if (!Number.isSafeInteger(total) || total<0) return null;
        var entry=customEntry(article,range,now);entry.status='available';entry.total=total;entry.partialTotal=total;entry.basis='fixed-period';entry.fixedPeriod=matched;
        return entry;
    }
    async function collectCustomRange(section,range,options,previous,request,remaining) {
        var now=nowDate(options.now).toISOString(), config=normalizeConfig(options.config);
        section.customRange=range;section.customCache=newCustomCache(section,range,previous,now);
        var cache=section.customCache, completed=0, checkpointEvery=options.checkpointEvery===undefined?8:options.checkpointEvery;
        async function checkpoint(force) {if(force||completed>=checkpointEvery){installCustomProjection(section);completed=0;if(options.onProgress)await options.onProgress(clone(section));}}
        if (!section.metadata.complete) {await checkpoint(true);return section;}
        section.metadata.cohort.forEach(function (article) {
            if (cache.series[article.pageid] && cache.series[article.pageid].status==='available') return;
            var entry=customEntry(article,range,now);
            if (!entry.period.days) {entry.status='available';entry.total=0;entry.basis='before-first-edit';cache.series[article.pageid]=entry;}
            else {var reused=reusableCustomFixed(section,article,range,now);if(reused)cache.series[article.pageid]=reused;}
        });
        if (projectCustom(section).complete) {cache.lastCompleteSnapshot=projectCustom(section);await checkpoint(true);return section;}
        if (!cache.availabilityProof && customProofValid(section.availabilityProof,cache.sourcePeriod,config,now)) cache.availabilityProof=clone(section.availabilityProof);
        if (!cache.availabilityProof) {
            var names=expectedControlTitles(cache.sourcePeriod), definitions=periodsFor(now);definitions.sourcePeriod=cache.sourcePeriod;
            for(var index=0;index<names.length && remaining()>0;index+=1) {
                var title=names[index];
                if (cache.controls.some(function (control) {return control.title===title;}) || cache.controlAttempts[title] && !options.retryUnavailableSeries &&
                    Date.parse(now)-Date.parse(cache.controlAttempts[title].capturedAt)<300000) continue;
                try {cache.controls.push(availabilityControl(title,definitions,await request(viewUrl(config,title,cache.sourcePeriod)),config,now));}
                catch(error){if(error.code==='aborted'||error.code==='request-budget')throw error;cache.controlAttempts[title]=Object.assign({capturedAt:now},errorInfo(error));}
                cache.requests+=1;cache.totalRequests+=1;completed+=1;
                await checkpoint();
            }
            if(cache.controls.length===2) cache.availabilityProof={complete:true,kind:'aqs-documented-omitted-zero',documentation:ZERO_DOCUMENTATION,project:config.project,
                sourcePeriod:cache.sourcePeriod,capturedAt:now,controls:clone(cache.controls)};
        }
        section.metadata.cohort.forEach(function(article){
            var entry=cache.series[article.pageid];
            if(entry && entry.status!=='available' && !entry.error && entry.missingDates.length && customProofValid(cache.availabilityProof,entry.period,config,now)) {
                entry.total=entry.partialTotal;entry.status='available';entry.missingDates=[];entry.zeroBasis='aqs-documented-omitted-zero';entry.capturedAt=now;
            }
        });
        var attempted=new Set();
        while(remaining()>0) {
            var article=section.metadata.cohort.find(function(a){var entry=cache.series[a.pageid];return !attempted.has(a.pageid)&&(!entry||entry.status!=='available'&&
                (options.retryUnavailableSeries||Date.parse(now)-Date.parse(entry.capturedAt)>=300000));});
            if(!article)break;attempted.add(article.pageid);
            var entry=customEntry(article,range,now), url=viewUrl(config,article.title,entry.period);
            try {entry=parseCustomDaily(article,range,await request(url),config,now,cache.availabilityProof);}
            catch(error) {
                if(error.code==='aborted'||error.code==='request-budget')throw error;
                entry.error=errorInfo(error);
                if(customProofValid(cache.availabilityProof,entry.period,config,now)&&documentedEmptyError(error,url)) {
                    entry.status='available';entry.total=0;entry.zeroBasis='aqs-documented-empty-series';entry.zeroEvidence={requestUrl:url,status:404,problem:clone(error.problem)};entry.error=null;
                }
            }
            cache.series[article.pageid]=entry;cache.requests+=1;cache.totalRequests+=1;completed+=1;await checkpoint();
        }
        var result=projectCustom(section);
        if(result.complete)cache.lastCompleteSnapshot=result;
        else if(remaining()>0)cache.error={code:'custom-views-incomplete',message:'Algumas datas ainda não puderam ser conferidas.'};
        await checkpoint(true);return section;
    }
    async function collectPageviews(options) {
        options=options||{};
        var range=normalizeCustomRange(options.customRange,options.now), original=sectionPrevious(options.previous,'pageviews',normalizeConfig(options.config));
        if(options.activePeriod==='custom'&&!range)fail('Escolha as datas do intervalo personalizado.','invalid-custom-range');
        var previousCustom=original && original.customCache;
        var limit=options.maxRequests===undefined?40:options.maxRequests, used=0, requestJson=requireRequest(options);
        if(limit!==Infinity && (!Number.isInteger(limit)||limit<1))fail('Invalid request budget.');
        async function request(url) {if(options.signal&&options.signal.aborted)fail('Collection was paused.','aborted');if(used>=limit)fail('The request budget is exhausted.','request-budget');used+=1;return requestJson(url);}
        var previous=options.previous;
        if(original && original.customRange) previous=Object.assign({},options.previous,{pageviews:fixedProjection(original)});
        var fixedPeriod=PERIOD_IDS.indexOf(options.activePeriod)>=0?options.activePeriod:(original&&original.activePeriod)||'30d';
        var customReady=original&&JSON.stringify(original.customRange)===JSON.stringify(range)&&original.periods.custom&&original.periods.custom.complete;
        var fixed=await collectFixedPageviews(Object.assign({},options,{previous:previous,requestJson:request,activePeriod:fixedPeriod,
            metadataOnly:!!range&&options.activePeriod==='custom'&&!customReady,onProgress:range?undefined:options.onProgress}));
        if(!range)return fixed;
        return collectCustomRange(fixed,range,options,previousCustom,request,function(){return limit-used;});
    }
    function validateCustomCache(section,captureAt,check) {
        var hasCustom=own(section,'customRange')||own(section,'customCache')||section.periods&&own(section.periods,'custom');
        if(!hasCustom)return;
        var label='Custom article range: ', range=normalizeCustomRange(section.customRange,captureAt), cache=section.customCache;
        check(!!range&&!!cache&&cache.version===1&&sameIdentity(cache,section.identity),label+'invalid range cache identity.');
        if(!range||!cache)return;
        check(JSON.stringify(cache.range)===JSON.stringify(range)&&validTimestamp(cache.capturedAt)&&Date.parse(cache.capturedAt)<=Date.parse(captureAt),label+'invalid cache anchor.');
        var articles=new Map(section.metadata.cohort.map(function(a){return[a.pageid,a];})),source=customSource(range,section.metadata.cohort);
        check(cache.cohortFingerprint===customFingerprint(section.metadata.cohort)&&JSON.stringify(cache.sourcePeriod)===JSON.stringify(source),label+'article cohort or source interval mismatch.');
        check(cache.series&&typeof cache.series==='object'&&!Array.isArray(cache.series)&&Array.isArray(cache.controls)&&cache.controls.length<=2&&
            cache.controlAttempts&&typeof cache.controlAttempts==='object'&&!Array.isArray(cache.controlAttempts),label+'missing collection evidence.');
        var controlTitles=new Set();
        (cache.controls||[]).forEach(function(control){
            check(control&&expectedControlTitles(source).indexOf(control.title)>=0&&!controlTitles.has(control.title)&&control.requestUrl===viewUrl(DEFAULT_CONFIG,control.title,source)&&
                control.project===DEFAULT_CONFIG.project&&control.agent==='user'&&control.access==='all-access'&&control.granularity==='daily'&&
                validTimestamp(control.capturedAt)&&Date.parse(control.capturedAt)<=Date.parse(cache.capturedAt)&&Array.isArray(control.daily)&&control.daily.length===source.days&&
                control.daily.every(function(day,index){return day&&day.date===addDate(source.start,index)&&Number.isSafeInteger(day.views)&&day.views>=0;}),label+'invalid partial availability control.');
            controlTitles.add(control.title);
        });
        if(cache.availabilityProof)check(customProofValid(cache.availabilityProof,source,DEFAULT_CONFIG,cache.capturedAt),label+'invalid zero-availability proof.');
        Object.keys(cache.controlAttempts||{}).forEach(function(title){var error=cache.controlAttempts[title];check(expectedControlTitles(source).indexOf(title)>=0&&error&&typeof error.code==='string'&&typeof error.message==='string'&&
            validTimestamp(error.capturedAt)&&Date.parse(error.capturedAt)<=Date.parse(cache.capturedAt),label+'invalid availability attempt.');});
        Object.keys(cache.series||{}).forEach(function(key){
            var entry=cache.series[key],article=articles.get(Number(key));
            check(article&&entry&&entry.pageid===Number(key)&&entry.title===article.title&&entry.firstEditAt===article.firstEditAt&&
                JSON.stringify(entry.period)===JSON.stringify(effectivePeriod(article,customDefinition(range)))&&validTimestamp(entry.capturedAt)&&
                Date.parse(entry.capturedAt)<=Date.parse(cache.capturedAt),label+'cached article identity, cutoff or interval mismatch.');
            if(!entry||!article)return;
            check(['available','unavailable'].indexOf(entry.status)>=0&&['daily','fixed-period','before-first-edit'].indexOf(entry.basis)>=0&&
                Number.isSafeInteger(entry.partialTotal)&&entry.partialTotal>=0&&Array.isArray(entry.missingDates)&&new Set(entry.missingDates).size===entry.missingDates.length&&
                entry.missingDates.every(function(date){return validDate(date)&&date>=entry.period.start&&date<=entry.period.end;})&&
                Number.isInteger(entry.reportedDays)&&entry.reportedDays>=0&&entry.reportedDays<=entry.period.days,label+'invalid cached daily sum.');
            if(entry.status==='available')check(Number.isSafeInteger(entry.total)&&entry.total>=0&&entry.total===entry.partialTotal&&!entry.missingDates.length,label+'available article has unknown dates or mismatched sums.');
            else check(entry.total===null&&(entry.error||entry.missingDates.length),label+'unavailable article must not provide a total.');
            if(entry.basis==='before-first-edit')check(entry.period.days===0&&entry.total===0,label+'unverified first-edit zero.');
            if(entry.basis==='fixed-period') {
                var fixed=periodsFor(entry.capturedAt)[entry.fixedPeriod];
                check(fixed&&fixed.start===range.start&&fixed.end===range.end&&entry.status==='available',label+'invalid reused fixed-period sum.');
            }
            if(entry.basis==='daily'&&entry.status==='available'&&entry.reportedDays<entry.period.days) {
                check(customProofValid(cache.availabilityProof,entry.period,DEFAULT_CONFIG,entry.capturedAt)&&
                    ['aqs-documented-omitted-zero','aqs-documented-empty-series'].indexOf(entry.zeroBasis)>=0,label+'omitted dates need availability evidence.');
            }
            if(entry.zeroBasis==='aqs-documented-empty-series')check(entry.total===0&&entry.reportedDays===0&&entry.zeroEvidence&&
                documentedEmptyError({status:404,requestUrl:entry.zeroEvidence.requestUrl,problem:entry.zeroEvidence.problem},viewUrl(DEFAULT_CONFIG,entry.title,entry.period)),label+'unverified empty-series response.');
        });
        check(Number.isSafeInteger(cache.requests)&&cache.requests>=0&&Number.isSafeInteger(cache.totalRequests)&&cache.totalRequests>=cache.requests,label+'invalid request progress.');
        if(cache.lastCompleteSnapshot) {
            var snapshot=cache.lastCompleteSnapshot;
            check(snapshot.complete===true&&JSON.stringify(snapshot.period)===JSON.stringify(customDefinition(range))&&snapshot.proof&&
                snapshot.proof.eligible===articles.size&&snapshot.proof.exactArticles===articles.size&&snapshot.proof.complete===true&&
                Array.isArray(snapshot.rows)&&snapshot.rows.length===Math.min(500,articles.size)&&snapshot.rows.every(function(row){var article=articles.get(row.pageid);return article&&row.title===article.title&&row.firstEditAt===article.firstEditAt&&Number.isSafeInteger(row.views)&&row.views>=0;})&&
                Number.isSafeInteger(snapshot.total)&&snapshot.total>=0&&snapshot.total===snapshot.allArticleTotal&&snapshot.totalScope==='all-eligible-articles'&&
                snapshot.rankedTotal===snapshot.rows.reduce(function(sum,row){return sum+row.views;},0)&&snapshot.total>=snapshot.rankedTotal,label+'invalid prior same-range snapshot.');
            check(new Set(snapshot.rows.map(function(row){return row.pageid;})).size===snapshot.rows.length&&
                JSON.stringify(snapshot.rows)===JSON.stringify(sortedViewRows(snapshot.rows)),label+'prior snapshot has repeated or unsorted articles.');
        }
        var projected=clone(section);installCustomProjection(projected);
        check(JSON.stringify(section.periods.custom)===JSON.stringify(projected.periods.custom)&&JSON.stringify(section.customProgress)===JSON.stringify(projected.customProgress),label+'custom ranking or progress does not match article evidence.');
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
        check(!own(section,'sourceBasis') || ['history-candidates-v1','eligible-cohort-v1'].indexOf(section.sourceBasis) >= 0, label + 'invalid source interval basis.');
        var source = sourceForState(definitions,section);
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
            var requested = series.requestPeriod || source;
            if (own(series,'requestPeriod')) {
                check(JSON.stringify(series.requestPeriod) === JSON.stringify(effectivePeriod(series,source)), label + 'invalid clipped request period.');
            }
            var seenMissing = new Set();
            (series.missing || []).forEach(function (index) {
                check(Number.isInteger(index) && index >= 0 && index < source.days && !seenMissing.has(index), label + 'invalid or duplicate missing-date index.'); seenMissing.add(index);
                check(addDate(source.start, index) >= countStart(series), label + 'a pre-first-edit date cannot remain unknown.');
            });
            PERIOD_IDS.forEach(function (id) {
                var period = effectivePeriod(series, definitions[id]);
                var missing = (series.missing || []).filter(function (index) { var date = addDate(source.start, index); return date >= period.start && date <= period.end; }).length;
                check(Number.isSafeInteger(series.partialSums[id]) && series.partialSums[id] >= 0 && series.covered[id] === period.days - missing &&
                    series.totals[id] === (missing ? null : series.partialSums[id]) && (period.days !== 0 || series.partialSums[id] === 0), label + 'period coverage or totals do not match the missing dates.');
            });
            check(series.partialSums['30d'] <= series.partialSums['90d'] && series.partialSums['90d'] <= series.partialSums['12m'] && series.partialSums['12m'] <= series.partialSums['since'], label + 'nested period sums are inconsistent.');
            check(!series.firstNonZeroDate || (validDate(series.firstNonZeroDate) && series.firstNonZeroDate >= requested.start && series.firstNonZeroDate <= requested.end), label + 'invalid first positive date.');
            check(!!series.titleHistoryBeforePageCreation === !!(series.creationDate && series.firstNonZeroDate && series.firstNonZeroDate < series.creationDate), label + 'invalid prior-title-history flag.');
            check(!series.creationDate || validDate(series.creationDate), label + 'invalid creation date.');
            if (series.creationEvidence && series.creationEvidence.type === 'first-revision') {
                check(series.creationEvidence.parentid === 0 && Number.isSafeInteger(series.creationEvidence.revid) && series.creationEvidence.revid > 0 && validTimestamp(series.creationEvidence.timestamp) && series.creationEvidence.timestamp.slice(0, 10) === series.creationDate, label + 'invalid creation evidence.');
            }
            check(['available', 'partial', 'unavailable'].indexOf(series.status) >= 0 && (series.status !== 'available' || series.missing.length === 0), label + 'invalid series status.');
            if (own(series, 'reportedDays')) {
                check(Number.isInteger(series.reportedDays) && series.reportedDays >= 0 && series.reportedDays <= requested.days, label + 'invalid explicit reported-day count.');
            }
            if (own(series,'coverageBasis')) {
                check(series.coverageBasis === 'before-first-edit' && !!series.requestPeriod && requested.days === 0 &&
                    series.validated === true && series.reportedDays === 0 && !series.error && !series.firstNonZeroDate &&
                    !series.zeroBasis && series.missing.length === 0 && PERIOD_IDS.every(function (id) { return series.partialSums[id] === 0; }),
                    label + 'invalid before-first-edit coverage.');
            }
            if (series.zeroBasis) {
                check(['aqs-documented-omitted-zero', 'aqs-documented-empty-series'].indexOf(series.zeroBasis) >= 0 &&
                    availabilityValid && Date.parse(section.availabilityProof.capturedAt) <= Date.parse(series.capturedAt) &&
                    series.availabilityProofAt === section.availabilityProof.capturedAt && series.validated === true &&
                    series.status === 'available' && series.missing.length === 0 && Number.isInteger(series.reportedDays) && series.reportedDays < requested.days,
                    label + 'zero-filled article lacks matching availability evidence.');
                if (series.zeroBasis === 'aqs-documented-empty-series') {
                    var evidence = series.zeroEvidence;
                    check(!!evidence && evidence.status === 404 && series.reportedDays === 0 && !series.firstNonZeroDate &&
                        PERIOD_IDS.every(function (id) { return series.partialSums[id] === 0; }) &&
                        documentedEmptyError({ status: 404, requestUrl: evidence.requestUrl, problem: evidence.problem }, viewUrl(DEFAULT_CONFIG, series.title, requested)),
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
                validateCustomCache(state.pageviews,state.capturedAt,check);
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
            pageviews.sourcePeriod = sourceForState(periodsFor(pageviews.startedAt),pageviews);
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
        periodsFor: periodsFor, addMonthsClamped: addMonthsClamped, PERIOD_IDS: PERIOD_IDS, normalizeCustomRange:normalizeCustomRange,
        METRIC_VERSION: METRIC_VERSION, TOTAL_MODEL: TOTAL_MODEL, COVERAGE_FLOOR: COVERAGE_FLOOR, effectivePeriod: effectivePeriod,
        viewPeriod: function (now) { return viewPeriod(nowDate(now)); }
    });
}));
