'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const History = require('../src/History.js');
const Statistics = require('../src/Statistics.js');
const USER = 'Editora Exemplo';
const NOW = '2024-08-20T12:00:00.000Z';
const shift = (ms)=>new Date(Date.parse(NOW)+ms).toISOString();
const clone = value=>JSON.parse(JSON.stringify(value));
function edit(revid,sizediff,changes={}) {
    const value={revid,pageid:revid+100,ns:0,title:'Página '+revid,user:USER,parentid:revid-1,
        timestamp:shift(-(100-revid)*1000),new:false,tags:[]};
    if (sizediff !== undefined) value.sizediff=sizediff;
    return Object.assign(value,changes);
}
const done=rows=>({batchcomplete:true,query:{usercontribs:rows}});
const more=(rows,token)=>({continue:{uccontinue:token,continue:'-||'},query:{usercontribs:rows}});
function transport(pages) {
    const urls=[];
    return {urls,requestJson:async value=>{urls.push(new URL(value));assert.ok(pages.length,'Unexpected extra page');return clone(pages.shift());}};
}
async function history(rows,options={}) {
    return History.collect({user:USER,now:NOW,requestJson:async()=>done(rows),...options});
}
function totals(value,now=NOW) { return Statistics.byteTotals(value,USER,now); }
test('bytes count signed parent deltas once across every public namespace',async()=>{
    const newest=edit(4,120,{ns:2,title:'Usuário:Exemplo/teste.js'});
    const io=transport([more([newest,edit(3,-50,{ns:828,title:'Módulo:Exemplo'})],'next'),done([edit(3,-50,{ns:828,title:'Módulo:Exemplo'}),edit(2,0),edit(1,10)])]);
    const result=await history([],{requestJson:io.requestJson});
    assert.equal(result.complete,true);
    assert.deepEqual(result.byteCoverage,{version:1,scannedAt:NOW,complete:true,knownEdits:4,totalEdits:4});
    assert.equal(totals(result).bytesAdded,130);
    assert.equal(totals(result).bytesRemoved,50);
    assert.ok(io.urls.every(url=>url.searchParams.get('ucprop').split('|').includes('sizediff')));
    assert.ok(History.richToActivityEntries(result).every(entry=>entry.length===6));
});
test('verified zero and a completed empty history produce exact zero byte totals',async()=>{
    for (const rows of [[],[edit(1,0)]]) {
        const result=totals(await history(rows));
        assert.equal(result.bytesAdded,0);
        assert.equal(result.bytesRemoved,0);
        assert.equal(result.byteCoverage.complete,true);
    }
});
test('missing or invalid API deltas stay unknown without breaking existing history metrics',async()=>{
    for (const delta of [undefined,null,'25',1.5,Number.MAX_SAFE_INTEGER+1]) {
        const result=await history([edit(2,30),edit(1,delta)]);
        assert.equal(result.complete,true);
        assert.equal(result.entries[1][9],null);
        assert.equal(result.byteCoverage.knownEdits,1);
        assert.equal(totals(result).bytesAdded,null);
        assert.equal(totals(result).bytesRemoved,null);
        assert.equal(History.richToActivityEntries(result).length,2);
        assert.equal(History.validate(result,{user:USER,now:NOW}).valid,true);
    }
});
test('legacy cache migration is one resumable full scan and keeps old complete history visible',async()=>{
    const rows=[edit(3,30),edit(2,-20),edit(1,10)];
    const legacy=await history(rows);
    legacy.entries=legacy.entries.map(entry=>entry.slice(0,9));
    delete legacy.byteCoverage;
    assert.equal(History.validate(legacy,{user:USER,now:NOW}).valid,true);
    const io=transport([more(rows.slice(0,2),'bytes-next'),done(rows.slice(2))]);
    const pending=await history([],{now:shift(1000),previous:legacy,maxRequests:1,requestJson:io.requestJson});
    assert.equal(pending.complete,true);
    assert.equal(pending.capturedAt,legacy.capturedAt);
    assert.equal(pending.pending.scanMode,'full');
    assert.equal(pending.pending.sizeDiffVersion,1);
    assert.equal(io.urls[0].searchParams.has('ucend'),false);
    assert.equal(totals(pending,shift(1000)).bytesAdded,null);
    assert.deepEqual(History.richToActivityEntries(pending),History.richToActivityEntries(legacy));
    const result=await history([],{now:shift(2000),previous:clone(pending),maxRequests:1,requestJson:io.requestJson});
    assert.equal(io.urls[1].searchParams.get('uccontinue'),'bytes-next');
    assert.equal(io.urls[1].searchParams.get('ucstart'),shift(1000));
    assert.equal(result.byteCoverage.complete,true);
    assert.equal(totals(result,shift(2000)).bytesAdded,40);
    assert.equal(totals(result,shift(2000)).bytesRemoved,20);
    const cached=await history([],{now:shift(3000),previous:result,requestJson:async()=>assert.fail('No full rescan on reload')});
    assert.equal(cached.cacheHit,true);
});
test('a completed scan with unavailable deltas stays cacheable and later refreshes incrementally',async()=>{
    const previous=await history([edit(2,20),edit(1)]);
    assert.equal(previous.byteCoverage.complete,false);
    assert.equal(previous.byteCoverage.scannedAt,NOW);
    const cached=await history([],{now:shift(1000),previous,requestJson:async()=>assert.fail('Unavailable is not a rescan loop')});
    assert.equal(cached.cacheHit,true);
    const io=transport([done([edit(2,20),edit(1)])]);
    const next=await history([],{now:shift(360000),previous,requestJson:io.requestJson});
    assert.equal(next.scanMode,'incremental');
    assert.equal(io.urls[0].searchParams.has('ucend'),true);
    assert.equal(next.byteCoverage.complete,false);
});
test('an older pending cursor restarts with sizediff rather than claiming coverage for older nine-field pages',async()=>{
    const io=transport([more([edit(2,20)],'old-cursor')]);
    const pending=await history([],{maxRequests:1,requestJson:io.requestJson});
    delete pending.pending.sizeDiffVersion;
    pending.pending.entries=pending.pending.entries.map(entry=>entry.slice(0,9));
    const nextIo=transport([done([edit(2,20),edit(1,-10)])]);
    const result=await history([],{previous:pending,requestJson:nextIo.requestJson});
    assert.equal(nextIo.urls[0].searchParams.has('uccontinue'),false);
    assert.equal(result.byteCoverage.complete,true);
    assert.equal(totals(result).bytesAdded,20);
});
test('incremental overlap replaces changed deltas, retains old revisions and never double counts',async()=>{
    const old=edit(1,-10,{timestamp:shift(-3*86400000)});
    const previous=await history([edit(2,20),old]);
    const io=transport([done([edit(3,30,{timestamp:shift(300000)}),edit(2,20)])]);
    const result=await history([],{now:shift(360000),previous,requestJson:io.requestJson});
    assert.equal(result.scanMode,'incremental');
    assert.equal(totals(result,shift(360000)).bytesAdded,50);
    assert.equal(totals(result,shift(360000)).bytesRemoved,10);
    assert.equal(result.byteCoverage.scannedAt,NOW);
});
test('forged coverage and malformed cached deltas cannot become exact byte totals',async()=>{
    const result=await history([edit(2,20),edit(1)]);
    const forged=clone(result);forged.byteCoverage.complete=true;forged.byteCoverage.knownEdits=2;
    assert.equal(History.validate(forged,{user:USER,now:NOW}).valid,false);
    assert.equal(totals(forged).bytesAdded,null);
    const invalid=clone(result);invalid.entries[0][9]='20';
    assert.equal(History.validate(invalid,{user:USER,now:NOW}).valid,false);
    assert.throws(()=>totals(invalid));
});
test('safe integer overflow produces unknown totals instead of rounded byte counts',async()=>{
    const result=await history([edit(2,Number.MAX_SAFE_INTEGER),edit(1,1)]);
    assert.equal(result.byteCoverage.complete,true);
    assert.equal(totals(result).bytesAdded,null);
    assert.equal(totals(result).bytesRemoved,null);
});
test('statistics accept old caches, preserve existing counters and expose bytes only with complete evidence',async()=>{
    const evidence=await history([edit(2,200),edit(1,-50)]);
    const requestJson=async()=>{throw new Error('Local synthetic service failure');};
    const current=await Statistics.collect({user:USER,now:NOW,history:evidence,maxRequests:1,requestJson});
    assert.equal(current.metrics.bytesAdded,200);
    assert.equal(current.metrics.bytesRemoved,50);
    assert.equal(current.metricUpdatedAt.bytesAdded,NOW);
    assert.equal(Statistics.validate(current,{user:USER,now:NOW}).valid,true);
    const old=clone(current);
    for (const key of ['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval']) {
        delete old.metrics[key];delete old.metricUpdatedAt[key];
    }
    delete old.byteCoverage;
    old.metrics.thanks=42;old.metricUpdatedAt.thanks=NOW;
    assert.equal(Statistics.validate(old,{user:USER,now:NOW}).valid,true);
    const legacy=clone(evidence);legacy.entries=legacy.entries.map(entry=>entry.slice(0,9));delete legacy.byteCoverage;
    const migrated=await Statistics.collect({user:USER,now:shift(1000),history:legacy,previous:old,maxRequests:1,requestJson});
    assert.equal(migrated.metrics.thanks,42);
    assert.equal(migrated.metrics.bytesAdded,null);
    assert.equal(migrated.metrics.bytesRemoved,null);
    assert.equal(migrated.metricUpdatedAt.bytesAdded,null);
});
