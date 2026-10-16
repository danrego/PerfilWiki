'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Statistics=require('../src/Statistics.js');
const USER='Marina Exemplo';
const NOW='2026-10-15T16:00:00.000Z';
const clone=value=>JSON.parse(JSON.stringify(value));
const done=query=>({batchcomplete:true,query});
const account=(wiki='ptwiki',registration='2008-05-25T10:30:00Z',url='https://pt.wikipedia.org')=>({wiki,registration,url,editcount:0});
function fixture(settings={}) {
    const calls=[];
    const requestJson=async address=>{
        const url=new URL(address),params=Object.fromEntries(url.searchParams);calls.push({url,params});
        if(settings.before){const value=await settings.before(url,params);if(value!==undefined)return value;}
        if(params.meta==='globaluserinfo'){
            assert.equal(params.guiuser,USER);assert.equal(params.guiprop,'editcount|merged');
            assert.equal(params.origin,'*');assert.equal(params.action,'query');
            return done({globaluserinfo:{name:USER,editcount:0,registration:'2014-01-01T00:00:00Z',
                merged:[account()],...settings.info}});
        }
        if(params.list==='users')return done({users:[{name:USER,registration:settings.local===undefined?'2008-05-25T10:30:00Z':settings.local}]});
        if(params.list==='logevents')return done({logevents:[]});
        if(url.hostname==='xtools.wmcloud.org')return {username:USER,project:url.pathname.split('/')[4],namespace:0,redirects:'noredirects',deleted:'all',counts:{}};
        assert.fail('Unexpected service request '+address);
    };
    return {calls,requestJson};
}
function options(f,extra={}) {
    return {user:USER,now:NOW,requestJson:f.requestJson,
        history:{user:USER,project:'pt.wikipedia.org',capturedAt:NOW,complete:true,entries:[]},...extra};
}

test('earliest registration reuses one global response without changing local ptwiki registration',async()=>{
    const info={registration:'2014-01-01T00:00:00Z',merged:[account(),account('enwiki','2004-12-31T23:30:00Z','https://en.wikipedia.org'),
        account('commonswiki','2006-01-01T00:00:00Z','https://commons.wikimedia.org')]};
    const f=fixture({info});
    const state=await Statistics.collect(options(f,{includeEarliestRegistration:true}));
    assert.equal(state.metrics.earliestRegistration,'2004-12-31T23:30:00Z');
    assert.equal(state.metrics.registration,'2008-05-25T10:30:00Z');
    assert.equal(state.metricUpdatedAt.earliestRegistration,NOW);
    assert.deepEqual(state.registrationCoverage,{version:1,user:USER,checkedAt:NOW,complete:true,
        globalRegistration:info.registration,accounts:[
            {wiki:'commonswiki',url:'https://commons.wikimedia.org',registration:'2006-01-01T00:00:00Z'},
            {wiki:'enwiki',url:'https://en.wikipedia.org',registration:'2004-12-31T23:30:00Z'},
            {wiki:'ptwiki',url:'https://pt.wikipedia.org',registration:'2008-05-25T10:30:00Z'}]});
    assert.equal(f.calls.filter(c=>c.params.meta==='globaluserinfo').length,1);
    assert.deepEqual(f.calls.filter(c=>c.params.list==='users').map(c=>c.url.hostname),['pt.wikipedia.org']);
    assert.equal(f.calls.some(c=>c.params.list==='usercontribs'||c.params.meta==='userinfo'||c.params.token),false);
    assert.ok(Statistics.validate(state,{user:USER,now:NOW}).valid);
});

test('the minimum can come from the global creation timestamp or any linked project',async()=>{
    for(const merged of [[account('ptwiki','2010-01-01T00:00:00Z')],
        [account('enwiktionary','2006-01-01T00:00:00Z','https://en.wiktionary.org'),account()],[]]) {
        const f=fixture({info:{registration:'2001-01-02T03:04:05Z',merged}});
        const state=await Statistics.collect(options(f,{includeEarliestRegistration:true}));
        assert.equal(state.metrics.earliestRegistration,'2001-01-02T03:04:05Z');
        assert.equal(state.registrationCoverage.complete,true);
    }
});

