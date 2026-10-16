import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialConfig,activationSnippet,profileSnippet} from '../src/model.mjs';
import {writePanelSession,readPanelSession,navigatePanelSession,PANEL_SESSION_LIMITS} from '../src/panel-session.mjs';

function fixture(url='http://127.0.0.1:8788/INICIO.html'){
 const store=new Map(),history=[];let now=Date.parse('2026-10-15T14:42:00Z'),seed=0;
 const host={location:{href:url},Date:{now:()=>now},crypto:{getRandomValues:array=>{array.fill(++seed);return array;}},sessionStorage:{setItem:(key,value)=>store.set(key,value),getItem:key=>store.get(key)||null},history:{pushState(_state,_title,address){history.push({replace:false,address});host.location.href=new URL(address,host.location.href).href;},replaceState(_state,_title,address){history.push({replace:true,address});host.location.href=new URL(address,host.location.href).href;}}};
 return {host,store,history,setNow:value=>{now=value;}};
}
function choices(){const c={...createInitialConfig(),user:'Marina Exemplo',displayName:'Marina Pesquisa',location:'[[Brasília]]',photo:'Marina.jpg',timeZone:'America/New_York',contentSections:[{title:'Metas',content:"* {{Meu progresso}}\r\n* '''Revisar''' [[História]]"}]};c.appearance={...c.appearance,photoSize:160,photoShape:'round',showLocalTime:true,accent:'#246342',theme:'forest',metrics:['edits','tenure','thanks'],highlightedMetrics:['thanks'],profilePlacements:{...c.appearance.profilePlacements,location:'top-cards'}};return c;}

test('one-click panel navigation restores full current choices without including names or personal content in URLs',()=>{
 const f=fixture(),config=choices(),token=writePanelSession(config,f.host);
 assert.match(token,/^[a-f0-9]{32}$/);assert.equal(f.store.size,1);
 assert.equal(navigatePanelSession('panel',token,f.host),true);
 assert.doesNotMatch(f.host.location.href,/Marina|Bras|Meu|progresso|round|246342/);
 const restored=readPanelSession(f.host);assert.equal(restored.mode,'panel');assert.equal(restored.error,'');assert.deepEqual(restored.config,config);
 config.appearance.photoSize=200;config.contentSections[0].content+='\n* Outra meta';
 assert.equal(writePanelSession(config,f.host,token),token);assert.equal(f.store.size,1);
 navigatePanelSession('customize',token,f.host);
 assert.deepEqual(readPanelSession(f.host).config,config);assert.equal(readPanelSession(f.host).mode,'customize');
 assert.equal(f.history.length,2);
});

test('snapshots are per tab, expire and reject invalid or ambiguous handoffs instead of running code',()=>{
 const f=fixture(),token=writePanelSession(choices(),f.host);navigatePanelSession('panel',token,f.host);
 const other=fixture(f.host.location.href);assert.ok(readPanelSession(other.host).error);
 const key=[...f.store.keys()][0],raw=f.store.get(key);
 for(const value of ['window.secret=true','null','[]',JSON.stringify({schema:2,savedAt:0,config:choices()}),JSON.stringify({schema:1,savedAt:Date.parse('2026-10-15T14:42:00Z'),config:{...choices(),appearance:{unknown:true}}}),JSON.stringify({schema:1,savedAt:Date.parse('2026-10-15T14:44:00Z'),config:choices()}),'x'.repeat(PANEL_SESSION_LIMITS.bytes+1)]){f.store.set(key,value);assert.ok(readPanelSession(f.host).error);}
 f.store.set(key,raw);f.setNow(Date.parse('2026-10-15T14:42:00Z')+PANEL_SESSION_LIMITS.lifetimeMs+1);assert.ok(readPanelSession(f.host).error);
 const malformed=fixture('http://127.0.0.1:8788/INICIO.html?perfilwiki=panel&perfilwiki=customize#perfilwiki-session='+token);assert.ok(readPanelSession(malformed.host).error);
 for(const hash of ['#bad','#perfilwiki-session=javascript:alert(1)','#perfilwiki-session=abcd']){const invalid=fixture('http://127.0.0.1:8788/INICIO.html?perfilwiki=panel'+hash);assert.ok(readPanelSession(invalid.host).error);}
});

test('invalid choices, inaccessible storage and unsupported hosts do not navigate or request anything',()=>{
 const f=fixture();assert.equal(writePanelSession({...choices(),user:''},f.host),null);assert.equal(f.store.size,0);
 assert.equal(writePanelSession(choices(),f.host,'invalid'),null);assert.equal(navigatePanelSession('bad','0'.repeat(32),f.host),false);assert.equal(f.history.length,0);
 f.host.sessionStorage.setItem=()=>{throw new Error('Blocked');};assert.equal(writePanelSession(choices(),f.host),null);assert.equal(f.history.length,0);
 for(const url of ['https://pt.wikipedia.org/wiki/Usuário:Marina_Exemplo','https://example.test/','file:///INICIO.html','http://user:secret@localhost/']){const remote=fixture(url);assert.equal(writePanelSession(choices(),remote.host),null);assert.equal(readPanelSession(remote.host),null);assert.equal(navigatePanelSession('panel','0'.repeat(32),remote.host),false);assert.equal(remote.history.length,0);assert.equal(remote.store.size,0);}
 assert.equal(readPanelSession({location:{hostname:'localhost'}}),null);
});

test('history replacement keeps the current token and never opens a new page',()=>{
 const f=fixture('http://localhost:8788/INICIO.html?test=1'),token=writePanelSession(choices(),f.host);
 navigatePanelSession('panel',token,f.host,{replace:true});
 assert.equal(f.history[0].replace,true);assert.match(f.history[0].address,/test=1&perfilwiki=panel/);
 assert.equal(readPanelSession(f.host).token,token);
});

test('local editing sessions and navigation are excluded from the prepared Wikipedia files',()=>{
 for(const snippet of [activationSnippet(choices()),profileSnippet(choices())]){
  assert.doesNotMatch(snippet,/perfilwiki-session=|perfilwiki=panel|sessionStorage|Editar painel|Ver painel/);
 }
});

test('reading an expired or invalid snapshot removes only that app-owned entry',()=>{
 const f=fixture(),token=writePanelSession(choices(),f.host);navigatePanelSession('panel',token,f.host);
 const key=[...f.store.keys()][0],raw=f.store.get(key),removed=[];
 f.store.set('unrelated-storage','keep');
 f.host.sessionStorage.removeItem=entry=>{removed.push(entry);f.store.delete(entry);};
 f.setNow(Date.parse('2026-10-15T14:42:00Z')+PANEL_SESSION_LIMITS.lifetimeMs+1);
 assert.ok(readPanelSession(f.host).error);assert.equal(f.store.has(key),false);
 assert.deepEqual(removed,[key]);assert.equal(f.store.get('unrelated-storage'),'keep');
 f.setNow(Date.parse('2026-10-15T14:42:00Z'));f.store.set(key,raw);
 assert.equal(readPanelSession(f.host).error,'');assert.equal(f.store.get(key),raw);
 f.store.set(key,'not JSON');assert.ok(readPanelSession(f.host).error);assert.equal(f.store.has(key),false);
 f.store.set(key,'not JSON');f.host.sessionStorage.removeItem=()=>{throw new Error('blocked');};
 assert.ok(readPanelSession(f.host).error);
});
