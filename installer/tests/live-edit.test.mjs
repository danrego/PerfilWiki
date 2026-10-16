import test from 'node:test';
import assert from 'node:assert/strict';
import {receiveLivePanel,LiveEdit} from '../src/live-edit.mjs';
import {createInitialConfig,profileTitle} from '../src/model.mjs';
import {writePanelSession,readPanelSession,navigatePanelSession} from '../src/panel-session.mjs';
const NONCE='a'.repeat(32),NOW=Date.parse('2026-10-15T14:42:00Z');
function fixture(url=LiveEdit.installerUrl(NONCE)){
  const listeners=new Map(),timers=new Map(),store=new Map(),sent=[];let next=0;
  const host={location:new URL(url),Date:{now:()=>NOW},crypto:{getRandomValues:array=>array.fill(3)},sessionStorage:{setItem:(key,value)=>store.set(key,value),getItem:key=>store.get(key)||null,removeItem:key=>store.delete(key)},history:{replaceState(_state,_unused,value){host.location=new URL(value,host.location);},pushState(_state,_unused,value){host.location=new URL(value,host.location);}},addEventListener:(type,callback)=>listeners.set(type,callback),removeEventListener:type=>listeners.delete(type),setTimeout:callback=>{timers.set(++next,callback);return next;},clearTimeout:id=>timers.delete(id)};
  const source={postMessage:(data,origin)=>sent.push({data,origin})};
  function message(data,{origin=LiveEdit.wikiOrigin,sender=source}={}){listeners.get('message')?.({data,origin,source:sender});}
  return {host,source,message,listeners,timers,store,sent};
}
function config(){const value=createInitialConfig();return {...value,user:'Marina Exemplo',displayName:'Marina Pesquisa',location:'[[Belo Horizonte]]',photo:'Example.jpg',coverImage:'Cover.jpg',customFields:[{label:'Formação',values:['[[UFMG]]','[[USP]]'],layout:'lines',separator:'pipe',placement:'top',labelColor:'#123456',valueColors:['#123456','#654321']}],timeZone:'America/Sao_Paulo',appearance:{...value.appearance,language:'it',photoSize:200,photoShape:'round',topBackground:'#123456',profilePlacements:{...value.appearance.profilePlacements,location:'top-activity'},metrics:['tenure','edits','thanksSent'],highlightedMetrics:['thanksSent']}};}

test('exact origin, source and nonce handoff restores every current choice once without executing text',()=>{
  const f=fixture(),received=[],errors=[],settings=config(),page={title:profileTitle(settings),revisionId:123,content:'{{Texto|x=<script>alert(1)</script>}}\n[[Categoria:Usuários]]'};
  receiveLivePanel({host:f.host,onReceive:value=>received.push(value),onError:value=>errors.push(value)});
  f.message(LiveEdit.signal('hello',NONCE),{origin:'https://evil.test'});
  f.message(LiveEdit.signal('hello','b'.repeat(32)));
  assert.equal(f.sent.length,0);assert.equal(received.length,0);
  f.message(LiveEdit.signal('hello',NONCE));assert.equal(f.sent.length,1);assert.equal(f.sent[0].origin,LiveEdit.wikiOrigin);
  const payload=LiveEdit.envelope(settings,page,NONCE,NOW);
  f.message(payload,{sender:{}});f.message(payload,{origin:'https://evil.test'});assert.equal(received.length,0);
  f.message(payload);assert.deepEqual(received,[{config:settings,liveSource:{origin:LiveEdit.wikiOrigin,user:settings.user,page}}]);
  assert.equal(f.sent[1].data.type,'accepted');assert.equal(f.listeners.has('message'),false);assert.equal(f.timers.size,0);
  f.message(payload);assert.equal(received.length,1);assert.deepEqual(errors,[]);
});

test('malformed settings, oversized bodies, mismatched public page and expired payload fail closed',()=>{
  for(const make of [settings=>({...LiveEdit.envelope(settings,null,NONCE,NOW),createdAt:NOW-60001}),settings=>LiveEdit.envelope({...settings,appearance:{unknown:true}},null,NONCE,NOW),settings=>LiveEdit.envelope(settings,{title:'Usuário:Outra',revisionId:123,content:'private?'},NONCE,NOW),settings=>({...LiveEdit.envelope(settings,null,NONCE,NOW),config:JSON.parse('{"__proto__":{}}')}),settings=>({...LiveEdit.envelope(settings,null,NONCE,NOW),page:{title:profileTitle(settings),revisionId:123,content:'x'.repeat(LiveEdit.limits.bytes)}})]){
    const f=fixture(),received=[],errors=[];receiveLivePanel({host:f.host,onReceive:value=>received.push(value),onError:value=>errors.push(value)});f.message(LiveEdit.signal('hello',NONCE));f.message(make(config()));assert.equal(received.length,0);assert.equal(errors.length,1);assert.equal(f.listeners.has('message'),false);
  }
});

test('production receiver rejects an injected source origin and ordinary visits attach no transport',()=>{
  const hosted=fixture();assert.throws(()=>receiveLivePanel({host:hosted.host,sourceOrigin:'http://127.0.0.1:8791'}));
  const ordinary=fixture('https://danrego.github.io/PerfilWiki/INICIO.html');receiveLivePanel({host:ordinary.host});assert.equal(ordinary.listeners.size,0);assert.equal(ordinary.timers.size,0);
  const local=fixture('http://127.0.0.1:8790/fixture.html?perfilwiki=handoff#perfilwiki-handoff='+NONCE),received=[];
  receiveLivePanel({host:local.host,sourceOrigin:'http://127.0.0.1:8791',onReceive:value=>received.push(value)});
  local.message(LiveEdit.signal('hello',NONCE),{origin:'http://127.0.0.1:8791'});local.message(LiveEdit.envelope(config(),null,NONCE,NOW),{origin:'http://127.0.0.1:8791'});assert.equal(received.length,1);
});

test('timeouts and cleanup remove listeners without API requests or page navigation',()=>{
  const f=fixture(),errors=[];const cleanup=receiveLivePanel({host:f.host,onError:value=>errors.push(value)});[...f.timers.values()][0]();assert.equal(errors.length,1);assert.equal(f.listeners.size,0);assert.equal(f.timers.size,0);cleanup();assert.equal(errors.length,1);
});

test('exact hosted path supports reload with source identity, revision and raw personal text retained',()=>{
  const f=fixture('https://danrego.github.io/PerfilWiki/INICIO.html'),settings=config(),page={title:profileTitle(settings),revisionId:123,content:'== Metas ==\n{{Meta|x=y}}\n[[Categoria:Usuários]]'},liveSource={origin:LiveEdit.wikiOrigin,user:settings.user,page};
  const token=writePanelSession(settings,f.host,null,{liveSource});assert.ok(token);navigatePanelSession('customize',token,f.host);assert.doesNotMatch(f.host.location.href,/Marina|Meta|revision|123456/);
  assert.deepEqual(readPanelSession(f.host).config,settings);assert.deepEqual(readPanelSession(f.host).liveSource,liveSource);
  assert.equal(writePanelSession({...settings,user:'Outra conta'},f.host,token,{liveSource}),null);
  for(const url of ['https://danrego.github.io/other/INICIO.html','https://danrego.github.io/PerfilWiki/evil.html','https://other.github.io/PerfilWiki/INICIO.html','http://danrego.github.io/PerfilWiki/INICIO.html'])assert.equal(writePanelSession(settings,fixture(url).host),null);
});
