'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Coordinator=require('../src/Coordinator.js'),Cache=require('../src/Cache.js'),Configuration=require('../src/Configuration.js'),Appearance=require('../src/Appearance.js'),Presenter=require('../src/Presenter.js');
const USER='Editora Exemplo',NOW='2026-10-15T14:42:00.000Z',DAY=86400000;
const prefix='perfilwiki-v1-'+encodeURIComponent(USER)+'-UTC-',clone=value=>JSON.parse(JSON.stringify(value));
const done=query=>({batchcomplete:true,query});
async function snapshot(edits=7,now=NOW) {
    const calls=[];
    async function requestJson(address) {
        const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
        if(p.list==='usercontribs')return done({usercontribs:[{revid:2,parentid:1,pageid:1,ns:0,title:'Artigo Exemplo',timestamp:'2026-10-01T12:00:00Z',user:USER,tags:[],new:false,sizediff:3}]});
        if(p.meta==='globaluserinfo')return done({globaluserinfo:{name:USER,editcount:edits,registration:'2013-01-01T00:00:00Z',merged:[{wiki:'ptwiki',url:'https://pt.wikipedia.org',editcount:edits,registration:'2014-01-01T00:00:00Z'},{wiki:'enwiki',url:'https://en.wikipedia.org',editcount:0,registration:'2008-05-25T00:00:00Z'}]}});
        if(p.list==='users')return done({users:[{name:USER,registration:'2014-01-01T00:00:00Z'}]});
        if(p.list==='logevents')return done({logevents:[]});
        if(p.prop==='info')return done({pages:p.pageids.split('|').map(Number).map(pageid=>({pageid,ns:0,title:'Artigo Exemplo',contentmodel:'wikitext'}))});
        if(url.hostname==='xtools.wmcloud.org')return {username:USER,project:url.pathname.split('/')[4],namespace:0,redirects:'noredirects',deleted:'all',counts:{'0':{count:0}}};
        assert.equal(url.hostname,'wikimedia.org');const parts=url.pathname.split('/'),parse=value=>Date.parse(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T00:00:00Z'),items=[];
        for(let at=parse(parts[11]);at<=parse(parts[12]);at+=DAY)items.push({project:'pt.wikipedia.org',article:decodeURIComponent(parts[9]),agent:'user',access:'all-access',granularity:'daily',timestamp:new Date(at).toISOString().slice(0,10).replaceAll('-','')+'00',views:3});
        return {items};
    }
    let state=null;
    for(let round=0;round<3;round++){state=await Coordinator.update({config:{user:USER,project:'pt.wikipedia.org',timeZone:'UTC'},now,requestJson,maxRequests:40,includeEarliestRegistration:true,previous:state});if(state.complete)break;}
    assert.equal(Coordinator.validateState(state).valid,true);assert.equal(state.complete,true);
    return {state,calls,requestJson};
}
class Node {
    constructor(id='',attributes={}){this.id=id;this.attributes=attributes;this.children=[];this.style={};this.events={};}
    getAttribute(key){return this.attributes[key]??null;}
    setAttribute(key,value){this.attributes[key]=String(value);}
    removeAttribute(key){delete this.attributes[key];}
    appendChild(node){this.children.push(node);node.parentNode=this;return node;}
    querySelector(selector){return selector==='a'?this.children.find(node=>node.tagName==='a')||null:null;}
    querySelectorAll(){return [];}
    addEventListener(type,callback){this.events[type]=callback;}
}
function runtime({local=new Map(),large=null,update,blockedLocal=false,quotaCache=false,codec=Cache,loggedUser=USER}={}) {
    let now=Date.parse(NOW),timerId=0;const timers=new Map(),events={},notifications=[],updates=[],paints=[],writes=[],removed=[];
    class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
    const root=new Node('dan-pu-estatisticas',{'data-perfilwiki-user':USER}),nodes=new Map([[root.id,root]]);
    const document={readyState:'complete',hidden:false,getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener:(name,callback)=>events[name]=callback,
        createElement:tag=>{const node=new Node();node.tagName=tag;return node;}};
    const data={wgDBname:'ptwiki',wgAction:'view',wgUserName:loggedUser,wgRelevantUserName:USER,wgNamespaceNumber:2,wgTitle:USER};
    const win={console,document,location:{hash:''},navigator:{},PerfilWikiConfig:{user:USER,timeZone:'UTC',appearance:{showActivity:false,showLocalTime:false}},
        PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiCache:codec,PerfilWikiLargeCache:large,PerfilWikiPresenter:Presenter,
        PerfilWikiActivityView:{paintProfile:()=>{}},PerfilWikiCardsView:{paint:(_doc,statistics)=>paints.push(statistics&&statistics.metrics.edits)},
        PerfilWikiCoordinator:{validateState:Coordinator.validateState,update:async options=>{updates.push(options);return update?update(options):options.previous;}},
        localStorage:{getItem:key=>{if(blockedLocal)throw new Error('Local storage blocked');return local.get(key)||null;},
            setItem:(key,value)=>{if(blockedLocal)throw new Error('Local storage blocked');if(quotaCache&&key===prefix+'cache'){const error=new Error('Full');error.name='QuotaExceededError';throw error;}writes.push({key,value});local.set(key,value);},
            removeItem:key=>{removed.push(key);local.delete(key);}},
        setTimeout:(callback,delay)=>{const id=++timerId;timers.set(id,{callback,delay});return id;},clearTimeout:id=>timers.delete(id),setInterval:()=>++timerId,clearInterval:()=>{},
        addEventListener:(name,callback)=>events[name]=callback,fetch:()=>assert.fail('Runtime cache integration tests never make real requests'),
        mw:{config:{get:key=>data[key]},notify:(message,options)=>notifications.push({message,options}),loader:{using:()=>Promise.resolve()},util:{addPortletLink:()=>null}}};
    const source=fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8').replace('}(window));','window.__cacheSaveForTest=saveCache;window.__normalRefreshForTest=function(){return refresh(false);};}(window));');
    vm.runInNewContext(source,{window:win,Intl,Date:Clock,URL,Blob,Set,Map,AbortController});
    return {win,local,events,notifications,updates,paints,writes,removed,timers,setNow:value=>now=Date.parse(value),settle:async()=>{for(let i=0;i<30;i++)await Promise.resolve();}};
}
function memoryLarge(initial=null){let value=initial;const reads=[],writes=[];return{reads,writes,get:async key=>{reads.push(key);return value;},put:async(key,packed,capturedAt)=>{writes.push({key,packed,capturedAt});value=packed;return true;},value:()=>value};}

