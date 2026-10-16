/* PerfilWiki 1.1.0: shared, public Portuguese Wikipedia contribution history. */
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
        if (!fromApi && (!Array.isArray(raw) || raw.length !== 9 && raw.length !== 10)) {
            fail('invalid-entry', 'Cached edits must contain nine or ten fields.');
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
            raw.new === true ? 1 : 0, raw.parentid, raw.user, raw.tags,
            Number.isSafeInteger(raw.sizediff) ? raw.sizediff : null] : raw;
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
        if (!fromApi && result.length === 10 && result[9] !== null && !Number.isSafeInteger(result[9])) {
            fail('invalid-entry', 'A cached size difference must be a safe signed integer or null.');
        }
        if (time > upper || (lower && time < lower)) {
            fail('invalid-bounds', 'An edit falls outside the requested time bounds.');
        }
        return [result[0], result[1], result[2], text(result[3], 1024, 'title'), time,
            result[5], result[6], result[7], tags(result[8]), result.length === 10 ? result[9] : null];
    }

    function byteCoverage(entries, scannedAt) {
        var known = entries.reduce(function (count, entry) { return count + (Number.isSafeInteger(entry[9]) ? 1 : 0); }, 0);
        return {version:1, scannedAt:scannedAt, complete:scannedAt !== null && known === entries.length,
            knownEdits:known, totalEdits:entries.length};
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
            pending: null, byteCoverage:byteCoverage([], null)
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
        if (own(input, 'byteCoverage')) {
            var coverage = input.byteCoverage;
            if (!object(coverage) || coverage.version !== 1 || typeof coverage.complete !== 'boolean' ||
                !Number.isSafeInteger(coverage.knownEdits) || !Number.isSafeInteger(coverage.totalEdits)) {
                fail('invalid-cache', 'The byte coverage metadata is invalid.');
            }
            var scannedAt = coverage.scannedAt === null ? null : timestamp(coverage.scannedAt);
            if (scannedAt !== null && (!result.complete || scannedAt !== result.fullScanAt)) {
                fail('invalid-cache', 'The byte coverage must belong to the completed full scan.');
            }
            result.byteCoverage = byteCoverage(result.entries, scannedAt);
            if (coverage.complete !== result.byteCoverage.complete || coverage.knownEdits !== result.byteCoverage.knownEdits ||
                coverage.totalEdits !== result.byteCoverage.totalEdits) { fail('invalid-cache', 'The byte coverage does not match the revisions.'); }
        } else { result.byteCoverage = byteCoverage(result.entries, null); }
        return result;
    }

    function pendingState(input, base, now) {
        if (!object(input) || input.version !== 1 || input.user !== base.user || input.project !== PROJECT ||
            (input.scanMode !== 'full' && input.scanMode !== 'incremental') ||
            own(input, 'sizeDiffVersion') && input.sizeDiffVersion !== 1) {
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
            version: 1, sizeDiffVersion:input.sizeDiffVersion || 0, user: base.user, project: PROJECT, scanMode: input.scanMode,
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
            list: 'usercontribs', ucuser: user, ucprop: 'ids|title|timestamp|flags|tags|sizediff',
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
            scanMode: 'full', cacheHit: false, stale: true, error: null, pending: null, byteCoverage:byteCoverage([],null) };
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
        // A legacy cache gets one resumable full scan for sizediff. A completed
        // attempt remains cacheable even when a hidden delta stays unavailable.
        if (stage && stage.sizeDiffVersion !== 1) { stage = null; }
        var full = !base.complete || !base.byteCoverage.scannedAt || nowMs - new Date(base.fullScanAt).getTime() >= fullRescanMs;
        if (!stage && base.complete && !base.stale && !base.error && !full && !options.force &&
            nowMs - new Date(base.capturedAt).getTime() < refreshMs) {
            base.cacheHit = true;
            return base;
        }
        if (!stage) {
            stage = { version: 1, sizeDiffVersion:1, user: user, project: PROJECT, scanMode: full ? 'full' : 'incremental',
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
                    var completeEntries = Array.from(merged.values()).sort(compare);
                    return { user: user, project: PROJECT, entries: completeEntries, complete: true,
                        capturedAt: stage.anchor, fullScanAt: stage.scanMode === 'full' ? stage.anchor : base.fullScanAt,
                        scanMode: stage.scanMode, cacheHit: false, stale: nowMs - new Date(stage.anchor).getTime() >= refreshMs,
                        error: null, pending: null,
                        byteCoverage:byteCoverage(completeEntries, stage.scanMode === 'full' ? stage.anchor : base.byteCoverage.scannedAt) };
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
