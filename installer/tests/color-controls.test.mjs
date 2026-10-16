import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInitialConfig, dashboardConfig, activationSnippet, profileSnippet, importChoices, RELEASE_VERSION } from '../src/model.mjs';
import { writePanelSession, navigatePanelSession } from '../src/panel-session.mjs';

const localRequire=createRequire(new URL('../package.json',import.meta.url));
const esbuild=createRequire(localRequire.resolve('vite/package.json'))('esbuild');
const bundle=await esbuild.build({entryPoints:[new URL('../src/App.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
const plain=value=>JSON.parse(JSON.stringify(value));
const colorKeys=['nameColor','labelColor','informationColor'];
function elements(value){return Array.isArray(value)?value.flatMap(elements):React.isValidElement(value)?[value,...elements(value.props.children)]:[];}
function text(value){return Array.isArray(value)?value.map(text).join(''):React.isValidElement(value)?text(value.props.children):value??'';}
function host(){
  const storage=new Map();
  const window={location:new URL('http://127.0.0.1:8788/INICIO.html'),sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},crypto:{getRandomValues:bytes=>bytes.fill(37)},matchMedia:()=>({matches:true}),scrollTo(){},addEventListener(){},removeEventListener(){},history:{pushState(_state,_unused,url){window.location=new URL(url,window.location);},replaceState(_state,_unused,url){window.location=new URL(url,window.location);}}};
  return {window};
}
/** Exercise the rendered React handlers, retaining state and effect dependencies between renders. */
function harness(environment=host()){
  const hooks=[],effects=[];let cursor=0;
  const react={...React,
    // Direct hook harnesses retain the provider's default pt-BR context.
    useContext:context=>context._currentValue,
    useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],next=>{hooks[i]=typeof next==='function'?next(hooks[i]):next;}];},
    useRef(value){const i=cursor++;return hooks[i]??(hooks[i]={current:value});},
    useMemo(make,dependencies){const i=cursor++,old=hooks[i];if(!old||dependencies.some((value,j)=>!Object.is(value,old.dependencies[j])))hooks[i]={dependencies,value:make()};return hooks[i].value;},
    useEffect(effect,dependencies){const i=cursor++,old=hooks[i];if(!old||dependencies.some((value,j)=>!Object.is(value,old.dependencies[j])))effects.push(()=>{old?.cleanup?.();hooks[i]={dependencies,cleanup:effect()};});},
  };
  const module={exports:{}};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:name=>name==='react'?react:localRequire(name),window:environment.window,document:{documentElement:{lang:'pt-BR'},title:'',querySelectorAll:()=>[],getElementById:()=>null},requestAnimationFrame:callback=>callback(),console,Intl,Date,URL,TextEncoder,Uint8Array,Set,Map});
  function render(name='App',props){cursor=0;const tree=module.exports[name](props);while(effects.length)effects.shift()();return tree;}
  return {...environment,render};
}
function preview(tree){return elements(tree).find(node=>typeof node.type==='function'&&node.type.name==='ProfilePreview');}
function colorControl(tree,id){const node=elements(tree).find(node=>typeof node.type==='function'&&node.type.name==='TextColorControl'&&node.props.id===id);assert.ok(node,id);return node;}
function button(tree,label){const node=elements(tree).find(node=>node.type==='button'&&text(node.props.children)===label);assert.ok(node,label);return node;}