test('quota-limited checkpoints persist in IndexedDB and a new visit restores them before collection without a full history scan',async()=>{
    const f=await snapshot(),large=memoryLarge();
    const first=runtime({large,quotaCache:true,update:async options=>{options.onProgress(f.state);return f.state;}});
    await first.win.PerfilWiki.refresh();assert.equal(first.local.has(prefix+'cache'),false);assert.ok(large.writes.length>=2);assert.equal(first.notifications.some(n=>n.message.includes('não guardou')),false);
    const second=runtime({large,quotaCache:true,update:options=>Coordinator.update(Object.assign({},options,{requestJson:f.requestJson}))});
    await second.settle();assert.equal(second.win.PerfilWiki.getState().statistics.metrics.edits,7);
    const before=f.calls.length;await second.win.PerfilWiki.refresh();
    const history=f.calls.slice(before).filter(call=>call.p.list==='usercontribs');
    assert.equal(history.length,1);assert.ok(history[0].p.ucend,'Manual refresh resumes an incremental overlap, never a new full scan');
    assert.equal(second.win.PerfilWiki.getState().history.entries.length,1);assert.deepEqual(first.removed,[]);
});

test('an asynchronous same-anchor IndexedDB checkpoint wins over an older local partial before manual and focus collection',async()=>{
    const localState=(await snapshot(7)).state,idbState=(await snapshot(99)).state;
    const local=new Map([[prefix+'cache',Cache.packJson(JSON.stringify(localState))]]);let finish;
    const large={get:()=>new Promise(resolve=>finish=resolve),put:async()=>true};
    const r=runtime({local,large});
    assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,7,'Local and saved content paint immediately');
    const task=r.win.PerfilWiki.refresh();r.events.focus();await r.settle();assert.equal(r.updates.length,0);
    finish(Cache.packJson(JSON.stringify(idbState)));await task;
    assert.equal(r.updates.length,1);assert.equal(r.updates[0].previous.statistics.metrics.edits,99);
    assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,99,'Reading the old same-anchor local value cannot roll back IndexedDB');
    await r.win.PerfilWiki.refresh();assert.equal(r.updates.at(-1).previous.statistics.metrics.edits,99);
});

