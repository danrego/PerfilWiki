/* A localhost-only, anonymous transport and clock fixture for the real bundle. */
(function (win) {
    'use strict';
    if (win.location.hostname !== '127.0.0.1') { throw new Error('Local fixture required.'); }
    var seed = win.PW_SEED, NativeDate = win.Date, nativeTimeout = win.setTimeout.bind(win), now = seed.now;
    var scenario = new URLSearchParams(win.location.search).get('scenario') || 'seed';
    if (['seed', 'unknown', 'owner-gate', 'missing-relevant', 'no-script'].indexOf(scenario) < 0) { throw new Error('Unknown scenario.'); }
    var test = win.PWTEST = { scenario: scenario, requests: [], forbidden: [], errors: [], notices: [], downloads: [], csp: [], now: now };
    function FakeDate() {
        var args = Array.from(arguments);
        if (!new.target) { return new NativeDate(now).toString(); }
        return Reflect.construct(NativeDate, args.length ? args : [now], NativeDate);
    }
    Object.setPrototypeOf(FakeDate, NativeDate); FakeDate.prototype = NativeDate.prototype; FakeDate.now = function () { return now; }; win.Date = FakeDate;
    var serial = 0, timers = new Map();
    function schedule(callback, delay, repeat, args) {
        var interval = Math.max(0, Number(delay) || 0), id = ++serial;
        if (typeof callback !== 'function') { throw new Error('Callback timers required.'); }
        timers.set(id, { at: now + interval, callback: callback, interval: repeat ? Math.max(1, interval) : 0, args: args }); return id;
    }
    win.setTimeout = function (callback, delay) { return schedule(callback, delay, false, Array.prototype.slice.call(arguments, 2)); };
    win.setInterval = function (callback, delay) { return schedule(callback, delay, true, Array.prototype.slice.call(arguments, 2)); };
    win.clearTimeout = win.clearInterval = function (id) { timers.delete(id); };
    async function settle() {
        for (var i = 0; i < 40; i += 1) { await Promise.resolve(); }
        await new Promise(function (resolve) { nativeTimeout(resolve, 0); });
        for (var j = 0; j < 40; j += 1) { await Promise.resolve(); }
    }
    test.advance = async function (ms) {
        if (!Number.isFinite(ms) || ms < 0 || ms > 86400000) { throw new Error('Invalid clock advance.'); }
        var target = now + ms, steps = 0; await settle();
        while (true) {
            var next = Array.from(timers.entries()).filter(function (entry) { return entry[1].at <= target; }).sort(function (a, b) { return a[1].at - b[1].at || a[0] - b[0]; })[0];
            if (!next) { break; }
            if (++steps > 10000) { throw new Error('Fixture timer safety limit.'); }
            var timer = next[1]; now = timer.at; test.now = now;
            if (timer.interval) { timer.at += timer.interval; } else { timers.delete(next[0]); }
            try { timer.callback.apply(win, timer.args); } catch (error) { test.errors.push(String(error.stack || error)); throw error; }
            await settle();
        }
        now = target; test.now = now; await settle(); return { now: now, steps: steps, timers: timers.size };
    };
    function forbidden(kind, detail) { test.forbidden.push({ kind: kind, detail: detail }); throw new Error(kind + ': ' + detail); }
    function done(query) { return { batchcomplete: true, query: query }; }
    function jsonFor(url) {
        var p = Object.fromEntries(url.searchParams);
        if (url.hostname === 'wikimedia.org') {
            var fields = url.pathname.split('/'), article = decodeURIComponent(fields[9]), start = fields[11], end = fields[12];
            var parse = function (v) { return NativeDate.parse(v.slice(0, 4) + '-' + v.slice(4, 6) + '-' + v.slice(6, 8) + 'T00:00:00Z'); };
            var match = article.match(/(\d+)$/), value = match ? Number(match[1]) : 7, items = [];
            for (var at = parse(start); at <= parse(end); at += 86400000) { items.push({ project: 'pt.wikipedia.org', article: article, agent: 'user', access: 'all-access', granularity: 'daily', timestamp: new NativeDate(at).toISOString().slice(0, 10).replace(/-/g, '') + '00', views: at < NativeDate.parse('2024-08-17T00:00:00Z') && article.indexOf('Artigo_Exemplo_') === 0 ? 0 : value }); }
            return { items: items };
        }
        if (url.hostname === 'xtools.wmcloud.org') { return { username: seed.user, project: 'pt.wikipedia.org', namespace: 0, redirects: 'noredirects', deleted: 'all', counts: { '0': { count: seed.count, deleted: 0 } } }; }
        if (url.origin !== 'https://pt.wikipedia.org' || url.pathname !== '/w/api.php' || p.action !== 'query' || p.meta === 'tokens') { return forbidden('Unknown logical request', url.href); }
        if (p.list === 'usercontribs') {
            var all = seed.entries.filter(function (e) { return NativeDate.parse(e.timestamp) <= NativeDate.parse(p.ucstart) && (!p.ucend || NativeDate.parse(e.timestamp) >= NativeDate.parse(p.ucend)); }).sort(function (a, b) { return b.revid - a.revid; });
            if (all.length > 500 && !p.uccontinue) { return { continue: { continue: '-||', uccontinue: 'fixture-next' }, query: { usercontribs: all.slice(0, 500) } }; }
            return done({ usercontribs: p.uccontinue ? all.slice(500) : all });
        }
        if (p.meta === 'globaluserinfo') { return done({ globaluserinfo: { name: seed.user, editcount: 20000, merged: [{ wiki: 'ptwiki', editcount: seed.count, url: 'https://pt.wikipedia.org' }] } }); }
        if (p.list === 'users') { return done({ users: [{ name: seed.user, registration: '2010-08-20T00:00:00Z' }] }); }
        if (p.list === 'logevents') { return done({ logevents: [1, 2, 3].map(function (id) { return { logid: id, type: 'thanks', timestamp: '2024-08-16T10:00:00Z' }; }) }); }
        if (p.prop === 'info') { return done({ pages: p.pageids.split('|').map(function (id) { return { pageid: Number(id), ns: 0, title: seed.entries[Number(id) - 1].title, contentmodel: 'wikitext' }; }) }); }
        if (p.prop === 'pageimages') { return done({ pages: [] }); }
        return forbidden('Unimplemented synthetic request', url.href);
    }
    win.fetch = async function (input, options) {
        options = options || {};
        var url = new URL(typeof input === 'string' ? input : input.url), record = { url: url.href, method: options.method || 'GET', credentials: options.credentials || 'same-origin' };
        test.requests.push(record);
        if (record.method !== 'GET' || record.credentials !== 'omit' || url.username || url.password) { return forbidden('Non-anonymous request', JSON.stringify(record)); }
        if (options.signal && options.signal.aborted) { throw new DOMException('Aborted', 'AbortError'); }
        if (scenario === 'unknown') { return { ok: false, status: 503, headers: { get: function () { return '300'; } }, json: async function () { return {}; } }; }
        var data = jsonFor(url);
        return { ok: true, status: 200, headers: { get: function () { return null; } }, json: async function () { return JSON.parse(JSON.stringify(data)); } };
    };
    win.XMLHttpRequest = function () { forbidden('XMLHttpRequest', 'Unavailable'); };
    try { Object.defineProperty(win.navigator, 'sendBeacon', { configurable: true, value: function () { forbidden('sendBeacon', 'Unavailable'); } }); } catch (_) {}
    win.addEventListener('error', function (e) { if (e.error) { test.errors.push(String(e.error.stack || e.error)); } });
    win.addEventListener('unhandledrejection', function (e) { test.errors.push(String(e.reason && e.reason.stack || e.reason)); });
    win.document.addEventListener('securitypolicyviolation', function (e) { test.csp.push({ blocked: e.blockedURI, directive: e.violatedDirective }); });
    win.document.addEventListener('submit', function (e) { e.preventDefault(); test.forbidden.push({ kind: 'form submission' }); }, true);
    win.document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) { return; }
        var url = new URL(a.getAttribute('href'), win.location.href);
        if (url.origin !== win.location.origin) { e.preventDefault(); test.forbidden.push({ kind: 'external navigation', detail: url.href }); }
    }, true);
    var blobs = new Map(), createURL = win.URL.createObjectURL.bind(win.URL), revokeURL = win.URL.revokeObjectURL.bind(win.URL), nativeClick = win.HTMLAnchorElement.prototype.click;
    win.URL.createObjectURL = function (blob) { var url = createURL(blob); blobs.set(url, blob); return url; };
    win.URL.revokeObjectURL = function (url) { blobs.delete(url); revokeURL(url); };
    win.HTMLAnchorElement.prototype.click = function () {
        if (this.download && blobs.has(this.href)) {
            var blob = blobs.get(this.href), name = this.download;
            blob.text().then(function (text) { test.downloads.push({ name: name, text: text }); }); return;
        }
        return nativeClick.call(this);
    };
    win.PerfilWikiConfig = { user: seed.user, timeZone: 'UTC' };
    var hooks = new Map(), config = { wgDBname: 'ptwiki', wgAction: 'view', wgUserName: scenario === 'owner-gate' ? 'Outra pessoa' : seed.user, wgRelevantUserName: scenario === 'missing-relevant' ? null : seed.user, wgTitle: scenario === 'missing-relevant' ? 'Outra pessoa/PU' : seed.user + '/PU', wgNamespaceNumber: 2 };
    win.mw = { config: { get: function (key) { return config[key]; } }, loader: { using: function () { return Promise.resolve(); } },
        notify: function (message, settings) { test.notices.push({ message: message, settings: settings }); },
        util: { addPortletLink: function (_portlet, href, label, id) { var link = win.document.createElement('a'); link.href = href; link.id = id; link.textContent = label; win.document.getElementById('fixture-tools').appendChild(link); return link; } },
        hook: function (name) { if (!hooks.has(name)) { hooks.set(name, []); } return { add: function (callback) { hooks.get(name).push(callback); }, fire: function () { hooks.get(name).forEach(function (callback) { callback(); }); } }; },
        Api: function () { this.post = this.postWithToken = function () { forbidden('Wiki write', 'Unavailable'); }; this.get = function () { forbidden('mw.Api.get', 'Use the anonymous broker'); }; } };
    win.localStorage.clear();
    if (scenario === 'seed') { win.localStorage.setItem('perfilwiki-v1-' + encodeURIComponent(seed.user) + '-UTC-cache', seed.cache); }
    if (scenario === 'unknown') {
        var cards = win.document.getElementById('dan-pu-estatisticas'); cards.setAttribute('data-perfilwiki-user', 'Outra pessoa');
        Array.from(cards.querySelectorAll('.dan-pu-stat-value span')).forEach(function (value) { value.textContent = '999999'; });
        win.document.getElementById('dan-pu-ritmo').setAttribute('data-perfilwiki-user', 'Outra pessoa');
        win.document.querySelector('.dan-pu-readership').setAttribute('data-perfilwiki-user', 'Outra pessoa');
    }
}(window));
