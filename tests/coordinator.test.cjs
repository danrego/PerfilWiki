'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Coordinator = require('../src/Coordinator.js');
const History = require('../src/History.js');
const Statistics = require('../src/Statistics.js');
const Pageviews = require('../src/PageviewsCore.js');
const Cards = require('../src/CardsView.js');
const ActivityView = require('../src/ActivityView.js');

const USER = 'Editora Exemplo';
const NOW = '2024-08-20T12:00:00.000Z';
const DAY = 86400000;
const copy = value => JSON.parse(JSON.stringify(value));
const shift = (value, ms) => new Date(Date.parse(value) + ms).toISOString();
const done = query => ({ batchcomplete: true, query });

function edits(user = USER) {
    return [
        { revid: 103, parentid: 101, pageid: 1, ns: 0, title: 'Artigo Exemplo', timestamp: '2024-08-19T10:00:00Z', user, tags: ['mw-rollback'], new: false },
        { revid: 102, parentid: 0, pageid: 2, ns: 10, title: 'Predefinição:Exemplo', timestamp: '2024-08-18T10:00:00Z', user, tags: [], new: true },
        { revid: 101, parentid: 0, pageid: 1, ns: 0, title: 'Artigo Exemplo', timestamp: '2024-08-17T10:00:00Z', user, tags: [], new: true }
    ];
}

function page(id, options) {
    const result = id === 2 ? { pageid: 2, ns: 10, title: 'Predefinição:Exemplo', contentmodel: 'wikitext' } :
        { pageid: id, ns: 0, title: id === 1 ? 'Artigo Exemplo' : 'Artigo ' + id, contentmodel: 'wikitext' };
    return Object.assign(result, options || {});
}

function daily(url, value) {
    const parts = url.pathname.split('/');
    assert.equal(parts[10], 'daily');
    const start = parts[11], end = parts[12];
    const parse = stamp => Date.parse(stamp.slice(0, 4) + '-' + stamp.slice(4, 6) + '-' + stamp.slice(6, 8) + 'T00:00:00Z');
    const items = [];
    for (let at = parse(start); at <= parse(end); at += DAY) {
        items.push({ project: 'pt.wikipedia.org', article: decodeURIComponent(parts[9]), agent: 'user', access: 'all-access',
            granularity: 'daily', timestamp: new Date(at).toISOString().slice(0, 10).replace(/-/g, '') + '00', views: value });
    }
    return { items };
}

function fixture(options = {}) {
    const calls = [];
    const user = options.user || USER;
    const requestJson = async address => {
        const url = new URL(address), p = Object.fromEntries(url.searchParams);
        const call = { url, p };
        calls.push(call);
        if (options.intercept) {
            const intercepted = await options.intercept(url, p, calls);
            if (intercepted !== undefined) return intercepted;
        }
        if (url.hostname === 'wikimedia.org') return daily(url, 3);
        if (url.hostname === 'xtools.wmcloud.org') {
            return { username: user, project: 'pt.wikipedia.org', namespace: 0, redirects: 'noredirects', deleted: 'all', counts: { '0': { count: options.articles ?? 7, deleted: 2 } } };
        }
        assert.equal(url.hostname, 'pt.wikipedia.org', address);
        assert.equal(p.action, 'query');
        if (p.list === 'usercontribs') {
            assert.equal(p.ucuser, user);
            const rows = options.entries || edits(user);
            return done({ usercontribs: rows.filter(row => Date.parse(row.timestamp) <= Date.parse(p.ucstart) && (!p.ucend || Date.parse(row.timestamp) >= Date.parse(p.ucend))) });
        }
        if (p.meta === 'globaluserinfo') return done({ globaluserinfo: { name: user, editcount: options.editcount ?? 123,
            merged: [{ wiki: 'ptwiki', editcount: 12, url: 'https://pt.wikipedia.org' }] } });
        if (p.list === 'users') return done({ users: [{ name: user, registration: '2010-08-20T00:00:00Z' }] });
        if (p.list === 'logevents') return done({ logevents: [1, 2].map(logid => ({ logid, type: 'thanks', timestamp: '2024-08-16T10:00:00Z' })) });
        if (p.prop === 'info') return done({ pages: p.pageids.split('|').map(id => page(Number(id), (options.pages || {})[id])) });
        assert.fail('Unexpected public request: ' + address);
    };
    return { calls, requestJson };
}

