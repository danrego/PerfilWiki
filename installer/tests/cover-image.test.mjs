import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import Configuration from '../../src/Configuration.js';
import ProfileText from '../../src/ProfileText.js';
import {activationSnippet, activitySnippet, cardsSnippet, createInitialConfig, dashboardConfig, profileSnippet, RELEASE_VERSION, validateConfig} from '../src/model.mjs';
import {inspectInstallation, installationPlan} from '../src/installation-check.mjs';

const user='Marina Exemplo';
function config(options={}) {const initial=createInitialConfig();return {...initial,user,timeZone:'UTC',...options,appearance:{...initial.appearance,...options.appearance}};}
function inspect(c,mutation=text=>text) {
 const plan=installationPlan(c),page=(contentmodel,text)=>({contentmodel,revisions:[{slots:{main:{content:text}}}]});
 const release={version:RELEASE_VERSION,files:[{destination:plan.programTitle,text:'/* local program */'},{destination:plan.stylesTitle,text:'.example {color:blue;}'}]};
 const pages=new Map([[plan.activationTitle,page('javascript',activationSnippet(c))],[plan.profileTitle,page('wikitext',mutation(profileSnippet(c)))],...release.files.map(file=>[file.destination,page(file.destination===plan.stylesTitle?'sanitized-css':'javascript',file.text)])]);
 return inspectInstallation(plan,pages,release).find(row=>row.id==='profile').status;
}

test('cover defaults stay empty and independent while the top background is part of shared appearance',()=>{
 const first=config(),second=config();
 assert.equal(first.coverImage,'');assert.equal(first.appearance.topBackground,'#ffffff');
 assert.equal(first.appearance.profilePlacements.photo,'top');
 assert.equal(Object.hasOwn(dashboardConfig(first),'coverImage'),false);
 assert.doesNotMatch(profileSnippet(first),/dan-pu-profile-cover/);
 first.coverImage='Example.jpg';first.appearance.topBackground='#333333';
 assert.equal(second.coverImage,'');assert.equal(second.appearance.topBackground,'#ffffff');
 const ordinary=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:{user,timeZone:'UTC'}});
 assert.equal(ordinary.coverImage,'');assert.equal(ordinary.appearance.topBackground,'#ffffff');
});

test('Commons cover names and the chosen background reach the loader and actual configuration outside metrics',()=>{
 const selected=config({coverImage:'File:Ce\u0301u_azul.jpg',photo:'File:Portrait.jpg',appearance:{topBackground:'#FAEEDD'}});
 const prepared=dashboardConfig(selected),resolved=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:prepared});
 assert.equal(prepared.coverImage,'Céu azul.jpg');assert.equal(resolved.coverImage,'Céu azul.jpg');
 assert.equal(prepared.appearance.topBackground,'#faeedd');assert.equal(resolved.appearance.topBackground,'#faeedd');
 assert.equal(resolved.photo,'Portrait.jpg');
 const ordinary=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:{user,timeZone:'UTC'}});
 assert.deepEqual(resolved.metrics,ordinary.metrics);assert.equal(Object.hasOwn(resolved.metrics,'coverImage'),false);
 const context={window:{}};vm.runInNewContext(activationSnippet(selected),context);
 assert.equal(context.window.PerfilWikiConfig.coverImage,'Céu azul.jpg');assert.equal(context.window.PerfilWikiConfig.appearance.topBackground,'#faeedd');
 assert.equal(inspect(selected),'ok');
});

test('malformed cover names and CSS values are rejected before preview or export',()=>{
 for(const coverImage of ['https://example.org/a.jpg','../a.jpg','{{Template}}.jpg','A|B.jpg','A.jpg\n<script>','A%20B.jpg',{},3]) {
  const selected=config({coverImage});assert.ok(validateConfig(selected).errors.coverImage,JSON.stringify(coverImage));
  assert.throws(()=>dashboardConfig(selected));
  assert.throws(()=>Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:{user,timeZone:'UTC',coverImage}}));
 }
 for(const topBackground of ['red','#fff','#112233;background:red','url(https://example.org)',null,3]) {
  const selected=config({appearance:{topBackground}});assert.ok(validateConfig(selected).errors.appearance,JSON.stringify(topBackground));assert.throws(()=>profileSnippet(selected));
 }
});

test('cover-only profiles remain above the panels once in all layouts and single-block exports',()=>{
 for(const layout of ['integrated','together','separate'])for(const panels of [{},{showCards:false},{showActivity:false}]) {
  const selected=config({coverImage:'Cover.jpg',appearance:{layout,...panels,profilePlacements:{name:'hidden',location:'hidden',accountCreated:'hidden',photo:'hidden',localTime:'hidden'}}});
  const source=profileSnippet(selected);
  assert.equal((source.match(/class="dan-pu-profile-cover"/g)||[]).length,1);
  assert.ok(source.indexOf('dan-pu-profile-cover')<source.indexOf('id="dan-pu-ritmo"')||!panels.showActivity);
  assert.equal(inspect(selected),'ok',layout+JSON.stringify(panels));
  const fragments=cardsSnippet(selected)+activitySnippet(selected);
  assert.equal((fragments.match(/class="dan-pu-profile-cover"/g)||[]).length,layout==='integrated'&&panels.showCards!==false&&panels.showActivity!==false?0:1);
 }
});

test('the installation checker rejects covers that are changed, duplicated, omitted, injected or placed after the profile',()=>{
 const selected=config({coverImage:'Cover.jpg',appearance:{topBackground:'#f0f1f2'}});
 const cover=ProfileText.coverMarkup(dashboardConfig(selected),true);
 for(const mutation of [
  text=>text.replace(cover,''),text=>text.replace(cover,cover+cover),
  text=>text.replace('data-perfilwiki-cover="Cover.jpg"','data-perfilwiki-cover="Other.jpg"'),
  text=>text.replace('[[Ficheiro:Cover.jpg','[[Ficheiro:Other.jpg'),
  text=>text.replace(cover,'').replace('<div class="dan-pu-top-profile-slot">','<div class="dan-pu-top-profile-slot">'+cover),
  text=>text.replace('background:#f0f1f2;','background:#ffffff;'),
 ])assert.equal(inspect(selected,mutation),'different');
 assert.equal(inspect(config(),text=>text.replace('<div class="dan-pu-top-profile-slot">',cover+'<div class="dan-pu-top-profile-slot">')),'different');
});
