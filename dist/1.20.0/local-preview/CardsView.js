/* PerfilWiki 1.0.0. Statistics cards, compatible with existing RitmoPU markup.
 * Daniel G Rego, CC BY-SA 4.0. No requests, timers, or wiki writes. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./ActivityView.js') : root.PerfilWikiActivityView,
        typeof module === 'object' && module.exports ? require('./I18n.js') : root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiCardsView = api; }
}(typeof window !== 'undefined' ? window : this, function (appearance, profileView, i18n) {
    'use strict';
    var language='pt-BR';
    function tr(source,params){return i18n.t(language,source,params);}
    function inLanguage(fn,presentation,args){var previous=language;language=i18n.normalizeLanguage(presentation&&presentation.language||presentation&&presentation.appearance&&presentation.appearance.language);try{return fn.apply(null,args);}finally{language=previous;}}

    var formatter = {format:function(value){return i18n.number(language,value,{});}};
    var decimalFormatter = {format:function(value){return i18n.number(language,value,{maximumFractionDigits:1});}};
    var averageFormatter = {format:function(value){return i18n.number(language,value,{minimumFractionDigits:1,maximumFractionDigits:1});}};
    var articleCache = new WeakMap();
    var namespaceCache = new WeakMap();
    var calendarCache = new WeakMap();
    var fields = [
        ['tenure', 'perfilwiki-anos', 'Na Wikipédia', '🌱', 'dan-pu-stat-tenure'],
        ['bestStreak', 'dan-pu-ritmo-melhor-sequencia', 'Melhor sequência', '🔥', ''],
        ['thanks', 'dan-pu-agradecimentos', 'Agradecimentos recebidos', '💛', ''],
        ['edits', 'dan-pu-edicoes', 'Contribuições', '✍️', 'dan-pu-stat-primary'],
        ['reverts', 'dan-pu-reversoes', 'Reversões', '🛡️', ''],
        ['edited', 'dan-pu-editados', 'Artigos diferentes editados', '🛠️', ''],
        ['articles', 'dan-pu-artigos', 'Artigos criados', '📚', ''],
        ['technicalCreated', 'dan-pu-criados-tecnicos', 'Predefinições, módulos e scripts criados', '🧩', ''],
        ['mostEditedArticle', 'dan-pu-artigo-mais-editado', 'Artigo mais editado', '', ''],
        ['bytesAdded', 'dan-pu-bytes-acrescentados', 'Bytes acrescentados', '', '', 'Saldo positivo por edição'],
        ['bytesRemoved', 'dan-pu-bytes-removidos', 'Bytes removidos', '', '', 'Saldo negativo por edição'],
        ['activeDays', 'dan-pu-dias-com-edicoes', 'Dias com edições', '', ''],
        ['articleEdits', 'dan-pu-edicoes-em-artigos', 'Edições em artigos', '', ''],
        ['talkEdits', 'dan-pu-edicoes-em-discussoes', 'Edições em discussões', '', ''],
        ['activeMonths', 'dan-pu-meses-com-edicoes', 'Meses com edições', '', ''],
        ['busiestDay', 'dan-pu-dia-com-mais-edicoes', 'Dia com mais edições', '', ''],
        ['edits30', 'dan-pu-edicoes-30-dias', 'Edições nos últimos 30 dias', '', ''],
        ['averagePerActiveDay', 'dan-pu-media-por-dia-ativo', 'Média por dia ativo', '', '', 'Edições por dia com atividade'],
        ['activeYears', 'dan-pu-anos-com-edicoes', 'Anos com edições', '', ''],
        ['busiestMonth', 'dan-pu-mes-com-mais-edicoes', 'Mês com mais edições', '', ''],
        ['thanksSent', 'dan-pu-agradecimentos-enviados', 'Agradecimentos enviados', '', '', 'Na Wikipédia em português'],
        ['averageBytesPerEdit', 'dan-pu-media-bytes-por-edicao', 'Média de bytes acrescentados por edição', '', '', 'Todas as edições públicas da conta na ptwiki'],
        ['largestAddition', 'dan-pu-maior-acrescimo', 'Maior acréscimo em uma edição', '', '', 'Saldo positivo por edição'],
        ['largestRemoval', 'dan-pu-maior-remocao', 'Maior remoção em uma edição', '', '', 'Saldo negativo por edição']
    ];
    function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
    function escapeData(value) { return escape(value).replace(/[\[\]{}|]/g, function (character) { return '&#' + character.charCodeAt(0) + ';'; }); }
    function years(registration, now) {
        var start = new Date(registration), end = new Date(now);
        if (!registration || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) { return null; }
        var value = end.getUTCFullYear() - start.getUTCFullYear();
        if (end.getUTCMonth() < start.getUTCMonth() || end.getUTCMonth() === start.getUTCMonth() && end.getUTCDate() < start.getUTCDate()) { value -= 1; }
        return Math.max(0, value);
    }
    function tenureRegistration(statistics, now) {
        var evidence = statistics && statistics.registrationCoverage;
        var metrics = statistics && statistics.metrics;
        var clock = new Date(now === undefined ? Date.now() : now).getTime();
        function timestamp(value) {
            if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
            var parsed = new Date(value);
            return Number.isFinite(parsed.getTime()) && parsed.toISOString().replace('.000Z', 'Z') === value.replace('.000Z', 'Z') ? parsed.getTime() : null;
        }
        var earliest = metrics && timestamp(metrics.earliestRegistration);
        var checked = evidence && timestamp(evidence.checkedAt);
        if (!statistics || !metrics || !evidence || evidence.version !== 1 || evidence.user !== statistics.user ||
            typeof evidence.complete !== 'boolean' || !Array.isArray(evidence.accounts) || evidence.accounts.length > 2000 ||
            !statistics.metricUpdatedAt || statistics.metricUpdatedAt.earliestRegistration !== evidence.checkedAt ||
            earliest === null || checked === null || !Number.isFinite(clock) || checked > clock) { return null; }
        var known = [], complete = true, valid = true;
        [evidence.globalRegistration].concat(Array.from(evidence.accounts, function (account) { return account && account.registration; })).forEach(function (value) {
            if (value === null) { complete = false; return; }
            var parsed = timestamp(value);
            if (parsed === null || parsed > checked) { valid = false; }
            else { known.push(parsed); }
        });
        // A local registration date does not establish when the linked account
        // first existed. Only the checked minimum from global evidence is used.
        return valid && known.length && complete === evidence.complete && Math.min.apply(null, known) === earliest ? metrics.earliestRegistration : null;
    }
    function mostEditedArticle(activity) {
        if (!activity || activity.complete !== true || !Array.isArray(activity.entries)) { return null; }
        var cached = articleCache.get(activity);
        if (cached && cached.entries === activity.entries && cached.length === activity.entries.length) { return cached.value; }
        var seen = new Set(), pages = new Map();
        activity.entries.forEach(function (entry) {
            if (!Array.isArray(entry) || !Number.isSafeInteger(entry[0]) || entry[0] <= 0 || seen.has(entry[0]) ||
                !Number.isSafeInteger(entry[1]) || entry[1] <= 0 || entry[2] !== 0 || typeof entry[3] !== 'string' || !entry[3] || entry[3].length > 1024) { return; }
            var time = Date.parse(entry[4]);
            if (!Number.isFinite(time)) { return; }
            seen.add(entry[0]);
            var page = pages.get(entry[1]);
            if (!page) { page = {pageid:entry[1], title:entry[3], edits:0, time:time, revision:entry[0]}; pages.set(entry[1], page); }
            page.edits += 1;
            if (time > page.time || time === page.time && entry[0] > page.revision) { page.title = entry[3]; page.time = time; page.revision = entry[0]; }
        });
        var winner = null;
        pages.forEach(function (page) {
            if (!winner || page.edits > winner.edits || page.edits === winner.edits &&
                (page.title.localeCompare(winner.title, 'pt') < 0 || page.title.localeCompare(winner.title, 'pt') === 0 && page.pageid < winner.pageid)) { winner = page; }
        });
        var value = Object.freeze(winner ? {pageid:winner.pageid, title:winner.title, edits:winner.edits} : {pageid:null, title:null, edits:0});
        articleCache.set(activity, {entries:activity.entries, length:activity.entries.length, value:value});
        return value;
    }
    function namespaceTotals(activity) {
        if (!activity || activity.complete !== true || !Array.isArray(activity.entries)) { return null; }
        var cached = namespaceCache.get(activity);
        if (cached && cached.entries === activity.entries && cached.length === activity.entries.length) { return cached.value; }
        var seen = new Set(), result = {articleEdits:0, talkEdits:0};
        activity.entries.forEach(function (entry) {
            if (!Array.isArray(entry) || !Number.isSafeInteger(entry[0]) || entry[0] <= 0 || seen.has(entry[0]) ||
                !Number.isSafeInteger(entry[1]) || entry[1] < 0 || !Number.isInteger(entry[2]) || entry[2] < 0 ||
                typeof entry[3] !== 'string' || entry[3].length > 1024 || typeof entry[4] !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(entry[4])) { return; }
            var time = new Date(entry[4]);
            if (!Number.isFinite(time.getTime()) || time.toISOString().slice(0,10) !== entry[4].slice(0,10)) { return; }
            seen.add(entry[0]);
            if (entry[2] === 0) { result.articleEdits += 1; }
            if (entry[2] % 2 === 1) { result.talkEdits += 1; }
        });
        Object.freeze(result);
        namespaceCache.set(activity,{entries:activity.entries,length:activity.entries.length,value:result});
        return result;
    }
    function validDay(date) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { return false; }
        var time = new Date(date + 'T00:00:00Z');
        return Number.isFinite(time.getTime()) && time.toISOString().slice(0,10) === date;
    }
    function calendarTotals(activity) {
        if (!activity || activity.complete !== true || !activity.summary || !activity.summary.counts ||
            typeof activity.summary.counts !== 'object' || Array.isArray(activity.summary.counts)) { return null; }
        var summary = activity.summary, cached = calendarCache.get(summary);
        if (cached && cached.counts === summary.counts) { return cached.value; }
        // The shared activity summary already deduplicates revisions, applies its
        // calendar exclusions and groups each edit in the configured time zone.
        var months = new Map(), years = new Set(), busiest = {date:null,edits:0}, valid = true;
        var totalEdits = 0, activeDays = 0;
        Object.keys(summary.counts).forEach(function (date) {
            var count = summary.counts[date];
            if (!validDay(date) || !Number.isSafeInteger(count) || count < 0) { valid = false; return; }
            if (!count) { return; }
            var month = date.slice(0,7), monthEdits = (months.get(month) || 0) + count;
            totalEdits += count;
            if (!Number.isSafeInteger(totalEdits) || !Number.isSafeInteger(monthEdits)) { valid = false; return; }
            activeDays += 1;
            months.set(month,monthEdits);
            years.add(date.slice(0,4));
            if (count > busiest.edits || count === busiest.edits && date < busiest.date) { busiest = {date:date,edits:count}; }
        });
        var busiestMonth = {month:null,edits:0};
        months.forEach(function (edits,month) {
            if (edits > busiestMonth.edits || edits === busiestMonth.edits && month < busiestMonth.month) {
                busiestMonth = {month:month,edits:edits};
            }
        });
        var result = valid ? Object.freeze({activeMonths:months.size,busiestDay:Object.freeze(busiest),
            activeYears:years.size,averagePerActiveDay:activeDays ? totalEdits / activeDays : 0,
            busiestMonth:Object.freeze(busiestMonth)}) : null;
        calendarCache.set(summary,{counts:summary.counts,value:result});
        return result;
    }
    function values(statistics, activity, now, includeArticle, includeActiveDays, selected) {
        var result = Object.assign({}, statistics && statistics.metrics || {});
        result.tenureRegistration = tenureRegistration(statistics, now);
        result.tenure = years(result.tenureRegistration, now === undefined ? Date.now() : now);
        if (activity && activity.complete && activity.summary) { result.bestStreak = activity.summary.bestStreak; }
        if (includeArticle) { result.mostEditedArticle = mostEditedArticle(activity); }
        if (includeActiveDays) {
            result.activeDays = activity && activity.complete === true && activity.summary && Number.isSafeInteger(activity.summary.totalActiveDays) && activity.summary.totalActiveDays >= 0 ? activity.summary.totalActiveDays : null;
        }
        selected = selected || [];
        if (selected.indexOf('edits30') >= 0) {
            result.edits30 = activity && activity.complete === true && activity.summary && Number.isSafeInteger(activity.summary.edits30) && activity.summary.edits30 >= 0 ? activity.summary.edits30 : null;
        }
        if (selected.indexOf('articleEdits') >= 0 || selected.indexOf('talkEdits') >= 0) {
            var namespaces = namespaceTotals(activity);
            result.articleEdits = namespaces ? namespaces.articleEdits : null;
            result.talkEdits = namespaces ? namespaces.talkEdits : null;
        }
        if (selected.indexOf('activeMonths') >= 0 || selected.indexOf('busiestDay') >= 0 || selected.indexOf('activeYears') >= 0 ||
            selected.indexOf('averagePerActiveDay') >= 0 || selected.indexOf('busiestMonth') >= 0) {
            var calendar = calendarTotals(activity);
            result.activeMonths = calendar ? calendar.activeMonths : null;
            result.busiestDay = calendar ? calendar.busiestDay : null;
            result.activeYears = calendar ? calendar.activeYears : null;
            result.averagePerActiveDay = calendar ? calendar.averagePerActiveDay : null;
            result.busiestMonth = calendar ? calendar.busiestMonth : null;
        }
        return result;
    }
    function metricValue(value,key) {
        return key === 'averagePerActiveDay' || key === 'averageBytesPerEdit' ? typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER : Number.isSafeInteger(value) && value >= 0;
    }
    function label(value, key) {
        if (!metricValue(value,key)) { return tr("Aguardando dados"); }
        if (key === 'averagePerActiveDay') { return averageFormatter.format(value); }
        if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].indexOf(key) >= 0) {
            var units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB'], amount = value, unit = 0;
            while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
            return (key === 'averageBytesPerEdit' ? averageFormatter.format(amount) : unit ? decimalFormatter.format(amount) : formatter.format(amount)) + ' ' + (value === 1 ? 'byte' : units[unit]);
        }
        return formatter.format(value) + (key === 'bestStreak' || key === 'activeDays' ? value === 1 ? tr(" dia") : tr(" dias") : key === 'tenure' || key === 'activeYears' ? value === 1 ? tr(" ano") : tr(" anos") : key === 'activeMonths' ? value === 1 ? tr(" mês") : tr(" meses") : '');
    }
    function busiestValue(value) {
        return value && typeof value === 'object' && (value.date === null && value.edits === 0 ||
            validDay(value.date) && Number.isSafeInteger(value.edits) && value.edits > 0);
    }
    function busiestMarkup(value) {
        if (!busiestValue(value)) { return tr("Aguardando dados"); }
        if (!value.edits) { return tr("Nenhum dia"); }
        return i18n.date(language,value.date+'T00:00:00Z',{day:'2-digit',month:'2-digit',year:'numeric'}) + '<span style="display:block;font-size:13px;font-weight:400;margin-top:5px;">' + formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições")) + '</span>';
    }
    function paintBusiest(document,element,value) {
        if (!busiestValue(value)) { return; }
        var signature = JSON.stringify(value);
        if (element.getAttribute('data-perfilwiki-busiest-day') === signature) { return; }
        element.textContent = value.edits ? i18n.date(language,value.date+'T00:00:00Z',{day:'2-digit',month:'2-digit',year:'numeric'}) : tr("Nenhum dia");
        element.setAttribute('data-perfilwiki-busiest-day',signature);
        if (!value.edits) { return; }
        var count = document.createElement('span');
        count.style.display = 'block'; count.style.fontSize = '13px'; count.style.fontWeight = '400'; count.style.marginTop = '5px';
        count.textContent = formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições"));
        element.appendChild(count);
    }
    function busiestMonthValue(value) {
        return value && typeof value === 'object' && (value.month === null && value.edits === 0 ||
            typeof value.month === 'string' && /^\d{4}-(?:0[1-9]|1[0-2])$/.test(value.month) && Number.isSafeInteger(value.edits) && value.edits > 0);
    }
    function monthLabel(month) {
        if(language!=='pt-BR'&&language!=='pt-PT')return i18n.date(language,month+'-01T00:00:00Z',{month:'long',year:'numeric'});
        return ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][Number(month.slice(5)) - 1] + tr(" de ") + Number(month.slice(0,4));
    }
    function busiestMonthMarkup(value) {
        if (!busiestMonthValue(value)) { return tr("Aguardando dados"); }
        if (!value.edits) { return tr("Nenhum mês"); }
        return monthLabel(value.month) + '<span style="display:block;font-size:13px;font-weight:400;margin-top:5px;">' + formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições")) + '</span>';
    }
    function paintBusiestMonth(document,element,value) {
        if (!busiestMonthValue(value)) { return; }
        var signature = JSON.stringify(value);
        if (element.getAttribute('data-perfilwiki-busiest-month') === signature) { return; }
        element.textContent = value.edits ? monthLabel(value.month) : tr("Nenhum mês");
        element.setAttribute('data-perfilwiki-busiest-month',signature);
        if (!value.edits) { return; }
        var count = document.createElement('span');
        count.style.display = 'block'; count.style.fontSize = '13px'; count.style.fontWeight = '400'; count.style.marginTop = '5px';
        count.textContent = formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições"));
        element.appendChild(count);
    }
    function articleValue(value) {
        return value && typeof value === 'object' && (value.edits === 0 && value.pageid === null && value.title === null ||
            Number.isSafeInteger(value.edits) && value.edits > 0 && Number.isSafeInteger(value.pageid) && value.pageid > 0 && typeof value.title === 'string' && value.title.length > 0 && value.title.length <= 1024);
    }
    function articleMarkup(value, wiki, colors) {
        if (!articleValue(value)) { return tr("Aguardando dados"); }
        if (!value.edits) { return tr("Nenhum artigo"); }
        var title = value.title.replace(/[\[\]{}|<>\r\n]/g, function (character) { return '&#' + character.charCodeAt(0) + ';'; });
        var link = wiki ? '[[' + title + '|<span style="color:' + colors.ink + ';">' + title + '</span>]]' : '<a href="https://pt.wikipedia.org/wiki/' + escape(encodeURIComponent(value.title.replace(/ /g, '_'))) + '" style="color:' + colors.ink + ';text-decoration:none;">' + escape(value.title) + '</a>';
        return link + '<span style="display:block;font-size:13px;font-weight:400;margin-top:5px;">' + formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições")) + '</span>';
    }
    function paintArticle(document, element, value, colors) {
        if (!articleValue(value)) { return; }
        var signature = JSON.stringify(value);
        if (element.getAttribute('data-perfilwiki-most-edited') === signature) { return; }
        element.textContent = '';
        element.setAttribute('data-perfilwiki-most-edited', signature);
        if (!value.edits) { element.textContent = tr("Nenhum artigo"); return; }
        var link = document.createElement('a'), count = document.createElement('span');
        link.href = 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(value.title.replace(/ /g, '_'));
        link.style.color = colors.ink; link.style.textDecoration = 'none'; link.textContent = value.title;
        count.style.display = 'block'; count.style.fontSize = '13px'; count.style.fontWeight = '400'; count.style.marginTop = '5px';
        count.textContent = formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições"));
        element.appendChild(link); element.appendChild(count);
    }
    function cardColors(settings, key, colors) {
        return settings.highlightedMetrics.indexOf(key) < 0 ? colors : {ink:appearance.highlightColors(settings).foreground};
    }
    function footer(options, colors) {
        var title = options.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki';
        var label = tr("Veja como adicionar à sua página de usuário.");
        var safeTitle = String(title).replace(/[\[\]{}|<>\r\n]/g, function (character) { return '&#' + character.charCodeAt(0) + ';'; });
        var link = options.wiki ? '[[' + safeTitle + '|<span style="color:' + colors.ink + ';">' + label + '</span>]]' :
            '<a href="https://pt.wikipedia.org/wiki/' + escape(encodeURIComponent(String(title).replace(/ /g,'_'))) + '" style="color:' + colors.ink + ';">' + label + '</a>';
        return ("<div id=\"dan-pu-ritmo-install\" style=\"grid-column:1/-1;margin-top:4px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;text-align:left;\">"+tr("Gostou deste painel?")+" ") + link + '</div>';
    }
    function render(statistics, activity, options) {
        options = options || {};
        var user = options.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || '';
        if (statistics && statistics.user !== user || activity && activity.identity && activity.identity.user !== user) { throw new Error('Os contadores pertencem a outro usuário.'); }
        var settings = appearance.normalize(options.appearance), colors = appearance.colors(settings);
        if (!settings.showCards) { return ''; }
        var data = values(statistics, activity, options.now, settings.metrics.indexOf('mostEditedArticle') >= 0, settings.metrics.indexOf('activeDays') >= 0,settings.metrics);
        var profile = profileView.profileMarkup({config:{user:user},statistics:statistics,activity:activity},Object.assign({},options,{user:user,appearance:settings}),options.wiki,'cards');
        var html = '<div id="dan-pu-estatisticas" class="dan-pu-stats ' + appearance.classes(settings) + '" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-rendered="ready" data-perfilwiki-documentation="' + escapeData(options.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki') + '" data-perfilwiki-appearance="' + escape(JSON.stringify(settings)) + '" lang="'+settings.language+'" style="text-align:' + settings.alignment + ';' + (profile?'grid-auto-rows:auto;':'') + '">';
        if (profile) { html += '<div class="dan-pu-cards-profile" style="grid-column:1/-1;margin-bottom:8px;padding-bottom:12px;' + (settings.profileDetailsLayout==='inline'?'':'border-bottom:1px solid #eaecf0;') + '">' + profile + '</div>'; }
        settings.metrics.forEach(function (key) {
            var field = fields.find(function (item) { return item[0] === key; });
            var highlighted = settings.highlightedMetrics.indexOf(key) >= 0;
            var palette = cardColors(settings,key,colors);
            var text = field[0] === 'mostEditedArticle' ? articleMarkup(data.mostEditedArticle, options.wiki, palette) : field[0] === 'busiestDay' ? busiestMarkup(data.busiestDay) : field[0] === 'busiestMonth' ? busiestMonthMarkup(data.busiestMonth) : label(data[field[0]], field[0]);
            if (options.wiki && (language==='pt-BR'||language==='pt-PT') && field[0] === 'tenure' && metricValue(data.tenure, 'tenure')) {
                var date = new Date(data.tenureRegistration);
                text = '{{Tempo decorrido|' + date.getUTCDate() + '|' + (date.getUTCMonth() + 1) + '|' + date.getUTCFullYear() + '|prec=ano}}';
            }
            var cardStyle = ' style="' + (settings.density === 'compact' ? 'padding:12px 14px;' : settings.density === 'roomy' ? 'padding:24px 22px;' : '') + 'background:' + (highlighted ? settings.highlightColor : '#ffffff') + ';border-color:#eaecf0;"';
            var valueStyle = (settings.density === 'compact' ? 'font-size:24px;' : settings.density === 'roomy' ? 'font-size:32px;' : '') + (highlighted || field[0] === 'edits' ? 'color:' + palette.ink + ';' : '');
            if (field[0] === 'mostEditedArticle') { valueStyle += 'font-size:18px;line-height:1.35;'; }
            if (field[0] === 'busiestDay') { valueStyle += 'font-size:22px;line-height:1.35;'; }
            if (field[0] === 'busiestMonth') { valueStyle += 'font-size:18px;line-height:1.35;'; }
            var valueAttributes = field[0] === 'mostEditedArticle' && articleValue(data.mostEditedArticle) ? ' data-perfilwiki-most-edited="' + escapeData(JSON.stringify(data.mostEditedArticle)) + '"' : '';
            if (field[0] === 'busiestDay' && busiestValue(data.busiestDay)) { valueAttributes += ' data-perfilwiki-busiest-day="' + escapeData(JSON.stringify(data.busiestDay)) + '"'; }
            if (field[0] === 'busiestMonth' && busiestMonthValue(data.busiestMonth)) { valueAttributes += ' data-perfilwiki-busiest-month="' + escapeData(JSON.stringify(data.busiestMonth)) + '"'; }
            if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].indexOf(field[0]) >= 0 && metricValue(data[field[0]],field[0])) {
                valueAttributes += ' title="' + (field[0] === 'averageBytesPerEdit' ? averageFormatter : formatter).format(data[field[0]]) + ' bytes"';
            }
            html += '<div class="dan-pu-stat-card' + (field[4] ? ' ' + field[4] : '') + '"' + cardStyle + '><div class="dan-pu-stat-icon" aria-hidden="true">' + field[3] + '</div><div class="dan-pu-stat-value"' + (valueStyle ? ' style="' + valueStyle + '"' : '') + '><span id="' + field[1] + '"' + valueAttributes + '>' + text + '</span></div><div class="dan-pu-stat-label"' + (highlighted ? ' style="color:' + palette.ink + ';"' : '') + '>' + tr(field[2]) + '</div>' + (field[5] ? '<div style="margin-top:5px;font-size:11px;color:' + (highlighted ? palette.ink : '#72777d') + ';line-height:1.4;">' + tr(field[5]) + '</div>' : '') + '</div>';
        });
        return html + (appearance.footerOwner(settings) === 'cards' ? footer(options,colors) : '') + '</div>';
    }
    function paint(document, statistics, activity, now, options, presentation) {
        presentation = presentation || {};
        var settings = options ? appearance.normalize(options) : null;
        var selected = settings ? settings.metrics : fields.filter(function (field) { return !!document.getElementById(field[1]); }).map(function (field) { return field[0]; });
        var data = values(statistics, activity, now, selected.indexOf('mostEditedArticle') >= 0, selected.indexOf('activeDays') >= 0,selected);
        var colors = appearance.colors(settings || undefined);
        var root = document.getElementById('dan-pu-estatisticas');
        var profileUser = presentation.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || root && root.getAttribute('data-perfilwiki-user') || '';
        var savedAccountCreated = profileView.captureAccountCreated(root,profileUser,now);
        if (root && options) {
            var signature = JSON.stringify(settings);
            root.style.display = settings.showCards ? '' : 'none';
            if (!settings.showCards) { return; }
            if (root.getAttribute('data-perfilwiki-appearance') !== signature || root.getAttribute('data-perfilwiki-rendered') !== 'ready' ||
                root.getAttribute('data-perfilwiki-documentation') !== (presentation.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki')) {
                var user = presentation.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || root.getAttribute('data-perfilwiki-user') || '';
                var previous = {};
                if (root.getAttribute('data-perfilwiki-user') === user) {
                    fields.forEach(function (field) {
                        var element = document.getElementById(field[1]);
                        if (!element) { return; }
                        previous[field[0]] = element.textContent;
                        if (field[0] === 'mostEditedArticle' && !articleValue(data.mostEditedArticle)) {
                            try { var saved = JSON.parse(element.getAttribute('data-perfilwiki-most-edited')); if (articleValue(saved)) { data.mostEditedArticle = saved; } } catch (_) {}
                        }
                        if (field[0] === 'busiestDay' && !busiestValue(data.busiestDay)) {
                            try { var savedDay = JSON.parse(element.getAttribute('data-perfilwiki-busiest-day')); if (busiestValue(savedDay)) { data.busiestDay = savedDay; } } catch (_) {}
                        }
                        if (field[0] === 'busiestMonth' && !busiestMonthValue(data.busiestMonth)) {
                            try { var savedMonth = JSON.parse(element.getAttribute('data-perfilwiki-busiest-month')); if (busiestMonthValue(savedMonth)) { data.busiestMonth = savedMonth; } } catch (_) {}
                        }
                    });
                }
                root.outerHTML = render(statistics, activity, Object.assign({},presentation,{user:user,now:now,appearance:settings,savedAccountCreated:savedAccountCreated}));
                fields.forEach(function (field) {
                    var element = document.getElementById(field[1]);
                    if (element && field[0] !== 'tenure' && field[0] !== 'mostEditedArticle' && field[0] !== 'busiestDay' && field[0] !== 'busiestMonth' && !metricValue(data[field[0]],field[0]) && previous[field[0]]) { element.textContent = previous[field[0]]; }
                });
            }
        }
        fields.forEach(function (field) {
            var element = document.getElementById(field[1]);
            if (element && field[0] === 'tenure' && !metricValue(data.tenure, 'tenure')) { element.textContent = tr("Aguardando dados"); }
            else if (element && field[0] === 'mostEditedArticle') { paintArticle(document, element, data.mostEditedArticle, settings ? cardColors(settings,field[0],colors) : colors); }
            else if (element && field[0] === 'busiestDay') { paintBusiest(document,element,data.busiestDay); }
            else if (element && field[0] === 'busiestMonth') { paintBusiestMonth(document,element,data.busiestMonth); }
            else if (element && metricValue(data[field[0]],field[0])) {
                element.textContent = label(data[field[0]], field[0]);
                if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].indexOf(field[0]) >= 0) {
                    element.setAttribute('title', (field[0] === 'averageBytesPerEdit' ? averageFormatter : formatter).format(data[field[0]]) + ' bytes');
                }
            }
        });
        if (root && settings) { profileView.paintProfile(document,{config:{user:profileUser},statistics:statistics,activity:activity},Object.assign({},presentation,{user:profileUser,now:now,appearance:settings,savedAccountCreated:savedAccountCreated}),'cards'); }
    }
    return Object.freeze({ html:function(s,a,options){return inLanguage(render,options,[s,a,options]);}, wikitext: function (s,a,options){return inLanguage(render,options,[s,a,Object.assign({},options,{wiki:true})]);}, paint:function(){return inLanguage(paint,arguments[4],arguments);}, years: years, mostEditedArticle:mostEditedArticle,
        namespaceTotals:namespaceTotals,calendarTotals:calendarTotals });
}));
