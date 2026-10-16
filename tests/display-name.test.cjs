'use strict';
const {createLockManager}=require('./transport-lock-fixture.cjs');

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Configuration = require('../src/Configuration.js');
const Appearance = require('../src/Appearance.js');
const Activity = require('../src/ActivityView.js');
const Cache = require('../src/Cache.js');
const Core = require('../src/PageviewsCore.js');
const Presenter = require('../src/Presenter.js');
const USER = 'Editora Exemplo';
const NOW = '2024-08-20T12:00:00Z';

function resolve(displayName, extra = {}) {
    return Configuration.resolve({config:{get:key => key === 'wgUserName' ? USER : null}},
        {PerfilWikiConfig:{user:USER,timeZone:'UTC',...extra,...(displayName === undefined ? {} : {displayName})}});
}
function state() {
    const config = resolve().metrics;
    const entries = [[5,9,0,'Exemplo','2024-08-19T12:00:00Z',0]];
    return {config,capturedAt:NOW,activity:{complete:true,capturedAt:NOW,entries,
        identity:{user:USER,project:config.project},summary:Core.summarize(entries,{config,now:NOW})},
        statistics:{user:USER,metrics:{edits:1}},pageviews:null,fresh:true};
}

test('a missing or blank display name uses the normalized real account', () => {
    for (const value of [undefined,'','   ','\u00a0']) assert.equal(resolve(value).displayName,USER);
    assert.equal(resolve(undefined,{user:'  E\u0301rica_Exemplo  '}).displayName,'Érica Exemplo');
});

test('display names normalize Unicode and permit ordinary punctuation and emoji', () => {
    assert.equal(resolve('  E\u0301rica "Wikipédia" & D\'Ávila 🧩  ').displayName,'Érica "Wikipédia" & D\'Ávila 🧩');
    assert.equal(resolve('🧩'.repeat(100)).displayName,'🧩'.repeat(100));
    assert.throws(() => resolve('🧩'.repeat(101)),/100 caracteres/);
});

test('display names reject markup, controls and non-string values', () => {
    for (const value of [null,0,{},[],...Array.from('<>[]{}|'), 'linha\nquebra','\tNome','Nome\u0085','Nome\u009f']) {
        assert.throws(() => resolve(value),/exibição/);
    }
});

test('display name stays outside every metric, account and cache configuration', () => {
    const normal = resolve();
    const changed = resolve('Outro nome público');
    assert.deepEqual(changed.metrics,normal.metrics);
    assert.deepEqual(changed.appearance,normal.appearance);
    assert.equal(changed.stylesPage,normal.stylesPage);
    assert.equal(changed.documentationPage,normal.documentationPage);
    assert.equal(Object.hasOwn(changed.metrics,'displayName'),false);
});

