'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Statistics=require('../src/Statistics.js');
const USER='Editora Exemplo';
const NOW='2026-10-15T12:00:00.000Z';
const LATER='2026-10-16T12:00:01.000Z';
const copy=value=>JSON.parse(JSON.stringify(value));
const done=query=>({batchcomplete:true,query});
function evidence() {
    return {globaluserinfo:{name:USER,editcount:10620,registration:'2013-04-12T00:00:00Z',merged:[
        {wiki:'ptwiki',url:'https://pt.wikipedia.org',editcount:10620,registration:'2014-07-30T00:00:00Z'},
        {wiki:'enwiki',url:'https://en.wikipedia.org',editcount:0,registration:'2008-05-25T00:00:00Z'}]},
        users:[{name:USER,userid:41,registration:'2014-07-30T00:00:00Z',groups:['extendedconfirmed','rollbacker'],implicitgroups:['*','user','autoconfirmed']}]};
}
function fixture(transform) {
    const calls=[];
    async function requestJson(address) {
        const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
        const query=evidence();
        if(!p.meta)delete query.globaluserinfo;
        if(!p.list)delete query.users;
        const response=done(query);
        return transform?transform(response,p):response;
    }
    return {calls,requestJson};
}
function options(io,extra={}) {
    return {user:USER,now:NOW,requestJson:io.requestJson,maxRequests:1,deferDetails:true,
        includeEarliestRegistration:true,includeUserGroups:true,...extra};
}
function valid(state,now=NOW) { assert.deepEqual(Statistics.validate(state,{user:USER,now}),{valid:true,errors:[]}); }

test('one anonymous query supplies verified global counts, earliest registration, local registration and optional groups',async()=>{
    const io=fixture(),state=await Statistics.collect(options(io));
    assert.equal(io.calls.length,1);
    assert.deepEqual(io.calls[0].p,{action:'query',format:'json',formatversion:'2',origin:'*',maxlag:'5',
        meta:'globaluserinfo',guiuser:USER,guiprop:'editcount|merged',list:'users',ususers:USER,usprop:'registration|groups|implicitgroups'});
    assert.equal(io.calls[0].url.origin,'https://pt.wikipedia.org');
    assert.equal(state.metrics.edits,10620);
    assert.equal(state.metrics.registration,'2014-07-30T00:00:00Z');
    assert.equal(state.metrics.earliestRegistration,'2008-05-25T00:00:00Z');
    assert.equal(state.registrationCoverage.complete,true);
    assert.equal(state.userGroups.checkedAt,NOW);
    assert.ok(state.userGroups.groups.includes('rollbacker'));
    assert.equal(state.metrics.thanks,null);assert.equal(state.metrics.edited,null);assert.equal(state.pending,true);
    valid(state);
});

test('disabled optional groups are neither requested nor imported from unsolicited response data',async()=>{
    const io=fixture(),state=await Statistics.collect(options(io,{includeUserGroups:false}));
    assert.equal(io.calls.length,1);assert.equal(io.calls[0].p.usprop,'registration');
    assert.equal(state.userGroups,undefined);assert.equal(state.userGroupsAttemptAt,undefined);
    assert.equal(state.metrics.edits,10620);assert.equal(state.metricUpdatedAt.registration,NOW);
    valid(state);
});

test('a missing or foreign global module cannot discard independently verified local account fields',async()=>{
    for(const alter of [query=>{delete query.globaluserinfo;},query=>{query.globaluserinfo.name='Outra conta';},
        query=>{query.globaluserinfo.hidden=false;},query=>{query.globaluserinfo.merged[0].user='Outra conta';}]) {
        const io=fixture(response=>{alter(response.query);return response;});
        const state=await Statistics.collect(options(io));
        assert.equal(io.calls.length,1);assert.equal(state.metrics.edits,null);assert.equal(state.metrics.earliestRegistration,null);
        assert.equal(state.global,null);assert.equal(state.registrationCoverage,null);
        assert.equal(state.metrics.registration,'2014-07-30T00:00:00Z');assert.equal(state.userGroups.checkedAt,NOW);
        assert.ok(state.errors.includes('Contribuições globais'));valid(state);
    }
});

test('missing, hidden, foreign and invalid local users cannot discard verified global account data',async()=>{
    const alterations=[query=>{delete query.users;},query=>{query.users=[];},query=>{query.users[0].name='Outra conta';},
        query=>{query.users[0].hidden=false;},query=>{query.users[0].userid=0;},query=>{query.users.push(copy(query.users[0]));}];
    for(const alter of alterations) {
        const io=fixture(response=>{alter(response.query);return response;});
        const state=await Statistics.collect(options(io));
        assert.equal(io.calls.length,1);assert.equal(state.metrics.edits,10620);
        assert.equal(state.metrics.earliestRegistration,'2008-05-25T00:00:00Z');
        assert.equal(state.metrics.registration,null);assert.equal(state.metricUpdatedAt.registration,null);assert.equal(state.userGroups,null);
        assert.ok(state.errors.includes('Data de ingresso na ptwiki'));assert.ok(state.errors.includes('Estatutos na ptwiki'));valid(state);
    }
});

