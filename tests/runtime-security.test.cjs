'use strict';
const {createLockManager}=require('./transport-lock-fixture.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Configuration=require('../src/Configuration.js'),Appearance=require('../src/Appearance.js'),Presenter=require('../src/Presenter.js');
const API='https://pt.wikipedia.org/w/api.php?action=query&list=usercontribs';
const AQS='https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/Example/daily/2026100100/2026101400';
const BLACKLIST='https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
const FEED='https://pt.wikipedia.org/api/rest_v1/feed/featured/2026/10/15';
function response(url,data={query:{}},extra={}) {return {ok:true,status:200,url,headers:{get:()=>null},text:async()=>JSON.stringify(data),...extra};}
function runtime({fetcher=(url)=>Promise.resolve(response(url)),store=new Map(),loggedUser='Audit Example',locks=createLockManager(),blockedStorage=false,timeZone='UTC'}={}) {
 let now=Date.parse('2026-10-15T14:42:00.000Z'),sequence=0;const timers=new Map(),events={},calls=[],nodes=new Map();
 class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const data={wgDBname:'ptwiki',wgAction:'view',wgUserName:loggedUser,wgRelevantUserName:'Audit Example',wgNamespaceNumber:2};
 const win={console,PerfilWikiConfig:{user:'Audit Example',timeZone},navigator:{locks},PerfilWikiCoordinator:{},PerfilWikiActivityView:{},PerfilWikiCache:{},PerfilWikiPresenter:Presenter,PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,
  document:{readyState:'complete',getElementById:id=>nodes.get(id)||null,addEventListener:()=>{}},localStorage:{getItem:key=>{if(blockedStorage)throw new Error('Storage blocked');return store.get(key)||null;},setItem:(key,value)=>{if(blockedStorage)throw new Error('Storage blocked');return store.set(key,value);}},
  setTimeout:(fn,delay)=>{const id=++sequence;timers.set(id,{at:now+delay,fn});return id;},clearTimeout:id=>timers.delete(id),setInterval:()=>++sequence,clearInterval:()=>{},addEventListener:(name,fn)=>events[name]=fn,
  mw:{config:{get:key=>data[key]}},fetch:async(url,options)=>{calls.push({url,options,at:now});return fetcher(url,options);}};
 // Test-only access to the real private transport, without changing its inputs,
 // dispatch, scheduler, response reader or production exports.
 const source=fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8').replace('}(window));','window.__requestForTest=requestJson; window.__collectImagesForTest=collectImages; }(window));');
 vm.runInNewContext(source,{window:win,URL,Intl,Date:Clock,Set,Map,AbortController,TextDecoder});
 const settle=async()=>{for(let turn=0;turn<15;turn++)await Promise.resolve();};
 async function tick(milliseconds){now+=milliseconds;for(const [id,timer] of [...timers]){if(timer.at<=now){timers.delete(id);timer.fn();}}await settle();}
 return {win,calls,events,store,timers,tick,settle,nodes,request:win.__requestForTest,setNow:value=>{now=value;}};
}

