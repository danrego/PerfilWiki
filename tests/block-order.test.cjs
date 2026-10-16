'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Appearance = require('../src/Appearance.js');
const Cards = require('../src/CardsView.js');
const Activity = require('../src/ActivityView.js');
const Configuration = require('../src/Configuration.js');
const Core = require('../src/PageviewsCore.js');
const Presenter = require('../src/Presenter.js');

const USER = 'Editora Exemplo';
const NOW = '2024-08-20T12:00:00Z';
const DOCUMENTATION = 'Usuário:Exemplo/Como instalar';
function state() {
    const config = Configuration.resolve({config:{get:() => USER}}, {PerfilWikiConfig:{user:USER,timeZone:'UTC'}}).metrics;
    const entries = [[5,9,0,'Exemplo','2024-08-19T12:00:00Z',0]];
    return {config,capturedAt:NOW,activity:{complete:true,capturedAt:NOW,entries,
        identity:{user:USER,project:config.project},summary:Core.summarize(entries,{config,now:NOW})},
        statistics:{user:USER,metrics:{edits:1}},pageviews:null,fresh:true};
}

test('one installation footer belongs to the last visible block for either order and either export format', () => {
    const value = state();
    for (const blockOrder of ['cards-first','activity-first']) {
        for (const visibility of [{showCards:true,showActivity:true},{showCards:true,showActivity:false},{showCards:false,showActivity:true}]) {
            const appearance = {...visibility,blockOrder,layout:'together'};
            const expected = visibility.showCards && (!visibility.showActivity || blockOrder === 'activity-first') ? 'cards' : 'activity';
            assert.equal(Appearance.footerOwner(appearance),expected);
            for (const format of ['html','wikitext']) {
                const options = {user:USER,now:NOW,documentationPage:DOCUMENTATION,appearance};
                const cards = Cards[format](value.statistics,value.activity,options);
                const activity = Activity[format](value,options);
                assert.equal((cards+activity).split('Gostou deste painel?').length-1,1,JSON.stringify({blockOrder,...visibility,format}));
                const owner = expected === 'cards' ? cards : activity;
                assert.ok(owner.includes('Gostou deste painel?'));
                assert.ok(format === 'wikitext' ? owner.includes('[['+DOCUMENTATION+'|') : owner.includes(encodeURIComponent(DOCUMENTATION.replace(/ /g,'_'))));
                assert.ok(owner.includes('Veja como adicionar à sua página de usuário.'));
            }
        }
    }
});

test('pending activity keeps the sole installation footer when it is the visible final block', () => {
    const empty = {config:{user:USER,timeZone:'UTC'}};
    for (const format of ['html','wikitext']) {
        const output = Activity[format](empty,{documentationPage:DOCUMENTATION,appearance:{showCards:false}});
        assert.equal(output.split('Gostou deste painel?').length-1,1);
        assert.match(output,/As estatísticas ainda não foram consultadas/);
        assert.doesNotMatch(Activity[format](empty,{appearance:{blockOrder:'activity-first',layout:'together'}}),/Gostou deste painel/);
    }
});

