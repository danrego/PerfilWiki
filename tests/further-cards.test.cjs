'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Cards = require('../src/CardsView.js');
const Core = require('../src/PageviewsCore.js');
const Appearance = require('../src/Appearance.js');
const user = 'Marina Exemplo';
const now = '2026-10-15T14:42:00Z';
const metrics = ['edits30','averagePerActiveDay','activeYears','busiestMonth'];
const domIds = ['dan-pu-edicoes-30-dias','dan-pu-media-por-dia-ativo','dan-pu-anos-com-edicoes','dan-pu-mes-com-mais-edicoes'];
function row(id,time,title='Artigo') { return [id,id,0,title,time,0]; }
function history(entries=[],timeZone='UTC',complete=true) {
    return {complete,entries,identity:{user,project:'pt.wikipedia.org'},
        summary:Core.summarize(entries,{config:{user,timeZone,project:'pt.wikipedia.org'},now})};
}
function render(activity,selected=metrics,extra={},mode='html') {
    return Cards[mode]({user,metrics:{edits30:999,averagePerActiveDay:999,activeYears:999}},activity,
        {user,now,appearance:{metrics:selected,...extra}});
}

test('twenty-four optional choices preserve the original eight defaults',()=>{
    assert.equal(Appearance.metricIds.length,24);
    assert.equal(Appearance.defaults.metrics.length,8);
    assert.deepEqual(Appearance.defaults.metrics,['tenure','bestStreak','thanks','edits','reverts','edited','articles','technicalCreated']);
    metrics.forEach(id=>assert.ok(Appearance.metricIds.includes(id)));
    assert.deepEqual(Appearance.normalize({metrics}).metrics,metrics);
});

test('the newest calendar cards reuse timezone, deduplication and exclusions from the shared summary',()=>{
    const entries = [row(1,'2009-12-31T23:30:00Z'),row(2,'2010-01-01T00:30:00Z'),
        row(3,'2010-01-01T00:45:00Z'),row(3,'2010-01-01T00:45:00Z'),
        row(4,'2026-10-14T23:30:00Z')];
    for(let id=10;id<20;id++) entries.push(row(id,'2026-10-01T12:00:00Z','Usuário:'+user+'/PU/Estatísticas'));
    for(const mode of ['html','wikitext']) {
        const utc = render(history(entries),metrics,{},mode);
        assert.match(utc,/id="dan-pu-edicoes-30-dias">1</);
        assert.match(utc,/id="dan-pu-media-por-dia-ativo">1,3</);
        assert.match(utc,/id="dan-pu-anos-com-edicoes">3 anos</);
        assert.match(utc,/janeiro de 2010<span[^>]*>2 edições</);
        const ny = render(history(entries,'America/New_York'),metrics,{},mode);
        assert.match(ny,/id="dan-pu-media-por-dia-ativo">2,0</);
        assert.match(ny,/id="dan-pu-anos-com-edicoes">2 anos</);
        assert.match(ny,/dezembro de 2009<span[^>]*>3 edições</);
    }
});

test('the thirty-day card follows the configured local dates, including both boundaries',()=>{
    const entries = [row(1,'2026-09-16T00:30:00Z'),row(2,'2026-10-15T00:30:00Z')];
    const utc = history(entries), ny = history(entries,'America/New_York');
    assert.equal(utc.summary.edits30,2);
    assert.equal(ny.summary.edits30,1);
    assert.match(render(utc,['edits30']),/id="dan-pu-edicoes-30-dias">2</);
    assert.match(render(ny,['edits30']),/id="dan-pu-edicoes-30-dias">1</);
});

test('month totals aggregate days, ignore zero entries and choose the earliest tied month',()=>{
    const counts = {'2026-10-01':2,'2026-09-02':1,'2026-09-01':1,'2000-01-01':0};
    for(const entries of [Object.entries(counts),Object.entries(counts).reverse()]) {
        const activity = {complete:true,identity:{user},summary:{counts:Object.fromEntries(entries),edits30:4}};
        const result = Cards.calendarTotals(activity);
        assert.equal(result.activeYears,1);
        assert.equal(result.averagePerActiveDay,4/3);
        assert.deepEqual(result.busiestMonth,{month:'2026-09',edits:2});
        assert.match(render(activity,['busiestMonth']),/setembro de 2026<span[^>]*>2 edições</);
        assert.ok(Object.isFrozen(result));
        assert.ok(Object.isFrozen(result.busiestMonth));
    }
});

test('one decimal uses Portuguese punctuation for averages and keeps a verified zero',()=>{
    for(const [counts,expected] of [[{'2026-10-01':1},'1,0'],
        [{'2026-10-01':1,'2026-10-02':2},'1,5'],
        [{'2026-10-01':2,'2026-10-02':2,'2026-10-03':1},'1,7'],[{},'0,0']]) {
        const activity = {complete:true,identity:{user},summary:{counts}};
        assert.ok(render(activity,['averagePerActiveDay']).includes('>'+expected+'<'));
    }
    const html = render(history([]));
    assert.match(html,/id="dan-pu-edicoes-30-dias">0</);
    assert.match(html,/id="dan-pu-anos-com-edicoes">0 anos</);
    assert.match(html,/>Nenhum mês</);
    const singular=render(history([row(1,'2026-10-01T12:00:00Z')]));
    assert.match(singular,/id="dan-pu-anos-com-edicoes">1 ano</);
    assert.match(singular,/outubro de 2026<span[^>]*>1 edição</);
});

