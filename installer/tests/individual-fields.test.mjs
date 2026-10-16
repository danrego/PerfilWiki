import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import Appearance from '../../src/Appearance.js';
import Configuration from '../../src/Configuration.js';
import {createInitialConfig,dashboardConfig,profileSnippet,activationSnippet,validateConfig} from '../src/model.mjs';
import {installationPlan,inspectInstallation} from '../src/installation-check.mjs';
const user='Marina Exemplo';
function config(){const c=createInitialConfig();return {...c,user,timeZone:'UTC',displayName:'Marina',location:'[[Washington, DC]]',photo:'File:Portrait_example.jpg',customFields:[{label:'Interesse',value:'[[História]]',placement:'cards'},{label:'Pesquisa',value:'Bibliotecas',placement:'activity'},{label:'Outro',value:'Texto omitido',placement:'hidden'}],appearance:{...c.appearance,profileDetailsLayout:'inline',profilePlacements:{name:'both',location:'cards',accountCreated:'hidden',photo:'cards'},showAccountCreated:true}};}
function block(source,name){const content=source.split('<!-- PERFILWIKI-'+name+'-BEGIN -->')[1].split('<!-- PERFILWIKI-'+name+'-END -->')[0];return name==='ACTIVITY'?content.replace(/<!-- PERFILWIKI-CARDS-BEGIN -->[\s\S]*?<!-- PERFILWIKI-CARDS-END -->/g,''):content;}
test('each field can choose its own block and hidden fields remain absent from starter output',()=>{
 const c=config(),text=profileSnippet(c),cards=block(text,'CARDS'),activity=block(text,'ACTIVITY');
 for(const output of [cards,activity]) assert.equal((output.match(/class="dan-pu-profile-label"/g)||[]).length,1);
 assert.match(cards,/Washington/);assert.doesNotMatch(activity,/Washington/);
 assert.match(cards,/Interesse:/);assert.doesNotMatch(activity,/Interesse:/);
 assert.match(activity,/Pesquisa:/);assert.doesNotMatch(cards,/Pesquisa:/);
 assert.doesNotMatch(text,/Texto omitido|dan-pu-account-created/);
 assert.match(cards,/data-perfilwiki-photo="Portrait example.jpg"/);assert.doesNotMatch(activity,/class="dan-pu-profile-photo"/);
 assert.match(cards,/\[\[Ficheiro:Portrait example.jpg\|96x96px/);
});
test('per-field choices and normalized Commons filename reach runtime without changing metrics identity',()=>{
 const c=config(),sandbox={window:{}};vm.runInNewContext(activationSnippet(c),sandbox);
 const prepared=JSON.parse(JSON.stringify(sandbox.window.PerfilWikiConfig));
 assert.equal(prepared.photo,'Portrait example.jpg');assert.equal(prepared.customFields[0].placement,'cards');
 assert.equal(prepared.appearance.profilePlacements.name,'both');assert.equal(prepared.appearance.profileDetailsLayout,'inline');
 const resolved=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:prepared});
 const ordinary=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:{user,timeZone:'UTC'}});
 assert.deepEqual(resolved.metrics,ordinary.metrics);assert.equal(resolved.photo,'Portrait example.jpg');
 assert.equal(Object.hasOwn(dashboardConfig({...createInitialConfig(),user}),'photo'),false);
});
test('per-field maps are isolated between new configurations and malformed placements cannot be exported',()=>{
 const a=createInitialConfig(),b=createInitialConfig();a.appearance.profilePlacements.name='hidden';
 assert.equal(b.appearance.profilePlacements.name,'inherit');
 for(const patch of [{name:'sideways'},{invented:'cards'},null,[]]) {
  const c=config();c.appearance.profilePlacements=patch;assert.equal(validateConfig(c).valid,false);assert.throws(()=>profileSnippet(c));
 }
 const c=config();c.customFields[0].placement='sideways';assert.equal(validateConfig(c).valid,false);
 assert.equal(Appearance.fieldIn({showActivity:false,profilePlacements:{name:'hidden'}},'cards','name'),false);
});
test('installer source inspection validates independent placement and exact Commons image source',()=>{
 const c=config(),plan=installationPlan(c),page=(title,model,text)=>({title,contentmodel:model,revisions:[{slots:{main:{content:text}}}]});
 const pages=new Map([[plan.profileTitle,page(plan.profileTitle,'wikitext',profileSnippet(c))]]);
 const status=()=>inspectInstallation(plan,pages,{files:[]}).find(row=>row.id==='profile').status;
 assert.equal(status(),'ok');
 pages.get(plan.profileTitle).revisions[0].slots.main.content=profileSnippet(c).replace('96x96px','96px');
 assert.equal(status(),'different');
});
