'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const History = require('../src/History.js');

const USER = 'Editor Exemplo';
const NOW = '2024-08-20T12:00:00.000Z';
const DAY = 86400000;
const shift = (value, ms) => new Date(new Date(value).getTime() + ms).toISOString();
const clone = value => JSON.parse(JSON.stringify(value));

function edit(revid, timestamp = shift(NOW, -revid * 1000), changes = {}) {
    return Object.assign({ revid, parentid: Math.max(0, revid - 1), pageid: revid + 100,
        ns: 0, title: 'Página ' + revid, timestamp, user: USER, tags: [], new: false }, changes);
}

function done(entries) { return { batchcomplete: true, query: { usercontribs: entries } }; }
function more(entries, token) {
    return { continue: { uccontinue: token, continue: '-||' }, query: { usercontribs: entries } };
}

function transport(responses) {
    const calls = [];
    const requestJson = async url => {
        calls.push(new URL(url));
        assert.ok(responses.length, 'Unexpected extra request');
        const response = responses.shift();
        if (response instanceof Error) throw response;
        return clone(response);
    };
    return { requestJson, calls };
}

async function complete(entries = [edit(2), edit(1, shift(NOW, -2 * DAY))], options = {}) {
    const io = transport([done(entries)]);
    return History.collect(Object.assign({ user: USER, now: NOW, requestJson: io.requestJson }, options));
}

test('CommonJS and browser global export the same portable API', () => {
    assert.equal(typeof History.collect, 'function');
    const context = vm.createContext({ URL });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/History.js'), 'utf8'), context);
    assert.equal(typeof context.PerfilWikiHistory.collect, 'function');
    assert.equal(typeof context.PerfilWikiHistory.validate, 'function');
    assert.equal(typeof context.PerfilWikiHistory.richToActivityEntries, 'function');
});

test('full scan requests only public ptwiki usercontribs and preserves the ten rich fields', async () => {
    const io = transport([done([edit(3, undefined, { new: true, tags: ['mobile edit', 'visualeditor'], sizediff:17 })])]);
    const result = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson });
    assert.equal(result.complete, true);
    assert.equal(result.scanMode, 'full');
    assert.equal(result.stale, false);
    assert.equal(result.pending, null);
    assert.deepEqual(result.entries[0], [3, 103, 0, 'Página 3', shift(NOW, -3000), 1, 2, USER, ['mobile edit', 'visualeditor'], 17]);
    assert.deepEqual(History.validate(result, { user: USER, now: NOW }), { valid: true, errors: [] });
    const url = io.calls[0];
    assert.equal(url.origin + url.pathname, 'https://pt.wikipedia.org/w/api.php');
    assert.equal(url.searchParams.get('action'), 'query');
    assert.equal(url.searchParams.get('list'), 'usercontribs');
    assert.equal(url.searchParams.get('ucuser'), USER);
    assert.equal(url.searchParams.get('ucprop'), 'ids|title|timestamp|flags|tags|sizediff');
    assert.equal(url.searchParams.get('ucdir'), 'older');
    assert.equal(url.searchParams.get('uclimit'), '500');
    assert.equal(url.searchParams.get('formatversion'), '2');
    assert.equal(url.searchParams.get('ucstart'), NOW);
    assert.equal(url.searchParams.has('token'), false);
    assert.equal(url.searchParams.has('assert'), false);
});

test('an empty terminal result is a complete empty history', async () => {
    const result = await complete([]);
    assert.equal(result.complete, true);
    assert.deepEqual(result.entries, []);
    assert.deepEqual(History.richToActivityEntries(result), []);
});

