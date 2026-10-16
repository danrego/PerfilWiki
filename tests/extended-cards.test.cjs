'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Cards = require('../src/CardsView.js');
const Core = require('../src/PageviewsCore.js');
const Appearance = require('../src/Appearance.js');
const user = 'Marina Exemplo';
const now = '2026-10-15T14:42:00Z';
const ids = ['articleEdits','talkEdits','activeMonths','busiestDay'];
function row(revid,pageid,ns,title,timestamp) { return [revid,pageid,ns,title,timestamp,0]; }
function history(entries,timeZone='UTC',complete=true) {
    return {entries,complete,identity:{user,project:'pt.wikipedia.org'},
        summary:Core.summarize(entries,{config:{user,timeZone,project:'pt.wikipedia.org'},now})};
}
function render(activity,metrics=ids,extra={}) {
    return Cards.html({user,metrics:{}},activity,{user,now,appearance:{metrics,...extra}});
}

test('four extra counters are optional and preserve the original eight defaults',()=>{
    assert.equal(Appearance.metricIds.length,24);
    assert.equal(Appearance.defaults.metrics.length,8);
    ids.forEach(id=>{
        assert.ok(Appearance.metricIds.includes(id));
        assert.ok(!Appearance.defaults.metrics.includes(id));
    });
});

test('namespace counters deduplicate valid revisions and count all talk spaces',()=>{
    const entries = [row(1,1,0,'Artigo','2026-01-01T12:00:00Z'),
        row(1,1,0,'Artigo','2026-01-01T12:00:00Z'),
        row(2,1,1,'Discussão:Artigo','2026-01-01T13:00:00Z'),
        row(3,3,3,'Usuário Discussão:Exemplo','2026-01-02T12:00:00Z'),
        row(4,4,829,'Módulo Discussão:Exemplo','2026-01-02T12:00:00Z'),
        row(5,5,10,'Predefinição:Exemplo','2026-01-02T12:00:00Z'),
        row(6,0,0,'Título sem página atual','2026-01-02T12:00:00Z'),
        row(7,7,2,'Usuário:Exemplo','2026-01-02T12:00:00Z')];
    const a=history(entries);
    assert.deepEqual(Cards.namespaceTotals(a),{articleEdits:2,talkEdits:3});
    const html=render(a);
    assert.match(html,/id="dan-pu-edicoes-em-artigos">2</);
    assert.match(html,/id="dan-pu-edicoes-em-discussoes">3</);
    const malformed=[row(10,10,0,'Bad date','2026-02-30T12:00:00Z'),
        row(11,11,0,'Bad timestamp','not a date'),row(-1,1,0,'Bad revision','2026-01-01T12:00:00Z'),
        row(12,12,-1,'Bad namespace','2026-01-01T12:00:00Z'),
        row(13,-1,0,'Bad page','2026-01-01T12:00:00Z'),
        row(10,10,1,'Valid duplicate ID after invalid row','2026-01-01T12:00:00Z')];
    assert.deepEqual(Cards.namespaceTotals({complete:true,entries:malformed}),{articleEdits:0,talkEdits:1});
});

test('calendar counters use the activity timezone, exclusions and full history',()=>{
    const entries=[row(1,1,0,'A','2009-12-31T23:30:00Z'),
        row(2,2,0,'B','2010-01-01T00:30:00Z'),
        row(3,3,0,'C','2010-01-01T00:45:00Z'),
        row(3,3,0,'C','2010-01-01T00:45:00Z')];
    for(let id=10;id<20;id++) entries.push(row(id,id,2,'Usuário:'+user+'/PU/Estatísticas','2026-10-01T12:00:00Z'));
    const utc=history(entries), ny=history(entries,'America/New_York');
    assert.deepEqual(Cards.calendarTotals(utc),{activeMonths:2,busiestDay:{date:'2010-01-01',edits:2},
        activeYears:2,averagePerActiveDay:1.5,busiestMonth:{month:'2010-01',edits:2}});
    assert.deepEqual(Cards.calendarTotals(ny),{activeMonths:1,busiestDay:{date:'2009-12-31',edits:3},
        activeYears:1,averagePerActiveDay:3,busiestMonth:{month:'2009-12',edits:3}});
    const html=render(utc,['activeMonths','busiestDay']);
    assert.match(html,/id="dan-pu-meses-com-edicoes">2 meses</);
    assert.match(html,/>01\/01\/2010<span[^>]*>2 edições</);
    const singular=render(ny,['activeMonths']);
    assert.match(singular,/>1 mês</);
});

