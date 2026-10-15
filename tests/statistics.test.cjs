'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const statistics = require('../src/Statistics.js');
const USER = "Érica D'Ávila";
const NOW = '2026-10-15T16:00:00.000Z';
const copy = value => JSON.parse(JSON.stringify(value));
const entry = (id, extra = {}) => {
    const value = Object.assign({ revid: id + 1000, pageid: id, ns: 0, title: 'Artigo ' + id,
        timestamp: '2026-10-14T14:00:00.000Z', isNew: 0, parentid: id + 900, user: USER, tags: [] }, extra);
    return [value.revid, value.pageid, value.ns, value.title, value.timestamp, value.isNew, value.parentid, value.user, value.tags];
};
const history = (entries = [entry(1)], now = NOW, user = USER) => ({ user, project: 'pt.wikipedia.org', capturedAt: now, complete: true, entries });
const activity = (best = 7, now = NOW, user = USER) => ({ identity: { user, project: 'pt.wikipedia.org' }, complete: true, capturedAt: now, summary: { bestStreak: best } });
const account = (wiki = 'ptwiki', editcount = 55, host = 'pt.wikipedia.org') => ({ wiki, editcount, url: 'https://' + host });
const page = (id, extra = {}) => Object.assign({ pageid: id, ns: 0, title: 'Artigo ' + id, contentmodel: 'wikitext' }, extra);
const result = query => ({ batchcomplete: true, query });
function fixture(options = {}) {
    const calls = [], accounts = options.accounts || [account()];
    const transport = async url => {
        const parsed = new URL(url), params = Object.fromEntries(parsed.searchParams);
        calls.push({ url, parsed, params });
        if (options.before) {
            const intercepted = await options.before(parsed, params, calls);
            if (intercepted !== undefined) { return intercepted; }
        }
        if (parsed.hostname === 'xtools.wmcloud.org') {
            const segments = parsed.pathname.split('/').map(decodeURIComponent), host = segments[4];
            assert.equal(segments[5], options.user || USER);
            assert.deepEqual(segments.slice(6), ['0', 'noredirects', 'all']);
            return { username: options.user || USER, project: host, namespace: 0, redirects: 'noredirects', deleted: 'all', counts: { '0': { count: (options.articleCounts || {})[host] ?? 4, deleted: 2 } } };
        }
        assert.equal(params.action, 'query');
        if (params.meta === 'globaluserinfo') {
            assert.equal(params.guiuser, options.user || USER);
            return result({ globaluserinfo: { name: options.user || USER, editcount: options.editcount ?? 999, merged: accounts } });
        }
        if (params.list === 'users') { return result({ users: [{ name: options.user || USER, registration: options.registration === undefined ? '2008-05-25T10:30:00Z' : options.registration }] }); }
        if (params.prop === 'info') {
            return result({ pages: params.pageids.split('|').map(id => copy((options.pages || {})[id] || page(Number(id)))) });
        }
        if (params.list === 'logevents') {
            assert.equal(params.letitle, 'User:' + (options.user || USER));
            assert.equal(params.ledir, 'older');
            return result({ logevents: (options.logs || {})[parsed.hostname] || [] });
        }
        assert.fail('Unexpected request: ' + url);
    };
    return { calls, requestJson: transport };
}
const base = (f, extra = {}) => Object.assign({ user: USER, now: NOW, history: history(), activity: activity(), requestJson: f.requestJson, maxRequests: 20 }, extra);
const log = id => ({ logid: id, type: 'thanks', timestamp: '2026-10-13T12:00:00Z' });

test('requires an explicit user and public request transport', async () => {
    await assert.rejects(statistics.collect({ now: NOW, requestJson() {} }), /inválido/);
    await assert.rejects(statistics.collect({ user: USER, now: NOW }), /inválido/);
});

test('preserves official global scopes, includes deleted created pages once and excludes test Wikipedias', async () => {
    const f = fixture({ accounts: [account(), account('enwiki', 2, 'en.wikipedia.org'), account('commonswiki', 3, 'commons.wikimedia.org'), account('testwiki', 2, 'test.wikipedia.org')],
        logs: { 'pt.wikipedia.org': [log(1), log(1), log(2)], 'en.wikipedia.org': [log(1)], 'commons.wikimedia.org': [log(5)] }, articleCounts: { 'pt.wikipedia.org': 5, 'en.wikipedia.org': 8 } });
    const s = await statistics.collect(base(f));
    assert.equal(s.metrics.edits, 999);
    assert.equal(s.metrics.thanks, 4);
    assert.equal(s.metrics.articles, 13);
    assert.equal(s.metrics.edited, 1);
    assert.equal(s.metrics.bestStreak, 7);
    assert.equal(s.metrics.registration, '2008-05-25T10:30:00Z');
    assert.equal(s.pending, false);
    assert.equal(f.calls.filter(c => c.parsed.hostname === 'xtools.wmcloud.org').length, 2);
    assert.ok(statistics.validate(s, { user: USER, now: NOW }).valid);
});