test('cold scan resumes through multiple budgets with its original anchor and no partial metrics', async () => {
    const io = transport([
        more([edit(5, shift(NOW, -1000)), edit(4, shift(NOW, -2000))], 'cursor-a'),
        more([edit(4, shift(NOW, -2000)), edit(3, shift(NOW, -3000))], 'cursor-b'),
        done([edit(2, shift(NOW, -4000)), edit(1, shift(NOW, -5000))])
    ]);
    const first = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson, maxRequests: 1 });
    assert.equal(first.complete, false);
    assert.deepEqual(first.entries, []);
    assert.equal(first.capturedAt, null);
    assert.equal(first.pending.entries.length, 2);
    assert.equal(first.pending.cursor.uccontinue, 'cursor-a');
    assert.equal(History.validate(first, { user: USER, now: NOW }).valid, true);
    assert.throws(() => History.richToActivityEntries(first), /complete history/);
    const second = await History.collect({ user: USER, now: shift(NOW, 60000), previous: clone(first), requestJson: io.requestJson, maxRequests: 1 });
    assert.equal(second.complete, false);
    assert.equal(second.pending.entries.length, 3);
    assert.equal(second.pending.pagesFetched, 2);
    assert.equal(History.validate(second, { user: USER, now: shift(NOW, 60000) }).valid, true);
    const third = await History.collect({ user: USER, now: shift(NOW, 120000), previous: clone(second), requestJson: io.requestJson, maxRequests: 1 });
    assert.equal(third.complete, true);
    assert.deepEqual(third.entries.map(entry => entry[0]), [5, 4, 3, 2, 1]);
    assert.equal(third.capturedAt, NOW);
    assert.equal(third.fullScanAt, NOW);
    assert.equal(third.pending, null);
    assert.deepEqual(io.calls.map(url => url.searchParams.get('ucstart')), [NOW, NOW, NOW]);
    assert.deepEqual(io.calls.map(url => url.searchParams.get('uccontinue')), [null, 'cursor-a', 'cursor-b']);
    assert.equal(new Set(History.richToActivityEntries(third).map(entry => entry[0])).size, 5);
});

test('one invocation can paginate to completion and deduplicates boundary revisions', async () => {
    const newest = edit(4, shift(NOW, -1000));
    const oldest = edit(3, shift(NOW, -2000));
    const io = transport([more([newest], 'next'), done([newest, oldest])]);
    const result = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson });
    assert.equal(result.complete, true);
    assert.deepEqual(result.entries.map(entry => entry[0]), [4, 3]);
    assert.equal(io.calls.length, 2);
});

test('fresh valid history uses no transport, while force bypasses the freshness cache', async () => {
    const previous = await complete();
    const fresh = await History.collect({ user: USER, now: shift(NOW, 1000), previous,
        requestJson: async () => assert.fail('A fresh history must not request data') });
    assert.equal(fresh.cacheHit, true);
    assert.equal(fresh.capturedAt, NOW);
    assert.equal(fresh.stale, false);
    const io = transport([done([edit(2)])]);
    const forced = await History.collect({ user: USER, now: shift(NOW, 1000), previous, force: true, requestJson: io.requestJson });
    assert.equal(forced.cacheHit, false);
    assert.equal(forced.scanMode, 'incremental');
    assert.equal(io.calls.length, 1);
});

test('incremental refresh replaces the 24 hour overlap and retains older revisions once', async () => {
    const recent = edit(7, shift(NOW, -1000));
    const deleted = edit(6, shift(NOW, -5000));
    const old = edit(1, shift(NOW, -3 * DAY));
    const previous = await complete([recent, deleted, old]);
    const nextNow = shift(NOW, 360000);
    const changed = Object.assign({}, recent, { title: 'Página renomeada', tags: ['visualeditor'] });
    const io = transport([done([edit(8, shift(NOW, 300000)), changed])]);
    const result = await History.collect({ user: USER, now: nextNow, previous, requestJson: io.requestJson });
    assert.equal(result.scanMode, 'incremental');
    assert.equal(result.fullScanAt, NOW);
    assert.equal(result.capturedAt, nextNow);
    assert.deepEqual(result.entries.map(entry => entry[0]), [8, 7, 1]);
    assert.equal(result.entries[1][3], 'Página renomeada');
    assert.equal(io.calls[0].searchParams.get('ucend'), shift(recent.timestamp, -DAY));
    assert.equal(History.validate(result, { user: USER, now: nextNow }).valid, true);
});

