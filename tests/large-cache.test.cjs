'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/LargeCache.js'),'utf8');
const KEY = 'perfilwiki-v1-Editora%20Exemplo-America%2FSao_Paulo-cache';
const NOW = Date.parse('2026-10-15T18:00:00.000Z');
const NEW = '2026-10-15T17:00:00.000Z';
const OLD = '2026-10-15T16:00:00.000Z';
const event = () => ({preventDefault(){}});

/** An asynchronous, serialized transaction model, without a browser or network. */
function databaseFixture(options = {}) {
    const state = {records:new Map(),created:false,opens:[],modes:[],closed:0,aborts:0,queue:[],active:false};
    function startNext() {
        if (state.active || !state.queue.length) return;
        state.active = true;state.queue.shift()();
    }
    function connection() {
        let closed = false;
        const db = {
            objectStoreNames:{contains:name=>state.created && name === 'snapshots'},
            createObjectStore(name, settings) { assert.equal(name,'snapshots');assert.equal(settings.keyPath,'key');state.created=true; },
            close(){if (!closed) {closed=true;state.closed+=1;}},
            transaction(name,mode) {
                assert.equal(closed,false);assert.equal(name,'snapshots');state.modes.push(mode);
                if (options.transactionError) throw new Error('Synthetic transaction failure');
                const jobs=[];let finished=false,started=false;
                const tx={objectStore:()=>store,abort(){if(finished)throw new Error('Inactive transaction');state.aborts+=1;end('abort');}};
                function end(kind) {
                    if(finished)return;finished=true;
                    if(kind==='abort')tx.onabort?.(event());else if(kind==='error')tx.onerror?.(event());else tx.oncomplete?.(event());
                    state.active=false;setImmediate(startNext);
                }
                function pump() {
                    if(finished)return;
                    const job=jobs.shift();
                    if(job){job();if(!finished)setImmediate(pump);}else end('complete');
                }
                function request(kind,key,value) {
                    const result={};
                    jobs.push(()=>{
                        if(options[kind+'Error']){result.onerror?.(event());end('error');return;}
                        if(kind==='get')result.result=structuredClone(state.records.get(key));
                        else {assert.equal(mode,'readwrite');state.records.set(value.key,structuredClone(value));result.result=value.key;}
                        result.onsuccess?.(event());
                    });
                    return result;
                }
                const store={get:key=>request('get',key),put:value=>request('put',value.key,value)};
                state.queue.push(()=>{started=true;if(options.stallTransaction)return;setImmediate(pump);});
                setImmediate(startNext);
                return tx;
            }
        };
        return db;
    }
    const indexedDB={open(name,version){
        assert.equal(name,'perfilwiki-large-cache-v1');assert.equal(version,1);
        if(options.openThrows)throw new Error('Synthetic blocked storage');
        const request={};state.opens.push(request);
        setImmediate(()=>{
            if(options.blocked){request.onblocked?.(event());return;}
            if(options.stallOpen)return;
            if(options.openError){request.onerror?.(event());return;}
            request.result=connection();request.transaction={abort(){state.aborts+=1;}};
            if(!state.created)request.onupgradeneeded?.(event());
            request.onsuccess?.(event());
        });
        return request;
    }};
    return {state,indexedDB,connection};
}

function api(fixture = databaseFixture(), overrides = {}) {
    const host={indexedDB:fixture.indexedDB,Date:{now:()=>NOW},setTimeout,clearTimeout,...overrides};
    vm.runInNewContext(source,{window:host,Date,Promise,Object,Array,Number});
    return {cache:host.PerfilWikiLargeCache,host,...fixture};
}
function record(packed='{"value":1}',capturedAt=NEW, key=KEY) { return {schema:1,key,packed,capturedAt}; }

test('fallback stores and returns the exact Unicode-packed value without touching unrelated keys',async()=>{
    const f=api(),packed='{"nome":"Edição de História 🧩","valor":18}';
    assert.equal(await f.cache.get(KEY),null);
    assert.equal(await f.cache.put(KEY,packed,NEW),true);
    assert.equal(await f.cache.get(KEY),packed);
    assert.equal(f.state.records.size,1);
    assert.deepEqual(f.state.modes,['readonly','readwrite','readonly']);
    assert.equal(f.state.closed,f.state.opens.length,'Every successful connection is closed');
});

test('a 2.8-million-character packed value exceeds a five-MiB UTF-16 store and still round-trips unchanged',async()=>{
    const f=api(),packed='á'.repeat(2800000);
    assert.ok(packed.length*2>5*1024*1024);
    assert.equal(await f.cache.put(KEY,packed,NEW),true);
    assert.equal(await f.cache.get(KEY),packed);
    assert.equal(f.state.records.get(KEY).packed.length,2800000);
});

