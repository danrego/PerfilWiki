'use strict';
const {createLockManager}=require('./transport-lock-fixture.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Configuration=require('../src/Configuration.js'),Appearance=require('../src/Appearance.js'),Cache=require('../src/Cache.js'),Presenter=require('../src/Presenter.js'),Daily=require('../src/DailyCover.js'),Header=require('../src/ProfileHeaderView.js');
const USER='Marina Exemplo',NOW='2026-10-15T14:42:00.000Z',FEED={image:{title:'File:Daily example.jpg',artist:{text:'Autora'},license:{type:'CC BY-SA 4.0'}}};
class Node{
 constructor(id='',attrs={}){this.id=id;this.attributes=attrs;this.style={};this.children=[];this.events={};this.hidden=false;this.textContent='';}
 getAttribute(key){return this.attributes[key]??null;}setAttribute(key,value){this.attributes[key]=String(value);}removeAttribute(key){delete this.attributes[key];}
 querySelector(){return null;}querySelectorAll(){return [];}appendChild(node){this.children.push(node);node.parentNode=this;return node;}addEventListener(type,fn){this.events[type]=fn;}click(){}
}
function runtime({coverSource='daily',cachedCover=null,savedCover=null,now=NOW,hidden=false,hiddenTop=false,loggedUser=USER,sharedStore=null,coreFailure=false,reply=async()=>({ok:true,json:async()=>FEED})}={}){
 let instant=Date.parse(now),id=0;const timers=new Map(),events={},calls=[],updates=[],headers=[],downloads=[];
 class Clock extends Date{constructor(...args){super(...(args.length?args:[instant]));}static now(){return instant;}}
 const input={user:USER,timeZone:'UTC',coverImage:'Preserved manual.jpg',appearance:{coverSource,showActivity:false}},resolved=Configuration.resolve({config:{get:()=>USER}},{PerfilWikiConfig:input});
 let state={config:resolved.metrics,capturedAt:new Clock().toISOString(),activity:{complete:true,entries:[],summary:{}},statistics:{user:USER,metrics:{},errors:[],pending:false},pageviews:{allPeriodsComplete:true,periods:{},progress:{pending:0}},fresh:true};
 const prefix='perfilwiki-v1-'+encodeURIComponent(USER)+'-UTC-',store=sharedStore||new Map([[prefix+'cache',Cache.packJson(JSON.stringify(state))]]);if(cachedCover)store.set(prefix+'daily-cover-v1',JSON.stringify(cachedCover));
 const cards=new Node('dan-pu-estatisticas',{'data-perfilwiki-user':USER}),top=new Node('dan-pu-profile-header',{'data-perfilwiki-user':USER,'data-perfilwiki-profile-top':'true'});top.hidden=hiddenTop;
 if(savedCover)top.querySelector=selector=>selector==='.dan-pu-profile-cover'?new Node('',{'data-perfilwiki-daily-cover':JSON.stringify(savedCover)}):null;
 const nodes=new Map([[cards.id,cards],[top.id,top]]),document={hidden,readyState:'complete',getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn,createElement:tag=>{const node=new Node();node.tagName=tag;return node;}};
 class LocalURL extends URL{static createObjectURL(blob){downloads.push(blob);return 'blob:daily-cover-test';}static revokeObjectURL(){}}
 const config={wgDBname:'ptwiki',wgAction:'view',wgUserName:loggedUser,wgRelevantUserName:USER,wgNamespaceNumber:2};
 const win={document,console:{warn(){}},location:{hash:''},navigator:{locks:createLockManager()},PerfilWikiConfig:input,PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiDailyCover:Daily,PerfilWikiCache:Cache,PerfilWikiPresenter:Presenter,
  PerfilWikiActivityView:{paintProfile(){},wikitext(){return '';},html(){return '';}},PerfilWikiCardsView:{paint(){},wikitext(){return '<div>Contadores</div>';}},
  PerfilWikiProfileHeaderView:{paint(_doc,_state,presentation){headers.push(presentation);},wikitext:Header.wikitext},
  PerfilWikiCoordinator:{validateState:()=>({valid:true}),update:async options=>{updates.push(options);if(coreFailure)throw new Error('Synthetic metrics failure');state={...state,capturedAt:new Clock().toISOString()};return state;}},
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},setTimeout:(fn,delay)=>{const key=++id;timers.set(key,{fn,delay});return key;},clearTimeout:key=>timers.delete(key),setInterval:()=>++id,clearInterval(){},addEventListener:(name,fn)=>events[name]=fn,
  fetch:async(url,options)=>{calls.push({url,options});return reply(url,options);},mw:{config:{get:key=>config[key]},loader:{using:()=>Promise.resolve()},util:{addPortletLink:()=>null}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),{window:win,Intl,Date:Clock,URL:LocalURL,Blob,AbortController,Set,Map});
 return {win,calls,updates,headers,store,prefix,timers,events,downloads,setNow:value=>{instant=Date.parse(value);},top};
}
const yesterday=()=>Daily.fromFeed({image:{title:'File:Yesterday.jpg'}},'2026-10-14','2026-10-14T12:00:00.000Z');
test('daily lookup uses one anonymous GET per UTC day and preserves metrics and choices identity',async()=>{
 const r=runtime();await r.win.PerfilWiki.refresh();await r.win.PerfilWiki.refresh();
 assert.equal(r.calls.length,1);assert.equal(r.calls[0].url,'https://pt.wikipedia.org/api/rest_v1/feed/featured/2026/10/15');
 const options=r.calls[0].options;assert.equal(options.method,'GET');assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');assert.equal(options.redirect,'error');assert.ok(options.signal);assert.equal(options.body,undefined);
 assert.equal(r.updates[0].maxRequests,39);assert.equal(r.updates[1].maxRequests,40);assert.equal(Object.hasOwn(r.updates[0].config,'coverSource'),false);
 const proof=JSON.parse(r.store.get(r.prefix+'daily-cover-v1'));assert.equal(proof.filename,'Daily example.jpg');assert.equal(r.headers.at(-1).dailyCover.filename,'Daily example.jpg');
 r.win.PerfilWiki.downloadCards();r.win.PerfilWiki.downloadChoices();const wiki=await r.downloads[0].text(),choices=JSON.parse(await r.downloads[1].text());assert.match(wiki,/Daily example.jpg/);assert.match(wiki,/Ver arquivo e créditos/);assert.equal(choices.appearance.coverSource,'daily');assert.equal(choices.coverImage,'Preserved manual.jpg');assert.equal(Object.hasOwn(choices,'dailyCover'),false);
});
test('manual, hidden document, hidden top and foreign accounts never fetch a daily image',async()=>{
 for(const option of [{coverSource:'manual'},{hidden:true},{hiddenTop:true},{loggedUser:'Outra pessoa'}]){const r=runtime(option);if(r.win.PerfilWiki)await r.win.PerfilWiki.refresh();assert.equal(r.calls.length,0,JSON.stringify(option));}
});
test('valid daily cache and saved owned metadata repaint immediately without another daily lookup',async()=>{
 const proof=Daily.fromFeed(FEED,'2026-10-15',NOW);
 for(const option of [{cachedCover:proof},{savedCover:proof}]){const r=runtime(option);assert.equal(r.headers.at(-1).dailyCover.filename,'Daily example.jpg');await r.win.PerfilWiki.refresh();assert.equal(r.calls.length,0);}
});
test('failed or malformed feeds retain yesterday and retry only after the five-minute cooldown',async()=>{
 for(const reply of [async()=>({ok:false,status:503,headers:{get:()=>null}}),async()=>({ok:true,json:async()=>({image:{title:'File:Bad.jpg|unsafe'}})})]){
  const r=runtime({cachedCover:yesterday(),reply});await r.win.PerfilWiki.refresh();await r.win.PerfilWiki.refresh();assert.equal(r.calls.length,1);assert.equal(r.headers.at(-1).dailyCover.filename,'Yesterday.jpg');
  r.setNow('2026-10-15T14:47:00.001Z');await r.win.PerfilWiki.refresh();assert.equal(r.calls.length,2);assert.equal(JSON.parse(r.store.get(r.prefix+'daily-cover-v1')).filename,'Yesterday.jpg');
 }
});
test('the existing scheduler wakes at UTC midnight and only refreshes the cover when metrics are still fresh',async()=>{
 const r=runtime({now:'2026-10-15T23:59:59.000Z'});await r.win.PerfilWiki.refresh();assert.equal(r.calls.length,1);const updates=r.updates.length;
 const boundary=[...r.timers.values()].find(timer=>timer.delay===1050);assert.ok(boundary);r.setNow('2026-10-16T00:00:00.050Z');boundary.fn();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(r.calls.length,2);assert.equal(r.calls[1].url,'https://pt.wikipedia.org/api/rest_v1/feed/featured/2026/10/16');assert.equal(r.updates.length,updates);assert.equal(JSON.parse(r.store.get(r.prefix+'daily-cover-v1')).date,'2026-10-16');
});
test('concurrent refreshes share one daily request and page suspension aborts without replacing last good data',async()=>{
 let started;const ready=new Promise(resolve=>started=resolve);
 const r=runtime({cachedCover:yesterday(),reply:(_url,options)=>new Promise((_resolve,reject)=>{options.signal.addEventListener('abort',()=>{const error=new Error('aborted');error.code='aborted';reject(error);});started();})});
 const first=r.win.PerfilWiki.refresh();await ready;await r.win.PerfilWiki.refresh();assert.equal(r.calls.length,1);r.events.pagehide();await first;assert.equal(r.calls[0].options.signal.aborted,true);assert.equal(JSON.parse(r.store.get(r.prefix+'daily-cover-v1')).filename,'Yesterday.jpg');
});