test('empty complete history refreshes incrementally with a bounded overlap', async () => {
    const previous = await complete([]);
    const io = transport([done([])]);
    const result = await History.collect({ user: USER, now: shift(NOW, 360000), previous, requestJson: io.requestJson });
    assert.equal(result.complete, true);
    assert.equal(result.scanMode, 'incremental');
    assert.equal(io.calls[0].searchParams.get('ucend'), shift(NOW, -DAY));
});

test('monthly rescan keeps old complete data visible until the replacement is complete', async () => {
    const previous = await complete([edit(2), edit(1, shift(NOW, -2 * DAY))]);
    const nextNow = shift(NOW, 30 * DAY);
    const fresh = edit(9, shift(nextNow, -1000));
    const io = transport([more([fresh], 'rescan-next'), done([])]);
    const pending = await History.collect({ user: USER, now: nextNow, previous, maxRequests: 1, requestJson: io.requestJson });
    assert.equal(pending.complete, true);
    assert.equal(pending.stale, true);
    assert.deepEqual(pending.entries, previous.entries);
    assert.equal(pending.capturedAt, previous.capturedAt);
    assert.equal(pending.pending.scanMode, 'full');
    assert.equal(io.calls[0].searchParams.has('ucend'), false);
    assert.equal(History.validate(pending, { user: USER, now: nextNow }).valid, true);
    assert.equal(History.richToActivityEntries(pending).length, previous.entries.length);
    const result = await History.collect({ user: USER, now: shift(nextNow, 1000), previous: pending, maxRequests: 1, requestJson: io.requestJson });
    assert.deepEqual(result.entries.map(entry => entry[0]), [9]);
    assert.equal(result.fullScanAt, nextNow);
    assert.equal(result.pending, null);
});

test('a resumed scan older than the freshness window finishes with a stale complete snapshot', async () => {
    const io = transport([more([edit(2)], 'slow'), done([])]);
    const first = await History.collect({ user: USER, now: NOW, maxRequests: 1, requestJson: io.requestJson });
    const result = await History.collect({ user: USER, now: shift(NOW, DAY), previous: first, requestJson: io.requestJson });
    assert.equal(result.complete, true);
    assert.equal(result.stale, true);
    assert.equal(result.capturedAt, NOW);
});

test('network error keeps complete history and a previously valid pending cursor', async () => {
    const previous = await complete();
    const nextNow = shift(NOW, 360000);
    const io = transport([more([edit(3, shift(nextNow, -1000))], 'retry-cursor'), new Error('Synthetic transport failure')]);
    const failed = await History.collect({ user: USER, now: nextNow, previous, maxRequests: 2, requestJson: io.requestJson });
    assert.equal(failed.complete, true);
    assert.equal(failed.stale, true);
    assert.equal(failed.error.code, 'request-failed');
    assert.deepEqual(failed.entries, previous.entries);
    assert.equal(failed.pending.cursor.uccontinue, 'retry-cursor');
    assert.equal(failed.pending.pagesFetched, 1);
    assert.equal(History.validate(failed, { user: USER, now: nextNow }).valid, true);
    const resume = transport([done([edit(2)])]);
    const result = await History.collect({ user: USER, now: shift(nextNow, 1000), previous: failed, requestJson: resume.requestJson });
    assert.equal(result.complete, true);
    assert.deepEqual(result.entries.map(entry => entry[0]), [3, 2, 1]);
    assert.equal(resume.calls[0].searchParams.get('uccontinue'), 'retry-cursor');
});

test('first request failure returns an incomplete empty state', async () => {
    const result = await History.collect({ user: USER, now: NOW, requestJson: async () => { throw new Error('offline'); } });
    assert.equal(result.complete, false);
    assert.equal(result.stale, true);
    assert.deepEqual(result.entries, []);
    assert.equal(result.pending, null);
    assert.equal(History.validate(result, { user: USER, now: NOW }).valid, true);
});

test('repeated cursor cannot advance the pending scan', async () => {
    const io = transport([more([edit(2, shift(NOW, -1000))], 'loop'), more([edit(1, shift(NOW, -2000))], 'loop')]);
    const result = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson });
    assert.equal(result.complete, false);
    assert.equal(result.error.code, 'pagination-loop');
    assert.deepEqual(result.pending.entries.map(entry => entry[0]), [2]);
    assert.equal(result.pending.pagesFetched, 1);
});

