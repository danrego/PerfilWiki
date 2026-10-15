'use strict';
const assert = require('node:assert/strict');
const core = require('../src/PageviewsCore.js');
const NOW = '2026-10-13T18:42:34.000Z';
const config = { user: 'Exemplo Editor', project: 'pt.wikipedia.org', timeZone: 'America/New_York' };
const tests=[]; const test=(name,run)=>tests.push({name,run}); const copy=x=>JSON.parse(JSON.stringify(x));
const edit=(id,first='2026-10-01T12:34:56.000Z',page=id,title='Artigo '+page)=>[id,page,0,title,first,0];
function responseRows(title,start,end,count=7,granularity='daily') {
  const daily=[]; for(let d=start;d<=end;d=core.addDate(d,1))daily.push({date:d,views:typeof count==='function'?count(d):count});
  const counts=new Map(); for(const day of daily){const date=granularity==='monthly'?day.date.slice(0,7)+'-01':day.date;counts.set(date,(counts.get(date)||0)+day.views);}
  return {items:[...counts].map(([date,views])=>({project:'pt.wikipedia',article:title,access:'all-access',agent:'user',granularity,timestamp:date.replaceAll('-','')+'00',views}))};
}
function transport(entries,options={}) {
  const calls=[]; const rows=[...entries].sort((a,b)=>b[4].localeCompare(a[4])); const byId=new Map(rows.map(e=>[e[1],e]));
  return {calls,requestJson:async url=>{
    calls.push(url);const u=new URL(url);assert.ok(!['edit','purge','move','delete'].includes(u.searchParams.get('action')));
    if(url===core.TOP_BLACKLIST_URL&&options.bounds)return {project:'pt.wikipedia.org',source:core.TOP_BLACKLIST_URL,snapshotAt:NOW,excludedTitles:[]};
    if(u.pathname.includes('/pageviews/top/')&&options.bounds){const [year,month,day]=u.pathname.split('/').slice(-3);return {items:[{project:'pt.wikipedia',access:'all-access',year,month,day,articles:Array.from({length:1000},(_,i)=>({article:'Artigo_'+(1100+i),views:1000,rank:1}))}]};}
    if(u.searchParams.get('list')==='usercontribs'){
      const offset=Number(u.searchParams.get('uccontinue')||0),batch=rows.slice(offset,offset+500);
      const r={batchcomplete:true,query:{usercontribs:batch.map(e=>({revid:e[0],pageid:e[1],ns:e[2],title:e[3],timestamp:e[4],new:!!e[5]}))}};
      if(offset+500<rows.length)r.continue={continue:'-||',uccontinue:String(offset+500)};return r;
    }
    if(u.searchParams.get('prop')==='info')return {batchcomplete:true,query:{pages:u.searchParams.get('pageids').split('|').map(Number).map(id=>({pageid:id,ns:0,title:options.title||byId.get(id)[3]}))}};
    if(u.pathname.includes('/per-article/')){
      const p=u.pathname.split('/');const i=p.indexOf('per-article');const title=decodeURIComponent(p[i+4]);const gran=p[i+5];
      const date=s=>s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8);const start=date(p[i+6]),end=date(p[i+7]);
      if(['China','ChatGPT','Portugal'].includes(title)) {
        if(options.noControls)throw new Error('No control');return responseRows(title,start,end,100,gran);
      }
      if(gran==='monthly'){
        if(options.monthly)return options.monthly(title,start,end);throw new Error('No monthly fallback');
      }
      if(options.series)return options.series(title,start,end,url);
      return responseRows(title,start,end,options.count||7);
    }
    throw new Error('No alternate source available');
  }};
}
async function run(entries,options={}){
  const t=transport(entries,options);let state,previous=null;
  for(let round=0;round<20;round++){state=await core.update({requestJson:t.requestJson,now:NOW,config,maxRequests:Infinity,previous});assert.equal(core.validateState(state).valid,true,JSON.stringify(core.validateState(state)));if(state.pageviews.complete||state.pageviews.error||state.pageviews.progress.requests===0)break;previous=state;}
  return {state,t};
}
// Synthetic projections reproduce the former cache schemas without importing an account's data or code.
function legacyScores(current,model=null){
  const state=copy(current),views=state.pageviews;
  if(model===null)delete views.totalModel;else views.totalModel=model;
  for(const id of core.PERIOD_IDS){
    const period=views.periods[id],grand=model==='since-all-eligible-v1'&&id==='since';
    const ranked=period.rows.reduce((sum,row)=>sum+row.views,0);
    period.totalScope=grand?'all-eligible-articles':'ranked-top-1000';
    period.allArticleTotal=grand?Object.values(views.series).reduce((sum,row)=>sum+row.totals[id],0):null;
    period.total=grand?period.allArticleTotal:ranked;
    if(model===null){delete period.rankedTotal;delete period.proof.rankingComplete;delete period.proof.totalComplete;}
    else period.rankedTotal=ranked;
  }
  for(const key of ['period','rows','total','proof','complete','rankingComplete','totalScope','allArticleTotal'])views[key]=copy(views.periods[views.activePeriod][key]);
  if(model===null)delete views.rankedTotal;else views.rankedTotal=views.periods[views.activePeriod].rankedTotal;
  views.lastCompleteSnapshot=null;
  return state;
}
function legacyActivity(current){
  const state=copy(current);state.schemaVersion=3;
  state.pageviews.lastCompleteSnapshot=copy(current.pageviews.lastCompleteSnapshot);
  state.pageviews.lastCompleteSnapshot.metricVersion='unfiltered-legacy-fixture';
  return state;
}
test('All four profiles exclude all traffic before and on the first edited UTC day',async()=>{
  const {state}=await run([edit(1)],{series:(title,start,end)=>responseRows(title,start,end,d=>d<'2026-10-02'?10000:7)});
  for(const id of core.PERIOD_IDS){assert.equal(state.pageviews.periods[id].total,77);const row=state.pageviews.periods[id].rows[0];assert.equal(row.countFromDate,'2026-10-02');assert.equal(row.firstEditAt,'2026-10-01T12:34:56.000Z');}
  assert.equal(state.schemaVersion,4);assert.equal(state.pageviews.metricVersion,'after-first-edit-v1');
});
test('Exact midnight edits use the same consistent next-day cutoff',async()=>{
  const {state}=await run([edit(1,'2026-10-01T00:00:00.000Z')]);assert.equal(state.pageviews.total,77);
});
test('Repeated edits preserve the earliest public edit, while views are requested under the current resolved title',async()=>{
  const {state,t}=await run([edit(1,'2026-05-14T16:52:13.000Z',1,'Old title'),edit(2,'2026-10-12T16:00:00.000Z',1,'Old title')],{title:'Current title'});
  const row=state.pageviews.periods.since.rows[0];assert.equal(row.firstEditAt,'2026-05-14T16:52:13.000Z');assert.equal(row.countFromDate,'2026-05-15');assert.ok(t.calls.some(u=>u.includes('Current_title')));
});
test('An edit after the last completed UTC day has zero eligible days and cannot include prior-title reads',async()=>{
  const {state}=await run([edit(1,'2026-10-13T12:00:00.000Z')],{series:(title,start,end)=>responseRows(title,start,end,100000)});
  for(const id of core.PERIOD_IDS){assert.equal(state.pageviews.periods[id].total,0);assert.equal(state.pageviews.periods[id].rows[0].coveredDays,0);}
});
test('The lifetime source extends before a rolling year and all-time exceeds that year without overlapping counts',async()=>{
  const {state,t}=await run([edit(1,'2024-06-01T12:00:00.000Z')],{count:1});
  assert.equal(state.pageviews.sourcePeriod.start,'2024-06-02');assert.equal(state.pageviews.periods['12m'].total,365);
  assert.equal(state.pageviews.periods['90d'].total,90);assert.equal(state.pageviews.periods['30d'].total,30);
  assert.ok(state.pageviews.periods.since.total>365);assert.ok(t.calls.every(u=>!u.includes('2014')));
});
test('Before-2015 public edits use the supported coverage floor, visibly mark truncation, and require old long-lived controls',async()=>{
  const {state,t}=await run([edit(1,'2014-01-01T12:00:00.000Z')],{count:1});
  assert.equal(state.pageviews.sourcePeriod.start,'2015-07-01');const row=state.pageviews.periods.since.rows[0];assert.equal(row.countFromDate,'2015-07-01');assert.equal(row.coverageTruncated,true);
  assert.equal(state.pageviews.periods.since.proof.truncatedArticles,1);assert.ok(t.calls.some(u=>u.includes('/Portugal/')));assert.ok(!t.calls.some(u=>u.includes('/ChatGPT/')));
});
test('Missing pre-edit bins are known excluded days even when publication controls are unavailable',async()=>{
  const {state}=await run([edit(1)],{noControls:true,series:(title,start,end)=>responseRows(title,'2026-10-02',end,7)});assert.equal(state.pageviews.periods.since.total,77);
});
test('Missing post-edit bins remain unknown without availability proof or complete alternative source',async()=>{
  const {state}=await run([edit(1)],{noControls:true,series:(title,start,end)=>{const r=responseRows(title,start,end,7);r.items=r.items.filter(x=>x.timestamp!=='2026100500');return r;}});
  for(const id of core.PERIOD_IDS){assert.equal(state.pageviews.periods[id].total,null);assert.equal(state.pageviews.periods[id].rankingComplete,false);}
});
test('Malformed observations still invalidate a response even when the bad date would be outside the counted interval',async()=>{
  const {state}=await run([edit(1)],{series:(title,start,end)=>{const r=responseRows(title,start,end,7);r.items.push(r.items[0]);return r;}});assert.equal(state.pageviews.complete,false);
});
test('Monthly fallback queries the clipped effective range instead of entire pre-edit calendar months',async()=>{
  const {state,t}=await run([edit(1)],{noControls:true,series:(title,start,end)=>{const r=responseRows(title,start,end,7);r.items=r.items.filter(x=>x.timestamp!=='2026100500');return r;},monthly:(title,start,end)=>responseRows(title,start,end,7,'monthly')});
  assert.equal(state.pageviews.periods.since.total,77);assert.ok(t.calls.filter(u=>u.includes('/monthly/')).every(u=>u.includes('/2026100200/2026101200')));
});
test('More than one thousand article scores are ranked after their individual first-edit cutoffs',async()=>{
  const entries=Array.from({length:1040},(_,i)=>edit(5000+i,'2026-10-01T12:00:00.000Z',100+i));
  const {state}=await run(entries,{series:(title,start,end)=>responseRows(title,start,end,d=>d<'2026-10-02'?100000:Number(title.split('_')[1]))});
  for(const id of core.PERIOD_IDS){assert.equal(state.pageviews.periods[id].rows.length,1000);assert.equal(state.pageviews.periods[id].rows[0].pageid,1139);}
});
test('Legacy caches migrate only public activity and metadata, never their unfiltered totals or snapshots',async()=>{
  const old=legacyActivity((await run([edit(1)])).state);
  const upgraded=core.upgradeAfterFirstEditCache(old);assert.equal(core.validateState(upgraded).valid,true);assert.equal(upgraded.pageviews.rows.length,0);assert.deepEqual(upgraded.pageviews.series,{});assert.equal(upgraded.pageviews.lastCompleteSnapshot,null);assert.equal(upgraded.pageviews.complete,false);assert.equal(upgraded.activity.entries.length,old.activity.entries.length);
});
test('First-edit candidate or metadata tampering cannot relabel cached filtered scores',async()=>{
  const current=(await run([edit(1)])).state;
  const bad=copy(current);bad.pageviews.candidates[0].firstEditAt='2001-01-01T00:00:00.000Z';assert.equal(core.validateState(bad).valid,false);
  const other=copy(current);other.pageviews.metadata.cohort[0].firstEditAt='2001-01-01T00:00:00.000Z';assert.equal(core.validateState(other).valid,false);
});
test('A fourth-tab selection reuses the complete filtered source without issuing new GETs',async()=>{
  const {state,t}=await run([edit(1)]);const count=t.calls.length;
  const p=await core.collectPageviews({requestJson:t.requestJson,now:NOW,config,previous:state,activity:state.activity,activePeriod:'since',maxRequests:Infinity});assert.equal(t.calls.length,count);assert.equal(p.total,77);assert.equal(p.activePeriod,'since');
});
test('A typed unavailable series is zero only after matching full-source controls and exact endpoint evidence',async()=>{
  const series=(title,start,end,url)=>{const error=new Error('404');Object.assign(error,{status:404,code:404,requestUrl:url,problem:{type:'about:blank',status:404,title:'Not Found',method:'get',uri:new URL(url).pathname.replace('/api/rest_v1','')}});throw error;};
  const good=await run([edit(1)],{series});assert.equal(good.state.pageviews.periods.since.total,0);
  const unknown=await run([edit(1)],{series,noControls:true});assert.equal(unknown.state.pageviews.periods.since.total,null);
});
test('A 503 or generic 404 cannot be turned into post-edit zero traffic by successful controls',async()=>{
  for(const status of [503,404]){const {state}=await run([edit(1)],{series:()=>{const error=new Error('Unavailable');error.status=status;error.code=404;throw error;}});assert.equal(state.pageviews.periods.since.total,null);}
});
test('An old unfiltered prior snapshot cannot be installed as the new semantic fallback',async()=>{
  const current=(await run([edit(1)])).state;
  const old=legacyActivity(current);
  current.pageviews.lastCompleteSnapshot=old.pageviews.lastCompleteSnapshot;
  current.pageviews.lastCompleteSnapshot.periods.since=copy(old.pageviews.periods['12m']);
  assert.equal(core.validateState(current).valid,false);
});
test('Strict V6 and V7 score caches upgrade offline to all-period grand totals while preserving rankings, date captures and first-edit cutoffs',async()=>{
  const current=(await run([edit(1),edit(2)])).state;
  for(const model of [null,'since-all-eligible-v1']){
    const old=legacyScores(current,model);
    const before=JSON.stringify(old),next=core.upgradeAllArticleTotalCache(old);
    assert.equal(JSON.stringify(old),before);assert.equal(next.capturedAt,old.capturedAt);
    for(const id of core.PERIOD_IDS){
      const expected=Object.values(old.pageviews.series).reduce((sum,s)=>sum+s.totals[id],0);
      const p=next.pageviews.periods[id];assert.equal(p.total,expected);assert.equal(p.allArticleTotal,expected);assert.equal(p.totalScope,'all-eligible-articles');
      assert.equal(p.rankedTotal,old.pageviews.periods[id].rankedTotal===undefined?old.pageviews.periods[id].rows.reduce((n,r)=>n+r.views,0):old.pageviews.periods[id].rankedTotal);
      assert.deepEqual(p.rows,old.pageviews.periods[id].rows);assert.deepEqual(p.period,old.pageviews.periods[id].period);
    }
    assert.deepEqual(Object.values(next.pageviews.periods).map(p=>p.total),[154,154,154,154]);
    assert.equal(next.pageviews.totalModel,'all-periods-all-eligible-v1');assert.equal(core.validateState(next).valid,true);
    const bad=copy(old);bad.pageviews.periods['30d'].rows[0].views++;assert.throws(()=>core.upgradeAllArticleTotalCache(bad),/invalid/);
    const other=copy(old);Object.values(other.pageviews.series)[0].totals['90d']++;assert.throws(()=>core.upgradeAllArticleTotalCache(other),/invalid/);
  }
});