test('resumes with one request per call and never fabricates zeros for cold zero-edit accounts', async () => {
    const f = fixture({ accounts: [account('ptwiki', 0)], logs: { 'pt.wikipedia.org': [log(7)] } });
    let s = await statistics.collect(base(f, { maxRequests: 1 }));
    assert.equal(s.metrics.thanks, null);
    assert.equal(s.metrics.articles, null);
    assert.equal(s.metrics.edited, null);
    assert.equal(s.pending, true);
    for (let i = 0; i < 12 && s.pending; i++) { s = await statistics.collect(base(f, { maxRequests: 1, previous: s })); }
    assert.equal(s.pending, false);
    assert.equal(s.metrics.thanks, 1);
    assert.equal(s.metrics.articles, 4);
    assert.equal(f.calls.filter(c => c.params.meta === 'globaluserinfo').length, 1);
    assert.equal(f.calls.filter(c => c.params.list === 'users').length, 1);
});

test('resumes a thanks cursor with its original anchor and generic continuation', async () => {
    const f = fixture({ before: (_url, p) => {
        if (p.list !== 'logevents') return;
        return p.lecontinue ? result({ logevents: [log(3)] }) : { continue: { continue: '-||', lecontinue: 'next' }, query: { logevents: [log(1), log(2)] } };
    } });
    let s = await statistics.collect(base(f, { maxRequests: 4 }));
    assert.equal(s.metrics.thanks, null);
    assert.deepEqual(s.projects.ptwiki.thanksScan.logids, [1, 2]);
    const later = '2026-10-15T16:01:00.000Z';
    s = await statistics.collect(base(f, { previous: s, now: later }));
    assert.equal(s.metrics.thanks, 3);
    const calls = f.calls.filter(c => c.params.list === 'logevents');
    assert.equal(calls[1].params.continue, '-||');
    assert.equal(calls[1].params.lecontinue, 'next');
    assert.equal(calls[1].params.lestart, NOW);
    assert.equal(s.metricUpdatedAt.thanks, NOW);
});

test('detects a repeated thanks cursor and preserves the last complete total', async () => {
    const seedFixture = fixture({ logs: { 'pt.wikipedia.org': [log(5)] } });
    const old = await statistics.collect(base(seedFixture));
    const f = fixture({ before: (_url, p) => p.list === 'logevents' ? { continue: { continue: '-||', lecontinue: 'same' }, query: { logevents: [log(p.lecontinue ? 2 : 1)] } } : undefined });
    const s = await statistics.collect(base(f, { previous: old, now: '2026-10-15T16:06:00Z', force: true }));
    assert.equal(s.metrics.thanks, 1);
    assert.ok(s.errors.includes('Agradecimentos: ptwiki'));
    assert.equal(s.pending, true);
    assert.deepEqual(s.projects.ptwiki.thanksScan.logids, [1]);
});

test('a failed project cannot replace a previous global thanks or article total with a partial sum', async () => {
    const settings = { accounts: [account(), account('enwiki', 20, 'en.wikipedia.org')], logs: { 'pt.wikipedia.org': [log(1)], 'en.wikipedia.org': [log(2)] } };
    const old = await statistics.collect(base(fixture(settings)));
    const f = fixture(Object.assign({}, settings, { editcount: 1001, before: (url, p) => {
        if (url.hostname === 'en.wikipedia.org' && p.list === 'logevents') throw new Error('HTTP 503');
        if (url.hostname === 'xtools.wmcloud.org' && url.pathname.includes('en.wikipedia.org')) throw new Error('HTTP 503');
    } }));
    const s = await statistics.collect(base(f, { previous: old, now: '2026-10-15T16:06:00Z', force: true }));
    assert.equal(s.metrics.edits, 1001);
    assert.equal(s.metrics.thanks, old.metrics.thanks);
    assert.equal(s.metrics.articles, old.metrics.articles);
    assert.ok(s.errors.includes('Agradecimentos: enwiki'));
    assert.ok(s.errors.includes('Artigos criados: enwiki'));
});

test('missing current page metadata leaves cold counters unknown', async () => {
    const f = fixture({ before: (_url, p) => p.prop === 'info' ? result({ pages: [] }) : undefined });
    const s = await statistics.collect(base(f));
    assert.equal(s.metrics.edited, null);
    assert.equal(s.metrics.technicalCreated, null);
    assert.ok(s.errors.includes('Situação atual das páginas da ptwiki'));
});