test('local registration and optional groups are checked independently within the same user module',async()=>{
    const missingGroups=fixture(response=>{delete response.query.users[0].groups;return response;});
    const local=await Statistics.collect(options(missingGroups));
    assert.equal(missingGroups.calls.length,1);assert.equal(local.metrics.registration,'2014-07-30T00:00:00Z');
    assert.equal(local.userGroups,null);assert.ok(local.errors.includes('Estatutos na ptwiki'));valid(local);
    for(const invalidDate of [undefined,'2027-01-01T00:00:00Z','2000-02-30T00:00:00Z']) {
        const io=fixture(response=>{response.query.users[0].registration=invalidDate;return response;});
        const state=await Statistics.collect(options(io));
        assert.equal(io.calls.length,1);assert.equal(state.metrics.registration,null);assert.equal(state.metricUpdatedAt.registration,null);
        assert.equal(state.userGroups.checkedAt,NOW);assert.ok(state.errors.includes('Data de ingresso na ptwiki'));valid(state);
    }
});

test('unknown registration remains explicit null and does not borrow the earliest global date',async()=>{
    const io=fixture(response=>{response.query.users[0].registration=null;return response;});
    const state=await Statistics.collect(options(io));
    assert.equal(state.metrics.registration,null);assert.equal(state.metricUpdatedAt.registration,NOW);
    assert.equal(state.metrics.earliestRegistration,'2008-05-25T00:00:00Z');assert.equal(io.calls.length,1);valid(state);
});

test('failed shared requests are never retried per module and retain each previous proof without a fresh timestamp',async()=>{
    const prior=await Statistics.collect(options(fixture()));
    for(const response of [{error:{code:'maxlag'}},{warnings:{users:{warnings:'Incomplete result'}}},
        {batchcomplete:true,continue:{continue:'next'},query:evidence()},null]) {
        const io=fixture(()=>response);
        const state=await Statistics.collect(options(io,{previous:prior,now:LATER,force:true}));
        assert.equal(io.calls.length,1);assert.equal(state.metricUpdatedAt.edits,NOW);assert.equal(state.metricUpdatedAt.registration,NOW);
        assert.deepEqual(state.registrationCoverage,prior.registrationCoverage);assert.deepEqual(state.userGroups,prior.userGroups);
        assert.equal(state.userGroupsAttemptAt,LATER);assert.ok(state.errors.includes('Contribuições globais')||state.errors.includes('Data de criação da conta'));
        assert.ok(state.errors.includes('Data de ingresso na ptwiki'));valid(state,LATER);
    }
    const failure=fixture(()=>{throw new Error('Synthetic network failure');});
    const state=await Statistics.collect(options(failure,{previous:prior,now:LATER,force:true}));
    assert.equal(failure.calls.length,1);assert.deepEqual(state.registrationCoverage,prior.registrationCoverage);valid(state,LATER);
});

test('fresh identity checkpoints make no request, while one due module uses a single appropriate public query',async()=>{
    const io=fixture(),prior=await Statistics.collect(options(io));
    const cached=await Statistics.collect(options(io,{previous:prior}));
    assert.equal(io.calls.length,1);assert.deepEqual(cached.metrics,prior.metrics);valid(cached);
    const missingLocal=copy(prior);missingLocal.metrics.registration=null;missingLocal.metricUpdatedAt.registration=null;
    const localIo=fixture(),local=await Statistics.collect(options(localIo,{previous:missingLocal}));
    assert.equal(localIo.calls.length,1);assert.equal(localIo.calls[0].p.meta,undefined);assert.equal(localIo.calls[0].p.usprop,'registration');
    assert.deepEqual(local.global,prior.global);assert.equal(local.metricUpdatedAt.registration,NOW);valid(local);
    const missingEarliest=copy(prior);missingEarliest.metrics.earliestRegistration=null;
    missingEarliest.metricUpdatedAt.earliestRegistration=null;missingEarliest.registrationCoverage=null;
    const globalIo=fixture(),global=await Statistics.collect(options(globalIo,{previous:missingEarliest}));
    assert.equal(globalIo.calls.length,1);assert.equal(globalIo.calls[0].p.meta,'globaluserinfo');assert.equal(globalIo.calls[0].p.list,undefined);
    assert.deepEqual(global.global,prior.global);assert.equal(global.metricUpdatedAt.earliestRegistration,NOW);valid(global);
});

test('ordinary detailed collection retains the established separate user and global requests',async()=>{
    const io=fixture();
    const state=await Statistics.collect(options(io,{deferDetails:false,maxRequests:3}));
    assert.equal(io.calls.length,3);
    assert.deepEqual(io.calls.map(call=>[call.p.list,call.p.meta,call.p.usprop]),[
        ['users',undefined,'groups|implicitgroups'],[undefined,'globaluserinfo',undefined],['users',undefined,'registration']]);
    assert.equal(state.metrics.edits,10620);assert.equal(state.metrics.registration,'2014-07-30T00:00:00Z');valid(state);
});