test('corrupt, foreign-account, foreign-timezone and future IndexedDB values cannot replace valid local data',async()=>{
    const state=(await snapshot()).state;
    const foreign=clone(state);foreign.config.user='Another Example';
    const zone=clone(state);zone.config.timeZone='America/Sao_Paulo';
    const future=clone(state);future.capturedAt='2026-10-15T14:44:00.000Z';
    for(const value of ['broken json',JSON.stringify(foreign),JSON.stringify(zone),JSON.stringify(future)]) {
        const r=runtime({local:new Map([[prefix+'cache',Cache.packJson(JSON.stringify(state))]]),large:memoryLarge(value)});
        await r.settle();assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,7);assert.equal(r.updates.length,0);
        await r.win.PerfilWiki.refresh();assert.equal(r.updates[0].previous.statistics.metrics.edits,7);
    }
});

test('a newer valid local anchor wins over an older IndexedDB snapshot',async()=>{
    const newer=(await snapshot(9)).state,older=(await snapshot(7,'2026-10-15T14:41:59.000Z')).state;
    const r=runtime({local:new Map([[prefix+'cache',Cache.packJson(JSON.stringify(newer))]]),large:memoryLarge(Cache.packJson(JSON.stringify(older)))});
    await r.settle();assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,9);
    await r.win.PerfilWiki.refresh();assert.equal(r.updates[0].previous.statistics.metrics.edits,9);
});

test('blocked stores and codec overflow warn once while current results and subsequent refreshes remain usable',async()=>{
    const state=(await snapshot()).state;
    for(const codec of [Cache,{...Cache,packJson:()=>{throw new Error('Oversized local cache dictionary');}}]) {
        const r=runtime({blockedLocal:true,large:{get:async()=>null,put:async()=>false},codec,update:async options=>{options.onProgress(state);return state;}});
        await r.win.PerfilWiki.refresh();await r.win.PerfilWiki.refresh();
        assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,7);assert.ok(r.paints.includes(7));
        const warnings=r.notifications.filter(n=>n.message==='O navegador não guardou esta consulta. Os resultados continuam disponíveis nesta aba.');
        assert.equal(warnings.length,1);assert.equal(warnings[0].options.type,'warn');assert.equal(r.updates.length,2);
    }
});

test('progress saves are coalesced for15seconds, first and final checkpoints are forced, and the final commit finishes before releasing the lease',async()=>{
    const base=(await snapshot()).state,packed=[],putCalls=[];let finishFirst,active=0,maxActive=0,doneRefresh=false;
    const large={get:async()=>null,put:async(_key,raw)=>{active++;maxActive=Math.max(active,maxActive);putCalls.push(Cache.parseJson(raw).statistics.metrics.edits);
        if(putCalls.length===1)await new Promise(resolve=>finishFirst=resolve);active--;return true;}};
    function revision(number){const value=clone(base);value.statistics.metrics.edits=number;value.statistics.global.editcount=number;return value;}
    const codec={...Cache,packJson:raw=>{packed.push(JSON.parse(raw).statistics.metrics.edits);return Cache.packJson(raw);}};
    let r;r=runtime({large,codec,update:async options=>{
        options.onProgress(revision(1));for(let i=2;i<30;i++)options.onProgress(revision(i));
        r.setNow('2026-10-15T14:42:14.000Z');options.onProgress(revision(30));
        r.setNow('2026-10-15T14:42:15.000Z');options.onProgress(revision(31));
        options.onProgress(revision(32));return revision(99);
    }});
    const task=r.win.PerfilWiki.refresh().then(()=>doneRefresh=true);await r.settle();
    assert.deepEqual(putCalls,[1]);assert.equal(doneRefresh,false);
    assert.ok(JSON.parse(r.local.get(prefix+'bloqueio')).expires>Date.parse(NOW),'The collection lease remains held during the pending final queue');
    finishFirst();await task;
    assert.deepEqual(packed,[1,31,99]);assert.deepEqual(putCalls,[1,31,99]);assert.equal(maxActive,1);
    assert.equal(JSON.parse(r.local.get(prefix+'bloqueio')).expires,0);
    assert.equal(Cache.parseJson(r.local.get(prefix+'cache')).statistics.metrics.edits,99);
});

