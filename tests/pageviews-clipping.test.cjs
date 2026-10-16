'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Core=require('../src/PageviewsCore.js');
const NOW='2026-10-15T12:00:00.000Z',config={...Core.DEFAULT_CONFIG,user:'Editora Exemplo',timeZone:'UTC'},clone=value=>JSON.parse(JSON.stringify(value));
function fixture({omit=false,empty=false,bad404=false,outside=false}={}) {
    const entries=[[10,4,0,'Artigo 4','2026-10-05T12:00:00.000Z',1],[3,3,0,'Artigo 3','2026-10-15T00:00:00.000Z',0],
        [4,4,0,'Artigo 4','2026-10-01T12:00:00.000Z',0],[2,2,0,'Artigo 2','2026-10-01T12:00:00.000Z',0],[1,1,0,'Artigo 1','2008-05-25T12:00:00.000Z',0]].sort((a,b)=>b[4].localeCompare(a[4])||b[0]-a[0]);
    const activity={identity:{user:config.user,project:config.project},entries,complete:true,capturedAt:NOW,lastAttemptAt:NOW,fullScanAt:NOW,scanMode:'full',pagesFetched:1,
        summary:Core.summarize(entries,{config,now:NOW}),cacheHit:false,stale:false,error:null};
    const calls=[];
    const wrap=pageviews=>({schemaVersion:4,config,capturedAt:NOW,activity,pageviews,complete:pageviews.complete,fresh:!pageviews.stale});
    async function requestJson(address) {
        const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
        if(p.prop==='info')return {batchcomplete:true,query:{pages:p.pageids.split('|').map(Number).map(pageid=>({pageid,ns:0,title:'Artigo '+pageid}))}};
        assert.ok(url.pathname.includes('/per-article/'));
        const parts=url.pathname.split('/'),title=decodeURIComponent(parts[9]).replaceAll('_',' '),date=value=>value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8),start=date(parts[11]),end=date(parts[12]);
        assert.equal(parts[10],'daily');
        if(empty&&title==='Artigo 2') {
            const error=new Error('Not found');error.code=404;error.status=404;error.requestUrl=address;
            error.problem={type:'https://mediawiki.org/wiki/HyperSwitch/errors/not_found',method:'get',uri:bad404?url.pathname.replace('/2026100200/','/2015070100/'):url.pathname};throw error;
        }
        const items=[];for(let at=start;at<=end;at=Core.addDate(at,1)) {
            if(omit&&title==='Artigo 2'&&at==='2026-10-05')continue;
            items.push({project:'pt.wikipedia.org',article:title,agent:'user',access:'all-access',granularity:'daily',timestamp:at.replaceAll('-','')+'00',views:3});
        }
        if(outside&&title==='Artigo 2')items.push({project:'pt.wikipedia.org',article:title,agent:'user',access:'all-access',granularity:'daily',timestamp:'2015070100',views:10000});
        return {items};
    }
    async function collect(extra={}){const views=await Core.collectPageviews({config,now:NOW,activity,requestJson,maxRequests:20,onProgress:views=>assert.equal(Core.validateState(wrap(views)).valid,true),...extra});assert.equal(Core.validateState(wrap(views)).valid,true);return views;}
    return {calls,wrap,collect};
}

test('an old first edit does not force recent articles to download pre-edit days and exact four-period totals remain unchanged',async()=>{
    const io=fixture(),views=await io.collect();
    assert.equal(views.complete,true);assert.equal(views.sourcePeriod.start,'2015-07-01');
    const recent=io.calls.find(call=>call.url.pathname.includes('/Artigo_2/'));
    assert.ok(recent.url.pathname.endsWith('/2026100200/2026101400'));
    const old=io.calls.find(call=>call.url.pathname.includes('/Artigo_1/'));assert.ok(old.url.pathname.endsWith('/2015070100/2026101400'));
    assert.equal(io.calls.some(call=>call.url.pathname.includes('/Artigo_3/')),false,'No eligible day means no article GET');
    for(const [id,expected] of Object.entries({'30d':168,'90d':348,'12m':1173,since:12450}))assert.equal(views.periods[id].total,expected);
    assert.deepEqual(views.series[2].requestPeriod,{start:'2026-10-02',end:'2026-10-14',days:13,basis:'UTC'});
    assert.equal(views.series[3].coverageBasis,'before-first-edit');assert.equal(views.series[3].reportedDays,0);
    assert.equal(views.series[4].titleHistoryBeforePageCreation,true,'Observed eligible pre-creation title traffic remains explicit');
});

test('clipped omission zeros still need matching full-source availability evidence',async()=>{
    const io=fixture({omit:true}),views=await io.collect(),series=views.series[2];
    assert.equal(views.complete,true);assert.equal(series.zeroBasis,'aqs-documented-omitted-zero');
    assert.equal(series.reportedDays,12);assert.equal(series.requestPeriod.days,13);assert.equal(series.totals.since,36);
    assert.equal(views.availabilityProof.sourcePeriod.start,'2015-07-01');
    assert.ok(views.availabilityProof.controls.every(control=>control.daily.length===4124));
});

test('an empty clipped endpoint is zero only with the exact clipped404 evidence and the existing availability proof',async()=>{
    const io=fixture({empty:true}),views=await io.collect(),series=views.series[2];
    assert.equal(views.complete,true);assert.equal(series.zeroBasis,'aqs-documented-empty-series');assert.equal(series.totals.since,0);
    assert.ok(series.zeroEvidence.requestUrl.endsWith('/2026100200/2026101400'));
    const mismatch=fixture({empty:true,bad404:true}),unknown=await mismatch.collect({maxRequests:6});
    assert.equal(unknown.complete,false);assert.equal(unknown.series[2].validated,false);assert.equal(unknown.series[2].totals.since,null);
});

test('out-of-request observations and tampered clipping or zero-day proofs fail closed',async()=>{
    const io=fixture({outside:true}),unknown=await io.collect({maxRequests:6});
    assert.equal(unknown.complete,false);assert.equal(unknown.series[2].validated,false);
    const valid=fixture(),views=await valid.collect();
    for(const mutate of [
        value=>value.series[2].requestPeriod.start='2026-10-03',
        value=>value.series[2].requestPeriod.days=14,
        value=>value.series[2].firstNonZeroDate='2015-07-01',
        value=>value.series[2].reportedDays=14,
        value=>value.series[3].coverageBasis='anything',
        value=>value.series[3].partialSums.since=1
    ]){const forged=clone(views);mutate(forged);assert.equal(Core.validateState(valid.wrap(forged)).valid,false);}
});

test('legacy full-source series and cache round trips remain valid without new request-period metadata',async()=>{
    const io=fixture(),views=await io.collect(),legacy=clone(views);
    for(const series of Object.values(legacy.series)){delete series.requestPeriod;delete series.coverageBasis;}
    assert.equal(Core.validateState(io.wrap(legacy)).valid,true);
    const before=io.calls.length,resumed=await io.collect({previous:io.wrap(legacy)});
    assert.equal(io.calls.length,before);assert.deepEqual(resumed.periods,legacy.periods);
});