function options(io, extra = {}) {
    return Object.assign({ now: NOW, config: { user: USER, project: 'pt.wikipedia.org', timeZone: 'UTC' },
        requestJson: io.requestJson, maxRequests: 20, checkpointEvery: 1 }, extra);
}

function coordinatorWithStatistics(collect) {
    // A private VM injects one collector failure without changing the frozen production modules.
    const statistics = Object.assign({}, Statistics, { collect });
    const sandbox = { module: { exports: {} }, require(name) {
        if (name === './PageviewsCore.js') return Pageviews;
        if (name === './History.js') return History;
        if (name === './Statistics.js') return statistics;
        assert.fail('Unexpected module: ' + name);
    } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/Coordinator.js'), 'utf8'), sandbox);
    return sandbox.module.exports;
}

test('one shared contribution scan feeds rich statistics, activity summaries, both views and pageviews', async () => {
    const io = fixture();
    const state = await Coordinator.update(options(io));
    assert.equal(io.calls.filter(call => call.p.list === 'usercontribs').length, 1);
    assert.equal(state.complete, true);
    assert.equal(state.fresh, true);
    assert.equal(state.history.entries.length, 3);
    assert.deepEqual(state.activity.entries, History.richToActivityEntries(state.history));
    assert.equal(state.activity.summary.bestStreak, 3);
    assert.equal(state.statistics.metrics.bestStreak, state.activity.summary.bestStreak);
    assert.equal(state.statistics.metrics.reverts, 1);
    assert.equal(state.statistics.metrics.technicalCreated, 1);
    assert.equal(state.statistics.metrics.edited, 1);
    assert.equal(state.statistics.metrics.edits, 123);
    assert.equal(state.statistics.metrics.articles, 7);
    assert.equal(state.pageviews.periods['30d'].allArticleTotal, 6);
    assert.deepEqual(Coordinator.validateState(state), { valid: true, errors: [] });
    assert.match(Cards.html(state.statistics, state.activity, { user: USER, now: NOW }), /id="dan-pu-ritmo-melhor-sequencia">3 dias/);
    assert.match(ActivityView.html(state, { now: NOW }), /3 edições/);
});

test('every published progress checkpoint passes the integrated validator', async () => {
    const io = fixture();
    const snapshots = [];
    const state = await Coordinator.update(options(io, { onProgress: async value => {
        const check = Coordinator.validateState(value);
        assert.equal(check.valid, true, check.errors.join('; '));
        snapshots.push(copy(value));
    } }));
    assert.ok(snapshots.length >= 2);
    assert.ok(snapshots.some(value => value.pageviews.metadata.cursor === 1));
    assert.deepEqual(snapshots.at(-1).activity.entries, state.activity.entries);
    assert.equal(Coordinator.validateState(state).valid, true);
});

test('fresh integrated caches issue no second history scan and preserve exact metadata', async () => {
    const io = fixture();
    const previous = await Coordinator.update(options(io));
    const after = io.calls.length;
    const result = await Coordinator.update(options(io, { now: shift(NOW, 1000), previous }));
    const newCalls = io.calls.slice(after);
    assert.equal(newCalls.filter(call => call.p.list === 'usercontribs').length, 0);
    assert.equal(newCalls.filter(call => call.p.prop === 'info').length, 0);
    assert.equal(result.history.cacheHit, true);
    assert.deepEqual(result.statistics.pageInfo, previous.statistics.pageInfo);
    assert.equal(Coordinator.validateState(result).valid, true);
});

test('incremental new edits update shared history without duplicating old metrics or losing pageview identity', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const nextNow = shift(NOW, 360000);
    const newEdit = { revid: 104, parentid: 103, pageid: 1, ns: 0, title: 'Artigo Exemplo',
        timestamp: shift(NOW, 60000), user: USER, tags: ['mw-undo', 'mw-rollback'], new: false };
    const io = fixture({ entries: [newEdit].concat(edits()), editcount: 124 });
    const state = await Coordinator.update(options(io, { now: nextNow, previous }));
    assert.equal(state.history.scanMode, 'incremental');
    assert.equal(state.history.entries.length, 4);
    assert.equal(state.statistics.metrics.reverts, 2);
    assert.equal(state.statistics.metrics.edited, 1);
    assert.equal(state.activity.summary.edits30, 4);
    assert.equal(state.statistics.metrics.bestStreak, state.activity.summary.bestStreak);
    assert.deepEqual(state.activity.entries, History.richToActivityEntries(state.history));
    assert.equal(state.pageviews.candidates[0].revid, 104);
    assert.equal(state.pageviews.series[1].lastEditAt, newEdit.timestamp);
    assert.equal(io.calls.filter(call => call.p.list === 'usercontribs').length, 1);
    assert.equal(io.calls.filter(call => call.url.hostname === 'wikimedia.org').length, 0);
    assert.equal(Coordinator.validateState(state).valid, true);
});