test('simultaneous tabs share the existing account lease and reuse the same-day cover cache',async()=>{
 const sharedStore=new Map();let complete;const response=new Promise(resolve=>complete=resolve);
 const first=runtime({sharedStore,reply:()=>response}),second=runtime({sharedStore});
 const task=first.win.PerfilWiki.refresh();await second.win.PerfilWiki.refresh();assert.equal(first.calls.length,1);assert.equal(second.calls.length,0);
 complete({ok:true,json:async()=>FEED});await task;await second.win.PerfilWiki.refresh();assert.equal(second.calls.length,0);assert.equal(second.headers.at(-1).dailyCover.filename,'Daily example.jpg');
});
test('a metrics failure retains the account lease until its optional daily request has settled',async()=>{
 let complete;const response=new Promise(resolve=>complete=resolve),r=runtime({coreFailure:true,reply:()=>response});
 const task=r.win.PerfilWiki.refresh();await new Promise(resolve=>setImmediate(resolve));assert.ok(JSON.parse(r.store.get(r.prefix+'bloqueio')).expires>Date.parse(NOW));
 complete({ok:true,json:async()=>FEED});await task;assert.equal(JSON.parse(r.store.get(r.prefix+'bloqueio')).expires,0);assert.equal(JSON.parse(r.store.get(r.prefix+'daily-cover-v1')).filename,'Daily example.jpg');
});
