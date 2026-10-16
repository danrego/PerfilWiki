'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Cards = require('../src/CardsView.js');
const Statistics = require('../src/Statistics.js');
const Appearance = require('../src/Appearance.js');

const USER = 'Editora Exemplo';
const NOW = '2026-10-15T18:00:00.000Z';
const LOCAL = '2014-07-30T16:30:46Z';
const FIRST = '2008-05-25T04:42:10Z';
const GLOBAL = '2015-04-19T12:00:00Z';
const LANGUAGES = [
    ['pt-BR', '18 anos', 'Aguardando dados'], ['pt-PT', '18 anos', 'Aguardando dados'],
    ['en', '18 years', 'Waiting for data'], ['es', '18 años', 'Esperando datos'],
    ['fr', '18 ans', 'En attente de données'], ['it', '18 anni', 'In attesa dei dati']
];
const clone = value => JSON.parse(JSON.stringify(value));
const done = query => ({batchcomplete:true,query});

/** Exercise the real collector and its validator, without any network. */
async function collected({global = GLOBAL, linked = FIRST, local = LOCAL} = {}) {
    const calls = [];
    const requestJson = async address => {
        const url = new URL(address), params = Object.fromEntries(url.searchParams);
        calls.push(params);
        if (params.meta === 'globaluserinfo') return done({globaluserinfo:{name:USER,editcount:0,registration:global,
            merged:[{wiki:'enwiki',url:'https://en.wikipedia.org',registration:linked,editcount:0},
                {wiki:'ptwiki',url:'https://pt.wikipedia.org',registration:local,editcount:0}]}});
        if (params.list === 'users') return done({users:[{name:USER,registration:local}]});
        if (params.list === 'logevents') return done({logevents:[]});
        if (url.hostname === 'xtools.wmcloud.org') return {username:USER,project:url.pathname.split('/')[4],namespace:0,redirects:'noredirects',deleted:'all',counts:{}};
        assert.fail('Unexpected offline request: ' + address);
    };
    const state = await Statistics.collect({user:USER,now:NOW,requestJson,includeEarliestRegistration:true,
        history:{user:USER,project:'pt.wikipedia.org',capturedAt:NOW,complete:true,entries:[]}});
    assert.deepEqual(Statistics.validate(state,{user:USER,now:NOW}),{valid:true,errors:[]});
    return {state,calls};
}

function options(language) { return {user:USER,now:NOW,appearance:{metrics:['tenure'],language}}; }
function value(markup) { return markup.match(/<span id="perfilwiki-anos"[^>]*>([^<]*)<\/span>/)?.[1]; }
function paint(state, language, previous = '12 anos', repaint = false) {
    const settings = Appearance.normalize(options(language).appearance);
    const number = {textContent:previous};
    const root = repaint ? {style:{},getAttribute:key=>({
        'data-perfilwiki-user':USER,'data-perfilwiki-appearance':'outdated',
        'data-perfilwiki-rendered':'ready','data-perfilwiki-documentation':'Usuário:Daniel G Rego/PerfilWiki'
    }[key] || null)} : null;
    if (root) Object.defineProperty(root,'outerHTML',{set:markup=>{number.textContent=value(markup);}});
    const document = {getElementById:id=>id === 'perfilwiki-anos' ? number : id === 'dan-pu-estatisticas' ? root : null};
    Cards.paint(document,state,null,NOW,settings,{user:USER});
    return number.textContent;
}

test('tenure uses the earliest linked creation date from actual validated statistics in every language and DOM path', async () => {
    const {state,calls} = await collected();
    assert.equal(state.metrics.registration,LOCAL,'Local ptwiki registration retains its original meaning');
    assert.equal(state.metrics.earliestRegistration,FIRST);
    assert.equal(calls.filter(call=>call.meta === 'globaluserinfo').length,1);
    for (const [language,expected] of LANGUAGES) {
        assert.equal(value(Cards.html(state,null,options(language))),expected,language);
        const wiki = value(Cards.wikitext(state,null,options(language)));
        assert.equal(wiki,language.startsWith('pt-') ? '{{Tempo decorrido|25|5|2008|prec=ano}}' : expected,language);
        assert.equal(paint(state,language),expected,language + ' direct paint');
        assert.equal(paint(state,language,'12 anos',true),expected,language + ' regenerated cards');
    }
    assert.equal(state.metrics.registration,LOCAL,'Presentation does not rewrite collector state');
});

