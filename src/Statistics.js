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