test('a cursor returning only duplicates fails without publishing partial data', async () => {
    const entry = edit(2);
    const io = transport([more([entry], 'one'), more([entry], 'two')]);
    const result = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson });
    assert.equal(result.error.code, 'pagination-no-progress');
    assert.equal(result.complete, false);
    assert.deepEqual(result.entries, []);
    assert.equal(result.pending.entries.length, 1);
});

test('a cursor moving toward newer edits is rejected', async () => {
    const io = transport([more([edit(2, shift(NOW, -2000))], 'one'), done([edit(3, shift(NOW, -1000))])]);
    const result = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson });
    assert.equal(result.error.code, 'pagination-no-progress');
    assert.equal(result.complete, false);
});

test('conflicting repeats fail atomically, including conflicts within one batch', async () => {
    const first = edit(2);
    for (const responses of [
        [more([first], 'one'), done([Object.assign({}, first, { title: 'Outro título' })])],
        [done([first, Object.assign({}, first, { parentid: 0 })])]
    ]) {
        const io = transport(responses);
        const result = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson });
        assert.equal(result.error.code, 'conflicting-revision');
        assert.equal(result.complete, false);
        assert.deepEqual(result.entries, []);
    }
});

test('tag order is canonical and duplicate revision tags do not double count', async () => {
    const first = edit(2, undefined, { tags: ['visualeditor', 'mobile edit'] });
    const reversed = Object.assign({}, first, { tags: ['mobile edit', 'visualeditor'] });
    const io = transport([done([first, reversed])]);
    const result = await History.collect({ user: USER, now: NOW, requestJson: io.requestJson });
    assert.equal(result.complete, true);
    assert.equal(result.entries.length, 1);
    assert.deepEqual(result.entries[0][8], ['mobile edit', 'visualeditor']);
});

test('missing completion marker, API warnings and API errors never claim completion', async () => {
    for (const response of [
        { query: { usercontribs: [edit(2)] } },
        { batchcomplete: '', query: { usercontribs: [edit(2)] } },
        Object.assign(done([edit(2)]), { warnings: { usercontribs: { warnings: 'Synthetic warning' } } }),
        { error: { code: 'maxlag' } }
    ]) {
        const result = await History.collect({ user: USER, now: NOW, requestJson: async () => response });
        assert.equal(result.complete, false);
        assert.deepEqual(result.entries, []);
        assert.ok(result.error);
    }
});

test('every API edit requires its user, parent id, valid tags and formatversion 2 flags', async () => {
    const invalid = [
        { user: undefined }, { user: 'Outro Editor' }, { parentid: undefined }, { parentid: -1 },
        { parentid: 2 }, { revid: 0 }, { revid: 1.5 }, { pageid: -1 }, { ns: -1 },
        { title: '' }, { timestamp: '2024-02-30T00:00:00Z' }, { timestamp: shift(NOW, 1000) },
        { tags: undefined }, { tags: 'visualeditor' }, { tags: ['a', 'a'] }, { tags: [''] },
        { new: '' }, { new: 1 }, { minor: '' }, { top: 1 }
    ];
    for (const changes of invalid) {
        const result = await History.collect({ user: USER, now: NOW, requestJson: async () => done([edit(2, undefined, changes)]) });
        assert.equal(result.complete, false, JSON.stringify(changes));
        assert.deepEqual(result.entries, []);
        assert.ok(result.error, JSON.stringify(changes));
    }
    const valid = await complete([edit(2, undefined, { new: false, minor: true, top: false })]);
    assert.equal(valid.complete, true);
    assert.equal(valid.entries[0][5], 0);
});

test('invalid API page preserves the last complete history', async () => {
    const previous = await complete();
    const result = await History.collect({ user: USER, now: shift(NOW, 360000), previous,
        requestJson: async () => done([edit(9, undefined, { user: 'Outro Editor' })]) });
    assert.equal(result.complete, true);
    assert.equal(result.stale, true);
    assert.equal(result.error.code, 'wrong-identity');
    assert.deepEqual(result.entries, previous.entries);
    assert.equal(result.capturedAt, previous.capturedAt);
    assert.equal(result.pending, null);
});

