/* Interface do painel Atividade na Wikipédia. Nenhuma requisição ou edição. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Presenter.js') : root.PerfilWikiPresenter);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiActivityView = api; }
}(typeof window !== 'undefined' ? window : this, function (presenter) {
    'use strict';
    var palette = ['#eaecf0', '#d6e7ff', '#9fc5ff', '#5c99ee', '#3366cc'];
    var months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    var weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    var numberFormatter = new Intl.NumberFormat('pt-BR');
    function escape(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function number(value) { return Number.isSafeInteger(value) ? numberFormatter.format(value) : 'Aguardando dados'; }
    function shortDate(value) {
        var p = value.split('-').map(Number);
        return p[2] + ' ' + months[p[1] - 1];
    }
    function range(period) {
        return shortDate(period.start) + (period.start.slice(0, 4) !== period.end.slice(0, 4) ? ' de ' + period.start.slice(0, 4) : '') + ' a ' + shortDate(period.end) + ' de ' + period.end.slice(0, 4);
    }
    function wikiLink(title, label, wiki, external) {
        if (wiki && !external) {
            // Titles are public API titles. Escape parser delimiters defensively.
            return '[[' + title.replace(/[\[\]{}|<>\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + '|' + escape(label).replace(/[\[\]{}|\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + ']]';
        }
        var href = external || 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
        return wiki ? '[' + href + ' ' + escape(label) + ']' : '<a href="' + escape(href) + '" style="color:#36c;text-decoration:none;">' + escape(label) + '</a>';
    }
    function streakGoal(current, best) {
        var goals = [7, 14, 30, 45, 60, 90, 100, 150, 200, 250, 365, 500, 730, 1000];
        var maximum = Math.max(current, best || 0);
        while (goals[goals.length - 1] <= maximum) { goals.push(goals[goals.length - 1] + 365); }
        var nextIndex = goals.findIndex(function (days) { return days > current; });
        var earned = goals.filter(function (days) { return days <= maximum; });
        return { current: current, next: goals[nextIndex], following: goals[nextIndex + 1] || goals[nextIndex] + 365,
            achieved: earned.length ? earned[earned.length - 1] : 0,
            remaining: goals[nextIndex] - current, percent: Math.min(100, current / goals[nextIndex] * 100) };
    }
    function render(state, wiki, allRows) {
        var a = state.activity && state.activity.summary;
        var p = state.pageviews;
        var user = state.config && state.config.user || '';
        var activityZone = state.config && state.config.timeZone || 'UTC';
        var presentation = allRows && typeof allRows === 'object' ? allRows : {};
        if (!a) { return '<div id="dan-pu-ritmo">As estatísticas ainda não foram consultadas.</div>'; }
        var h = [];
        h.push('<div id="dan-pu-ritmo" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-project="pt.wikipedia.org" style="clear:both;box-sizing:border-box;margin:2.1em 0;padding:24px;border:1px solid #c8ccd1;border-radius:12px;background:#fff;color:#202122;font-size:14px;line-height:1.5;">');
        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:20px;margin-bottom:25px;">');
        var lastEdit = presenter && presenter.lastEditAt(state);
        var lastExact = lastEdit && presenter.absoluteTime(lastEdit);
        var lastLabel = wiki ? lastExact : lastEdit && presenter.relativeTime(lastEdit, presentation.now);
        h.push('<div style="flex:1 1 300px;min-width:0;"><div style="font-family:Georgia,serif;font-size:29px;font-weight:bold;line-height:1.2;margin-bottom:7px;">Atividade na Wikipédia</div><div style="color:#54595d;font-size:16px;">' + escape(user) + '</div>');
        h.push('<div class="dan-pu-last-edit-line" style="margin-top:10px;color:#54595d;font-size:12px;">' + (wiki ? 'Última edição consultada' : 'Última edição') + ' · <span class="dan-pu-last-edit" data-live="' + (wiki ? 'false' : 'true') + '"' + (lastEdit ? ' data-timestamp="' + escape(lastEdit) + '" title="' + escape(lastExact) + '"' : '') + '>' + escape(lastLabel || (lastEdit ? 'Horário indisponível' : 'Nenhuma edição encontrada')) + '</span></div></div>');
        var goal = streakGoal(a.currentStreak, a.bestStreak);
        // Wikipedia removes numeric ARIA attributes from saved markup. A static
        // image label preserves the full value for visitors; the owner's live
        // DOM uses the native progressbar semantics.
        var goalAria = wiki ? 'role="img" aria-label="' + a.currentStreak + ' de ' + goal.next + ' dias seguidos, faltam ' + goal.remaining + ' dias"' :
            'role="progressbar" aria-label="Meta de dias seguidos" aria-valuemin="0" aria-valuemax="' + goal.next + '" aria-valuenow="' + a.currentStreak + '"';
        h.push('<div style="flex:1 1 300px;background:#faf7ef;border-radius:10px;padding:16px 20px;">');
        h.push('<div style="display:flex;align-items:center;gap:24px;"><div style="flex:1;"><div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(a.currentStreak) + '</div><div style="color:#54595d;">dias seguidos</div></div><div style="flex:1.5;min-width:140px;"><div style="color:#54595d;font-size:12px;">Próxima meta</div><div style="font-size:24px;font-weight:700;line-height:1.4;">' + number(goal.next) + ' dias</div><div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#54595d;margin:4px 0;">' + number(a.currentStreak) + ' de ' + number(goal.next) + '<span>Faltam ' + number(goal.remaining) + '</span></div><div ' + goalAria + ' style="height:7px;border-radius:4px;background:#e5e1d7;overflow:hidden;"><div style="height:7px;width:' + goal.percent.toFixed(2) + '%;background:#36c;border-radius:4px;"></div></div></div></div>');
        h.push('<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:13px;padding-top:11px;border-top:1px solid #e5e1d7;font-size:12px;"><span style="color:#246342;font-weight:600;">' + (goal.achieved ? '✓ ' + number(goal.achieved) + ' dias alcançados' : 'Seu primeiro marco: 7 dias') + '</span><span style="color:#54595d;">Depois: ' + number(goal.following) + ' dias</span></div></div></div>');
        h.push('<div style="border:1px solid #d8dce3;border-radius:10px;padding:18px;margin-bottom:20px;">');
        h.push('<div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:7px 14px;margin-bottom:18px;"><strong style="font-family:Georgia,serif;font-size:20px;">12 semanas</strong><span style="color:#54595d;">' + shortDate(a.gridStart) + ' a ' + shortDate(a.today) + '</span><span style="margin-left:auto;color:#54595d;font-size:12px;">Edições por dia</span></div>');
        var weeks = a.weeks;
        var max = Math.max.apply(null, weeks.flatMap(function (w) { return w.days.map(function (d) { return d.count || 0; }); }));
        var legend = palette.map(function (color) { return '<span style="display:inline-block;width:15px;height:15px;border-radius:3px;background:' + color + ';vertical-align:middle;"></span>'; }).join(' ');
        h.push('<div style="overflow-x:auto;"><div style="min-width:240px;display:grid;grid-template-columns:28px 1fr;gap:8px;">');
        h.push('<div style="display:grid;grid-template-rows:repeat(7,24px);gap:3px;font-size:11px;color:#54595d;">' + weekdays.map(function (d) { return '<span style="display:flex;align-items:center;">' + d + '</span>'; }).join('') + '</div>');
        h.push('<div role="img" aria-label="' + escape(a.edits30 + ' edições em ' + a.activeDays30 + ' dos últimos 30 dias. Fuso ' + activityZone + '.') + '" style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));grid-template-rows:repeat(7,24px);grid-auto-flow:column;gap:3px;">');
        weeks.forEach(function (week) {
            week.days.forEach(function (day) {
                var bucket = !day.count ? 0 : Math.max(1, Math.min(4, Math.ceil(Math.log(1 + day.count) / Math.log(1 + Math.max(2, max)) * 4)));
                var label = day.future ? shortDate(day.date) + ', dia ainda não concluído' : shortDate(day.date) + ': ' + number(day.count) + ' edições';
                h.push('<span data-date="' + day.date + '" data-count="' + day.count + '" title="' + escape(label) + '" style="display:block;border-radius:3px;background:' + (day.future ? '#f8f9fa' : palette[bucket]) + ';' + (day.date === a.today ? 'outline:2px solid #202122;outline-offset:1px;' : '') + '"></span>');
            });
        });
        h.push('</div><span></span><div style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));gap:3px;font-size:9px;color:#54595d;">' + weeks.map(function (w) { var date = w.start.split('-').map(Number); return '<span style="text-align:center;white-space:nowrap;">' + date[2] + '/' + date[1] + '</span>'; }).join('') + '</div></div></div>');
        h.push('<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:17px;font-size:12px;color:#54595d;"><span>' + number(a.edits30) + ' edições · ' + number(a.articles30) + ' artigos diferentes editados nos últimos 30 dias</span><span>Nenhuma ' + legend + ' Mais edições</span></div></div>');
        h.push('<div class="dan-pu-readership" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-project="pt.wikipedia.org" data-metric-version="after-first-edit-v1" data-total-model="all-periods-all-eligible-v1" style="border:1px solid #d8dce3;border-radius:10px;padding:18px;">');
        h.push('<div style="font-family:Georgia,serif;font-size:23px;font-weight:bold;line-height:1.25;margin-bottom:5px;">Visualizações dos artigos editados por ' + escape(user) + '.</div>');
        h.push('<div style="color:#54595d;font-size:12px;">Somente após sua primeira edição em cada artigo.</div>');
        var explanation = 'Os períodos somam as visitas recebidas depois da sua primeira edição em cada artigo. Os totais abrangem todos os artigos elegíveis, mesmo quando a lista mostra apenas uma parte. A contagem de visualizações começa no dia seguinte à primeira edição, em UTC. As sequências usam o fuso ' + escape(activityZone) + '. A última edição corresponde ao histórico consultado, que pode ter sido atualizado antes desta visita.';
        if (wiki) {
            h.push('<div class="dan-pu-data-help">' + wikiLink(presentation.documentationPage ? presentation.documentationPage + '#Como_os_dados_são_contados' : 'Usuário:Daniel G Rego/PerfilWiki#Como_os_dados_são_contados', 'Sobre estes dados', true) + '</div>');
        } else {
            h.push('<details class="dan-pu-data-help"><summary>Sobre estes dados</summary><div>' + explanation + '</div></details>');
        }
        var keys = ['30d', '90d', '12m', 'since'];
        var labels = { '30d': '30 dias', '90d': '90 dias', '12m': '12 meses', 'since': 'Total acumulado' };
        var titles = { '30d': 'Visualizações nos últimos 30 dias', '90d': 'Visualizações nos últimos 90 dias', '12m': 'Visualizações nos últimos 12 meses', 'since': 'Visualizações acumuladas' };
        keys.forEach(function (key) { h.push('<span id="dan-pu-view-' + key + '" class="dan-pu-view-target" aria-hidden="true"></span>'); });
        h.push('<div class="dan-pu-period-tabs plainlinks" role="navigation" aria-label="Período de visualizações">');
        keys.forEach(function (key) {
            h.push(wiki ? '<span id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '">[{{fullurl:{{FULLPAGENAME}}}}#dan-pu-view-' + key + ' ' + labels[key] + ']</span>' :
                '<a id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '" href="#dan-pu-view-' + key + '">' + labels[key] + '</a>');
        });
        h.push('</div>');
        keys.forEach(function (key) {
            var profile = p && p.periods && p.periods[key];
            var previousProfile = p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.periods && p.lastCompleteSnapshot.periods[key];
            var needsPrevious = profile && !profile.complete;
            var data = needsPrevious && (profile.lastCompleteSnapshot || previousProfile) || profile;
            // The display cap never changes the all-article totals or cached proofs.
            var rows = (data && data.rows || []).slice().sort(function (x, y) { return (y.views == null ? -1 : y.views) - (x.views == null ? -1 : x.views) || x.title.localeCompare(y.title, 'pt'); }).slice(0, 500);
            var eligible = data && data.proof && Number.isSafeInteger(data.proof.eligible) ? data.proof.eligible : (p && p.metadata && p.metadata.cohort ? p.metadata.cohort.length : 0);
            var requestedRows = allRows && allRows.visibleCounts && allRows.visibleCounts[key];
            var expanded = allRows === true || allRows && allRows.expanded && allRows.expanded[key];
            var visibleRows = Math.min(rows.length, expanded ? rows.length : Number.isSafeInteger(requestedRows) ? Math.max(10, requestedRows) : 10);
            var exact = !!data && data.rankingComplete;
            h.push('<div id="dan-pu-period-' + key + '" class="dan-pu-period dan-pu-period-' + key + '">');
            h.push('<div style="font-size:17px;font-weight:600;margin-bottom:8px;">' + titles[key] + '</div>');
            var totalExact = exact && data.complete && Number.isSafeInteger(data.allArticleTotal);
            if (totalExact) {
                h.push('<div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(data.allArticleTotal) + '</div>');
                h.push('<div style="color:#54595d;font-size:13px;margin:4px 0 10px;">nos ' + number(eligible) + ' artigos editados por você</div>');
            } else { h.push('<div style="color:#54595d;margin:4px 0 10px;">Somando as visualizações de todos os artigos editados.</div>'); }
            if (data && data.period) { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:4px;">' + (key === 'since' ? 'Até ' + shortDate(data.period.end) + ' de ' + data.period.end.slice(0, 4) : range(data.period)) + ' · UTC</div>'); }
            if (key === 'since' && data && data.proof && data.proof.truncatedArticles > 0) {
                h.push('<div style="color:#54595d;font-size:12px;margin-bottom:8px;">Histórico disponível desde 1 jul. de 2015. Artigos editados antes disso têm contagem parcial.</div>');
            }
            if (key !== 'since') { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:17px;">Todo o histórico · ' + number(eligible) + ' artigos editados</div>'); }
            if (rows.length) {
                var sorted = rows;
                h.push('<div style="display:flex;justify-content:space-between;gap:12px;padding-bottom:8px;border-bottom:1px solid #c8ccd1;color:#54595d;font-size:12px;"><span>' + (exact ? 'Artigo' : 'Ordem provisória') + '</span><span>Visualizações</span></div>');
                function renderRow(row, index) {
                    var countedFrom = row.countFromDate || data.period.start;
                    var details = 'https://pageviews.wmcloud.org/?project=pt.wikipedia.org&platform=all-access&agent=user&start=' + countedFrom + '&end=' + data.period.end + '&pages=' + encodeURIComponent(row.title.replace(/ /g, '_'));
                    var firstDate = key === 'since' && row.firstEditAt ? row.firstEditAt.slice(0, 10) : null;
                    var firstLabel = firstDate ? '<span class="dan-pu-view-first">Primeira edição: ' + shortDate(firstDate) + ' de ' + firstDate.slice(0, 4) + '</span>' : '';
                    var pending = '<span class="dan-pu-view-pending"><span aria-hidden="true">◷</span> Aguardando dados</span>';
                    var viewLabel = Number.isSafeInteger(row.views) ? countedFrom <= data.period.end ? wikiLink('', number(row.views), wiki, details) : number(row.views) : pending;
                    // Keep the rank as real text. CSS Grid positions it without
                    // a wrapper. The lifetime date stays outside the article link.
                    var articleLabel = wikiLink(row.title, row.title, wiki);
                    if (firstLabel) { articleLabel = '<span class="dan-pu-view-title">' + articleLabel + firstLabel + '</span>'; }
                    var linkedViews = Number.isSafeInteger(row.views) && countedFrom <= data.period.end;
                    if (!linkedViews) { viewLabel = '<span class="dan-pu-view-views">' + viewLabel + '</span>'; }
                    if (index < 10) {
                        var image = presenter && presenter.imageFor(presentation.images, row);
                        var picture = image ? (wiki ? '[[Ficheiro:' + image.file + '|48x48px|link=|alt=]]' : '<img class="dan-pu-thumb" src="' + escape(image.src) + '" alt="" width="48" height="48" loading="lazy" decoding="async" crossorigin="anonymous" referrerpolicy="no-referrer">') : '<span class="dan-pu-thumb-placeholder" aria-hidden="true">▧</span>';
                        h.push('<div class="dan-pu-view-row" data-layout="featured" data-shade="' + (index % 2 ? 'alternate' : 'plain') + '" style="display:grid;grid-template-columns:24px 48px minmax(0,1fr) max-content;column-gap:12px;">' +
                            '<span class="dan-pu-view-rank">' + (index + 1) + '</span><span class="dan-pu-view-image" aria-hidden="true" data-pageid="' + row.pageid + '" data-title="' + escape(row.title) + '">' + picture + '</span>' +
                            '<span class="dan-pu-featured-title">' + wikiLink(row.title, row.title, wiki) + firstLabel + '</span><span class="dan-pu-featured-views">' + viewLabel + '</span></div>');
                    } else {
                        h.push('<div class="dan-pu-view-row" data-layout="compact">' + (index + 1) + articleLabel + viewLabel + '</div>');
                    }
                }
                sorted.slice(0, wiki ? 10 : visibleRows).forEach(renderRow);
                if (sorted.length > 10) {
                    if (wiki) {
                        var stages = 0;
                        for (var start = 10; start < sorted.length; start += 100) {
                            var chunk = sorted.slice(start, start + 100);
                            h.push('<div class="dan-pu-native-more mw-collapsible mw-collapsed" data-expandtext="Mostrar mais ' + chunk.length + '" data-collapsetext="' + (start === 10 ? 'Mostrar só 10' : 'Ocultar esta etapa') + '"><div class="mw-collapsible-content">');
                            chunk.forEach(function (row, index) { renderRow(row, index + start); });
                            stages += 1;
                        }
                        for (var stage = 0; stage < stages; stage += 1) { h.push('</div></div>'); }
                    } else {
                        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:13px;">');
                        h.push('<span style="color:#54595d;font-size:12px;">Exibindo ' + number(visibleRows) + ' de ' + number(sorted.length) + ' artigos</span>');
                        if (visibleRows < sorted.length) {
                            h.push('<span id="dan-pu-ritmo-expand-' + key + '">' + wikiLink('Especial:Contribuições/' + user, 'Mostrar mais ' + Math.min(100, sorted.length - visibleRows), false) + '</span>');
                        }
                        if (visibleRows > 10) {
                            h.push('<span id="dan-pu-ritmo-collapse-' + key + '">' + wikiLink('Especial:Contribuições/' + user, 'Mostrar só 10', false) + '</span>');
                        }
                        h.push('</div>');
                    }
                }
            }
            if (profile && !profile.complete && p && p.progress) {
                h.push('<div role="status" style="margin-top:12px;color:#54595d;font-size:12px;">Consulta em andamento · ' + number(p.progress.collectedArticles || p.progress.checked || p.progress.available || 0) + ' artigos consultados</div>');
            }
            var stamp = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' }).format(new Date(data && data.capturedAt || (data !== profile && p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.capturedAt) || p && p.capturedAt || state.capturedAt));
            h.push('<div style="margin-top:15px;color:#54595d;font-size:11px;">Atualizado em ' + escape(stamp) + ' UTC</div></div>');
        });
        h.push('</div><div id="dan-pu-ritmo-install" style="margin-top:18px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;">Gostou deste painel? ' + wikiLink(presentation.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki', 'Veja como adicionar à sua página de usuário.', wiki) + '</div></div>');
        // Newlines between inline cells make the wiki parser insert a paragraph
        // inside the CSS grid. Keep the exported HTML fragment contiguous.
        return (wiki ? '<templatestyles src="' + escape(presentation.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos') + '" />' : '') + h.join('');
    }
    return Object.freeze({ streakGoal: streakGoal, html: function (s, all) { return render(s, false, all); }, wikitext: function (s, options) { return render(s, true, options || false); } });
}));
