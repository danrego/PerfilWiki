'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Activity = require('../src/ActivityView.js');
const Header = require('../src/ProfileHeaderView.js');
const Appearance = require('../src/Appearance.js');
const Core = require('../src/PageviewsCore.js');
const USER = 'Marina Exemplo', NOW = '2026-10-15T14:42:00.000Z';
const hide = {name:'hidden',location:'hidden',accountCreated:'hidden',photo:'hidden',localTime:'hidden'};
function group(extra = {}) { return {label:'Alma mater',values:['[[Universidade George Washington|GWU]]','[[Instituto de Tecnologia de Massachusetts|MIT]]'],layout:'inline',separator:'pipe',...extra}; }
function options(field = group(), appearance = {}) { return {user:USER,displayName:'Marina Pesquisa',timeZone:'UTC',now:NOW,customFields:[field],appearance:{profilePlacement:'activity',profilePlacements:hide,...appearance}}; }
function state() {
    const config = {user:USER,timeZone:'UTC',project:'pt.wikipedia.org'}, entries = [[1,1,0,'Artigo de exemplo','2026-10-14T12:00:00.000Z',0]];
    return {config,capturedAt:NOW,statistics:{user:USER,metrics:{}},activity:{complete:true,identity:{user:USER,project:config.project},entries,summary:Core.summarize(entries,{config,now:NOW})},pageviews:null};
}
const count = (source,pattern) => (source.match(pattern) || []).length;

test('one shared custom-field row renders inline separators in actual Activity HTML and saved wiki output', () => {
    for (const separator of ['pipe','dot','space']) {
        const field = group({separator}), html = Activity.customFieldMarkup(field,false), wiki = Activity.customFieldMarkup(field,true);
        for (const output of [html,wiki]) {
            assert.equal(count(output,/class="dan-pu-profile-field"/g),1);
            assert.equal(count(output,/Alma mater:/g),1);
            assert.match(output,/data-field-layout="inline"/); assert.match(output,/class="dan-pu-field-values" data-layout="inline"/);
            assert.equal(count(output,/class="dan-pu-field-separator"/g),1);
            assert.doesNotMatch(output,/<ul|<li/);
        }
        const visible = separator === 'pipe' ? ' | ' : separator === 'dot' ? ' · ' : ' ';
        const saved = separator === 'pipe' ? ' &#124; ' : visible;
        assert.ok(html.includes('aria-hidden="true">'+visible+'</span>'));
        assert.ok(wiki.includes('aria-hidden="true">'+saved+'</span>'));
        assert.doesNotMatch(wiki,/> \| <\/span>/,'A display separator cannot become a raw wiki parser delimiter');
        assert.match(html,/href="https:\/\/pt\.wikipedia\.org\/wiki\/Universidade_George_Washington">GWU<\/a>/);
        assert.match(wiki,/\[\[:Universidade George Washington\|GWU\]\]/);
        const presentation = options(field);
        assert.ok(Activity.html(state(),presentation).includes(html));
        assert.ok(Activity.wikitext(state(),presentation).includes(wiki));
    }
});