test('incomplete and malformed histories stay unknown rather than showing statistics fallbacks',()=>{
    for(const activity of [null,history([],'UTC',false),{complete:true,identity:{user},summary:{}},
        {complete:true,identity:{user},summary:{counts:{'2026-13-01':3},edits30:-1}},
        {complete:true,identity:{user},summary:{counts:{'2026-10-01':Number.MAX_SAFE_INTEGER,'2026-10-02':1},edits30:NaN}}]) {
        assert.equal((render(activity).match(/Aguardando dados/g)||[]).length,4);
    }
    for(const counts of [{'2026-02-30':1},{'2026-10-01':1.5},{'2026-10-01':-1},[],null]) {
        assert.equal(Cards.calendarTotals({complete:true,summary:{counts}}),null);
    }
});

test('selected calendar cards are cached and never rescan entries or read unselected summary fields',()=>{
    const a = history([row(1,'2026-10-01T12:00:00Z')]);
    Object.defineProperty(a,'entries',{get:()=>assert.fail('These cards must not rescan raw history')});
    const result = Cards.calendarTotals(a);
    assert.equal(Cards.calendarTotals(a),result);
    assert.match(render(a,['activeYears','averagePerActiveDay','busiestMonth']),/>1,0</);
    a.summary.counts = {'2025-01-01':2};
    assert.notEqual(Cards.calendarTotals(a),result);
    assert.equal(Cards.calendarTotals(a).averagePerActiveDay,2);
    Object.defineProperty(a.summary,'counts',{get:()=>assert.fail('Only recent edits requested')});
    assert.match(render(a,['edits30']),/id="dan-pu-edicoes-30-dias">1</);
    Object.defineProperty(a.summary,'edits30',{get:()=>assert.fail('No extra calendar metric requested')});
    assert.match(render(a,['thanks']),/Agradecimentos recebidos/);
});

class Element {
    constructor() { this.attributes={};this.style={};this.children=[];this.text=''; }
    get textContent() { return this.text+this.children.map(child=>child.textContent).join(''); }
    set textContent(value) { this.text=String(value);this.children=[]; }
    getAttribute(key) { return this.attributes[key]||null; }
    setAttribute(key,value) { this.attributes[key]=String(value); }
    appendChild(element) { this.children.push(element); }
}
test('painting fractional averages and month subtitles retains verified values during refresh',()=>{
    const elements = Object.fromEntries(domIds.map(id=>[id,new Element()]));
    const document = {getElementById:id=>elements[id]||null,createElement:()=>new Element()};
    const a = history([row(1,'2026-10-01T12:00:00Z'),row(2,'2026-10-02T12:00:00Z'),row(3,'2026-10-02T13:00:00Z')]);
    Cards.paint(document,{user,metrics:{}},a,now);
    assert.equal(elements[domIds[1]].textContent,'1,5');
    assert.equal(elements[domIds[3]].textContent,'outubro de 20263 edições');
    assert.equal(elements[domIds[3]].getAttribute('data-perfilwiki-busiest-month'),JSON.stringify({month:'2026-10',edits:3}));
    Cards.paint(document,{user,metrics:{}},history([],'UTC',false),now);
    assert.equal(elements[domIds[1]].textContent,'1,5');
    assert.equal(elements[domIds[3]].textContent,'outubro de 20263 edições');
    Cards.paint(document,{user,metrics:{}},history([]),now);
    assert.equal(elements[domIds[1]].textContent,'0,0');
    assert.equal(elements[domIds[3]].textContent,'Nenhum mês');
});

test('an appearance redraw retains the last verified month and fractional average only for its owner',()=>{
    for(const owner of [user,'Outra Editora']) {
        const settings = Appearance.normalize({metrics:['averagePerActiveDay','busiestMonth']});
        const average = new Element(), month = new Element();
        average.textContent = '1,5';
        month.textContent = 'outubro de 20263 edições';
        month.setAttribute('data-perfilwiki-busiest-month',JSON.stringify({month:'2026-10',edits:3}));
        const root = {style:{},getAttribute:key=>({'data-perfilwiki-user':owner,
            'data-perfilwiki-appearance':JSON.stringify(settings),'data-perfilwiki-rendered':'ready',
            'data-perfilwiki-documentation':'Usuário:Daniel G Rego/PerfilWiki'}[key]||null)};
        Object.defineProperty(root,'outerHTML',{set:()=>{
            average.textContent='Aguardando dados';
            month.textContent='Aguardando dados';
            month.attributes={};
        }});
        const document = {getElementById:id=>id==='dan-pu-estatisticas'?root:
            id==='dan-pu-media-por-dia-ativo'?average:id==='dan-pu-mes-com-mais-edicoes'?month:null,
            createElement:()=>new Element()};
        Cards.paint(document,{user,metrics:{}},history([],'UTC',false),now,
            {...settings,highlightedMetrics:['busiestMonth']},{user});
        assert.equal(average.textContent,owner===user?'1,5':'Aguardando dados');
        assert.equal(month.textContent,owner===user?'outubro de 20263 edições':'Aguardando dados');
    }
});

test('new counter highlights remain readable in HTML and exported wikitext',()=>{
    for(const mode of ['html','wikitext']) {
        const markup = render(history([row(1,'2026-10-01T12:00:00Z')]),metrics,
            {highlightedMetrics:metrics,highlightColor:'#000000'},mode);
        assert.equal((markup.match(/background:#000000;/g)||[]).length,4);
        assert.ok((markup.match(/color:#ffffff;/g)||[]).length>=8);
        assert.match(markup,/data-perfilwiki-busiest-month=/);
    }
});
