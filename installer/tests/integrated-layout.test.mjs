import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialConfig, profileSnippet, installFiles, dashboardConfig, DEFAULT_APPEARANCE,
} from '../src/model.mjs';
import Layout from '../../src/LayoutView.js';
import Activity from '../../src/ActivityView.js';
import Cards from '../../src/CardsView.js';
import Core from '../../src/PageviewsCore.js';

const user='Editora Exemplo',now='2026-10-15T14:42:00Z';
function config(patch={}) { const value={...createInitialConfig(),user,timeZone:'UTC'};Object.assign(value.appearance,patch);return value; }
function bounds(markup,id) {
  const start=markup.indexOf('id="'+id+'"');assert.ok(start>=0,id);
  const from=markup.lastIndexOf('<div',start),openingEnd=markup.indexOf('>',start)+1;
  const tokens=/<\/?div\b[^<>]*>/g;tokens.lastIndex=openingEnd;
  let depth=1,match;while((match=tokens.exec(markup))) {depth+=/^<\//.test(match[0])?-1:1;if(!depth)return {start:from,end:tokens.lastIndex};}
  assert.fail('Unclosed '+id);
}
function inside(outer,inner) {return outer.start<inner.start&&inner.end<=outer.end;}

test('the default full install nests one cards block inside the activity slot with one profile and invitation',()=>{
  const selected=config();
  assert.equal(DEFAULT_APPEARANCE.layout,'integrated');
  const markup=profileSnippet(selected);
  const activity=bounds(markup,'dan-pu-ritmo'),slot=bounds(markup,'dan-pu-integrated-cards'),cards=bounds(markup,'dan-pu-estatisticas');
  assert.ok(inside(activity,slot));assert.ok(inside(slot,cards));
  assert.equal((markup.match(/class="dan-pu-profile-label"/g)||[]).length,1);
  assert.equal((markup.match(/Gostou deste painel\?/g)||[]).length,1);
  assert.equal((markup.match(/data-perfilwiki-metric=/g)||[]).length,8);
  assert.deepEqual(installFiles(selected).map(file=>file.id),['activation','profile']);
});

test('a fresh configuration and omitted placement export the profile once above the dashboard by default',()=>{
 for(const [showCards,showActivity]of[[true,true],[true,false],[false,true]]){
  const selected=config({showCards,showActivity});selected.displayName='Marina Pesquisa';selected.location='[[Rio de Janeiro]]';selected.customFields=[{label:'Área',value:'[[História]]'}];
  assert.equal(DEFAULT_APPEARANCE.profilePlacement,'top');assert.equal(selected.appearance.profilePlacement,'top');
  delete selected.appearance.profilePlacement;
  assert.equal(dashboardConfig(selected).appearance.profilePlacement,'top');
  const markup=profileSnippet(selected),header=bounds(markup,'dan-pu-profile-header');
  assert.equal((markup.match(/id="dan-pu-profile-header"/g)||[]).length,1);
  assert.equal((markup.match(/class="dan-pu-profile-label"/g)||[]).length,1);
  assert.match(markup.slice(header.start,header.end),/Marina Pesquisa/);assert.match(markup.slice(header.start,header.end),/Rio de Janeiro/);
  assert.match(markup.slice(header.start,header.end),/História/);
  for(const id of [showCards?'dan-pu-estatisticas':null,showActivity?'dan-pu-ritmo':null].filter(Boolean))assert.ok(header.end<=bounds(markup,id).start);
 }
});

test('the actual renderers and initial snippets use the same nesting and keep explicit per-field areas',()=>{
  const selected=config({profilePlacements:{name:'activity',location:'cards',accountCreated:'hidden',photo:'hidden'}});
  selected.displayName='Marina';selected.location='[[Rio de Janeiro|Rio]]';
  const entries=[[1,2,0,'Exemplo','2026-10-14T12:00:00Z',0]],activity={complete:true,entries,summary:Core.summarize(entries,{config:{user,timeZone:'UTC'},now})};
  const state={config:{user,timeZone:'UTC'},capturedAt:now,activity,statistics:{user,metrics:{edits:1}},pageviews:null};
  const options={...selected,now};
  for(const markup of [profileSnippet(selected),Layout.compose(Cards.html(state.statistics,activity,options),Activity.html(state,options),selected.appearance),Layout.compose(Cards.wikitext(state.statistics,activity,options),Activity.wikitext(state,options),selected.appearance)]) {
    const slot=bounds(markup,'dan-pu-integrated-cards'),cards=bounds(markup,'dan-pu-estatisticas');
    assert.ok(inside(slot,cards));
    const cardText=markup.slice(cards.start,cards.end);
    assert.match(cardText,/dan-pu-profile-location/);assert.doesNotMatch(cardText,/dan-pu-profile-label/);
    assert.equal((markup.match(/class="dan-pu-profile-label"/g)||[]).length,1);
    assert.equal((markup.match(/Gostou deste painel\?/g)||[]).length,1);
  }
});

test('integrating ignores but preserves the previous block order and switching back restores that order',()=>{
  for(const blockOrder of ['cards-first','activity-first']) {
    const selected=config({blockOrder});
    assert.ok(inside(bounds(profileSnippet(selected),'dan-pu-ritmo'),bounds(profileSnippet(selected),'dan-pu-estatisticas')));
    assert.equal(dashboardConfig(selected).appearance.blockOrder,blockOrder);
    selected.appearance.layout='together';
    const grouped=profileSnippet(selected);
    assert.equal(grouped.indexOf('id="dan-pu-estatisticas"')<grouped.indexOf('id="dan-pu-ritmo"'),blockOrder==='cards-first');
    assert.doesNotMatch(grouped,/id="dan-pu-integrated-cards"/);
    selected.appearance.layout='integrated';
    assert.equal(dashboardConfig(selected).appearance.blockOrder,blockOrder);
  }
});

test('one visible panel has no empty integrated slot and keeps its single profile and invitation',()=>{
  for(const [showCards,showActivity] of [[true,false],[false,true]]) {
    const markup=profileSnippet(config({showCards,showActivity}));
    assert.doesNotMatch(markup,/id="dan-pu-integrated-cards"/);
    assert.equal((markup.match(/class="dan-pu-profile-label"/g)||[]).length,1);
    assert.equal((markup.match(/Gostou deste painel\?/g)||[]).length,1);
  }
});
