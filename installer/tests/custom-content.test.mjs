import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialConfig, validateConfig, profileSnippet, cardsSnippet, activitySnippet, activationSnippet, dashboardConfig, importChoices, RELEASE_VERSION} from '../src/model.mjs';
import ProfileSections from '../../src/ProfileSections.js';

function config(patch={}){return {...createInitialConfig(),user:'Marina Exemplo',timeZone:'UTC',...patch};}

test('personal sections are static siblings after profile markers and excluded from activation and individual blocks',()=>{
  const sections=[{title:'Conflito de interesses',content:"Texto com [[História]] e {{Aviso}}.\r\n* Uma meta pessoal."},{title:'Metas e projetos',content:''}];
  const selected=config({contentSections:sections});
  assert.equal(validateConfig(selected).valid,true);
  const text=profileSnippet(selected),end=text.indexOf('<!-- PERFILWIKI-PROFILE-END -->'),personal=text.indexOf('<!-- PERFILWIKI-CONTENT-BEGIN -->');
  assert.ok(end>=0&&personal>end);
  assert.equal((text.match(/id="dan-pu-content-sections"/g)||[]).length,1);
  assert.ok(text.includes(sections[0].content));
  assert.match(text,/\n== Metas e projetos ==\n/);
  assert.deepEqual(ProfileSections.normalize(selected.contentSections),sections);
  for(const output of [activationSnippet(selected),cardsSnippet(selected),activitySnippet(selected)])assert.doesNotMatch(output,/Conflito de interesses|Metas e projetos|dan-pu-content-sections|contentSections/);
  assert.equal(Object.hasOwn(dashboardConfig(selected),'contentSections'),false);
});

test('empty section drafts are omitted while incomplete or oversized bodies block export with a useful error',()=>{
  const selected=config({contentSections:[{title:'',content:'  \n'},{title:'Meus projetos',content:''}]});
  const text=profileSnippet(selected);
  assert.equal((text.match(/== Meus projetos ==/g)||[]).length,1);
  for(const contentSections of [[{title:'',content:'Um texto sem título'}],Array.from({length:9},()=>({title:'Meta',content:''})),[{title:'Meta',content:'x'.repeat(50001)}]]){
    assert.equal(validateConfig(config({contentSections})).valid,false);
    assert.ok(validateConfig(config({contentSections})).errors.contentSections);
    assert.throws(()=>profileSnippet(config({contentSections})));
  }
});

test('photo size and shape are independent normalized choices in initial configuration and exports',()=>{
  const base=config();
  assert.equal(base.appearance.photoSize,96);assert.equal(base.appearance.photoShape,'square');
  for(const photoSize of [64,96,128,160,200])for(const photoShape of ['square','round']){
    const selected=config({photo:'Example.jpg',appearance:{...base.appearance,photoSize,photoShape,nameAlignment:'right',photoAlignment:'center'}});
    assert.equal(validateConfig(selected).valid,true);
    const prepared=dashboardConfig(selected);
    assert.equal(prepared.appearance.photoSize,photoSize);assert.equal(prepared.appearance.photoShape,photoShape);
    assert.match(activationSnippet(selected),new RegExp('"photoSize": '+photoSize));
    assert.match(activationSnippet(selected),new RegExp('"photoShape": "'+photoShape+'"'));
  }
  for(const patch of [{photoSize:100},{photoSize:'96'},{photoShape:'circle'},{photoShape:null}])assert.equal(validateConfig(config({appearance:{...base.appearance,...patch}})).valid,false);
});

test('choice import preserves current raw sections, full appearance and unicode without including the version in runtime config',()=>{
  const current=config({displayName:'Marina Pesquisa',location:'[[Rio de Janeiro]]',contentSections:[{title:'Minhas metas',content:'* {{Minha meta}}\r\n* [[História]]'}]});
  current.appearance={...current.appearance,photoSize:200,photoShape:'round',photoAlignment:'right'};
  const restored=importChoices(JSON.stringify({version:RELEASE_VERSION,...current}));
  assert.deepEqual(restored,current);
  assert.equal(Object.hasOwn(restored,'version'),false);
  assert.equal({}.polluted,undefined);
});