test('missing and null dates give the earliest recorded date with incomplete certainty',async()=>{
    const noDate=account('enwiki',null,'https://en.wikipedia.org');delete noDate.registration;
    for(const info of [{registration:null,merged:[account()]},
        {merged:[account(),account('commonswiki',null,'https://commons.wikimedia.org')]},
        {registration:'2014-01-01T00:00:00Z',merged:[noDate]}]) {
        if(!Object.hasOwn(info,'registration'))info.registration=undefined;
        const f=fixture({info});const state=await Statistics.collect(options(f,{includeEarliestRegistration:true}));
        assert.equal(state.registrationCoverage.complete,false);
        assert.ok(state.metrics.earliestRegistration);
        assert.ok(state.registrationCoverage.globalRegistration===null||state.registrationCoverage.accounts.some(a=>a.registration===null));
        assert.ok(Statistics.validate(state,{user:USER,now:NOW}).valid);
    }
});

test('all unknown dates stay unknown without falling back to a local date or first edit',async()=>{
    const f=fixture({info:{registration:null,merged:[account('ptwiki',null)]}});
    const state=await Statistics.collect(options(f,{includeEarliestRegistration:true}));
    assert.equal(state.metrics.earliestRegistration,null);assert.equal(state.registrationCoverage.complete,false);
    assert.equal(state.metrics.registration,'2008-05-25T10:30:00Z');
    assert.equal(state.metricUpdatedAt.earliestRegistration,NOW);
    const count=f.calls.length;
    const cached=await Statistics.collect(options(f,{previous:state,includeEarliestRegistration:true}));
    assert.equal(cached.metrics.earliestRegistration,null);assert.equal(f.calls.length,count);
});

test('optional metadata stays absent until enabled, and enabling it does not restart linked-project scans',async()=>{
    const f=fixture();const unused=await Statistics.collect(options(f));
    assert.equal(unused.metrics.earliestRegistration,null);assert.equal(unused.registrationCoverage,null);
    const before=f.calls.length;
    const current=await Statistics.collect(options(f,{previous:unused,includeEarliestRegistration:true}));
    assert.equal(current.metrics.earliestRegistration,'2008-05-25T10:30:00Z');
    assert.deepEqual(f.calls.slice(before).map(c=>c.params.meta),['globaluserinfo']);
    assert.equal(current.global.infoAt,unused.global.infoAt);
    assert.deepEqual(current.projects,unused.projects);
    const after=f.calls.length;
    await Statistics.collect(options(f,{previous:current,includeEarliestRegistration:true}));
    assert.equal(f.calls.length,after);
});

test('malformed, future, hidden, duplicate and foreign registration responses preserve last-good evidence',async()=>{
    const prior=await Statistics.collect(options(fixture(),{includeEarliestRegistration:true}));
    const badInfo=[{name:'Outra conta'}, {registration:'2027-01-01T00:00:00Z'},
        {registration:'2000-02-30T00:00:00Z'}, {registration:'not a date'}, {hidden:true},
        {merged:[account('ptwiki','2027-01-01T00:00:00Z')]}, {merged:[account(),account()]},
        {merged:[{...account(),name:'Outra conta'}]}, {merged:[{...account(),user:'Outra conta'}]},
        {merged:[{...account(),url:'https://pt.wikipedia.org.evil.example'}]}, {merged:new Array(1)}];
    for(const info of badInfo){
        const f=fixture({info});
        const state=await Statistics.collect(options(f,{previous:prior,includeEarliestRegistration:true,force:true}));
        assert.equal(state.metrics.earliestRegistration,prior.metrics.earliestRegistration);
        assert.deepEqual(state.registrationCoverage,prior.registrationCoverage);
        assert.ok(state.errors.includes('Data de criação da conta')||state.errors.includes('Contribuições globais'));
    }
    for(const response of [{continue:{guicontinue:'next'},query:{globaluserinfo:{name:USER,editcount:0,merged:[account()]}}},
        {warnings:{globaluserinfo:{'*':'Incomplete fields'}}},{error:{code:'timeout'}}]) {
        const f=fixture({before:(_url,p)=>p.meta==='globaluserinfo'?response:undefined});
        const state=await Statistics.collect(options(f,{previous:prior,includeEarliestRegistration:true,force:true}));
        assert.deepEqual(state.registrationCoverage,prior.registrationCoverage);
    }
    const failed=fixture({before:(_url,p)=>{if(p.meta==='globaluserinfo')throw new Error('Synthetic HTTP 503');}});
    const state=await Statistics.collect(options(failed,{previous:prior,includeEarliestRegistration:true,force:true}));
    assert.deepEqual(state.registrationCoverage,prior.registrationCoverage);
});

