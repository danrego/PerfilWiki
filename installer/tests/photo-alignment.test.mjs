import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import Appearance from '../../src/Appearance.js';
import Configuration from '../../src/Configuration.js';
import Activity from '../../src/ActivityView.js';
import {activationSnippet, activitySnippet, cardsSnippet, createInitialConfig, dashboardConfig, DEFAULT_APPEARANCE, profileSnippet, validateConfig} from '../src/model.mjs';
import {inspectInstallation, installationPlan} from '../src/installation-check.mjs';

const user = 'Marina Exemplo';
function config(appearance = {}) {
  const initial = createInitialConfig();
  return {...initial, user, timeZone:'UTC', photo:'File:Portrait_example.jpg', appearance:{...initial.appearance, ...appearance}};
}
function resolve(input) { return Configuration.resolve({config:{get:()=>user}}, {PerfilWikiConfig:input}); }
function inspect(input, mutate = text => text) {
  const plan = installationPlan(input);
  const pages = new Map([[plan.profileTitle, {contentmodel:'wikitext', revisions:[{slots:{main:{content:mutate(profileSnippet(input))}}}]}]]);
  return inspectInstallation(plan, pages, {files:[]}).find(row=>row.id==='profile').status;
}

test('photo alignment defaults left in older and fresh configurations independently of text and counters', () => {
  assert.equal(DEFAULT_APPEARANCE.photoAlignment,'left');
  assert.equal(Appearance.defaults.photoAlignment,'left');
  const legacy = config({nameAlignment:'center',alignment:'right'});
  delete legacy.appearance.photoAlignment;
  assert.equal(validateConfig(legacy).valid,true);
  assert.equal(dashboardConfig(legacy).appearance.photoAlignment,'left');
  assert.equal(resolve({user,timeZone:'UTC'}).appearance.photoAlignment,'left');
  assert.equal(Appearance.normalize({photoAlignment:undefined}).photoAlignment,'left');
  assert.match(profileSnippet(legacy),/data-photo-align="left"/);
});

test('photo alignment rejects unsupported and injectable values before preview or export', () => {
  for(const photoAlignment of ['', 'LEFT', ' left', 'right ', 'justify', 'left;display:none', null, false, 1, [], {}]) {
    const selected=config({photoAlignment});
    assert.equal(validateConfig(selected).valid,false,JSON.stringify(photoAlignment));
    assert.throws(()=>dashboardConfig(selected));
    assert.throws(()=>profileSnippet(selected));
    assert.throws(()=>Appearance.normalize({photoAlignment}));
    assert.throws(()=>resolve({user,timeZone:'UTC',appearance:{photoAlignment}}));
  }
});

test('photo alignment survives initial markup and guarded loader without changing metric identity', () => {
  const ordinary=resolve(dashboardConfig(config()));
  for(const photoAlignment of ['left','center','right']) {
    const selected=config({photoAlignment,nameAlignment:'right',alignment:'center',profilePlacements:{photo:'all'}});
    const sandbox={window:{}};
    vm.runInNewContext(activationSnippet(selected),sandbox);
    assert.equal(sandbox.window.PerfilWikiConfig.appearance.photoAlignment,photoAlignment);
    const prepared=dashboardConfig(selected), runtime=resolve(prepared);
    assert.equal(runtime.appearance.photoAlignment,photoAlignment);
    assert.equal(runtime.appearance.nameAlignment,'right');
    assert.equal(runtime.appearance.alignment,'center');
    assert.deepEqual(runtime.metrics,ordinary.metrics);
    assert.equal(Object.hasOwn(runtime.metrics,'photoAlignment'),false);
    for(const markup of [profileSnippet(selected), cardsSnippet(selected), activitySnippet(selected)]) {
      if(markup.includes('dan-pu-profile-content')) assert.match(markup,new RegExp('data-photo-align="'+photoAlignment+'"'));
    }
    for(const scope of ['top','cards','activity']) {
      const markup=Activity.profileMarkup({config:{user}},prepared,true,scope);
      assert.match(markup,new RegExp('data-photo-align="'+photoAlignment+'"'));
      assert.match(markup,/data-perfilwiki-photo="Portrait example.jpg"/);
    }
    assert.equal(inspect(selected),'ok');
  }
});

test('installation checking rejects an altered, missing or repeated photo alignment in each profile scope', () => {
  const selected=config({photoAlignment:'right',profilePlacements:{photo:'all'}});
  for(const scopeIndex of [0,1,2]) for(const replacement of ['data-photo-align="left"','','data-photo-align="right" data-photo-align="left"']) {
    assert.equal(inspect(selected,text=>{
      let index=0;
      return text.replace(/data-photo-align="right"/g,match=>index++===scopeIndex?replacement:match);
    }),'different',`${scopeIndex}: ${replacement}`);
  }
});

test('installation checking requires configured photo size and shape without accepting altered attributes',()=>{
 for(const photoSize of [64,96,128,160,200])for(const photoShape of ['square','round']){
  const selected=config({photoSize,photoShape,profilePlacements:{photo:'all'}});
  assert.equal(inspect(selected),'ok');
  assert.equal(inspect(selected,text=>text.replace('data-photo-size="'+photoSize+'"','data-photo-size="12"')),'different');
  assert.equal(inspect(selected,text=>text.replace('data-photo-shape="'+photoShape+'"','data-photo-shape="invalid"')),'different');
 }
});