// This small DOM fixture exercises the runtime's actual calls without a browser
// session, storage credentials, an API transport or a Wikipedia login.
class Node {
    constructor(id='',attributes={}) { this.id=id;this.attributes={...attributes};this.children=[];this.parentNode=null;this.style={};this.textContent='';this.childNodes=this.children; }
    appendChild(node) { if (node.parentNode) node.parentNode.removeChild(node);this.children.push(node);node.parentNode=this;return node; }
    removeChild(node) { const index=this.children.indexOf(node);assert.notEqual(index,-1);this.children.splice(index,1);node.parentNode=null;return node; }
    insertBefore(node,next) { this.removeChild(node);const index=this.children.indexOf(next);assert.notEqual(index,-1);this.children.splice(index,0,node);node.parentNode=this;return node; }
    getAttribute(key) { return this.attributes[key] ?? null; }
    setAttribute(key,value) { this.attributes[key]=String(value); }
    removeAttribute(key) { delete this.attributes[key]; }
    querySelector(selector) { for (const child of this.children) { if (selector[0]==='#' ? child.id===selector.slice(1) : child.tagName===selector) return child;const nested=child.querySelector(selector);if (nested) return nested; }return null; }
    querySelectorAll() { return []; }
    set outerHTML(markup) {
        const replacement=new Node(this.id,this.attributes);replacement.textContent=markup;
        if (this.parentNode) { const parent=this.parentNode,index=parent.children.indexOf(this);parent.children[index]=replacement;replacement.parentNode=parent;this.parentNode=null; }
    }
}
function runtime({blockOrder='cards-first',layout='together',group=true,groupUser=USER,activityUser=USER,nested=false,single=null,cached=true,savedFooter=false}={}) {
    const outside=new Node('outside'),before=new Node('before'),after=new Node('after');
    before.textContent='Meu texto antes do painel';after.textContent='Meu texto depois do painel';
    const container=new Node('container',group ? {'data-perfilwiki-group':'true','data-perfilwiki-user':groupUser} : {});
    const cards=new Node('dan-pu-estatisticas',{'data-perfilwiki-user':USER});
    const activity=new Node('dan-pu-ritmo',{'data-perfilwiki-user':activityUser});
    function footer(root) { const node=new Node('dan-pu-ritmo-install'),link=new Node();node.textContent='Gostou deste painel? ';link.tagName='a';link.href='https://example.invalid/old-documentation';node.appendChild(link);root.appendChild(node);return node; }
    if (savedFooter) footer(activity);
    outside.appendChild(before);outside.appendChild(container);outside.appendChild(after);
    if (single!=='activity') container.appendChild(cards);
    if (single!=='cards') { if (nested) { const nest=new Node('nested');container.appendChild(nest);nest.appendChild(activity); } else container.appendChild(activity); }
    const store=new Map(cached ? [['perfilwiki-v1-'+encodeURIComponent(USER)+'-UTC-cache',JSON.stringify(state())]] : []);
    const paintOptions=[],activityOptions=[],downloads=[];
    const document={readyState:'complete',hidden:false,getElementById:id=>outside.querySelector('#'+id),
        querySelectorAll:selector=>selector==='[data-perfilwiki-group="true"]' && group ? [container] : [],
        addEventListener:()=>{},createElement:tag=>{assert.ok(['a','div'].includes(tag));const node=new Node();node.tagName=tag;node.click=()=>{};return node;}};
    const config={wgDBname:'ptwiki',wgAction:'view',wgUserName:USER,wgRelevantUserName:USER,wgNamespaceNumber:2};
    class LocalURL extends URL { static createObjectURL(blob) { downloads.push(blob);return 'blob:local'; }static revokeObjectURL() {} }
    const win={document,console,location:{hash:''},navigator:{},
        PerfilWikiConfig:{user:USER,timeZone:'UTC',documentationPage:DOCUMENTATION,appearance:{blockOrder,layout,
            showCards:single!=='activity',showActivity:single!=='cards'}},
        PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiPresenter:Presenter,
        PerfilWikiCache:{parseJson:JSON.parse},PerfilWikiCoordinator:{validateState:()=>({valid:true}),update:()=>assert.fail('No data transport is needed')},
        PerfilWikiCardsView:{paint:(doc,statistics,history,now,appearance,options)=>{
            paintOptions.push(options);const root=doc.getElementById('dan-pu-estatisticas');if (root) { root.outerHTML='Repainted counters';if (Appearance.footerOwner(appearance)==='cards') footer(doc.getElementById('dan-pu-estatisticas')); }
        },wikitext:(statistics,history,options)=>{paintOptions.push(options);return Cards.wikitext(statistics,history,options);}},
        PerfilWikiActivityView:{html:(value,options)=>{activityOptions.push(options);return 'Repainted activity';},wikitext:Activity.wikitext},
        localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},
        setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{},addEventListener:()=>{},
        fetch:()=>assert.fail('The ordering fixture must never contact a network'),
        mw:{config:{get:key=>config[key]},loader:{using:()=>Promise.resolve()},util:{addPortletLink:()=>null}}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),{window:win,Intl,Date,URL:LocalURL,Blob,Set,Map,AbortController});
    return {win,outside,before,after,container,paintOptions,activityOptions,downloads};
}

