'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../src/PageviewsCore.js');
const Cache=require('../src/Cache.js');
const Coordinator=require('../src/Coordinator.js');
const USER='Marina Exemplo',NOW='2026-10-15T14:42:00.000Z',DAY=86400000;
const config={...Core.DEFAULT_CONFIG,user:USER,timeZone:'UTC'};
const range={start:'2026-10-01',end:'2026-10-10'};
const clone=value=>JSON.parse(JSON.stringify(value));
function activity(count=3,firstDates={}) {
 const entries=Array.from({length:count},(_,i)=>[i+1,i+1,0,'Artigo '+(i+1),(firstDates[i+1]||'2026-09-01')+'T12:00:00.000Z',0]);
 return{identity:{user:USER,project:config.project},entries,complete:true,capturedAt:NOW,fullScanAt:NOW,
  summary:Core.summarize(entries,{config,now:NOW}),stale:false};
}
function wrap(views,a,now=NOW){return{schemaVersion:4,config,capturedAt:now,activity:a,pageviews:views,complete:views.complete,fresh:!views.stale};}
function fixture(options={}) {
 const calls=[];
 const requestJson=async address=>{
  const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
  if(options.intercept){const response=await options.intercept(url,p,calls);if(response!==undefined)return response;}
  if(url.hostname==='pt.wikipedia.org')return{batchcomplete:true,query:{pages:p.pageids.split('|').map(id=>({pageid:Number(id),ns:0,title:options.rename?.[id]||'Artigo '+id,contentmodel:'wikitext',...options.pages?.[id]}))}};
  assert.equal(url.hostname,'wikimedia.org');const parts=url.pathname.split('/'),title=decodeURIComponent(parts[9]).replace(/_/g,' ');
  assert.equal(parts[10],'daily');
  const parse=value=>Date.parse(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T00:00:00Z');
  const items=[];
  for(let at=parse(parts[11]);at<=parse(parts[12]);at+=DAY){const date=new Date(at).toISOString().slice(0,10);
   if(options.omit?.(title,date))continue;
   items.push({project:'pt.wikipedia.org',article:title.replace(/ /g,'_'),agent:'user',access:'all-access',granularity:'daily',timestamp:date.replace(/-/g,'')+'00',
    views:options.views?options.views(title,date):/^Artigo (\d+)$/.test(title)?Number(title.match(/\d+/)[0]):5});}
  return{items};
 };
 return{calls,requestJson};
}
async function collect(f,a,extra={}) {return Core.collectPageviews({config,now:NOW,activity:a,requestJson:f.requestJson,maxRequests:40,customRange:range,activePeriod:'custom',...extra});}
function assertValid(views,a){const check=Core.validateState(wrap(views,a));assert.equal(check.valid,true,check.errors.join('\n'));}

test('custom dates require strict complete UTC days inside the published coverage window',()=>{
 assert.deepEqual(Core.normalizeCustomRange(range,NOW),range);assert.equal(Core.normalizeCustomRange(null,NOW),null);
 assert.deepEqual(Core.normalizeCustomRange({start:'2015-07-01',end:'2026-10-14'},NOW),{start:'2015-07-01',end:'2026-10-14'});
 for(const value of [{start:'2015-06-30',end:'2026-10-10'},{start:'2026-10-15',end:'2026-10-15'},
  {start:'2026-02-30',end:'2026-10-10'},{start:'2026-10-10',end:'2026-10-01'},
  {start:'2026-10-01',end:'2026-10-10',extra:true},[],{start:'2026-10-01'}])assert.throws(()=>Core.normalizeCustomRange(value,NOW),/datas completas/);
});

test('custom counts cover every eligible article after the first-edit cutoff and use inclusive UTC boundaries',async()=>{
 const a=activity(3,{2:'2026-10-05',3:'2026-10-12'}),f=fixture();
 const views=await collect(f,a);
 assert.equal(views.periods.custom.complete,true);assert.equal(views.periods.custom.total,20);
 assert.deepEqual(views.periods.custom.rows.map(row=>[row.pageid,row.views]),[[2,10],[1,10],[3,0]]);
 assert.equal(views.customCache.series[2].period.start,'2026-10-06');
 assert.equal(f.calls.some(call=>decodeURIComponent(call.url.pathname).replace(/_/g,' ').includes('/Artigo 3/')),false);
 assert.equal(views.periods.custom.proof.eligible,3);assert.equal(views.periods.custom.totalScope,'all-eligible-articles');
 assertValid(views,a);
});

test('twenty-five articles resume metadata, availability controls and exact article sums within a shared budget',async()=>{
 const a=activity(25),f=fixture();let previous=null,views,checkpoints=0;
 for(let round=0;round<20;round++){
  const before=f.calls.length;
  views=await collect(f,a,{previous,maxRequests:2,checkpointEvery:2,onProgress:async section=>{assertValid(section,a);checkpoints++;}});
  assert.ok(f.calls.length-before<=2);assertValid(views,a);previous=wrap(views,a);
  if(views.periods.custom.complete)break;
 }
 assert.equal(views.periods.custom.complete,true);assert.equal(views.periods.custom.total,3250);assert.ok(checkpoints>5);
 assert.equal(f.calls.filter(call=>call.p.prop==='info').length,1);
 for(const title of ['China','ChatGPT'])assert.equal(f.calls.filter(call=>decodeURIComponent(call.url.pathname).replace(/_/g,' ').includes('/'+title+'/')).length,1);
 for(let id=1;id<=25;id++)assert.equal(f.calls.filter(call=>decodeURIComponent(call.url.pathname).replace(/_/g,' ').includes('/Artigo '+id+'/')).length,1);
});

test('excluding an old redirect freezes the eligible source interval before metadata-only or ordinary checkpoints',async()=>{
 const a=activity(2,{1:'2008-01-01',2:'2026-09-01'}),settings={pages:{1:{redirect:true}}};
 for(const custom of [true,false]){
  const f=fixture(settings),views=await Core.collectPageviews({config,now:NOW,activity:a,requestJson:f.requestJson,maxRequests:40,checkpointEvery:1,
   ...(custom?{customRange:range,activePeriod:'custom'}:{}),onProgress:async value=>assertValid(value,a)});
  assertValid(views,a);assert.equal(views.sourcePeriod.start,Core.periodsFor(NOW)['12m'].start);
  assert.deepEqual(views.metadata.cohort.map(article=>article.pageid),[2]);
  if(custom){assert.equal(views.periods.custom.complete,true);assert.equal(views.periods.custom.total,20);}
 }
});

test('a custom interval matching a verified fixed period reuses its sums without new requests',async()=>{
 const a=activity(),f=fixture();
 const fixed=await Core.collectPageviews({config,now:NOW,activity:a,requestJson:f.requestJson,maxRequests:40});
 assert.equal(fixed.allPeriodsComplete,true);
 const before=f.calls.length,selected=Core.periodsFor(NOW)['30d'];
 const custom=await collect(f,a,{previous:wrap(fixed,a),customRange:{start:selected.start,end:selected.end}});
 assert.equal(f.calls.length,before);assert.equal(custom.periods.custom.total,fixed.periods['30d'].total);
 for(const id of Core.PERIOD_IDS)assert.deepEqual(custom.periods[id],fixed.periods[id]);
 assert.deepEqual(custom.series,fixed.series);assertValid(custom,a);
});

test('range changes reset custom snapshots and keep all fixed-period observations intact',async()=>{
 const a=activity(),f=fixture(),first=await collect(f,a);
 const second=await collect(f,a,{previous:wrap(first,a),customRange:{start:'2026-10-02',end:'2026-10-03'},maxRequests:1});
 assert.deepEqual(second.customRange,{start:'2026-10-02',end:'2026-10-03'});
 assert.equal(second.periods.custom.complete,false);assert.equal(second.customCache.lastCompleteSnapshot,null);
 assert.equal(second.periods.custom.lastCompleteSnapshot,undefined);
 assert.deepEqual(second.series,first.series);
 for(const id of Core.PERIOD_IDS)assert.deepEqual(second.periods[id],first.periods[id]);
 assertValid(second,a);
});

test('after custom priority finishes the next call continues fixed windows while reusing the custom result',async()=>{
 const a=activity(),f=fixture(),first=await collect(f,a);
 assert.equal(first.periods.custom.complete,true);assert.equal(first.allPeriodsComplete,false);
 const before=f.calls.length,second=await collect(f,a,{previous:wrap(first,a)});
 assert.equal(second.periods.custom.complete,true);assert.equal(second.allPeriodsComplete,true);assertValid(second,a);
 assert.deepEqual(second.periods.custom,first.periods.custom);
 assert.ok(f.calls.length>before);
 const aqs=f.calls.slice(before).filter(call=>call.url.hostname==='wikimedia.org');
 assert.ok(aqs.every(call=>call.url.pathname.split('/')[11]!=='2026100100'),'No custom article series was fetched again');
});

test('HTTP errors and malformed or duplicated daily observations stay unknown and can be retried',async()=>{
 const a=activity(1);
 for(const bad of ['http','duplicate','foreign','future','sparse']){
  const f=fixture({intercept:(url)=>{
   if(!decodeURIComponent(url.pathname).replace(/_/g,' ').includes('/Artigo 1/'))return;
   if(bad==='http')throw new Error('Synthetic HTTP 503');
   if(bad==='sparse')return{items:new Array(1)};
   const item={project:bad==='foreign'?'en.wikipedia.org':'pt.wikipedia.org',article:'Artigo_1',agent:'user',access:'all-access',granularity:'daily',timestamp:bad==='future'?'2026101600':'2026100100',views:5};
   return{items:bad==='duplicate'?[item,item]:[item]};
  }});
  const views=await collect(f,a);assert.equal(views.periods.custom.complete,false);assert.equal(views.periods.custom.total,null);assert.ok(views.customCache.error);assertValid(views,a);
  const retry=fixture();const recovered=await collect(retry,a,{previous:wrap(views,a),retryUnavailableSeries:true});
  assert.equal(recovered.periods.custom.complete,true);assert.equal(recovered.periods.custom.total,10);assertValid(recovered,a);
 }
});

test('omitted daily zeros need explicit availability controls and never follow a generic empty response alone',async()=>{
 const a=activity(1),known=fixture({omit:title=>title==='Artigo 1'});
 const complete=await collect(known,a);assert.equal(complete.periods.custom.total,0);assertValid(complete,a);
 const unknown=fixture({omit:title=>title==='Artigo 1',intercept:url=>{if(/\/(China|ChatGPT)\//.test(url.pathname))throw new Error('Synthetic availability failure');}});
 const partial=await collect(unknown,a);assert.equal(partial.periods.custom.total,null);assert.equal(partial.customCache.series[1].missingDates.length,10);assertValid(partial,a);
});

test('normal scheduled refresh retries a failed custom article once after its five-minute cooldown',async()=>{
 const a=activity(1),broken=fixture({intercept:url=>{if(decodeURIComponent(url.pathname).replace(/_/g,' ').includes('/Artigo 1/'))throw new Error('Synthetic HTTP 503');}});
 const first=await collect(broken,a);assert.equal(first.periods.custom.complete,false);
 const healthy=fixture(),early=await collect(healthy,a,{previous:wrap(first,a),now:'2026-10-15T14:43:00.000Z'});
 assert.equal(healthy.calls.length,0);assert.equal(early.periods.custom.complete,false);
 const later='2026-10-15T15:00:00.000Z',recovered=await collect(healthy,a,{previous:wrap(early,a,'2026-10-15T14:43:00.000Z'),now:later});
 assert.equal(healthy.calls.length,1);assert.equal(recovered.periods.custom.complete,true);assert.equal(recovered.periods.custom.total,10);
 assert.ok(Core.validateState(wrap(recovered,a,later)).valid);
});

test('availability-control failures recover automatically without fetching the same missing-zero article again',async()=>{
 const a=activity(1),broken=fixture({omit:title=>title==='Artigo 1',intercept:url=>{if(/\/(China|ChatGPT)\//.test(url.pathname))throw new Error('Synthetic availability failure');}});
 const first=await collect(broken,a);assert.equal(first.periods.custom.total,null);
 const healthy=fixture({omit:title=>title==='Artigo 1'}),later='2026-10-15T15:00:00.000Z';
 const recovered=await collect(healthy,a,{previous:wrap(first,a),now:later});
 assert.equal(recovered.periods.custom.complete,true);assert.equal(recovered.periods.custom.total,0);
 assert.equal(healthy.calls.length,2);assert.ok(healthy.calls.every(call=>/\/(China|ChatGPT)\//.test(call.url.pathname)));
 assert.ok(Core.validateState(wrap(recovered,a,later)).valid);
});

test('custom cache validation rejects wrong ranges, identities, cutoffs, projections and fabricated zeros',async()=>{
 const a=activity(1),views=await collect(fixture(),a);
 for(const mutate of [v=>{v.customRange.end='2026-10-09';},v=>{v.customCache.identity.user='Outra conta';},
  v=>{v.customCache.series[1].firstEditAt='2026-10-01T00:00:00Z';},v=>{v.periods.custom.total=999;},
  v=>{v.customCache.series[1].reportedDays=0;},v=>{v.customCache.availabilityProof.controls[0].agent='spider';},
  v=>{v.customCache.series[1].period.start='2015-06-30';}]) {
  const bad=clone(views);mutate(bad);assert.equal(Core.validateState(wrap(bad,a)).valid,false);
 }
});

test('completed, partial and failed custom cache fields survive dictionary round trips',async()=>{
 const a=activity(25),f=fixture(),partial=await collect(f,a,{maxRequests:3});
 const complete=await collect(f,a,{previous:wrap(partial,a),maxRequests:40});
 const broken=await collect(fixture({intercept:url=>{if(decodeURIComponent(url.pathname).replace(/_/g,' ').includes('/Artigo 1/'))throw new Error('Synthetic HTTP 503');}}),activity(1));
 for(const [views,history]of[[partial,a],[complete,a],[broken,activity(1)]]){
  const state=wrap(views,history);state.padding=Array.from({length:2500},()=>({text:'Synthetic cache round trip value',range}));
  const raw=JSON.stringify(state),packed=Cache.packJson(raw),restored=Cache.parseJson(packed);
  assert.ok(raw.length>100000);assert.deepEqual(restored,clone(state));assert.ok(Core.validateState(restored).valid);
 }
});

test('custom ranking counts all articles while storing at most five hundred visible rows',async()=>{
 const a=activity(501),f=fixture(),views=await collect(f,a,{maxRequests:Infinity,customRange:{start:'2026-10-01',end:'2026-10-01'}});
 assert.equal(views.periods.custom.complete,true);assert.equal(views.periods.custom.rows.length,500);
 assert.equal(views.periods.custom.proof.eligible,501);assert.equal(views.periods.custom.total,501*502/2);
 assert.equal(views.periods.custom.rows[0].pageid,501);assert.equal(views.periods.custom.rows[499].pageid,2);assertValid(views,a);
});

test('integrated Coordinator progress validates while custom and fixed calculations finish in turn',async()=>{
 const a=activity(),f=fixture(),edits=a.entries.map(entry=>({revid:entry[0],pageid:entry[1],ns:0,title:entry[3],timestamp:entry[4],parentid:0,new:false,user:USER,tags:[],sizediff:1})).reverse();
 const requestJson=async address=>{
  const url=new URL(address),p=Object.fromEntries(url.searchParams);
  if(p.list==='usercontribs')return{batchcomplete:true,query:{usercontribs:edits}};
  if(p.meta==='globaluserinfo')return{batchcomplete:true,query:{globaluserinfo:{name:USER,editcount:3,merged:[{wiki:'ptwiki',url:'https://pt.wikipedia.org',editcount:3}]}}};
  if(p.list==='users')return{batchcomplete:true,query:{users:[{name:USER,registration:'2008-01-01T00:00:00Z'}]}};
  if(p.list==='logevents')return{batchcomplete:true,query:{logevents:[]}};
  if(url.hostname==='xtools.wmcloud.org')return{username:USER,project:'pt.wikipedia.org',namespace:0,redirects:'noredirects',deleted:'all',counts:{}};
  return f.requestJson(address);
 };
 let progress=0;
 const settings={config,now:NOW,customRange:range,activePeriod:'custom',requestJson,maxRequests:40,onProgress:async state=>{const check=Coordinator.validateState(state);assert.equal(check.valid,true,check.errors.join('\n'));progress++;}};
 const first=await Coordinator.update(settings);assert.equal(first.pageviews.periods.custom.complete,true);assert.equal(first.complete,false);
 const second=await Coordinator.update({...settings,previous:first});assert.equal(second.pageviews.allPeriodsComplete,true);assert.equal(second.complete,true);assert.ok(progress>1);
 assert.ok(Coordinator.validateState(second).valid);
});