test('counts tagged reversion actions once and excludes the reverted-edit tag', async () => {
    const rows = [entry(1, { tags: ['mw-rollback', 'mw-undo', 'mw-manual-revert'] }), entry(2, { tags: ['mw-reverted'] }), entry(3, { tags: ['mw-undo'] })];
    const s = await statistics.collect(base(fixture(), { history: history(rows) }));
    assert.equal(s.metrics.reverts, 2);
});

test('technical creations require new flag, parent zero and valid current model', async () => {
    const rows = [entry(1, { isNew: 1, parentid: 0 }), entry(2, { isNew: 0, parentid: 0 }), entry(3, { isNew: 1, parentid: 20 }), entry(4, { isNew: 1, parentid: 0 })];
    const f = fixture({ pages: { 1: page(1, { ns: 10, title: 'Predefinição:A' }), 2: page(2, { ns: 828, title: 'Módulo:B', contentmodel: 'Scribunto' }),
        3: page(3, { ns: 8, title: 'MediaWiki:Gadget-C.js', contentmodel: 'javascript' }), 4: page(4, { ns: 2, title: 'Usuário:X/D.js', contentmodel: 'javascript' }) } });
    const s = await statistics.collect(base(f, { history: history(rows) }));
    assert.equal(s.metrics.technicalCreated, 2);
    assert.equal(s.metrics.edited, 0);
});

test('technical filters exclude CSS, documentation, tests, redirects and wrong content models', () => {
    for (const p of [page(1, { ns: 10, title: 'Predefinição:A/doc' }), page(1, { ns: 10, title: 'Predefinição:A/styles.css' }),
        page(1, { ns: 828, title: 'Módulo:A/Testes', contentmodel: 'scribunto' }), page(1, { ns: 8, title: 'MediaWiki:A.test.js', contentmodel: 'javascript' }),
        page(1, { ns: 2, title: 'Usuário:A/x.css', contentmodel: 'css' }), page(1, { ns: 10, redirect: true }), page(1, { ns: 828, title: 'Módulo:A', contentmodel: 'wikitext' })]) {
        assert.equal(statistics.technicalKind(p), null);
    }
    assert.equal(statistics.technicalKind(page(1, { ns: 10, title: 'Predefinição:Teste' })), 'template');
});

test('a later metadata refresh removes deleted and redirect pages without another user edit', async () => {
    const rows = [entry(1), entry(2, { isNew: 1, parentid: 0 })];
    const old = await statistics.collect(base(fixture({ pages: { 2: page(2, { ns: 10, title: 'Predefinição:A' }) } }), { history: history(rows) }));
    assert.equal(old.metrics.edited, 1); assert.equal(old.metrics.technicalCreated, 1);
    const f = fixture({ pages: { 1: { pageid: 1, missing: true }, 2: page(2, { ns: 10, title: 'Predefinição:A', redirect: true }) } });
    const s = await statistics.collect(base(f, { previous: old, history: history(rows), now: '2026-10-16T16:01:00Z' }));
    assert.equal(s.metrics.edited, 0); assert.equal(s.metrics.technicalCreated, 0);
});

test('wrong creator or missing tags rejects the rich local history without erasing prior counters', async () => {
    const old = await statistics.collect(base(fixture(), { history: history([entry(1, { tags: ['mw-undo'] })]) }));
    for (const row of [entry(1, { user: 'Outro usuário' }), entry(1).slice(0, 8)]) {
        const s = await statistics.collect(base(fixture(), { previous: old, history: history([row]) }));
        assert.equal(s.metrics.reverts, 1);
        assert.equal(s.metrics.edited, 1);
        assert.ok(s.errors.includes('Histórico local completo indisponível'));
    }
});

test('refuses a previous cache belonging to someone else', async () => {
    const old = await statistics.collect(base(fixture())); old.user = 'Outra pessoa'; old.metrics.thanks = 12345;
    const s = await statistics.collect(base(fixture(), { previous: old, maxRequests: 1 }));
    assert.equal(s.user, USER); assert.equal(s.metrics.thanks, null);
});

test('validation rejects future timestamps, negative or fractional counts and unsafe project origins', async () => {
    const state = await statistics.collect(base(fixture()));
    for (const mutate of [s => { s.capturedAt = '2027-10-15T00:00:00Z'; }, s => { s.metrics.edits = -1; }, s => { s.metrics.thanks = 0.5; },
        s => { s.metrics.articles = Number.MAX_SAFE_INTEGER + 1; }, s => { s.projects.ptwiki.url = 'https://pt.wikipedia.org.evil.example'; },
        s => { s.projects.ptwiki.url = 'https://secret@pt.wikipedia.org'; }, s => { s.pageInfo['1'].checkedAt = '2027-10-15T00:00:00Z'; }]) {
        const bad = copy(state); mutate(bad); assert.equal(statistics.validate(bad, { user: USER, now: NOW }).valid, false);
    }
    assert.equal(statistics.validate(state, { user: 'Outro usuário', now: NOW }).valid, false);
});

