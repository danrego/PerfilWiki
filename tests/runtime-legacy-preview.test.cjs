'use strict';
// Synthetic Runtime integration only. The transport below never opens a socket.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Coordinator = require('../src/Coordinator.js');
const Cache = require('../src/Cache.js');
const Configuration = require('../src/Configuration.js');
const Appearance = require('../src/Appearance.js');
const Presenter = require('../src/Presenter.js');
const Cards = require('../src/CardsView.js');
const Preview = require('../src/LegacyStatsPreview.js');
const USER = 'Editora Exemplo', NOW = '2026-10-15T14:42:00.000Z', SAVED = '2026-10-14T12:00:00Z';
const PREFIX = 'perfilwiki-v1-' + encodeURIComponent(USER) + '-UTC-';
const PREVIEW_KEY = PREFIX + 'legacy-counter-source-v1';
const ids = {edits:'dan-pu-edicoes', thanks:'dan-pu-agradecimentos', articles:'dan-pu-artigos',
    bestStreak:'dan-pu-ritmo-melhor-sequencia', edited:'dan-pu-editados',
    technicalCreated:'dan-pu-criados-tecnicos', reverts:'dan-pu-reversoes'};
const clone = value => JSON.parse(JSON.stringify(value));
const done = query => ({batchcomplete:true, query});
function legacy() {
    return {schema:1, user:USER, lastAttemptAt:SAVED, lastSuccessAt:SAVED, errors:[],
        metrics:{edits:10, thanks:3, articles:2, streak:2, edited:2, reverts:2, technicalCreated:0},
        projects:{ptwiki:{url:'https://pt.wikipedia.org', editcount:10, thanks:3, articles:2}},
        history:{complete:true, scannedAt:SAVED, dates:['2026-10-10','2026-10-11']},
        edited:{complete:true, scannedAt:SAVED, fullScannedAt:SAVED, validatedAt:SAVED, pageids:[1,2], countedPageids:[1,2]},
        reverts:{complete:true, scannedAt:SAVED, fullScannedAt:SAVED, revids:[10,11]},
        technicalCreated:{model:'created-code-pages-v1', complete:true, scannedAt:SAVED,
            fullScannedAt:SAVED, validatedAt:SAVED, creations:[], pages:[]}};
}
function wikitext(state = legacy()) {
    let text = '<includeonly>{{#switch:{{{1|}}}\n';
    for (const [key,label] of [['edits','edicoes'],['thanks','agradecimentos'],['articles','artigos'],['streak','sequencia'],
        ['edited','editados'],['technical','predefinicoes'],['technicalCreated','tecnicoscriados'],['reverts','reversoes']]) {
        if (Object.hasOwn(state.metrics,key)) text += '|' + label + '={{formatnum:' + state.metrics[key] + '}}\n';
    }
    return text + '|#default=\n}}</includeonly><noinclude><syntaxhighlight lang="json">\n' +
        JSON.stringify(state,null,2) + '\n</syntaxhighlight></noinclude>\n';
}
function publicResponse(text = wikitext()) {
    return done({pages:[{pageid:77, ns:2, title:'Usuário:' + USER + '/PU/Estatísticas',
        revisions:[{slots:{main:{contentmodel:'wikitext', content:text}}}]}]});
}
let completeSeed, partialSeed;
async function seed(incomplete = false) {
    if (incomplete ? partialSeed : completeSeed) return clone(incomplete ? partialSeed : completeSeed);
    const contribution = {revid:2, parentid:1, pageid:1, ns:0, title:'Artigo Exemplo',
        timestamp:'2026-10-01T12:00:00Z', user:USER, tags:[], new:false, sizediff:3};
    async function requestJson(raw) {
        const url = new URL(raw), p = Object.fromEntries(url.searchParams);
        if (p.list === 'usercontribs') return incomplete ?
            {continue:{continue:'-||', uccontinue:'synthetic-more'}, query:{usercontribs:[contribution]}} : done({usercontribs:[contribution]});
        if (p.meta === 'globaluserinfo') return done({globaluserinfo:{name:USER, editcount:7,
            merged:[{wiki:'ptwiki', url:'https://pt.wikipedia.org', editcount:7}]}});
        if (p.list === 'users') return done({users:[{name:USER, registration:'2014-01-01T00:00:00Z'}]});
        if (p.list === 'logevents') return done({logevents:[]});
        if (p.prop === 'info') return done({pages:p.pageids.split('|').map(Number).map(pageid =>
            ({pageid, ns:0, title:'Artigo Exemplo', contentmodel:'wikitext'}))});
        if (url.hostname === 'xtools.wmcloud.org') return {username:USER, project:'pt.wikipedia.org', namespace:0,
            redirects:'noredirects', deleted:'all', counts:{'0':{count:0}}};
        assert.equal(url.hostname,'wikimedia.org','The seed only understands local synthetic public responses');
        const parts = url.pathname.split('/'), parse = value => Date.parse(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T00:00:00Z');
        const items = [];
        for (let at = parse(parts[11]); at <= parse(parts[12]); at += 86400000) items.push({project:'pt.wikipedia.org',
            article:decodeURIComponent(parts[9]), agent:'user', access:'all-access', granularity:'daily',
            timestamp:new Date(at).toISOString().slice(0,10).replaceAll('-','')+'00', views:3});
        return {items};
    }
    const state = await Coordinator.update({config:{user:USER, project:'pt.wikipedia.org', timeZone:'UTC'},
        now:NOW, requestJson, maxRequests:40, historyBudget:incomplete ? 1 : 20});
    assert.equal(Coordinator.validateState(state).valid,true,'Integration fixtures pass the production coordinator validator');
    assert.equal(state.activity.complete,!incomplete);
    if (incomplete) partialSeed = clone(state); else completeSeed = clone(state);
    return state;
}
class Node {
    constructor(id = '', attributes = {}) { this.id=id; this.attributes={...attributes}; this.style={}; this.children=[]; this.events={}; this.textContent=''; }
    getAttribute(key) { return this.attributes[key] ?? null; }
    setAttribute(key,value) { this.attributes[key]=String(value); }
    removeAttribute(key) { delete this.attributes[key]; }
    appendChild(node) { this.children.push(node); node.parentNode=this; return node; }
    contains(node) { return this.children.includes(node); }
    querySelector(selector) { return selector === 'a' ? this.children.find(node => node.tagName === 'a') || null : null; }
    querySelectorAll() { return []; }
    addEventListener(name,callback) { this.events[name]=callback; }
}
function runtime({local = new Map(), state, update, response = publicResponse(), loggedUser = USER,
    relevantUser = USER, namespace = 2, showActivity = false} = {}) {
    let timerId=0;
    const calls=[], updates=[], events={}, writes=[], reads=[], warnings=[], timers=new Map();
    class Clock extends Date { constructor(...args) { super(...(args.length ? args : [NOW])); } static now() { return Date.parse(NOW); } }
    const input={user:USER, timeZone:'UTC', appearance:{showActivity, showLocalTime:false, showAccountCreated:false,
        metrics:Object.keys(ids), layout:'separate', profilePlacements:{name:'hidden', location:'hidden', photo:'hidden'}}};
    const settings=Appearance.normalize(input.appearance);
    const root=new Node('dan-pu-estatisticas', {'data-perfilwiki-user':USER,
        'data-perfilwiki-appearance':JSON.stringify(settings), 'data-perfilwiki-rendered':'ready',
        'data-perfilwiki-documentation':'Usuário:Daniel G Rego/PerfilWiki'});
    const activityRoot=new Node('dan-pu-ritmo', {'data-perfilwiki-user':USER});
    const nodes=new Map([[root.id,root], ...(showActivity ? [[activityRoot.id,activityRoot]] : [])]);
    for (const id of Object.values(ids)) { const node=new Node(id); node.textContent='Aguardando dados'; root.appendChild(node); nodes.set(id,node); }
    const document={readyState:'complete', hidden:false, getElementById:id=>nodes.get(id)||null,
        querySelectorAll:()=>[], addEventListener:(name,callback)=>events[name]=callback,
        createElement:tag=>{const node=new Node();node.tagName=tag;return node;}};
    const data={wgDBname:'ptwiki', wgAction:'view', wgUserName:loggedUser, wgRelevantUserName:relevantUser,
        wgNamespaceNumber:namespace, wgTitle:USER};
    const win={document, console:{warn:(...args)=>warnings.push(args)}, location:{hash:''},
        navigator:{locks:{request:async(_name,options,callback)=>callback({})}},
        PerfilWikiConfig:input, PerfilWikiConfiguration:Configuration, PerfilWikiAppearance:Appearance,
        PerfilWikiCache:Cache, PerfilWikiPresenter:Presenter, PerfilWikiLegacyStatsPreview:Preview,
        PerfilWikiCardsView:Cards, PerfilWikiActivityView:{paintProfile:()=>{}, html:()=>'<div></div>'},
        PerfilWikiCoordinator:{validateState:Coordinator.validateState, update:async options=>{
            updates.push(options);
            const value=update ? await update(options) : clone(state);
            assert.equal(Coordinator.validateState(value).valid,true,'A fake collector may only return a fully validated fixture');
            return value;
        }},
        localStorage:{getItem:key=>{reads.push(key);return local.get(key)||null;},
            setItem:(key,value)=>{writes.push({key,value});local.set(key,value);}, removeItem:key=>local.delete(key)},
        setTimeout:(callback,delay)=>{const id=++timerId;timers.set(id,{callback,delay});return id;},
        clearTimeout:id=>timers.delete(id), setInterval:()=>++timerId, clearInterval:()=>{},
        addEventListener:(name,callback)=>events[name]=callback,
        fetch:async(url,options)=>{calls.push({url,options});const value=typeof response==='function' ? response(url) : response;
            return {ok:true, status:200, url, redirected:false, headers:{get:()=>null}, text:async()=>JSON.stringify(value)};},
        mw:{config:{get:key=>data[key]}, notify:()=>{}, loader:{using:()=>Promise.resolve()}, util:{addPortletLink:()=>null}}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),
        {window:win, Intl, Date:Clock, URL, Blob, Set, Map, AbortController});
    return {win,local,nodes,calls,updates,events,writes,reads,warnings,timers,
        settle:async()=>{for(let turn=0;turn<30;turn++)await Promise.resolve();}};
}
function assertPreview(r,key,value) {
    const node=r.nodes.get(ids[key]);
    assert.equal(node.textContent,String(value));
    assert.equal(node.getAttribute('data-perfilwiki-legacy-preview'),'true');
    assert.equal(node.getAttribute('data-perfilwiki-legacy-saved-at'),SAVED);
    assert.match(node.getAttribute('title'),/Dados salvos da versão anterior.*2026-10-14/);
}

