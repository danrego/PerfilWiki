'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Coordinator = require('../src/Coordinator.js');
const Statistics = require('../src/Statistics.js');
const USER = 'Editora Exemplo';
const NOW = '2026-10-15T12:00:00.000Z';
const DAY = 86400000;
const done = query => ({batchcomplete:true,query});
const copy = value => JSON.parse(JSON.stringify(value));

function synthetic({edits=12001,articles=3690,projects=137}={}) {
    const calls=[], snapshots=[];
    const rows=Array.from({length:edits},(_,index)=>({revid:50000-index,parentid:49000-index,
        pageid:index%articles+1,ns:0,title:'Artigo '+(index%articles+1),timestamp:new Date(Date.parse(NOW)-60000*(index+1)).toISOString(),
        user:USER,tags:[],new:false,sizediff:1}));
    const merged=Array.from({length:projects},(_,index)=>({wiki:index?'example'+index+'wiki':'ptwiki',
        url:'https://'+(index?'example'+index:'pt')+'.wikipedia.org',editcount:index?0:edits,
        registration:index===1?'2008-05-25T00:00:00Z':'2014-07-30T00:00:00Z'}));
    async function requestJson(address) {
        const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
        if(p.meta==='globaluserinfo')return done({globaluserinfo:{name:USER,editcount:edits,registration:'2013-04-12T00:00:00Z',merged}});
        if(p.list==='users')return done({users:[{name:USER,registration:'2014-07-30T00:00:00Z'}]});
        if(p.list==='usercontribs') {
            const offset=Number(p.uccontinue||0),batch=rows.slice(offset,offset+500);
            return offset+500<rows.length?{continue:{continue:'-||',uccontinue:String(offset+500)},query:{usercontribs:batch}}:done({usercontribs:batch});
        }
        if(p.prop==='info')return done({pages:p.pageids.split('|').map(Number).map(pageid=>({pageid,ns:0,title:'Artigo '+pageid,contentmodel:'wikitext'}))});
        if(p.list==='logevents')return done({logevents:[]});
        if(url.hostname==='xtools.wmcloud.org')return {username:USER,project:url.pathname.split('/')[4],namespace:0,redirects:'noredirects',deleted:'all',counts:{'0':{count:0}}};
        if(url.hostname==='wikimedia.org') {
            const parts=url.pathname.split('/'),stamp=value=>Date.parse(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T00:00:00Z');
            assert.equal(parts[10],'daily');
            return {items:Array.from({length:Math.round((stamp(parts[12])-stamp(parts[11]))/DAY)+1},(_,index)=>({project:'pt.wikipedia.org',article:decodeURIComponent(parts[9]),
                agent:'user',access:'all-access',granularity:'daily',timestamp:new Date(stamp(parts[11])+index*DAY).toISOString().slice(0,10).replaceAll('-','')+'00',views:3}))};
        }
        assert.fail('Unexpected synthetic request: '+address);
    }
    return {calls,snapshots,requestJson,rows,options(extra={}) {return Object.assign({config:{user:USER,project:'pt.wikipedia.org',timeZone:'UTC'},now:NOW,requestJson,
        maxRequests:40,includeEarliestRegistration:true,checkpointEvery:1,onProgress:state=>{
            assert.equal(Coordinator.validateState(state).valid,true);snapshots.push({calls:calls.length,requests:copy(calls.map(call=>call.p)),state:copy(state)});
        }},extra);}};
}

test('cold identity counters arrive before 12,001 contributions and 137 linked-project scans, with no duplicate identity lookups',async()=>{
    const io=synthetic();
    const state=await Coordinator.update(io.options({historyBudget:20}));
    const early=io.snapshots.find(snapshot=>snapshot.state.statistics.metrics.edits!==null);
    assert.ok(early);assert.equal(early.calls,2);
    assert.equal(early.requests.some(p=>p.list==='usercontribs'||p.list==='logevents'||p.prop==='info'),false);
    assert.equal(early.state.statistics.metrics.edits,12001);
    assert.equal(early.state.statistics.metrics.earliestRegistration,'2008-05-25T00:00:00Z');
    assert.equal(early.state.statistics.metrics.edited,null);
    assert.equal(early.state.statistics.metrics.thanks,null);
    assert.equal(early.state.activity.complete,false);
    assert.equal(early.state.complete,false);
    assert.ok(state.history.pending);
    assert.equal(state.history.pending.entries.length,10000);
    assert.equal(io.calls.filter(call=>call.p.meta==='globaluserinfo').length,1);
    assert.equal(io.calls.filter(call=>call.p.list==='users').length,1);
    assert.ok(io.calls.length<=40);
});

test('large cold cohorts resume history and start real article series without duplicate metadata dispatches in each cycle',async()=>{
    const io=synthetic();let state=null,round=0;
    for(;round<10;round++) {
        const start=io.calls.length;
        state=await Coordinator.update(io.options({previous:state,now:new Date(Date.parse(NOW)+round*1000).toISOString(),onProgress:undefined}));
        const cycle=io.calls.slice(start),seen=new Set();
        assert.ok(cycle.length<=40);
        for(const call of cycle.filter(call=>call.p.prop==='info'))for(const id of call.p.pageids.split('|')) {
            assert.equal(seen.has(id),false,'An article metadata ID is fetched at most once per cycle');seen.add(id);
        }
        assert.equal(Coordinator.validateState(state).valid,true);
        assert.notEqual(state.pageviews.error && state.pageviews.error.code,'request-budget');
        if(state.pageviews.progress.collectedArticles>0&&state.pageviews.metadata.complete)break;
    }
    assert.ok(round<10,'A finite metadata phase yields to real article series');
    assert.equal(io.calls.filter(call=>call.p.list==='usercontribs').length,25,'The full history is resumed, never restarted');
    assert.equal(io.calls.filter(call=>call.p.meta==='globaluserinfo').length,1);
    assert.equal(io.calls.filter(call=>call.p.list==='users').length,1);
    assert.equal(state.history.complete,true);
    assert.equal(state.history.entries.length,12001);
    assert.equal(state.activity.complete,true);
    assert.equal(state.pageviews.metadata.complete,true);
    assert.equal(state.pageviews.metadata.cohort.length,3690);
    assert.ok(state.pageviews.progress.collectedArticles>0);
    assert.equal(state.statistics.metrics.thanks,null,'A partial linked-wiki scan cannot become an invented exact zero');
});

test('identity-only collection defers linked-wiki logs, metadata and XTools while retaining their old exact values',async()=>{
    const io=synthetic({edits:3,articles:2,projects:2});
    const first=await Statistics.collect({user:USER,now:NOW,requestJson:io.requestJson,maxRequests:3,deferDetails:true,includeEarliestRegistration:true});
    assert.equal(first.metrics.edits,3);assert.equal(first.metrics.thanks,null);assert.equal(first.pending,true);
    assert.equal(io.calls.length,2);
    assert.equal(first.metrics.earliestRegistration,'2008-05-25T00:00:00Z');
    assert.equal(Statistics.validate(first,{user:USER,now:NOW}).valid,true);
    const before=io.calls.length;
    const second=await Statistics.collect({user:USER,now:NOW,requestJson:io.requestJson,maxRequests:3,deferDetails:true,includeEarliestRegistration:true,previous:first});
    assert.equal(io.calls.length,before,'A fresh identity checkpoint needs no second global or local request');
    assert.equal(second.metrics.edits,3);
});

test('default cold scheduling produces useful provisional views in the first forty-request cycle for a 10,620-edit account',async()=>{
    const io=synthetic({edits:10620});
    const state=await Coordinator.update(io.options());
    const first=io.snapshots.find(snapshot=>snapshot.state.pageviews.periods['30d'].rows.length>0);
    assert.ok(first,'Initial article rows cannot wait for thousands of metadata and pageview requests');
    assert.ok(first.calls<=32,'Identity, the bounded full history, one metadata batch and availability controls precede the first rows');
    assert.ok(io.calls.length<=40);
    assert.equal(state.history.complete,true);assert.equal(state.history.entries.length,10620);
    assert.equal(state.pageviews.metadata.complete,false);
    assert.equal(state.pageviews.progress.collectedArticles,10);
    for(const period of Object.values(state.pageviews.periods)) {
        assert.equal(period.rows.length,10);assert.equal(period.total,null);assert.equal(period.complete,false);assert.equal(period.rankingComplete,false);
    }
    assert.equal(io.calls.filter(call=>call.p.list==='usercontribs').length,22);
    assert.equal(io.calls.filter(call=>call.p.meta==='globaluserinfo').length,1);
});

test('detailed linked-project counts resume after metadata priority and eventually complete without starving or inventing zero totals',async()=>{
    const io=synthetic({edits:300,articles:300,projects:137});let state=null,rounds=0;
    for(;rounds<40;rounds++) {
        const before=io.calls.length;
        state=await Coordinator.update(io.options({previous:state,now:new Date(Date.parse(NOW)+rounds*1000).toISOString(),onProgress:undefined}));
        assert.ok(io.calls.length-before<=40);
        assert.equal(Coordinator.validateState(state).valid,true);
        if(state.complete)break;
    }
    assert.ok(rounds<40,'View metadata priority must yield to detailed statistics');
    assert.equal(state.complete,true);assert.equal(state.statistics.pending,false);
    assert.equal(state.statistics.metrics.thanks,0);assert.equal(state.statistics.metrics.articles,0);
    assert.equal(io.calls.filter(call=>call.p.list==='logevents').length,137,'Every zero comes from the actual public log response, never editcount inference');
    assert.equal(io.calls.filter(call=>call.url.hostname==='xtools.wmcloud.org').length,137);
    assert.equal(io.calls.filter(call=>call.p.meta==='globaluserinfo').length,1);
    assert.equal(io.calls.filter(call=>call.p.list==='usercontribs').length,1);
});
