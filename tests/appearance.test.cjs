'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Appearance = require('../src/Appearance.js');
const Configuration = require('../src/Configuration.js');
const Cards = require('../src/CardsView.js');
const Activity = require('../src/ActivityView.js');
const Core = require('../src/PageviewsCore.js');
const fs = require('node:fs');
const vm = require('node:vm');

const user = 'Editora Exemplo';
const now = '2024-08-20T12:00:00Z';
function activity() {
    const entries = [[5,9,0,'Exemplo','2024-08-19T12:00:00Z',0]];
    return {complete:true, capturedAt:now, entries, identity:{user,project:'pt.wikipedia.org'},
        summary:Core.summarize(entries,{config:{user,project:'pt.wikipedia.org',timeZone:'UTC'},now})};
}
test('appearance defaults are isolated, ordered and right aligned', () => {
    const one = Appearance.normalize();
    assert.equal(one.alignment, 'right');
    assert.equal(one.initialPeriod, '30d');
    assert.equal(one.density, 'comfortable');
    assert.equal(one.layout, 'integrated');
    assert.equal(one.nameFontSize,24);
    assert.equal(one.cardColumns, 'auto');
    assert.deepEqual(one.metrics, Appearance.defaults.metrics);
    one.metrics.reverse();
    assert.notDeepEqual(one.metrics, Appearance.normalize().metrics);
    assert.equal(Appearance.normalize({theme:'forest'}).accent, '#246342');
    assert.equal(Appearance.normalize({accent:'#FfEeAA'}).theme, 'custom');
});
test('display-name size is an independent numeric choice and older configurations use twenty-four pixels', () => {
    assert.equal(Appearance.normalize({nameFontSize:undefined}).nameFontSize,24);
    for(const nameFontSize of [16,20,24,28,32,36]) {
        const settings=Appearance.normalize({nameFontSize,nameAlignment:'center',alignment:'right',density:'compact'});
        assert.equal(settings.nameFontSize,nameFontSize);
        assert.equal(settings.nameAlignment,'center');
        assert.equal(settings.alignment,'right');
        const resolved=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:{user,timeZone:'UTC',appearance:{nameFontSize}}});
        assert.equal(resolved.appearance.nameFontSize,nameFontSize);
        assert.equal(Object.hasOwn(resolved.metrics,'nameFontSize'),false);
    }
    for(const nameFontSize of [null,'24',0,-16,18,25,40,NaN,Infinity,{},[],true,'24px;color:red'])assert.throws(()=>Appearance.normalize({nameFontSize}),String(nameFontSize));
});
test('malformed appearance cannot become a style, selector or script injection', () => {
    for (const value of [null,[],{unknown:true},{accent:'#fff'},{accent:'#ffffff;color:red'},
        {accent:'red'},{accent:'url(javascript:alert(1))'},{alignment:'right;display:none'},
        {density:'dense'},{theme:'invented'},{layout:'floating'},{initialPeriod:'tomorrow'},
        {cardColumns:2},{cardColumns:'1'},{cardColumns:'6'},{cardColumns:'4;display:none'},
        {metrics:['edits','edits']},{metrics:['unknown']},{metrics:[]},{showCards:'false'},
        {showCards:false,showActivity:false}]) {
        assert.throws(()=>Appearance.normalize(value), JSON.stringify(value));
    }
    assert.deepEqual(Appearance.normalize({showCards:false,metrics:[]}).metrics, []);
});
test('arbitrary accent colors keep readable text including middle tones', () => {
    for (const accent of ['#ffffff','#000000','#ffff00','#777777','#767676','#808080','#3366cc','#246342','#ff0099',
        ...Array.from({length:64},(_,i)=>'#'+(i*265443 % 0xffffff).toString(16).padStart(6,'0'))]) {
        const colors = Appearance.colors({accent});
        assert.equal(colors.accent, accent);
        assert.ok(Appearance.contrast(colors.ink,'#ffffff') >= 4.5, accent + ' on white');
        assert.ok(Appearance.contrast(colors.ink,colors.tint) >= 4.5, accent + ' on selected tint');
        assert.ok(Appearance.contrast(colors.foreground,accent) >= 4.5, accent + ' foreground');
        assert.equal(colors.palette.length,5);
        assert.ok(colors.palette.every(color=>/^#[a-f0-9]{6}$/.test(color)));
    }
});
test('presentation settings do not enter metrics or alter collection limits', () => {
    const resolved = Configuration.resolve({config:{get:()=>user}}, {PerfilWikiConfig:{timeZone:'UTC',
        appearance:{accent:'#123456',alignment:'center',metrics:['thanks','edits'],initialPeriod:'since'}}});
    assert.equal(resolved.appearance.accent,'#123456');
    assert.equal(resolved.appearance.alignment,'center');
    assert.equal(resolved.metrics.rankLimit,1000);
    assert.equal(Object.hasOwn(resolved.metrics,'appearance'),false);
});
test('real card renderer applies selection, ordering, alignment and compact density to exports too', () => {
    const options={user,now,appearance:{accent:'#246342',alignment:'left',density:'compact',metrics:['thanks','edits']}};
    for (const html of [Cards.html({user,metrics:{thanks:10,edits:20}},null,options), Cards.wikitext({user,metrics:{thanks:10,edits:20}},null,options)]) {
        assert.ok(html.indexOf('id="dan-pu-agradecimentos"') < html.indexOf('id="dan-pu-edicoes"'));
        assert.doesNotMatch(html,/id="perfilwiki-anos"|id="dan-pu-artigos"/);
        assert.match(html,/text-align:left;/);
        assert.match(html,/padding:12px 14px;/);
        assert.match(html,/color:#246342;/);
        assert.match(html,/data-perfilwiki-appearance="\{&quot;theme/);
    }
    assert.equal(Cards.html({user,metrics:{}},null,{user,appearance:{showCards:false}}),'');
});
test('activity exports preserve appearance, Portuguese heading, period and independent visibility', () => {
    const state={config:{user,timeZone:'UTC'},capturedAt:now,activity:activity(),pageviews:null};
    for (const initialPeriod of ['30d','90d','12m','since']) {
        const html=Activity.wikitext(state,{appearance:{initialPeriod,accent:'#6854a4',density:'compact'}});
        assert.match(html,/Atividade na Wikipédia em Português/);
        assert.ok(html.includes('dan-pu-initial-'+initialPeriod));
        assert.match(html,/border-top:3px solid #6854a4;/);
        assert.match(html,/background:#6854a4;/);
        assert.match(html,/data-perfilwiki-appearance=/);
        assert.doesNotMatch(html,/background:#36c;/);
    }
    assert.equal(Activity.html(state,{appearance:{showActivity:false}}),'');
});
test('column choices and roomy spacing travel through saved and live panel markup', () => {
    const state={config:{user,timeZone:'UTC'},capturedAt:now,activity:activity(),pageviews:null};
    for (const cardColumns of ['auto','2','3','4','5']) {
        const settings={cardColumns,density:'roomy',metrics:['thanks']};
        assert.equal(Appearance.normalize(settings).cardColumns,cardColumns);
        assert.match(Appearance.classes(settings),new RegExp('dan-pu-columns-'+cardColumns+'$'));
        for (const html of [Cards.html({user,metrics:{thanks:10}},null,{user,appearance:settings}),
            Cards.wikitext({user,metrics:{thanks:10}},null,{user,appearance:settings}),
            Activity.html(state,{appearance:settings}),Activity.wikitext(state,{appearance:settings})]) {
            assert.match(html,/dan-pu-density-roomy/);
            assert.ok(html.includes('dan-pu-columns-'+cardColumns));
            assert.ok(html.includes('&quot;cardColumns&quot;:&quot;'+cardColumns+'&quot;'));
        }
        for (const html of [Activity.html(state,{appearance:settings}),Activity.wikitext(state,{appearance:settings})]) {
            assert.match(html,/margin:2\.1em 0;padding:32px;/);
            assert.match(html,/class="dan-pu-readership"[^>]+padding:24px;/);
        }
    }
});
test('additional counter choices are allowed without changing the original eight defaults', () => {
    const extra=['articleEdits','talkEdits','activeMonths','busiestDay','edits30','averagePerActiveDay','activeYears','busiestMonth','thanksSent','averageBytesPerEdit','largestAddition','largestRemoval'];
    assert.equal(Appearance.metricIds.length,24);
    assert.equal(Appearance.defaults.metrics.length,8);
    assert.deepEqual(Appearance.normalize({metrics:extra,highlightedMetrics:extra}).metrics,extra);
    for (const key of extra) assert.equal(Appearance.defaults.metrics.includes(key),false);
});
test('cards-only installations gate optional sent-thanks collection without changing cache identity', async () => {
    for (const selected of [['thanks','edits'], ['thanksSent','averageBytesPerEdit']]) {
    const store = new Map(), painted = [], updated = [], timers = [];
    const cards = {style:{}, getAttribute:key=>key === 'data-perfilwiki-user' ? user : null,
        setAttribute:()=>{}, querySelector:()=>null};
    const document = {readyState:'complete',hidden:false,getElementById:id=>id === 'dan-pu-estatisticas' ? cards : null,
        addEventListener:()=>{}};
    const mwConfig={wgDBname:'ptwiki',wgAction:'view',wgUserName:user,wgRelevantUserName:user,wgNamespaceNumber:2};
    const win={document, console, location:{hash:''}, navigator:{},
        PerfilWikiConfig:{user,timeZone:'UTC',appearance:{showActivity:false,metrics:selected,alignment:'center',initialPeriod:'90d'}},
        PerfilWikiConfiguration:Configuration, PerfilWikiAppearance:Appearance, PerfilWikiActivityView:Activity,
        PerfilWikiCache:{}, PerfilWikiPresenter:require('../src/Presenter.js'),
        PerfilWikiCardsView:{paint:(...args)=>painted.push(args)},
        PerfilWikiCoordinator:{validateState:()=>({valid:true}),update:async options=>{
            updated.push(options); return {config:options.config,capturedAt:now,activity:activity(),statistics:{user,metrics:{edits:1}},fresh:true};
        }},
        localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},
        setTimeout:(fn,delay)=>{timers.push(delay);return timers.length;},clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{},
        addEventListener:()=>{},
        mw:{config:{get:key=>mwConfig[key]},loader:{using:()=>Promise.resolve()},util:{addPortletLink:()=>null}}
    };
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),{window:win,Intl,Date,URL,Set,Map,AbortController});
    await Promise.resolve();
    assert.ok(win.PerfilWiki, 'cards-only page must initialize');
    assert.ok(timers.includes(1500), 'initial anonymous refresh remains deferred');
    assert.equal(win.PerfilWiki.getAppearance().alignment,'center');
    assert.equal(painted[0][4].showActivity,false);
    await win.PerfilWiki.refresh();
    assert.equal(updated.length,1);
    assert.equal(updated[0].activePeriod,'90d');
    assert.equal(updated[0].includeThanksSent,selected.includes('thanksSent'));
    assert.equal(Object.hasOwn(updated[0].config,'appearance'),false);
    assert.equal(win.PerfilWiki.getState().statistics.metrics.edits,1);
    }
});
test('a copied snapshot cannot retain another user\'s optional article, byte or day counters', async () => {
    const metrics = ['mostEditedArticle','bytesAdded','bytesRemoved','articleEdits','talkEdits','activeMonths','busiestDay','edits30','averagePerActiveDay','activeYears','busiestMonth','thanksSent','averageBytesPerEdit','largestAddition','largestRemoval'];
    const settings = Appearance.normalize({showActivity:false,metrics});
    const oldArticle = {pageid:99,title:'Artigo da outra pessoa',edits:123};
    function element(text, attributes = {}) {
        return {textContent:text,style:{},attributes:{...attributes},
            getAttribute(key) { return this.attributes[key] ?? null; },
            setAttribute(key,value) { this.attributes[key] = String(value); },
            removeAttribute(key) { delete this.attributes[key]; },querySelector:()=>null};
    }
    const nodes = new Map([
        ['dan-pu-estatisticas',element('',{'data-perfilwiki-user':'Outra pessoa',
            'data-perfilwiki-appearance':JSON.stringify(settings),'data-perfilwiki-rendered':'ready'})],
        ['dan-pu-artigo-mais-editado',element('Artigo da outra pessoa123 edições',
            {'data-perfilwiki-most-edited':JSON.stringify(oldArticle)})],
        ['dan-pu-bytes-acrescentados',element('1 MiB',{title:'1.048.576 bytes'})],
        ['dan-pu-bytes-removidos',element('1 KiB',{title:'1.024 bytes'})],
        ['dan-pu-edicoes-em-artigos',element('100')],
        ['dan-pu-edicoes-em-discussoes',element('50')],
        ['dan-pu-meses-com-edicoes',element('10 meses')],
        ['dan-pu-dia-com-mais-edicoes',element('01/01/2020',{
            'data-perfilwiki-busiest-day':JSON.stringify({date:'2020-01-01',edits:123})})],
        ['dan-pu-edicoes-30-dias',element('123')],
        ['dan-pu-media-por-dia-ativo',element('42,5')],
        ['dan-pu-anos-com-edicoes',element('12 anos')],
        ['dan-pu-agradecimentos-enviados',element('100')],
        ['dan-pu-media-bytes-por-edicao',element('25,5 B')],
        ['dan-pu-maior-acrescimo',element('1 KiB')],
        ['dan-pu-maior-remocao',element('2 KiB')],
        ['dan-pu-mes-com-mais-edicoes',element('janeiro de 2020',{
            'data-perfilwiki-busiest-month':JSON.stringify({month:'2020-01',edits:123})})]
    ]);
    const document = {readyState:'complete',hidden:false,getElementById:id=>nodes.get(id)||null,
        addEventListener:()=>{},createElement:()=>assert.fail('Unknown data must not restore the old article link')};
    const mwConfig = {wgDBname:'ptwiki',wgAction:'view',wgUserName:user,wgRelevantUserName:user,wgNamespaceNumber:2};
    const win = {document,console,location:{hash:''},navigator:{},
        PerfilWikiConfig:{user,timeZone:'UTC',appearance:settings},
        PerfilWikiConfiguration:Configuration,PerfilWikiAppearance:Appearance,PerfilWikiCardsView:Cards,
        PerfilWikiActivityView:Activity,PerfilWikiCache:{},PerfilWikiPresenter:require('../src/Presenter.js'),
        PerfilWikiCoordinator:{validateState:()=>({valid:true}),update:()=>assert.fail('Initial data requests must remain deferred')},
        localStorage:{getItem:()=>null,setItem:()=>{}},setTimeout:()=>1,clearTimeout:()=>{},
        setInterval:()=>1,clearInterval:()=>{},addEventListener:()=>{},
        mw:{config:{get:key=>mwConfig[key]},loader:{using:()=>Promise.resolve()},util:{addPortletLink:()=>null}}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/Runtime.js'),'utf8'),{window:win,Intl,Date,URL,Set,Map,AbortController});
    await Promise.resolve();
    assert.ok(win.PerfilWiki);
    assert.equal(nodes.get('dan-pu-estatisticas').getAttribute('data-perfilwiki-user'),user);
    for (const id of ['dan-pu-artigo-mais-editado','dan-pu-bytes-acrescentados','dan-pu-bytes-removidos','dan-pu-edicoes-em-artigos','dan-pu-edicoes-em-discussoes','dan-pu-meses-com-edicoes','dan-pu-dia-com-mais-edicoes','dan-pu-edicoes-30-dias','dan-pu-media-por-dia-ativo','dan-pu-anos-com-edicoes','dan-pu-mes-com-mais-edicoes','dan-pu-agradecimentos-enviados','dan-pu-media-bytes-por-edicao','dan-pu-maior-acrescimo','dan-pu-maior-remocao']) {
        assert.equal(nodes.get(id).textContent,'Aguardando dados');
        assert.equal(nodes.get(id).getAttribute('title'),null);
        assert.equal(nodes.get(id).getAttribute('data-perfilwiki-most-edited'),null);
        assert.equal(nodes.get(id).getAttribute('data-perfilwiki-busiest-day'),null);
        assert.equal(nodes.get(id).getAttribute('data-perfilwiki-busiest-month'),null);
    }
    assert.equal(win.PerfilWiki.getState(),null);
});