test('daily current metadata refresh removes redirects and technical deletions coherently', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const io = fixture({ pages: { 1: { redirect: true }, 2: { missing: true } } });
    const state = await Coordinator.update(options(io, { now: shift(NOW, DAY + 1000), previous }));
    assert.equal(state.statistics.metrics.edited, 0);
    assert.equal(state.statistics.metrics.technicalCreated, 0);
    assert.equal(state.pageviews.metadata.cohort.length, 0);
    assert.equal(state.pageviews.periods['30d'].allArticleTotal, 0);
    assert.equal(state.history.entries.length, 3);
    assert.equal(Coordinator.validateState(state).valid, true);
});

test('cold history pagination exposes no invented local metrics or streaks', async () => {
    const io = fixture({ intercept: (_url, p) => p.list === 'usercontribs' ?
        { continue: { continue: '-||', uccontinue: 'cold-next' }, query: { usercontribs: [edits()[0]] } } : undefined });
    const state = await Coordinator.update(options(io, { historyBudget: 1 }));
    assert.equal(state.history.complete, false);
    assert.deepEqual(state.history.entries, []);
    assert.equal(state.history.pending.entries.length, 1);
    assert.equal(state.activity.complete, false);
    assert.equal(state.activity.summary, null);
    for (const key of ['bestStreak', 'reverts', 'edited', 'technicalCreated']) assert.equal(state.statistics.metrics[key], null, key);
    assert.equal(state.complete, false);
    assert.equal(state.fresh, false);
    assert.match(ActivityView.html(state), /ainda não foram consultadas/);
    assert.equal(Coordinator.validateState(state).valid, true);
});

test('cold pending history resumes into one coherent complete state on a later call', async () => {
    const io = fixture({ intercept: (_url, p) => {
        if (p.list !== 'usercontribs') return;
        return p.uccontinue ? done({ usercontribs: edits().slice(1) }) :
            { continue: { continue: '-||', uccontinue: 'cold-next' }, query: { usercontribs: [edits()[0]] } };
    } });
    const pending = await Coordinator.update(options(io, { historyBudget: 1 }));
    const result = await Coordinator.update(options(io, { historyBudget: 1, previous: copy(pending), now: shift(NOW, 1000) }));
    assert.equal(result.history.complete, true);
    assert.equal(result.history.pending, null);
    assert.equal(result.history.capturedAt, NOW);
    assert.equal(result.history.entries.length, 3);
    assert.equal(result.statistics.metrics.reverts, 1);
    assert.equal(result.statistics.metrics.bestStreak, result.activity.summary.bestStreak);
    assert.equal(result.complete, true);
    const calls = io.calls.filter(call => call.p.list === 'usercontribs');
    assert.deepEqual(calls.map(call => call.p.ucstart), [NOW, NOW]);
    assert.deepEqual(calls.map(call => call.p.uccontinue), [undefined, 'cold-next']);
});

test('wrong user cache cannot donate history, cards or pageviews to another account', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const user = 'Outro Editor Exemplo';
    const io = fixture({ user, entries: [] });
    const result = await Coordinator.update(options(io, { previous, config: { user, project: 'pt.wikipedia.org', timeZone: 'UTC' } }));
    assert.equal(result.cacheDiscarded, true);
    assert.equal(result.history.user, user);
    assert.deepEqual(result.history.entries, []);
    assert.deepEqual(result.activity.entries, []);
    assert.equal(result.statistics.metrics.reverts, 0);
    assert.equal(result.statistics.metrics.technicalCreated, 0);
    assert.equal(result.pageviews.candidates.length, 0);
    assert.equal(io.calls.filter(call => call.p.list === 'usercontribs').length, 1);
    assert.equal(Coordinator.validateState(result).valid, true);
});

