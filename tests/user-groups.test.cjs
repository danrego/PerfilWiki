'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Groups=require('../src/UserGroups.js');
const Statistics=require('../src/Statistics.js');
const Coordinator=require('../src/Coordinator.js');
const USER='Marina Exemplo',NOW='2026-10-15T16:00:00.000Z',DAY=86400000;
const clone=value=>JSON.parse(JSON.stringify(value));
const shift=ms=>new Date(Date.parse(NOW)+ms).toISOString();
const done=query=>({batchcomplete:true,query});
const proof=(groups=['*','autoconfirmed','extendedconfirmed','rollbacker','user'])=>({version:1,user:USER,project:'pt.wikipedia.org',checkedAt:NOW,groups:Groups.normalize(groups)});
function fixture(settings={}){
    const calls=[];
    const requestJson=async address=>{
        const url=new URL(address),p=Object.fromEntries(url.searchParams);calls.push({url,p});
        if(settings.before){const value=await settings.before(url,p);if(value!==undefined)return value;}
        assert.equal(url.hostname,'pt.wikipedia.org');assert.equal(p.action,'query');assert.equal(p.origin,'*');
        assert.equal(p.token,undefined);assert.equal(p.assert,undefined);assert.equal(p.meta==='userinfo',false);
        if(p.list==='users'&&p.usprop==='groups|implicitgroups')return done({users:[{name:USER,userid:41,
            groups:['rollbacker','extendedconfirmed'],implicitgroups:['*','user','autoconfirmed'],...settings.groupUser}]});
        if(p.list==='users')return done({users:[{name:USER,registration:'2008-05-25T10:30:00Z'}]});
        if(p.list==='usercontribs')return done({usercontribs:[]});
        if(p.meta==='globaluserinfo')return done({globaluserinfo:{name:USER,editcount:0,merged:[]}});
        assert.fail('Unexpected service request '+address);
    };
    return {calls,requestJson};
}
function options(io,extra={}){return {user:USER,now:NOW,requestJson:io.requestJson,
    history:{user:USER,project:'pt.wikipedia.org',capturedAt:NOW,complete:true,entries:[]},...extra};}
const groupCalls=io=>io.calls.filter(call=>call.p.usprop==='groups|implicitgroups');
const integrated=(io,extra={})=>({now:NOW,config:{user:USER,project:'pt.wikipedia.org',timeZone:'UTC'},requestJson:io.requestJson,...extra});

test('public group normalization removes repeats while role hierarchy preserves independent rights',()=>{
    assert.deepEqual(Groups.normalize(['user','rollbacker','*','rollbacker']),['*','rollbacker','user']);
    assert.deepEqual(Groups.visible(['*','user','autoconfirmed','confirmed','extendedconfirmed','autoreviewer','rollbacker','sysop']),
        ['extendedconfirmed','autoreviewer','rollbacker','sysop']);
    assert.deepEqual(Groups.labels(['*','user']),['Usuário registrado']);
    assert.deepEqual(Groups.labels([]),['Usuário registrado']);
    assert.deepEqual(Groups.labels(['autoconfirmed']),['Autoconfirmado']);
    assert.deepEqual(Groups.labels(['future-group','constructor']),['constructor','future-group']);
    assert.equal(Groups.text(proof(),USER,NOW),'Autoconfirmado estendido · Reversor');
});

test('unsafe malformed and oversized public group inputs never become display text',()=>{
    for(const values of [null,'rollbacker',[null],new Array(1),['<img>'],['sysop|bot'],['SYSOP'],[''],['x'.repeat(65)],Array(129).fill('user')])
        assert.throws(()=>Groups.normalize(values),/inválidos/);
    assert.deepEqual(Groups.visible(['user','bot','autoreviewer']),['autoreviewer','bot']);
});

test('proofs are owner-bound dated canonical evidence rather than a profile configuration value',()=>{
    const original=proof();assert.deepEqual(Groups.fromProof(original,USER,NOW),original);
    const copied=Groups.fromProof(original,USER,NOW);copied.groups.push('sysop');assert.notDeepEqual(copied,original);
    for(const change of [p=>{p.user='Outra pessoa';},p=>{p.project='en.wikipedia.org';},p=>{p.version=2;},
        p=>{p.checkedAt=shift(1);},p=>{p.checkedAt='2026-02-30T00:00:00Z';},p=>{p.groups.reverse();},
        p=>{p.groups.push('user');},p=>{p.groups=['<script>'];},p=>{p.extra=true;}]){
        const bad=clone(original);change(bad);assert.equal(Groups.fromProof(bad,USER,NOW),null);assert.equal(Groups.text(bad,USER,NOW),null);
    }
    assert.equal(Groups.fromProof(original,USER,'bad'),null);assert.equal(Groups.text(null,USER,NOW),null);
});

test('disabled groups perform no extra public lookup and legacy caches remain compatible',async()=>{
    const io=fixture(),state=await Statistics.collect(options(io));
    assert.equal(groupCalls(io).length,0);assert.equal(state.userGroups,undefined);
    assert.equal(Statistics.validate(state,{user:USER,now:NOW}).valid,true);
    const after=io.calls.length;
    const cached=await Statistics.collect(options(io,{previous:state}));
    assert.equal(io.calls.length,after);assert.equal(cached.userGroups,undefined);
});

