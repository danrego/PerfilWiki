import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialConfig, validateConfig, dashboardConfig, profileSnippet, cardsSnippet, activitySnippet, moveMetricTo, footerOwner } from '../src/model.mjs';
import Appearance from '../../src/Appearance.js';
import Configuration from '../../src/Configuration.js';
import Cards from '../../src/CardsView.js';
import Activity from '../../src/ActivityView.js';
import Core from '../../src/PageviewsCore.js';
const user='Editora Exemplo', now='2026-10-15T14:42:00Z';
function ready(patch={}) {const config={...createInitialConfig(),user,timeZone:'UTC'};Object.assign(config.appearance,patch);return config;}
function state() {const config={user,timeZone:'UTC',project:'pt.wikipedia.org'};const entries=[[1,1,0,'Exemplo','2026-10-14T12:00:00Z',0]];return {config,capturedAt:now,statistics:{user,metrics:{edits:1}},activity:{complete:true,entries,identity:config,summary:Core.summarize(entries,{config,now})},pageviews:null};}

test('the invitation occurs once across every installed visibility and block order',()=>{
 for(const blockOrder of ['cards-first','activity-first']) for(const [showCards,showActivity] of [[true,true],[true,false],[false,true]]) {
  const config=ready({blockOrder,showCards,showActivity});
  assert.equal(footerOwner(config.appearance),Appearance.footerOwner(config.appearance));
  for(const markup of [profileSnippet(config),cardsSnippet(config)+'\n'+activitySnippet(config)]) assert.equal((markup.match(/Gostou deste painel\?/g)||[]).length,1,blockOrder+showCards+showActivity);
  const options={user,now,appearance:config.appearance};const rendered=Cards.html(state().statistics,state().activity,options)+Activity.html(state(),options);
  assert.equal((rendered.match(/Gostou deste painel\?/g)||[]).length,1);
 }
});

test('the generated group and actual configuration preserve each chosen block order',()=>{
 for(const blockOrder of ['cards-first','activity-first']) {
  const config=ready({blockOrder,layout:'together'});const markup=profileSnippet(config);
  assert.match(markup,/data-perfilwiki-group="true" data-perfilwiki-user="Editora Exemplo"/);
  assert.equal(markup.indexOf('id="dan-pu-estatisticas"')<markup.indexOf('id="dan-pu-ritmo"'),blockOrder==='cards-first');
  const runtime=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:dashboardConfig(config)});
  assert.equal(runtime.appearance.blockOrder,blockOrder);
  config.appearance.layout='separate';assert.doesNotMatch(profileSnippet(config),/data-perfilwiki-group=/);
 }
});

test('highlight selection and arbitrary colors reach initial markup and runtime safely',()=>{
 const config=ready({highlightedMetrics:['edits','activeDays'],highlightColor:'#000000',metrics:['tenure','edits','activeDays']});
 assert.equal(validateConfig(config).valid,true);
 const runtime=Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:dashboardConfig(config)});
 assert.deepEqual(runtime.appearance.highlightedMetrics,['edits','activeDays']);
 assert.equal(runtime.appearance.highlightColor,'#000000');
 const markup=cardsSnippet(config);assert.match(markup,/background:#000000;color:#ffffff/);assert.match(markup,/background:#ffffff;color:#202122/);
 const another=ready();config.appearance.highlightedMetrics.push('thanks');assert.deepEqual(another.appearance.highlightedMetrics,['tenure']);
 for(const patch of [{highlightedMetrics:['unknown']},{highlightedMetrics:['edits','edits']},{highlightColor:'red'},{blockOrder:'random'}]) assert.equal(validateConfig(ready(patch)).valid,false);
});

test('position moves support direct jumps and preserve every other counter in order',()=>{
 const original=['tenure','edits','thanks','activeDays'];
 assert.deepEqual(moveMetricTo(original,'activeDays',0),['activeDays','tenure','edits','thanks']);
 assert.deepEqual(moveMetricTo(original,'tenure',3),['edits','thanks','activeDays','tenure']);
 assert.deepEqual(moveMetricTo(original,'edits',2),['tenure','thanks','edits','activeDays']);
 assert.deepEqual(original,['tenure','edits','thanks','activeDays']);
 for(const [id,target] of [['missing',1],['edits',-1],['edits',4],['edits',1.5]]) assert.deepEqual(moveMetricTo(original,id,target),original);
});
