'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Activity=require('../src/ActivityView.js'),Core=require('../src/PageviewsCore.js');
const now='2026-10-15T12:00:00Z',user='Marina Exemplo';
const customRange={start:'2024-02-01',end:'2024-02-29'};
function state(range=customRange){
 const entries=[[1,1,0,'Artigo de exemplo','2023-01-01T12:00:00Z',0]];
 const summary=Core.summarize(entries,{config:{user,timeZone:'UTC'},now});
 const rows=Array.from({length:22},(_,i)=>({pageid:i+1,title:'Exemplo '+i,views:1000-i,firstEditAt:'2023-01-01T12:00:00Z',countFromDate:range.start}));
 return {config:{user,timeZone:'UTC'},activity:{complete:true,entries,summary},capturedAt:now,
  pageviews:{customRange:range,periods:{custom:{period:{...range,days:29,basis:'UTC'},complete:true,rankingComplete:true,allArticleTotal:98765,rows,proof:{eligible:5000}}},capturedAt:now}};
}
test('custom period shows the real top ten and all-article total with the requested dates',()=>{
 const html=Activity.html(state(),{now,appearance:{initialPeriod:'custom',customRange}});
 assert.match(html,/id="dan-pu-ritmo-tab-custom"/);
 assert.match(html,/id="dan-pu-custom-start"[^>]*value="2024-02-01"/);
 assert.match(html,/id="dan-pu-custom-end"[^>]*value="2024-02-29"/);
 assert.match(html,/id="dan-pu-custom-apply"/);
 assert.equal((html.match(/class="dan-pu-view-row"/g)||[]).length,10);
 assert.match(html,/98\.765/);
 assert.match(html,/5\.000 artigos editados/);
 assert.match(html,/Mostrar mais 12/);
});
test('a custom result cannot be reused under a different pair of dates',()=>{
 const html=Activity.html(state(),{now,appearance:{initialPeriod:'custom',customRange:{start:'2024-01-01',end:'2024-01-31'}}});
 assert.doesNotMatch(html,/98\.765|Exemplo 0/);
 assert.match(html,/Somando|Escolha/);
});
test('saved custom interval is readable without exporting controls or request code',()=>{
 const wiki=Activity.wikitext(state(),{now,appearance:{initialPeriod:'custom',customRange}});
 assert.match(wiki,/dan-pu-view-custom/);
 assert.match(wiki,/98\.765/);
 assert.match(wiki,/1 fev\. a 29 fev\. de 2024/);
 assert.doesNotMatch(wiki,/<form|<input|<button|fetch\(/);
 assert.equal((wiki.match(/class="dan-pu-view-row"/g)||[]).length,22);
});