test('the earliest date may come from global registration instead of a linked wiki', async () => {
    const {state} = await collected({global:'2001-10-16T23:00:00Z'});
    assert.equal(value(Cards.html(state,null,options('pt-BR'))),'24 anos','The calendar anniversary has not arrived');
    assert.equal(value(Cards.wikitext(state,null,options('pt-PT'))),'{{Tempo decorrido|16|10|2001|prec=ano}}');
});

test('local-only legacy caches and unverified minimal date mocks stay pending in all languages', () => {
    for (const state of [null,{user:USER,metrics:{registration:LOCAL}},
        {user:USER,metrics:{registration:LOCAL,earliestRegistration:FIRST}}]) {
        for (const [language,,pending] of LANGUAGES) {
            for (const format of ['html','wikitext']) {
                const output = Cards[format](state,null,options(language));
                assert.equal(value(output),pending,language + ' ' + format);
                assert.doesNotMatch(output,/\{\{Tempo decorrido\||NaN|>0 (?:anos|years|años|ans|anni)</);
            }
            assert.equal(paint(state,language),pending,'Old local-only number is cleared');
            assert.equal(paint(state,language,'12 anos',true),pending,'Repainting cannot restore an old local-only number');
        }
    }
});

test('known dates with incomplete global coverage use only the earliest available verified date', async () => {
    const {state} = await collected({global:null});
    assert.equal(state.registrationCoverage.complete,false);
    assert.equal(state.metrics.earliestRegistration,FIRST);
    assert.equal(value(Cards.html(state,null,options('en'))),'18 years');
    const unknown = await collected({global:null,linked:null,local:null});
    assert.equal(unknown.state.metrics.earliestRegistration,null);
    assert.equal(value(Cards.wikitext(unknown.state,null,options('pt-BR'))),'Aguardando dados');
});

test('future, malformed, foreign and inconsistent evidence never produces a tenure or saved template', async () => {
    const {state} = await collected();
    const cases = [
        current=>{current.metrics.earliestRegistration='2030-01-01T00:00:00Z';},
        current=>{current.metrics.earliestRegistration='2008-02-30T00:00:00Z';},
        current=>{current.metrics.earliestRegistration='not a date';},
        current=>{current.registrationCoverage.checkedAt='2030-01-01T00:00:00Z';current.metricUpdatedAt.earliestRegistration=current.registrationCoverage.checkedAt;},
        current=>{current.registrationCoverage.user='Outra conta';},
        current=>{current.registrationCoverage.globalRegistration='2000-01-01T00:00:00Z';},
        current=>{current.registrationCoverage.accounts[0].registration='2030-01-01T00:00:00Z';},
        current=>{current.registrationCoverage.accounts[0].registration='2008-02-30T00:00:00Z';},
        current=>{delete current.metricUpdatedAt.earliestRegistration;},
        current=>{current.metricUpdatedAt.earliestRegistration='2026-10-14T18:00:00.000Z';},
        current=>{current.registrationCoverage.accounts=new Array(1);},
        current=>{current.registrationCoverage.complete=false;},
        current=>{delete current.registrationCoverage;}
    ];
    for (const change of cases) {
        const current=clone(state);change(current);
        assert.equal(value(Cards.html(current,null,options('pt-BR'))),'Aguardando dados');
        assert.equal(value(Cards.wikitext(current,null,options('pt-BR'))),'Aguardando dados');
        assert.equal(paint(current,'pt-BR'),'Aguardando dados');
    }
});