test('same-anchor writes remain ordered and an older queued anchor cannot overwrite a completed newer snapshot',async()=>{
    const newest=(await snapshot(9)).state,older=(await snapshot(7,'2026-10-15T14:41:59.000Z')).state,large=memoryLarge();
    const r=runtime({large});await r.settle();
    await r.win.__cacheSaveForTest(newest,true);await r.win.__cacheSaveForTest(older,true);
    assert.equal(large.writes.length,1);assert.equal(Cache.parseJson(large.value()).statistics.metrics.edits,9);
    const next=clone(newest);next.statistics.metrics.edits=10;next.statistics.global.editcount=10;
    await r.win.__cacheSaveForTest(next,true);assert.equal(large.writes.length,2);assert.equal(Cache.parseJson(large.value()).statistics.metrics.edits,10);
});

test('the unavailable IndexedDB module preserves local caching and foreign users never open its database',async()=>{
    const state=(await snapshot()).state;
    const local=runtime({update:async options=>{options.onProgress(state);return state;}});await local.win.PerfilWiki.refresh();
    assert.equal(Cache.parseJson(local.local.get(prefix+'cache')).statistics.metrics.edits,7);
    let accesses=0;const foreign=runtime({loggedUser:'Another Example',large:{get:()=>{accesses++;return Promise.resolve(null);},put:async()=>{accesses++;return true;}}});
    await foreign.settle();assert.equal(foreign.win.PerfilWiki,undefined);assert.equal(accesses,0);
});

test('a bfcache return cannot replace advanced same-anchor in-memory results with an older IndexedDB checkpoint',async()=>{
    const old=(await snapshot(7)).state,newer=(await snapshot(99)).state;
    const staleRaw=Cache.packJson(JSON.stringify(old));
    const r=runtime({local:new Map([[prefix+'cache',staleRaw]]),large:{get:async()=>staleRaw,put:async()=>false},update:async options=>{options.onProgress(newer);return newer;}});
    await r.win.PerfilWiki.refresh();assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,99);
    r.events.pagehide();r.events.pageshow();await r.settle();
    assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,99);
    await r.win.PerfilWiki.refresh();assert.equal(r.updates.at(-1).previous.statistics.metrics.edits,99);
});

function marked(state,sequence){return Object.assign(clone(state),{cacheCheckpoint:{schema:1,sequence}});}

test('a fresh visit keeps the newer same-anchor local final checkpoint when its IndexedDB mirror failed',async()=>{
    const old=(await snapshot(7)).state,final=(await snapshot(99)).state,oldRaw=Cache.packJson(JSON.stringify(marked(old,1)));
    const local=new Map([[prefix+'cache',oldRaw]]),large={get:async()=>oldRaw,put:async()=>false};
    const first=runtime({local,large,update:async options=>{options.onProgress(final);return final;}});
    await first.win.PerfilWiki.refresh();
    const saved=Cache.parseJson(local.get(prefix+'cache'));assert.equal(saved.statistics.metrics.edits,99);assert.equal(saved.cacheCheckpoint.sequence,3);
    const next=runtime({local,large});await next.settle();
    assert.equal(next.win.PerfilWiki.getState().statistics.metrics.edits,99,'An old same-anchor IndexedDB mirror cannot undo the local final result');
    await next.win.PerfilWiki.refresh();assert.equal(next.updates[0].previous.statistics.metrics.edits,99);
});