test('all public transport sources reject redirects, omit credentials and referrers, with a nonpersonal ASCII API user agent only on Action API',async()=>{
 const r=runtime({fetcher:async url=>url===BLACKLIST?response(url,null,{text:async()=>''}):response(url)});
 for(const url of [API,AQS,BLACKLIST,FEED]) {await r.tick(500);await r.request(url);}
 assert.equal(r.calls.length,4);
 for(const {url,options} of r.calls) {assert.equal(options.method,'GET');assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');assert.equal(options.redirect,'error');assert.equal(options.body,undefined);assert.equal(options.cache,'no-store');assert.ok(options.signal);if(url===API){const agent=options.headers['Api-User-Agent'];assert.match(agent,/^PerfilWiki\/1\.20\.0 \(https:\/\/github\.com\/danrego\/PerfilWiki\)$/);assert.doesNotMatch(agent,/[^\x20-\x7e]|Audit/);}else assert.equal(options.headers,undefined);}
});
test('redirected, opaque and changed-destination responses fail before their bodies are read',async()=>{
 for(const extra of [{redirected:true},{type:'opaqueredirect'},{type:'opaque'},{url:'https://outside.invalid/final'},{url:API.replace('pt.wikipedia.org','en.wikipedia.org')}]) {
  let read=false;const r=runtime({fetcher:async url=>response(url,{}, {...extra,text:async()=>{read=true;return '{}';}})});
  await assert.rejects(r.request(API),/redirecionada/);assert.equal(read,false);
 }
});
test('declared oversized bodies fail before parsing and stream bodies cancel as soon as bytes exceed the limit',async()=>{
 let read=false;const declared=runtime({fetcher:async url=>response(url,{}, {headers:{get:key=>key.toLowerCase()==='content-length'?'8388609':null},text:async()=>{read=true;return '{}';}})});
 await assert.rejects(declared.request(API),error=>error.code==='response-too-large');assert.equal(read,false);
 let cancelled=0,released=0,index=0;const chunks=[new Uint8Array(4194304),new Uint8Array(4194304),new Uint8Array(1)];
 const streamed=runtime({fetcher:async url=>response(url,{}, {body:{getReader:()=>({read:async()=>index<chunks.length?{done:false,value:chunks[index++]}:{done:true},cancel:async()=>{cancelled++;},releaseLock:()=>{released++;}})}})});
 await assert.rejects(streamed.request(API),error=>error.code==='response-too-large');assert.equal(index,3);assert.equal(cancelled,1);assert.equal(released,1);
});
test('streaming UTF-8 is decoded across chunk boundaries and fallback bounds count bytes, including multibyte text',async()=>{
 const bytes=new TextEncoder().encode('{"query":{"text":"coração"}}');let index=0;
 const r=runtime({fetcher:async url=>response(url,{}, {body:{getReader:()=>({read:async()=>index<bytes.length?{done:false,value:bytes.slice(index,index+=1)}:{done:true},releaseLock(){}})}})});
 assert.equal((await r.request(API)).query.text,'coração');
 const oversized=runtime({fetcher:async url=>response(url,{}, {text:async()=>JSON.stringify({query:'字'.repeat(2800000)})})});await assert.rejects(oversized.request(API),error=>error.code==='response-too-large');
 const blacklist=runtime({fetcher:async url=>response(url,{}, {text:async()=> 'pt.wikipedia\t'+'字'.repeat(90000)})});await assert.rejects(blacklist.request(BLACKLIST),error=>error.code==='response-too-large');
});
test('only one public request runs at a time and successive starts remain at least 500 milliseconds apart',async()=>{
 let pending=[];const r=runtime({fetcher:(url)=>new Promise(resolve=>pending.push(()=>resolve(response(url))))});
 const first=r.request(API),second=r.request(AQS),third=r.request(FEED);await r.settle();assert.equal(r.calls.length,1);
 pending.shift()();await first;await r.settle();assert.equal(r.calls.length,1);await r.tick(499);assert.equal(r.calls.length,1);await r.tick(1);assert.equal(r.calls.length,2);
 pending.shift()();await second;await r.settle();await r.tick(500);assert.equal(r.calls.length,3);pending.shift()();await third;
 assert.ok(r.calls.every((call,index)=>index===0||call.at-r.calls[index-1].at>=500));
});
test('a slow Action API response adds a five-second pause before the next Action API request and shares its deadline across tabs',async()=>{
 let complete;const store=new Map(),r=runtime({store,fetcher:url=>new Promise(resolve=>complete=()=>resolve(response(url)))});
 const first=r.request(API);await r.settle();await r.tick(1501);complete();await first;
 const next=r.request(API);await r.settle();await r.tick(4999);assert.equal(r.calls.length,1);await r.tick(1);assert.equal(r.calls.length,2);complete();await next;
 const other=runtime({store});other.setNow(r.calls[1].at-5000);const shared=other.request(API);await other.settle();assert.equal(other.calls.length,0);await other.tick(5500);assert.equal(other.calls.length,1);await shared;
});
test('API-body rate and lag errors honor Retry-After and a manual retry cannot dispatch during the shared pause',async()=>{
 for(const code of ['maxlag','ratelimited','rate-limited']) {
  let attempts=0;const r=runtime({fetcher:async url=>++attempts===1?response(url,{error:{code}},{headers:{get:key=>key.toLowerCase()==='retry-after'?'60':null}}):response(url)});
  await assert.rejects(r.request(API),error=>error.code===code);await assert.rejects(r.request(API),/pausa/);assert.equal(r.calls.length,1);
  await r.tick(59999);await assert.rejects(r.request(API),/pausa/);assert.equal(r.calls.length,1);await r.tick(1);await r.request(API);assert.equal(r.calls.length,2);
 }
});
test('HTTP rate limits preserve a date-form Retry-After pause across tabs and malformed retry values use the five-minute fallback',async()=>{
 for(const retry of ['Thu, 15 Oct 2026 14:43:00 GMT','not-a-date']) {
  const store=new Map(),r=runtime({store,fetcher:async url=>response(url,{}, {ok:false,status:429,headers:{get:key=>key.toLowerCase()==='retry-after'?retry:null}})});
  await assert.rejects(r.request(API),error=>error.code===429);const other=runtime({store});await assert.rejects(other.request(API),/pausa/);assert.equal(other.calls.length,0);
  const delay=retry==='not-a-date'?300000:60000;await other.tick(delay);await other.request(API);assert.equal(other.calls.length,1);
 }
});
test('page suspension aborts active requests and queued rate-delay waits without dispatching their successors',async()=>{
 const r=runtime({fetcher:(_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>{const error=new Error('aborted');error.code='aborted';reject(error);} ))});
 const first=r.request(API),second=r.request(API),third=r.request(AQS);const all=Promise.allSettled([first,second,third]);await r.settle();assert.equal(r.calls.length,1);r.events.pagehide();const results=await all;assert.ok(results.every(result=>result.status==='rejected'));assert.equal(r.calls.length,1);assert.equal(r.calls[0].options.signal.aborted,true);
 const waiting=runtime();await waiting.request(API);const task=waiting.request(API),settled=Promise.allSettled([task]);await waiting.settle();assert.equal(waiting.calls.length,1);waiting.events.pagehide();assert.equal((await settled)[0].status,'rejected');assert.equal(waiting.calls.length,1);
});
test('foreign accounts cannot initialize the runtime or expose its private test transport',()=>{const r=runtime({loggedUser:'Another Example'});assert.equal(r.win.PerfilWiki,undefined);assert.equal(r.request,undefined);assert.equal(r.calls.length,0);});