test('v15 and v14 own local counters paint synchronously before any fetch or collector starts',async()=>{
    const state=await seed();
    for (const version of [15,14]) {
        const saved=legacy();
        if (version===14) { delete saved.edited.countedPageids; delete saved.edited.validatedAt; }
        const raw=JSON.stringify(saved), local=new Map([['dan-pu-estatisticas-v'+version+'-cache',raw]]);
        const r=runtime({local,state});
        assertPreview(r,'edits',10); assertPreview(r,'edited',2); assertPreview(r,'technicalCreated',0);
        assert.equal(r.nodes.get(ids.bestStreak).textContent,'2 dias');
        assert.equal(r.calls.length,0); assert.equal(r.updates.length,0);
        assert.equal(r.win.PerfilWiki.getState(),null,'A display preview cannot become resume state');
        assert.equal(local.get('dan-pu-estatisticas-v'+version+'-cache'),raw,'The previous browser cache stays intact');
        await r.win.PerfilWiki.refresh();
        assert.equal(r.calls.length,0,'All selected counters were recovered locally');
        assert.equal(r.updates[0].maxRequests,40); assert.equal(r.updates[0].previous,null);
    }
});

test('one bounded anonymous read of the exact own subpage saves only separate raw preview data and leaves 39 core requests',async()=>{
    const state=await seed(), raw=legacy(), response=publicResponse(wikitext(raw));
    const r=runtime({state,response});
    assert.equal(r.calls.length,0); assert.equal(r.updates.length,0);
    await r.win.PerfilWiki.refresh();
    assert.equal(r.calls.length,1); assert.equal(r.updates.length,1); assert.equal(r.updates[0].maxRequests,39);
    assert.equal(r.updates[0].previous,null);
    const call=r.calls[0], url=new URL(call.url), params=Object.fromEntries(url.searchParams);
    assert.equal(url.origin,'https://pt.wikipedia.org'); assert.equal(url.pathname,'/w/api.php');
    assert.deepEqual(params,{action:'query',format:'json',formatversion:'2',origin:'*',maxlag:'5',prop:'revisions',
        titles:'Usuário:'+USER+'/PU/Estatísticas',rvprop:'content',rvslots:'main'});
    assert.equal(call.options.method,'GET'); assert.equal(call.options.credentials,'omit');
    assert.equal(call.options.redirect,'error'); assert.equal(call.options.referrerPolicy,'no-referrer');
    assert.equal(url.searchParams.has('token'),false); assert.equal(url.searchParams.has('assertuser'),false);
    assert.deepEqual(JSON.parse(r.local.get(PREVIEW_KEY)),raw);
    const persisted=Cache.parseJson(r.local.get(PREFIX+'cache'));
    assert.equal(Coordinator.validateState(persisted).valid,true);
    assert.deepEqual(persisted.statistics,state.statistics); assert.deepEqual(persisted.history,state.history);
    assert.deepEqual(persisted.pageviews,state.pageviews);
    assert.equal(persisted.previewSchema,undefined); assert.equal(persisted.legacyPreview,undefined);
    assert.equal(r.writes.filter(write=>write.key===PREVIEW_KEY).length,1);
    await r.win.PerfilWiki.refresh();
    assert.equal(r.calls.length,1,'One bootstrap request is the lifetime cap for this Runtime');
    assert.equal(r.updates[1].maxRequests,40);
    const nextStore=new Map([[PREVIEW_KEY,r.local.get(PREVIEW_KEY)]]), next=runtime({local:nextStore,state});
    assertPreview(next,'edits',10); assert.equal(next.win.PerfilWiki.getState(),null);
    await next.win.PerfilWiki.refresh();
    assert.equal(next.calls.length,0,'The next browser visit recovers the separate preview without another public read');
    assert.equal(next.updates[0].maxRequests,40); assert.equal(next.updates[0].previous,null);
});

