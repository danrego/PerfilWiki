'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Fields = require('../src/ProfileFields.js');
const Text = require('../src/ProfileText.js');
const Configuration = require('../src/Configuration.js');
const USER = 'Marina Exemplo';
const placements = ['inherit','cards','activity','both','hidden','top','top-activity','top-cards','all'];
const grouped = extra => ({label:'Alma mater',values:['[[Universidade George Washington|GWU]]','[[Instituto de Tecnologia de Massachusetts|MIT]]'],...extra});

test('legacy fields keep their canonical shape and original empty-row behavior', () => {
    assert.deepEqual(Fields.normalize(undefined),[]);
    assert.deepEqual(Fields.normalize([]),[]);
    assert.deepEqual(Fields.normalize([{label:'  A\u0301rea  ',value:'  [[História]]  '}]),[{label:'Área',value:'[[História]]'}]);
    assert.deepEqual(Fields.normalize([{label:'  ',value:' '},{label:'Pesquisa',value:'Bibliotecas',placement:'cards'}]),[{label:'Pesquisa',value:'Bibliotecas',placement:'cards'}]);
    const field = {label:'Pesquisa',value:'Bibliotecas'};
    assert.deepEqual(Fields.values(field),['Bibliotecas']);
    assert.equal(Fields.layoutOf(field),'inline'); assert.equal(Fields.separatorOf(field),'pipe');
    assert.deepEqual(Fields.values({label:'',value:''}),[]);
    assert.equal(Object.hasOwn(Fields.normalize([field])[0],'layout'),false);
    assert.equal(Object.hasOwn(Fields.normalize([field])[0],'values'),false);
    assert.throws(() => Fields.normalize([{label:'',value:'Texto'}]),/Preencha/);
    assert.deepEqual(Fields.normalize([{label:'Rótulo',value:''}]),[{label:'Rótulo',value:''}]);
});

test('grouped fields retain order, normalize every item and expose all supported layouts and separators', () => {
    assert.deepEqual(Fields.normalize([grouped()]),[grouped({layout:'inline',separator:'pipe'})]);
    const input = grouped({values:['  E\u0301vora  ','  [[Rio_de_Janeiro|Rio]]  ','Évora']});
    const expected = ['Évora','[[Rio_de_Janeiro|Rio]]','Évora'];
    assert.deepEqual(Fields.normalize([input])[0].values,expected);
    assert.deepEqual(Fields.values(input),expected,'Equal items remain explicit user choices');
    for (const layout of ['inline','lines','bullets']) for (const separator of ['pipe','dot','space']) {
        const field = grouped({layout,separator});
        assert.equal(Fields.layoutOf(field),layout); assert.equal(Fields.separatorOf(field),separator);
        assert.deepEqual(Fields.normalize([field]),[field]);
    }
});

test('blank grouped drafts are filtered while labels can stand alone without bypassing raw limits', () => {
    assert.deepEqual(Fields.normalize([{label:' ',values:[]}]),[]);
    assert.deepEqual(Fields.normalize([{label:' ',values:[' ','  '],layout:'lines',separator:'dot'}]),[]);
    assert.deepEqual(Fields.normalize([grouped({values:[' ','[[GWU]]','',' [[MIT]] ']})]),[
        grouped({values:['[[GWU]]','[[MIT]]'],layout:'inline',separator:'pipe'})
    ]);
    for (const values of [[],['',' ']]) assert.deepEqual(Fields.normalize([{label:'Alma mater',values}]),[{label:'Alma mater',values:[],layout:'inline',separator:'pipe'}]);
    assert.throws(() => Fields.normalize([{label:'',values:['[[MIT]]']}]),/Preencha/);
    assert.throws(() => Fields.normalize([{label:'',values:Array(9).fill('')}]),/oito/);
    assert.throws(() => Fields.normalize(Array.from({length:4},() => ({label:'',value:''}))),/três/);
});

test('field, group and Unicode limits are bounded before rendering and preserve accepted edge values', () => {
    const full = {label:'🧩'.repeat(40),values:Array.from({length:8},(_,index) => index ? '🧩'.repeat(160) : 'e\u0301'.repeat(160))};
    const normalized = Fields.normalize([full,full,full]);
    assert.equal(normalized.length,3); assert.equal(normalized[0].values.length,8);
    assert.equal(Array.from(normalized[0].values[0]).length,160);
    assert.equal(Fields.normalize([{label:'🧩'.repeat(40),value:'🧩'.repeat(160)}]).length,1);
    assert.throws(() => Fields.normalize([grouped({label:'🧩'.repeat(41)})]),/40/);
    assert.throws(() => Fields.normalize([grouped({values:['🧩'.repeat(161)]})]),/160/);
    assert.throws(() => Fields.normalize([grouped({values:Array(9).fill('Item')})]),/oito/);
});