test('key, packed-character and chronological bounds reject input before opening IndexedDB',async()=>{
    const f=api();
    for(const key of [null,'cache','perfilwiki-v1--cache','perfilwiki-v1-user-UTC-proxima-consulta','other-v1-user-UTC-cache',KEY+'\n','perfilwiki-v1-'+ 'x'.repeat(4096)+'-UTC-cache']) {
        assert.equal(await f.cache.get(key),null);assert.equal(await f.cache.put(key,'{}',NEW),false);
    }
    for(const packed of [null,{},'', 'x'.repeat(4000001)])assert.equal(await f.cache.put(KEY,packed,NEW),false);
    for(const stamp of [null,NEW+'x','2008-02-30T00:00:00Z','2026-10-15T18:00:00.001Z',NOW])assert.equal(await f.cache.put(KEY,'{}',stamp),false);
    assert.equal(f.state.opens.length,0);
    assert.equal(await f.cache.put(KEY,'x'.repeat(4000000),NEW),true);
});

test('read rejects malformed, foreign, oversized or future records instead of returning unvalidated storage',async()=>{
    const f=api();
    for(const bad of [null,{},[],record('',NEW),record('x'.repeat(4000001)),record('{}','2027-01-01T00:00:00Z'),
        record('{}','2008-02-30T00:00:00Z'),record('{}',NEW,KEY+'other'),{...record(),schema:2},{...record(),extra:true}]) {
        f.state.records.set(KEY,bad);assert.equal(await f.cache.get(KEY),null);
    }
    f.state.records.set(KEY,record());assert.equal(await f.cache.get(KEY),'{"value":1}');
    assert.equal(f.state.closed,f.state.opens.length);
});

test('atomic readwrite transactions reject older snapshots even when two tabs write concurrently',async()=>{
    const fixture=databaseFixture(),first=api(fixture),second=api(fixture);
    assert.equal(await first.cache.put(KEY,'initial',OLD),true);
    const results=await Promise.all([first.cache.put(KEY,'newer',NEW),second.cache.put(KEY,'older',OLD)]);
    assert.deepEqual(results,[true,false]);assert.equal(await second.cache.get(KEY),'newer');
    assert.equal(await second.cache.put(KEY,'same-anchor-progress',NEW),true);
    assert.equal(await first.cache.get(KEY),'same-anchor-progress');
    assert.ok(fixture.state.modes.filter(mode=>mode==='readwrite').length>=4);
});

test('unavailable, denied, blocked and failed storage returns a safe miss without rejecting promises',async()=>{
    assert.equal(await api(undefined,{indexedDB:undefined}).cache.get(KEY),null);
    for(const options of [{openThrows:true},{openError:true},{blocked:true},{transactionError:true},{getError:true},{putError:true}]) {
        const f=api(databaseFixture(options));
        assert.equal(await f.cache.put(KEY,'{}',NEW),false);
        assert.equal(await f.cache.get(KEY),null);
        if(!options.openThrows&&!options.openError&&!options.blocked)assert.equal(f.state.closed,f.state.opens.length);
    }
});

test('the overall 1500-ms timeout aborts active work and a late blocked open closes immediately',async()=>{
    for(const options of [{stallOpen:true},{stallTransaction:true}]) {
        const timers=new Map();let timerId=0;
        const f=api(databaseFixture(options),{setTimeout(fn,delay){assert.equal(delay,1500);timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);}});
        const result=f.cache.put(KEY,'{}',NEW);await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve));
        [...timers.values()][0]();assert.equal(await result,false);assert.equal(timers.size,0);
        if(options.stallTransaction){assert.equal(f.state.aborts,1);assert.equal(f.state.closed,1);}
        else {const request=f.state.opens[0];request.result=f.connection();request.onsuccess();assert.equal(f.state.closed,1);}
    }
    const f=api(databaseFixture({blocked:true}));assert.equal(await f.cache.get(KEY),null);
    const request=f.state.opens[0];request.result=f.connection();request.onsuccess();assert.equal(f.state.closed,1);
    const late=api(databaseFixture({blocked:true}));assert.equal(await late.cache.get(KEY),null);
    const lateRequest=late.state.opens[0];lateRequest.result=late.connection();lateRequest.transaction={abort(){late.state.aborts+=1;}};
    lateRequest.onupgradeneeded();assert.equal(late.state.aborts,1);assert.equal(late.state.closed,1);
});