test('foreign, malformed, ambiguous, wrong-model or noncanonical public pages fail without counter display or core contamination',async()=>{
    const state=await seed(), cases=[];
    for (const [label,mutate] of [
        ['foreign page title',data=>data.query.pages[0].title='Usuário:Outra pessoa/PU/Estatísticas'],
        ['wrong namespace',data=>data.query.pages[0].ns=0],
        ['missing page',data=>data.query.pages[0].missing=true],
        ['invalid page',data=>data.query.pages[0].invalid=true],
        ['wrong content model',data=>data.query.pages[0].revisions[0].slots.main.contentmodel='json'],
        ['missing content model',data=>delete data.query.pages[0].revisions[0].slots.main.contentmodel],
        ['ambiguous revision list',data=>data.query.pages[0].revisions.push(clone(data.query.pages[0].revisions[0]))],
        ['continued response',data=>data.continue={continue:'synthetic'}],
        ['uncompleted response',data=>delete data.batchcomplete],
        ['duplicate page',data=>data.query.pages.push(clone(data.query.pages[0]))],
        ['foreign embedded identity',data=>{const foreign=legacy();foreign.user='Outra pessoa';data.query.pages[0].revisions[0].slots.main.content=wikitext(foreign);}],
        ['altered visible count',data=>{const slot=data.query.pages[0].revisions[0].slots.main;slot.content=slot.content.replace('|edicoes={{formatnum:10}}','|edicoes={{formatnum:999}}');}],
        ['oversized content',data=>data.query.pages[0].revisions[0].slots.main.content='x'.repeat(Preview.rawLimit+1)]
    ]) { const response=publicResponse();mutate(response);cases.push({label,response}); }
    for (const {label,response} of cases) {
        let finish;
        const r=runtime({response,state,update:()=>new Promise(resolve=>finish=resolve)});
        const refreshing=r.win.PerfilWiki.refresh(); await r.settle();
        assert.equal(r.calls.length,1,label); assert.equal(r.updates[0].maxRequests,39,label);
        assert.equal(r.local.has(PREVIEW_KEY),false,label);
        assert.equal(r.nodes.get(ids.edits).getAttribute('data-perfilwiki-legacy-preview'),null,label);
        assert.equal(r.nodes.get(ids.edits).textContent,'Aguardando dados',label);
        finish(clone(state)); await refreshing;
        assert.equal(Coordinator.validateState(r.win.PerfilWiki.getState()).valid,true,label);
        assert.deepEqual(clone(r.win.PerfilWiki.getState().statistics),state.statistics,label);
        const second=r.win.PerfilWiki.refresh(); await r.settle();
        assert.equal(r.calls.length,1,'A rejected fallback is not retried within the same Runtime');
        finish(clone(state)); await second;
    }
});