test('line layouts and semantic bullet lists retain every linked item with one group label', () => {
    for (const layout of ['lines','bullets']) for (const wiki of [false,true]) {
        const field = group({layout,separator:'dot'}), output = Activity.customFieldMarkup(field,wiki);
        assert.equal(count(output,/Alma mater:/g),1); assert.match(output,new RegExp('data-field-layout="'+layout+'"'));
        assert.doesNotMatch(output,/dan-pu-field-separator/,'An inactive inline separator does not leak into lists');
        if (layout === 'bullets') {
            assert.match(output,/<ul class="dan-pu-field-values" data-layout="bullets">/);
            assert.equal(count(output,/<li(?:\s|>)/g),2); assert.equal(count(output,/<\/li>/g),2);
        } else {
            assert.match(output,/<div class="dan-pu-field-values" data-layout="lines">/);
            assert.doesNotMatch(output,/<ul|<li/);
        }
        assert.equal(wiki ? count(output,/\[\[:/g) : count(output,/<a href=/g),2);
        assert.ok(Activity.profileMarkup(state(),options(field),wiki,'activity').includes(output));
    }
});

test('legacy single-value rows remain visible without extra separators or duplicate labels', () => {
    const field = {label:'Pesquisa',value:'[[História do Brasil|História]]'};
    for (const wiki of [false,true]) {
        const output = Activity.customFieldMarkup(field,wiki);
        assert.equal(count(output,/Pesquisa:/g),1); assert.doesNotMatch(output,/dan-pu-field-separator|<ul|<li/);
        assert.ok(Activity.profileMarkup(state(),options(field),wiki,'activity').includes(output));
        assert.match(output,wiki ? /\[\[:História do Brasil\|História\]\]/ : />História<\/a>/);
    }
});

test('malformed direct-renderer rows are omitted before any text, links or style code can be emitted', () => {
    const invalid = [null,{label:'X',values:['A'],value:'B'},group({values:['<img src=x onerror=alert(1)>']}),
        group({values:['{{template}}']}),group({values:['[[en:MIT]]']}),group({values:['[[X|Y|Z]]']}),
        group({values:['A\nB']}),group({separator:'pipe;display:none'}),group({layout:'inline;position:fixed'}),
        group({placement:'top;display:none'}),group({label:'<script>Nome</script>'})];
    for (const field of invalid) for (const wiki of [false,true]) {
        assert.throws(() => Activity.customFieldMarkup(field,wiki),TypeError,'The standalone row helper validates strictly');
        for (const scope of ['activity','cards','top']) {
            const presentation = options(field);
            assert.doesNotThrow(() => Activity.profileMarkup(state(),presentation,wiki,scope));
            assert.equal(Activity.profileMarkup(state(),presentation,wiki,scope),'');
        }
        assert.doesNotMatch(Activity[wiki ? 'wikitext' : 'html'](state(),options(field)),/class="dan-pu-profile-field"/);
        const f = fixture(); assert.doesNotThrow(() => Activity.paintProfile(f.document,state(),options(field)));
        assert.equal(f.body.querySelectorAll('.dan-pu-profile-field').length,0); assert.equal(f.figure.textContent,'12345');
    }
    const literal = group({label:'Interesse "A" & B; C',values:['https://example.org ~~~~ __NOTOC__','[[Categoria:Ciência|Ciência & arte]]']});
    const html = Activity.customFieldMarkup(literal,false), wiki = Activity.customFieldMarkup(literal,true);
    assert.match(html,/Interesse &quot;A&quot; &amp; B; C:/); assert.match(wiki,/Interesse &quot;A&quot; &amp; B; C:/);
    assert.doesNotMatch(wiki,/https:\/\/example|~~~~|__NOTOC__/);
    assert.match(wiki,/\[\[:Categoria:Ciência\|Ciência &amp; arte\]\]/);
    assert.doesNotMatch(html,/<script|<img|onerror=/i);
});

test('public rendering skips an invalid draft row while retaining each valid neighboring label and item', () => {
    const presentation = options();
    presentation.customFields = [{label:'Pesquisa',value:'Bibliotecas',placement:'activity'},group({placement:'top;display:none'}),group({placement:'all',layout:'bullets'})];
    for (const wiki of [false,true]) {
        const activity = Activity[wiki ? 'wikitext' : 'html'](state(),presentation), top = Header[wiki ? 'wikitext' : 'html'](state(),presentation);
        assert.equal(count(activity,/Alma mater:/g),1); assert.equal(count(activity,/Pesquisa:/g),1);
        assert.equal(count(top,/Alma mater:/g),1); assert.doesNotMatch(top,/Pesquisa:/);
        for (const output of [activity,top]) assert.doesNotMatch(output,/top;display:none/);
    }
    const f = fixture(); Activity.paintProfile(f.document,state(),presentation);
    assert.equal(f.activity.querySelectorAll('.dan-pu-profile-field').length,2);
    assert.equal(f.top.querySelectorAll('.dan-pu-profile-field').length,1);
    assert.equal(f.cards.querySelectorAll('.dan-pu-profile-field').length,1);
    assert.equal(f.figure.textContent,'12345');
});

class Element {
    constructor(tag = 'div') { this.tagName = tag.toLowerCase(); this.childNodes = []; this.parentNode = null; this.className = ''; this.attributes = {}; this.style = {}; this.ownText = ''; }
    get id() { return this.attributes.id || ''; } set id(value) { this.attributes.id = value; }
    get children() { return this.childNodes; } get firstChild() { return this.childNodes[0] || null; }
    get textContent() { return this.ownText+this.childNodes.map(node => node.textContent).join(''); }
    set textContent(value) { this.ownText = String(value); this.childNodes.forEach(node => { node.parentNode = null; }); this.childNodes = []; }
    setAttribute(key,value) { this.attributes[key] = String(value); } getAttribute(key) { return this.attributes[key] ?? null; }
    appendChild(node) { return this.insertBefore(node,null); }
    insertBefore(node,next) { if (node.parentNode) node.parentNode.removeChild(node); const index = next === null ? this.childNodes.length : this.childNodes.indexOf(next); assert.ok(index >= 0); this.childNodes.splice(index,0,node); node.parentNode = this; return node; }
    removeChild(node) { const index = this.childNodes.indexOf(node); assert.ok(index >= 0); this.childNodes.splice(index,1); node.parentNode = null; return node; }
    matches(selector) { return selector[0] === '.' ? this.className.split(' ').includes(selector.slice(1)) : selector[0] === '#' ? this.id === selector.slice(1) : this.tagName === selector; }
    querySelectorAll(selector) { return this.childNodes.flatMap(node => [...(node.matches(selector) ? [node] : []),...node.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function fixture() {
    const body = new Element('body'), activity = new Element(), cards = new Element(), top = new Element(), figure = new Element('span');
    for (const [root,id] of [[top,'dan-pu-profile-header'],[cards,'dan-pu-estatisticas'],[activity,'dan-pu-ritmo']]) { root.id = id; root.setAttribute('data-perfilwiki-user',USER); body.appendChild(root); }
    top.setAttribute('data-perfilwiki-profile-top','true'); figure.textContent = '12345'; cards.appendChild(figure);
    const document = {getElementById:id => body.querySelector('#'+id),createElement:tag => new Element(tag),querySelectorAll:selector => body.querySelectorAll(selector)};
    return {body,activity,cards,top,figure,document};
}

test('safe DOM painting uses linked item nodes and matching inline, line and list structures without touching counters', () => {
    for (const layout of ['inline','lines','bullets']) for (const separator of ['pipe','dot','space']) {
        const f = fixture(), presentation = options(group({layout,separator,placement:'all'}));
        Activity.paintProfile(f.document,state(),presentation);
        for (const root of [f.top,f.cards,f.activity]) {
            const field = root.querySelector('.dan-pu-profile-field'), values = field.querySelector('.dan-pu-field-values');
            assert.equal(field.getAttribute('data-field-layout'),layout); assert.equal(values.getAttribute('data-layout'),layout);
            assert.equal(values.tagName,layout === 'bullets' ? 'ul' : layout === 'lines' ? 'div' : 'span');
            const links = values.querySelectorAll('a'); assert.equal(links.length,2); assert.equal(links[0].textContent,'GWU'); assert.equal(links[1].textContent,'MIT');
            assert.equal(links[0].getAttribute('href'),'https://pt.wikipedia.org/wiki/Universidade_George_Washington');
            const separators = values.querySelectorAll('.dan-pu-field-separator'); assert.equal(separators.length,layout === 'inline' ? 1 : 0);
            if (separators.length) assert.equal(separators[0].textContent,separator === 'pipe' ? ' | ' : separator === 'dot' ? ' · ' : ' ');
            assert.equal(values.querySelectorAll('li').length,layout === 'bullets' ? 2 : 0);
        }
        assert.equal(f.figure.textContent,'12345'); assert.equal(f.figure.parentNode,f.cards);
    }
});

test('top and panel placement combinations route complete item groups through the actual public header', () => {
    const scopes = {inherit:['activity'],cards:['cards'],activity:['activity'],both:['cards','activity'],hidden:[],top:['top'],
        'top-activity':['top','activity'],'top-cards':['top','cards'],all:['top','cards','activity']};
    for (const [placement,wanted] of Object.entries(scopes)) for (const wiki of [false,true]) {
        const presentation = options(group({placement})), top = Header[wiki ? 'wikitext' : 'html'](state(),presentation);
        for (const scope of ['top','cards','activity']) {
            const output = scope === 'top' ? top : Activity.profileMarkup(state(),presentation,wiki,scope);
            assert.equal(output.includes('Alma mater:'),wanted.includes(scope),placement+'/'+scope);
            if (wanted.includes(scope)) assert.equal(count(output,/Alma mater:/g),1);
        }
    }
    const f = fixture(), presentation = options(group({placement:'top',layout:'bullets'}));
    assert.equal(Header.paint(f.document,state(),presentation),true);
    assert.equal(f.top.querySelectorAll('li').length,2); assert.equal(f.activity.querySelector('.dan-pu-profile-field'),null);
    assert.equal(f.cards.querySelector('.dan-pu-profile-field'),null);
});

test('name font size uses the same finite values in top, panels and safe DOM without changing counter sizes', () => {
    for (const nameFontSize of [16,20,24,28,32,36]) {
        const presentation = options(group({placement:'hidden'}),{nameFontSize,profilePlacements:{...hide,name:'all'}});
        for (const scope of ['top','activity','cards']) for (const wiki of [false,true]) {
            const output = scope === 'top' ? Header[wiki ? 'wikitext' : 'html'](state(),presentation) : Activity.profileMarkup(state(),presentation,wiki,scope);
            assert.match(output,new RegExp('class="dan-pu-profile-label"[^>]*font-size:'+nameFontSize+'px;'));
        }
        const f = fixture(); Activity.paintProfile(f.document,state(),presentation);
        for (const root of [f.top,f.cards,f.activity]) assert.equal(root.querySelector('.dan-pu-profile-label').style.fontSize,nameFontSize+'px');
        assert.equal(f.figure.textContent,'12345'); assert.equal(f.figure.style.fontSize,undefined);
    }
    for (const nameFontSize of [0,15,17,37,'24','24px','24;display:none']) assert.throws(() => Appearance.normalize({nameFontSize}));
});
