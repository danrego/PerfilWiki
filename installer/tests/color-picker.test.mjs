import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const localRequire=createRequire(import.meta.url);
const esbuild=createRequire(localRequire.resolve('vite/package.json'))('esbuild');
const bundle=await esbuild.build({entryPoints:[new URL('../src/ColorPicker.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',logLevel:'silent'});
const compiled={exports:{}};
vm.runInNewContext(bundle.outputFiles[0].text,{module:compiled,exports:compiled.exports,require:localRequire,Intl,console});
const {ColorPicker}=compiled.exports;

test('the picker offers named swatches, a visible keyboard spectrum, one lightness control and exact hex',()=>{
 let changes=0;
 const markup=renderToStaticMarkup(React.createElement(ColorPicker,{id:'accent',label:'Escolher outra cor',value:'#faf7ef',onChange:()=>changes++}));
 assert.equal(changes,0,'Opening or rendering the picker must never change the color');
 assert.equal((markup.match(/class="color-palette-swatch"/g)||[]).length,18);
 for(const label of ['Azul claro','Azul','Azul escuro','Verde','Violeta escuro'])assert.ok(markup.includes('aria-label="'+label+'"'));
 assert.match(markup,/class="color-spectrum" tabindex="0" role="group"/);
 assert.match(markup,/aria-describedby="accent-spectrum-help"/);
 assert.match(markup,/Use as setas para escolher a cor/);
 assert.equal((markup.match(/type="range"/g)||[]).length,1);
 assert.match(markup,/Clarear ou escurecer/);
 assert.match(markup,/id="accent-hex"[^>]*value="#faf7ef"/);
 assert.doesNotMatch(markup,/Matiz|Saturação|type="color"/);
});

test('main and highlighted colors have independent exact fields and selected swatches',()=>{
 const markup=renderToStaticMarkup(React.createElement(React.Fragment,null,
  React.createElement(ColorPicker,{id:'accent',label:'Cor principal',value:'#3366cc',onChange:()=>{}}),
  React.createElement(ColorPicker,{id:'highlight',label:'Cor das caixas',value:'#faf7ef',onChange:()=>{}})));
 assert.match(markup,/id="accent-hex"[^>]*value="#3366cc"/);
 assert.match(markup,/id="highlight-hex"[^>]*value="#faf7ef"/);
 assert.equal((markup.match(/aria-pressed="true"/g)||[]).length,1);
 assert.equal((markup.match(/popover="auto" role="dialog"/g)||[]).length,2);
 for(const id of ['accent','highlight']){
  assert.match(markup,new RegExp('popovertarget="'+id+'"','i'));
  assert.match(markup,/popovertargetaction="hide"/i);
 }
});
