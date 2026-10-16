'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Configuration = require('../src/Configuration.js');
const Appearance = require('../src/Appearance.js');
const Activity = require('../src/ActivityView.js');
const Cards = require('../src/CardsView.js');
const Cache = require('../src/Cache.js');
const Core = require('../src/PageviewsCore.js');
const Presenter = require('../src/Presenter.js');
const USER = 'Marina Exemplo';
const NOW = '2026-10-15T14:42:00.000Z';
const PHOTO = 'Marina Exemplo.jpg';
class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [NOW])); }
    static now() { return Date.parse(NOW); }
}
class Node {
    constructor(id = '', attributes = {}) {
        this.id = id; this.attributes = {...attributes}; this.style = {}; this.children = []; this.events = {};
        this.textContent = ''; this.hidden = false;
    }
    getAttribute(key) { return this.attributes[key] ?? null; }
    setAttribute(key, value) { this.attributes[key] = String(value); }
    removeAttribute(key) { delete this.attributes[key]; }
    addEventListener(type, handler) { (this.events[type] ||= []).push(handler); }
    appendChild(node) { node.parentNode = this; this.children.push(node); return node; }
    removeChild(node) { this.children.splice(this.children.indexOf(node), 1); node.parentNode = null; }
    querySelector(selector) {
        if (selector[0] === '#') return this.children.find(node => node.id === selector.slice(1)) || null;
        if (selector === 'a') return this.children.find(node => node.tagName === 'a') || null;
        return null;
    }
    querySelectorAll(selector) { return selector === '.dan-pu-profile-photo' ? this.photos || [] : []; }
    click() {}
}
function photoSlot({filename = PHOTO, complete = false, naturalWidth = 0} = {}) {
    const image = new Node('', {src:'https://commons.wikimedia.org/wiki/Special:FilePath/Marina_Exemplo.jpg?width=160'});
    image.complete = complete; image.naturalWidth = naturalWidth;
    const fallback = new Node('', {hidden:''}); fallback.hidden = true; fallback.textContent = 'Imagem indisponível';
    const caption = new Node(); caption.textContent = 'Ver arquivo no Commons';
    const slot = new Node('', {'data-perfilwiki-photo':filename});
    slot.appendChild(image); slot.appendChild(fallback); slot.appendChild(caption);
    slot.querySelector = selector => selector === 'img.dan-pu-profile-photo-image' ? image :
        selector === '.dan-pu-profile-photo-placeholder' ? fallback : null;
    return {slot, image, fallback, caption};
}
function runtime({cached = true, appearance = {}, photo = 'File:Marina_Exemplo.jpg', loggedUser = USER,
    showCardsRoot = true, showActivityRoot = true, cardPhotos = [], activityPhotos = []} = {}) {
    const input = {user:USER,timeZone:'UTC',displayName:'Marina Wiki',location:'[[Brasília]]',photo,
        customFields:[{label:'Projeto',value:'[[Wikipédia:Projetos|Meus projetos]]',placement:'cards'}],appearance};
    const resolved = Configuration.resolve({config:{get:() => USER}}, {PerfilWikiConfig:input});
    const entries = [[1,1,0,'Artigo Exemplo','2026-10-01T12:00:00.000Z',0]];
    const state = {config:resolved.metrics,capturedAt:NOW,activity:{complete:true,entries,capturedAt:NOW,
        summary:Core.summarize(entries,{config:resolved.metrics,now:NOW})},statistics:{user:USER,metrics:{},errors:[],pending:false},
        pageviews:{allPeriodsComplete:true,periods:Object.fromEntries(Core.PERIOD_IDS.map(id => [id,{complete:true,rows:[]}])),progress:{pending:0}},fresh:true};
    const cardsRoot = new Node('dan-pu-estatisticas', {'data-perfilwiki-user':USER}); cardsRoot.photos = cardPhotos;
    const activityRoot = new Node('dan-pu-ritmo', {'data-perfilwiki-user':USER}); activityRoot.photos = activityPhotos;
    const nodes = new Map([...(showCardsRoot ? [cardsRoot] : []),...(showActivityRoot ? [activityRoot] : [])].map(node => [node.id,node]));
    const prefix = 'perfilwiki-v1-' + encodeURIComponent(USER) + '-UTC-';
    const store = new Map(cached ? [[prefix+'cache',Cache.packJson(JSON.stringify(state))]] : []);
    const rendered = [], paintedCards = [], paintedProfiles = [], activityExports = [], cardsExports = [], updates = [], downloads = [];
    const document = {readyState:'complete',hidden:false,getElementById:id => nodes.get(id) || null,querySelectorAll:() => [],
        addEventListener:() => {},createElement:tag => { const node = new Node(); node.tagName = tag; return node; }};
    class LocalURL extends URL {
        static createObjectURL(blob) { downloads.push(blob); return 'blob:local-profile-fixture'; }
        static revokeObjectURL() {}
    }
    const mwConfig = {wgDBname:'ptwiki',wgAction:'view',wgUserName:loggedUser,wgRelevantUserName:USER,wgNamespaceNumber:2};
    const win = {document,console,location:{hash:''},navigator:{},PerfilWikiConfig:input,
        PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiCache:Cache,PerfilWikiPresenter:Presenter,
        PerfilWikiActivityView:{html:(value,options) => { rendered.push(options); return Activity.html(value,options); },
            wikitext:(value,options) => { activityExports.push(options); return Activity.wikitext(value,options); },
            paintProfile:(document,value,options) => paintedProfiles.push(options)},
        PerfilWikiCardsView:{paint:(document,statistics,activity,now,appearance,options) => paintedCards.push(options),
            wikitext:(statistics,activity,options) => { cardsExports.push(options); return Cards.wikitext(statistics,activity,options); }},
        PerfilWikiCoordinator:{validateState:() => ({valid:true}),update:async options => { updates.push(options); options.onProgress(state); return state; }},
        localStorage:{getItem:key => store.get(key) || null,setItem:(key,value) => store.set(key,value)},
        setTimeout:() => 1,clearTimeout:() => {},setInterval:() => 1,clearInterval:() => {},addEventListener:() => {},
        fetch:() => assert.fail('The synthetic profile test must make no network requests'),
        mw:{config:{get:key => mwConfig[key]},loader:{using:() => Promise.resolve()},util:{addPortletLink:() => null}}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),
        {window:win,Intl,Date:Clock,URL:LocalURL,Blob,Set,Map,AbortController});
    return {win,resolved,state,store,prefix,rendered,paintedCards,paintedProfiles,activityExports,cardsExports,updates,downloads,cardsRoot,activityRoot};
}
function assertPresentation(options) {
    assert.equal(options.photo,PHOTO);
    assert.equal(options.displayName,'Marina Wiki');
    assert.equal(options.location,'[[Brasília]]');
    assert.equal(options.customFields[0].placement,'cards');
    assert.equal(options.customFields[0].value,'[[Wikipédia:Projetos|Meus projetos]]');
}