test('thumbnail metadata dispatches at most once in a collection cycle even if the displayed ranking changes',async()=>{
 let pageid=1;const r=runtime({fetcher:async url=>response(url,{query:{pages:[]}})});
 const slot={getAttribute:key=>key==='data-pageid'?String(pageid):'Article '+pageid,querySelector:()=>null};
 r.nodes.set('dan-pu-ritmo',{querySelectorAll:()=>[slot]});
 await r.win.__collectImagesForTest();assert.equal(r.calls.length,1);
 pageid=2;await r.tick(500);await r.win.__collectImagesForTest();assert.equal(r.calls.length,1);
 assert.equal([...r.timers.values()].some(timer=>timer.at>0),false,'An exhausted metadata allowance does not create a recurring polling timer');
});

test('the twenty-second request timeout aborts transport, releases the serial slot and allows later requests',async()=>{
 let attempts=0;const r=runtime({fetcher:(url,options)=>++attempts>1?Promise.resolve(response(url)):new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>{const error=new Error('Timed out');error.name='AbortError';reject(error);} ))});
 const first=r.request(API),settled=Promise.allSettled([first]);await r.settle();await r.tick(20000);assert.equal((await settled)[0].status,'rejected');assert.equal(r.calls[0].options.signal.aborted,true);
 const second=r.request(API);await r.settle();await r.tick(5000);await second;assert.equal(r.calls.length,2);
});

