'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../src/PageviewsCore.js');
const View=require('../src/ActivityView.js');
const NOW='2026-10-15T12:00:00.000Z';
const config={user:'Editora Exemplo',project:'pt.wikipedia.org',timeZone:'UTC'};
const clone=value=>JSON.parse(JSON.stringify(value));
const done=query=>({batchcomplete:true,query});
function fixture({count=115,oldRedirect=true,failSeries=false}={}) {
    const entries=Array.from({length:count},(_,index)=>[1000+count-index,index+1,0,'Artigo '+(index+1),new Date(Date.parse('2026-09-01T12:00:00Z')-index*60000).toISOString(),0]);
    if(oldRedirect)entries.push([1,count,0,'Artigo '+count,'2008-01-01T12:00:00.000Z',0]);
    const activity={identity:{user:config.user,project:config.project},entries,complete:true,capturedAt:NOW,lastAttemptAt:NOW,fullScanAt:NOW,scanMode:'full',pagesFetched:1,
        summary:Core.summarize(entries,{config,now:NOW}),cacheHit:false,stale:false,error:null};
    const calls=[],snapshots=[];
    const wrap=views=>({schemaVersion:4,config:Object.assign({},Core.DEFAULT_CONFIG,config),capturedAt:NOW,activity,pageviews:views,
        complete:activity.complete&&views.complete,fresh:!activity.stale&&!views.stale,cacheDiscarded:false});
    async function requestJson(address) {
        const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
        if(p.prop==='info')return done({pages:p.pageids.split('|').map(Number).map(pageid=>Object.assign({pageid,ns:0,title:'Artigo '+pageid},oldRedirect&&pageid===count?{redirect:true}:{}))});
        assert.ok(url.pathname.includes('/per-article/'));
        const parts=url.pathname.split('/'),title=decodeURIComponent(parts[9]),date=value=>value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8);
        assert.equal(parts[10],'daily');
        if(failSeries&&title.startsWith('Artigo'))throw new Error('Synthetic unavailable article');
        const start=date(parts[11]),end=date(parts[12]),items=[];
        for(let at=start;at<=end;at=Core.addDate(at,1))items.push({project:config.project,article:title,agent:'user',access:'all-access',granularity:'daily',timestamp:at.replaceAll('-','')+'00',views:at<'2026-09-02'?500:2});
        return {items};
    }
    const collect=extra=>Core.collectPageviews(Object.assign({config,now:NOW,activity,requestJson,maxRequests:40,checkpointEvery:8,onProgress:views=>{
        assert.deepEqual(Core.validateState(wrap(views)),{valid:true,errors:[]});snapshots.push({calls:calls.length,views:clone(views)});
    }},extra));
    return {calls,snapshots,activity,wrap,collect};
}

test('the first classified50 candidates yield provisional exact rows before full metadata without asserting a total or final ranking',async()=>{
    const io=fixture();
    const first=await io.collect({maxRequests:5});
    assert.equal(io.calls.length,5);
    assert.equal(first.sourceBasis,'history-candidates-v1');
    assert.equal(first.metadata.cursor,50);assert.equal(first.metadata.complete,false);
    assert.equal(first.sourcePeriod.start,'2015-07-01');
    assert.equal(first.progress.collectedArticles,2);assert.equal(first.phase,'metadata');
    assert.equal(first.progress.metadataRemaining,65);assert.equal(first.progress.resolved,50);
    assert.equal(first.error,null);
    for(const period of Object.values(first.periods)) {
        assert.equal(period.total,null);assert.equal(period.allArticleTotal,null);assert.equal(period.complete,false);assert.equal(period.rankingComplete,false);
        assert.equal(period.rows.length,2);assert.ok(period.rows.every(row=>row.views===Core.effectivePeriod({firstEditAt:'2026-09-01T12:00:00Z'},period.period).days*2));
        assert.equal(period.proof.metadataComplete,false);
    }
    const firstRows=io.snapshots.find(snapshot=>snapshot.views.periods['30d'].rows.length);
    assert.ok(firstRows);assert.equal(firstRows.calls,5);
    assert.match(View.html(io.wrap(first),{now:NOW}),/Ordem provisória/);
    assert.equal(io.calls.filter(call=>call.p.prop==='info').length,1);
});