test('timezone changes discard prior activity summaries and recompute the shared state', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const io = fixture();
    const result = await Coordinator.update(options(io, { previous, config: { user: USER, project: 'pt.wikipedia.org', timeZone: 'Pacific/Honolulu' } }));
    assert.equal(result.cacheDiscarded, true);
    assert.equal(result.activity.summary.activityPeriod.timeZone, 'Pacific/Honolulu');
    assert.equal(result.statistics.metrics.bestStreak, result.activity.summary.bestStreak);
    assert.equal(io.calls.filter(call => call.p.list === 'usercontribs').length, 1);
    assert.equal(Coordinator.validateState(result).valid, true);
});

test('history transport failure preserves complete activity and pageview snapshots', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const io = fixture({ intercept: (_url, p) => { if (p.list === 'usercontribs') throw new Error('Synthetic history outage'); } });
    const result = await Coordinator.update(options(io, { now: shift(NOW, 360000), previous }));
    assert.equal(result.history.stale, true);
    assert.equal(result.activity.stale, true);
    assert.deepEqual(result.history.entries, previous.history.entries);
    assert.deepEqual(result.activity.entries, previous.activity.entries);
    assert.deepEqual(result.pageviews.lastCompleteSnapshot, previous.pageviews.lastCompleteSnapshot);
    assert.equal(result.statistics.metrics.reverts, previous.statistics.metrics.reverts);
    assert.equal(result.fresh, false);
    assert.equal(Coordinator.validateState(result).valid, true);
});

test('global statistics failure retains previous exact cards while other shared data remain valid', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const io = fixture({ intercept: (_url, p) => { if (p.meta === 'globaluserinfo' || p.list === 'logevents') throw new Error('Synthetic global outage'); } });
    const result = await Coordinator.update(options(io, { now: shift(NOW, 360000), previous, forceStatistics: true }));
    assert.equal(result.statistics.metrics.edits, previous.statistics.metrics.edits);
    assert.equal(result.statistics.metrics.thanks, previous.statistics.metrics.thanks);
    assert.ok(result.statistics.errors.length);
    assert.equal(result.fresh, false);
    assert.equal(Statistics.validate(result.statistics, { user: USER, now: result.capturedAt }).valid, true);
    assert.equal(Coordinator.validateState(result).valid, true);
});

test('integrated validator rejects disagreement between rich history and activity tuples', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const bad = copy(previous);
    bad.history.entries[0][3] = 'Título que não consta da atividade';
    assert.equal(Coordinator.validateState(bad).valid, false);
    const io = fixture();
    const result = await Coordinator.update(options(io, { previous: bad }));
    assert.equal(result.cacheDiscarded, true);
    assert.deepEqual(result.activity.entries, History.richToActivityEntries(result.history));
});

test('future rich history and invalid statistics invalidate a reused integrated cache', async () => {
    const original = await Coordinator.update(options(fixture()));
    for (const mutate of [state => { state.history.capturedAt = shift(NOW, DAY); },
        state => { state.statistics.metrics.reverts = -1; }]) {
        const previous = copy(original);
        mutate(previous);
        assert.equal(Coordinator.validateState(previous).valid, false);
        const io = fixture();
        const result = await Coordinator.update(options(io, { previous }));
        assert.equal(result.cacheDiscarded, true);
        assert.equal(Coordinator.validateState(result).valid, true);
    }
});

test('same-evidence statistics must agree with the canonical streak and rich reversion history', async () => {
    const state = await Coordinator.update(options(fixture()));
    assert.equal(state.statistics.metricUpdatedAt.bestStreak, state.activity.capturedAt);
    assert.equal(state.statistics.metricUpdatedAt.reverts, state.history.capturedAt);
    for (const key of ['bestStreak', 'reverts']) {
        const bad = copy(state);
        bad.statistics.metrics[key] += 1;
        assert.equal(Statistics.validate(bad.statistics, { user: USER, now: NOW }).valid, true,
            'The scalar is well formed; the integrated evidence check must reject its value');
        assert.equal(Coordinator.validateState(bad).valid, false, key);
    }
});

