'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Core=require('../src/PageviewsCore.js'),View=require('../src/ActivityView.js');
const NOW='2026-10-15T12:00:00.000Z',NEXT='2026-10-16T12:00:00.000Z';
const config={...Core.DEFAULT_CONFIG,user:'Editora Exemplo',timeZone:'UTC'};
const copy=value=>JSON.parse(JSON.stringify(value));
function fixture(count=115){
 const entries=Array.from({length:count},(_,index)=>[2000-index,index+1,0,'Artigo '+(index+1),new Date(Date.parse('2026-09-01T12:00:00Z')-index*60000).toISOString(),0]);
 entries.push([1,count,0,'Artigo '+count,'2008-01-01T00:00:00.000Z',0]);
 function activity(rows=entries,at=NOW){return {identity:{user:config.user,project:config.project},entries:rows,complete:true,capturedAt:at,lastAttemptAt:at,fullScanAt:NOW,scanMode:'full',pagesFetched:1,summary:Core.summarize(rows,{config,now:at}),cacheHit:false,stale:false,error:null};}
 const calls=[];
 async function requestJson(address){
  const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
  if(p.prop==='info')return {batchcomplete:true,query:{pages:p.pageids.split('|').map(Number).map(pageid=>({pageid,ns:0,title:'Artigo '+pageid}))}};
  assert.ok(url.pathname.includes('/per-article/'));const parts=url.pathname.split('/'),date=s=>s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8),items=[];
  for(let at=date(parts[11]);at<=date(parts[12]);at=Core.addDate(at,1))items.push({project:config.project,article:decodeURIComponent(parts[9]),agent:'user',access:'all-access',granularity:'daily',timestamp:at.replaceAll('-','')+'00',views:2});
  return {items};
 }
 function wrap(views,a=activity(),now=NOW){return {schemaVersion:4,config,capturedAt:now,activity:a,pageviews:views,complete:a.complete&&views.complete,fresh:!a.stale&&!views.stale};}
 async function collect(extra={}){const a=extra.activity||activity(),now=extra.now||NOW;const views=await Core.collectPageviews({config,now,activity:a,requestJson,maxRequests:13,onProgress:v=>assert.deepEqual(Core.validateState(wrap(v,a,now)),{valid:true,errors:[]}),...extra});assert.deepEqual(Core.validateState(wrap(views,a,now)),{valid:true,errors:[]});return views;}
 return {entries,activity,calls,wrap,collect};
}
function articleCalls(calls,id){return calls.filter(call=>decodeURIComponent(call.url.pathname).includes('/Artigo_'+id+'/')).length;}

test('crossing UTC midnight resumes the unfinished window and never downloads its ten verified series twice',async()=>{
 const io=fixture(),first=await io.collect();assert.equal(first.metadata.cursor,50);assert.equal(first.progress.collectedArticles,10);
 let views=await io.collect({previous:io.wrap(first),now:NEXT,maxRequests:40});
 assert.equal(views.cacheHit,true);assert.equal(views.startedAt,NOW);assert.equal(views.sourcePeriod.end,'2026-10-14');assert.ok(views.metadata.cursor>first.metadata.cursor);
 for(let round=0;!views.complete&&round<10;round++)views=await io.collect({previous:io.wrap(views,io.activity(),NEXT),now:NEXT,maxRequests:40});
 assert.equal(views.complete,true);assert.equal(views.stale,true,'A finished earlier window must not claim current-day freshness');for(let id=1;id<=10;id++)assert.equal(articleCalls(io.calls,id),1);
 const next=await io.collect({previous:io.wrap(views,io.activity(),NEXT),now:NEXT,maxRequests:5});
 assert.equal(next.sourcePeriod.end,'2026-10-15');assert.equal(next.lastCompleteSnapshot.periods['30d'].period.end,'2026-10-14');
 const markup=View.html(io.wrap(next,io.activity(),NEXT),{now:NEXT});assert.match(markup,/14/);
});

