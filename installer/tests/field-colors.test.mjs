import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { customFieldItemColors, changeCustomItemColor, changeCustomItem, changeCustomLayout, addCustomItem, removeCustomItem } from '../src/custom-fields.mjs';
import { createInitialConfig, dashboardConfig, activationSnippet, profileSnippet, importChoices, RELEASE_VERSION } from '../src/model.mjs';
import { writePanelSession, navigatePanelSession, readPanelSession } from '../src/panel-session.mjs';

const localRequire=createRequire(new URL('../package.json',import.meta.url));
const esbuild=createRequire(localRequire.resolve('vite/package.json'))('esbuild');
const bundle=await esbuild.build({entryPoints:[new URL('../src/App.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
const plain=value=>JSON.parse(JSON.stringify(value));
function elements(value){return Array.isArray(value)?value.flatMap(elements):React.isValidElement(value)?[value,...elements(value.props.children)]:[];}
function text(value){return Array.isArray(value)?value.map(text).join(''):React.isValidElement(value)?text(value.props.children):value??'';}
function host(){
 const storage=new Map(),window={location:new URL('http://127.0.0.1:8788/INICIO.html'),sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},crypto:{getRandomValues:bytes=>bytes.fill(41)},matchMedia:()=>({matches:true}),scrollTo(){},addEventListener(){},removeEventListener(){},history:{pushState(_state,_unused,url){window.location=new URL(url,window.location);},replaceState(_state,_unused,url){window.location=new URL(url,window.location);}}};
 return {window};
}
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
function editor(tree,index){const node=elements(tree).find(node=>typeof node.type==='function'&&node.type.name==='CustomFieldEditor'&&node.props.index===index);assert.ok(node,'information '+index);return node.type(node.props);}
function control(tree,id){const node=elements(tree).find(node=>typeof node.type==='function'&&node.type.name==='TextColorControl'&&node.props.id===id);assert.ok(node,id);return node;}
function chooseMode(props,mode){const view=harness(),tree=view.render('TextColorControl',props);elements(tree).find(node=>node.props.id===props.id+'-mode').props.onChange({target:{value:mode}});}
function sample(){const initial=createInitialConfig();return {...initial,user:'Marina Exemplo',customFields:[{label:'Alma mater',values:['[[GWU]]','[[MIT]]'],layout:'inline',separator:'pipe',placement:'all'},{label:'Interesse',value:'[[História]]',placement:'top'}],appearance:{...initial.appearance,labelColor:'#224466',informationColor:'#446622'}};}
function initialApp(config=sample()){const env=host(),token=writePanelSession(config,env.window);assert.ok(token);navigatePanelSession('customize',token,env.window);return harness(env);}

test('legacy item colors convert to grouped colors without losing their values or introducing mixed keys',()=>{
 const initial={label:'Alma mater',value:'[[GWU]]',labelColor:'#770033',valueColor:'#226644',placement:'top'};
 const grouped=changeCustomLayout(initial,'lines');
 assert.deepEqual(grouped,{label:'Alma mater',labelColor:'#770033',values:['[[GWU]]'],valueColors:['#226644'],placement:'top',layout:'lines',separator:'pipe'});
 assert.equal(Object.hasOwn(grouped,'value'),false);assert.equal(Object.hasOwn(grouped,'valueColor'),false);
 const added=addCustomItem(initial);
 assert.deepEqual(added.values,['[[GWU]]','']);assert.deepEqual(added.valueColors,['#226644','']);
 assert.equal(Object.hasOwn(added,'valueColor'),false);assert.equal(added.labelColor,initial.labelColor);
 const changed=changeCustomItem(added,1,'[[MIT]]');assert.deepEqual(changed.valueColors,['#226644','']);
 assert.deepEqual(removeCustomItem(changed,0).valueColors,['']);
 assert.deepEqual(initial,{label:'Alma mater',value:'[[GWU]]',labelColor:'#770033',valueColor:'#226644',placement:'top'});
 const uncolored={label:'Cidade',value:'[[Rio de Janeiro]]'};
 assert.equal(Object.hasOwn(addCustomItem(uncolored),'valueColors'),false);
 assert.equal(Object.hasOwn(changeCustomLayout(uncolored,'bullets'),'valueColors'),false);
});

test('item colors keep their exact row when blank entries are edited, removed or extended',()=>{
 const field={label:'Formação',values:['GWU','','MIT'],valueColors:['#112233','','#445566'],layout:'bullets',separator:'dot'};
 const filled=changeCustomItem(field,1,'USP');assert.deepEqual(filled.valueColors,field.valueColors);
 const removed=removeCustomItem(field,0);assert.deepEqual(removed.values,['','MIT']);assert.deepEqual(removed.valueColors,['','#445566']);
 const appended=addCustomItem(removed);assert.deepEqual(appended.valueColors,['','#445566','']);assert.deepEqual(appended.values,['','MIT','']);
 assert.deepEqual(changeCustomLayout(appended,'inline').valueColors,appended.valueColors);
 const chosen=changeCustomItemColor(appended,0,'#AABBCC');assert.deepEqual(chosen.valueColors,['#aabbcc','#445566','']);
 assert.deepEqual(customFieldItemColors(field),field.valueColors);assert.deepEqual(customFieldItemColors({label:'X',value:'Y'}),['']);
 for(const index of [-1,3,0.5])assert.equal(changeCustomItemColor(field,index,'#112233'),field);
 for(const invalid of ['red','#abc','#abcdef;display:none',null,1])assert.equal(changeCustomItemColor(field,0,invalid),field);
 assert.deepEqual(changeCustomItemColor({label:'X',value:'Y',valueColor:'#112233'},0,''),{label:'X',value:'Y',valueColor:''});
 assert.deepEqual(field.valueColors,['#112233','','#445566']);
});

test('each label and item exposes its own inherited or custom color beside its text input',()=>{
 const module={exports:{}};vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:localRequire,window:{location:{hostname:'localhost'},matchMedia:()=>({matches:true})},console,Intl,Date,URL,Set,Map});
 const field={label:'Alma mater',values:['[[GWU]]','[[MIT]]'],labelColor:'#770033',valueColors:['#226644',''],layout:'inline',separator:'pipe'};
 const html=renderToStaticMarkup(React.createElement(module.exports.CustomFieldEditor,{field,index:0,labelColor:'#224466',informationColor:'#446622',onChange(){},onRemove(){}}));
 for(const [id,label]of [['custom-field-label-color-0','Cor do rótulo 1'],['custom-field-item-color-0-0','Cor do item 1 da informação 1'],['custom-field-item-color-0-1','Cor do item 2 da informação 1']])assert.ok(html.includes('<label for="'+id+'-mode">'+label+'</label>'));
 assert.equal((html.match(/>Padrão do perfil<\/option>/g)||[]).length,3);
 assert.match(html,/id="custom-field-item-color-0-1-mode"><option value="automatic" selected="">Padrão do perfil/);
 assert.equal((html.match(/id="custom-field-item-color-0-1"/g)||[]).length,0);
 assert.ok(html.indexOf('custom-field-label-0')<html.indexOf('custom-field-label-color-0-mode'));
 assert.ok(html.indexOf('custom-field-value-0-0')<html.indexOf('custom-field-item-color-0-0-mode'));
});

test('real editor handlers update independent fields and each item while preserving values, layouts and global colors',()=>{
 const app=initialApp();let tree=app.render(),original=plain(preview(tree).props.config);
 control(editor(tree,0),'custom-field-label-color-0').props.onChange('#773355');tree=app.render();
 control(editor(tree,0),'custom-field-item-color-0-0').props.onChange('#335577');tree=app.render();
 control(editor(tree,0),'custom-field-item-color-0-1').props.onChange('#557733');tree=app.render();
 control(editor(tree,1),'custom-field-item-color-1-0').props.onChange('#774422');tree=app.render();
 const current=plain(preview(tree).props.config);
 assert.deepEqual(current.customFields[0],{...original.customFields[0],labelColor:'#773355',valueColors:['#335577','#557733']});
 assert.deepEqual(current.customFields[1],{...original.customFields[1],valueColor:'#774422'});
 assert.deepEqual(current.appearance,original.appearance);
 for(const [before,after]of original.customFields.map((field,index)=>[field,current.customFields[index]])){assert.equal(after.label,before.label);assert.deepEqual(after.values,before.values);assert.equal(after.value,before.value);assert.equal(after.placement,before.placement);}
 const prepared=dashboardConfig(current);assert.deepEqual(prepared.customFields,current.customFields);
 const context={window:{}};vm.runInNewContext(activationSnippet(current),context);assert.deepEqual(plain(context.window.PerfilWikiConfig.customFields),current.customFields);
 assert.deepEqual(importChoices(JSON.stringify({...current,version:RELEASE_VERSION})).customFields,current.customFields);
 for(const color of ['#773355','#335577','#557733','#774422'])assert.ok(profileSnippet(current).includes(color),color);
 assert.deepEqual(plain(readPanelSession(app.window).config.customFields),current.customFields);
 const reloaded=harness({window:app.window}),restored=plain(preview(reloaded.render()).props.config);assert.deepEqual(restored.customFields,current.customFields);
});

test('Padrão do perfil follows subsequent global changes and resetting an override restores inheritance',()=>{
 const app=initialApp();let tree=app.render();
 assert.equal(control(editor(tree,0),'custom-field-label-color-0').props.value,undefined);
 assert.equal(control(editor(tree,0),'custom-field-label-color-0').props.fallback,'#224466');
 assert.equal(control(editor(tree,0),'custom-field-item-color-0-0').props.fallback,'#446622');
 chooseMode(control(editor(tree,0),'custom-field-item-color-0-0').props,'custom');tree=app.render();
 assert.deepEqual(plain(preview(tree).props.config.customFields[0].valueColors),['#446622','']);
 control(tree,'information-color').props.onChange('#662244');tree=app.render();
 assert.equal(control(editor(tree,0),'custom-field-item-color-0-0').props.value,'#446622');
 assert.equal(control(editor(tree,0),'custom-field-item-color-0-1').props.value,'');
 assert.equal(control(editor(tree,0),'custom-field-item-color-0-1').props.fallback,'#662244');
 chooseMode(control(editor(tree,0),'custom-field-item-color-0-0').props,'automatic');tree=app.render();
 assert.equal(control(editor(tree,0),'custom-field-item-color-0-0').props.value,'');
 assert.equal(control(editor(tree,0),'custom-field-item-color-0-0').props.fallback,'#662244');
 control(tree,'label-color').props.onChange('#663344');tree=app.render();
 assert.equal(control(editor(tree,0),'custom-field-label-color-0').props.value,undefined);
 assert.equal(control(editor(tree,0),'custom-field-label-color-0').props.fallback,'#663344');
 assert.equal(Object.hasOwn(dashboardConfig(preview(tree).props.config).customFields[0],'valueColors'),false);
});
