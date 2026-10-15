'use strict';
// Synthetic records only. No Wikimedia data or outbound requests.
const Coordinator = require('../../src/Coordinator.js');
const Cards = require('../../src/CardsView.js');
const View = require('../../src/ActivityView.js');
const Cache = require('../../src/Cache.js');
const USER = "Érica Exemplo";
const NOW = '2024-08-20T12:00:00.000Z';
const COUNT = 501;
const entries = Array.from({ length: COUNT }, (_, i) => ({ revid: i + 1001, pageid: i + 1, ns: 0,
    title: 'Artigo Exemplo ' + String(i + 1).padStart(3, '0'), timestamp: '2024-08-17T10:00:00Z',
    parentid: 0, user: USER, tags: i === 0 ? ['mw-undo'] : [], new: true }));
function response(query) { return { batchcomplete: true, query }; }
function jsonFor(raw) {
    const url = new URL(raw), p = Object.fromEntries(url.searchParams);
    if (url.hostname === 'wikimedia.org') {
        const fields = url.pathname.split('/'), article = decodeURIComponent(fields[9]), start = fields[11], end = fields[12];
        const parse = v => Date.parse(v.slice(0, 4) + '-' + v.slice(4, 6) + '-' + v.slice(6, 8) + 'T00:00:00Z');
        const id = Number(article.match(/(\d+)$/)?.[1]) || 7;
        const items = [];
        for (let at = parse(start); at <= parse(end); at += 86400000) {
            items.push({ project: 'pt.wikipedia.org', article, agent: 'user', access: 'all-access', granularity: 'daily',
                timestamp: new Date(at).toISOString().slice(0, 10).replace(/-/g, '') + '00', views: at < Date.parse('2024-08-17T00:00:00Z') && article.startsWith('Artigo_Exemplo_') ? 0 : id });
        }
        return { items };
    }
    if (url.hostname === 'xtools.wmcloud.org') return { username: USER, project: 'pt.wikipedia.org', namespace: 0, redirects: 'noredirects', deleted: 'all', counts: { '0': { count: COUNT, deleted: 0 } } };
    if (p.list === 'usercontribs') {
        const all = entries.filter(e => Date.parse(e.timestamp) <= Date.parse(p.ucstart) && (!p.ucend || Date.parse(e.timestamp) >= Date.parse(p.ucend))).sort((a, b) => b.revid - a.revid);
        if (all.length > 500 && !p.uccontinue) return { continue: { continue: '-||', uccontinue: 'fixture-next' }, query: { usercontribs: all.slice(0, 500) } };
        return response({ usercontribs: p.uccontinue ? all.slice(500) : all });
    }
    if (p.meta === 'globaluserinfo') return response({ globaluserinfo: { name: USER, editcount: 20000, merged: [{ wiki: 'ptwiki', editcount: COUNT, url: 'https://pt.wikipedia.org' }] } });
    if (p.list === 'users') return response({ users: [{ name: USER, registration: '2010-08-20T00:00:00Z' }] });
    if (p.list === 'logevents') return response({ logevents: [1, 2, 3].map(logid => ({ logid, type: 'thanks', timestamp: '2024-08-16T10:00:00Z' })) });
    if (p.prop === 'info') return response({ pages: p.pageids.split('|').map(n => ({ pageid: Number(n), ns: 0, title: entries[Number(n) - 1].title, contentmodel: 'wikitext' })) });
    if (p.prop === 'pageimages') return response({ pages: [] });
    throw new Error('Synthetic transport does not implement ' + raw);
}
async function seed() {
    const config = { user: USER, project: 'pt.wikipedia.org', timeZone: 'UTC' };
    const state = await Coordinator.update({ config, now: NOW, requestJson: async url => jsonFor(url), maxRequests: 1000, statisticsBudget: 1000, historyBudget: 20 });
    if (!state.complete || !Coordinator.validateState(state).valid) throw new Error('Synthetic integrated snapshot did not complete.');
    return { state, user: USER, now: Date.parse(NOW), count: COUNT, entries, cache: Cache.packJson(JSON.stringify(state)),
        cards: Cards.html(state.statistics, state.activity, { user: USER, now: NOW }), activity: View.html(state, { now: NOW }) };
}
module.exports = { seed, jsonFor, USER, NOW, COUNT };