test('independent owner runtimes with different timezones serialize startup thumbnail bodies through the same origin transport lock',async()=>{
 const locks=createLockManager(),store=new Map();let releaseBody,activeBodies=0,maxBodies=0;
 const first=runtime({locks,store,fetcher:async url=>{activeBodies++;maxBodies=Math.max(maxBodies,activeBodies);return response(url,{}, {text:()=>new Promise(resolve=>releaseBody=()=>{activeBodies--;resolve('{"query":{"pages":[]}}');})});}});
 const second=runtime({locks,store,timeZone:'Asia/Tokyo',fetcher:async url=>{activeBodies++;maxBodies=Math.max(maxBodies,activeBodies);activeBodies--;return response(url,{query:{pages:[]}});}});
 const slot={getAttribute:key=>key==='data-pageid'?'1':'Article Example',querySelector:()=>null};
 for(const r of [first,second])r.nodes.set('dan-pu-ritmo',{querySelectorAll:()=>[slot]});
 const one=first.win.__collectImagesForTest();await first.settle();assert.equal(first.calls.length,1);
 const two=second.win.__collectImagesForTest();await second.settle();assert.equal(second.calls.length,0,'The second tab cannot fetch even after first headers arrive while its body is pending');
 releaseBody();await one;await second.settle();assert.equal(second.calls.length,0);await second.tick(500);await two;
 assert.equal(second.calls.length,1);assert.equal(maxBodies,1);assert.equal(second.calls[0].at-first.calls[0].at,500);
});
test('slow Action API deadlines cross account-timezone cache boundaries under the global origin lock',async()=>{
 const locks=createLockManager(),store=new Map();let finish;
 const first=runtime({locks,store,fetcher:url=>new Promise(resolve=>finish=()=>resolve(response(url)))}),second=runtime({locks,store,timeZone:'Asia/Tokyo'});
 const one=first.request(API);await first.settle();await first.tick(1501);finish();await one;second.setNow(first.calls[0].at+1501);
 const two=second.request(API);await second.settle();await second.tick(4999);assert.equal(second.calls.length,0);await second.tick(1);await two;assert.equal(second.calls.length,1);
});
test('without Web Locks a settled shared transport lease refuses overlapping dispatches and releases for a later tab',async()=>{
 const store=new Map();let finish;const first=runtime({locks:null,store,fetcher:url=>new Promise(resolve=>finish=()=>resolve(response(url)))}),second=runtime({locks:null,store});
 const one=first.request(API);await first.settle();assert.equal(first.calls.length,0);await first.tick(50);assert.equal(first.calls.length,1);
 await assert.rejects(second.request(API),/pausada/);assert.equal(second.calls.length,0);finish();await one;
 const two=second.request(API);await second.settle();await second.tick(50);await second.tick(500);await two;assert.equal(second.calls.length,1);
 assert.equal(JSON.parse(store.get('perfilwiki-transport-v1-bloqueio')).expires,0);
});
test('blocked storage keeps in-memory collection with Web Locks by holding the serial lock through minimum spacing',async()=>{
 const locks=createLockManager(),first=runtime({locks,blockedStorage:true}),second=runtime({locks,blockedStorage:true});
 const one=first.request(API);await first.settle();assert.equal(first.calls.length,1);
 const two=second.request(API);await second.settle();assert.equal(second.calls.length,0);await first.tick(499);assert.equal(second.calls.length,0);
 second.setNow(first.calls[0].at+500);await first.tick(1);await one;await second.settle();assert.equal(second.calls.length,1);await second.tick(500);await two;
 assert.equal(second.calls[0].at-first.calls[0].at,500);
});
test('blocked storage retains an API Retry-After pause inside the Web Lock while the first page remains open',async()=>{
 const locks=createLockManager(),first=runtime({locks,blockedStorage:true,fetcher:async url=>response(url,{error:{code:'ratelimited'}},{headers:{get:key=>key.toLowerCase()==='retry-after'?'60':null}})}),second=runtime({locks,blockedStorage:true});
 const one=first.request(API),result=Promise.allSettled([one]);await first.settle();const two=second.request(API);await second.settle();assert.equal(second.calls.length,0);
 await first.tick(59999);assert.equal(second.calls.length,0);second.setNow(first.calls[0].at+60000);await first.tick(1);assert.equal((await result)[0].status,'rejected');await second.settle();assert.equal(second.calls.length,1);await second.tick(500);await two;
});
test('when Web Locks and shared storage are both unavailable the runtime retains data without dispatching an uncoordinated request',async()=>{
 const r=runtime({locks:null,blockedStorage:true});await assert.rejects(r.request(API),/pausada/);assert.equal(r.calls.length,0);
});

test('page suspension cancels a waiting cross-tab Web Lock without disturbing the active owner request',async()=>{
 const locks=createLockManager(),store=new Map();let complete;
 const first=runtime({locks,store,fetcher:url=>new Promise(resolve=>complete=()=>resolve(response(url)))}),second=runtime({locks,store});
 const one=first.request(API);await first.settle();const two=second.request(API),settled=Promise.allSettled([two]);await second.settle();assert.equal(second.calls.length,0);
 second.events.pagehide();assert.equal((await settled)[0].status,'rejected');assert.equal(second.calls.length,0);assert.equal(first.calls[0].options.signal.aborted,false);complete();await one;assert.equal(second.calls.length,0);
});
test('a slow Action API read with blocked storage holds the shared Web Lock for five seconds after the response',async()=>{
 const locks=createLockManager();let complete;
 const first=runtime({locks,blockedStorage:true,fetcher:url=>new Promise(resolve=>complete=()=>resolve(response(url)))}),second=runtime({locks,blockedStorage:true});
 const one=first.request(API);await first.settle();const two=second.request(API);await second.settle();await first.tick(1501);complete();await first.settle();
 await first.tick(4999);assert.equal(second.calls.length,0);second.setNow(first.calls[0].at+6501);await first.tick(1);await one;await second.settle();assert.equal(second.calls.length,1);await second.tick(500);await two;
});
