'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Statistics = require('../src/Statistics.js');
const Appearance = require('../src/Appearance.js');
const Cards = require('../src/CardsView.js');
const USER = 'Marina Exemplo';
const NOW = '2026-10-15T16:00:00.000Z';
const clone = value=>JSON.parse(JSON.stringify(value));
const complete = query=>({batchcomplete:true,query});
const row = (id,delta)=>[id,id,0,'Artigo '+id,'2026-10-14T12:00:00Z',0,id-1,USER,[],delta];
function history(entries=[]) {
    const count = new Set(entries.map(e=>e[0])).size;
    return {user:USER,project:'pt.wikipedia.org',capturedAt:NOW,complete:true,entries,fullScanAt:NOW,
        byteCoverage:{version:1,complete:true,scannedAt:NOW,knownEdits:count,totalEdits:count}};
}
const event = (id,extra={})=>({logid:id,type:'thanks',action:'thank',user:USER,ns:2,title:'Usuário:Editora Exemplo',timestamp:'2026-10-14T12:00:00Z',...extra});
function fixture(sent=()=>complete({logevents:[]})) {
    const calls=[];
    const requestJson=async address=>{
        const url = new URL(address), params=Object.fromEntries(url.searchParams);calls.push({url,params});
        assert.equal(url.protocol,'https:');
        assert.equal(params.action,'query');
        assert.ok(!params.token && !params.assert && !params.assertuser);
        if(params.leuser) {
            assert.equal(url.hostname,'pt.wikipedia.org');
            assert.equal(params.leuser,USER);assert.equal(params.letype,'thanks');
            assert.ok(!params.letitle);assert.equal(params.leprop,'ids|type|user|title|timestamp');
            return sent(params,calls);
        }
        if(params.meta==='globaluserinfo') return complete({globaluserinfo:{name:USER,editcount:0,merged:[]}});
        if(params.list==='users') return complete({users:[{name:USER,registration:null}]});
        if(params.prop==='info') return complete({pages:params.pageids.split('|').map(id=>({pageid:Number(id),ns:0,title:'Artigo '+id,contentmodel:'wikitext'}))});
        assert.fail('Unexpected service request '+address);
    };
    return {calls,requestJson};
}
function options(f,extra={}) {return {user:USER,now:NOW,history:history(),requestJson:f.requestJson,...extra};}

test('the latest four counters are optional and preserve all original defaults',()=>{
    assert.equal(Appearance.metricIds.length,24);
    assert.equal(Appearance.defaults.metrics.length,8);
    for(const metric of ['thanksSent','averageBytesPerEdit','largestAddition','largestRemoval']) {
        assert.ok(Appearance.metricIds.includes(metric));assert.ok(!Appearance.defaults.metrics.includes(metric));
    }
});

test('sent thanks are public ptwiki sender logs, optional, deduplicated and independent of received thanks',async()=>{
    const f=fixture(()=>complete({logevents:[event(1),event(1),event(2)]}));
    const unused=await Statistics.collect(options(f));
    assert.equal(unused.metrics.thanksSent,null);
    assert.equal(f.calls.some(c=>c.params.leuser),false);
    const current=await Statistics.collect(options(f,{previous:unused,includeThanksSent:true}));
    assert.equal(current.metrics.thanksSent,2);assert.equal(current.metrics.thanks,0);
    assert.equal(current.pending,false);
    assert.deepEqual(current.thanksSentCoverage,{version:1,completedAt:NOW,count:2});
    assert.ok(Statistics.validate(current,{user:USER,now:NOW}).valid);
    const fresh=await Statistics.collect(options(f,{previous:current,includeThanksSent:true}));
    assert.equal(f.calls.filter(c=>c.params.leuser).length,1);
    assert.equal(fresh.metrics.thanksSent,2);
});

test('sent thanks resume through the original snapshot anchor within each request budget',async()=>{
    const f=fixture(p=>p.lecontinue?complete({logevents:[event(2),event(3)]}):
        {continue:{lecontinue:'next',continue:'-||'},query:{logevents:[event(1),event(2)]}});
    let current=await Statistics.collect(options(f,{includeThanksSent:true,maxRequests:1}));
    assert.equal(current.metrics.thanksSent,null);assert.equal(current.pending,true);
    assert.deepEqual(current.thanksSentScan.logids,[1,2]);
    assert.equal(f.calls.length,1);
    current=await Statistics.collect(options(f,{includeThanksSent:true,maxRequests:1,previous:clone(current),now:'2026-10-15T16:01:00.000Z'}));
    assert.equal(current.metrics.thanksSent,3);assert.equal(current.thanksSentScan,null);
    assert.equal(current.metricUpdatedAt.thanksSent,NOW);
    assert.equal(f.calls[1].params.lecontinue,'next');assert.equal(f.calls[1].params.continue,'-||');
    assert.equal(f.calls[1].params.lestart,NOW);assert.equal(f.calls.length,2);
});

