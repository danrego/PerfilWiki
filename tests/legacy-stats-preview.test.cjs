'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Preview = require('../src/LegacyStatsPreview.js');
const Cards = require('../src/CardsView.js');
const USER = 'Editora Exemplo', NOW = '2026-10-15T12:00:00Z', SAVED = '2026-10-14T12:00:00Z';
const clone = value => JSON.parse(JSON.stringify(value));
const options = extra => ({user:USER,now:NOW,...extra});
const ids = {edits:'dan-pu-edicoes',thanks:'dan-pu-agradecimentos',articles:'dan-pu-artigos',bestStreak:'dan-pu-ritmo-melhor-sequencia',edited:'dan-pu-editados',technicalCreated:'dan-pu-criados-tecnicos',reverts:'dan-pu-reversoes'};
function legacy() {
    return {schema:1,user:USER,lastAttemptAt:SAVED,lastSuccessAt:SAVED,errors:[],
        metrics:{edits:10,thanks:3,articles:3,streak:2,edited:2,reverts:2,technicalCreated:3,technical:999},
        projects:{ptwiki:{url:'https://pt.wikipedia.org',editcount:7,thanks:2,articles:2},enwiki:{url:'https://en.wikipedia.org',editcount:3,thanks:1,articles:1}},
        history:{complete:true,scannedAt:SAVED,dates:['2026-10-10','2026-10-11','2026-10-13']},
        edited:{complete:true,scannedAt:SAVED,fullScannedAt:SAVED,validatedAt:SAVED,pageids:[1,2,3],countedPageids:[1,3]},
        reverts:{complete:true,scannedAt:SAVED,fullScannedAt:SAVED,revids:[10,11]},
        technicalCreated:{model:'created-code-pages-v1',complete:true,scannedAt:SAVED,fullScannedAt:SAVED,validatedAt:SAVED,
            creations:[[201,71,'2026-10-10T12:00:00Z'],[202,72,'2026-10-11T12:00:00Z'],[203,73,'2026-10-12T12:00:00Z']],
            pages:[{pageid:201,ns:10,title:'Predefinição:Exemplo',contentmodel:'wikitext',kind:'template'},
                {pageid:202,ns:828,title:'Módulo:Exemplo',contentmodel:'Scribunto',kind:'module'},
                {pageid:203,ns:2,title:'Usuário:Editora Exemplo/exemplo.js',contentmodel:'javascript',kind:'script'}]}};
}
function wikitext(state) {
    let text = '<includeonly>{{#switch:{{{1|}}}\n';
    for(const [key,label]of [['edits','edicoes'],['thanks','agradecimentos'],['articles','artigos'],['streak','sequencia'],['edited','editados'],['technical','predefinicoes'],['technicalCreated','tecnicoscriados'],['reverts','reversoes']])
        if(Object.hasOwn(state.metrics,key))text+='|'+label+'={{formatnum:'+state.metrics[key]+'}}\n';
    return text+'|#default=\n}}</includeonly><noinclude><syntaxhighlight lang="json">\n'+JSON.stringify(state,null,2)+'\n</syntaxhighlight></noinclude>\n';
}
function dom(user=USER) {
    const nodes={};
    for(const [key,id]of Object.entries(ids)) {
        const attrs={};nodes[id]={textContent:'Aguardando dados',getAttribute:key=>attrs[key]??null,setAttribute:(key,value)=>{attrs[key]=String(value);},removeAttribute:key=>{delete attrs[key];},attrs};
        Object.defineProperty(nodes[id],'innerHTML',{set(){assert.fail('Saved numbers must never be interpreted as HTML');}});
    }
    const root={getAttribute:key=>key==='data-perfilwiki-user'?user:null,contains:node=>Object.values(nodes).includes(node)};
    return {nodes,root,document:{getElementById:id=>id==='dan-pu-estatisticas'?root:nodes[id]||null}};
}

test('legacy normalization recovers exactly seven saved counters, never the old technical edit count or account tenure',()=>{
    const state=legacy(),before=JSON.stringify(state),preview=Preview.normalize(JSON.stringify(state),options());
    assert.deepEqual(Object.keys(preview.metrics).sort(),Object.keys(ids).sort());
    assert.equal(preview.metrics.technicalCreated.value,3);
    assert.equal(preview.metrics.bestStreak.value,2);
    assert.equal(preview.metrics.edits.savedAt,SAVED);
    assert.equal(preview.statistics,undefined);assert.equal(preview.history,undefined);assert.equal(preview.config,undefined);
    assert.equal(preview.metrics.technical,undefined);assert.equal(preview.metrics.tenure,undefined);assert.equal(preview.metrics.registration,undefined);
    assert.equal(JSON.stringify(state),before);
});

