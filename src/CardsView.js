/* PerfilWiki 1.0.0. Statistics cards, compatible with existing RitmoPU markup.
 * Daniel G Rego, CC BY-SA 4.0. No requests, timers, or wiki writes. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiCardsView = api; }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';
    var formatter = new Intl.NumberFormat('pt-BR');
    var fields = [
        ['tenure', 'perfilwiki-anos', 'Na Wikipédia', '🌱', 'dan-pu-stat-tenure'],
        ['bestStreak', 'dan-pu-ritmo-melhor-sequencia', 'Melhor sequência', '🔥', ''],
        ['thanks', 'dan-pu-agradecimentos', 'Agradecimentos recebidos', '💛', ''],
        ['edits', 'dan-pu-edicoes', 'Contribuições', '✍️', 'dan-pu-stat-primary'],
        ['reverts', 'dan-pu-reversoes', 'Reversões', '🛡️', ''],
        ['edited', 'dan-pu-editados', 'Artigos diferentes editados', '🛠️', ''],
        ['articles', 'dan-pu-artigos', 'Artigos criados', '📚', ''],
        ['technicalCreated', 'dan-pu-criados-tecnicos', 'Predefinições, módulos e scripts criados', '🧩', '']
    ];
    function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
    function years(registration, now) {
        var start = new Date(registration), end = new Date(now);
        if (!registration || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) { return null; }
        var value = end.getUTCFullYear() - start.getUTCFullYear();
        if (end.getUTCMonth() < start.getUTCMonth() || end.getUTCMonth() === start.getUTCMonth() && end.getUTCDate() < start.getUTCDate()) { value -= 1; }
        return Math.max(0, value);
    }
    function values(statistics, activity, now) {
        var result = Object.assign({}, statistics && statistics.metrics || {});
        result.tenure = years(result.registration, now || Date.now());
        if (activity && activity.complete && activity.summary) { result.bestStreak = activity.summary.bestStreak; }
        return result;
    }
    function label(value, key) {
        if (!Number.isSafeInteger(value) || value < 0) { return 'Aguardando dados'; }
        return formatter.format(value) + (key === 'bestStreak' ? value === 1 ? ' dia' : ' dias' : key === 'tenure' ? value === 1 ? ' ano' : ' anos' : '');
    }
    function render(statistics, activity, options) {
        options = options || {};
        var user = options.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || '';
        if (statistics && statistics.user !== user || activity && activity.identity && activity.identity.user !== user) { throw new Error('Os contadores pertencem a outro usuário.'); }
        var data = values(statistics, activity, options.now);
        var html = '<div id="dan-pu-estatisticas" class="dan-pu-stats" data-perfilwiki-user="' + escape(user) + '">';
        fields.forEach(function (field) {
            var text = label(data[field[0]], field[0]);
            if (options.wiki && field[0] === 'tenure' && data.registration) {
                var date = new Date(data.registration);
                text = '{{Tempo decorrido|' + date.getUTCDate() + '|' + (date.getUTCMonth() + 1) + '|' + date.getUTCFullYear() + '|prec=ano}}';
            }
            html += '<div class="dan-pu-stat-card' + (field[4] ? ' ' + field[4] : '') + '"><div class="dan-pu-stat-icon" aria-hidden="true">' + field[3] + '</div><div class="dan-pu-stat-value"><span id="' + field[1] + '">' + text + '</span></div><div class="dan-pu-stat-label">' + field[2] + '</div></div>';
        });
        return html + '</div>';
    }
    function paint(document, statistics, activity, now) {
        var data = values(statistics, activity, now);
        fields.forEach(function (field) {
            var element = document.getElementById(field[1]);
            if (element && Number.isSafeInteger(data[field[0]]) && data[field[0]] >= 0) { element.textContent = label(data[field[0]], field[0]); }
        });
    }
    return Object.freeze({ html: render, wikitext: function (s, a, options) { return render(s, a, Object.assign({}, options, { wiki: true })); }, paint: paint, years: years });
}));
