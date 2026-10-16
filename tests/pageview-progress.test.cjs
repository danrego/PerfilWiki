'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Activity = require('../src/ActivityView.js');
const Core = require('../src/PageviewsCore.js');
const now = '2026-10-15T12:00:00Z';
function state(metadataComplete) {
    const config = {user:'Marina Exemplo',timeZone:'UTC'};
    const entries = [[1,1,0,'Artigo de exemplo','2023-01-01T12:00:00Z',0]];
    return {config,capturedAt:now,activity:{complete:true,entries,summary:Core.summarize(entries,{config,now})},
        pageviews:{capturedAt:now,candidates:Array.from({length:150},(_,i)=>({pageid:i+1})),
            metadata:{cursor:metadataComplete?150:50,complete:metadataComplete,cohort:[]},
            progress:{resolved:metadataComplete?150:50,collectedArticles:metadataComplete?7:0,eligible:120},
            periods:{'30d':{period:{start:'2026-09-15',end:'2026-10-14'},complete:false,rankingComplete:false,
                total:null,allArticleTotal:null,proof:{eligible:metadataComplete?120:45},rows:[]}}}};
}
test('metadata progress reports verified titles instead of zero consulted pageviews',()=>{
    const html=Activity.html(state(false),{now});
    assert.match(html,/Preparando artigos · 50 de 150 títulos verificados/);
    assert.doesNotMatch(html,/0 artigos consultados|Consultando visualizações/);
    assert.match(html,/Somando as visualizações/);
});
test('series progress reports the number of queried articles after metadata completes',()=>{
    const html=Activity.html(state(true),{now});
    assert.match(html,/Consultando visualizações · 7 de 120 artigos/);
    assert.doesNotMatch(html,/Preparando artigos|0 artigos consultados/);
});
test('early article rows remain provisional and cannot become a complete total',()=>{
    const input=state(false), period=input.pageviews.periods['30d'];
    period.rows=[{pageid:1,title:'Artigo de exemplo',views:321,firstEditAt:'2023-01-01T12:00:00Z',countFromDate:'2026-09-15'}];
    input.pageviews.progress.collectedArticles=1;
    const html=Activity.html(input,{now});
    assert.match(html,/Ordem provisória/);
    assert.match(html,/Artigo de exemplo/);
    assert.match(html,/>321</);
    assert.match(html,/Somando as visualizações de todos os artigos editados/);
    assert.doesNotMatch(html,/nos 45 artigos editados por você/);
});