test('canonical legacy public subpage is accepted as inert JSON, and ambiguous or altered wrappers fail closed',()=>{
    const source=wikitext(legacy());
    assert.deepEqual(Preview.fromWikitext(source,options()),Preview.normalize(legacy(),options()));
    for(const wrong of [source+source,source.replace('|edicoes={{formatnum:10}}','|edicoes={{formatnum:100}}'),'<nowiki>'+source+'</nowiki>',source.replace('lang="json"','lang="javascript"'),source.replace('"edits": 10','"edits": "<img src=x onerror=alert(1)>"')])
        assert.equal(Preview.fromWikitext(wrong,options()),null);
});

test('identity, bounded input, dates, integers and project origins are rejected before any display',()=>{
    const invalid=[];
    for(const mutate of [s=>s.user='Outra pessoa',s=>s.schema=2,s=>s.lastAttemptAt='2026-10-16T00:00:00Z',s=>s.lastAttemptAt='2026-02-30T00:00:00Z',s=>s.metrics.edits=-1,s=>s.metrics.thanks=1.2,s=>s.metrics.articles=Number.MAX_SAFE_INTEGER+1,s=>s.projects.ptwiki.url='https://pt.wikipedia.org.evil.example',s=>s.projects.ptwiki.url='https://name:password@pt.wikipedia.org',s=>s.projects.ptwiki.url='https://pt.wikipedia.org/w/api.php',s=>s.projects.ptwiki.editcount=-1]) {
        const state=legacy();mutate(state);invalid.push(state);
    }
    for(const state of invalid)assert.equal(Preview.normalize(state,options()),null);
    assert.equal(Preview.normalize(' '.repeat(Preview.rawLimit+1),options()),null);
    assert.equal(Preview.normalize('{"__proto__":{}}',options()),null);
    assert.equal(Preview.normalize(legacy(),options({now:'invalid'})),null);
});

test('project sums must support the corresponding saved global counters without converting missing evidence into zero',()=>{
    const state=legacy();state.projects.enwiki.editcount=2;state.projects.enwiki.thanks=0;delete state.projects.enwiki.articles;
    const preview=Preview.normalize(state,options());
    assert.equal(preview.metrics.edits,undefined);assert.equal(preview.metrics.thanks,undefined);assert.equal(preview.metrics.articles,undefined);
    assert.equal(preview.metrics.reverts.value,2);
    const overflow=legacy();overflow.projects.enwiki.editcount=Number.MAX_SAFE_INTEGER;
    assert.equal(Preview.normalize(overflow,options()).metrics.edits,undefined);
});

test('streak and local counts are independently checked against their saved supporting history',()=>{
    const mutations=[['bestStreak',s=>s.metrics.streak=99],['bestStreak',s=>s.history.dates.push('2026-10-16')],['edited',s=>s.edited.countedPageids=[1,99]],['edited',s=>s.edited.pageids=[1,1]],['reverts',s=>s.reverts.revids=[10,10]],['reverts',s=>s.reverts.complete=false]];
    for(const [key,mutate]of mutations){const state=legacy();mutate(state);assert.equal(Preview.normalize(state,options()).metrics[key],undefined,key);}
    const older=legacy();delete older.edited.countedPageids;delete older.edited.validatedAt;
    assert.equal(Preview.normalize(older,options()).metrics.edited.value,2,'Older snapshots remain visibly historical, never new collector proofs');
    older.metrics.edited=4;assert.equal(Preview.normalize(older,options()).metrics.edited,undefined);
});

