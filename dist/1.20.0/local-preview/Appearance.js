/* PerfilWiki. Shared, request-free appearance contract. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiAppearance = api; }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';
    var defaultMetrics = ['tenure', 'bestStreak', 'thanks', 'edits', 'reverts', 'edited', 'articles', 'technicalCreated'];
    var metrics = defaultMetrics.concat(['mostEditedArticle', 'bytesAdded', 'bytesRemoved', 'activeDays',
        'articleEdits', 'talkEdits', 'activeMonths', 'busiestDay',
        'edits30', 'averagePerActiveDay', 'activeYears', 'busiestMonth',
        'thanksSent', 'averageBytesPerEdit', 'largestAddition', 'largestRemoval']);
    var themes = Object.freeze({blue:'#3366cc', forest:'#246342', violet:'#6854a4'});
    var defaults = Object.freeze({theme:'blue',language:'pt-BR', accent:'#3366cc', density:'comfortable', layout:'integrated',
        metrics:Object.freeze(defaultMetrics.slice()), showCards:true, showActivity:true, initialPeriod:'30d', alignment:'right', nameAlignment:'left', photoAlignment:'left', photoSize:96, photoShape:'square', nameFontSize:24, showAccountCreated:false, showLocalTime:false, showUserGroups:false, profilePlacement:'top',
        profilePlacements:Object.freeze({name:'inherit',location:'inherit',accountCreated:'inherit',photo:'top',localTime:'top',userGroups:'inherit'}), profileDetailsLayout:'stacked', customRange:null,
        highlightedMetrics:Object.freeze(['tenure']), highlightColor:'#faf7ef', topBackground:'#ffffff', nameColor:'', labelColor:'', informationColor:'', coverSource:'manual', blockOrder:'cards-first', cardColumns:'auto'});
    function normalize(input) {
        if (input === undefined) { input = {}; }
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(function (key) {
            return !Object.prototype.hasOwnProperty.call(defaults, key);
        })) { throw new Error('Opção de aparência desconhecida.'); }
        var result = Object.assign({}, defaults, input);
        if(['pt-BR','pt-PT','en','es','fr','it'].indexOf(result.language)<0)throw new Error('Idioma inválido.');
        if (input.nameAlignment === undefined) { result.nameAlignment = defaults.nameAlignment; }
        if (input.photoAlignment === undefined) { result.photoAlignment = defaults.photoAlignment; }
        if (input.photoSize === undefined) { result.photoSize = defaults.photoSize; }
        if (input.photoShape === undefined) { result.photoShape = defaults.photoShape; }
        if (input.nameFontSize === undefined) { result.nameFontSize = defaults.nameFontSize; }
        if (input.showAccountCreated === undefined) { result.showAccountCreated = defaults.showAccountCreated; }
        if (input.showLocalTime === undefined) { result.showLocalTime = defaults.showLocalTime; }
        if (input.coverSource === undefined) { result.coverSource = defaults.coverSource; }
        if (input.showUserGroups === undefined) { result.showUserGroups = defaults.showUserGroups; }
        if (['blue','forest','violet','custom'].indexOf(result.theme) < 0) { throw new Error('Tema inválido.'); }
        if (input.accent === undefined) { result.accent = themes[result.theme] || defaults.accent; }
        if (typeof result.accent !== 'string' || !/^#[0-9a-f]{6}$/i.test(result.accent)) { throw new Error('Cor inválida. Use seis dígitos após #.'); }
        result.accent = result.accent.toLowerCase();
        if (typeof result.highlightColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(result.highlightColor)) { throw new Error('Cor de destaque inválida. Use seis dígitos após #.'); }
        result.highlightColor = result.highlightColor.toLowerCase();
        if (typeof result.topBackground !== 'string' || !/^#[0-9a-f]{6}$/i.test(result.topBackground)) { throw new Error('Cor do topo inválida. Use seis dígitos após #.'); }
        result.topBackground = result.topBackground.toLowerCase();
        ['nameColor','labelColor','informationColor'].forEach(function(key){
            if(input[key] === undefined)result[key]=defaults[key];
            if(typeof result[key]!=='string'||result[key]!==''&&!/^#[0-9a-f]{6}$/i.test(result[key])) { throw new Error('Cor do texto inválida. Use seis dígitos após # ou a opção automática.'); }
            result[key]=result[key].toLowerCase();
        });
        if (result.theme !== 'custom' && themes[result.theme] !== result.accent) { result.theme = 'custom'; }
        if (['comfortable','compact','roomy'].indexOf(result.density) < 0 || ['integrated','together','separate'].indexOf(result.layout) < 0 ||
            ['left','center','right'].indexOf(result.alignment) < 0 || ['left','center','right'].indexOf(result.nameAlignment) < 0 || ['left','center','right'].indexOf(result.photoAlignment) < 0 ||
            [64,96,128,160,200].indexOf(result.photoSize) < 0 || ['square','round'].indexOf(result.photoShape) < 0 || ['manual','daily','wiki-daily'].indexOf(result.coverSource) < 0 ||
            [16,20,24,28,32,36].indexOf(result.nameFontSize) < 0 ||
            ['30d','90d','12m','since','custom'].indexOf(result.initialPeriod) < 0 ||
            ['activity','cards','both','top','all'].indexOf(result.profilePlacement) < 0 ||
            ['stacked','inline'].indexOf(result.profileDetailsLayout) < 0 ||
            ['cards-first','activity-first'].indexOf(result.blockOrder) < 0 || ['auto','2','3','4','5'].indexOf(result.cardColumns) < 0) {
            throw new Error('Opção de apresentação inválida.');
        }
        var placements=result.profilePlacements;
        if (!placements || typeof placements!=='object' || Array.isArray(placements) || Object.keys(placements).some(function(key){return ['name','location','accountCreated','photo','localTime','userGroups'].indexOf(key)<0;}) ||
            Object.keys(placements).some(function(key){return !validPlacement(placements[key]);})) { throw new Error('Posição das informações inválida.'); }
        result.profilePlacements=Object.assign({},defaults.profilePlacements,placements);
        result.customRange = normalizeRange(result.customRange);
        if (result.initialPeriod === 'custom' && !result.customRange) { throw new Error('Escolha as datas do período personalizado.'); }
        if (typeof result.showAccountCreated !== 'boolean') { throw new Error('Escolha válida para a data de criação da conta.'); }
        if (typeof result.showUserGroups !== 'boolean') { throw new Error('Escolha válida para os estatutos.'); }
        if (typeof result.showLocalTime !== 'boolean') { throw new Error('Escolha válida para o horário local.'); }
        if (typeof result.showCards !== 'boolean' || typeof result.showActivity !== 'boolean' || !result.showCards && !result.showActivity) {
            throw new Error('Escolha pelo menos um painel.');
        }
        if (!Array.isArray(result.metrics) || result.metrics.length > metrics.length || result.showCards && !result.metrics.length ||
            result.metrics.some(function (key, index) { return metrics.indexOf(key) < 0 || result.metrics.indexOf(key) !== index; })) {
            throw new Error('Escolha contadores válidos, sem repetir.');
        }
        if (!Array.isArray(result.highlightedMetrics) || result.highlightedMetrics.length > metrics.length ||
            result.highlightedMetrics.some(function (key, index) { return metrics.indexOf(key) < 0 || result.highlightedMetrics.indexOf(key) !== index; })) {
            throw new Error('Escolha destaques válidos, sem repetir.');
        }
        result.metrics = result.metrics.slice();
        result.highlightedMetrics = result.highlightedMetrics.slice();
        return result;
    }
    function normalizeRange(value, now) {
        if (value === null || value === undefined) { return null; }
        if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 2 || !Object.prototype.hasOwnProperty.call(value,'start') || !Object.prototype.hasOwnProperty.call(value,'end')) { throw new Error('Escolha uma data inicial e uma data final.'); }
        var valid = function (date) { return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date + 'T00:00:00Z')) && new Date(date + 'T00:00:00Z').toISOString().slice(0,10) === date; };
        var today = new Date(now === undefined ? Date.now() : now).toISOString().slice(0,10);
        if (!valid(value.start) || !valid(value.end) || value.start < '2015-07-01' || value.start > value.end || value.end >= today) { throw new Error('Use datas entre 1 de julho de 2015 e o último dia completo, com o início antes do fim.'); }
        return {start:value.start,end:value.end};
    }
    function validPlacement(value) { return ['inherit','cards','activity','both','hidden','top','top-activity','top-cards','all'].indexOf(value)>=0; }
    function fieldIn(input, block, fieldOrPlacement) {
        var settings=normalize(input);
        if (block!=='cards'&&block!=='activity'&&block!=='top') { return false; }
        var placement=Object.prototype.hasOwnProperty.call(settings.profilePlacements,fieldOrPlacement) ? settings.profilePlacements[fieldOrPlacement] : fieldOrPlacement;
        if(placement===undefined)placement='inherit';
        if(!validPlacement(placement)) { throw new Error('Posição da informação inválida.'); }
        if(placement==='hidden'||block==='cards'&&!settings.showCards||block==='activity'&&!settings.showActivity)return false;
        if(placement==='inherit')placement=settings.profilePlacement;
        var scopes={cards:['cards'],activity:['activity'],both:['cards','activity'],top:['top'],'top-activity':['top','activity'],'top-cards':['top','cards'],all:['top','cards','activity']}[placement];
        if(block==='top')return scopes.indexOf('top')>=0;
        return scopes.indexOf(block)>=0||block==='cards'&&!settings.showActivity&&scopes.indexOf('activity')>=0||block==='activity'&&!settings.showCards&&scopes.indexOf('cards')>=0;
    }
    function profileIn(input, block, customFields) {
        var settings = normalize(input);
        return ['name','location','accountCreated','photo','localTime','userGroups'].some(function(field){return (field!=='userGroups'||settings.showUserGroups)&&fieldIn(settings,block,field);}) ||
            Array.isArray(customFields)&&customFields.some(function(field){return field&&(field.placement===undefined||validPlacement(field.placement))&&fieldIn(settings,block,field.placement);});
    }
    function channels(hex) { return [1,3,5].map(function (offset) { return parseInt(hex.slice(offset, offset + 2), 16); }); }
    function luminance(hex) {
        var values = channels(hex).map(function (channel) { var value = channel / 255; return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4); });
        return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    }
    function contrast(first, second) { var a = luminance(first), b = luminance(second); return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05); }
    function blend(hex, white) {
        return '#' + channels(hex).map(function (channel) { return Math.round(channel + (255 - channel) * white).toString(16).padStart(2,'0'); }).join('');
    }
    function colors(input) {
        var appearance = normalize(input), accent = appearance.accent, ink = accent, tint = blend(accent,0.91);
        while (contrast(ink, '#ffffff') < 4.5 || contrast(ink, tint) < 4.5) {
            ink = '#' + channels(ink).map(function (value) { return Math.max(0, Math.floor(value * 0.85)).toString(16).padStart(2, '0'); }).join('');
        }
        return {accent:accent, ink:ink, tint:tint, foreground:contrast(accent,'#ffffff') >= contrast(accent,'#000000') ? '#ffffff' : '#000000',
            palette:['#eaecf0', blend(ink,0.80), blend(ink,0.55), blend(ink,0.25), ink]};
    }
    function classes(input) {
        var value = normalize(input);
        return 'dan-pu-density-' + value.density + ' dan-pu-align-' + value.alignment + ' dan-pu-layout-' + value.layout + ' dan-pu-initial-' + value.initialPeriod + ' dan-pu-columns-' + value.cardColumns;
    }
    function highlightColors(input) {
        var background = normalize(input).highlightColor;
        var foreground = contrast(background,'#ffffff') >= contrast(background,'#000000') ? '#ffffff' : '#000000';
        return {background:background, foreground:foreground};
    }
    function topColors(input) {
        var background=normalize(input).topBackground;
        var foreground=contrast(background,'#ffffff')>=contrast(background,'#000000')?'#ffffff':'#000000';
        return {background:background,foreground:foreground,link:foreground,tone:foreground==='#ffffff'?'dark':'light'};
    }
    function footerOwner(input) {
        var settings = normalize(input);
        if(settings.layout==='integrated'&&settings.showCards&&settings.showActivity)return 'activity';
        return settings.showCards && (!settings.showActivity || settings.blockOrder === 'activity-first') ? 'cards' : 'activity';
    }
    return Object.freeze({profileIn:profileIn, fieldIn:fieldIn, validPlacement:validPlacement, normalizeRange:normalizeRange, defaults:defaults, themes:themes, metricIds:Object.freeze(metrics), normalize:normalize, colors:colors,
        highlightColors:highlightColors, topColors:topColors, footerOwner:footerOwner, classes:classes, contrast:contrast});
}));