test('older retained card counters remain valid when newer shared evidence is available', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const nextNow = shift(NOW, 360000);
    const row = { revid: 104, parentid: 103, pageid: 1, ns: 0, title: 'Artigo Exemplo',
        timestamp: shift(NOW, 60000), user: USER, tags: ['mw-undo'], new: false };
    const state = await Coordinator.update(options(fixture({ entries: [row].concat(edits()) }), { now: nextNow, previous }));
    assert.equal(state.statistics.metrics.reverts, 2);
    state.statistics.metrics.reverts = previous.statistics.metrics.reverts;
    state.statistics.metricUpdatedAt.reverts = previous.statistics.metricUpdatedAt.reverts;
    state.statistics.metrics.bestStreak = previous.statistics.metrics.bestStreak;
    state.statistics.metricUpdatedAt.bestStreak = previous.statistics.metricUpdatedAt.bestStreak;
    assert.notEqual(state.statistics.metricUpdatedAt.reverts, state.history.capturedAt);
    assert.notEqual(state.statistics.metricUpdatedAt.bestStreak, state.activity.capturedAt);
    assert.equal(Coordinator.validateState(state).valid, true);
});

test('card HTML never displays counters or streaks borrowed from another user', async () => {
    const state = await Coordinator.update(options(fixture()));
    const foreignStatistics = copy(state.statistics);
    foreignStatistics.user = 'Outra Editora Exemplo';
    foreignStatistics.metrics.edits = 987654;
    assert.throws(() => Cards.html(foreignStatistics, state.activity, { user: USER, now: NOW }), /outro usuário/);
    assert.throws(() => Cards.wikitext(foreignStatistics, state.activity, { user: USER, now: NOW }), /outro usuário/);
    const foreignActivity = copy(state.activity);
    foreignActivity.identity.user = 'Outra Editora Exemplo';
    foreignActivity.summary.bestStreak = 777;
    assert.throws(() => Cards.html(state.statistics, foreignActivity, { user: USER, now: NOW }), /outro usuário/);
    assert.throws(() => Cards.wikitext(state.statistics, foreignActivity, { user: USER, now: NOW }), /outro usuário/);
});

test('a rejected statistics job preserves old exact cards and exposes its failure without claiming freshness', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const original = copy(previous.statistics);
    const isolated = coordinatorWithStatistics(async () => { throw new Error('Synthetic collector rejection'); });
    const result = await isolated.update(options(fixture(), { now: shift(NOW, 1000), previous }));
    assert.deepEqual(copy(result.statistics.metrics), original.metrics);
    assert.deepEqual(copy(result.statistics.metricUpdatedAt), original.metricUpdatedAt);
    assert.equal(result.statistics.pending, true);
    assert.ok(result.statistics.errors.length);
    assert.equal(result.fresh, false);
    assert.equal(result.complete, false);
    assert.deepEqual(previous.statistics, original, 'The prior successful snapshot must remain immutable');
    assert.equal(Coordinator.validateState(result).valid, true);
});

test('a rejected first statistics job cannot invent a successful card snapshot', async () => {
    const isolated = coordinatorWithStatistics(async () => { throw new Error('Synthetic cold collector rejection'); });
    await assert.rejects(isolated.update(options(fixture())), /Synthetic cold collector rejection/);
});

test('pending statistics prevent freshness even after pageviews and history finish', async () => {
    const snapshots = [];
    const state = await Coordinator.update(options(fixture(), { statisticsBudget: 1,
        onProgress: async value => {
            assert.equal(Coordinator.validateState(value).valid, true);
            snapshots.push(copy(value));
        } }));
    assert.equal(state.history.complete, true);
    assert.equal(state.pageviews.complete, true);
    assert.equal(state.statistics.pending, true);
    assert.equal(state.statistics.metrics.edits, 123);
    assert.equal(state.statistics.metrics.thanks, null);
    assert.equal(state.fresh, false);
    assert.equal(state.complete, false);
    assert.ok(snapshots.length);
    assert.ok(snapshots.every(value => value.fresh === false));
});

test('real service errors respect the retry cooldown while retaining old cards', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const outage = fixture({ intercept: (_url, p) => {
        if (p.meta === 'globaluserinfo') throw new Error('Synthetic public-service outage');
    } });
    const failed = await Coordinator.update(options(outage, { now: shift(NOW, 1000), previous, forceStatistics: true }));
    assert.ok(failed.statistics.errors.includes('Contribuições globais'));
    assert.equal(failed.fresh, false);
    const recovery = fixture();
    const cooling = await Coordinator.update(options(recovery, { now: shift(NOW, 2000), previous: failed }));
    assert.equal(recovery.calls.length, 0, 'An unchanged history must not bypass a real service cooldown');
    assert.deepEqual(cooling.statistics, failed.statistics);
    assert.equal(cooling.fresh, false);
    const resumed = await Coordinator.update(options(recovery, {
        now: shift(failed.statistics.capturedAt, 300000), previous: cooling }));
    assert.equal(recovery.calls.filter(call => call.p.meta === 'globaluserinfo').length, 1);
    assert.deepEqual(resumed.statistics.errors, []);
    assert.equal(resumed.statistics.pending, false);
    assert.equal(resumed.fresh, true);
});

