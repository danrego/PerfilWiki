import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import Appearance from '../../src/Appearance.js';
import Header from '../../src/ProfileHeaderView.js';
import Activity from '../../src/ActivityView.js';
import Cards from '../../src/CardsView.js';
import Layout from '../../src/LayoutView.js';
import {createInitialConfig,validateConfig,dashboardConfig,activationSnippet,profileSnippet,importChoices,RELEASE_VERSION} from '../src/model.mjs';
import {installationPlan,inspectInstallation} from '../src/installation-check.mjs';
const colors={nameColor:'#3366cc',labelColor:'#246342',informationColor:'#6854a4'};
function config(appearance={}){const initial=createInitialConfig();return {...initial,user:'Marina Exemplo',timeZone:'America/New_York',displayName:'Marina Pesquisa',location:'[[Washington, DC|Washington]]',customFields:[{label:'Alma mater',values:['[[GWU]]','[[MIT]]'],layout:'inline',separator:'pipe',placement:'all'},{label:'Pesquisa',values:[],placement:'all'}],appearance:{...initial.appearance,profilePlacement:'all',profilePlacements:{...initial.appearance.profilePlacements,localTime:'all'},showLocalTime:true,showAccountCreated:true,showUserGroups:true,...colors,...appearance}};}
function fixture(c){const plan=installationPlan(c),page=(title,model,content)=>({title,contentmodel:model,revisions:[{slots:{main:{content}}}]}),release={version:RELEASE_VERSION,files:[]};const pages=new Map([[plan.profileTitle,page(plan.profileTitle,'wikitext',profileSnippet(c))]]);return {plan,pages,release,slot:pages.get(plan.profileTitle).revisions[0].slots.main};}
const status=f=>inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status;

test('installer colors preserve explicit selections across activation and backup import while older choices stay automatic',()=>{
 const c=config(),prepared=dashboardConfig(c),context={window:{}};vm.runInNewContext(activationSnippet(c),context);
 for(const [key,value]of Object.entries(colors)){
  assert.equal(prepared.appearance[key],value);assert.equal(context.window.PerfilWikiConfig.appearance[key],value);
  assert.equal(importChoices(JSON.stringify({...c,version:RELEASE_VERSION})).appearance[key],value);
 }
 const old=config();for(const key of Object.keys(colors))delete old.appearance[key];
 const restored=importChoices(JSON.stringify({...old,version:'1.16.0'}));
 for(const key of Object.keys(colors)){assert.equal(dashboardConfig(old).appearance[key],'');assert.equal(restored.appearance[key],'');assert.equal(Appearance.normalize(old.appearance)[key],'');}
 for(const key of Object.keys(colors))for(const value of [null,5,'red','#abc','#ffffff;display:none','" onload="x']){
  const invalid=config({[key]:value});assert.equal(validateConfig(invalid).valid,false);assert.throws(()=>dashboardConfig(invalid));assert.throws(()=>importChoices(JSON.stringify(invalid)));
 }
});

test('installation checks accept independent profile colors, nested colored links and label-only rows in every profile scope',()=>{
 for(const profilePlacement of ['top','cards','activity','all'])for(const profileDetailsLayout of ['stacked','inline'])for(const topBackground of ['#ffffff','#111111']){
  const c=config({profilePlacement,profileDetailsLayout,topBackground}),f=fixture(c);
  assert.equal(status(f),'ok',profilePlacement+'/'+profileDetailsLayout+'/'+topBackground);
  assert.match(f.slot.content,/Alma mater/);assert.match(f.slot.content,/<span style="color:#6854a4;">Washington<\/span>/);
 }
 for(const layout of ['inline','lines','bullets']){
  const c=config();c.customFields[0].layout=layout;
  assert.equal(status(fixture(c)),'ok',layout);
 }
});

test('installation checks reject changed name, label, value and internal-link colors without executing any public source',()=>{
 const f=fixture(config({topBackground:'#111111'})),original=f.slot.content;
 const mutations=[
  source=>source.replace('class="dan-pu-profile-label" style="color:#3366cc;','class="dan-pu-profile-label" style="color:#ff0000;'),
  source=>source.replace('class="dan-pu-profile-details" style="margin-top:6px;color:#6854a4;','class="dan-pu-profile-details" style="margin-top:6px;color:#ff0000;'),
  source=>source.replace('<span style="font-weight:600;color:#246342;">Alma mater:', '<span style="font-weight:600;color:#ff0000;">Alma mater:'),
  source=>source.replace('<span style="font-weight:600;color:#246342;">Pesquisa', '<span style="font-weight:600;color:#ff0000;">Pesquisa'),
  source=>source.replace('<span style="color:#6854a4;">Washington</span>','Washington'),
  source=>source.replace('<span style="color:#6854a4;">MIT</span>','<span style="color:#ff0000;">MIT</span>'),
  source=>source.replace('<strong style="font-weight:600;color:#246342;">Estatutos:', '<strong style="font-weight:600;color:#ff0000;">Estatutos:'),
  source=>source.replace('<strong style="font-weight:600;color:#246342;">Data de criação', '<strong style="font-weight:600;color:#ff0000;">Data de criação'),
 ];
 for(const mutate of mutations){f.slot.content=mutate(original);assert.notEqual(f.slot.content,original);assert.equal(status(f),'different');}
});

test('colored snapshots retain matching account and status proofs while pending labels keep automatic colors independent',()=>{
 for(const labelColor of ['','#246342']){
  const c=config({labelColor,topBackground:'#111111'}),f=fixture(c),prepared=dashboardConfig(c),now='2026-10-15T14:42:00.000Z',first='2007-08-20T00:00:00Z';
  const state={config:{user:c.user,timeZone:c.timeZone},capturedAt:now,statistics:{user:c.user,metrics:{edits:42,earliestRegistration:first},registrationCoverage:{version:1,user:c.user,checkedAt:now,globalRegistration:first,accounts:[{registration:first}],complete:true},userGroups:{version:1,user:c.user,project:'pt.wikipedia.org',checkedAt:now,groups:['*','autoconfirmed','rollbacker','user']}}};
  const presentation={...prepared,now};
  f.slot.content='<templatestyles src="'+f.plan.stylesTitle+'" />'+Layout.compose(Cards.wikitext(state.statistics,null,presentation),Activity.wikitext(state,presentation),prepared.appearance,Header.wikitext(state,presentation));
  assert.equal(status(f),'ok',labelColor||'automatic labels');
  assert.match(f.slot.content,/data-perfilwiki-account-created=/);assert.match(f.slot.content,/data-perfilwiki-user-groups=/);
  f.slot.content=f.slot.content.replace('20 de agosto de 2007','21 de agosto de 2007');assert.equal(status(f),'different');
  assert.equal(status(fixture(c)),'ok','pending state with '+(labelColor||'automatic labels'));
 }
});