test('Runtime forwards normalized photo and per-row placement through cold, cached and progress profile paints', async () => {
    const cold = runtime({cached:false});
    assertPresentation(cold.paintedCards[0]); assertPresentation(cold.paintedProfiles[0]);
    await cold.win.PerfilWiki.refresh();
    assert.ok(cold.rendered.length >= 2); cold.rendered.forEach(assertPresentation); cold.paintedCards.forEach(assertPresentation);
    const cached = runtime(); assertPresentation(cached.rendered[0]); cached.paintedCards.forEach(assertPresentation);
    assert.equal(cached.win.PerfilWiki.version,require('../package.json').version);
    assert.deepEqual(JSON.parse(JSON.stringify(cached.win.PerfilWiki.getState().config)),cached.resolved.metrics);
    assert.equal(Object.hasOwn(cached.win.PerfilWiki.getState().config,'photo'),false);
    assert.ok([...cached.store.keys()].every(key => key.startsWith(cached.prefix)));
});

test('both actual wiki exports retain the photo and field placement without altering metric identity', async () => {
    const r = runtime({appearance:{profilePlacements:{photo:'both'}}});
    r.win.PerfilWiki.downloadActivity(); r.win.PerfilWiki.downloadCards();
    assertPresentation(r.activityExports[0]); assertPresentation(r.cardsExports[0]);
    assert.equal(r.downloads.length,2);
    for (const blob of r.downloads) {
        const text = await blob.text();
        assert.match(text,/Marina Exemplo\.jpg/);
        assert.match(text,/data-perfilwiki-user="Marina Exemplo"/);
        assert.doesNotMatch(text,/<img|<script|onerror=/i,'Saved wiki output uses safe Commons file syntax');
    }
    assert.doesNotMatch(await r.downloads[0].text(),/>Projeto:/);
    assert.match(await r.downloads[1].text(),/>Projeto:/);
});

test('complete downloads retain editable PROFILE boundaries and partial downloads never create nested boundaries',async()=>{
    const LiveEdit=require('../src/LiveEdit.js'),Layout=require('../src/LayoutView.js');
    const combined=runtime();combined.win.PerfilWikiLayoutView=Layout;combined.win.PerfilWiki.downloadActivity();
    const complete=await combined.downloads[0].text();
    assert.equal(LiveEdit.hasProfile(complete),true);assert.equal(complete.split('<!-- PERFILWIKI-PROFILE-BEGIN -->').length-1,1);assert.match(complete,/data-perfilwiki-group="true"/);assert.match(complete,/dan-pu-estatisticas/);assert.match(complete,/dan-pu-ritmo/);
    for(const selected of ['cards','activity']){
        const only=runtime({appearance:selected==='cards'?{showActivity:false}:{showCards:false}});
        selected==='cards'?only.win.PerfilWiki.downloadCards():only.win.PerfilWiki.downloadActivity();
        assert.equal(LiveEdit.hasProfile(await only.downloads[0].text()),true);
    }
    const fragments=runtime({appearance:{layout:'separate'}});fragments.win.PerfilWiki.downloadActivity();fragments.win.PerfilWiki.downloadCards();
    for(const blob of fragments.downloads){const text=await blob.text();assert.equal(LiveEdit.hasProfile(text),false);assert.match(text,/preservando as marcas externas PERFILWIKI-PROFILE/);}
});