test('a fresh edit reordering partially classified candidates preserves verified metadata and article scores across midnight',async()=>{
 const io=fixture(),first=await io.collect(),rows=[[5000,80,0,'Artigo 80',NEXT,0],...io.entries].sort((a,b)=>b[4].localeCompare(a[4])||b[0]-a[0]),a=io.activity(rows,NEXT);
 const before=io.calls.length;let views=await io.collect({previous:io.wrap(first),activity:a,now:NEXT,maxRequests:40});
 assert.equal(views.startedAt,NOW);assert.equal(views.candidates[0].pageid,80);assert.equal(views.historyCapturedAt,NEXT);
 assert.ok(views.metadata.cursor>first.metadata.cursor);
 for(let round=0;!views.complete&&round<10;round++)views=await io.collect({previous:io.wrap(views,a,NEXT),activity:a,now:NEXT,maxRequests:40});
 assert.equal(views.complete,true);for(let id=1;id<=10;id++)assert.equal(articleCalls(io.calls,id),1);
 const refetched=new Set(io.calls.slice(before).filter(call=>call.p.prop==='info').flatMap(call=>call.p.pageids.split('|').map(Number)));
 for(let id=1;id<=50;id++)assert.equal(refetched.has(id),false,'Already classified unchanged titles are reused by ID');
});

test('a newly edited article joins the pinned calculation with exact zero eligible days, without invalidating old scores',async()=>{
 const io=fixture(),first=await io.collect(),rows=[[5001,116,0,'Artigo 116',NEXT,0],...io.entries],a=io.activity(rows,NEXT);
 let views=await io.collect({previous:io.wrap(first),activity:a,now:NEXT,maxRequests:40});
 for(let round=0;!views.complete&&round<10;round++)views=await io.collect({previous:io.wrap(views,a,NEXT),activity:a,now:NEXT,maxRequests:40});
 assert.equal(views.complete,true);assert.equal(views.metadata.cohort.length,116);assert.equal(views.series[116].totals.since,0);assert.equal(articleCalls(io.calls,116),0);
 for(let id=1;id<=10;id++)assert.equal(articleCalls(io.calls,id),1);
});

test('an explicit restart and an expired unfinished window use the current dates',async()=>{
 for(const extra of [{now:NEXT,restartPageviews:true},{now:'2026-10-23T12:00:00.000Z'}]){
  const io=fixture(),first=await io.collect(),next=await io.collect({previous:io.wrap(first),maxRequests:5,...extra});
  assert.equal(next.startedAt,extra.now);assert.equal(next.sourcePeriod.end,Core.addDate(extra.now.slice(0,10),-1));assert.equal(next.cacheHit,false);
 }
});

test('editing between same-day visits cannot repeatedly reset partial classification or redownload verified article scores',async()=>{
 const io=fixture(),first=await io.collect(),at='2026-10-15T13:00:00.000Z',rows=[[5002,90,0,'Artigo 90',at,0],...io.entries],a=io.activity(rows,at),before=io.calls.length;
 let views=await io.collect({previous:io.wrap(first),activity:a,now:at,maxRequests:40});
 assert.ok(views.metadata.cursor>first.metadata.cursor);assert.equal(views.candidates[0].pageid,90);
 for(let round=0;!views.complete&&round<10;round++)views=await io.collect({previous:io.wrap(views,a,at),activity:a,now:at,maxRequests:40});
 assert.equal(views.complete,true);for(let id=1;id<=10;id++)assert.equal(articleCalls(io.calls,id),1);
 const fetched=new Set(io.calls.slice(before).filter(call=>call.p.prop==='info').flatMap(call=>call.p.pageids.split('|').map(Number)));
 for(let id=1;id<=50;id++)assert.equal(fetched.has(id),false);
});

test('a small legacy cohort retains its validated narrower interval after excluding its oldest redirect',async()=>{
 const io=fixture(5),transport=async address=>{const result=await (async()=>{
  const url=new URL(address),p=Object.fromEntries(url.searchParams);io.calls.push({url,p});
  if(p.prop==='info')return {batchcomplete:true,query:{pages:p.pageids.split('|').map(Number).map(pageid=>({pageid,ns:0,title:'Artigo '+pageid,...pageid===5?{redirect:true}:{}}))}};
  const parts=url.pathname.split('/'),date=s=>s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8),items=[];
  for(let at=date(parts[11]);at<=date(parts[12]);at=Core.addDate(at,1))items.push({project:config.project,article:decodeURIComponent(parts[9]),agent:'user',access:'all-access',granularity:'daily',timestamp:at.replaceAll('-','')+'00',views:2});return {items};
 })();return result;};
 const first=await io.collect({requestJson:transport,maxRequests:4});assert.equal(first.metadata.complete,true);assert.equal(first.complete,false);assert.equal(first.sourcePeriod.start,'2025-10-15');
 const next=await io.collect({requestJson:transport,previous:io.wrap(first),now:NEXT,maxRequests:1});
 assert.equal(next.cacheHit,true);assert.equal(next.startedAt,NOW);assert.deepEqual(next.sourcePeriod,first.sourcePeriod);assert.equal(articleCalls(io.calls,1),1);
});
