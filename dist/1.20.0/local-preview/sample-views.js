/* Fictional daily pageviews for the offline installer only. Never requests data. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiSampleViews = api; }
}(typeof window === 'object' ? window : this, function () {
    'use strict';
    var DAY = 86400000, FLOOR = '2015-07-01';
    function date(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value; }
    function daily(pageid, stamp) {
        var ordinal = Math.floor(stamp / DAY);
        return 700 + pageid * 137 + (ordinal * (pageid * 29 + 7) + pageid * 167) % 901 +
            (ordinal % 31 === pageid % 31 ? 1800 + pageid * 95 : 0);
    }
    function rowsFor(cohort, range) {
        if (!Array.isArray(cohort) || !range || !date(range.start) || !date(range.end) || range.start < FLOOR || range.start > range.end) { throw new Error('Período local inválido.'); }
        var end = Date.parse(range.end), seen = new Set();
        return cohort.map(function (page) {
            if (!page || !Number.isSafeInteger(page.pageid) || page.pageid <= 0 || seen.has(page.pageid) || typeof page.title !== 'string' || !page.title || !Number.isFinite(Date.parse(page.firstEditAt))) { throw new Error('Artigo de exemplo inválido.'); }
            seen.add(page.pageid);
            var afterEdit = new Date(Date.parse(page.firstEditAt.slice(0,10)) + DAY).toISOString().slice(0,10);
            var from = [range.start, FLOOR, afterEdit].sort().pop();
            if (from > range.end) { return null; }
            var views = 0;
            for (var stamp = Date.parse(from); stamp <= end; stamp += DAY) { views += daily(page.pageid, stamp); }
            return {pageid:page.pageid,title:page.title,views:views,firstEditAt:page.firstEditAt,countFromDate:from};
        }).filter(function (row) { return !!row; }).sort(function (a,b) { return b.views - a.views || a.title.localeCompare(b.title,'pt'); });
    }
    return Object.freeze({rowsFor:rowsFor});
}));