test('wrong identity or future complete caches are discarded before any cache hit', async () => {
    const valid = await complete();
    for (const mutate of [
        state => { state.user = 'Outro Editor'; },
        state => { state.project = 'en.wikipedia.org'; },
        state => { state.capturedAt = shift(NOW, DAY); },
        state => { state.entries[0][7] = 'Outro Editor'; },
        state => { state.entries[0][4] = shift(NOW, DAY); },
        state => { state.entries.push(state.entries[0]); }
    ]) {
        const previous = clone(valid);
        mutate(previous);
        assert.equal(History.validate(previous, { user: USER, now: NOW }).valid, false);
        const io = transport([done([])]);
        const result = await History.collect({ user: USER, now: NOW, previous, requestJson: io.requestJson });
        assert.equal(result.complete, true);
        assert.equal(result.scanMode, 'full');
        assert.equal(result.cacheHit, false);
        assert.deepEqual(result.entries, []);
        assert.equal(io.calls[0].searchParams.has('uccontinue'), false);
    }
});

test('future or wrong identity pending stages are discarded without resuming an unsafe cursor', async () => {
    const io = transport([more([edit(2)], 'unsafe')]);
    const good = await History.collect({ user: USER, now: NOW, maxRequests: 1, requestJson: io.requestJson });
    for (const mutate of [
        state => { state.pending.user = 'Outro Editor'; },
        state => { state.pending.project = 'en.wikipedia.org'; },
        state => { state.pending.anchor = shift(NOW, DAY); },
        state => { state.pending.entries[0][4] = shift(NOW, DAY); },
        state => { state.pending.cursor.action = 'edit'; },
        state => { state.pending.seenCursors.push('unsafe'); }
    ]) {
        const previous = clone(good);
        mutate(previous);
        assert.equal(History.validate(previous, { user: USER, now: NOW }).valid, false);
        const fresh = transport([done([])]);
        const result = await History.collect({ user: USER, now: NOW, previous, requestJson: fresh.requestJson });
        assert.equal(result.complete, true);
        assert.deepEqual(result.entries, []);
        assert.equal(fresh.calls[0].searchParams.has('uccontinue'), false);
    }
});

test('invalid pending stage does not destroy otherwise valid last complete data on a later error', async () => {
    const previous = await complete();
    const nextNow = shift(NOW, 31 * DAY);
    const io = transport([more([edit(9, shift(nextNow, -1000))], 'rescan')]);
    const pending = await History.collect({ user: USER, now: nextNow, previous, maxRequests: 1, requestJson: io.requestJson });
    pending.pending.user = 'Outro Editor';
    const failed = await History.collect({ user: USER, now: nextNow, previous: pending,
        requestJson: async () => { throw new Error('offline'); } });
    assert.equal(failed.complete, true);
    assert.equal(failed.stale, true);
    assert.deepEqual(failed.entries, previous.entries);
    assert.equal(failed.pending, null);
});

test('incremental pagination also resumes and does not merge its partial overlap early', async () => {
    const previous = await complete();
    const nextNow = shift(NOW, 360000);
    const io = transport([more([edit(3, shift(nextNow, -1000))], 'incremental-next'), done([edit(2)])]);
    const first = await History.collect({ user: USER, now: nextNow, previous, maxRequests: 1, requestJson: io.requestJson });
    assert.equal(first.complete, true);
    assert.deepEqual(first.entries, previous.entries);
    assert.equal(first.pending.scanMode, 'incremental');
    const result = await History.collect({ user: USER, now: shift(nextNow, 1000), previous: clone(first), requestJson: io.requestJson });
    assert.deepEqual(result.entries.map(entry => entry[0]), [3, 2, 1]);
    assert.equal(result.pending, null);
    assert.equal(result.fullScanAt, NOW);
    assert.equal(io.calls[0].searchParams.get('ucend'), io.calls[1].searchParams.get('ucend'));
});

test('activity conversion produces independent six field tuples only', async () => {
    const history = await complete();
    const activity = History.richToActivityEntries(history);
    assert.ok(activity.every(entry => entry.length === 6));
    assert.deepEqual(activity[0], history.entries[0].slice(0, 6));
    activity[0][3] = 'Changed locally';
    assert.notEqual(activity[0][3], history.entries[0][3]);
});

