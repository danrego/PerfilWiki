import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createInitialConfig,validateConfig,dashboardConfig,activationSnippet,profileSnippet,importChoices,RELEASE_VERSION} from '../src/model.mjs';

const localRequire=createRequire(new URL('../package.json',import.meta.url));
const esbuild=createRequire(localRequire.resolve('vite/package.json'))('esbuild');
const bundle=await esbuild.build({entryPoints:[new URL('../src/App.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
const config=(appearance={})=>{const initial=createInitialConfig();return {...initial,user:'Marina Exemplo',timeZone:'UTC',coverImage:'Manual cover.jpg',appearance:{...initial.appearance,...appearance}};};
const plain=value=>JSON.parse(JSON.stringify(value));
function elements(value){return Array.isArray(value)?value.flatMap(elements):React.isValidElement(value)?[value,...elements(value.props.children)]:[];}

test('manual covers remain the default for new and older imported choices',()=>{
  assert.equal(createInitialConfig().appearance.coverSource,'manual');
  const old=config();delete old.appearance.coverSource;
  assert.equal(validateConfig(old).valid,true);
  assert.equal(dashboardConfig(old).appearance.coverSource,'manual');
  assert.equal(importChoices(JSON.stringify({...old,version:'1.15.0'})).appearance.coverSource,'manual');
  assert.match(profileSnippet(old),/\[\[Ficheiro:Manual cover\.jpg\|/);
});

test('daily cover choice survives configuration export and JSON reimport without replacing the manual filename',()=>{
  const selected=config({coverSource:'daily'}),prepared=dashboardConfig(selected);
  assert.equal(validateConfig(selected).valid,true);
  assert.equal(prepared.appearance.coverSource,'daily');assert.equal(prepared.coverImage,'Manual cover.jpg');
  const restored=importChoices(JSON.stringify({version:RELEASE_VERSION,...selected}));
  assert.equal(restored.appearance.coverSource,'daily');assert.equal(restored.coverImage,'Manual cover.jpg');
  const context={window:{}};vm.runInNewContext(activationSnippet(selected),context);
  assert.deepEqual(plain(context.window.PerfilWikiConfig),plain(prepared));
  const markup=profileSnippet(selected);
  assert.doesNotMatch(markup,/\[\[Ficheiro:Manual cover\.jpg|data:image|example\.org|fetch\(|XMLHttpRequest|action=(?:edit|purge)/i);
});

test('invalid cover sources are rejected before installation or local session import',()=>{
  for(const coverSource of ['automatic','commons',null,3,{},'daily\nmanual']) {
    const selected=config({coverSource});
    assert.equal(validateConfig(selected).valid,false);
    assert.throws(()=>dashboardConfig(selected));
    assert.throws(()=>importChoices(JSON.stringify(selected)));
  }
});

test('the actual installer selector changes only the source and preserves a manually chosen filename',()=>{
  const values=[];let cursor=0;
  const react={...React,useContext:context=>context._currentValue,useState(initial){const i=cursor++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return [values[i],next=>{values[i]=typeof next==='function'?next(values[i]):next;}];},useRef:value=>({current:value}),useMemo:make=>make(),useEffect(){}};
  const module={exports:{}},window={location:{hostname:'localhost'},matchMedia:()=>({matches:true})};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:name=>name==='react'?react:localRequire(name),window,console,Intl,Date,URL,Set,Map});
  const render=()=>{cursor=0;return elements(module.exports.App());};
  let nodes=render(),manual=nodes.find(node=>node.props.id==='profile-cover');
  manual.props.onChange({target:{value:'Manual cover.jpg'}});nodes=render();
  const selector=nodes.find(node=>node.props.id==='cover-source');
  assert.deepEqual(selector.props.children.map(option=>option.props.value),['manual','wiki-daily','daily']);
  assert.equal(selector.props.value,'manual');
  selector.props.onChange({target:{value:'daily'}});nodes=render();
  manual=nodes.find(node=>node.props.id==='profile-cover');
  assert.equal(manual.props.disabled,true);assert.equal(manual.props.value,'Manual cover.jpg');
  let preview=nodes.find(node=>typeof node.type==='function'&&node.type.name==='ProfilePreview');
  assert.equal(preview.props.config.appearance.coverSource,'daily');
  nodes.find(node=>node.props.id==='cover-source').props.onChange({target:{value:'manual'}});nodes=render();
  manual=nodes.find(node=>node.props.id==='profile-cover');
  assert.equal(manual.props.disabled,false);assert.equal(manual.props.value,'Manual cover.jpg');
  preview=nodes.find(node=>typeof node.type==='function'&&node.type.name==='ProfilePreview');
  assert.equal(preview.props.config.appearance.coverSource,'manual');
});

test('the cover source is an explicit accessible select beside the existing Commons field',()=>{
  const module={exports:{}};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:localRequire,window:{location:{hostname:'localhost'},matchMedia:()=>({matches:true})},console,Intl,Date,URL,Set,Map});
  const html=renderToStaticMarkup(React.createElement(module.exports.App));
  const top=html.split('class="profile-top-settings"')[1].split('<fieldset class="destination-field"')[0];
  assert.match(top,/<label for="cover-source">Imagem de capa<\/label>/);
  assert.match(top,/<option value="manual" selected="">Escolher arquivo do Commons<\/option>/);
  assert.match(top,/<option value="daily">Imagem do dia do Commons, na sua sessão<\/option>/);
  assert.ok(top.indexOf('id="cover-source"')<top.indexOf('id="profile-cover"'));
  assert.doesNotMatch(top,/src="https?:|iframe/);
});