test('earliest registration is collected for tenure or a visible account-created field', async () => {
    const cases = [
        [{showAccountCreated:false},true],
        [{showAccountCreated:true,profilePlacements:{accountCreated:'hidden'}},true],
        [{showAccountCreated:true,profilePlacements:{name:'hidden',location:'hidden',photo:'hidden',accountCreated:'cards'}},true],
        [{showAccountCreated:true,showCards:false,profilePlacements:{accountCreated:'cards'}},true],
        [{showAccountCreated:true,showActivity:false,profilePlacements:{accountCreated:'activity'}},true],
        [{showAccountCreated:true,profilePlacements:{accountCreated:'both'}},true],
        [{showAccountCreated:true,profilePlacement:'cards',profilePlacements:{accountCreated:'activity'}},true],
        [{showAccountCreated:true,showActivity:false,profilePlacements:{accountCreated:'hidden'}},true],
        [{showAccountCreated:false,metrics:['edits']},false],
        [{showAccountCreated:true,metrics:['edits'],profilePlacements:{accountCreated:'hidden'}},false],
        [{showCards:false,showAccountCreated:false},false],
        [{showCards:false,showAccountCreated:true,profilePlacements:{accountCreated:'activity'}},true]
    ];
    for (const [appearance,expected] of cases) {
        const r = runtime({appearance}); await r.win.PerfilWiki.refresh();
        assert.equal(r.updates[0].includeEarliestRegistration,expected,JSON.stringify(appearance));
        assert.equal(Object.hasOwn(r.updates[0].config,'profilePlacements'),false);
    }
});

test('cards-only and cold profile photos receive one error handler that preserves all other details', async () => {
    for (const cached of [false,true]) {
        const photo = photoSlot();
        const r = runtime({cached,showActivityRoot:false,appearance:{showActivity:false},cardPhotos:[photo.slot]});
        assert.equal(photo.image.events.error.length,1);
        photo.image.events.error[0]();
        assert.equal(photo.image.hidden,true); assert.equal(photo.image.style.display,'none');
        assert.equal(photo.fallback.hidden,false); assert.equal(photo.fallback.getAttribute('hidden'),null);
        assert.equal(photo.caption.textContent,'Ver arquivo no Commons'); assert.equal(photo.slot.children.length,3);
        await r.win.PerfilWiki.refresh();
        assert.equal(photo.image.events.error.length,1,'Progress and final paints do not bind duplicate handlers');
        r.paintedCards.forEach(assertPresentation);
    }
});

test('already failed photos get a local fallback while successful or mismatched photos remain intact', () => {
    const failed = photoSlot({complete:true}), loaded = photoSlot({complete:true,naturalWidth:160}), otherFile = photoSlot({filename:'Outra pessoa.jpg',complete:true});
    runtime({activityPhotos:[failed.slot,loaded.slot,otherFile.slot]});
    assert.equal(failed.image.hidden,true); assert.equal(failed.fallback.hidden,false);
    assert.equal(loaded.image.hidden,false); assert.equal(loaded.fallback.hidden,true);
    assert.equal(otherFile.image.hidden,false); assert.equal(otherFile.fallback.hidden,true); assert.equal(otherFile.image.events.error,undefined);
});

test('photo customization never relaxes the owner guard', () => {
    const photo = photoSlot({complete:true});
    const r = runtime({loggedUser:'Marina Wiki',activityPhotos:[photo.slot]});
    assert.equal(r.win.PerfilWiki,undefined); assert.equal(photo.image.events.error,undefined); assert.equal(r.updates.length,0);
});

test('public user groups are collected only when their optional field is visible', async () => {
    for (const [appearance, expected] of [
        [{},false],
        [{showUserGroups:false},false],
        [{showUserGroups:true},true],
        [{showUserGroups:true,profilePlacements:{userGroups:'hidden'}},false],
        [{showUserGroups:true,showActivity:false,profilePlacements:{userGroups:'activity'}},true],
        [{showUserGroups:true,showCards:false,profilePlacements:{userGroups:'top'}},true]
    ]) {
        const r=runtime({appearance}); await r.win.PerfilWiki.refresh();
        assert.equal(r.updates[0].includeUserGroups,expected,JSON.stringify(appearance));
        assert.equal(Object.hasOwn(r.updates[0].config,'showUserGroups'),false);
        assert.equal(Object.hasOwn(r.updates[0].config,'userGroups'),false);
    }
});