test('panel and box colors stay beside their relevant layout controls without a colors accordion',()=>{
  const app=harness(),tree=app.render(),groups=elements(tree).filter(node=>typeof node.type==='function'&&node.type.name==='SettingsGroup');
  assert.equal(groups.some(node=>node.props.id==='colors'||node.props.title==='Cores e destaques'),false);
  const layout=groups.find(node=>node.props.id==='layout');assert.ok(layout);
  const layoutNodes=elements(layout.props.children);
  assert.ok(layoutNodes.some(node=>node.type==='legend'&&text(node.props.children)==='Cor do painel'));
  assert.ok(layoutNodes.some(node=>node.props.id==='card-columns'));
  assert.ok(layoutNodes.some(node=>node.props.className==='highlight-color-controls'));
  for(const id of ['name-color','label-color','information-color'])assert.ok(elements(groups.find(node=>node.props.id==='profile').props.children).some(node=>node.props.id===id));
  assert.equal(layoutNodes.some(node=>node.props.id==='name-color'),false);
  const highlight=layoutNodes.find(node=>node.props['aria-label']==='Código da cor de destaque das caixas');
  highlight.props.onChange({target:{value:'#113355'}});
  let next=app.render();assert.equal(preview(next).props.config.appearance.highlightColor,'#113355');
  const before=plain(preview(next).props.config.appearance.metrics);
  elements(next).find(node=>node.props.id==='color-hex').props.onChange({target:{value:'#224488'}});
  next=app.render();assert.equal(preview(next).props.config.appearance.accent,'#224488');
  assert.deepEqual(plain(preview(next).props.config.appearance.metrics),before);
});

test('automatic and custom text colors validate draft hex input and restore automatic mode through real handlers',()=>{
  const control=harness(),changes=[];let props={id:'sample-color',label:'Cor do nome',value:'',fallback:'#202122',onChange:value=>changes.push(value)};
  let tree=control.render('TextColorControl',props),nodes=elements(tree),mode=nodes.find(node=>node.props.id==='sample-color-mode');
  assert.equal(mode.props.value,'automatic');assert.equal(nodes.some(node=>node.type==='input'),false);
  mode.props.onChange({target:{value:'custom'}});assert.deepEqual(changes,['#202122']);
  props={...props,value:changes.at(-1)};control.render('TextColorControl',props);tree=control.render('TextColorControl',props);
  let input=elements(tree).find(node=>node.props['aria-label']==='Código da cor do nome');assert.equal(input.props.value,'#202122');
  input.props.onChange({target:{value:'#bad'}});tree=control.render('TextColorControl',props);
  assert.equal(elements(tree).find(node=>node.type==='input').props.value,'#bad');assert.equal(changes.length,1);
  elements(tree).find(node=>node.type==='input').props.onBlur();tree=control.render('TextColorControl',props);
  assert.equal(elements(tree).find(node=>node.type==='input').props.value,'#202122');
  elements(tree).find(node=>node.type==='input').props.onChange({target:{value:'#AABBCC'}});assert.equal(changes.at(-1),'#aabbcc');
  props={...props,value:changes.at(-1)};tree=control.render('TextColorControl',props);
  elements(tree).find(node=>node.props.id==='sample-color-mode').props.onChange({target:{value:'automatic'}});assert.equal(changes.at(-1),'');
  props={...props,value:''};tree=control.render('TextColorControl',props);assert.equal(elements(tree).some(node=>node.type==='input'),false);
});

test('independent profile color handlers preserve profile fields and survive actual installation and choice export',()=>{
  const app=harness();let tree=app.render();
  elements(tree).find(node=>node.props.id==='username').props.onChange({target:{value:'Marina Exemplo'}});tree=app.render();
  elements(tree).find(node=>node.props.id==='profile-location').props.onChange({target:{value:'[[Rio de Janeiro]]'}});tree=app.render();
  button(tree,'+ Adicionar informação').props.onClick();tree=app.render();
  const initial=plain(preview(tree).props.config),chosen=['#772244','#244477','#335522'];
  for(const [index,id] of ['name-color','label-color','information-color'].entries()) {colorControl(tree,id).props.onChange(chosen[index]);tree=app.render();}
  const current=plain(preview(tree).props.config);
  for(const [index,key] of colorKeys.entries())assert.equal(current.appearance[key],chosen[index]);
  assert.equal(current.location,initial.location);assert.deepEqual(current.customFields,initial.customFields);assert.deepEqual(current.appearance.metrics,initial.appearance.metrics);
  const context={window:{}};vm.runInNewContext(activationSnippet(current),context);
  assert.deepEqual(plain(context.window.PerfilWikiConfig),plain(dashboardConfig(current)));
  const imported=importChoices(JSON.stringify({...current,version:RELEASE_VERSION}));
  for(const key of colorKeys)assert.equal(imported.appearance[key],current.appearance[key]);
  const markup=profileSnippet(current);
  for(const hex of chosen)assert.ok(markup.includes(hex),hex);
  button(tree,'Ver painel').props.onClick();tree=app.render();preview(tree).props.onEditPanel();tree=app.render();
  for(const key of colorKeys)assert.equal(preview(tree).props.config.appearance[key],current.appearance[key]);
  button(tree,'Restaurar aparência padrão').props.onClick();tree=app.render();
  for(const key of colorKeys)assert.equal(preview(tree).props.config.appearance[key],'');
  assert.equal(preview(tree).props.config.location,'[[Rio de Janeiro]]');
});