test('enabling public groups requests the configured username and combines explicit and implicit groups once',async()=>{
    const io=fixture({groupUser:{groups:['rollbacker','extendedconfirmed','rollbacker'],implicitgroups:['*','user','autoconfirmed','user']}});
    const state=await Statistics.collect(options(io,{includeUserGroups:true}));
    assert.deepEqual(state.userGroups,proof());assert.equal(groupCalls(io).length,1);
    const request=groupCalls(io)[0];assert.equal(request.p.ususers,USER);assert.equal(request.p.list,'users');
    assert.equal(request.url.origin,'https://pt.wikipedia.org');assert.equal(request.url.pathname,'/w/api.php');
    assert.equal(Statistics.validate(state,{user:USER,now:NOW}).valid,true);
    assert.equal(state.metrics.userGroups,undefined);assert.equal(state.metricUpdatedAt.userGroups,undefined);
    const after=io.calls.length;
    const cached=await Statistics.collect(options(io,{previous:state,includeUserGroups:true,now:shift(1000)}));
    assert.deepEqual(cached.userGroups,state.userGroups);assert.equal(io.calls.length,after);
});

test('verified empty explicit rights show a registered user without inventing permissions',async()=>{
    const io=fixture({groupUser:{groups:[],implicitgroups:['*','user']}});
    const state=await Statistics.collect(options(io,{includeUserGroups:true}));
    assert.equal(Groups.text(state.userGroups,USER,NOW),'Usuário registrado');
    assert.equal(state.errors.includes('Estatutos na ptwiki'),false);
});

test('group freshness is daily, manual refresh is explicit and disabling preserves last-good evidence',async()=>{
    const first=fixture(),prior=await Statistics.collect(options(first,{includeUserGroups:true}));
    const io=fixture({groupUser:{groups:['autoreviewer'],implicitgroups:['*','user','autoconfirmed']}});
    const beforeDay=await Statistics.collect(options(io,{includeUserGroups:true,previous:prior,now:shift(DAY-1)}));
    assert.deepEqual(beforeDay.userGroups,prior.userGroups);assert.equal(groupCalls(io).length,0);
    const daily=await Statistics.collect(options(io,{includeUserGroups:true,previous:beforeDay,now:shift(DAY)}));
    assert.equal(groupCalls(io).length,1);assert.equal(daily.userGroups.checkedAt,shift(DAY));
    assert.equal(Groups.text(daily.userGroups,USER,shift(DAY)),'Autoconfirmado · Autorrevisor');
    const manual=await Statistics.collect(options(io,{includeUserGroups:true,previous:daily,now:shift(DAY+1000),force:true}));
    assert.equal(groupCalls(io).length,2);assert.equal(manual.userGroups.checkedAt,shift(DAY+1000));
    const disabled=await Statistics.collect(options(io,{previous:manual,now:shift(3*DAY)}));
    assert.equal(groupCalls(io).length,2);assert.deepEqual(disabled.userGroups,manual.userGroups);
});

test('partial foreign hidden malformed and failed group replies retain dated last-good evidence',async()=>{
    const prior=await Statistics.collect(options(fixture(),{includeUserGroups:true}));
    const badUsers=[{name:'Outra pessoa'},{userid:0},{userid:-1},{userid:'41'},{groups:null},{implicitgroups:undefined},
        {groups:['<script>']},{groups:new Array(1)},{hidden:true},{missing:false},{invalid:true},{suppressed:''}];
    for(const groupUser of badUsers){
        const io=fixture({groupUser});const result=await Statistics.collect(options(io,{previous:prior,includeUserGroups:true,force:true}));
        assert.deepEqual(result.userGroups,prior.userGroups);assert.ok(result.errors.includes('Estatutos na ptwiki'));
        assert.deepEqual(prior.userGroups,proof());
    }
    const badResponses=[{batchcomplete:true,continue:{},query:{users:[]}},{batchcomplete:true,continue:null,query:{users:[]}},
        {query:{users:[]}},{batchcomplete:true,query:{users:[]}},{batchcomplete:true,query:{users:new Array(1)}},
        {warnings:{users:{'*':'Incomplete groups'}}},{error:{code:'timeout'}}];
    for(const response of badResponses){
        const io=fixture({before:(_url,p)=>p.usprop==='groups|implicitgroups'?response:undefined});
        const result=await Statistics.collect(options(io,{previous:prior,includeUserGroups:true,force:true}));
        assert.deepEqual(result.userGroups,prior.userGroups);assert.ok(result.errors.includes('Estatutos na ptwiki'));
    }
    const failure=fixture({before:(_url,p)=>{if(p.usprop==='groups|implicitgroups')throw new Error('Synthetic HTTP 503');}});
    const result=await Statistics.collect(options(failure,{previous:prior,includeUserGroups:true,force:true}));
    assert.deepEqual(result.userGroups,prior.userGroups);assert.ok(result.errors.includes('Estatutos na ptwiki'));
});

