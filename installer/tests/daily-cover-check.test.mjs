import test from 'node:test';
import assert from 'node:assert/strict';
import ProfileText from '../../src/ProfileText.js';
import DailyCover from '../../src/DailyCover.js';
import {activationSnippet,createInitialConfig,dashboardConfig,profileSnippet,RELEASE_VERSION} from '../src/model.mjs';
import {inspectInstallation,installationPlan} from '../src/installation-check.mjs';

function config(patch={}) {
  const initial=createInitialConfig();
  return {...initial,user:'Marina Exemplo',timeZone:'UTC',...patch,appearance:{...initial.appearance,coverSource:'daily',...patch.appearance}};
}
function source(selected) { return profileSnippet(selected); }
function status(selected,markup) {
  const plan=installationPlan(selected),page=(contentmodel,text)=>({contentmodel,revisions:[{slots:{main:{content:text}}}]}),release={version:RELEASE_VERSION,files:[{destination:plan.programTitle,text:'/* local test program */'},{destination:plan.stylesTitle,text:'.local {color:blue;}'}]};
  const pages=new Map([[plan.activationTitle,page('javascript',activationSnippet(selected))],[plan.profileTitle,page('wikitext',markup)],...release.files.map(file=>[file.destination,page(file.destination===plan.stylesTitle?'sanitized-css':'javascript',file.text)])]);
  return inspectInstallation(plan,pages,release).find(row=>row.id==='profile').status;
}
const proof={version:1,date:'2026-10-01',filename:'Commons daily image.jpg',checkedAt:'2026-10-01T12:00:00.000Z',artist:'Fotógrafa Exemplo',license:'CC BY-SA 4.0'};
function pending(selected) {return ProfileText.coverMarkup(dashboardConfig(selected),true);}
function completed(selected,record=proof) {return ProfileText.coverMarkup({...dashboardConfig(selected),dailyCover:record},true);}
function saved(selected,record=proof) {return source(selected).replace(pending(selected),completed(selected,record));}
function quoted(value) {return value.replaceAll('&','&amp;').replaceAll('"','&quot;');}
function rawProof(selected,record) {return source(selected).replace('data-perfilwiki-cover-source="daily"','data-perfilwiki-cover-source="daily" data-perfilwiki-daily-cover="'+quoted(typeof record==='string'?record:JSON.stringify(record))+'"');}

test('the checker accepts the pending daily cover with no manual filename or with an inactive preserved filename',()=>{
  for(const coverImage of ['', 'Manual cover.jpg'])for(const layout of ['integrated','together','separate'])for(const panels of [{},{showCards:false},{showActivity:false}]) {
    const selected=config({coverImage,appearance:{layout,...panels}});
    assert.equal(status(selected,source(selected)),'ok',JSON.stringify({coverImage,layout,...panels}));
  }
});

test('a complete validated daily snapshot is accepted with exact Commons image, caption and credits',()=>{
  assert.ok(DailyCover.normalize(proof));
  for(const metadata of [proof,{version:1,date:proof.date,filename:proof.filename,checkedAt:proof.checkedAt}]) {
    const selected=config({coverImage:'Inactive manual.jpg'}),markup=saved(selected,metadata);
    assert.match(markup,/\[\[Ficheiro:Commons daily image\.jpg\|1200px/);
    assert.equal(status(selected,markup),'ok');
  }
});

test('malformed, future and foreign proof cannot masquerade as an accepted pending cover',()=>{
  const selected=config();
  for(const record of ['{bad json',null,[],{}, {...proof,version:2},{...proof,date:'2999-01-01'},{...proof,checkedAt:'2999-01-01T00:00:00.000Z'},{...proof,filename:'https://example.org/photo.jpg'},{...proof,filename:'Other_photo.jpg'},{...proof,artist:'<b>Editor</b>'},{...proof,user:'Outra pessoa'},{...proof,project:'en.wikipedia.org'}]) {
    assert.equal(status(selected,rawProof(selected,record)),'different',JSON.stringify(record));
  }
});

test('valid proof cannot excuse an altered filename, source, caption, link or image',()=>{
  const selected=config(),valid=saved(selected);
  const mutations=[
    text=>text.replace('data-perfilwiki-cover="Commons daily image.jpg"','data-perfilwiki-cover="Other.jpg"'),
    text=>text.replace('data-perfilwiki-cover-source="daily"','data-perfilwiki-cover-source="manual"'),
    text=>text.replace('[[Ficheiro:Commons daily image.jpg','[[Ficheiro:Other.jpg'),
    text=>text.replace('Imagem do dia do Commons · 01/10/2026','Imagem escolhida pelo editor'),
    text=>text.replace('Fotógrafa Exemplo','Autor diferente'),
    text=>text.replace('CC BY-SA 4.0','CC0'),
    text=>text.replace('Ver arquivo e créditos','Outro destino'),
    text=>text.replace('https://commons.wikimedia.org/wiki/File:Commons_daily_image.jpg','https://example.org/image'),
  ];
  for(const mutation of mutations)assert.equal(status(selected,mutation(valid)),'different');
});

test('daily cover must occur exactly once inside its owned header before its single profile slot',()=>{
  const selected=config(),original=source(selected),cover=pending(selected);
  const mutations=[
    text=>text.replace(cover,''),
    text=>text.replace(cover,cover+cover),
    text=>cover+text,
    text=>text.replace(cover,'')+cover,
    text=>text.replace(cover,'').replace('<div class="dan-pu-top-profile-slot">','<div class="dan-pu-top-profile-slot">'+cover),
    text=>text.replace('<div class="dan-pu-top-profile-slot">','<div class="dan-pu-top-profile-slot"></div><div class="dan-pu-top-profile-slot">'),
    text=>text.replace('class="dan-pu-profile-cover"','class="dan-pu-profile-cover" class="dan-pu-profile-cover"'),
    text=>text.replace('data-perfilwiki-cover-source="daily"','data-perfilwiki-cover-source="daily" data-perfilwiki-cover-source="daily"'),
    text=>text.replace(/(<div id="dan-pu-profile-header"[^>]*data-perfilwiki-user=")Marina Exemplo"/,'$1Outra pessoa"'),
  ];
  for(const [index,mutation] of mutations.entries())assert.equal(status(selected,mutation(original)),'different','mutation '+index);
  assert.equal(status(selected,'<!-- '+cover+' -->\n'+original+'\n<nowiki>'+cover+'</nowiki>'),'ok','literal examples are not active duplicates');
});

test('manual and absent covers preserve their prior checks and cannot accept a daily proof',()=>{
  const manual=config({coverImage:'Manual cover.jpg',appearance:{coverSource:'manual'}});
  const empty=config({appearance:{coverSource:'manual'}});
  assert.equal(status(manual,source(manual)),'ok');assert.equal(status(empty,source(empty)),'ok');
  assert.equal(status(manual,source(manual).replace('data-perfilwiki-cover-source="manual"','data-perfilwiki-cover-source="manual" data-perfilwiki-daily-cover="'+quoted(JSON.stringify(proof))+'"')),'different');
  assert.equal(status(manual,source(manual).replace('data-perfilwiki-cover-source="manual"','data-perfilwiki-cover-source="daily"')),'different');
  const daily=pending(config());
  assert.equal(status(empty,source(empty).replace('<div class="dan-pu-top-profile-slot">',daily+'<div class="dan-pu-top-profile-slot">')),'different');
});
