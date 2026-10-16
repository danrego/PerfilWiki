'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const LiveEdit=require('../src/LiveEdit.js'),Configuration=require('../src/Configuration.js'),Appearance=require('../src/Appearance.js');
const USER='Marina Exemplo';
function fixture({loggedUser=USER,blocked=false,raw='<div id="dan-pu-ritmo">Painel</div>',subpageRaw,failRaw=false}={}){
  const listeners=new Map(),timers=new Map(),intervals=new Map(),store=new Map(),requests=[],messages=[],notifications=[],order=[],nodes=new Map();let next=0;
  const button=()=>({style:{},events:new Map(),setAttribute(){},getAttribute(){return null;},addEventListener(type,handler){this.events.set(type,handler);},appendChild(){},querySelector(){return null;},querySelectorAll(){return [];}});
  const cards=button();cards.getAttribute=name=>name==='data-perfilwiki-user'?USER:null;cards.parentNode={insertBefore(node){nodes.set(node.id,node);}};nodes.set('dan-pu-estatisticas',cards);
  const popup={opener:{},closed:false,document:{write:value=>{order.push('blank-document');assert.doesNotMatch(value,/Marina|config|script/);},close(){}},location:{replace:value=>{assert.equal(popup.opener,null);order.push('navigate');popup.url=value;}},postMessage:(data,origin)=>messages.push({data,origin})};
  const document={readyState:'complete',hidden:false,getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>button()};
  const config={wgDBname:'ptwiki',wgAction:'view',wgNamespaceNumber:2,wgUserName:loggedUser,wgRelevantUserName:USER,wgTitle:USER};
  const win={document,navigator:{locks:{request:async(_name,_options,task)=>task()}},location:{hash:''},console,crypto:{getRandomValues:value=>value.fill(17)},
    localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},
    setTimeout:(callback,delay)=>{timers.set(++next,{callback,delay});return next;},clearTimeout:id=>timers.delete(id),setInterval:(callback,delay)=>{intervals.set(++next,{callback,delay});return next;},clearInterval:id=>intervals.delete(id),
    addEventListener:(type,callback)=>{if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(callback);},removeEventListener:(type,callback)=>listeners.get(type)?.delete(callback),
    open:(url,target)=>{assert.equal(url,'about:blank');assert.equal(target,'_blank');order.push('open');return blocked?null:popup;},
    PerfilWikiLiveEdit:LiveEdit,PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiCache:{},PerfilWikiPresenter:{},PerfilWikiActivityView:{paintProfile(){}},PerfilWikiCardsView:{paint(){}},PerfilWikiCoordinator:{},
    PerfilWikiConfig:{user:USER,timeZone:'UTC',displayName:'Marina Pesquisa',location:'[[Belo Horizonte]]',customFields:[{label:'Formação',value:'[[UFMG]]'}],appearance:{showActivity:false}},
    mw:{config:{get:key=>config[key]},notify:(message)=>notifications.push(message),loader:{using:()=>Promise.resolve()},util:{addPortletLink:()=>null}},
    fetch:async(url,options)=>{requests.push({url,options});if(failRaw)throw new Error('offline');const title=new URL(url).searchParams.get('titles');return {ok:true,headers:{get:()=>null},json:async()=>({query:{pages:[{title,revisions:[{revid:title.includes('/PU')?124:123,slots:{main:{content:title.includes('/PU')?subpageRaw:raw}}}]}]}})};}
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),{window:win,Intl,Date,URL,Blob,Set,Map,AbortController});
  return {win,popup,requests,messages,notifications,order,nodes,listeners,timers,intervals,message(data,{origin=LiveEdit.installerOrigin,source=popup}={}){for(const listener of listeners.get('message')||[])listener({data,origin,source});},nonce:()=>new URL(popup.url).hash.split('=')[1]};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('owner editing performs no network before click, detaches popup and sends only to the fixed installer',async()=>{
  const f=fixture();await flush();assert.equal(f.requests.length,0);assert.ok(f.nodes.get('perfilwiki-edit-panel'));
  f.nodes.get('perfilwiki-edit-panel').events.get('click')();await flush();
  assert.deepEqual(f.order,['open','blank-document','navigate']);assert.equal(f.requests.length,1);
  const request=f.requests[0];assert.equal(new URL(request.url).searchParams.get('prop'),'revisions');assert.equal(new URL(request.url).searchParams.get('titles'),'Usuário:'+USER);assert.equal(request.options.method,'GET');assert.equal(request.options.credentials,'omit');assert.equal(request.options.redirect,'error');assert.equal(request.options.referrerPolicy,'no-referrer');assert.doesNotMatch(request.url,/token=|assert|action=edit/);
  assert.doesNotMatch(f.popup.url,/Marina|Pesquisa|UFMG|Belo|config/);assert.equal(f.messages.length,0);
  f.message(LiveEdit.signal('ready',f.nonce()),{origin:'https://evil.test'});f.message(LiveEdit.signal('ready',f.nonce()),{source:{}});assert.equal(f.messages.length,0);
  f.message(LiveEdit.signal('ready',f.nonce()));assert.equal(f.messages.length,1);const transfer=f.messages[0];assert.equal(transfer.origin,LiveEdit.installerOrigin);assert.equal(transfer.data.config.user,USER);assert.equal(transfer.data.config.displayName,'Marina Pesquisa');assert.equal(transfer.data.config.location,'[[Belo Horizonte]]');assert.equal(transfer.data.config.customFields[0].value,'[[UFMG]]');assert.equal(transfer.data.page.revisionId,123);
  assert.equal(f.intervals.size,1);f.message(LiveEdit.signal('accepted',f.nonce()));assert.equal(f.intervals.size,0);assert.equal((f.listeners.get('message')||new Set()).size,0);
  f.message(LiveEdit.signal('ready',f.nonce()));assert.equal(f.messages.length,1);
});