test('new custom color choices return intact after a local panel reload',()=>{
  const initial=createInitialConfig(),config={...initial,user:'Marina Exemplo',appearance:{...initial.appearance,nameColor:'#442266',labelColor:'#224466',informationColor:'#226644'}},env=host();
  const token=writePanelSession(config,env.window);assert.ok(token);navigatePanelSession('panel',token,env.window);
  const app=harness(env);let tree=app.render();preview(tree).props.onEditPanel();tree=app.render();
  for(const [id,key] of [['name-color','nameColor'],['label-color','labelColor'],['information-color','informationColor']])assert.equal(colorControl(tree,id).props.value,config.appearance[key]);
});

test('custom text color controls label their modes and color codes for keyboard and assistive technology',()=>{
  const module={exports:{}};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:localRequire,window:{location:{hostname:'localhost'},matchMedia:()=>({matches:true})},console,Intl,Date,URL,Set,Map});
  for(const [id,label] of [['name-color','Cor do nome'],['label-color','Cor dos rótulos'],['information-color','Cor das informações']]) {
    const html=renderToStaticMarkup(React.createElement(module.exports.TextColorControl,{id,label,value:'#224466',onChange:()=>{}}));
    assert.ok(html.includes('<label for="'+id+'-mode">'+label+'</label>'));
    assert.match(html,/<option value="automatic">Automática<\/option>/);assert.match(html,/<option value="custom" selected="">Personalizada<\/option>/);
    assert.ok(html.includes('aria-label="Código da '+label.toLowerCase()+'"'));assert.ok(html.includes('popover="auto"'));assert.ok(html.includes('aria-haspopup="dialog"'));
  }
});

test('the visitor cover source is explicit and keeps the manually selected filename through either automatic mode',()=>{
  const app=harness();let tree=app.render();
  elements(tree).find(node=>node.props.id==='profile-cover').props.onChange({target:{value:'My cover.jpg'}});tree=app.render();
  let selector=elements(tree).find(node=>node.props.id==='cover-source');
  assert.deepEqual(selector.props.children.map(option=>option.props.value),['manual','wiki-daily','daily']);
  assert.equal(text(selector.props.children[1]),'Imagem do dia da Wikipédia, para visitantes');
  assert.equal(text(selector.props.children[2]),'Imagem do dia do Commons, na sua sessão');
  selector.props.onChange({target:{value:'wiki-daily'}});tree=app.render();
  assert.equal(preview(tree).props.config.appearance.coverSource,'wiki-daily');
  assert.equal(elements(tree).find(node=>node.props.id==='profile-cover').props.disabled,true);
  assert.equal(elements(tree).find(node=>node.props.id==='profile-cover').props.value,'My cover.jpg');
  assert.match(text(elements(tree).find(node=>node.props.id==='profile-cover-help')),/Atualiza para os visitantes.*cache da página/);
  elements(tree).find(node=>node.props.id==='cover-source').props.onChange({target:{value:'daily'}});tree=app.render();
  assert.equal(elements(tree).find(node=>node.props.id==='profile-cover').props.disabled,true);
  assert.match(text(elements(tree).find(node=>node.props.id==='profile-cover-help')),/Na sua sessão ativa/);
  elements(tree).find(node=>node.props.id==='cover-source').props.onChange({target:{value:'manual'}});tree=app.render();
  assert.equal(elements(tree).find(node=>node.props.id==='profile-cover').props.disabled,false);
  assert.equal(elements(tree).find(node=>node.props.id==='profile-cover').props.value,'My cover.jpg');
});
