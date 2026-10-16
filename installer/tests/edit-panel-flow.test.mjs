import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInitialConfig,profileSnippet,profileTitle } from '../src/model.mjs';
import LiveEdit from '../../src/LiveEdit.js';
import { writePanelSession, navigatePanelSession, readPanelSession } from '../src/panel-session.mjs';

const localRequire = createRequire(new URL('../package.json', import.meta.url));
const esbuild = createRequire(localRequire.resolve('vite/package.json'))('esbuild');
const bundle = await esbuild.build({entryPoints:[new URL('../src/App.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
const plain = value => JSON.parse(JSON.stringify(value));

function host() {
  const storage = new Map(), listeners = new Map(), navigations = [];
  const window = {
    location: new URL('http://127.0.0.1:8788/INICIO.html'),
    sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
    crypto:{getRandomValues:bytes=>bytes.fill(17)}, matchMedia:()=>({matches:true}), scrollTo(){},
    addEventListener:(type,listener)=>listeners.set(type,listener),removeEventListener:type=>listeners.delete(type),
    history:{pushState(_state,_unused,url){navigations.push(url);window.location=new URL(url,window.location);},replaceState(_state,_unused,url){window.location=new URL(url,window.location);}},
  };
  return {window,storage,navigations,listeners};
}

/** Execute the actual App handlers with synchronous hooks, without mounting an iframe. */
function appHarness(environment=host(),Clock=Date) {
  const hooks=[], effects=[],downloads=[]; let cursor=0;
  class DownloadURL extends URL {static createObjectURL(blob){downloads.push(blob);return 'blob:synthetic-download';}static revokeObjectURL(){}}
  const hooksReact = {...React,
    // Direct hook harnesses retain the provider's default pt-BR context.
    useContext:context=>context._currentValue,
    useState(initial){const index=cursor++;if(!(index in hooks))hooks[index]=typeof initial==='function'?initial():initial;return [hooks[index],next=>{hooks[index]=typeof next==='function'?next(hooks[index]):next;}];},
    useRef(value){const index=cursor++;return hooks[index]??(hooks[index]={current:value});},
    useMemo(make,dependencies){const index=cursor++,old=hooks[index];if(!old||dependencies.some((value,i)=>!Object.is(value,old.dependencies[i])))hooks[index]={dependencies,value:make()};return hooks[index].value;},
    useEffect(effect,dependencies){const index=cursor++,old=hooks[index];if(!old||dependencies.some((value,i)=>!Object.is(value,old.dependencies[i])))effects.push(()=>{old?.cleanup?.();hooks[index]={dependencies,cleanup:effect()};});},
  };
  const module={exports:{}};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:name=>name==='react'?hooksReact:localRequire(name),window:environment.window,document:{documentElement:{lang:'pt-BR'},title:'',querySelectorAll:()=>[],getElementById:()=>null,createElement:()=>({click(){}})},requestAnimationFrame:callback=>callback(),console,Intl,Date:Clock,URL:DownloadURL,Blob,TextEncoder,Uint8Array,Set,Map});
  function render(){cursor=0;const tree=module.exports.App();while(effects.length)effects.shift()();return tree;}
  return {...environment,render,downloads};
}

function elements(value){return Array.isArray(value)?value.flatMap(elements):React.isValidElement(value)?[value,...elements(value.props.children)]:[];}
function text(value){return Array.isArray(value)?value.map(text).join(''):React.isValidElement(value)?text(value.props.children):value??'';}
function button(tree,label){const node=elements(tree).find(node=>node.type==='button'&&text(node.props.children)===label);assert.ok(node,label);return node;}
function preview(tree){const node=elements(tree).find(node=>typeof node.type==='function'&&node.type.name==='ProfilePreview');assert.ok(node,'real preview component');return node;}
function sample(){const config=createInitialConfig();return {...config,user:'Marina Exemplo',displayName:'Marina Pesquisa',location:'[[Rio de Janeiro]]',photo:'Example.jpg',timeZone:'America/New_York',customFields:[{label:'Alma mater',values:['[[GWU]]','[[MIT]]'],layout:'lines',separator:'pipe',placement:'top'}],contentSections:[{title:'Minhas metas',content:'* {{Meta}}\n* [[História]]'}],appearance:{...config.appearance,photoSize:160,photoShape:'round',photoAlignment:'right',accent:'#772244',theme:'custom',metrics:[...config.appearance.metrics].reverse(),initialPeriod:'90d'}};}

function handedApp(raw){
  const env=host(),nonce='a'.repeat(32),settings=sample(),messages=[],timers=new Map();let next=0;
  env.window.location=new URL(LiveEdit.installerUrl(nonce));
  env.window.setTimeout=callback=>{timers.set(++next,callback);return next;};env.window.clearTimeout=id=>timers.delete(id);
  const app=appHarness(env);app.render();
  const source={postMessage:(data,origin)=>messages.push({data,origin})},send=data=>env.listeners.get('message')?.({data,origin:LiveEdit.wikiOrigin,source});
  send(LiveEdit.signal('hello',nonce));send(LiveEdit.envelope(settings,{title:profileTitle(settings),revisionId:123,content:raw},nonce,Date.now()));
  return {app,settings,messages};
}

test('actual hosted App receives current settings without imports and reloads their public source identity',()=>{
  const raw='{{Sobre mim}}\n<div id="dan-pu-ritmo">Painel legado</div>\n[[Categoria:Wikipedistas]]',f=handedApp(raw);let tree=f.app.render();
  assert.deepEqual(plain(preview(tree).props.config),plain(f.settings));
  assert.equal(elements(tree).some(node=>node.props.id==='username'),false);
  assert.equal(elements(tree).find(node=>node.props.id==='detected-wiki-account').props.children,'Marina Exemplo');
  assert.doesNotMatch(text(tree),/· teste local/);assert.equal(f.messages.at(-1).data.type,'accepted');
  const saved=readPanelSession(f.app.window);assert.equal(saved.liveSource.page.content,raw);assert.equal(saved.liveSource.page.revisionId,123);
  assert.doesNotMatch(f.app.window.location.href,/Marina|Categoria|GWU|MIT/);
  const reloaded=appHarness({...f.app,window:f.app.window}).render();assert.equal(elements(reloaded).find(node=>node.props.id==='detected-wiki-account').props.children,'Marina Exemplo');
});

test('hosted legacy draft refuses replacement and exposes the new block for manual insertion without erasing text',()=>{
  const raw='{{Sobre mim}}\n<div id="dan-pu-ritmo">Painel legado</div>\n[[Categoria:Wikipedistas]]',f=handedApp(raw);let tree=f.app.render();
  button(tree,'Preparar instalação').props.onClick();tree=f.app.render();elements(tree).find(node=>node.props['data-testid']==='editor-profile').props.onClick();tree=f.app.render();
  assert.equal(elements(tree).find(node=>node.props.id==='local-draft').props.value,raw);
  button(tree,'Atualizar somente o bloco do painel').props.onClick();tree=f.app.render();
  assert.equal(elements(tree).find(node=>node.props.id==='local-draft').props.value,raw);
  assert.match(text(elements(tree).find(node=>node.props.role==='alert')),/manualmente/);
  assert.match(elements(tree).find(node=>node.props['aria-label']==='Novo bloco do painel para inserção manual').props.value,/PERFILWIKI-PROFILE-BEGIN/);
  assert.match(text(tree),/Novos blocos de texto precisam ser acrescentados manualmente fora do painel/);
});

test('hosted customization replaces only the managed profile while retaining personal sections and categories exactly',()=>{
  const old=sample(),before='{{Cabeçalho pessoal}}\r\n',after='\n== Metas antigas ==\n{{Meta|x=y}}\n[[Categoria:Wikipedistas]]',raw=before+profileSnippet(old)+after,f=handedApp(raw);let tree=f.app.render();
  elements(tree).find(node=>node.props.id==='display-name').props.onChange({target:{value:'Marina Atualizada'}});tree=f.app.render();
  button(tree,'Preparar instalação').props.onClick();tree=f.app.render();elements(tree).find(node=>node.props['data-testid']==='editor-profile').props.onClick();tree=f.app.render();
  button(tree,'Atualizar somente o bloco do painel').props.onClick();tree=f.app.render();
  const updated=elements(tree).find(node=>node.props.id==='local-draft').props.value,expected=LiveEdit.replaceProfile(raw,profileSnippet({...old,displayName:'Marina Atualizada'}));
  assert.equal(updated,expected);assert.ok(updated.startsWith(before));assert.ok(updated.endsWith(after));assert.match(updated,/PERFILWIKI-CONTENT-BEGIN/);
  button(tree,'Salvar rascunho local').props.onClick();tree=f.app.render();assert.equal(elements(tree).some(node=>node.type==='dialog'),false);
});

test('live profile copy and download deliver the retained full page, never a replacement starter',async()=>{
  const original=sample(),prefix='== Projetos ==\n{{Meta|x=y}}\n',suffix='\n[[Categoria:Preservada]]',raw=prefix+profileSnippet(original)+suffix,f=handedApp(raw);let tree=f.app.render();
  elements(tree).find(node=>node.props.id==='display-name').props.onChange({target:{value:'Marina Atualizada'}});tree=f.app.render();button(tree,'Preparar instalação').props.onClick();tree=f.app.render();
  const expected=LiveEdit.replaceProfile(raw,profileSnippet({...original,displayName:'Marina Atualizada'}));
  assert.equal(elements(tree).find(node=>node.props.id==='snippet-profile').props.value,expected);
  await button(tree,'Copiar página preservada').props.onClick();tree=f.app.render();assert.equal(elements(tree).find(node=>node.props.id==='snippet-profile').props.value,expected);
  button(tree,'Baixar página preservada').props.onClick();assert.equal(await f.app.downloads.at(-1).text(),expected);
  assert.ok(expected.startsWith(prefix));assert.ok(expected.endsWith(suffix));
});

test('a saved local page draft survives later appearance changes with outside notes and new settings retained',async()=>{
  const original=sample(),raw='{{Cabeçalho}}\n'+profileSnippet(original)+'\n[[Categoria:Preservada]]',f=handedApp(raw);let tree=f.app.render();button(tree,'Preparar instalação').props.onClick();tree=f.app.render();elements(tree).find(node=>node.props['data-testid']==='editor-profile').props.onClick();tree=f.app.render();button(tree,'Atualizar somente o bloco do painel').props.onClick();tree=f.app.render();
  const edited=elements(tree).find(node=>node.props.id==='local-draft').props.value+'\n== Nota adicionada no rascunho ==\nTexto escolhido manualmente.';
  elements(tree).find(node=>node.props.id==='local-draft').props.onChange({target:{value:edited}});tree=f.app.render();button(tree,'Salvar rascunho local').props.onClick();tree=f.app.render();
  assert.equal(elements(tree).find(node=>node.props.id==='snippet-profile').props.value,edited);button(tree,'Baixar página preservada').props.onClick();assert.equal(await f.app.downloads.at(-1).text(),edited);
  button(tree,'Ajustar a aparência').props.onClick();tree=f.app.render();elements(tree).find(node=>node.props.id==='display-name').props.onChange({target:{value:'Nova aparência'}});tree=f.app.render();button(tree,'Preparar instalação').props.onClick();tree=f.app.render();
  const prepared=elements(tree).find(node=>node.props.id==='snippet-profile').props.value;assert.equal(prepared,LiveEdit.replaceProfile(edited,profileSnippet({...original,displayName:'Nova aparência'})));assert.match(prepared,/Nota adicionada no rascunho/);assert.match(prepared,/Nova aparência/);button(tree,'Baixar página preservada').props.onClick();assert.equal(await f.app.downloads.at(-1).text(),prepared);
});

test('legacy live delivery is prominently fragment-only until the user manually prepares a complete draft',async()=>{
  const raw='{{Metas pessoais}}\n<div id="dan-pu-ritmo">Legado</div>\n[[Categoria:Preservada]]',f=handedApp(raw);let tree=f.app.render();button(tree,'Preparar instalação').props.onClick();tree=f.app.render();
  assert.match(text(tree),/Não substitua sua página inteira por ele/);assert.match(text(tree),/substituir o painel manualmente/);
  const fragment=elements(tree).find(node=>node.props.id==='snippet-profile').props.value;assert.doesNotMatch(fragment,/Metas pessoais|Categoria:Preservada/);
  await button(tree,'Copiar somente o novo bloco').props.onClick();tree=f.app.render();button(tree,'Baixar somente o novo bloco').props.onClick();assert.equal(await f.app.downloads.at(-1).text(),fragment);
  button(tree,'Revisar página completa antes de copiar').props.onClick();tree=f.app.render();assert.equal(elements(tree).find(node=>node.props.id==='local-draft').props.value,raw);
  const manuallyEdited=raw.replace('<div id="dan-pu-ritmo">Legado</div>',fragment);elements(tree).find(node=>node.props.id==='local-draft').props.onChange({target:{value:manuallyEdited}});tree=f.app.render();button(tree,'Salvar rascunho local').props.onClick();tree=f.app.render();assert.equal(elements(tree).find(node=>node.props.id==='snippet-profile').props.value,manuallyEdited);assert.ok(button(tree,'Copiar página preservada'));
});

test('Ver painel and Editar painel preserve current complete settings without an import or download',()=>{
  const app=appHarness();let tree=app.render();
  const account=elements(tree).find(node=>node.props.id==='username');
  account.props.onChange({target:{value:'Marina Exemplo'}});tree=app.render();
  const current=plain(preview(tree).props.config);
  button(tree,'Ver painel').props.onClick();tree=app.render();
  const panel=preview(tree);
  assert.deepEqual(plain(panel.props.config),current);
  assert.equal(typeof panel.props.onEditPanel,'function');
  for(const key of ['onMoveMetric','onToggleMetric','onToggleHighlight','onEditSection'])assert.equal(panel.props[key],undefined,key);
  assert.match(app.window.location.search,/perfilwiki=panel/);
  assert.doesNotMatch(app.window.location.href,/Marina|accent|config|json/i);
  assert.equal(elements(tree).some(node=>node.type==='dialog'),false);
  panel.props.onPeriodChange('12m');tree=app.render();
  preview(tree).props.onEditPanel();tree=app.render();
  assert.equal(elements(tree).find(node=>node.type==='h1').props.children,'Personalize seu painel');
  assert.deepEqual(plain(preview(tree).props.config),{...current,appearance:{...current.appearance,initialPeriod:'12m'}});
  assert.match(app.window.location.search,/perfilwiki=customize/);
  assert.equal(elements(tree).some(node=>node.type==='dialog'),false);
});

test('reloading a saved local panel reopens all settings and preserves raw personal wiki text',()=>{
  const env=host(),config=sample(),token=writePanelSession(config,env.window);
  assert.ok(token);assert.equal(navigatePanelSession('panel',token,env.window),true);
  const app=appHarness(env);let tree=app.render();
  assert.deepEqual(plain(preview(tree).props.config),plain(config));
  preview(tree).props.onEditPanel();tree=app.render();
  const restored=plain(preview(tree).props.config);
  assert.deepEqual(restored,plain(config));assert.equal(restored.contentSections[0].content,config.contentSections[0].content);
  assert.equal(elements(tree).find(node=>node.props.id==='photo-size').props.value,160);
  assert.equal(elements(tree).find(node=>node.props.id==='photo-shape').props.value,'round');
  assert.equal(elements(tree).find(node=>node.props['aria-label']==='Código hexadecimal da cor').props.value,'#772244');
  button(tree,'Preparar instalação').props.onClick();tree=app.render();
  assert.equal(elements(tree).find(node=>node.type==='h1').props.children,'Instale seu PerfilWiki');
  button(tree,'Ver painel').props.onClick();tree=app.render();
  assert.deepEqual(plain(preview(tree).props.config),plain(config));
});

test('missing or expired local settings show an explanation and never load unvalidated data',()=>{
  const env=host();env.window.location=new URL('http://127.0.0.1:8788/INICIO.html?perfilwiki=panel#perfilwiki-session='+ 'a'.repeat(32));
  const app=appHarness(env),tree=app.render();
  assert.equal(preview(tree).props.config.user,'');
  assert.equal(preview(tree).props.onEditPanel,undefined);
  assert.match(text(elements(tree).find(node=>node.props.role==='status')),/Não foi possível recuperar/);
  button(tree,'Ver painel').props.onClick();
  assert.equal(preview(app.render()).props.onEditPanel,undefined);
});

test('blocked tab storage keeps the current in-memory panel editable and explains the reload limitation',()=>{
  const env=host();env.window.sessionStorage.setItem=()=>{throw new Error('storage blocked');};
  const app=appHarness(env);let tree=app.render();
  elements(tree).find(node=>node.props.id==='username').props.onChange({target:{value:'Marina Exemplo'}});tree=app.render();
  button(tree,'Ver painel').props.onClick();tree=app.render();
  assert.equal(preview(tree).props.config.user,'Marina Exemplo');
  assert.equal(typeof preview(tree).props.onEditPanel,'function');
  assert.match(text(elements(tree).find(node=>node.props.role==='status')),/Não foi possível guardar/);
  assert.equal(env.navigations.length,0);
  preview(tree).props.onEditPanel();tree=app.render();
  assert.equal(preview(tree).props.config.user,'Marina Exemplo');
  assert.equal(elements(tree).find(node=>node.type==='h1').props.children,'Personalize seu painel');
});

test('browser history restores current same-tab settings without dropping edits on ordinary customization URLs',()=>{
  const env=host(),config=sample(),token=writePanelSession(config,env.window);navigatePanelSession('panel',token,env.window);
  const app=appHarness(env);let tree=app.render();preview(tree).props.onEditPanel();tree=app.render();
  elements(tree).find(node=>node.props.id==='display-name').props.onChange({target:{value:'Marina Editora'}});tree=app.render();
  assert.equal(readPanelSession(env.window).config.displayName,'Marina Editora');
  env.window.location=new URL('http://127.0.0.1:8788/INICIO.html');env.listeners.get('popstate')();tree=app.render();
  assert.equal(preview(tree).props.config.displayName,'Marina Editora');
  navigatePanelSession('panel',token,env.window);env.listeners.get('popstate')();tree=app.render();
  assert.equal(preview(tree).props.config.displayName,'Marina Editora');assert.equal(typeof preview(tree).props.onEditPanel,'function');
});

test('browser Back cannot replace an unfinished current field with the last valid saved value',()=>{
  const env=host(),config=sample(),token=writePanelSession(config,env.window);navigatePanelSession('panel',token,env.window);
  const app=appHarness(env);let tree=app.render();preview(tree).props.onEditPanel();tree=app.render();
  elements(tree).find(node=>node.props.id==='username').props.onChange({target:{value:''}});tree=app.render();
  assert.equal(readPanelSession(env.window).config.user,'Marina Exemplo');
  navigatePanelSession('panel',token,env.window);env.listeners.get('popstate')();tree=app.render();
  assert.equal(preview(tree).props.config.user,'');
  assert.equal(preview(tree).props.onEditPanel,undefined);
  assert.match(text(elements(tree).find(node=>node.props.role==='status')),/alterações foram mantidas/);
  assert.match(env.window.location.search,/perfilwiki=customize/);
});

test('the preview Editar painel control exists only when explicitly supplied a callback',()=>{
  const app=appHarness(),tree=app.render(),Preview=preview(tree).type;
  // Use the real renderer hooks for server markup, rather than the App handler harness.
  const previewBundle=esbuild.buildSync({entryPoints:[new URL('../src/DashboardPreview.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
  const module={exports:{}};
  vm.runInNewContext(previewBundle.outputFiles[0].text,{module,exports:module.exports,require:localRequire,window:{location:{hostname:'localhost'}},console,Intl,Date,URL,Set,Map});
  const ordinary=renderToStaticMarkup(React.createElement(module.exports.ProfilePreview,{config:sample()}));
  const editable=renderToStaticMarkup(React.createElement(module.exports.ProfilePreview,{config:sample(),onEditPanel:()=>{}}));
  assert.equal(typeof Preview,'function');
  assert.doesNotMatch(ordinary,/Editar painel/);assert.match(editable,/<button type="button" class="secondary local-panel-edit">Editar painel<\/button>/);
  assert.doesNotMatch(editable,/preview-box-toolbar|Editar seção/);
});

test('account is the single mandatory field with an accessible native requirement',()=>{
  const app=appHarness(),nodes=elements(app.render()),account=nodes.find(node=>node.props.id==='username');
  assert.equal(account.props.required,true);assert.equal(account.props['aria-required'],'true');assert.equal(account.props['aria-label'],'Conta da Wikipédia');
  assert.equal(nodes.filter(node=>node.props.required===true).length,1);
  assert.equal(nodes.filter(node=>node.props.className==='required-field').length,1);
});

test('advancing clocks do not invalidate prepared code when inserting, previewing and saving an existing local draft',()=>{
  let now=Date.parse('2026-10-15T14:42:00.123Z');
  class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
  const env=host(),config=sample();env.window.Date=Clock;config.appearance.showLocalTime=true;
  const token=writePanelSession(config,env.window);navigatePanelSession('customize',token,env.window);
  const app=appHarness(env,Clock);let tree=app.render();
  button(tree,'Preparar instalação').props.onClick();tree=app.render();
  const prepared=elements(tree).find(node=>node.props.id==='snippet-profile').props.value;
  const firstTimestamp=/data-perfilwiki-clock-at="([^"]+)"/.exec(prepared)?.[1];
  assert.equal(firstTimestamp,'2026-10-15T14:42:00.123Z');
  now+=120001;tree=app.render();
  assert.equal(elements(tree).find(node=>node.props.id==='snippet-profile').props.value,prepared);
  elements(tree).find(node=>node.props['data-testid']==='editor-profile').props.onClick();tree=app.render();
  const original=elements(tree).find(node=>node.props.id==='local-draft').props.value+'\n\n== Notas ==\nTexto que precisa ficar.';
  elements(tree).find(node=>node.props.id==='local-draft').props.onChange({target:{value:original}});tree=app.render();
  now+=180002;
  button(tree,'Adicionar trecho preparado').props.onClick();tree=app.render();
  const inserted=elements(tree).find(node=>node.props.id==='local-draft').props.value;
  assert.ok(inserted.startsWith(original));assert.ok(inserted.includes(prepared));
  now+=240003;
  button(tree,'Conferir prévia local').props.onClick();tree=app.render();
  assert.ok(elements(tree).some(node=>node.props.className==='editor-preview'));
  assert.equal(elements(tree).some(node=>node.props.className==='field-error'),false);
  now+=300004;
  button(tree,'Salvar rascunho local').props.onClick();tree=app.render();
  assert.equal(elements(tree).some(node=>node.type==='dialog'),false);
  assert.match(text(elements(tree).find(node=>node.props.role==='status')),/Bloco salvo na página simulada/);
  elements(tree).find(node=>node.props['data-testid']==='editor-profile').props.onClick();tree=app.render();
  assert.equal(elements(tree).find(node=>node.props.id==='local-draft').props.value,inserted);
  assert.equal(elements(tree).find(node=>node.props.id==='snippet-profile').props.value,prepared);
  button(tree,'Fechar').props.onClick();tree=app.render();
  button(tree,'Ajustar a aparência').props.onClick();tree=app.render();
  elements(tree).find(node=>node.props.id==='display-name').props.onChange({target:{value:'Marina Nova'}});tree=app.render();
  button(tree,'Preparar instalação').props.onClick();tree=app.render();
  const regenerated=elements(tree).find(node=>node.props.id==='snippet-profile').props.value;
  assert.notEqual(regenerated,prepared);assert.match(regenerated,/Marina Nova/);
  assert.equal(/data-perfilwiki-clock-at="([^"]+)"/.exec(regenerated)?.[1],new Date(now).toISOString());
});
