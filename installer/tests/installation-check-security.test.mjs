import test from 'node:test';
import assert from 'node:assert/strict';
import {checkInstallation} from '../src/installation-check.mjs';
import {createInitialConfig,RELEASE_VERSION,PROGRAM_PAGE,STYLES_PAGE} from '../src/model.mjs';
const baseUrl='http://127.0.0.1:8788/INICIO.html';
const config=()=>({...createInitialConfig(),user:'Security Example',timeZone:'UTC'});
const release=()=>({version:RELEASE_VERSION,files:[{destination:PROGRAM_PAGE,text:'synthetic source'},{destination:STYLES_PAGE,text:'synthetic styles'}]});
const pages=()=>({batchcomplete:true,query:{pages:[]}});
const response=(data,extra={})=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(data),...extra});
const stream=(bytes,width=3)=>{let at=0,cancelled=0,released=0;return {get cancelled(){return cancelled;},get released(){return released;},getReader:()=>({read:async()=>at>=bytes.length?{done:true}:{done:false,value:bytes.slice(at,at+=width)},cancel:async()=>{cancelled++;},releaseLock:()=>{released++;}})};};

test('manual verification uses exactly two sequential anonymous no-referrer GETs and one Action API request for four titles',async()=>{
 const calls=[],controller=new AbortController();let finishManifest,manifestRead=false;
 const fetcher=async(url,options)=>{calls.push({url,options});if(calls.length===1)return response(null,{url,text:()=>new Promise(resolve=>finishManifest=()=>{manifestRead=true;resolve(JSON.stringify(release()));})});assert.equal(manifestRead,true);return response(pages(),{url});};
 const task=checkInstallation(config(),{baseUrl,fetcher,signal:controller.signal});await new Promise(resolve=>setImmediate(resolve));assert.equal(calls.length,1);finishManifest();const result=await task;
 assert.equal(calls.length,2);assert.equal(calls[0].url,'http://127.0.0.1:8788/release-files.json');
 const url=new URL(calls[1].url);assert.equal(url.origin,'https://pt.wikipedia.org');assert.equal(url.pathname,'/w/api.php');assert.equal(url.searchParams.get('action'),'query');assert.equal(url.searchParams.get('titles').split('|').length,4);
 for(const {options} of calls){assert.equal(options.method,'GET');assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');assert.equal(options.signal,controller.signal);assert.equal(options.body,undefined);}
 assert.equal(result.complete,false);assert.ok(result.results.every(row=>row.status==='unknown'));
});
test('redirected, opaque, changed-origin and malformed final URLs are rejected and their unread bodies are cancelled in either stage',async()=>{
 for(const stage of [0,1])for(const extra of [{redirected:true},{type:'opaque'},{type:'opaqueredirect'},{url:'https://outside.invalid/final'},{url:'not a valid URL'}]){
  let calls=0,cancelled=0,invalidRead=false;
  const fetcher=async url=>calls++===stage?response({}, {url,...extra,body:{cancel:async()=>{cancelled++;}},text:async()=>{invalidRead=true;return '{}';}}):response(release(),{url});
  await assert.rejects(checkInstallation(config(),{baseUrl,fetcher}),/indisponível/);assert.equal(calls,stage+1);assert.equal(cancelled,1);assert.equal(invalidRead,false);
 }
});
test('Content-Length rejects an oversized checker response before reading and cancels its body',async()=>{
 let read=false,cancelled=0,calls=0;
 await assert.rejects(checkInstallation(config(),{baseUrl,fetcher:async url=>{calls++;return response({}, {url,headers:{get:()=>String(8*1024*1024+1)},body:{cancel:async()=>{cancelled++;}},text:async()=>{read=true;return '{}';}});}}),/limite/);
 assert.equal(read,false);assert.equal(cancelled,1);assert.equal(calls,1);
});
test('streamed checker responses stop at the eight-MiB byte boundary, cancel and release the reader without a second request',async()=>{
 let read=0,cancelled=0,released=0,calls=0;const chunks=[new Uint8Array(4194304),new Uint8Array(4194304),new Uint8Array(1)];
 const body={getReader:()=>({read:async()=>read<chunks.length?{done:false,value:chunks[read++]}:{done:true},cancel:async()=>{cancelled++;},releaseLock:()=>{released++;}})};
 await assert.rejects(checkInstallation(config(),{baseUrl,fetcher:async url=>{calls++;return response(null,{url,body});}}),/limite/);
 assert.equal(read,3);assert.equal(cancelled,1);assert.equal(released,1);assert.equal(calls,1);
});
test('the nonstreaming test-adapter fallback counts UTF-8 bytes instead of accepting a shorter multibyte character count',async()=>{
 let calls=0;const data={...release(),note:'字'.repeat(2800000)};
 await assert.rejects(checkInstallation(config(),{baseUrl,fetcher:async url=>{calls++;return response(data,{url});}}),/limite/);assert.equal(calls,1);
});
test('streamed JSON decodes split UTF-8 code points while preserving the two-read public check',async()=>{
 const first=stream(new TextEncoder().encode(JSON.stringify({...release(),note:'coração 中文'})),1),second=stream(new TextEncoder().encode(JSON.stringify(pages())),2);let calls=0;
 const result=await checkInstallation(config(),{baseUrl,fetcher:async url=>response(null,{url,body:calls++===0?first:second})});
 assert.equal(calls,2);assert.equal(result.complete,false);assert.equal(first.released,1);assert.equal(second.released,1);assert.equal(first.cancelled,0);
});
test('an aborted manual check dispatches nothing, and cancellation during streaming discards the body and never reads Wiki pages',async()=>{
 const before=new AbortController();before.abort();let calls=0;
 await assert.rejects(checkInstallation(config(),{baseUrl,signal:before.signal,fetcher:async()=>{calls++;return response(release());}}));assert.equal(calls,0);
 const during=new AbortController();let cancelled=0,released=0;
 const body={getReader:()=>({read:async()=>{during.abort();return {done:false,value:new Uint8Array([123])};},cancel:async()=>{cancelled++;},releaseLock:()=>{released++;}})};
 await assert.rejects(checkInstallation(config(),{baseUrl,signal:during.signal,fetcher:async url=>{calls++;return response(null,{url,body});}}));assert.equal(calls,1);assert.equal(cancelled,1);assert.equal(released,1);
});