test('technical creation requires its creation model, unique creation evidence and eligible current code pages',()=>{
    const mutations=[s=>s.technicalCreated.model='technical-edits',s=>s.technicalCreated.complete=false,s=>s.technicalCreated.pages[0].kind='script',s=>s.technicalCreated.pages[0].title='Predefinição:Exemplo/doc',s=>s.technicalCreated.pages[2].contentmodel='sanitized-css',s=>s.technicalCreated.pages[2].title='Usuário:Editora Exemplo/test.js',s=>s.technicalCreated.creations[0][0]=999,s=>s.technicalCreated.creations[1][1]=71,s=>s.technicalCreated.validatedAt='2026-10-16T00:00:00Z',s=>s.metrics.technicalCreated=999];
    for(const mutate of mutations){const state=legacy();mutate(state);assert.equal(Preview.normalize(state,options()).metrics.technicalCreated,undefined);}
    const noCreated=legacy();delete noCreated.technicalCreated;delete noCreated.metrics.technicalCreated;
    assert.equal(Preview.normalize(noCreated,options()).metrics.technicalCreated,undefined,'Legacy technical=999 never fills the creation counter');
});

test('undated bundled seed cannot invent a global update time, while independently dated counters remain available',()=>{
    const state=legacy();state.lastAttemptAt=null;state.lastSuccessAt=null;const preview=Preview.normalize(state,options());
    assert.equal(preview.metrics.edits,undefined);assert.equal(preview.metrics.thanks,undefined);assert.equal(preview.metrics.articles,undefined);
    assert.equal(preview.metrics.technicalCreated.savedAt,SAVED);assert.equal(preview.metrics.bestStreak.value,2);
});

test('display recovery is confined to the exact owner root, leaves existing numbers intact, and uses textContent with dated provenance',()=>{
    const preview=Preview.normalize(legacy(),options()),ui=dom();ui.nodes[ids.edits].textContent='777';
    assert.equal(Preview.paint(ui.document,preview,null,options()),6);
    assert.equal(ui.nodes[ids.edits].textContent,'777');
    assert.equal(ui.nodes[ids.technicalCreated].textContent,'3');
    assert.equal(ui.nodes[ids.technicalCreated].attrs['data-perfilwiki-legacy-preview'],'true');
    assert.equal(ui.nodes[ids.technicalCreated].attrs['data-perfilwiki-legacy-saved-at'],SAVED);
    assert.match(ui.nodes[ids.technicalCreated].attrs.title,/Dados salvos.*2026-10-14 12:00:00 UTC/);
    assert.equal(Preview.paint(dom('Outra pessoa').document,preview,null,options()),0);
    assert.equal(Preview.paint(ui.document,preview,{user:'Outra pessoa'},options()),0);
    const outside=dom();outside.root.contains=()=>false;assert.equal(Preview.paint(outside.document,preview,null,options()),0);
});

test('fresh collector counters and activity win over legacy values and remove their old provenance',()=>{
    const ui=dom(),preview=Preview.normalize(legacy(),options());Preview.paint(ui.document,preview,null,options());
    ui.nodes[ids.edits].textContent='99';ui.nodes[ids.bestStreak].textContent='41 dias';
    const current={user:USER,metrics:{edits:99},metricUpdatedAt:{edits:NOW}};
    Preview.paint(ui.document,preview,current,options({activity:{complete:true,identity:{user:USER},capturedAt:NOW,summary:{bestStreak:41}}}));
    assert.equal(ui.nodes[ids.edits].textContent,'99');assert.equal(ui.nodes[ids.bestStreak].textContent,'41 dias');
    assert.equal(ui.nodes[ids.edits].attrs.title,undefined);assert.equal(ui.nodes[ids.bestStreak].attrs['data-perfilwiki-legacy-preview'],undefined);
});

test('saved preview formatting and provenance work across all six interface languages',()=>{
    for(const [language,word]of [['pt-BR','dias'],['pt-PT','dias'],['en','days'],['es','días'],['fr','jours'],['it','giorni']]) {
        const ui=dom();assert.equal(Preview.paint(ui.document,Preview.normalize(legacy(),options()),null,options({language})),7);
        assert.equal(ui.nodes[ids.bestStreak].textContent,'2 '+word,language);assert.match(ui.nodes[ids.bestStreak].attrs.title,/2026-10-14/);
    }
});

test('legacy previews are never accepted as new statistics or exported as new verified counter values',()=>{
    const preview=Preview.normalize(legacy(),options());
    const html=Cards.wikitext(preview,null,{user:USER,now:NOW});
    assert.match(html,/id="dan-pu-edicoes">Aguardando dados</);
    assert.match(html,/id="dan-pu-criados-tecnicos">Aguardando dados</);
    assert.doesNotMatch(html,/data-perfilwiki-legacy/);
    assert.equal(preview.metrics.edits.value,10);
});