test('validated onProgress counters clear saved provenance before incomplete activity or hidden activity returns early',async()=>{
    const incomplete=await seed(true), complete=await seed();
    for (const [showActivity,state] of [[true,incomplete],[false,complete]]) {
        const local=new Map([['dan-pu-estatisticas-v15-cache',JSON.stringify(legacy())]]);
        let finish;
        const r=runtime({local,showActivity,state,update:async options=>{
            options.onProgress(clone(state)); return new Promise(resolve=>finish=resolve);
        }});
        assertPreview(r,'edits',10);
        const refreshing=r.win.PerfilWiki.refresh(); await r.settle();
        const node=r.nodes.get(ids.edits);
        assert.equal(node.textContent,'7');
        assert.equal(node.getAttribute('data-perfilwiki-legacy-preview'),null);
        assert.equal(node.getAttribute('data-perfilwiki-legacy-saved-at'),null);
        assert.equal(node.getAttribute('title'),null);
        assert.equal(Coordinator.validateState(r.win.PerfilWiki.getState()).valid,true);
        if (showActivity) assert.equal(r.win.PerfilWiki.getState().activity.complete,false);
        finish(clone(state)); await refreshing;
    }
});

test('malformed and foreign local legacy values are never painted or passed to the validated collector',async()=>{
    const state=await seed(), foreign=legacy();foreign.user='Outra pessoa';
    for (const raw of ['not json',JSON.stringify(foreign),'{"__proto__":{}}','x'.repeat(Preview.rawLimit+1)]) {
        const local=new Map([['dan-pu-estatisticas-v15-cache',raw]]), r=runtime({local,state,response:done({pages:[]})});
        assert.equal(r.nodes.get(ids.edits).textContent,'Aguardando dados');
        assert.equal(r.win.PerfilWiki.getState(),null);
        await r.win.PerfilWiki.refresh();
        assert.equal(r.updates[0].previous,null); assert.equal(r.local.has(PREVIEW_KEY),false);
        assert.equal(Coordinator.validateState(r.win.PerfilWiki.getState()).valid,true);
    }
});

test('anonymous visitors, other accounts and other user-page contexts cannot start preview reads or the scheduler',async()=>{
    const state=await seed();
    for (const options of [{loggedUser:null},{loggedUser:'Outra pessoa'},{relevantUser:'Outra pessoa'},{namespace:3}]) {
        const local=new Map([['dan-pu-estatisticas-v15-cache',JSON.stringify(legacy())]]), r=runtime({local,state,...options});
        await r.settle();
        assert.equal(r.win.PerfilWiki,undefined); assert.equal(r.calls.length,0); assert.equal(r.updates.length,0);
        assert.equal(r.reads.length,0,'The owner/page guard runs before any browser cache access');
        assert.equal(r.nodes.get(ids.edits).textContent,'Aguardando dados');
    }
});