test('sent thanks accept localized user namespace aliases through the semantic namespace number',async()=>{
    for(const title of ['User:Recipiente','Usuário:Recipiente','Usuário(a):Recipiente','Usuária:Recipiente']) {
        const f=fixture(()=>complete({logevents:[event(1,{title})]}));
        const current=await Statistics.collect(options(f,{includeThanksSent:true}));
        assert.equal(current.metrics.thanksSent,1,title);
        assert.equal(current.thanksSentScan,null);
        assert.equal(current.pending,false);
    }
});

test('hidden, suppressed, foreign, sparse and malformed log rows never produce a partial total',async()=>{
    const malformed=[event(1,{user:'Outra conta'}),event(1,{userhidden:true}),event(1,{suppressed:''}),
        event(1,{titlehidden:true}),event(1,{actionhidden:true}),event(1,{action:'other'}),event(1,{type:'other'}),
        event(1,{ns:0}),event(1,{title:'Artigo'}),event(1,{timestamp:'2026-10-16T12:00:00Z'}),
        event(1,{logid:1.5}),event(1,{title:'Usuário:<img>'}),event(1,{title:'Usuário(a):Recipiente',ns:0}),
        event(1,{title:':Recipiente'}),event(1,{title:'Usuária:'}),event(1,{title:'   :Recipiente'}),
        event(1,{title:'Usuária:   '}),event(1,{title:'Usuária:Re\u0085cipiente'}),null];
    for(const bad of malformed) {
        const f=fixture(()=>complete({logevents:[event(2),bad]}));
        const s=await Statistics.collect(options(f,{includeThanksSent:true}));
        assert.equal(s.metrics.thanksSent,null);assert.equal(s.thanksSentCoverage,null);
        assert.equal(s.pending,true);assert.ok(s.errors.includes('Agradecimentos enviados na ptwiki'));
        assert.deepEqual(s.thanksSentScan.logids,[]);
    }
    const sparse=fixture(()=>complete({logevents:new Array(1)}));
    assert.equal((await Statistics.collect(options(sparse,{includeThanksSent:true}))).metrics.thanksSent,null);
});

test('failed and repeated cursors retain the last good sent total and a retryable validated cursor',async()=>{
    const seed=await Statistics.collect(options(fixture(()=>complete({logevents:[event(5)]})),{includeThanksSent:true}));
    const later='2026-10-15T16:06:00.000Z';
    const cases=[()=>{throw new Error('Synthetic HTTP 503');},()=>({error:{code:'badvalue',info:'Unknown thanks'}}),
        ()=>({query:{logevents:[]}}),p=>({continue:{lecontinue:'same',continue:'-||'},query:{logevents:[event(p.lecontinue?2:1)]}}),
        p=>({continue:{lecontinue:p.lecontinue?'other':'same'},query:{logevents:[event(1)]}})];
    for(const sent of cases) {
        const f=fixture(sent);
        const current=await Statistics.collect(options(f,{includeThanksSent:true,previous:seed,now:later,force:true}));
        assert.equal(current.metrics.thanksSent,1);assert.equal(current.metricUpdatedAt.thanksSent,NOW);
        assert.equal(current.pending,true);assert.ok(current.errors.includes('Agradecimentos enviados na ptwiki'));
        assert.ok(Statistics.validate(current,{user:USER,now:later}).valid);
        assert.ok(f.calls.length<=20);
    }
});

test('a verified empty log is zero, unselected pending scans do not fetch, and foreign caches are discarded',async()=>{
    const f=fixture();const zero=await Statistics.collect(options(f,{includeThanksSent:true}));
    assert.equal(zero.metrics.thanksSent,0);assert.equal(zero.pending,false);
    const more=fixture(()=>({continue:{lecontinue:'next'},query:{logevents:[event(1)]}}));
    const pending=await Statistics.collect(options(more,{includeThanksSent:true,maxRequests:1}));
    const prior=more.calls.length;
    const deselected=await Statistics.collect(options(more,{previous:pending}));
    assert.equal(more.calls.slice(prior).some(c=>c.params.leuser),false);
    assert.equal(deselected.pending,false);
    const foreign=clone(zero);foreign.user='Outra conta';foreign.metrics.thanksSent=999;foreign.thanksSentCoverage.count=999;
    assert.equal((await Statistics.collect(options(f,{previous:foreign}))).metrics.thanksSent,null);
    for(const mutate of [s=>{s.thanksSentCoverage.count=4;},s=>{s.metrics.thanksSent=0.5;},
        s=>{s.thanksSentCoverage=null;},s=>{s.thanksSentScan={anchorAt:NOW,logids:[1,1],seen:[],continuation:null};},
        s=>{s.thanksSentScan={anchorAt:NOW,logids:[1],seen:[],continuation:null};},
        s=>{s.thanksSentScan={anchorAt:NOW,logids:[1],seen:[],continuation:{lecontinue:'missing'}};},
        s=>{s.thanksSentScan={anchorAt:NOW,logids:[1],seen:['next'],continuation:{lecontinue:'next',continue:'x'.repeat(1025)}};}]) {
        const bad=clone(zero);mutate(bad);assert.equal(Statistics.validate(bad,{user:USER,now:NOW}).valid,false);
    }
});

