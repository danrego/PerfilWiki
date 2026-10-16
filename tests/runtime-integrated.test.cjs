'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Appearance = require('../src/Appearance.js');
const Configuration = require('../src/Configuration.js');
const Activity = require('../src/ActivityView.js');
const Cards = require('../src/CardsView.js');
const Cache = require('../src/Cache.js');
const Core = require('../src/PageviewsCore.js');
const Presenter = require('../src/Presenter.js');
const Layout = require('../src/LayoutView.js');
const Header = require('../src/ProfileHeaderView.js');
const ProfileClock = require('../src/ProfileClock.js');
const NativeCover = require('../src/NativeDailyCover.js');
const DailyCover = require('../src/DailyCover.js');
const USER = 'Marina Exemplo';
const NOW = '2026-10-15T14:42:00.000Z';
const DATE = '2008-05-15T12:00:00.000Z';
const decode = value => String(value).replace(/&(?:#(\d+)|#x([\da-f]+)|amp|lt|gt|quot|apos);/gi, (all, decimal, hex) => {
    if (decimal || hex) return String.fromCodePoint(parseInt(decimal || hex, hex ? 16 : 10));
    return {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[all.toLowerCase()];
});

// A bounded HTML fixture, not a browser emulator. It parses only the actual
// renderers' well-formed markup and genuinely removes descendants on outerHTML.
// That makes a lost nested card observable without stubbing Runtime's paint.
class TextNode {
    constructor(value, document) { this.nodeType = 3; this.textContent = value; this.ownerDocument = document; this.parentNode = null; }
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }
}
function simpleMatch(node, selector) {
    if (!node || node.nodeType !== 1) return false;
    const tag = /^[a-z][\w-]*/i.exec(selector);
    if (tag && node.tagName.toLowerCase() !== tag[0].toLowerCase()) return false;
    for (const match of selector.matchAll(/#([\w-]+)|\.([\w-]+)|\[([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\]/g)) {
        if (match[1] && node.id !== match[1]) return false;
        if (match[2] && !node.className.split(/\s+/).includes(match[2])) return false;
        if (match[3]) {
            const actual = node.getAttribute(match[3]), expected = match[4] ?? match[5] ?? match[6];
            if (actual === null || expected !== undefined && actual !== expected) return false;
        }
    }
    return true;
}
function matches(node, selector, scope) {
    if (selector === ':scope') return node === scope;
    const child = /^(.*)\s*>\s*([^>]+)$/.exec(selector);
    if (child) return simpleMatch(node,child[2].trim()) && matches(node.parentNode,child[1].trim(),scope);
    const descendant = /^(.*)\s+([^\s]+)$/.exec(selector);
    if (descendant) {
        if (!simpleMatch(node,descendant[2])) return false;
        for (let parent = node.parentNode; parent; parent = parent.parentNode) if (matches(parent,descendant[1],scope)) return true;
        return false;
    }
    return simpleMatch(node,selector);
}
class Element {
    constructor(tag, document) {
        this.nodeType = 1; this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.parentNode = null;
        this.childNodes = []; this.attributes = {}; this.style = {}; this.events = {}; this.hidden = false; this.value = '';
        this.classList = {add:(...values) => { this.className = [...new Set(this.className.split(/\s+/).filter(Boolean).concat(values))].join(' '); },
            remove:(...values) => { this.className = this.className.split(/\s+/).filter(value => !values.includes(value)).join(' '); },
            contains:value => this.className.split(/\s+/).includes(value)};
    }
    get id() { return this.getAttribute('id') || ''; } set id(value) { this.setAttribute('id',value); }
    get className() { return this.getAttribute('class') || ''; } set className(value) { this.setAttribute('class',value); }
    get children() { return this.childNodes.filter(node => node.nodeType === 1); }
    get parentElement() { return this.parentNode?.nodeType === 1 ? this.parentNode : null; }
    get firstChild() { return this.childNodes[0] || null; }
    get firstElementChild() { return this.children[0] || null; }
    get nextSibling() { const nodes = this.parentNode?.childNodes || []; return nodes[nodes.indexOf(this)+1] || null; }
    get nextElementSibling() { const nodes = this.parentNode?.children || []; return nodes[nodes.indexOf(this)+1] || null; }
    get textContent() { return this.childNodes.map(node => node.textContent).join(''); }
    set textContent(value) { this.replaceChildren(new TextNode(String(value),this.ownerDocument)); }
    getAttribute(key) { return this.attributes[key] ?? null; }
    setAttribute(key, value) { this.attributes[key] = String(value); if (key === 'value') this.value = String(value); }
    removeAttribute(key) { delete this.attributes[key]; }
    appendChild(node) { return this.insertBefore(node,null); }
    append(...nodes) { nodes.forEach(node => this.appendChild(typeof node === 'string' ? new TextNode(node,this.ownerDocument) : node)); }
    insertBefore(node, next) {
        if (node === next) return node;
        if (node.parentNode) node.parentNode.removeChild(node);
        const index = next === null ? this.childNodes.length : this.childNodes.indexOf(next);
        assert.ok(index >= 0,'Insertion anchor must belong to its parent');
        this.childNodes.splice(index,0,node); node.parentNode = this; return node;
    }
    removeChild(node) {
        const index = this.childNodes.indexOf(node); assert.ok(index >= 0);
        this.childNodes.splice(index,1); node.parentNode = null; return node;
    }
    replaceChildren(...nodes) { this.childNodes.slice().forEach(node => this.removeChild(node)); nodes.forEach(node => this.appendChild(node)); }
    replaceWith(node) { const parent = this.parentNode; if (parent) { parent.insertBefore(node,this); parent.removeChild(this); } }
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }
    contains(node) { return node === this || this.childNodes.some(child => child.nodeType === 1 && child.contains(node) || child === node); }
    querySelectorAll(selector) {
        const choices = selector.split(',').map(value => value.trim()), found = [];
        function visit(parent) { parent.children.forEach(child => { if (choices.some(choice => matches(child,choice,parent === child ? child : this))) found.push(child); visit.call(this,child); }); }
        visit.call(this,this); return found;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest(selector) { for (let node = this; node; node = node.parentElement) if (matches(node,selector,node)) return node; return null; }
    addEventListener(type, listener) { (this.events[type] ||= []).push(listener); }
    focus() { this.ownerDocument.activeElement = this; }
    click() {}
    get outerHTML() { return '<'+this.tagName.toLowerCase()+Object.entries(this.attributes).map(([key,value]) => ' '+key+'="'+value+'"').join('')+'>'+this.textContent+'</'+this.tagName.toLowerCase()+'>'; }
    set outerHTML(markup) {
        const replacement = parse(markup,this.ownerDocument), parent = this.parentNode;
        if (!parent) return;
        replacement.forEach(node => parent.insertBefore(node,this)); parent.removeChild(this);
    }
    set innerHTML(markup) { this.replaceChildren(...parse(markup,this.ownerDocument)); }
}
function parse(markup, document) {
    const fragment = new Element('fragment',document), stack = [fragment], voids = new Set(['img','br','hr','input','meta','link','templatestyles']);
    for (const token of String(markup).matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[^<>]+>|[^<]+/g)) {
        const text = token[0];
        if (/^<!/.test(text)) continue;
        if (/^<\//.test(text)) { if (stack.length > 1) stack.pop(); continue; }
        if (text[0] !== '<') { stack[stack.length-1].appendChild(new TextNode(decode(text),document)); continue; }
        const match = /^<([\w-]+)/.exec(text); if (!match) continue;
        const node = new Element(match[1],document);
        for (const attribute of text.slice(match[0].length).matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) node.setAttribute(attribute[1],decode(attribute[2] ?? attribute[3] ?? attribute[4] ?? ''));
        stack[stack.length-1].appendChild(node);
        if (!voids.has(match[1].toLowerCase()) && !/\/\s*>$/.test(text)) stack.push(node);
    }
    return fragment.childNodes.slice();
}
function documentFixture(markup) {
    const document = {readyState:'complete',hidden:false,activeElement:null,events:{},createElement:tag => new Element(tag,document),
        addEventListener(type,fn) { (this.events[type] ||= []).push(fn); }};
    document.body = new Element('body',document); document.documentElement = document.body;
    document.body.append(...parse(markup,document));
    document.getElementById = id => document.body.querySelector('#'+id);
    document.querySelectorAll = selector => document.body.querySelectorAll(selector);
    return document;
}
function makeState(metrics = {}, user = USER, timeZone = 'UTC') {
    const config = Configuration.resolve({config:{get:() => user}},{PerfilWikiConfig:{user,timeZone}}).metrics;
    const entries = [[1,1,0,'Artigo de exemplo','2026-10-14T12:00:00.000Z',0]];
    return {config,capturedAt:NOW,fresh:true,activity:{complete:true,capturedAt:NOW,identity:{user,project:config.project},entries,
        summary:Core.summarize(entries,{config,now:NOW})},statistics:{user,metrics:{edits:12,thanks:7,registration:'2009-01-01T00:00:00Z',earliestRegistration:DATE,...metrics},errors:[],pending:false,
        registrationCoverage:{version:1,user,checkedAt:NOW,complete:true,globalRegistration:DATE,accounts:[]}},
        pageviews:{allPeriodsComplete:true,periods:Object.fromEntries(Core.PERIOD_IDS.map(id => [id,{complete:true,rows:[]}])),progress:{pending:0}}};
}
function runtime({layout = 'integrated', blockOrder = 'cards-first', cached = true, cachedIncomplete = false,
    single = null, initialUser = USER, accountCreatedPlacement = 'cards', unavailableCoverage = false,
    topProfile = false, showLocalTime = false, timeZone = 'UTC',coverImage='',coverSource='manual',nativeCoverSeed=false,cachedCover=null,loggedUser=USER,topBackground='#ffffff',photo='',photoAlignment='left',photoSize=96,photoShape='square',wikiTitle=USER,customFields} = {}) {
    const appearance = Appearance.normalize({layout,blockOrder,coverSource,topBackground,photoAlignment,photoSize,photoShape,metrics:['edits','thanks'],showCards:single !== 'activity',showActivity:single !== 'cards',
        showAccountCreated:true,showLocalTime,profilePlacement:topProfile ? 'top' : 'activity',profilePlacements:{accountCreated:accountCreatedPlacement}});
    const options = {user:initialUser,coverImage,photo,displayName:'Marina Pesquisa',timeZone,location:'[[Brasília]]',customFields:customFields?JSON.parse(JSON.stringify(customFields)):[{label:'Pesquisa',value:'Bibliotecas',placement:'cards'}],now:NOW,appearance};
    if (topProfile&&!customFields) options.customFields.push({label:'Alma mater',values:['[[Universidade George Washington|GWU]]','[[Instituto de Tecnologia de Massachusetts|MIT]]'],layout:'lines',separator:'pipe',placement:'top'});
    const saved = makeState({},initialUser,timeZone), initialCards = Cards.html(saved.statistics,saved.activity,options), initialActivity = Activity.html(saved,options);
    const content = layout === 'integrated' ? Layout.compose(initialCards,initialActivity,appearance) : initialCards+initialActivity;
    const document = documentFixture('<p id="before">Texto anterior.</p>'+Header.html(saved,options)+'<div id="group" data-perfilwiki-group="true" data-perfilwiki-user="'+USER+'">'+content+'</div><div id="dan-pu-content-sections" data-perfilwiki-user="'+USER+'"><h2>Metas e projetos</h2><p>Texto que editei manualmente na página.</p></div><p id="after">Texto posterior.</p>');
    const nativeOriginal = {};
    if (nativeCoverSeed) {
        nativeOriginal.header = document.getElementById('dan-pu-profile-header');
        nativeOriginal.cover = nativeOriginal.header.querySelector('.dan-pu-profile-cover');
        nativeOriginal.body = nativeOriginal.cover.querySelector('.dan-pu-profile-cover-native-body');
        nativeOriginal.body.innerHTML = NativeCover.preview(nativeCoverSeed === 'portrait' ? 'portrait' : undefined);
        nativeOriginal.caption = nativeOriginal.cover.querySelector('.dan-pu-profile-cover-caption');
        nativeOriginal.caption.textContent = 'Imagem do dia da Wikipédia em português · 15 de outubro de 2026 · Clique na imagem para ver o arquivo e os créditos.';
        nativeOriginal.image = nativeOriginal.body.querySelector('img');
        nativeOriginal.link = nativeOriginal.body.querySelector('a');
    }
    const originalCards = document.getElementById('dan-pu-estatisticas');
    const state = makeState(cachedIncomplete || unavailableCoverage ? {edits:null,thanks:null,earliestRegistration:null} : {},USER,timeZone);
    if (cachedIncomplete) delete state.statistics.registrationCoverage;
    if (unavailableCoverage) state.statistics.registrationCoverage = {version:1,user:USER,checkedAt:NOW,complete:false,globalRegistration:null,accounts:[]};
    const prefix = 'perfilwiki-v1-' + encodeURIComponent(USER) + '-' + encodeURIComponent(timeZone) + '-';
    const store = new Map(cached ? [[prefix+'cache',Cache.packJson(JSON.stringify(state))]] : []), listeners = {}, downloads = [], updates = [], paints = [], timers = new Map(), calls = [], storageReads = [];
    if (cachedCover) store.set(prefix+'daily-cover-v1',JSON.stringify(cachedCover));
    let nextState = makeState({edits:99,thanks:11},USER,timeZone), clockNow = Date.parse(NOW), timerId = 0;
    class RuntimeClock extends Date { constructor(...args) { super(...(args.length ? args : [clockNow])); } static now() { return clockNow; } }
    class LocalURL extends URL { static createObjectURL(blob) { downloads.push(blob); return 'blob:integrated-fixture'; } static revokeObjectURL() {} }
    const mwConfig = {wgDBname:'ptwiki',wgAction:'view',wgUserName:loggedUser,wgRelevantUserName:USER,wgNamespaceNumber:2,wgTitle:wikiTitle};
    const win = {document,console,location:{hash:''},navigator:{},PerfilWikiConfig:{user:USER,timeZone,coverImage,photo,displayName:options.displayName,location:options.location,customFields:options.customFields,appearance},
        PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiCache:Cache,PerfilWikiPresenter:Presenter,PerfilWikiLayoutView:Layout,
        PerfilWikiProfileHeaderView:Header,PerfilWikiProfileClock:ProfileClock,PerfilWikiDailyCover:DailyCover,PerfilWikiNativeDailyCover:NativeCover,
        PerfilWikiCardsView:Cards,PerfilWikiActivityView:{...Activity,html:(value,presentation) => { paints.push(value); return Activity.html(value,presentation); }},
        PerfilWikiCoordinator:{validateState:() => ({valid:true}),update:async update => { updates.push(update); update.onProgress(state); return nextState; }},
        localStorage:{getItem:key => { storageReads.push(key); return store.get(key) || null; },setItem:(key,value) => store.set(key,value)},
        setTimeout:(callback,delay) => { const id = ++timerId; timers.set(id,{callback,delay}); return id; },clearTimeout:id => timers.delete(id),setInterval:() => 1,clearInterval:() => {},
        addEventListener:(type,listener) => { (listeners[type] ||= []).push(listener); },
        fetch:(url,options) => { calls.push({url,options}); assert.fail('Integrated layout regression tests must not make network requests'); },
        mw:{config:{get:key => mwConfig[key]},loader:{using:() => Promise.resolve()},util:{addPortletLink:() => null}}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),{window:win,Intl,Date:RuntimeClock,URL:LocalURL,Blob,Set,Map,AbortController});
    return {win,document,store,listeners,downloads,updates,paints,appearance,originalCards,timers,calls,storageReads,nativeOriginal,options,
        setNow(value) { clockNow = Date.parse(value); },
        setNext(value) { nextState = value; },
        storage(value) {
            // A current second tab advances the persisted checkpoint ordinal,
            // even when this fixture freezes both collection anchors at NOW.
            const previous=Cache.parseJson(store.get(prefix+'cache')||'null');
            const incoming={...value,cacheCheckpoint:{schema:1,sequence:(previous?.cacheCheckpoint?.sequence||0)+1}};
            store.set(prefix+'cache',Cache.packJson(JSON.stringify(incoming)));
            (listeners.storage || []).forEach(listener => listener({key:prefix+'cache'})); }};
}
function invariant(r, {single = null, expectedEdits = '12', date = true, pending = false} = {}) {
    const document = r.document, cards = document.getElementById('dan-pu-estatisticas'), activity = document.getElementById('dan-pu-ritmo');
    assert.equal(!!cards,single !== 'activity'); assert.equal(!!activity,single !== 'cards');
    const ids = document.querySelectorAll('[id]').map(node => node.id);
    assert.equal(new Set(ids).size,ids.length,'No duplicate numeric, profile, tab or footer IDs');
    assert.equal(document.querySelectorAll('#dan-pu-ritmo-install').length,1,'Exactly one invitation remains');
    assert.equal(document.getElementById('before').textContent,'Texto anterior.');
    assert.equal(document.getElementById('after').textContent,'Texto posterior.');
    if (cards) {
        assert.equal(document.getElementById('dan-pu-edicoes').textContent,expectedEdits);
        assert.match(cards.textContent,/Pesquisa: Bibliotecas/,'Cards-specific custom information survives repaint');
        if (date && Appearance.fieldIn(r.appearance,'cards','accountCreated')) assert.match(cards.textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/,'Verified saved date survives in cards');
    }
    if (activity && date && Appearance.fieldIn(r.appearance,'activity','accountCreated')) assert.match(activity.textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/,'Verified saved date survives in Activity');
    if (activity && cards && r.appearance.layout === 'integrated' && !pending) {
        const slot = document.getElementById('dan-pu-integrated-cards');
        assert.ok(slot && activity.contains(slot)); assert.equal(cards.parentNode,slot);
        assert.equal(cards.getAttribute('data-perfilwiki-user'),USER);
        assert.equal(document.getElementById('dan-pu-ritmo-install').parentNode,activity);
        assert.equal(document.querySelectorAll('.dan-pu-profile-label').length,1);
        assert.ok(activity.textContent.indexOf('Próxima meta') < activity.textContent.indexOf('Contribuições'));
        assert.ok(activity.textContent.indexOf('Contribuições') < activity.textContent.indexOf('12 semanas'));
    }
    if (single) assert.equal(document.getElementById('dan-pu-integrated-cards'),null,'Single-block output has no empty integration slot');
}