test('Proved top-1000 rankings cannot complete any grand total until every weak article is resolved, with each period continuing below the cutoff',async()=>{
  const entries=Array.from({length:1001},(_,i)=>edit(6000+i,'2026-09-01T12:00:00.000Z',1100+i));
  const weak='Artigo_2100';
  const options={noControls:true,bounds:true,series:(title,start,end)=>{
    const r=responseRows(title,start,end,title===weak?1:1000);if(title===weak)r.items=r.items.filter(x=>x.timestamp!=='2026100500');return r;
  },monthly:(title,start,end)=>{assert.equal(title,weak);return responseRows(title,start,end,1,'monthly');}};
  const t=transport(entries,options);
  let state=await core.update({requestJson:t.requestJson,now:NOW,config,maxRequests:1026});
  assert.equal(core.validateState(state).valid,true);
  for(const id of core.PERIOD_IDS){const p=state.pageviews.periods[id];assert.equal(p.rankingComplete,true);assert.equal(p.complete,false);assert.equal(p.total,null);assert.equal(p.allArticleTotal,null);}
  assert.ok(state.pageviews.progress.pending>0);assert.equal(state.pageviews.workPeriod,'30d');assert.equal(state.pageviews.allPeriodsComplete,false);
  for(const id of core.PERIOD_IDS){
    assert.equal(state.pageviews.workPeriod,id,'Each profile with a proved ranking still needs the unknown weak score');
    state=await core.update({requestJson:t.requestJson,now:NOW,config,maxRequests:Infinity,previous:state});
    assert.equal(core.validateState(state).valid,true);assert.equal(state.pageviews.periods[id].complete,true);
    assert.equal(state.pageviews.periods[id].total,id==='30d'?30000030:41000041);
    assert.equal(state.pageviews.periods[id].rankedTotal,id==='30d'?30000000:41000000);
  }
  assert.equal(state.pageviews.allPeriodsComplete,true);
  assert.equal(t.calls.filter(u=>u.includes('/Artigo_2100/monthly/')).length,4,'All four windows must retrieve the weak candidate below the ranking cutoff');
  const refreshTransport=transport(entries,options);
  const pending=await core.update({requestJson:refreshTransport.requestJson,now:NOW,config,maxRequests:1026,previous:state,restartPageviews:true});
  assert.equal(core.validateState(pending).valid,true);
  for(const id of core.PERIOD_IDS){assert.equal(pending.pageviews.periods[id].complete,false);assert.equal(pending.pageviews.lastCompleteSnapshot.periods[id].total,id==='30d'?30000030:41000041);}
  assert.equal(pending.pageviews.lastCompleteSnapshot.totalModel,'all-periods-all-eligible-v1');
});

test('Modern configured Portuguese-Wikipedia owners and time zones retain identity through strict migration',async()=>{
  const owner={...config,user:'Outro Editor',timeZone:'Europe/Lisbon'},entries=[edit(1)];
  const t=transport(entries);
  const current=await core.update({requestJson:t.requestJson,now:NOW,config:owner,maxRequests:Infinity});
  assert.equal(core.validateState(current).valid,true);
  const previous=legacyScores(current,'since-all-eligible-v1');
  const upgraded=core.upgradeAllArticleTotalCache(previous);assert.equal(core.validateState(upgraded).valid,true);
  assert.equal(upgraded.config.user,'Outro Editor');assert.equal(upgraded.config.timeZone,'Europe/Lisbon');assert.equal(upgraded.pageviews.identity.user,'Outro Editor');
});

(async()=>{let failed=0;for(const t of tests){try{await t.run();console.log('PASS '+t.name);}catch(e){failed++;console.error('FAIL '+t.name+'\n'+e.stack);}}console.log((tests.length-failed)+'/'+tests.length+' first-edit regression cases passed');process.exitCode=failed?1:0;})();