test('a preview capped at10 articles resumes across budgets and survives excluding the earliest-edited redirect',async()=>{
    const io=fixture();let state=await io.collect({maxRequests:13});
    assert.equal(state.metadata.cursor,50);assert.equal(state.progress.collectedArticles,10);
    const source=clone(state.sourcePeriod),earlyRows=clone(state.periods['30d'].rows),earlySeries=clone(state.series);
    const firstBatch=io.calls.filter(call=>call.p.prop==='info').map(call=>call.p.pageids);
    let rounds=0;
    for(;rounds<20;rounds++) {
        const before=io.calls.length;
        state=await io.collect({previous:io.wrap(state),maxRequests:15});
        assert.ok(io.calls.length-before<=15);
        assert.deepEqual(state.sourcePeriod,source);
        if(state.complete)break;
    }
    assert.ok(rounds<20);assert.equal(state.complete,true);
    assert.equal(state.metadata.cursor,115);assert.equal(state.metadata.cohort.length,114);
    assert.deepEqual(state.metadata.excluded,[{pageid:115,reason:'redirect'}]);
    for(const [id,series] of Object.entries(earlySeries))assert.deepEqual(state.series[id],series,'Already verified preview series retain their original evidence');
    for(const row of earlyRows)assert.ok(state.periods['30d'].rows.some(final=>final.pageid===row.pageid&&final.views===row.views));
    assert.deepEqual(io.calls.filter(call=>call.p.prop==='info').map(call=>call.p.pageids),[firstBatch[0],Array.from({length:50},(_,i)=>i+51).join('|'),Array.from({length:15},(_,i)=>i+101).join('|')]);
    for(const period of Object.values(state.periods)) {
        assert.equal(period.total,114*Core.effectivePeriod({firstEditAt:'2026-09-01T12:00:00Z'},period.period).days*2);assert.equal(period.complete,true);assert.equal(period.rankingComplete,true);assert.equal(period.proof.eligible,114);
    }
    for(let id=1;id<=10;id++)assert.equal(io.calls.filter(call=>decodeURIComponent(call.url.pathname).includes('/Artigo_'+id+'/')).length,1);
});

test('streaming interval proofs reject forged bases, shortened source windows and premature completion',async()=>{
    const io=fixture(),views=await io.collect({maxRequests:5});
    for(const mutate of [
        value=>value.sourceBasis='anything',
        value=>value.sourcePeriod.start='2026-09-02',
        value=>value.metadata.complete=true,
        value=>value.periods['30d'].total=172,
        value=>value.periods['30d'].rankingComplete=true,
        value=>value.periods['30d'].complete=true
    ]) {const value=clone(views);mutate(value);assert.equal(Core.validateState(io.wrap(value)).valid,false);}
});

test('small and older eligible-cohort caches retain their narrower source interval and completed values',async()=>{
    const io=fixture({count:2}),current=await io.collect({maxRequests:40});
    assert.equal(current.sourceBasis,'eligible-cohort-v1');assert.equal(current.sourcePeriod.start,Core.periodsFor(NOW)['12m'].start);
    assert.equal(current.complete,true);assert.equal(current.metadata.cohort.length,1);
    const legacy=clone(current);delete legacy.sourceBasis;
    assert.deepEqual(Core.validateState(io.wrap(legacy)),{valid:true,errors:[]});
    const count=io.calls.length,resumed=await io.collect({previous:io.wrap(legacy),maxRequests:40});
    assert.equal(io.calls.length,count);assert.equal(resumed.complete,true);assert.deepEqual(resumed.periods,legacy.periods);
});

test('unavailable preview observations remain unknown and cannot manufacture zero rows or totals',async()=>{
    const io=fixture({failSeries:true}),views=await io.collect({maxRequests:13});
    assert.equal(views.metadata.complete,false);assert.equal(views.progress.collectedArticles,10);
    assert.equal(views.progress.unavailable,10);
    assert.ok(Object.values(views.series).every(series=>series.validated===false&&series.error));
    for(const period of Object.values(views.periods)) {
        assert.deepEqual(period.rows,[]);assert.equal(period.total,null);assert.equal(period.rankingComplete,false);assert.equal(period.complete,false);
    }
});

test('custom preparation does not trigger the fixed-window streaming preview before its metadata is complete',async()=>{
    const io=fixture(),customRange={start:'2026-10-01',end:'2026-10-10'},views=await io.collect({customRange,activePeriod:'custom',maxRequests:2});
    assert.equal(views.metadata.cursor,100);assert.equal(views.metadata.complete,false);
    assert.equal(views.progress.collectedArticles,0);
    assert.equal(io.calls.every(call=>call.p.prop==='info'),true);
    const completed=await io.collect({customRange,activePeriod:'custom',maxRequests:1,previous:io.wrap(views)});
    assert.equal(completed.metadata.complete,true);assert.equal(completed.metadata.cohort.length,114);
    assert.equal(io.calls.length,3);assert.equal(io.calls.every(call=>call.p.prop==='info'),true);
    assert.equal(completed.sourcePeriod.start,'2015-07-01');
});