test('byte averages divide by every unique complete public revision and maxima reuse signed deltas',async()=>{
    const evidence=history([row(1,120),row(2,-80),row(3,0),row(1,120),row(4,6)]);
    const totals=Statistics.byteTotals(evidence,USER,NOW);
    assert.equal(totals.bytesAdded,126);assert.equal(totals.bytesRemoved,80);
    assert.equal(totals.averageBytesPerEdit,31.5);
    assert.equal(totals.largestAddition,120);assert.equal(totals.largestRemoval,80);
    assert.equal(totals.byteCoverage.totalEdits,4);
    const f=fixture();const current=await Statistics.collect(options(f,{history:evidence}));
    for(const key of ['averageBytesPerEdit','largestAddition','largestRemoval']) {
        assert.equal(current.metrics[key],totals[key]);assert.equal(current.metricUpdatedAt[key],NOW);
    }
    assert.equal(f.calls.some(c=>c.params.list==='usercontribs'),false);
    const forged=clone(current);forged.metrics.averageBytesPerEdit=126/2;
    assert.equal(Statistics.validate(forged,{user:USER,now:NOW}).valid,false);
});

test('byte additions, removals and complete empty histories have exact zero maxima and averages',()=>{
    for(const entries of [[],[row(1,0)]]) {
        const totals=Statistics.byteTotals(history(entries),USER,NOW);
        for(const key of ['averageBytesPerEdit','largestAddition','largestRemoval']) assert.equal(totals[key],0);
    }
    assert.equal(Statistics.byteTotals(history([row(1,-5)]),USER,NOW).averageBytesPerEdit,0);
    assert.equal(Statistics.byteTotals(history([row(1,6)]),USER,NOW).largestRemoval,0);
});

test('partial byte coverage leaves all new byte counters unknown and old caches remain valid',async()=>{
    const f=fixture();const evidence=history([row(1,25),row(2,null)]);
    evidence.byteCoverage.knownEdits=1;evidence.byteCoverage.complete=false;
    const totals=Statistics.byteTotals(evidence,USER,NOW);
    for(const key of ['averageBytesPerEdit','largestAddition','largestRemoval']) assert.equal(totals[key],null);
    const current=await Statistics.collect(options(f,{history:evidence}));
    const legacy=clone(current);
    for(const key of ['thanksSent','averageBytesPerEdit','largestAddition','largestRemoval']) {
        delete legacy.metrics[key];delete legacy.metricUpdatedAt[key];
    }
    delete legacy.thanksSentScan;delete legacy.thanksSentCoverage;
    assert.ok(Statistics.validate(legacy,{user:USER,now:NOW}).valid);
    const upgraded=await Statistics.collect(options(f,{previous:legacy,history:evidence}));
    assert.equal(upgraded.metrics.averageBytesPerEdit,null);
    assert.equal(upgraded.metrics.thanksSent,null);
    const overflowing=Statistics.byteTotals(history([row(1,Number.MAX_SAFE_INTEGER),row(2,1)]),USER,NOW);
    assert.equal(overflowing.averageBytesPerEdit,null);
    assert.equal(overflowing.largestAddition,Number.MAX_SAFE_INTEGER);
    const conflict=history([row(1,20),row(1,30)]);
    assert.throws(()=>Statistics.byteTotals(conflict,USER,NOW),/conflitantes/);
});

test('new byte cards format fractional averages and safe maxima in HTML, wikitext and paint',()=>{
    const metrics={thanksSent:3,averageBytesPerEdit:1.5,largestAddition:2048,largestRemoval:0};
    const settings={metrics:Object.keys(metrics),highlightedMetrics:Object.keys(metrics),highlightColor:'#000000'};
    for(const mode of ['html','wikitext']) {
        const markup=Cards[mode]({user:USER,metrics},null,{user:USER,appearance:settings});
        assert.match(markup,/id="dan-pu-media-bytes-por-edicao" title="1,5 bytes">1,5 bytes</);
        assert.match(markup,/id="dan-pu-maior-acrescimo" title="2\.048 bytes">2 KiB</);
        assert.match(markup,/id="dan-pu-maior-remocao" title="0 bytes">0 bytes</);
        assert.match(markup,/Na Wikipédia em português/);
        assert.equal((markup.match(/background:#000000/g)||[]).length,4);
        assert.ok((markup.match(/color:#ffffff/g)||[]).length>=8);
        assert.doesNotMatch(Cards[mode]({user:USER,metrics:{}},null,{user:USER,appearance:settings}),/>0 bytes</);
    }
    const element={textContent:'',attributes:{},setAttribute(key,value){this.attributes[key]=value;}};
    const document={getElementById:id=>id==='dan-pu-media-bytes-por-edicao'?element:null};
    Cards.paint(document,{user:USER,metrics},null,NOW);
    assert.equal(element.textContent,'1,5 bytes');assert.equal(element.attributes.title,'1,5 bytes');
    Cards.paint(document,{user:USER,metrics:{}},null,NOW);
    assert.equal(element.textContent,'1,5 bytes');
    Cards.paint(document,{user:USER,metrics:{averageBytesPerEdit:1024}},null,NOW);
    assert.equal(element.textContent,'1,0 KiB');
});