test('malformed and ambiguous rows, sparse items and unknown options fail instead of changing their meaning', () => {
    const sparse = Array(1);
    const bad = [null,{},[null],[[]],[{value:'X'}],[{label:'X',value:'Y',values:['Z']}],
        [{label:'X',value:'Y',values:undefined}],[{label:'X',value:'Y',layout:'inline'}],
        [{label:'X',values:'Y'}],[{label:'X',values:null}],[{label:'X',values:[1]}],
        [{label:'X',values:[null]}],[{label:'X',values:sparse}],sparse,
        [grouped({layout:'grid'})],[grouped({layout:null})],[grouped({separator:'comma'})],
        [grouped({separator:null})],[grouped({unknown:true})],[grouped({placement:'floating'})],
        [{label:'X',value:'Y',placement:'top;display:none'}],
        [Object.create({label:'X',value:'Y'})]];
    for (const input of bad) assert.throws(() => Fields.normalize(input),TypeError,JSON.stringify(input));
    for (const placement of placements) {
        assert.deepEqual(Fields.normalize([grouped({placement})])[0],grouped({layout:'inline',separator:'pipe',placement}));
        assert.deepEqual(Fields.normalize([{label:'Pesquisa',value:'Bibliotecas',placement}])[0],{label:'Pesquisa',value:'Bibliotecas',placement});
    }
    for (const helper of [Fields.values,Fields.layoutOf,Fields.separatorOf]) assert.throws(() => helper({label:'X',value:'Y',values:['Z']}),TypeError);
});

test('each item uses the existing safe-link grammar and labels remain plain text', () => {
    for (const item of ['<img src=x>','{{template}}','[https://example.org X]','[[en:MIT]]','[[X|]]',
        '[[X|Y|Z]]','[[X]','X|Y','X\nY','X\u0085Y','X\u2028Y','[[X%3AY]]']) {
        assert.throws(() => Fields.normalize([grouped({values:['[[GWU]]',item]})]),TypeError,item);
    }
    for (const label of ['[[Alma mater]]','<b>Nome</b>','{{Nome}}','X|Y','X\nY','X\u0085Y']) assert.throws(() => Fields.normalize([grouped({label})]),TypeError,label);
    const values = Fields.values(grouped({values:['[[Ficheiro:Example.svg|Imagem]]','https://example.org ~~~~ __NOTOC__ & "texto"']}));
    assert.equal(Text.tokens(values[0])[0].href,'https://pt.wikipedia.org/wiki/Ficheiro%3AExample.svg');
    assert.match(Text.wikitext(values[0]),/^\[\[:Ficheiro:/,'File/category titles remain links, never transclusions');
    const wiki = Text.wikitext(values[1]);
    assert.doesNotMatch(wiki,/https:\/\/|~~~~|__NOTOC__/);
    assert.match(Text.html(values[1]),/&amp; &quot;texto&quot;/);
});

test('normalization and helper results do not share mutable arrays or rows with the source', () => {
    const source = [grouped({placement:'top'})], before = JSON.stringify(source);
    const first = Fields.normalize(source), second = Fields.normalize(source), values = Fields.values(source[0]);
    first[0].values[0] = 'Mudança'; first[0].label = 'Outro'; values.push('Mais um');
    assert.equal(JSON.stringify(source),before); assert.equal(second[0].values[0],source[0].values[0]);
    assert.notEqual(first,second); assert.notEqual(first[0],second[0]); assert.notEqual(first[0].values,second[0].values);
    assert.ok(Object.isFrozen(Fields));
});

test('Configuration shares grouped normalization while identity, caches and legacy options remain unchanged', () => {
    const resolve = input => Configuration.resolve({config:{get:() => USER}},{PerfilWikiConfig:{user:USER,timeZone:'UTC',...input}});
    const fields = [grouped({placement:'all',layout:'bullets',separator:'dot'}),{label:'Pesquisa',value:'Bibliotecas',placement:'cards'}];
    const configured = resolve({customFields:fields,photo:'File:Portrait.jpg',location:'[[Brasília]]'}), ordinary = resolve({});
    assert.deepEqual(configured.customFields,Fields.normalize(fields)); assert.deepEqual(configured.metrics,ordinary.metrics);
    assert.equal(configured.photo,'Portrait.jpg'); assert.equal(configured.location,'[[Brasília]]');
    assert.equal(Object.hasOwn(configured.metrics,'customFields'),false); assert.equal(Object.hasOwn(configured.metrics,'layout'),false);
    assert.deepEqual(resolve({customFields:[{label:'X',value:'Y'}]}).customFields,[{label:'X',value:'Y'}]);
    assert.throws(() => resolve({customFields:[grouped({value:'Ambíguo'})]}),TypeError);
});

test('the browser UMD exposes the same pure contract before Configuration with no transport or storage', () => {
    const sandbox = {window:{},Intl,Date,URL,fetch:() => assert.fail('Profile field normalization must not request data')};
    for (const filename of ['Appearance.js','ProfileText.js','ProfileFields.js','Configuration.js']) vm.runInNewContext(fs.readFileSync(require.resolve('../src/'+filename),'utf8'),sandbox);
    assert.ok(sandbox.window.PerfilWikiProfileFields);
    const input = [grouped({layout:'lines',separator:'space',placement:'top-activity'})];
    const normalized = sandbox.window.PerfilWikiProfileFields.normalize(input);
    assert.deepEqual(JSON.parse(JSON.stringify(normalized)),Fields.normalize(input));
    const config = sandbox.window.PerfilWikiConfiguration.resolve({config:{get:() => USER}},{PerfilWikiConfig:{user:USER,timeZone:'UTC',customFields:input}});
    assert.deepEqual(JSON.parse(JSON.stringify(config.customFields)),Fields.normalize(input));
    assert.deepEqual(Object.keys(sandbox.window).sort(),['PerfilWikiAppearance','PerfilWikiConfiguration','PerfilWikiProfileFields','PerfilWikiProfileText']);
});