test('choice import fills defaults for older compatible 1.x files and keeps native personal texts optional',()=>{
  for(const version of [undefined,'1.0.0','1.14.0','1.15.0-local-candidate']){
    const restored=importChoices(JSON.stringify({...(version?{version}:{}),user:'Marina_Exemplo',timeZone:'UTC',appearance:{alignment:'left'}}));
    assert.equal(restored.user,'Marina Exemplo');assert.equal(restored.appearance.alignment,'left');
    assert.equal(restored.appearance.photoSize,96);assert.equal(restored.appearance.photoShape,'square');
    assert.equal(restored.appearance.photoAlignment,'left');assert.equal(restored.destination,'main');
    assert.deepEqual(restored.contentSections,[]);
  }
});

test('choice import rejects scripts, unsupported versions, unknown keys, prototype keys and malformed nested choices',()=>{
  for(const text of ['window.PerfilWikiConfig = {}','null','[]','{}','{"user":"Marina Exemplo","unknown":1}','{"user":"Marina Exemplo","__proto__":{"polluted":true}}',JSON.stringify({user:'Marina Exemplo',appearance:{constructor:{polluted:true}}}),JSON.stringify({user:'Marina Exemplo',appearance:{unknown:true}}),JSON.stringify({user:'Marina Exemplo',customFields:[{label:'x',value:'y',prototype:{}}]}),JSON.stringify({user:'Marina Exemplo',appearance:{profilePlacements:{photo:'top',bogus:'top'}}}),JSON.stringify({user:'Marina Exemplo',appearance:{photoSize:Infinity}})])assert.throws(()=>importChoices(text),text);
  for(const version of ['2.0.0','0.9.0','1.15','v1.15.0',{},null,1])assert.throws(()=>importChoices(JSON.stringify({user:'Marina Exemplo',version})),String(version));
  assert.throws(()=>importChoices('x'.repeat(1048577)),/1 MiB/);
  assert.throws(()=>importChoices(JSON.stringify({user:'Marina Exemplo',contentSections:[{title:'Texto',content:'😀'.repeat(280000)}]})),/1 MiB/);
  assert.equal({}.polluted,undefined);
});

test('the real installer exposes photo controls, empty section starters and local JSON reimport without an embedded wiki editor',async()=>{
  const {createRequire}=await import('node:module'),vm=await import('node:vm');
  const localRequire=createRequire(new URL('../package.json',import.meta.url)),React=localRequire('react'),{renderToStaticMarkup}=localRequire('react-dom/server');
  const esbuild=createRequire(localRequire.resolve('vite/package.json'))('esbuild');
  const bundle=await esbuild.build({entryPoints:[new URL('../src/App.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
  const module={exports:{}};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:localRequire,window:{matchMedia:()=>({matches:true}),location:{hostname:'localhost'}},console,Intl,Date,URL,Set,Map});
  const html=renderToStaticMarkup(React.createElement(module.exports.App));
  assert.match(html,/Carregar minhas escolhas/);
  const size=html.split('id="photo-size"')[1].split('</select>')[0];
  for(const value of [64,96,128,160,200])assert.ok(size.includes('value="'+value+'"'));
  assert.match(size,/value="96" selected=""/);
  const shape=html.split('id="photo-shape"')[1].split('</select>')[0];
  assert.match(shape,/value="square" selected="">Quadrada/);assert.match(shape,/value="round">Redonda/);
  assert.match(html,/aria-controls="settings-texts"[^>]*><span>Textos e projetos/);
  assert.match(html,/\+ Conflito de interesses/);assert.match(html,/\+ Metas e projetos/);
  assert.doesNotMatch(html,/Não (?:tenho|possuo) conflito|form[^>]+action="https:\/\/pt\.wikipedia\.org/);
});
