'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const Core=require('../src/PageviewsCore.js');
const Appearance=require('../src/Appearance.js');
const Configuration=require('../src/Configuration.js');
const Presenter=require('../src/Presenter.js');
const USER='Marina Exemplo',NOW='2026-10-15T14:42:00.000Z';
class Clock extends Date {constructor(...args){super(...(args.length?args:[NOW]));}static now(){return Date.parse(NOW);}}
class Node {
 constructor(id='',attributes={}){this.id=id;this.attributes=attributes;this.style={};this.children=[];this.events={};this.textContent='';this.value='';}
 getAttribute(key){return this.attributes[key]??null;}setAttribute(key,value){this.attributes[key]=String(value);}removeAttribute(key){delete this.attributes[key];}
 addEventListener(type,listener){this.events[type]=listener;}appendChild(node){this.children.push(node);return node;}
 focus(){if(this.ownerDocument)this.ownerDocument.activeElement=this;}
 querySelector(selector){if(selector[0]==='#')return this.children.find(child=>child.id===selector.slice(1))||null;if(selector==='a')return this.children.find(child=>child.tagName==='a')||null;return null;}
 querySelectorAll(){return[];}
}
function runtime(){
 const appearance={showCards:false,showActivity:true},resolved=Configuration.resolve({config:{get:()=>USER}},{PerfilWikiConfig:{user:USER,timeZone:'UTC',appearance}});
 const entries=[[1,1,0,'Artigo Exemplo','2026-10-01T12:00:00.000Z',0]];
 const state={config:resolved.metrics,capturedAt:NOW,activity:{complete:true,entries,capturedAt:NOW,summary:Core.summarize(entries,{config:resolved.metrics,now:NOW})},
  statistics:{user:USER,metrics:{},errors:[],pending:false},pageviews:{allPeriodsComplete:true,periods:Object.fromEntries(Core.PERIOD_IDS.map(id=>[id,{complete:true,rows:[]}])),progress:{pending:0}},fresh:true};
 const panel=new Node('dan-pu-ritmo',{'data-perfilwiki-user':USER}),form=new Node('dan-pu-custom-form'),button=new Node('dan-pu-custom-apply');button.form=form;
 const start=new Node('dan-pu-custom-start'),end=new Node('dan-pu-custom-end'),error=new Node('dan-pu-custom-error');
 const nodes=new Map([panel,form,button,start,end,error].map(node=>[node.id,node]));
 const store=new Map([['perfilwiki-v1-'+encodeURIComponent(USER)+'-UTC-cache',JSON.stringify(state)]]),updates=[],rendered=[];let sendProgress=false;
 const document={readyState:'complete',hidden:false,getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener:()=>{},createElement:tag=>{const node=new Node();node.tagName=tag;return node;}};
 Object.defineProperty(panel,'outerHTML',{set:()=>{
  const settings=rendered[rendered.length-1].appearance,range=settings.customRange||Core.periodsFor(NOW)['30d'];
  const form=new Node('dan-pu-custom-form'),button=new Node('dan-pu-custom-apply'),start=new Node('dan-pu-custom-start'),end=new Node('dan-pu-custom-end'),error=new Node('dan-pu-custom-error');
  button.form=form;start.value=range.start;end.value=range.end;
  for(const node of [form,button,start,end,error]){node.ownerDocument=document;nodes.set(node.id,node);}
  document.activeElement=null;
 }});
 const mwConfig={wgDBname:'ptwiki',wgAction:'view',wgUserName:USER,wgRelevantUserName:USER,wgNamespaceNumber:2};
 const win={document,console,location:{hash:''},navigator:{},PerfilWikiConfig:{user:USER,timeZone:'UTC',appearance},
  PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiPresenter:Presenter,PerfilWikiCache:{parseJson:JSON.parse},
  PerfilWikiActivityView:{html:(value,options)=>{rendered.push(options);return'rendered local fixture';}},
  PerfilWikiCoordinator:{normalizeCustomRange:Core.normalizeCustomRange,periodsFor:Core.periodsFor,validateState:()=>({valid:true}),update:async options=>{
   updates.push(options);const result={...state,pageviews:{...state.pageviews,customRange:options.customRange,periods:{...state.pageviews.periods,custom:{complete:true,rows:[]}},customProgress:{pending:0,resumable:false}}};
   if(sendProgress)await options.onProgress(result);return result;}},
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{},addEventListener:()=>{},
  fetch:()=>assert.fail('Runtime controls must use only the supplied offline collector'),
  mw:{config:{get:key=>mwConfig[key]},loader:{using:()=>Promise.resolve()},util:{addPortletLink:()=>null}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),{window:win,Intl,Date:Clock,URL,Blob,Set,Map,AbortController});
 return{win,document,get start(){return nodes.get('dan-pu-custom-start');},get end(){return nodes.get('dan-pu-custom-end');},get error(){return nodes.get('dan-pu-custom-error');},
  get button(){return nodes.get('dan-pu-custom-apply');},get form(){return nodes.get('dan-pu-custom-form');},updates,rendered,progressOn(){sendProgress=true;}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('Runtime applies valid custom dates only on the explicit form action and prioritizes that interval',async()=>{
 const r=runtime();assert.equal(r.updates.length,0);
 r.start.value='2026-10-03';r.end.value='2026-10-08';
 let prevented=0;r.button.events.click({preventDefault(){prevented++;}});await tick();
 assert.equal(prevented,1);assert.equal(r.updates.length,1);
 assert.deepEqual(JSON.parse(JSON.stringify(r.updates[0].customRange)),{start:'2026-10-03',end:'2026-10-08'});
 assert.equal(r.updates[0].activePeriod,'custom');assert.equal(r.error.textContent,'');
 assert.equal(r.win.PerfilWiki.getAppearance().initialPeriod,'custom');assert.equal(r.start.getAttribute('aria-invalid'),'false');
 r.start.value='2026-10-04';r.end.value='2026-10-09';
 r.form.events.submit({preventDefault(){prevented++;}});await tick();
 assert.equal(prevented,2);assert.equal(r.updates.length,2);assert.equal(r.updates[1].customRange.start,'2026-10-04');
});

test('Runtime rejects impossible, reversed and incomplete UTC dates before collecting or changing saved choices',async()=>{
 const r=runtime();
 for(const [start,end]of[['2026-02-30','2026-10-08'],['2026-10-09','2026-10-01'],['2026-10-01','2026-10-15'],['','2026-10-08']]){
  r.start.value=start;r.end.value=end;r.button.events.click({preventDefault(){}});await tick();
  assert.equal(r.updates.length,0);assert.equal(r.win.PerfilWiki.getAppearance().customRange,null);
  assert.match(r.error.textContent,/datas completas/);assert.equal(r.start.getAttribute('aria-invalid'),'true');
 }
});

test('progress repaint preserves an unsubmitted same-owner date draft, focus and validation error',async()=>{
 const r=runtime();r.start.value='2026-10-03';r.end.value='2026-10-08';r.button.events.click({preventDefault(){}});await tick();
 r.start.value='2026-10-06';r.end.value='2026-10-09';r.error.textContent='Confira a data antes de aplicar.';r.start.setAttribute('aria-invalid','true');r.start.focus();
 const old=r.start;r.progressOn();await r.win.PerfilWiki.refresh();
 assert.notEqual(r.start,old,'The fixture actually replaces the input during repaint');
 assert.equal(r.start.value,'2026-10-06');assert.equal(r.end.value,'2026-10-09');
 assert.equal(r.error.textContent,'Confira a data antes de aplicar.');assert.equal(r.start.getAttribute('aria-invalid'),'true');assert.equal(r.document.activeElement,r.start);
 assert.equal(r.win.PerfilWiki.getAppearance().customRange.start,'2026-10-03','An unsubmitted draft must not become the applied range');
 r.button.events.click({preventDefault(){}});await tick();
 assert.equal(r.win.PerfilWiki.getAppearance().customRange.start,'2026-10-06');assert.equal(r.error.textContent,'');assert.equal(r.start.getAttribute('aria-invalid'),'false');
});

test('Presenter collects the custom top ten and permits their fifth-period thumbnail batch',()=>{
 const rows=Array.from({length:50},(_,index)=>({pageid:index+1,title:'Artigo '+index,views:50-index}));
 const state={pageviews:{periods:Object.fromEntries([...Core.PERIOD_IDS,'custom'].map((id,index)=>[id,{complete:true,rows:rows.slice(index*10,index*10+10)}]))}};
 const featured=Presenter.featuredArticles(state);assert.equal(featured.length,50);
 const url=new URL(Presenter.imageRequest(featured));assert.equal(url.searchParams.get('pageids').split('|').length,50);
 assert.equal(Presenter.imageRequest(featured.concat([{pageid:51,title:'Extra'}])),null);
});