test('explicit statistics refresh can retry a service failure during the cooldown', async () => {
    const previous = await Coordinator.update(options(fixture()));
    const outage = fixture({ intercept: (_url, p) => { if (p.meta === 'globaluserinfo') throw new Error('Synthetic outage'); } });
    const failed = await Coordinator.update(options(outage, { now: shift(NOW, 1000), previous, forceStatistics: true }));
    const recovery = fixture();
    const state = await Coordinator.update(options(recovery, { now: shift(NOW, 2000), previous: failed, forceStatistics: true }));
    assert.equal(recovery.calls.filter(call => call.p.meta === 'globaluserinfo').length, 1);
    assert.equal(state.statistics.pending, false);
    assert.deepEqual(state.statistics.errors, []);
    assert.equal(state.fresh, true);
});

test('newly completed rich history bypasses unrelated service cooldown and fills all exact local cards', async () => {
    let globalAttempts = 0;
    const io = fixture({ intercept: (_url, p) => {
        if (p.list === 'usercontribs') return p.uccontinue ? done({ usercontribs: edits().slice(1) }) :
            { continue: { continue: '-||', uccontinue: 'rich-next' }, query: { usercontribs: [edits()[0]] } };
        if (p.meta === 'globaluserinfo' && ++globalAttempts === 1) throw new Error('Synthetic one-request outage');
    } });
    const poor = await Coordinator.update(options(io, { historyBudget: 1 }));
    assert.equal(poor.history.complete, false);
    assert.ok(poor.statistics.errors.includes('Contribuições globais'));
    assert.ok(poor.statistics.errors.includes('Histórico local completo indisponível'));
    assert.equal(poor.statistics.metrics.reverts, null);
    const rich = await Coordinator.update(options(io, { historyBudget: 1, now: shift(NOW, 1000), previous: poor }));
    assert.equal(globalAttempts, 2);
    assert.equal(rich.history.complete, true);
    assert.equal(rich.statistics.metrics.edits, 123);
    assert.equal(rich.statistics.metrics.reverts, 1);
    assert.equal(rich.statistics.metrics.edited, 1);
    assert.equal(rich.statistics.metrics.technicalCreated, 1);
    assert.equal(rich.statistics.metrics.bestStreak, rich.activity.summary.bestStreak);
    assert.equal(rich.statistics.pending, false);
    assert.deepEqual(rich.statistics.errors, []);
    assert.equal(rich.complete, true);
    assert.equal(rich.fresh, true);
    assert.equal(Coordinator.validateState(rich).valid, true);
});


test('sent-thanks opt-in reaches the collector without another history scan', async () => {
    for (const selected of [false, true]) {
        const io = fixture({intercept:async (_url, p) => p.list === 'logevents' && p.leuser ? done({logevents:[]}) : undefined});
        const state = await Coordinator.update(options(io, {includeThanksSent:selected}));
        assert.equal(Coordinator.validateState(state).valid,true);
        assert.equal(io.calls.filter(call=>call.p.list==='usercontribs').length,1);
        assert.equal(io.calls.filter(call=>call.p.list==='logevents' && call.p.leuser===USER).length,selected?1:0);
        if (selected) assert.equal(state.statistics.metrics.thanksSent,0);
    }
});


test('earliest registration metadata is optional and reuses the shared global lookup', async () => {
    const io = fixture({intercept:async (_url,p)=>p.meta==='globaluserinfo'?done({globaluserinfo:{name:USER,registration:'2015-01-01T00:00:00Z',editcount:123,merged:[{wiki:'ptwiki',editcount:12,url:'https://pt.wikipedia.org',registration:'2008-05-15T12:00:00Z'}]}}):undefined});
    const state = await Coordinator.update(options(io,{includeEarliestRegistration:true}));
    assert.equal(Coordinator.validateState(state).valid,true);
    assert.equal(state.statistics.metrics.earliestRegistration,'2008-05-15T12:00:00Z');
    assert.equal(state.statistics.metrics.registration,'2010-08-20T00:00:00Z');
    assert.equal(state.statistics.registrationCoverage.complete,true);
    assert.equal(io.calls.filter(call=>call.p.meta==='globaluserinfo').length,1);
    assert.equal(io.calls.filter(call=>call.p.list==='usercontribs').length,1);
});

