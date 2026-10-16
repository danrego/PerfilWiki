'use strict';
// Offline Web Locks fixture with independent named queues and cancellation only
// while waiting. The production fetch/body callback controls an acquired lock.
function createLockManager() {
    const queues=new Map(),active=new Set();
    function pump(name) {
        if(active.has(name))return;
        const queue=queues.get(name)||[],entry=queue.shift();
        if(!entry)return;
        entry.signal?.removeEventListener('abort',entry.abort);
        if(entry.signal?.aborted){entry.reject(new Error('Lock aborted'));pump(name);return;}
        active.add(name);
        Promise.resolve().then(()=>entry.callback({name,mode:'exclusive'})).then(entry.resolve,entry.reject).finally(()=>{active.delete(name);pump(name);});
    }
    return {request(name,options,callback) {
        if(options?.signal?.aborted)return Promise.reject(new Error('Lock aborted'));
        if(options?.ifAvailable&&active.has(name))return Promise.resolve().then(()=>callback(null));
        return new Promise((resolve,reject)=>{
            const queue=queues.get(name)||[],entry={callback,resolve,reject,signal:options?.signal};queues.set(name,queue);
            entry.abort=()=>{const index=queue.indexOf(entry);if(index>=0){queue.splice(index,1);reject(new Error('Lock aborted'));}};
            entry.signal?.addEventListener('abort',entry.abort,{once:true});queue.push(entry);pump(name);
        });
    }};
}
module.exports={createLockManager};