test('cold failed groups stay unavailable and tight request budgets resume without duplicate group lookups',async()=>{
    const cold=await Statistics.collect(options(fixture({groupUser:{userid:0}}),{includeUserGroups:true}));
    assert.equal(cold.userGroups,null);assert.ok(cold.errors.includes('Estatutos na ptwiki'));
    const io=fixture();let state;
    for(let index=0;index<3;index++){
        const before=io.calls.length;state=await Statistics.collect(options(io,{previous:state,maxRequests:1,includeUserGroups:true}));
        assert.ok(io.calls.length-before<=1);assert.ok(Statistics.validate(state,{user:USER,now:NOW}).valid);
    }
    assert.equal(groupCalls(io).length,1);assert.deepEqual(state.userGroups,proof());
    assert.equal(state.pending,false);assert.equal(state.metrics.edits,0);
});

test('a failed daily refresh retains its last-good date and waits a day before retrying a known proof',async()=>{
    const prior=await Statistics.collect(options(fixture(),{includeUserGroups:true}));
    const io=fixture({groupUser:{userid:0}});
    const failed=await Statistics.collect(options(io,{previous:prior,now:shift(DAY),includeUserGroups:true}));
    assert.deepEqual(failed.userGroups,prior.userGroups);assert.equal(failed.userGroupsAttemptAt,shift(DAY));
    assert.equal(groupCalls(io).length,1);
    const cached=await Statistics.collect(options(io,{previous:failed,now:shift(DAY+300000),includeUserGroups:true}));
    assert.deepEqual(cached.userGroups,prior.userGroups);assert.equal(groupCalls(io).length,1);
    assert.ok(cached.errors.includes('Estatutos na ptwiki'));
    await Statistics.collect(options(io,{previous:cached,now:shift(2*DAY),includeUserGroups:true}));
    assert.equal(groupCalls(io).length,2);
});

test('cache validation rejects foreign future and noncanonical group proofs without disturbing old states',async()=>{
    const prior=await Statistics.collect(options(fixture(),{includeUserGroups:true}));
    for(const change of [p=>{p.userGroups.user='Outra pessoa';},p=>{p.userGroups.project='en.wikipedia.org';},
        p=>{p.userGroups.checkedAt=shift(1);},p=>{p.userGroupsAttemptAt=shift(1);},p=>{p.userGroups.groups=['sysop','sysop'];}]){
        const bad=clone(prior);change(bad);assert.equal(Statistics.validate(bad,{user:USER,now:NOW}).valid,false);
    }
    const legacy=clone(prior);delete legacy.userGroups;assert.equal(Statistics.validate(legacy,{user:USER,now:NOW}).valid,true);
    const io=fixture(),enabled=await Statistics.collect(options(io,{previous:legacy,includeUserGroups:true}));
    assert.deepEqual(enabled.metrics,prior.metrics);assert.deepEqual(enabled.userGroups,proof());assert.equal(groupCalls(io).length,1);
});

test('coordinator opt-in shares existing history and does not change profile or pageview identity',async()=>{
    const io=fixture();const previous=await Coordinator.update(integrated(io));assert.equal(groupCalls(io).length,0);
    const before=io.calls.length;
    const current=await Coordinator.update(integrated(io,{previous,now:shift(1000),includeUserGroups:true}));
    assert.equal(current.cacheDiscarded,false);assert.deepEqual(current.config,previous.config);
    assert.deepEqual(io.calls.slice(before).map(call=>call.p.usprop),['groups|implicitgroups']);
    assert.equal(Coordinator.validateState(current).valid,true);assert.equal(groupCalls(io).length,1);
    assert.equal(current.statistics.userGroups.user,USER);
    const count=io.calls.length;
    await Coordinator.update(integrated(io,{previous:current,now:shift(2000),includeUserGroups:true}));assert.equal(io.calls.length,count);
});

test('newly enabled groups bypass an unrelated cooldown while group failures honor the cooldown',async()=>{
    const io=fixture(),previous=await Coordinator.update(integrated(io));
    previous.statistics.errors=['Contribuições globais'];
    const current=await Coordinator.update(integrated(io,{previous,now:shift(1000),includeUserGroups:true}));
    assert.equal(groupCalls(io).length,1);assert.ok(current.statistics.userGroups);
    const outage=fixture({groupUser:{userid:0}});
    const failed=await Coordinator.update(integrated(outage,{previous,now:shift(1000),includeUserGroups:true}));
    assert.equal(failed.statistics.userGroups,null);assert.ok(failed.statistics.errors.includes('Estatutos na ptwiki'));
    const recovery=fixture();
    const cooling=await Coordinator.update(integrated(recovery,{previous:failed,now:shift(2000),includeUserGroups:true}));
    assert.equal(recovery.calls.length,0);assert.equal(cooling.statistics.userGroups,null);
    const refreshed=await Coordinator.update(integrated(recovery,{previous:cooling,now:shift(3000),includeUserGroups:true,forceStatistics:true}));
    assert.equal(groupCalls(recovery).length,1);assert.ok(refreshed.statistics.userGroups);assert.equal(refreshed.fresh,true);
});
