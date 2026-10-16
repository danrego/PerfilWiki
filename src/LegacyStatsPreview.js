/* PerfilWiki. Display-only recovery of saved legacy counters. No requests or collector state. CC BY-SA 4.0. */
(function (root, factory) {
    'use strict';
    var api = factory(typeof module === 'object' && module.exports ? require('./Statistics.js') : root.PerfilWikiStatistics);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiLegacyStatsPreview = api; }
}(typeof globalThis === 'object' ? globalThis : this, function (statistics) {
    'use strict';
    var LIMIT = 260000, MAX_ITEMS = 200000;
    var own = function (value,key) { return Object.prototype.hasOwnProperty.call(value,key); };
    var object = function (value) { return !!value && typeof value === 'object' && !Array.isArray(value); };
    var integer = function (value) { return Number.isSafeInteger(value) && value >= 0; };
    var positive = function (value) { return integer(value) && value > 0; };
    var ids = {edits:'dan-pu-edicoes',thanks:'dan-pu-agradecimentos',articles:'dan-pu-artigos',bestStreak:'dan-pu-ritmo-melhor-sequencia',edited:'dan-pu-editados',technicalCreated:'dan-pu-criados-tecnicos',reverts:'dan-pu-reversoes'};
    function clock(options) { var result = new Date(options && options.now !== undefined ? options.now : Date.now()).getTime(); return Number.isFinite(result) ? result : null; }
    function iso(value,now) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return false; }
        var parsed = new Date(value);
        return Number.isFinite(parsed.getTime()) && parsed.getTime() <= now && parsed.toISOString().replace('.000Z','Z') === value.replace('.000Z','Z');
    }
    function day(value,now) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && iso(value+'T00:00:00Z',now); }
    function list(values) { return Array.isArray(values) && values.length <= MAX_ITEMS && values.every(positive) && new Set(values).size === values.length; }
    function sum(values) { var total = values.reduce(function (a,b) { return a+b; },0); return integer(total) ? total : null; }
    function parsed(input) {
        try {
            var raw = typeof input === 'string' ? input : JSON.stringify(input);
            if (!raw || raw.length > LIMIT) { return null; }
            return JSON.parse(raw,function (key,value) { if (key === '__proto__' || key === 'constructor' || key === 'prototype') { throw new Error('Unexpected object key.'); } return value; });
        } catch (_) { return null; }
    }
    function origin(value) {
        try {
            var url = new URL(value);
            return typeof value === 'string' && url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.search && !url.hash && url.pathname === '/' &&
                /(^|\.)(wikipedia|wikimedia|wikidata|wiktionary|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|mediawiki|wikifunctions)\.org$/.test(url.hostname) &&
                (value === url.origin || value === url.origin+'/') ? url.origin : null;
        } catch (_) { return null; }
    }
    function normalize(input,options) {
        options = options || {};
        var now = clock(options), state = parsed(input), user = options.user;
        if (now === null || typeof user !== 'string' || !user || user.length > 255 || /[\x00-\x1f\x7f]/.test(user) || !object(state) || state.schema !== 1 || state.user !== user ||
            !object(state.metrics) || !object(state.projects) || !object(state.history) || !Array.isArray(state.errors) || state.errors.length > 2000 ||
            state.errors.some(function (error) { return typeof error !== 'string' || error.length > 2048; })) { return null; }
        var metricKeys = ['edits','thanks','articles','streak','edited','technicalCreated','reverts'];
        if (['edits','thanks','articles','streak'].some(function (key) { return !integer(state.metrics[key]); }) || metricKeys.some(function (key) { return own(state.metrics,key) && !integer(state.metrics[key]); })) { return null; }
        if (['lastAttemptAt','lastSuccessAt'].some(function (key) { return state[key] !== undefined && state[key] !== null && !iso(state[key],now); }) ||
            state.lastAttemptAt && state.lastSuccessAt && Date.parse(state.lastSuccessAt) > Date.parse(state.lastAttemptAt)) { return null; }
        var savedAt = state.lastAttemptAt || state.lastSuccessAt || null;
        var keys = Object.keys(state.projects);
        if (keys.length > 2000 || keys.some(function (key) {
            var project = state.projects[key];
            return !/^[a-z0-9_]{1,100}$/.test(key) || !object(project) || !origin(project.url) || !integer(project.editcount) ||
                ['thanks','articles'].some(function (field) { return own(project,field) && !integer(project[field]); });
        })) { return null; }
        var projects = keys.map(function (key) { return state.projects[key]; }), metrics = {};
        function put(key,value,at) { if (integer(value) && iso(at,now)) { metrics[key] = {value:value,savedAt:at}; } }
        if (keys.length && savedAt) {
            if (sum(projects.map(function (project) { return project.editcount; })) === state.metrics.edits) { put('edits',state.metrics.edits,savedAt); }
            if (projects.every(function (project) { return integer(project.thanks); }) && sum(projects.map(function (project) { return project.thanks; })) === state.metrics.thanks) { put('thanks',state.metrics.thanks,savedAt); }
            var wikipedias = keys.filter(function (key) { return key !== 'testwiki' && key !== 'test2wiki' && new URL(state.projects[key].url).hostname.endsWith('.wikipedia.org'); }).map(function (key) { return state.projects[key]; });
            if (wikipedias.length && wikipedias.some(function (project) { return integer(project.articles); }) &&
                wikipedias.every(function (project) { return integer(project.articles) || project.editcount === 0; }) &&
                sum(wikipedias.map(function (project) { return project.articles || 0; })) === state.metrics.articles) { put('articles',state.metrics.articles,savedAt); }
        }
        var history = state.history;
        if (history.complete === true && iso(history.scannedAt,now) && Array.isArray(history.dates) && history.dates.length <= 20000 && history.dates.every(function (value) { return day(value,Date.parse(history.scannedAt)); })) {
            var dates = Array.from(new Set(history.dates)).sort(), best = 0, current = 0, previous = null;
            dates.forEach(function (date) { var value = Date.parse(date+'T00:00:00Z'); current = previous !== null && value-previous === 86400000 ? current+1 : 1; best = Math.max(best,current); previous = value; });
            if (best === state.metrics.streak) { put('bestStreak',best,history.scannedAt); }
        }
        function pageHistory(record,field) {
            return object(record) && record.complete === true && iso(record.scannedAt,now) &&
                (!record.fullScannedAt || iso(record.fullScannedAt,Date.parse(record.scannedAt))) && list(record[field]);
        }
        if (pageHistory(state.edited,'pageids') && integer(state.metrics.edited)) {
            var edited = state.edited, accepted = state.metrics.edited <= edited.pageids.length;
            if (own(edited,'countedPageids') || own(edited,'validatedAt')) {
                var known = new Set(edited.pageids);
                accepted = list(edited.countedPageids) && iso(edited.validatedAt,Date.parse(edited.scannedAt)) && edited.countedPageids.length === state.metrics.edited && edited.countedPageids.every(function (id) { return known.has(id); });
            }
            if (accepted) { put('edited',state.metrics.edited,edited.validatedAt || edited.scannedAt); }
        }
        if (pageHistory(state.reverts,'revids') && state.reverts.revids.length === state.metrics.reverts) { put('reverts',state.metrics.reverts,state.reverts.scannedAt); }
        var technical = state.technicalCreated;
        if (object(technical) && technical.model === 'created-code-pages-v1' && technical.complete === true &&
            iso(technical.scannedAt,now) && iso(technical.fullScannedAt,Date.parse(technical.scannedAt)) && iso(technical.validatedAt,Date.parse(technical.scannedAt)) &&
            Array.isArray(technical.creations) && technical.creations.length <= MAX_ITEMS && Array.isArray(technical.pages) && technical.pages.length <= MAX_ITEMS && technical.pages.length === state.metrics.technicalCreated && statistics && typeof statistics.technicalKind === 'function') {
            var created = new Set(), revisions = new Set(), counted = new Set();
            var valid = technical.creations.every(function (entry) {
                if (!Array.isArray(entry) || entry.length !== 3 || !positive(entry[0]) || !positive(entry[1]) || created.has(entry[0]) || revisions.has(entry[1]) || !iso(entry[2],Date.parse(technical.scannedAt))) { return false; }
                created.add(entry[0]); revisions.add(entry[1]); return true;
            });
            valid = valid && technical.pages.every(function (page) {
                if (!object(page) || !positive(page.pageid) || !created.has(page.pageid) || counted.has(page.pageid) || typeof page.title !== 'string' || page.title.length > 1024 || !statistics.technicalKind(page) || statistics.technicalKind(page) !== page.kind) { return false; }
                counted.add(page.pageid); return true;
            });
            if (valid) { put('technicalCreated',state.metrics.technicalCreated,technical.validatedAt); }
        }
        return Object.keys(metrics).length ? {previewSchema:1,user:user,metrics:metrics} : null;
    }
    function fromWikitext(text,options) {
        if (typeof text !== 'string' || text.length > LIMIT) { return null; }
        var marker = '<noinclude><syntaxhighlight lang="json">\n', end = '\n</syntaxhighlight></noinclude>';
        var start = text.indexOf(marker), finish = text.indexOf(end,start);
        if (start < 0 || finish < 0 || start !== text.lastIndexOf(marker) || finish !== text.lastIndexOf(end)) { return null; }
        var state = parsed(text.slice(start+marker.length,finish));
        if (!object(state) || !object(state.metrics) || ['edits','thanks','articles','streak'].some(function (key) { return !integer(state.metrics[key]); }) || ['edited','technical','technicalCreated','reverts'].some(function (key) { return own(state.metrics,key) && !integer(state.metrics[key]); })) { return null; }
        var expected = '<includeonly>{{#switch:{{{1|}}}\n';
        [['edits','edicoes'],['thanks','agradecimentos'],['articles','artigos'],['streak','sequencia'],['edited','editados'],['technical','predefinicoes'],['technicalCreated','tecnicoscriados'],['reverts','reversoes']].forEach(function (pair) {
            if (own(state.metrics,pair[0])) { expected += '|'+pair[1]+'={{formatnum:'+state.metrics[pair[0]]+'}}\n'; }
        });
        expected += '|#default=\n}}</includeonly>'+marker+JSON.stringify(state,null,2)+end;
        if (expected !== text.trim()) { return null; }
        return normalize(state,options);
    }
    var translations = {
        'pt-BR':['Dados salvos da versão anterior',' dia',' dias'], 'pt-PT':['Dados guardados da versão anterior',' dia',' dias'],
        en:['Saved data from the previous version',' day',' days'], es:['Datos guardados de la versión anterior',' día',' días'],
        fr:['Données enregistrées de la version précédente',' jour',' jours'], it:['Dati salvati dalla versione precedente',' giorno',' giorni']
    };
    function paint(document,preview,currentStats,options) {
        options = options || {}; var now = clock(options), user = options.user;
        if (!document || typeof document.getElementById !== 'function' || now === null || !preview || preview.previewSchema !== 1 || preview.user !== user || !object(preview.metrics) || currentStats && currentStats.user !== user) { return 0; }
        var root = document.getElementById('dan-pu-estatisticas');
        if (!root || typeof root.getAttribute !== 'function' || root.getAttribute('data-perfilwiki-user') !== user || typeof root.contains !== 'function') { return 0; }
        var language = own(translations,options.language) ? options.language : 'pt-BR', words = translations[language], format = new Intl.NumberFormat(language), count = 0;
        Object.keys(ids).forEach(function (key) {
            var node = document.getElementById(ids[key]); if (!node || !root.contains(node) || typeof node.setAttribute !== 'function') { return; }
            var fresh = currentStats && currentStats.metrics && integer(currentStats.metrics[key]) && currentStats.metricUpdatedAt && iso(currentStats.metricUpdatedAt[key],now);
            var activity = options.activity;
            if (key === 'bestStreak' && activity && activity.complete === true && activity.identity && activity.identity.user === user && activity.summary && integer(activity.summary.bestStreak) && iso(activity.capturedAt,now)) { fresh = true; }
            if (fresh) {
                if (node.getAttribute('data-perfilwiki-legacy-preview') === 'true') { node.removeAttribute('data-perfilwiki-legacy-preview'); node.removeAttribute('data-perfilwiki-legacy-saved-at'); node.removeAttribute('title'); }
                return;
            }
            var saved = preview.metrics[key];
            if (!object(saved) || !integer(saved.value) || !iso(saved.savedAt,now)) { return; }
            var previous = node.getAttribute('data-perfilwiki-legacy-saved-at');
            if (previous && iso(previous,now) && Date.parse(previous) > Date.parse(saved.savedAt)) { return; }
            if (node.getAttribute('data-perfilwiki-legacy-preview') !== 'true' && String(node.textContent || '').trim() && !/^(?:Aguardando dados|Waiting for data|Esperando datos|En attente de données|In attesa dei dati|[.\u2026\u2014-]+)$/i.test(String(node.textContent).trim())) { return; }
            node.textContent = format.format(saved.value)+(key === 'bestStreak' ? words[saved.value === 1 ? 1 : 2] : '');
            node.setAttribute('data-perfilwiki-legacy-preview','true'); node.setAttribute('data-perfilwiki-legacy-saved-at',saved.savedAt);
            node.setAttribute('title',words[0]+' · '+saved.savedAt.replace('T',' ').replace(/(?:\.000)?Z$/,' UTC'));
            count += 1;
        });
        return count;
    }
    return Object.freeze({normalize:normalize,fromWikitext:fromWikitext,paint:paint,rawLimit:LIMIT});
}));