test('runtime orders only its generated group and restores that order after outerHTML repaints', () => {
    for (const blockOrder of ['cards-first','activity-first']) {
        const value=runtime({blockOrder});
        assert.equal(value.win.PerfilWiki.version,require('../package.json').version);
        const expected=blockOrder==='cards-first' ? ['dan-pu-estatisticas','dan-pu-ritmo'] : ['dan-pu-ritmo','dan-pu-estatisticas'];
        assert.deepEqual(value.container.children.map(node=>node.id),expected);
        assert.deepEqual(value.outside.children.map(node=>node.id),['before','container','after']);
        assert.equal(value.before.textContent,'Meu texto antes do painel');
        assert.equal(value.after.textContent,'Meu texto depois do painel');
        assert.ok(value.paintOptions.length>=2,'Counters must have been replaced on both initialization and cached repaint');
        assert.equal(value.activityOptions.length,1,'Activity root must have been replaced as well');
        assert.ok(value.paintOptions.every(options=>options.user===USER && options.documentationPage===DOCUMENTATION));
        assert.equal(value.activityOptions[0].documentationPage,DOCUMENTATION);
    }
});

test('legacy placement, separate blocks, foreign groups, nested roots and single blocks keep source order', () => {
    for (const options of [{group:false},{layout:'separate'},{groupUser:'Outra pessoa'},{activityUser:'Outra pessoa'},{nested:true},{single:'cards'},{single:'activity'}]) {
        const value=runtime({blockOrder:'activity-first',...options});
        const expected=options.single==='activity' ? ['dan-pu-ritmo'] : options.single==='cards' ? ['dan-pu-estatisticas'] : options.nested ? ['dan-pu-estatisticas','nested'] : ['dan-pu-estatisticas','dan-pu-ritmo'];
        assert.deepEqual(value.container.children.map(node=>node.id),expected,JSON.stringify(options));
        assert.deepEqual(value.outside.children.map(node=>node.id),['before','container','after']);
    }
});

test('counter download receives the configured installation documentation page', async () => {
    const value=runtime({single:'cards'});
    value.win.PerfilWiki.downloadCards();
    assert.equal(value.downloads.length,1);
    assert.match(await value.downloads[0].text(),/\[\[Usuário:Exemplo\/Como instalar\|/);
});

test('cold startup moves footer ownership without waiting for data or duplicating the saved activity invitation', () => {
    for (const blockOrder of ['cards-first','activity-first']) {
        const value=runtime({blockOrder,cached:false,savedFooter:true});
        assert.equal(value.win.PerfilWiki.getState(),null);
        const cards=value.container.querySelector('#dan-pu-estatisticas');
        const activity=value.container.querySelector('#dan-pu-ritmo');
        const cardsFooter=cards.querySelector('#dan-pu-ritmo-install');
        const activityFooter=activity.querySelector('#dan-pu-ritmo-install');
        assert.equal(Number(!!cardsFooter)+Number(!!activityFooter),1);
        assert.equal(!!cardsFooter,blockOrder==='activity-first');
        if (activityFooter) assert.equal(activityFooter.querySelector('a').href,'https://pt.wikipedia.org/wiki/'+encodeURIComponent(DOCUMENTATION.replace(/ /g,'_')));
    }
    const activityOnly=runtime({single:'activity',cached:false});
    const pending=activityOnly.container.querySelector('#dan-pu-ritmo');
    assert.ok(pending.querySelector('#dan-pu-ritmo-install'),'An older snapshot without an invitation receives one immediately');
});