test('busiest-day ties choose the earliest date independently of input order',()=>{
    const rows=[row(1,1,0,'A','2026-10-02T12:00:00Z'),row(2,2,0,'B','2026-10-01T12:00:00Z')];
    for(const entries of [rows,rows.slice().reverse()]) {
        assert.deepEqual(Cards.calendarTotals(history(entries)).busiestDay,{date:'2026-10-01',edits:1});
        assert.match(render(history(entries),['busiestDay']),/>01\/10\/2026<span[^>]*>1 edição</);
    }
});

test('complete empty histories show verified zeros and incomplete histories stay unknown',()=>{
    const a=history([]);
    assert.deepEqual(Cards.namespaceTotals(a),{articleEdits:0,talkEdits:0});
    assert.deepEqual(Cards.calendarTotals(a),{activeMonths:0,busiestDay:{date:null,edits:0},
        activeYears:0,averagePerActiveDay:0,busiestMonth:{month:null,edits:0}});
    const html=render(a);
    assert.match(html,/>0 meses</);
    assert.match(html,/>Nenhum dia</);
    assert.match(html,/id="dan-pu-edicoes-em-artigos">0</);
    for(const pending of [history([],'UTC',false),null,{complete:true,identity:{user},summary:{}}]) {
        assert.equal((render(pending).match(/Aguardando dados/g)||[]).length,4);
    }
    assert.equal(Cards.calendarTotals({complete:true,summary:{counts:{'2026-02-30':2}}}),null);
    assert.equal(Cards.calendarTotals({complete:true,summary:{counts:{'2026-01-01':-2}}}),null);
});

test('calendar options never inspect entries, and unselected options do no extra work',()=>{
    const a=history([row(1,1,0,'A','2026-10-01T12:00:00Z')]);
    Object.defineProperty(a,'entries',{get:()=>assert.fail('Calendar cards reuse summary.counts')});
    assert.match(render(a,['activeMonths','busiestDay']),/>1 mês</);
    Object.defineProperty(a.summary,'counts',{get:()=>assert.fail('Unselected calendar cards must not inspect counts')});
    assert.match(render(a,['thanks']),/Agradecimentos recebidos/);
});

test('namespace results are cached for appearance updates and refreshed with replaced history',()=>{
    const a=history([row(1,1,0,'A','2026-10-01T12:00:00Z')]);
    const first=Cards.namespaceTotals(a);
    assert.equal(Cards.namespaceTotals(a),first);
    assert.ok(Object.isFrozen(first));
    render(a,['articleEdits'],{highlightedMetrics:['articleEdits'],highlightColor:'#000000'});
    assert.equal(Cards.namespaceTotals(a),first);
    a.entries=a.entries.concat([row(2,2,0,'B','2026-10-02T12:00:00Z')]);
    assert.notEqual(Cards.namespaceTotals(a),first);
    assert.equal(Cards.namespaceTotals(a).articleEdits,2);
});

class Element {
    constructor() { this.attributes={};this.style={};this.children=[];this.text=''; }
    get textContent() { return this.text+this.children.map(child=>child.textContent).join(''); }
    set textContent(value) { this.text=String(value);this.children=[]; }
    getAttribute(key) { return this.attributes[key]||null; }
    setAttribute(key,value) { this.attributes[key]=String(value); }
    appendChild(element) { this.children.push(element); }
}
test('paint safely updates a busiest day and retains the last complete result while refreshing',()=>{
    const day=new Element(), articles=new Element();
    const document={getElementById:id=>id==='dan-pu-dia-com-mais-edicoes'?day:id==='dan-pu-edicoes-em-artigos'?articles:null,createElement:()=>new Element()};
    const a=history([row(1,1,0,'A','2026-10-01T12:00:00Z')]);
    Cards.paint(document,{user,metrics:{}},a,now);
    assert.equal(day.textContent,'01/10/20261 edição');
    assert.equal(articles.textContent,'1');
    Cards.paint(document,{user,metrics:{}},history([],'UTC',false),now);
    assert.equal(day.textContent,'01/10/20261 edição');
    Cards.paint(document,{user,metrics:{}},history([]),now);
    assert.equal(day.textContent,'Nenhum dia');
    assert.equal(articles.textContent,'0');
});

test('new card values stay readable with shading in HTML and wikitext',()=>{
    const a=history([row(1,1,0,'A','2026-10-01T12:00:00Z')]);
    for(const mode of ['html','wikitext']) {
        const html=Cards[mode]({user,metrics:{}},a,{user,now,appearance:{metrics:ids,highlightedMetrics:ids,highlightColor:'#000000'}});
        assert.equal((html.match(/background:#000000;/g)||[]).length,4);
        assert.ok((html.match(/color:#ffffff;/g)||[]).length>=8);
        assert.match(html,/>01\/10\/2026<span[^>]*>1 edição</);
    }
});
