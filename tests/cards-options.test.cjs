'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Appearance = require('../src/Appearance.js');
const Cards = require('../src/CardsView.js');
const Activity = require('../src/ActivityView.js');
const Core = require('../src/PageviewsCore.js');
const user = 'Editora Exemplo';
const now = '2026-10-15T14:42:00Z';
function activity(timeZone = 'UTC', complete = true) {
    const entries = [[1,10,0,'Um artigo','2026-09-30T23:30:00Z',0],
        [2,10,0,'Um artigo','2026-10-01T00:30:00Z',0],
        [3,11,2,'Usuário:'+user+'/PU/Estatísticas','2026-10-02T12:00:00Z',0]];
    return {complete,entries,identity:{user,project:'pt.wikipedia.org'},
        summary:Core.summarize(entries,{config:{user,project:'pt.wikipedia.org',timeZone},now})};
}
function options(appearance) { return {user,now,appearance}; }
function metricCard(html, id) {
    return html.split('<div class="dan-pu-stat-card').slice(1).find(card=>card.includes('id="'+id+'"')) || '';
}

test('the twelfth counter uses complete lifetime day counts in the selected timezone', () => {
    const settings = {metrics:['activeDays']};
    for (const [timeZone, days] of [['UTC',2],['America/New_York',1]]) {
        const a = activity(timeZone);
        assert.equal(a.summary.totalActiveDays,days);
        for (const html of [Cards.html({user,metrics:{}},a,options(settings)),Cards.wikitext({user,metrics:{}},a,options(settings))]) {
            assert.match(html,new RegExp('id="dan-pu-dias-com-edicoes">'+days+' '+(days===1?'dia':'dias')+'<'));
            assert.match(html,/Dias com edições/);
        }
    }
    assert.match(Cards.html({user,metrics:{activeDays:999}},activity('UTC',false),options(settings)),/Aguardando dados/);
    assert.match(Cards.html({user,metrics:{}},{complete:true,identity:{user},summary:{}},options(settings)),/Aguardando dados/);
    const a = activity();
    a.summary.totalActiveDays = 0;
    assert.match(Cards.html({user,metrics:{}},a,options(settings)),/>0 dias</);
});

test('unused active-day counters do not inspect or rescan the history', () => {
    const a = activity();
    Object.defineProperty(a.summary,'totalActiveDays',{get:()=>assert.fail('Unselected metric must not be evaluated')});
    Object.defineProperty(a,'entries',{get:()=>assert.fail('No history scan is needed for day counts')});
    assert.match(Cards.html({user,metrics:{thanks:7}},a,options({metrics:['thanks']})),/>7</);
});

test('highlight defaults are independent and invalid values cannot become styles', () => {
    const first = Appearance.normalize();
    assert.deepEqual(first.highlightedMetrics,['tenure']);
    assert.equal(first.highlightColor,'#faf7ef');
    assert.equal(first.blockOrder,'cards-first');
    first.highlightedMetrics.push('thanks');
    assert.deepEqual(Appearance.normalize().highlightedMetrics,['tenure']);
    assert.deepEqual(Appearance.normalize({highlightedMetrics:[]}).highlightedMetrics,[]);
    assert.equal(Appearance.normalize({highlightColor:'#ABCDEF'}).highlightColor,'#abcdef');
    for (const input of [{highlightColor:'#fff'},{highlightColor:'#000000;background:red'},
        {highlightedMetrics:'thanks'},{highlightedMetrics:['thanks','thanks']},
        {highlightedMetrics:['nonexistent']},{blockOrder:'random'}]) {
        assert.throws(()=>Appearance.normalize(input));
    }
});

