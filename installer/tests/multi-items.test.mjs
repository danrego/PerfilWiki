import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialConfig,dashboardConfig,profileSnippet,cardsSnippet,activitySnippet,validateConfig} from '../src/model.mjs';
import Activity from '../../src/ActivityView.js';
import Configuration from '../../src/Configuration.js';
import {installationPlan,inspectInstallation} from '../src/installation-check.mjs';

const user='Marina Exemplo';
function config() {
 const value={...createInitialConfig(),user,timeZone:'America/New_York',displayName:'Marina',location:'[[Washington, DC]]',customFields:[{label:'Alma mater',values:['[[Universidade George Washington|GWU]]','[[Instituto de Tecnologia de Massachusetts|MIT]]'],layout:'inline',separator:'pipe',placement:'top'}]};
 Object.assign(value.appearance,{showLocalTime:true,nameFontSize:32,profilePlacements:{...value.appearance.profilePlacements,name:'top',location:'top'}});
 return value;
}
function inspect(selected,text=profileSnippet(selected)) {
 const plan=installationPlan(selected),pages=new Map([[plan.profileTitle,{title:plan.profileTitle,contentmodel:'wikitext',revisions:[{slots:{main:{content:text}}}]}]]);
 return inspectInstallation(plan,pages,{files:[]}).find(row=>row.id==='profile').status;
}

test('multi-item groups and the selected name size reach the real configuration without changing metrics',()=>{
 const selected=config(),prepared=dashboardConfig(selected);
 assert.deepEqual(prepared.customFields,selected.customFields);
 const actual=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:prepared});
 assert.deepEqual(actual.customFields,prepared.customFields);assert.equal(actual.appearance.nameFontSize,32);
 const base=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:{user,timeZone:selected.timeZone}});
 assert.deepEqual(actual.metrics,base.metrics);
 const legacy={...selected,customFields:[{label:'Alma mater',value:'[[Universidade George Washington|GWU]]',placement:'cards'}]};
 assert.deepEqual(dashboardConfig(legacy).customFields,legacy.customFields);
});

test('the full snippet adds one real top header above the integrated panels with grouped links and a dated local clock',()=>{
 const selected=config(),text=profileSnippet(selected);
 assert.equal((text.match(/id="dan-pu-profile-header"/g)||[]).length,1);
 assert.ok(text.indexOf('id="dan-pu-profile-header"')<text.indexOf('id="dan-pu-ritmo"'));
 assert.ok(text.includes(Activity.customFieldMarkup(selected.customFields[0],true)));
 assert.match(text,/font-size:32px/);
 assert.match(text,/data-perfilwiki-timezone="America\/New(?:_|&#95;)York"/);
 assert.match(text,/title="Horário salvo em /);
 assert.match(text,/&#124;/);
 assert.equal(inspect(selected,text),'ok');
 for(const change of [
  source=>source.replace(/data-perfilwiki-timezone="America\/New(?:_|&#95;)York"/,'data-perfilwiki-timezone="UTC"'),
  source=>source.replace('data-field-layout="inline"','data-field-layout="bullets"'),
  source=>source.replace('Universidade George Washington','Universidade diferente'),
  source=>source.replace('data-perfilwiki-profile-top="true"','data-perfilwiki-profile-top="false"'),
 ]) assert.equal(inspect(selected,change(text)),'different');
});

test('each group arrangement and separator survive preparation and export with bounded item counts',()=>{
 for(const layout of ['inline','lines','bullets'])for(const separator of ['pipe','dot','space']) {
  const selected=config();Object.assign(selected.customFields[0],{layout,separator});
  assert.equal(dashboardConfig(selected).customFields[0].layout,layout);
  assert.equal(dashboardConfig(selected).customFields[0].separator,separator);
  assert.ok(profileSnippet(selected).includes(Activity.customFieldMarkup(selected.customFields[0],true)));
  assert.equal(inspect(selected),'ok');
 }
 const selected=config();selected.customFields[0].values=Array.from({length:8},()=> '🧩'.repeat(160));
 assert.equal(validateConfig(selected).valid,true);
 selected.customFields[0].values.push('');assert.ok(validateConfig(selected).errors.customFields);
});

test('one-panel snippets retain a single real top header and omit hidden values from presentation',()=>{
 for(const [showCards,showActivity]of[[true,false],[false,true]]) {
  const selected=config();Object.assign(selected.appearance,{showCards,showActivity});
  selected.customFields.push({label:'Oculto',values:['Texto omitido'],placement:'hidden'});
  for(const text of [profileSnippet(selected),showCards?cardsSnippet(selected):activitySnippet(selected)]) {
   assert.equal((text.match(/id="dan-pu-profile-header"/g)||[]).length,1);
   assert.doesNotMatch(text,/Texto omitido/);
   assert.equal((text.match(/Gostou deste painel\?/g)||[]).length,1);
  }
 }
});


test('all selected placement combinations are checked across top, nested cards and activity scopes',()=>{
 for(const placement of ['inherit','activity','cards','both','hidden','top','top-activity','top-cards','all']) {
  const selected=config();selected.customFields[0].placement=placement;
  assert.equal(inspect(selected),'ok',placement);
 }
});

test('a label-only group immediately reaches the preview and export without an empty list or colon',()=>{
 const selected=config();selected.customFields.push({label:'Pesquisa',values:[''],layout:'bullets',separator:'pipe',placement:'top'});
 assert.equal(validateConfig(selected).valid,true);
 const rendered=Activity.profileMarkup({config:{user,timeZone:selected.timeZone}},{...selected,now:'2026-10-15T12:00:00Z'},false,'top');
 assert.match(rendered,/Alma mater/);assert.match(rendered,/Universidade_George_Washington/);
 assert.match(rendered,/Pesquisa/);
 const field=Activity.customFieldMarkup(selected.customFields[1],false);
 assert.match(field,/>Pesquisa<\/span>/);assert.doesNotMatch(field,/<ul|Pesquisa:/);
 assert.ok(profileSnippet(selected).includes(Activity.customFieldMarkup(selected.customFields[1],true)));
 assert.equal(inspect(selected),'ok');
});


test('separate snippets attach the default top profile only to the first visible block',()=>{
 for(const layout of ['together','separate'])for(const blockOrder of ['cards-first','activity-first']){
  const selected=config();Object.assign(selected.appearance,{layout,blockOrder,profilePlacement:'top'});
  const cards=cardsSnippet(selected),activity=activitySnippet(selected);
  const count=source=>(source.match(/id="dan-pu-profile-header"/g)||[]).length;
  assert.equal(count(cards),blockOrder==='cards-first'?1:0);assert.equal(count(activity),blockOrder==='activity-first'?1:0);
  const combined=blockOrder==='cards-first'?cards+'\nMeu texto\n'+activity:activity+'\nMeu texto\n'+cards;
  assert.equal(count(combined),1);assert.equal(inspect(selected,combined),'ok');
 }
});