test('cold invalid evidence stays unknown and budget exhaustion remains resumable',async()=>{
    const f=fixture({info:{registration:'bad'}});
    const invalid=await Statistics.collect(options(f,{includeEarliestRegistration:true}));
    assert.equal(invalid.metrics.earliestRegistration,null);assert.equal(invalid.registrationCoverage,null);
    const many=fixture();
    const first=await Statistics.collect(options(many,{maxRequests:1,includeEarliestRegistration:true}));
    assert.equal(first.registrationCoverage.complete,true);assert.equal(many.calls.length,1);
    const next=await Statistics.collect(options(many,{previous:first,maxRequests:1,includeEarliestRegistration:true}));
    assert.equal(next.metrics.earliestRegistration,first.metrics.earliestRegistration);
    assert.equal(many.calls.filter(c=>c.params.meta==='globaluserinfo').length,1);
});

test('old cache migration and 24-hour metadata freshness do not fabricate or erase dates',async()=>{
    const f=fixture();const state=await Statistics.collect(options(f,{includeEarliestRegistration:true}));
    const legacy=clone(state);delete legacy.metrics.earliestRegistration;delete legacy.metricUpdatedAt.earliestRegistration;delete legacy.registrationCoverage;
    assert.ok(Statistics.validate(legacy,{user:USER,now:NOW}).valid);
    const migrated=await Statistics.collect(options(f,{previous:legacy,includeEarliestRegistration:true}));
    assert.equal(migrated.metrics.registration,state.metrics.registration);
    assert.equal(migrated.metrics.earliestRegistration,state.metrics.earliestRegistration);
    const later='2026-10-16T16:01:00.000Z',recentGlobal=clone(migrated);
    recentGlobal.capturedAt=later;recentGlobal.global.infoAt=later;
    recentGlobal.metricUpdatedAt.registration=later;
    Object.values(recentGlobal.projects).forEach(project=>{project.articlesAt=later;});
    const changed=fixture({info:{registration:'2000-01-01T00:00:00Z'}});
    const refreshed=await Statistics.collect(options(changed,{now:later,previous:recentGlobal,includeEarliestRegistration:true}));
    assert.equal(refreshed.metrics.earliestRegistration,'2000-01-01T00:00:00Z');
    assert.equal(refreshed.registrationCoverage.checkedAt,later);
    assert.deepEqual(changed.calls.map(c=>c.params.meta),['globaluserinfo']);
});

test('linked project aliases normalize their origins and attachment timestamps never replace creation dates',async()=>{
    const f=fixture({info:{registration:'2014-01-01T00:00:00Z',merged:[
        {...account('commonswiki','2007-04-05T23:30:00Z','https://commons.wikimedia.org/wiki/User:Marina_Exemplo'),timestamp:'2000-01-01T00:00:00Z'},
        {...account('enwiktionary','2009-01-01T00:00:00Z','https://en.wiktionary.org/w/'),timestamp:'1999-01-01T00:00:00Z'}]}});
    const state=await Statistics.collect(options(f,{includeEarliestRegistration:true}));
    assert.equal(state.metrics.earliestRegistration,'2007-04-05T23:30:00Z');
    assert.deepEqual(state.registrationCoverage.accounts.map(account=>account.url),['https://commons.wikimedia.org','https://en.wiktionary.org']);
    assert.equal(state.registrationCoverage.complete,true);
    const reordered=clone(state);
    reordered.registrationCoverage.accounts=reordered.registrationCoverage.accounts.map(account=>({registration:account.registration,url:account.url,wiki:account.wiki}));
    assert.ok(Statistics.validate(reordered,{user:USER,now:NOW}).valid);
});

test('cache validation recomputes date and certainty from same-user timestamp evidence',async()=>{
    const state=await Statistics.collect(options(fixture({info:{merged:[account('ptwiki',null)]}}),{includeEarliestRegistration:true}));
    for(const mutate of [s=>{s.registrationCoverage.complete=true;},s=>{s.registrationCoverage.user='Outra conta';},
        s=>{s.metrics.earliestRegistration='1900-01-01T00:00:00Z';},s=>{s.registrationCoverage=null;},
        s=>{s.metricUpdatedAt.earliestRegistration='2000-01-01T00:00:00Z';},
        s=>{s.registrationCoverage.accounts=[s.registrationCoverage.accounts[0],s.registrationCoverage.accounts[0]];},
        s=>{s.registrationCoverage.accounts[0].registration='2027-01-01T00:00:00Z';},
        s=>{s.registrationCoverage.accounts=new Array(1);}]) {
        const bad=clone(state);mutate(bad);assert.equal(Statistics.validate(bad,{user:USER,now:NOW}).valid,false);
    }
    const foreign=clone(state);foreign.user='Outra conta';
    const current=await Statistics.collect(options(fixture(),{previous:foreign}));
    assert.equal(current.metrics.earliestRegistration,null);assert.equal(current.registrationCoverage,null);
});
