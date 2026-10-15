(function (win) {
    'use strict';
    var t = win.PWTEST;
    t.ready = (async function () { await t.advance(5000); return { runtime: !!win.PerfilWiki, scenario: t.scenario }; }());
    t.run = async function () {
        await t.ready;
        var checks = t.checks = [];
        function check(name, condition, detail) { checks.push({ name: name, pass: !!condition, detail: detail }); if (!condition) { throw new Error(name + ': ' + JSON.stringify(detail)); } }
        function text(id) { var node = win.document.getElementById(id); return node && node.textContent; }
        function rows(period) { return win.document.querySelectorAll('#dan-pu-period-' + period + ' .dan-pu-view-row').length; }
        function click(id) { var element = win.document.getElementById(id); if (!element) { throw new Error('Missing ' + id); } (element.querySelector('button,a') || element).click(); }
        if (t.scenario === 'owner-gate' || t.scenario === 'missing-relevant') {
            check('different logged-in owner does not install', !win.PerfilWiki, {});
            check('owner gate performs no logical requests', t.requests.length === 0, t.requests.length);
        } else if (t.scenario === 'no-script') {
            check('static snapshot remains readable without bundle', !win.PerfilWiki && /20[.\s]000/.test(text('dan-pu-edicoes')), text('dan-pu-edicoes'));
            check('static snapshot carries explicit account identity', win.document.getElementById('dan-pu-ritmo').getAttribute('data-perfilwiki-user') === win.PW_SEED.user, {});
        } else if (t.scenario === 'unknown') {
            check('unknown counters cannot borrow copied account values', Array.from(win.document.querySelectorAll('#dan-pu-estatisticas .dan-pu-stat-value span')).every(function (node) { return node.textContent === 'Aguardando dados'; }), Array.from(win.document.querySelectorAll('#dan-pu-estatisticas .dan-pu-stat-value span')).map(function (node) { return node.textContent; }));
            check('copied activity is removed before a failed first scan', !win.document.querySelector('.dan-pu-readership') && win.document.getElementById('dan-pu-ritmo').textContent.indexOf('Outra pessoa') < 0, win.document.getElementById('dan-pu-ritmo').textContent);
            check('service error preserves a bounded request count', t.requests.length <= 3, t.requests.length);
        } else {
            var api = win.PerfilWiki, state = api && api.getState();
            check('actual bundled runtime installs its public API', api && api.version === win.PW_SEED.releaseVersion && state && state.history.complete, state && state.history.entries.length);
            check('a second complete bundle load reuses the same runtime', api === t.firstApi && win.document.querySelectorAll('#t-perfilwiki-refresh').length === 1, {});
            check('rich history, activity and card metrics share one account', state.history.user === win.PW_SEED.user && state.activity.identity.user === state.history.user && state.statistics.user === state.history.user, {});
            check('official global and local counters remain distinct', state.statistics.metrics.edits === 20000 && state.statistics.metrics.edited === 501 && state.statistics.metrics.reverts === 1, state.statistics.metrics);
            check('a one-day best streak uses the singular label', text('dan-pu-ritmo-melhor-sequencia') === '1 dia', text('dan-pu-ritmo-melhor-sequencia'));
            var activeCell = win.document.querySelector('[data-date="2024-08-17"][data-count="501"]');
            check('the shared history paints its active heatmap day', activeCell && activeCell.style.backgroundColor === 'rgb(51, 102, 204)', activeCell && activeCell.style.backgroundColor);
            ['30d', '90d', '12m', 'since'].forEach(function (key) {
                click('dan-pu-ritmo-tab-' + key);
                check('period ' + key + ' opens with ten rows', rows(key) === 10 && win.getComputedStyle(win.document.getElementById('dan-pu-period-' + key)).display !== 'none', rows(key));
            });
            click('dan-pu-ritmo-tab-90d'); click('dan-pu-ritmo-expand-90d');
            check('first expansion adds one hundred rows', rows('90d') === 110, rows('90d'));
            for (var expansion = 0; expansion < 5 && rows('90d') < 500; expansion += 1) { click('dan-pu-ritmo-expand-90d'); }
            check('display stops at five hundred with all-article totals intact', rows('90d') === 500 && state.pageviews.periods['90d'].allArticleTotal === 251502, { rows: rows('90d'), total: state.pageviews.periods['90d'].allArticleTotal });
            t.stage = 'manual-refresh';
            var refreshed = false, refreshError = null;
            Promise.resolve(api.refresh()).then(function () { refreshed = true; }, function (error) { refreshError = String(error.stack || error); refreshed = true; });
            for (var pump = 0; pump < 80 && !refreshed; pump += 1) { await t.advance(2000); }
            check('manual refresh completes within the bounded clock pump', refreshed && !refreshError, { refreshed: refreshed, error: refreshError, requests: t.requests.length });
            t.stage = 'after-manual-refresh';
            check('manual refresh retains selected period and expanded list', rows('90d') === 500 && win.getComputedStyle(win.document.getElementById('dan-pu-period-90d')).display !== 'none', rows('90d'));
            var latest = api.getState();
            check('manual refresh uses one shared contribution chain', t.requests.filter(function (request) { return new URL(request.url).searchParams.get('list') === 'usercontribs'; }).length === 2, t.requests.filter(function (request) { return new URL(request.url).searchParams.get('list') === 'usercontribs'; }).length);
            check('refreshed integrated state passes its real validator', win.PerfilWikiCoordinator.validateState(latest).valid, win.PerfilWikiCoordinator.validateState(latest));
            api.downloadActivity(); api.downloadCards(); await t.advance(0);
            var panel = t.downloads.find(function (item) { return item.name === 'PerfilWiki_atividade.wiki'; });
            var cards = t.downloads.find(function (item) { return item.name === 'PerfilWiki_contadores.wiki'; });
            check('activity export contains every visible ranking row in all four periods', panel && (panel.text.match(/class="dan-pu-view-row"/g) || []).length === 2000 && panel.text.indexOf('data-perfilwiki-user="' + win.PW_SEED.user + '"') >= 0, panel && { characters: panel.text.length, rows: (panel.text.match(/class="dan-pu-view-row"/g) || []).length });
            check('card export contains all eight cards and exact global count', cards && (cards.text.match(/class="dan-pu-stat-card/g) || []).length === 8 && cards.text.indexOf('20.000') >= 0, cards && cards.text.length);
            [panel, cards].forEach(function (item) {
                var expected = '<templatestyles src="' + win.PW_SEED.stylesPage + '" />';
                check(item.name + ' uses the existing sanitized-css stylesheet target', item.text.indexOf(expected) === 0 && item.text.indexOf('<templatestyles src="Usuário:Daniel G Rego/PerfilWiki-estilos"') < 0, { stylesPage: win.PW_SEED.stylesPage });
            });
            click('dan-pu-ritmo-collapse-90d'); click('dan-pu-ritmo-tab-30d');
        }
        check('all logical data requests are anonymous GET', t.requests.every(function (request) { return request.method === 'GET' && request.credentials === 'omit'; }), t.requests.length);
        check('no writes, external navigation or alternate transports occurred', t.forbidden.length === 0, t.forbidden);
        check('no browser or CSP errors occurred', t.errors.length === 0 && t.csp.length === 0, { errors: t.errors, csp: t.csp });
        return { scenario: t.scenario, checks: checks, passed: checks.length, failed: 0, logicalRequests: t.requests.length, errors: t.errors, forbidden: t.forbidden, csp: t.csp,
            downloads: t.downloads.map(function (d) { return { name: d.name, characters: d.text.length }; }), simulatedIdentityOnly: true, authenticatedWikiSession: false };
    };
}(window));
