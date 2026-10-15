/* Dados opcionais de apresentação. Não altera métricas nem publica edições. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiPresenter = api; }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';
    var DAY = 86400000;
    var periods = ['30d', '90d', '12m', 'since'];
    var relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' });
    var absolute = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
    function timestamp(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
        var date = new Date(value);
        if (!Number.isFinite(date.getTime()) || date.toISOString().replace('.000Z', 'Z') !== value.replace('.000Z', 'Z')) { return null; }
        return date.toISOString();
    }
    function nowValue(value) {
        var result = value === undefined ? Date.now() : new Date(value).getTime();
        return Number.isFinite(result) ? result : null;
    }
    function lastEditAt(state) {
        var activity = state && state.activity;
        var entries = activity && Array.isArray(activity.entries) ? activity.entries : [];
        var latest = null;
        entries.forEach(function (entry) {
            var raw = Array.isArray(entry) && entry[4];
            // ISO dates sort chronologically. Most histories already start with
            // the newest edit, so avoid parsing every older date on each paint.
            if (typeof raw !== 'string' || latest && raw <= latest) { return; }
            var value = timestamp(raw);
            if (value && (!latest || value > latest)) { latest = value; }
        });
        return latest || timestamp(activity && activity.summary && activity.summary.lastEditAt);
    }
    function relativeTime(value, now) {
        var stamp = timestamp(value), reference = nowValue(now);
        if (!stamp || reference === null || Date.parse(stamp) > reference + 60000) { return null; }
        var seconds = Math.max(0, Math.floor((reference - Date.parse(stamp)) / 1000));
        if (seconds < 60) { return 'há menos de 1 minuto'; }
        if (seconds < 3600) { return relative.format(-Math.floor(seconds / 60), 'minute'); }
        if (seconds < 86400) { return relative.format(-Math.floor(seconds / 3600), 'hour'); }
        return relative.format(-Math.floor(seconds / 86400), 'day');
    }
    function absoluteTime(value) {
        var stamp = timestamp(value);
        return stamp ? absolute.format(new Date(stamp)) + ' UTC' : null;
    }
    function featuredArticles(state) {
        var data = state && state.pageviews;
        var seen = new Set(), articles = [];
        periods.forEach(function (key) {
            var profile = data && data.periods && data.periods[key];
            var previous = data && data.lastCompleteSnapshot && data.lastCompleteSnapshot.periods && data.lastCompleteSnapshot.periods[key];
            var displayed = profile && !profile.complete && (profile.lastCompleteSnapshot || previous) || profile;
            var rows = displayed && Array.isArray(displayed.rows) ? displayed.rows : [];
            rows.slice().sort(function (a, b) {
                return (b.views == null ? -1 : b.views) - (a.views == null ? -1 : a.views) || String(a.title).localeCompare(String(b.title), 'pt');
            }).slice(0, 10).forEach(function (row) {
                if (Number.isSafeInteger(row.pageid) && row.pageid > 0 && typeof row.title === 'string' && row.title.length > 0 && row.title.length <= 512 && !seen.has(row.pageid)) {
                    seen.add(row.pageid); articles.push({ pageid: row.pageid, title: row.title });
                }
            });
        });
        return articles;
    }
    function imageRequest(articles) {
        if (!Array.isArray(articles) || !articles.length || articles.length > 40 || articles.some(function (row) { return !row || !Number.isSafeInteger(row.pageid) || row.pageid <= 0; })) { return null; }
        var url = new URL('https://pt.wikipedia.org/w/api.php');
        var parameters = { action: 'query', format: 'json', formatversion: '2', origin: '*', prop: 'pageimages', piprop: 'thumbnail|name', pilicense: 'free', pithumbsize: '96', pilimit: '50', pageids: articles.map(function (row) { return row.pageid; }).join('|') };
        Object.keys(parameters).forEach(function (key) { url.searchParams.set(key, parameters[key]); });
        return url.href;
    }
    function safeFile(value) {
        return typeof value === 'string' && value.length > 0 && value.length <= 512 && value.trim() === value && !/[\u0000-\u001f\u007f\u2028\u2029\[\]{}|<>#%:\\/]/.test(value) && /\.(?:jpe?g|png|gif|webp|svg|tiff?|avif)$/i.test(value);
    }
    function imageSource(value) {
        try {
            if (typeof value !== 'string' || value.length > 4096) { return null; }
            var url = new URL(value);
            if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash || ['upload.wikimedia.org', 'thumb.wikimedia.org'].indexOf(url.hostname) < 0 ||
                !/^\/wikipedia\/(?:commons|pt)\/thumb\/[a-f0-9]\/[a-f0-9]{2}\/[^/]+\/[^/]+$/.test(url.pathname) || /[\u0000-\u001f\u007f\\]/.test(decodeURIComponent(url.pathname))) { return null; }
            var safe = true;
            url.searchParams.forEach(function (_, key) { if (['utm_source', 'utm_campaign', 'utm_content'].indexOf(key) < 0) { safe = false; } });
            if (!safe) { return null; }
            url.search = '';
            return url.href;
        } catch (_) { return null; }
    }
    function validateImage(page, capturedAt) {
        var stamp = timestamp(capturedAt);
        if (!page || !stamp || !Number.isSafeInteger(page.pageid) || page.pageid <= 0 || page.ns !== 0 || typeof page.title !== 'string' || !page.title || page.title.length > 512 ||
            !safeFile(page.pageimage) || !page.thumbnail || !Number.isSafeInteger(page.thumbnail.width) || page.thumbnail.width < 1 || page.thumbnail.width > 4096 ||
            !Number.isSafeInteger(page.thumbnail.height) || page.thumbnail.height < 1 || page.thumbnail.height > 4096) { return null; }
        var src = imageSource(page.thumbnail.source);
        return src ? { pageid: page.pageid, title: page.title, file: page.pageimage, src: src, capturedAt: stamp } : null;
    }
    function normalizeImages(raw, now) {
        var result = Object.create(null), reference = nowValue(now);
        if (!raw || typeof raw !== 'object' || Array.isArray(raw) || reference === null || Object.keys(raw).length > 80) { return result; }
        Object.keys(raw).forEach(function (key) {
            var entry = raw[key];
            if (!entry || String(entry.pageid) !== key || !Number.isSafeInteger(entry.pageid) || entry.pageid <= 0 || !timestamp(entry.capturedAt) ||
                Date.parse(entry.capturedAt) > reference + 60000 || reference - Date.parse(entry.capturedAt) >= 7 * DAY) { return; }
            var normalized = validateImage({ pageid: entry.pageid, ns: 0, title: entry.title, pageimage: entry.file, thumbnail: { source: entry.src, width: 96, height: 96 } }, entry.capturedAt);
            if (normalized) { result[key] = normalized; }
        });
        return result;
    }
    function imageFor(images, row) {
        var image = images && row && images[row.pageid];
        if (!image || image.pageid !== row.pageid || image.title !== row.title || !safeFile(image.file) || !imageSource(image.src) || !timestamp(image.capturedAt)) { return null; }
        return image;
    }
    return Object.freeze({ lastEditAt: lastEditAt, relativeTime: relativeTime, absoluteTime: absoluteTime, featuredArticles: featuredArticles,
        imageRequest: imageRequest, validateImage: validateImage, normalizeImages: normalizeImages, imageFor: imageFor });
}));