test('integrated cached repaint keeps the actual nested cards node and all saved numbers and profile fields', () => {
    const r = runtime(); invariant(r);
    assert.equal(r.document.getElementById('dan-pu-estatisticas'),r.originalCards,'Activity repaint must retain the existing card root');
    assert.ok(r.paints.length >= 1,'The real Activity renderer and destructive outerHTML setter were exercised');
});

test('incomplete cached metrics preserve last-good numeric values and verified creation metadata inside Activity', () => {
    const r = runtime({cachedIncomplete:true}); invariant(r);
    assert.equal(r.document.getElementById('dan-pu-estatisticas'),r.originalCards);
});

test('an Activity-placed saved creation date survives incomplete cached statistics and Activity replacement', () => {
    const r = runtime({cachedIncomplete:true,accountCreatedPlacement:'activity'}); invariant(r);
    const created = r.document.getElementById('dan-pu-ritmo').querySelector('.dan-pu-account-created');
    assert.match(created.textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
    assert.ok(created.getAttribute('data-perfilwiki-account-created'),'The surviving date retains same-owner proof for later paints');
    assert.equal(r.document.getElementById('dan-pu-estatisticas').querySelector('.dan-pu-account-created'),null);
});

test('integrated cards survive progress, final refresh and cross-tab cache replacements without duplicate roots', async () => {
    const r = runtime(); await r.win.PerfilWiki.refresh(); invariant(r,{expectedEdits:'99'});
    assert.equal(r.updates.length,1);
    r.storage(makeState({edits:123,thanks:15})); invariant(r,{expectedEdits:'123'});
    assert.equal(r.win.PerfilWiki.getState().statistics.metrics.edits,123);
    assert.equal(r.document.getElementById('dan-pu-estatisticas'),r.originalCards);
    assert.ok(r.paints.length >= 4,'Cached, progress, final and storage activity replacements all ran');
});

test('an integrated progress repaint preserves custom-date drafts and focus alongside the retained cards', async () => {
    const r = runtime(), start = r.document.getElementById('dan-pu-custom-start'), end = r.document.getElementById('dan-pu-custom-end');
    start.value = '2026-10-03'; end.value = '2026-10-09'; start.setAttribute('aria-invalid','true');
    r.document.getElementById('dan-pu-custom-error').textContent = 'Confira a data antes de aplicar.';
    start.focus(); await r.win.PerfilWiki.refresh(); invariant(r,{expectedEdits:'99'});
    const newStart = r.document.getElementById('dan-pu-custom-start');
    assert.notEqual(newStart,start,'The real Activity repaint replaced the input');
    assert.equal(newStart.value,'2026-10-03'); assert.equal(r.document.getElementById('dan-pu-custom-end').value,'2026-10-09');
    assert.equal(newStart.getAttribute('aria-invalid'),'true'); assert.equal(r.document.activeElement,newStart);
    assert.equal(r.document.getElementById('dan-pu-custom-error').textContent,'Confira a data antes de aplicar.');
    assert.equal(r.win.PerfilWiki.getAppearance().customRange,null,'A staged draft must not become an applied query');
});

test('cold integrated startup retains nested saved cards until public collection completes', async () => {
    const r = runtime({cached:false}); invariant(r);
    assert.equal(r.win.PerfilWiki.getState(),null);
    await r.win.PerfilWiki.refresh(); invariant(r,{expectedEdits:'99'});
});

test('cold copied roots clear another account while preserving the cards container for the first complete paint', async () => {
    const r = runtime({cached:false,initialUser:'Outra pessoa'});
    invariant(r,{expectedEdits:'Aguardando dados',date:false,pending:true});
    assert.doesNotMatch(r.document.body.textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
    assert.equal(r.document.getElementById('dan-pu-ritmo').getAttribute('data-perfilwiki-user'),USER);
    assert.equal(r.document.getElementById('dan-pu-estatisticas').parentNode,r.document.getElementById('group'));
    await r.win.PerfilWiki.refresh(); invariant(r,{expectedEdits:'99'});
});

test('single-block choices do not create or lose an integrated counterpart through refresh and storage', async () => {
    for (const single of ['cards','activity']) {
        const r = runtime({single}); invariant(r,{single});
        await r.win.PerfilWiki.refresh(); invariant(r,{single,expectedEdits:'99'});
        r.storage(makeState({edits:123})); invariant(r,{single,expectedEdits:'123'});
    }
});

test('legacy together order remains configurable and separate blocks retain their source placement', async () => {
    for (const layout of ['together','separate']) for (const blockOrder of ['cards-first','activity-first']) {
        const r = runtime({layout,blockOrder}), expected = layout === 'together' && blockOrder === 'activity-first' ? ['dan-pu-ritmo','dan-pu-estatisticas'] : ['dan-pu-estatisticas','dan-pu-ritmo'];
        invariant(r); assert.deepEqual(r.document.getElementById('group').children.map(node => node.id),expected);
        await r.win.PerfilWiki.refresh(); invariant(r,{expectedEdits:'99'});
        assert.deepEqual(r.document.getElementById('group').children.map(node => node.id),expected);
    }
});

test('integrated activity download contains the complete public dashboard once, including the saved card profile', async () => {
    const r = runtime(); r.win.PerfilWiki.downloadActivity(); assert.equal(r.downloads.length,1);
    const text = await r.downloads[0].text();
    for (const id of ['dan-pu-ritmo','dan-pu-estatisticas','dan-pu-edicoes','dan-pu-integrated-cards','dan-pu-ritmo-install']) assert.equal((text.match(new RegExp('id="'+id+'"','g')) || []).length,1,id);
    assert.match(text,/Pesquisa:<\/span> Bibliotecas/); assert.match(text,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
    assert.ok(text.indexOf('id="dan-pu-ritmo"') < text.indexOf('id="dan-pu-estatisticas"'));
    assert.ok(text.indexOf('id="dan-pu-estatisticas"') < text.indexOf('12 semanas'));
    assert.doesNotMatch(text,/<script|<iframe|action=edit|csrf|token=/i);
});

test('integrated counter download stays a replacement fragment without a second invitation or Activity root', async () => {
    const r = runtime(); r.win.PerfilWiki.downloadCards(); assert.equal(r.downloads.length,1);
    const text = await r.downloads[0].text();
    assert.equal((text.match(/id="dan-pu-estatisticas"/g) || []).length,1);
    assert.doesNotMatch(text,/id="dan-pu-ritmo"|id="dan-pu-integrated-cards"|id="dan-pu-ritmo-install"/);
    assert.match(text,/Pesquisa:<\/span> Bibliotecas/); assert.match(text,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
    invariant(r);
});

test('incomplete cached statistics preserve the visible saved date in complete exports for either permitted placement', async () => {
    for (const accountCreatedPlacement of ['activity','cards']) {
        const r = runtime({cachedIncomplete:true,accountCreatedPlacement}); invariant(r);
        r.win.PerfilWiki.downloadActivity(); r.win.PerfilWiki.downloadCards();
        assert.equal(r.downloads.length,2);
        const full = await r.downloads[0].text(), fragment = await r.downloads[1].text();
        assert.equal((full.match(/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/g) || []).length,1,accountCreatedPlacement);
        assert.equal((full.match(/data-perfilwiki-account-created=/g) || []).length,1,'Full export keeps the validated proof');
        if (accountCreatedPlacement === 'cards') {
            assert.match(fragment,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
            assert.match(fragment,/data-perfilwiki-account-created=/);
        } else assert.doesNotMatch(fragment,/Conta criada em:|data-perfilwiki-account-created=/,'An Activity-only date must not migrate into a cards fragment');
    }
});

test('explicit unavailable date coverage overrides saved date proof in live output and downloads', async () => {
    for (const accountCreatedPlacement of ['activity','cards']) {
        const r = runtime({cachedIncomplete:true,unavailableCoverage:true,accountCreatedPlacement}); invariant(r,{date:false});
        assert.doesNotMatch(r.document.body.textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
        assert.equal(r.document.querySelectorAll('[data-perfilwiki-account-created]').length,0);
        assert.match(r.document.body.textContent,/Data de criação(?:<\/strong>)? indisponível/);
        r.win.PerfilWiki.downloadActivity(); r.win.PerfilWiki.downloadCards();
        for (const blob of r.downloads) assert.doesNotMatch(await blob.text(),/Conta criada em:(?:<\/strong>)? 15 de maio de 2008|data-perfilwiki-account-created=/);
    }
});

test('one real top header retains grouped fields through cache, progress and storage while its clock updates locally', async () => {
    const zone = 'America/New_York', r = runtime({topProfile:true,showLocalTime:true,timeZone:zone,accountCreatedPlacement:'top'});
    function topInvariant(edits) {
        invariant(r,{expectedEdits:edits});
        assert.equal(r.document.querySelectorAll('#dan-pu-profile-header').length,1);
        const top = r.document.getElementById('dan-pu-profile-header');
        assert.equal(top.getAttribute('data-perfilwiki-user'),USER); assert.match(top.textContent,/Alma mater: GWUMIT/);
        assert.match(top.textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
        assert.equal(top.querySelector('.dan-pu-local-time').getAttribute('data-perfilwiki-timezone'),zone);
        assert.equal(r.document.getElementById('dan-pu-ritmo').querySelector('.dan-pu-profile-label'),null);
    }
    topInvariant('12');
    assert.match(r.document.getElementById('dan-pu-profile-header').textContent,/10:42 \(UTC-4\)/);
    const clockTimer = [...r.timers.entries()].find(([,timer]) => timer.delay >= 59000 && timer.delay <= 61000);
    assert.ok(clockTimer,'The shared minute clock is scheduled');
    r.setNow('2026-10-15T14:43:00.000Z'); r.timers.delete(clockTimer[0]); clockTimer[1].callback();
    assert.match(r.document.getElementById('dan-pu-profile-header').textContent,/10:43 \(UTC-4\)/);
    assert.equal(r.updates.length,0,'Ticking the clock never collects statistics or makes requests');
    await r.win.PerfilWiki.refresh(); topInvariant('99');
    assert.equal(r.updates[0].includeEarliestRegistration,true,'Top-only account date still enables the optional collector');
    r.storage(makeState({edits:123},USER,zone)); topInvariant('123');
});

test('a top-only saved creation proof survives partial caches and the complete dashboard export', async () => {
    const r = runtime({topProfile:true,showLocalTime:true,accountCreatedPlacement:'top',cachedIncomplete:true});
    invariant(r); const top = r.document.getElementById('dan-pu-profile-header');
    assert.match(top.textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
    assert.equal(r.document.querySelectorAll('[data-perfilwiki-account-created]').length,1);
    assert.ok(top.querySelector('[data-perfilwiki-account-created]'));
    r.win.PerfilWiki.downloadActivity(); r.win.PerfilWiki.downloadCards();
    const full = await r.downloads[0].text(), fragment = await r.downloads[1].text();
    assert.equal((full.match(/id="dan-pu-profile-header"/g) || []).length,1);
    assert.equal((full.match(/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/g) || []).length,1);
    assert.match(full,/Alma mater:/); assert.match(full,/title="Horário salvo em /); assert.doesNotMatch(full,/Hora local:/);
    assert.ok(full.indexOf('id="dan-pu-profile-header"') < full.indexOf('id="dan-pu-ritmo"'));
    assert.doesNotMatch(fragment,/id="dan-pu-profile-header"|Conta criada em:|Alma mater:/,'Nested-cards replacement excludes the separately installed top header');
});

test('top-only unavailable coverage and copied foreign headers never restore another saved date', () => {
    const unavailable = runtime({topProfile:true,accountCreatedPlacement:'top',cachedIncomplete:true,unavailableCoverage:true});
    assert.match(unavailable.document.getElementById('dan-pu-profile-header').textContent,/Data de criação(?:<\/strong>)? indisponível/);
    assert.equal(unavailable.document.querySelectorAll('[data-perfilwiki-account-created]').length,0);
    const copied = runtime({topProfile:true,accountCreatedPlacement:'top',cached:false,initialUser:'Outra pessoa'});
    invariant(copied,{date:false,expectedEdits:'Aguardando dados',pending:true});
    const headers = copied.document.querySelectorAll('#dan-pu-profile-header'); assert.equal(headers.length,1);
    assert.equal(headers[0].getAttribute('data-perfilwiki-user'),USER);
    assert.doesNotMatch(headers[0].textContent,/Conta criada em:(?:<\/strong>)? 15 de maio de 2008/);
    assert.equal(copied.document.querySelectorAll('[data-perfilwiki-account-created]').length,0);
});


test('Runtime keeps cover and background through cold cached progress and storage paints without adding collectors',async()=>{
 for(const cached of [false,true]) {
  const r=runtime({cached,topProfile:true,coverImage:'File:Marina_Paisagem.jpg',topBackground:'#183047'});
  const verify=()=>{
   const header=r.document.getElementById('dan-pu-profile-header'),covers=r.document.querySelectorAll('.dan-pu-profile-cover');
   assert.equal(covers.length,1);assert.equal(covers[0].parentNode,header);
   assert.equal(covers[0].getAttribute('data-perfilwiki-cover'),'Marina Paisagem.jpg');
   assert.equal(header.style.background,'#183047');
   assert.match(header.className,/dan-pu-top-dark/);
   assert.equal(covers[0].querySelector('img').events.error.length,1);
   assert.equal(Object.hasOwn(r.win.PerfilWiki.getState()?.config||{},'coverImage'),false);
  };
  verify();await r.win.PerfilWiki.refresh();verify();
  assert.equal(r.updates.length,1);assert.equal(Object.hasOwn(r.updates[0].config,'coverImage'),false);
  r.storage(makeState({edits:145}));verify();
  r.win.PerfilWiki.downloadActivity();const output=await r.downloads[0].text();
  assert.equal((output.match(/data-perfilwiki-cover=/g)||[]).length,1);
  assert.match(output,/\[\[Ficheiro:Marina Paisagem\.jpg\|1200px\|link=https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(output,/background:#183047/);
  r.win.PerfilWiki.downloadCards();assert.doesNotMatch(await r.downloads[1].text(),/data-perfilwiki-cover=/);
 }
});

test('a cover image failure leaves the profile text intact and hides the failed link',async()=>{
 const r=runtime({topProfile:true,coverImage:'Paisagem.jpg'}),header=r.document.getElementById('dan-pu-profile-header');
 const cover=header.querySelector('.dan-pu-profile-cover'),image=cover.querySelector('img'),fallback=cover.querySelector('.dan-pu-profile-cover-placeholder');
 image.events.error[0]();
 assert.equal(image.hidden,true);assert.equal(image.style.display,'none');assert.equal(fallback.hidden,false);
 assert.match(cover.className,/is-unavailable/);assert.match(header.textContent,/Marina Pesquisa/);
 await r.win.PerfilWiki.refresh();
 const same=header.querySelector('.dan-pu-profile-cover');assert.equal(same,cover);assert.equal(image.events.error.length,1);
});

test('Runtime retains independent photo alignment through initial progress storage and exported dashboard renders',async()=>{
 for(const cached of [false,true]) for(const photoAlignment of ['left','center','right']) {
  const r=runtime({cached,topProfile:true,photo:'Marina Exemplo.jpg',photoAlignment});
  const verify=()=>{
   const header=r.document.getElementById('dan-pu-profile-header');
   assert.equal(header.querySelector('.dan-pu-profile-content').getAttribute('data-photo-align'),photoAlignment);
   assert.ok(header.querySelector('.dan-pu-profile-photo'));
   assert.equal(r.appearance.nameAlignment,'left','Photo alignment must not change display-name alignment');
   assert.equal(Object.hasOwn(r.win.PerfilWiki.getState()?.config||{},'photoAlignment'),false);
  };
  verify();await r.win.PerfilWiki.refresh();verify();
  r.storage(makeState({edits:145}));verify();
  assert.equal(r.updates.length,1);
  assert.equal(Object.hasOwn(r.updates[0].config,'photoAlignment'),false,'Presentation changes do not change metric identity');
  r.win.PerfilWiki.downloadActivity();const output=await r.downloads[0].text();
  assert.match(output,new RegExp('data-photo-align="'+photoAlignment+'"'));
  assert.match(output,/\[\[Ficheiro:Marina Exemplo\.jpg/);
 }
});

test('appearance choices export reopens in the installer without collecting data or bundling personal page text',async()=>{
 const {importChoices}=await import('../installer/src/model.mjs');
 for(const wikiTitle of [USER,USER+'/PU']) {
  const r=runtime({cached:false,topProfile:true,photo:'Marina Exemplo.jpg',photoSize:200,photoShape:'round',wikiTitle});
  const personal=r.document.getElementById('dan-pu-content-sections');
  r.win.PerfilWiki.downloadChoices();const source=await r.downloads[0].text(),saved=JSON.parse(source),restored=importChoices(source);
  assert.equal(saved.version,'1.20.0');assert.equal(saved.appearance.photoSize,200);assert.equal(saved.appearance.photoShape,'round');
  assert.equal(restored.user,USER);assert.equal(restored.appearance.photoSize,200);assert.equal(restored.appearance.photoShape,'round');
  assert.equal(restored.destination,wikiTitle===USER?'main':'subpage');assert.equal(restored.subpage,'PU');
  assert.equal(r.updates.length,0);assert.equal(Object.hasOwn(saved,'contentSections'),false);assert.deepEqual(restored.contentSections,[]);
  assert.doesNotMatch(source,/Texto que editei|Metas e projetos|registration|entries|capturedAt/);
  await r.win.PerfilWiki.refresh();r.storage(makeState({edits:145}));
  assert.equal(r.document.getElementById('dan-pu-content-sections'),personal);assert.match(personal.textContent,/Texto que editei manualmente/);
  r.win.PerfilWiki.downloadActivity();assert.doesNotMatch(await r.downloads[1].text(),/dan-pu-content-sections|Texto que editei/);
 }
});

test('native visitor cover nodes survive cold cached progress refresh and storage paints in every block layout',async()=>{
 for(const layout of ['integrated','together','separate']) for(const single of [null,'cards','activity']) for(const cached of [false,true]) {
  const r=runtime({layout,single,cached,topProfile:true,coverSource:'wiki-daily',coverImage:'Preserved manual.jpg',nativeCoverSeed:cached?'portrait':'landscape'});
  const original=r.nativeOriginal,src=original.image.getAttribute('src'),href=original.link.getAttribute('href'),caption=original.caption.textContent;
  const verify=()=>{
   const header=r.document.getElementById('dan-pu-profile-header'),cover=header.querySelector('.dan-pu-profile-cover');
   assert.equal(header,original.header);assert.equal(cover,original.cover);
   assert.equal(cover.querySelector('.dan-pu-profile-cover-native-body'),original.body);
   assert.equal(cover.querySelector('img'),original.image);assert.equal(cover.querySelector('a'),original.link);
   assert.equal(cover.querySelector('.dan-pu-profile-cover-caption'),original.caption);
   assert.equal(original.image.getAttribute('src'),src);assert.equal(original.link.getAttribute('href'),href);
   assert.equal(original.caption.textContent,caption);assert.equal(original.image.hidden,false);
   assert.equal(cover.getAttribute('data-perfilwiki-cover-source'),'wiki-daily');assert.equal(cover.getAttribute('data-perfilwiki-cover'),'');
   assert.equal(r.document.querySelectorAll('.dan-pu-profile-cover').length,1);
   assert.equal(Object.keys(original.image.events).length,0,'Native file images receive no owner photo-failure bindings');
   assert.equal(r.calls.length,0);
  };
  verify();await r.win.PerfilWiki.refresh();verify();
  assert.equal(r.updates.length,1);assert.equal(r.updates[0].maxRequests,40);
  assert.equal(Object.hasOwn(r.updates[0].config,'coverSource'),false);
  r.storage(makeState({edits:145}));verify();
 }
});

test('native covers ignore old Commons proofs and keep dynamic transclusions in owner downloads and reopened choices',async()=>{
 const {importChoices}=await import('../installer/src/model.mjs');
 const cachedCover=DailyCover.fromFeed({image:{title:'File:Old Commons proof.jpg'}},'2026-10-14',NOW);
 for(const layout of ['integrated','together','separate']) for(const blockOrder of ['cards-first','activity-first']) for(const single of [null,'cards','activity']) {
  const r=runtime({layout,blockOrder,single,coverSource:'wiki-daily',coverImage:'Preserved manual.jpg',nativeCoverSeed:true,cachedCover});
  await r.win.PerfilWiki.refresh();
  assert.equal(r.calls.length,0);assert.equal(r.storageReads.some(key=>key.endsWith('daily-cover-v1')),false);
  for(const listener of r.listeners.storage||[])listener({key:'perfilwiki-v1-'+encodeURIComponent(USER)+'-UTC-daily-cover-v1'});
  assert.equal(r.document.getElementById('dan-pu-profile-header').querySelector('.dan-pu-profile-cover img'),r.nativeOriginal.image);
  if(single!=='cards')r.win.PerfilWiki.downloadActivity();
  if(single!=='activity')r.win.PerfilWiki.downloadCards();
  const markup=(await Promise.all(r.downloads.map(blob=>blob.text()))).join('\n');
  assert.equal((markup.match(/\{\{#ifexist:/g)||[]).length,1);
  assert.equal((markup.match(/data-perfilwiki-cover-source="wiki-daily"/g)||[]).length,1);
  assert.ok(markup.includes(NativeCover.transclusion()));
  assert.doesNotMatch(markup,/Old Commons proof|Preserved manual|data:image|data-perfilwiki-daily-cover|Prévia ilustrativa|Atualize o trecho do perfil/);
  const count=r.downloads.length;r.win.PerfilWiki.downloadChoices();
  const source=await r.downloads[count].text(),choices=JSON.parse(source),reopened=importChoices(source);
  assert.equal(choices.appearance.coverSource,'wiki-daily');assert.equal(choices.coverImage,'Preserved manual.jpg');
  assert.equal(reopened.appearance.coverSource,'wiki-daily');assert.equal(reopened.coverImage,'Preserved manual.jpg');
  assert.equal(Object.hasOwn(choices,'dailyCover'),false);
  assert.doesNotMatch(source,/Old Commons proof|data:image|Descrição ilustrativa|capturedAt/);
 }
});

test('native header paint changes text and appearance without replacing the server image or touching foreign headers',()=>{
 const r=runtime({coverSource:'wiki-daily',nativeCoverSeed:'portrait',topProfile:true}),original=r.nativeOriginal;
 const updated={...r.options,displayName:'Marina Novos Estudos',appearance:{...r.appearance,topBackground:'#183047',accent:'#7a2278',nameColor:'#ffffff'}};
 assert.equal(Header.paint(r.document,makeState({edits:42}),updated),true);
 assert.equal(r.document.getElementById('dan-pu-profile-header'),original.header);
 assert.equal(original.header.querySelector('.dan-pu-profile-cover'),original.cover);
 assert.equal(original.cover.querySelector('img'),original.image);assert.equal(original.cover.querySelector('a'),original.link);
 assert.equal(original.header.style.background,'#183047');assert.equal(original.header.style.borderTopColor,'#7a2278');
 assert.match(original.header.textContent,/Marina Novos Estudos/);
 const foreign=Header.html(makeState({},'Outra pessoa'),{...r.options,user:'Outra pessoa',localCoverPreview:true});
 const document=documentFixture(foreign+'<div data-perfilwiki-group="true" data-perfilwiki-user="'+USER+'"></div>');
 const header=document.getElementById('dan-pu-profile-header'),cover=header.querySelector('.dan-pu-profile-cover'),image=cover.querySelector('img'),before=header.textContent;
 assert.equal(Header.paint(document,makeState(),updated),false);
 assert.equal(document.getElementById('dan-pu-profile-header'),header);assert.equal(header.querySelector('.dan-pu-profile-cover'),cover);
 assert.equal(cover.querySelector('img'),image);assert.equal(header.textContent,before);
});

test('anonymous and other-account visitors leave the native cover intact and start no runtime activity',()=>{
 for(const loggedUser of [null,'','Outro visitante']) {
  const r=runtime({coverSource:'wiki-daily',nativeCoverSeed:'portrait',loggedUser,topProfile:true});
  assert.equal(r.win.PerfilWiki,undefined);assert.equal(r.win.DanPURitmo,undefined);assert.equal(r.win.DanPUStats,undefined);
  assert.equal(r.calls.length,0);assert.equal(r.updates.length,0);assert.equal(r.downloads.length,0);
  assert.equal(r.storageReads.length,0);assert.equal(r.timers.size,0);assert.equal(Object.keys(r.listeners).length,0);
  assert.equal(Object.keys(r.document.events).length,0);
  assert.equal(r.document.getElementById('dan-pu-profile-header'),r.nativeOriginal.header);
  assert.equal(r.nativeOriginal.cover.querySelector('img'),r.nativeOriginal.image);
 }
});


test('individual field and item colors survive owner repaint, refresh, storage and choices downloads',async()=>{
 const fields=[{label:'Formação',values:['[[GWU]]','[[MIT]]'],layout:'lines',separator:'pipe',placement:'all',labelColor:'#772244',valueColors:['#244477','#335522']},{label:'Projeto',value:'[[História]]',placement:'all',labelColor:'#664422',valueColor:'#553377'}];
 const r=runtime({topProfile:true,customFields:fields});
 const color=node=>node.style.color||(node.getAttribute('style')||'').match(/(?:^|;)color:([^;]+)/)?.[1];
 function verify(){
  for(const id of ['dan-pu-profile-header','dan-pu-ritmo','dan-pu-estatisticas']){
   const root=r.document.getElementById(id),scope=id==='dan-pu-ritmo'?root.querySelector('.dan-pu-profile-slot'):id==='dan-pu-estatisticas'?root.querySelector('.dan-pu-cards-profile'):root.querySelector('.dan-pu-top-profile-slot');
   const rows=scope.querySelectorAll('.dan-pu-profile-field');assert.equal(rows.length,2,id);
   assert.equal(color(rows[0].querySelector('span')),'#772244');
   assert.deepEqual(rows[0].querySelectorAll('a').map(color),['#244477','#335522']);
   assert.equal(color(rows[1].querySelector('span')),'#664422');assert.equal(color(rows[1].querySelector('a')),'#553377');
  }
 }
 verify();await r.win.PerfilWiki.refresh();verify();r.storage(makeState({edits:154}));verify();
 assert.equal(Object.hasOwn(r.updates[0].config,'customFields'),false,'Presentation colors do not enter metric identity');
 r.win.PerfilWiki.downloadChoices();const choices=JSON.parse(await r.downloads[0].text());assert.deepEqual(choices.customFields,fields);
 const {importChoices}=await import('../installer/src/model.mjs');assert.deepEqual(importChoices(JSON.stringify(choices)).customFields,fields);
 r.win.PerfilWiki.downloadActivity();const wiki=await r.downloads[1].text();for(const hex of ['#772244','#244477','#335522','#664422','#553377'])assert.ok(wiki.includes(hex));
});