test('one actual request budget covers history, statistics and pageviews while tiny cycles resume without service errors or false unavailable results',async()=>{
    const io=fixture(),snapshots=[];let state=null,rounds=0;
    for(;rounds<30;rounds++) {
        const before=io.calls.length;
        state=await Coordinator.update(options(io,{maxRequests:4,previous:state,now:shift(NOW,rounds*1000),onProgress:value=>{assert.equal(Coordinator.validateState(value).valid,true);snapshots.push(copy(value));}}));
        assert.ok(io.calls.length-before<=4,'Every complete cycle dispatches at most its four shared requests');
        assert.equal(Coordinator.validateState(state).valid,true);
        assert.equal(state.statistics.errors.some(label=>label!=='Histórico local completo indisponível'),false,'Exhausting the shared budget is pending work, not a service failure');
        assert.equal(state.pageviews.error,null,'Budget exhaustion cannot mark article data unavailable');
        assert.ok(Object.values(state.pageviews.series).every(series=>!series.error),'No synthetic failed series is stored on budget exhaustion');
        if(state.complete)break;
    }
    assert.ok(rounds>1&&rounds<30,'Repeated bounded cycles eventually finish the real collectors');
    assert.equal(state.complete,true);assert.equal(state.statistics.metrics.edits,123);assert.equal(state.statistics.metrics.articles,7);assert.equal(state.pageviews.periods['30d'].allArticleTotal,6);
    assert.ok(snapshots.length>2);
});

test('a small shared budget keeps an existing complete snapshot and its exact metrics until resumed work verifies a replacement',async()=>{
    const previous=await Coordinator.update(options(fixture()));
    const nextNow=shift(NOW,DAY+1000),io=fixture({editcount:124});
    const state=await Coordinator.update(options(io,{previous,maxRequests:1,now:nextNow}));
    assert.equal(io.calls.length,1);
    assert.equal(state.statistics.metrics.edits,previous.statistics.metrics.edits);
    assert.equal(state.statistics.metrics.articles,previous.statistics.metrics.articles);
    assert.equal(state.statistics.pending,true);
    assert.deepEqual(state.statistics.errors,[]);
    assert.equal(state.pageviews.error,null);
    const snapshot=state.pageviews.lastCompleteSnapshot;
    assert.ok(snapshot);assert.equal(snapshot.periods['30d'].allArticleTotal,previous.pageviews.periods['30d'].allArticleTotal);
    assert.equal(Coordinator.validateState(state).valid,true);
});

test('the forty-request cycle limit is enforced across independent collectors, including concurrent statistics and pageviews',async()=>{
    const counters={history:0,statistics:0,pageviews:0};
    async function consume(stage,options) {for(let index=0;index<options.maxRequests;index++){try{await options.requestJson(stage);counters[stage]++;}catch(error){assert.equal(error.code,'request-budget');break;}}}
    const history={collect:async opts=>{await consume('history',opts);return {complete:false,error:null,pending:{}};},validate:()=>({valid:true})};
    const statistics={collect:async opts=>{await consume('statistics',opts);return {metrics:{},metricUpdatedAt:{},errors:[],pending:true};},validate:()=>({valid:true})};
    const pageviews={DEFAULT_CONFIG:{},validateState:()=>({valid:true}),collectPageviews:async opts=>{await consume('pageviews',opts);return {periods:{},complete:false,stale:true};}};
    const sandbox={module:{exports:{}},require:name=>({'./History.js':history,'./Statistics.js':statistics,'./PageviewsCore.js':pageviews}[name])};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/Coordinator.js'),'utf8'),sandbox);
    let dispatches=0;await sandbox.module.exports.update({config:{user:USER,timeZone:'UTC'},now:NOW,maxRequests:40,historyBudget:20,statisticsBudget:20,requestJson:async()=>{dispatches++;return {};}});
    assert.equal(dispatches,40);assert.equal(Object.values(counters).reduce((sum,value)=>sum+value,0),40);assert.equal(counters.history,20);assert.ok(counters.statistics>0&&counters.pageviews>0);
});