test('deduplicates identical revisions and refuses conflicting revision evidence', async () => {
    const row = entry(1, { tags: ['mw-undo'] });
    const s = await statistics.collect(base(fixture(), { history: history([row, row]) }));
    assert.equal(s.metrics.reverts, 1);
    const bad = copy(row); bad[8] = [];
    const rejected = await statistics.collect(base(fixture(), { history: history([row, bad]) }));
    assert.equal(rejected.metrics.reverts, null);
    assert.ok(rejected.errors.includes('Histórico local completo indisponível'));
});

test('five-minute global refresh reuses daily XTools and current page information', async () => {
    const f = fixture(), first = await statistics.collect(base(f));
    const oldCalls = f.calls.length;
    const s = await statistics.collect(base(f, { previous: first, now: '2026-10-15T16:06:00Z' }));
    const newCalls = f.calls.slice(oldCalls);
    assert.equal(newCalls.filter(c => c.params.meta === 'globaluserinfo').length, 1);
    assert.equal(newCalls.filter(c => c.params.prop === 'info').length, 0);
    assert.equal(newCalls.filter(c => c.parsed.hostname === 'xtools.wmcloud.org').length, 0);
    assert.equal(s.metricUpdatedAt.articles, first.metricUpdatedAt.articles);
    assert.equal(s.metricUpdatedAt.edited, first.metricUpdatedAt.edited);
    assert.equal(s.pending, false);
});

test('metadata pagination reuses already validated batches after one new edit arrives', async () => {
    const rows = Array.from({ length: 100 }, (_, i) => entry(i + 1)), f = fixture();
    let s = await statistics.collect(base(f, { history: history(rows), maxRequests: 3 }));
    assert.equal(Object.keys(s.pageInfo).length, 50); assert.equal(s.metrics.edited, null);
    const later = '2026-10-15T16:01:00Z', extended = rows.concat([entry(101)]);
    s = await statistics.collect(base(f, { history: history(extended, later), previous: s, now: later, maxRequests: 2 }));
    assert.equal(Object.keys(s.pageInfo).length, 100);
    s = await statistics.collect(base(f, { history: history(extended, later), previous: s, now: later }));
    assert.equal(s.metrics.edited, 101);
    const batches = f.calls.filter(c => c.params.prop === 'info').map(c => c.params.pageids.split('|'));
    assert.equal(batches.length, 3); assert.equal(batches[0][0], '1'); assert.equal(batches[1][0], '51'); assert.deepEqual(batches[2], ['101']);
});

test('an unknown registration timestamp remains unknown and is cached as an attempted successful lookup', async () => {
    const f = fixture({ registration: null });
    const first = await statistics.collect(base(f));
    const second = await statistics.collect(base(f, { previous: first }));
    assert.equal(second.metrics.registration, null); assert.ok(second.metricUpdatedAt.registration);
    assert.equal(f.calls.filter(c => c.params.list === 'users').length, 1);
});

test('only the known unsupported Thanks extension on loginwiki may become a verified zero', async () => {
    const f = fixture({ accounts: [account('loginwiki', 0, 'login.wikimedia.org')], before: (_url, p) => p.list === 'logevents' ? { error: { code: 'badvalue', info: 'Unrecognized value for letype: thanks' } } : undefined });
    const s = await statistics.collect(base(f));
    assert.equal(s.metrics.thanks, 0); assert.equal(s.metrics.articles, 0);
    assert.equal(s.pending, false); assert.deepEqual(s.errors, []);
});

test('collectors consume the supplied history and never request a second usercontribs scan', async () => {
    const f = fixture(); await statistics.collect(base(f));
    assert.equal(f.calls.some(c => c.params.list === 'usercontribs'), false);
});

test('sparse untrusted arrays cannot turn incomplete evidence into exact zero totals', async () => {
    const local = await statistics.collect(base(fixture(), { history: history(new Array(1)) }));
    assert.equal(local.metrics.reverts, null);
    assert.equal(local.metrics.edited, null);
    const global = await statistics.collect(base(fixture({ accounts: new Array(1) })));
    assert.equal(global.metrics.thanks, null);
    assert.equal(global.metrics.edits, null);
    const meta = await statistics.collect(base(fixture({ before: (_url, p) => p.prop === 'info' ? result({ pages: new Array(1) }) : undefined })));
    assert.equal(meta.metrics.edited, null);
    const previous = await statistics.collect(base(fixture()));
    previous.global.accountKeys = new Array(1);
    assert.equal(statistics.validate(previous, { user: USER, now: NOW }).valid, false);
});