test('same-second revision ties use descending revision identifiers through resumption', async () => {
    const timestamp = shift(NOW, -1000);
    const io = transport([more([edit(4, timestamp), edit(3, timestamp)], 'same-second'),
        done([edit(3, timestamp), edit(2, timestamp), edit(1, shift(NOW, -2000))])]);
    const pending = await History.collect({ user: USER, now: NOW, maxRequests: 1, requestJson: io.requestJson });
    const result = await History.collect({ user: USER, now: NOW, previous: clone(pending), requestJson: io.requestJson });
    assert.equal(result.complete, true);
    assert.deepEqual(result.entries.map(entry => entry[0]), [4, 3, 2, 1]);
    assert.equal(History.validate(result, { user: USER, now: NOW }).valid, true);
});

test('untrusted cached arrays and cursors are bounded before traversal', async () => {
    const history = await complete();
    const tooManyEntries = clone(history);
    tooManyEntries.entries = new Array(History.limits.entries + 1);
    assert.equal(History.validate(tooManyEntries, { user: USER, now: NOW }).valid, false);
    const tooManyTags = clone(history);
    tooManyTags.entries[0][8] = new Array(History.limits.tags + 1);
    assert.equal(History.validate(tooManyTags, { user: USER, now: NOW }).valid, false);
    const tooManyCursors = clone(history);
    tooManyCursors.stale = true;
    tooManyCursors.pending = { version: 1, user: USER, project: 'pt.wikipedia.org', scanMode: 'full',
        anchor: NOW, lowerBound: null, baseCapturedAt: NOW, baseFullScanAt: NOW,
        pagesFetched: History.limits.cursors + 1, seenCursors: new Array(History.limits.cursors + 1),
        cursor: { uccontinue: 'invalid' }, entries: history.entries };
    assert.equal(History.validate(tooManyCursors, { user: USER, now: NOW }).valid, false);
});

test('sparse arrays cannot bypass edit, tag or cursor validation', async () => {
    const valid = await complete();
    const sparseCache = clone(valid);
    sparseCache.entries = new Array(1);
    assert.equal(History.validate(sparseCache, { user: USER, now: NOW }).valid, false);
    const sparseTags = clone(valid);
    sparseTags.entries[0][8] = new Array(1);
    assert.equal(History.validate(sparseTags, { user: USER, now: NOW }).valid, false);
    const sparsePage = await History.collect({ user: USER, now: NOW, requestJson: async () => done(new Array(1)) });
    assert.equal(sparsePage.complete, false);
    assert.equal(sparsePage.error.code, 'invalid-entry');
    const sparseApiTags = await History.collect({ user: USER, now: NOW,
        requestJson: async () => done([edit(2, undefined, { tags: new Array(1) })]) });
    assert.equal(sparseApiTags.complete, false);
    const io = transport([more([edit(2, shift(NOW, -1000))], 'first'), more([edit(1, shift(NOW, -2000))], 'second')]);
    const pending = await History.collect({ user: USER, now: NOW, maxRequests: 2, requestJson: io.requestJson });
    delete pending.pending.seenCursors[0];
    assert.equal(History.validate(pending, { user: USER, now: NOW }).valid, false);
});

test('bad options and oversized untrusted batches fail safely', async () => {
    for (const changes of [{ user: '' }, { user: null }, { user: ' ' }, { now: null }, { now: 'invalid' },
        { maxRequests: 0 }, { maxRequests: 1.1 }, { maxRequests: History.limits.requests + 1 },
        { refreshMs: -1 }, { fullRescanMs: Infinity }, { force: 'true' }]) {
        await assert.rejects(History.collect(Object.assign({ user: USER, now: NOW, requestJson: async () => done([]) }, changes)));
    }
    const oversized = await History.collect({ user: USER, now: NOW,
        requestJson: async () => done(Array.from({ length: 501 }, () => edit(2))) });
    assert.equal(oversized.complete, false);
    assert.equal(oversized.error.code, 'invalid-response');
});