test('the activity label changes without changing account attributes or article URLs', () => {
    const input = state();
    const label = resolve('Érica "Wiki" & D\'Ávila 🧩').displayName;
    for (const render of [Activity.html,Activity.wikitext]) {
        const output = render(input,{displayName:label,now:NOW,appearance:{profilePlacement:'activity'}});
        assert.match(output,/class="dan-pu-profile-label"[^>]*>Érica &quot;Wiki&quot; &amp; D&#39;Ávila 🧩</);
        assert.match(output,/Visualizações dos artigos editados por Érica &quot;Wiki&quot; &amp; D&#39;Ávila 🧩\./);
        assert.match(output,/data-perfilwiki-user="Editora Exemplo"/);
        assert.doesNotMatch(output,/data-perfilwiki-user="Érica/);
        assert.deepEqual(input.config,resolve().metrics);
    }
});

test('direct view options cannot inject templates, signatures or HTML into saved wikitext', () => {
    const output = Activity.wikitext(state(),{displayName:'{{evil}} [[target]] | ~~~~ <script> " &'});
    assert.match(output,/&#123;&#123;evil&#125;&#125;/);
    assert.match(output,/&#91;&#91;target&#93;&#93;/);
    assert.match(output,/&#126;&#126;&#126;&#126;/);
    assert.match(output,/&lt;script&gt; &quot; &amp;/);
    assert.doesNotMatch(output,/\{\{evil|\[\[target|~~~~|<script>/);
    assert.match(Activity.html(state(),{displayName:'  '}),/Visualizações dos artigos editados por Editora Exemplo\./);
});

test('display names remain literal when they contain wiki behavioral switches', () => {
    const label = resolve('__NOTOC__ __NOINDEX__').displayName;
    const saved = Activity.wikitext(state(),{displayName:label,appearance:{profilePlacement:'activity'}});
    assert.match(saved,/&#95;&#95;NOTOC&#95;&#95; &#95;&#95;NOINDEX&#95;&#95;/);
    assert.doesNotMatch(saved,/__NOTOC__|__NOINDEX__/);
    assert.match(Activity.html(state(),{displayName:label,appearance:{profilePlacement:'activity'}}),/>__NOTOC__ __NOINDEX__</);
});

function runtime(displayName, {store = new Map(),loggedUser = USER,preserved = null} = {}) {
    const fetches = [],updates = [],downloads = [],rendered = [];
    const panel = {style:{},outerHTML:'',getAttribute:key => key === 'data-perfilwiki-user' ? USER : null,
        querySelector:selector => selector === '.dan-pu-readership' ? preserved : null,
        querySelectorAll:() => []};
    const document = {readyState:'complete',hidden:false,
        getElementById:id => id === 'dan-pu-ritmo' ? panel : null,addEventListener:() => {},
        createElement:tag => { assert.equal(tag,'a'); return {click:() => {}}; }};
    const mwConfig = {wgDBname:'ptwiki',wgAction:'view',wgUserName:loggedUser,wgRelevantUserName:USER,wgNamespaceNumber:2};
    class LocalURL extends URL {
        static createObjectURL(blob) { downloads.push(blob); return 'blob:local-fixture'; }
        static revokeObjectURL() {}
    }
    const win = {document,console,location:{hash:''},navigator:{locks:createLockManager()},
        PerfilWikiConfig:{user:USER,displayName,timeZone:'UTC'},PerfilWikiConfiguration:Configuration,
        PerfilWikiAppearance:Appearance,PerfilWikiCache:Cache,PerfilWikiPresenter:Presenter,
        PerfilWikiActivityView:{html:(value,options) => { rendered.push(options); return Activity.html(value,options); },
            wikitext:Activity.wikitext},
        PerfilWikiCoordinator:{validateState:() => ({valid:true}),update:async options => {
            updates.push(options);
            const url = 'https://pt.wikipedia.org/w/api.php?action=query&list=usercontribs&ucuser=' + encodeURIComponent(options.config.user);
            await options.requestJson(url);
            return {...state(),config:options.config};
        }},
        localStorage:{getItem:key => store.get(key) || null,setItem:(key,value) => store.set(key,value)},
        setTimeout:() => 1,clearTimeout:() => {},setInterval:() => 1,clearInterval:() => {},addEventListener:() => {},
        fetch:async (url,options) => { fetches.push({url,options}); return {ok:true,json:async () => ({query:{usercontribs:[]}})}; },
        mw:{config:{get:key => mwConfig[key]},loader:{using:() => Promise.resolve()},util:{addPortletLink:() => null}}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),
        {window:win,Intl,Date,URL:LocalURL,Blob,Set,Map,AbortController});
    return {win,store,fetches,updates,downloads,rendered,panel};
}

test('runtime reuses cached account data after the display name changes and keeps anonymous API identity', async () => {
    const prefix = 'perfilwiki-v1-' + encodeURIComponent(USER) + '-UTC-';
    const store = new Map([[prefix+'cache',Cache.packJson(JSON.stringify(state()))]]);
    const first = runtime('Primeiro nome',{store});
    assert.equal(first.win.PerfilWiki.version,'1.20.0');
    assert.equal(first.rendered[0].displayName,'Primeiro nome');
    assert.equal(first.win.PerfilWiki.getState().config.user,USER);
    const second = runtime('Nome alterado',{store});
    assert.ok(second.win.PerfilWiki.getState(),'A label change must keep the valid account cache');
    assert.equal(second.rendered[0].displayName,'Nome alterado');
    await second.win.PerfilWiki.refresh();
    assert.equal(second.updates.length,1);
    assert.equal(second.updates[0].config.user,USER);
    assert.equal(Object.hasOwn(second.updates[0].config,'displayName'),false);
    assert.equal(new URL(second.fetches[0].url).searchParams.get('ucuser'),USER);
    assert.equal(second.fetches[0].options.credentials,'omit');
    assert.equal(second.fetches[0].options.method,'GET');
    assert.ok([...store.keys()].every(key => key.startsWith(prefix) || ['timing-available','next-start-v1','action-next-v1','pausas','bloqueio'].some(name=>key==='perfilwiki-transport-v1-'+name)),'Only account metrics or fixed nonpersonal transport coordination keys may be stored');
    second.win.PerfilWiki.download();
    assert.equal(second.downloads.length,1);
    assert.match(await second.downloads[0].text(),/Visualizações dos artigos editados por Nome alterado\./);
});

test('the display label cannot satisfy the real account owner guard', () => {
    const value = runtime('Outra pessoa',{loggedUser:'Outra pessoa'});
    assert.equal(value.win.PerfilWiki,undefined);
    assert.equal(value.fetches.length,0);
});

test('preserved pageview totals receive the current display heading without losing their values', () => {
    const prefix = 'perfilwiki-v1-' + encodeURIComponent(USER) + '-UTC-';
    const store = new Map([[prefix+'cache',Cache.packJson(JSON.stringify(state()))]]);
    const heading = {textContent:'Visualizações dos artigos editados por Nome anterior.'};
    const attributes = {'data-perfilwiki-user':USER,'data-perfilwiki-project':'pt.wikipedia.org',
        'data-metric-version':'after-first-edit-v1','data-total-model':'all-periods-all-eligible-v1'};
    const preserved = {getAttribute:key => attributes[key],querySelector:() => heading,querySelectorAll:() => [],
        replaceWith:() => {},totals:12345};
    runtime('Nome novo',{store,preserved});
    assert.equal(heading.textContent,'Visualizações dos artigos editados por Nome novo.');
    assert.equal(preserved.totals,12345);
});