test('anonymous and other-account views cannot expose editing or request page text',async()=>{
  for(const loggedUser of [null,'Outra conta']){const f=fixture({loggedUser});await flush();assert.equal(f.win.PerfilWiki,undefined);assert.equal(f.nodes.has('perfilwiki-edit-panel'),false);assert.equal(f.requests.length,0);assert.equal(f.order.length,0);}
  const blocked=fixture({blocked:true});blocked.win.PerfilWiki.editPanel();await flush();assert.equal(blocked.requests.length,0);assert.equal(blocked.intervals.size,0);assert.match(blocked.notifications[0],/nova aba/);
});

test('raw-page failure opens current settings with no invented public draft and timeout closes listeners',async()=>{
  const f=fixture({failRaw:true});f.win.PerfilWiki.editPanel();await flush();f.message(LiveEdit.signal('ready',f.nonce()));assert.equal(f.messages[0].data.page,null);assert.equal(f.messages[0].data.config.user,USER);
  [...f.timers.values()].find(timer=>timer.delay===LiveEdit.limits.lifetimeMs).callback();assert.equal(f.intervals.size,0);assert.equal((f.listeners.get('message')||new Set()).size,0);assert.match(f.notifications.at(-1),/não respondeu/);
});

test('main-page categories stay on main while an own transcluded PU becomes the edit destination',async()=>{
  const f=fixture({raw:'{{/PU}}\n[[Categoria:Wikipedistas]]',subpageRaw:'== Meus projetos ==\n{{Metas}}\n<div id="dan-pu-ritmo">Painel</div>'});
  // Two queued requests enforce 500ms start spacing. Advance the actual wait
  // callback once, while leaving request timeout and refresh timers inactive.
  f.win.PerfilWiki.editPanel();await flush();
  for(const timer of [...f.timers.values()])if(timer.delay>0&&timer.delay<1000)timer.callback();
  await flush();assert.equal(f.requests.length,2);f.message(LiveEdit.signal('ready',f.nonce()));
  assert.equal(f.messages[0].data.config.destination,'subpage');assert.equal(f.messages[0].data.config.subpage,'PU');assert.equal(f.messages[0].data.page.title,'Usuário:'+USER+'/PU');assert.equal(f.messages[0].data.page.revisionId,124);assert.doesNotMatch(f.messages[0].data.page.content,/Categoria/);
});