test('any counter can receive the shade and all of its text stays readable', () => {
    const stats = {user,metrics:{registration:'2008-10-01T12:00:00Z',thanks:7,edits:100,bytesAdded:1024}};
    const a = activity();
    const defaults = Cards.html(stats,a,options({}));
    assert.match(metricCard(defaults,'perfilwiki-anos'),/background:#faf7ef;/);
    assert.match(metricCard(defaults,'dan-pu-agradecimentos'),/background:#ffffff;/);
    for (const highlightColor of ['#000000','#ffffff','#777777','#ffff00','#3366cc','#ff0099']) {
        const settings = {metrics:['tenure','thanks','edits','mostEditedArticle','bytesAdded'],
            highlightedMetrics:['thanks','edits','mostEditedArticle','bytesAdded'],highlightColor};
        const colors = Appearance.highlightColors(settings);
        assert.ok(Appearance.contrast(colors.foreground,highlightColor)>=4.5);
        for (const html of [Cards.html(stats,a,options(settings)),Cards.wikitext(stats,a,options(settings))]) {
            assert.match(metricCard(html,'perfilwiki-anos'),/background:#ffffff;/);
            for (const id of ['dan-pu-agradecimentos','dan-pu-edicoes','dan-pu-artigo-mais-editado','dan-pu-bytes-acrescentados']) {
                const card = metricCard(html,id);
                assert.ok(card.includes('background:'+highlightColor+';'),id);
                assert.ok(card.includes('color:'+colors.foreground+';'),id);
                assert.doesNotMatch(card,/color:#72777d;/);
            }
            const article = metricCard(html,'dan-pu-artigo-mais-editado');
            assert.ok(article.includes('style="color:'+colors.foreground+';'), 'article link must have readable explicit ink');
        }
    }
});

test('one installation invitation belongs to the last visible block in either order', () => {
    const a = activity();
    const state = {config:{user,timeZone:'UTC'},capturedAt:now,activity:a,pageviews:null};
    for (const blockOrder of ['cards-first','activity-first']) {
        for (const [showCards,showActivity] of [[true,true],[true,false],[false,true]]) {
            const settings = {blockOrder,showCards,showActivity,layout:'together'};
            const owner = Appearance.footerOwner(settings);
            const expected = showCards && (!showActivity || blockOrder==='activity-first') ? 'cards' : 'activity';
            assert.equal(owner,expected);
            for (const format of ['html','wikitext']) {
                const cards = Cards[format]({user,metrics:{}},a,{...options(settings),documentationPage:'Usuário:Exemplo/Como instalar'});
                const panel = Activity[format](state,{appearance:settings,documentationPage:'Usuário:Exemplo/Como instalar'});
                assert.equal(((cards+panel).match(/Gostou deste painel\?/g)||[]).length,1);
                assert.equal((cards.match(/Gostou deste painel\?/g)||[]).length,owner==='cards'?1:0);
                assert.equal((panel.match(/Gostou deste painel\?/g)||[]).length,owner==='activity'?1:0);
                if (owner==='cards') {
                    assert.match(cards,/id="dan-pu-ritmo-install"/);
                    assert.match(cards,/grid-column:1\/-1;/);
                    assert.match(cards,/Veja como adicionar à sua página de usuário\./);
                    if (format==='html') assert.match(cards,/wiki\/Usu%C3%A1rio%3AExemplo%2FComo_instalar/);
                    else assert.match(cards,/\[\[Usuário:Exemplo\/Como instalar\|/);
                }
            }
        }
    }
});

test('the cards-only invitation cannot inject markup through the documentation destination', () => {
    const opts = {...options({showActivity:false}),documentationPage:'Usuário:Teste/[[x]]|<img onerror="x">\n{{x}}'};
    const html = Cards.html({user,metrics:{}},null,opts);
    const wiki = Cards.wikitext({user,metrics:{}},null,opts);
    assert.doesNotMatch(html,/<img|onerror="x"|href="javascript:/);
    assert.doesNotMatch(wiki,/<img|\{\{x\}\}|\[\[x\]\]/);
    assert.match(wiki,/&#91;&#91;x&#93;&#93;&#124;&#60;img/);
});

test('paint keeps verified day counts while updating a shade and cards-only invitation', () => {
    const settings = Appearance.normalize({metrics:['activeDays'],showActivity:false});
    const nodes = new Map();
    let rendered = '';
    const number = {textContent:'2 dias',setAttribute:()=>{}};
    const root = {style:{},getAttribute:key=>({'data-perfilwiki-user':user,
        'data-perfilwiki-appearance':JSON.stringify(settings),'data-perfilwiki-rendered':'ready',
        'data-perfilwiki-documentation':'Usuário:Daniel G Rego/PerfilWiki'}[key]||null)};
    Object.defineProperty(root,'outerHTML',{set:html=>{
        rendered=html;
        number.textContent=html.match(/id="dan-pu-dias-com-edicoes">([^<]*)</)[1];
    }});
    nodes.set('dan-pu-estatisticas',root);
    nodes.set('dan-pu-dias-com-edicoes',number);
    const document = {getElementById:id=>nodes.get(id)||null};
    Cards.paint(document,{user,metrics:{}},activity('UTC',false),now,
        {...settings,highlightedMetrics:['activeDays'],highlightColor:'#123456'},
        {user,documentationPage:'Usuário:Exemplo/Instalação'});
    assert.equal(number.textContent,'2 dias');
    assert.match(rendered,/background:#123456;/);
    assert.match(rendered,/wiki\/Usu%C3%A1rio%3AExemplo%2FInstala%C3%A7%C3%A3o/);
    assert.match(rendered,/Gostou deste painel\?/);
});

test('paint refreshes the documentation destination without another appearance change', () => {
    const settings = Appearance.normalize({metrics:['thanks'],showActivity:false});
    let rendered = '';
    const root = {style:{},getAttribute:key=>({'data-perfilwiki-user':user,
        'data-perfilwiki-appearance':JSON.stringify(settings),'data-perfilwiki-rendered':'ready',
        'data-perfilwiki-documentation':'Usuário:Daniel G Rego/PerfilWiki'}[key]||null)};
    Object.defineProperty(root,'outerHTML',{set:html=>{rendered=html;}});
    const document = {getElementById:id=>id==='dan-pu-estatisticas'?root:null};
    Cards.paint(document,{user,metrics:{thanks:7}},null,now,settings,
        {user,documentationPage:'Usuário:Exemplo/Instalação'});
    assert.match(rendered,/wiki\/Usu%C3%A1rio%3AExemplo%2FInstala%C3%A7%C3%A3o/);
});
