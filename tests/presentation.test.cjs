'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Cards = require('../src/CardsView.js');
const View = require('../src/ActivityView.js');
const Presenter = require('../src/Presenter.js');
const Core = require('../src/PageviewsCore.js');
const Cache = require('../src/Cache.js');
const NOW = '2024-08-20T12:00:00Z';
const user = 'Editora Exemplo';
function activity() {
    const entries = [[5, 9, 0, 'Exemplo', '2024-08-19T12:00:00Z', 0]];
    return {complete:true, capturedAt:NOW, entries, identity:{user,project:'pt.wikipedia.org'},summary:Core.summarize(entries,{config:{user,project:'pt.wikipedia.org',timeZone:'UTC'},now:NOW})};
}
test('card unknown values stay unknown while verified zeros are displayed', () => {
    const html = Cards.html({user,metrics:{edits:0,thanks:null,technicalCreated:0}},null,{user,now:NOW});
    assert.match(html,/id="dan-pu-edicoes">0</);
    assert.match(html,/id="dan-pu-agradecimentos">Aguardando dados</);
    assert.match(html,/id="dan-pu-criados-tecnicos">0</);
    assert.doesNotMatch(html,/NaN|undefined/);
});
test('tenure uses the anniversary and never substitutes another account registration', () => {
    assert.equal(Cards.years('2010-08-21T00:00:00Z',NOW),13);
    assert.equal(Cards.years('2010-08-20T00:00:00Z',NOW),14);
    assert.equal(Cards.years(null,NOW),null);
    assert.equal(Cards.years('2030-01-01T00:00:00Z',NOW),null);
    assert.match(Cards.wikitext({user,metrics:{registration:'2010-08-20T00:00:00Z'}},null,{user,now:NOW}),/\{\{Tempo decorrido\|20\|8\|2010\|prec=ano\}\}/);
});
test('shared activity decides the card streak and exported blocks retain independent roots', () => {
    const a=activity();
    const stats={user,metrics:{bestStreak:99}};
    assert.match(Cards.html(stats,a,{user,now:NOW}),new RegExp('id="dan-pu-ritmo-melhor-sequencia">'+a.summary.bestStreak+' dia<'));
    const panel=View.wikitext({config:{user,timeZone:'UTC'},capturedAt:NOW,activity:a,pageviews:null});
    assert.match(panel,/id="dan-pu-ritmo" data-perfilwiki-user="Editora Exemplo"/);
    assert.doesNotMatch(panel,/id="dan-pu-estatisticas"/);
    assert.doesNotMatch(Cards.wikitext(stats,a,{user,now:NOW}),/id="dan-pu-ritmo"/);
});
test('custom hosting and account labels are escaped in HTML and saved wikitext', () => {
    const a=activity();
    const state={config:{user,timeZone:'UTC'},capturedAt:NOW,activity:a,pageviews:null};
    const wiki=View.wikitext(state,{stylesPage:'Usuário:Exemplo/Estilos "teste"',documentationPage:'Usuário:Exemplo/Guia'});
    assert.match(wiki,/src="Usuário:Exemplo\/Estilos &quot;teste&quot;"/);
    assert.match(wiki,/\[\[Usuário:Exemplo\/Guia\|Veja como adicionar/);
    assert.doesNotMatch(wiki,/<script|onerror=|javascript:/i);
    assert.match(Cards.html({user:'A"<B',metrics:{}},null,{user:'A"<B'}),/data-perfilwiki-user="A&quot;&lt;B"/);
});
test('default activity exports reference the usable shared TemplateStyles page', () => {
    const state={config:{user,timeZone:'UTC'},capturedAt:NOW,activity:activity(),pageviews:null};
    const wiki=View.wikitext(state);
    assert.match(wiki,/^<templatestyles src="Usuário:Daniel G Rego\/RitmoPU-estilos" \/>/);
    assert.doesNotMatch(wiki,/<templatestyles src="Usuário:Daniel G Rego\/PerfilWiki-estilos"/);
});
test('milestones progress past completed goals and preserve earned badges after a broken streak', () => {
    assert.equal(View.streakGoal(30,30).next,45);
    assert.equal(View.streakGoal(45,45).next,60);
    assert.equal(View.streakGoal(0,41).achieved,30);
    assert.equal(View.streakGoal(1000,1000).next,1365);
});
test('last edit uses actual revision timestamps and future relative labels fail closed', () => {
    assert.equal(Presenter.lastEditAt({activity:{entries:[[1,2,0,'x','2024-08-19T12:00:00Z',0],[2,2,0,'x','2024-08-20T11:50:00Z',0]]}}),'2024-08-20T11:50:00.000Z');
    assert.equal(Presenter.relativeTime('2024-08-20T11:50:00Z',NOW),'há 10 minutos');
    assert.equal(Presenter.relativeTime('2030-08-20T11:50:00Z',NOW),null);
    assert.equal(Presenter.relativeTime('not a date',NOW),null);
});
test('compressed caches preserve Unicode, repeated revisions and exact JSON text', () => {
    const rows=Array.from({length:5000},(_,i)=>[i,1,0,'História da edição 🧩','2024-08-19T12:00:00Z',false,{title:'Edição portuguesa'}]);
    const raw=JSON.stringify({user,rows,duplicate:rows});
    const packed=Cache.packJson(raw);
    assert.ok(packed.length<raw.length);
    assert.equal(Cache.unpackJson(packed),raw);
    assert.deepEqual(Cache.parseJson(packed),JSON.parse(raw));
});
test('invalid cache dictionaries and oversized data are refused', () => {
    assert.throws(()=>Cache.parseJson(JSON.stringify({format:Cache.format,dictionary:['null'],payload:'@Ā'})));
    assert.throws(()=>Cache.parseJson('x'.repeat(Cache.packedLimit+1)));
    assert.throws(()=>Cache.parseJson(JSON.stringify({format:Cache.format,dictionary:['"x"'],arrays:['$0;'],payload:'$0;'})));
});