test('a fresh visit keeps the newer same-anchor IndexedDB final checkpoint when localStorage retained the old partial',async()=>{
    const old=(await snapshot(7)).state,final=(await snapshot(99)).state,oldRaw=Cache.packJson(JSON.stringify(marked(old,1)));
    const local=new Map([[prefix+'cache',oldRaw]]),large=memoryLarge(oldRaw);
    const first=runtime({local,large,quotaCache:true,update:async options=>{options.onProgress(final);return final;}});
    await first.win.PerfilWiki.refresh();assert.equal(Cache.parseJson(local.get(prefix+'cache')).statistics.metrics.edits,7);
    const saved=Cache.parseJson(large.value());assert.equal(saved.statistics.metrics.edits,99);assert.equal(saved.cacheCheckpoint.sequence,3);
    const next=runtime({local,large,quotaCache:true});assert.equal(next.win.PerfilWiki.getState().statistics.metrics.edits,7);
    await next.settle();assert.equal(next.win.PerfilWiki.getState().statistics.metrics.edits,99);
    await next.win.PerfilWiki.refresh();assert.equal(next.updates[0].previous.statistics.metrics.edits,99);
});

test('checkpoint ordering seeds both validated stores and malformed or excessive ordinals cannot poison future writes',async()=>{
    const old=(await snapshot(7)).state,final=(await snapshot(99)).state;
    const local=new Map([[prefix+'cache',Cache.packJson(JSON.stringify(marked(old,3)))]]),large=memoryLarge(Cache.packJson(JSON.stringify(marked(final,9))));
    const r=runtime({local,large,update:async options=>{assert.equal(options.previous.statistics.metrics.edits,99);options.onProgress(final);return final;}});
    await r.win.PerfilWiki.refresh();assert.deepEqual(large.writes.map(write=>Cache.parseJson(write.packed).cacheCheckpoint.sequence),[10,11]);
    for(const marker of [{schema:1,sequence:Number.MAX_SAFE_INTEGER},{schema:1,sequence:1000000},{schema:1,sequence:0},{schema:1,sequence:-1},{schema:1,sequence:1.5},{schema:2,sequence:1},{schema:1,sequence:1,other:true},null,[]]) {
        const invalid=Object.assign(clone(final),{cacheCheckpoint:marker}),store=new Map([[prefix+'cache',Cache.packJson(JSON.stringify(old))]]),large=memoryLarge(Cache.packJson(JSON.stringify(invalid)));
        const runtimeCase=runtime({local:store,large,update:async options=>{assert.equal(options.previous.statistics.metrics.edits,7);options.onProgress(old);return old;}});
        await runtimeCase.win.PerfilWiki.refresh();assert.equal(Cache.parseJson(store.get(prefix+'cache')).cacheCheckpoint.sequence,2);
    }
});

test('same-anchor cross-tab checkpoints advance by ordinal and older persisted events cannot roll them back',async()=>{
    const old=(await snapshot(7)).state,current=(await snapshot(99)).state,newer=(await snapshot(123)).state;
    const local=new Map([[prefix+'cache',Cache.packJson(JSON.stringify(marked(old,1)))]]);
    const r=runtime({local,update:async options=>{options.onProgress(current);return current;}});await r.win.PerfilWiki.refresh();
    assert.equal(Cache.parseJson(local.get(prefix+'cache')).cacheCheckpoint.sequence,3);
    local.set(prefix+'cache',Cache.packJson(JSON.stringify(marked(newer,4))));r.events.storage({key:prefix+'cache'});
    assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,123);
    local.set(prefix+'cache',Cache.packJson(JSON.stringify(marked(old,2))));r.events.storage({key:prefix+'cache'});
    assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,123);
});
