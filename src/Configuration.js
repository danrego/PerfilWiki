/* PerfilWiki 1.1.1. Configuration and anonymous-source boundary. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./ProfileText.js') : root.PerfilWikiProfileText,
        typeof module === 'object' && module.exports ? require('./ProfileFields.js') : root.PerfilWikiProfileFields);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiConfiguration = api; }
}(typeof window !== 'undefined' ? window : this, function (appearance, profileTextApi, profileFields) {
    'use strict';
    var BLACKLIST = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
    function title(value) {
        return typeof value === 'string' && value.length > 0 && value.length <= 512 && !/[\x00-\x1f\x7f<>\[\]{}|#]/.test(value);
    }
    function displayName(value, user) {
        if (value === undefined) { return user; }
        if (typeof value !== 'string' || /[\x00-\x1f\x7f-\x9f<>\[\]{}|]/.test(value)) { throw new Error('Nome de exibição inválido.'); }
        var label = value.normalize('NFC').trim();
        if (Array.from(label).length > 100) { throw new Error('O nome de exibição deve ter até 100 caracteres.'); }
        return label || user;
    }
    function resolve(mw, win) {
        var input = win.PerfilWikiConfig || {};
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(function (k) { return ['user','displayName','location','customFields','photo','coverImage','timeZone','stylesPage','documentationPage','appearance'].indexOf(k) < 0; })) { throw new Error('Opção de configuração desconhecida.'); }
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
            fullRescanMs:2592000000, pageviewsRefreshMs:86400000, rankLimit:1000}, displayName:displayName(input.displayName,user),
            location:input.location === undefined ? '' : profileTextApi.normalize(input.location,120), customFields:profileFields.normalize(input.customFields),photo:profileTextApi.normalizePhoto(input.photo),coverImage:profileTextApi.normalizePhoto(input.coverImage),
            stylesPage:stylesPage, documentationPage:documentationPage, appearance:appearance.normalize(input.appearance)};
    }
    function requestAllowed(value) {
        try {
            var url = new URL(value);
            if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) { return false; }
            if (url.href === BLACKLIST) { return true; }
            if (url.origin === 'https://pt.wikipedia.org' && /^\/api\/rest_v1\/feed\/featured\/\d{4}\/\d{2}\/\d{2}$/.test(url.pathname)) {
                var date = url.pathname.slice(-10).replace(/\//g,'-');
                return !url.search && date >= '2000-01-01' && new Date(date+'T00:00:00.000Z').toISOString().slice(0,10) === date;
            }
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
    return Object.freeze({resolve:resolve, requestAllowed:requestAllowed, validTitle:title,normalizePhoto:profileTextApi.normalizePhoto});
}));
