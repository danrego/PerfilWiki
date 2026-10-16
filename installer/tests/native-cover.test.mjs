import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import Native from '../../src/NativeDailyCover.js';
import Text from '../../src/ProfileText.js';
import Daily from '../../src/DailyCover.js';
import {activationSnippet,activitySnippet,cardsSnippet,createInitialConfig,dashboardConfig,importChoices,profileSnippet,RELEASE_VERSION,validateConfig} from '../src/model.mjs';
import {inspectInstallation,installationPlan} from '../src/installation-check.mjs';

const config=(appearance={})=>{const initial=createInitialConfig();return {...initial,user:'Marina Exemplo',timeZone:'UTC',coverImage:'Preserved manual.jpg',appearance:{...initial.appearance,coverSource:'wiki-daily',...appearance}};};
const count=(text,pattern)=>(text.match(pattern)||[]).length;
const plain=value=>JSON.parse(JSON.stringify(value));
function fixture(selected=config()) {
 const plan=installationPlan(selected);
 const release={version:RELEASE_VERSION,files:[{destination:plan.programTitle,text:'/* PerfilWiki '+RELEASE_VERSION+' */\nvar example=true;'},{destination:plan.stylesTitle,text:'.example { color: #3366cc; }'}]};
 const page=(title,model,text)=>({title,contentmodel:model,revisions:[{slots:{main:{content:text}}}]});
 const pages=new Map([[plan.activationTitle,page(plan.activationTitle,'javascript',activationSnippet(selected))],[plan.profileTitle,page(plan.profileTitle,'wikitext',profileSnippet(selected))],...release.files.map(file=>[file.destination,page(file.destination,file.destination===plan.stylesTitle?'sanitized-css':'javascript',file.text)])]);
 const profile=pages.get(plan.profileTitle).revisions[0].slots.main;
 return {plan,release,pages,profile,status:()=>inspectInstallation(plan,pages,release).find(row=>row.id==='profile').status};
}

test('native cover selection exports and imports unchanged while keeping the optional manual filename',()=>{
 const selected=config(),prepared=dashboardConfig(selected);
 assert.equal(validateConfig(selected).valid,true);assert.equal(prepared.appearance.coverSource,'wiki-daily');assert.equal(prepared.coverImage,'Preserved manual.jpg');
 const restored=importChoices(JSON.stringify({version:RELEASE_VERSION,...selected}));
 assert.equal(restored.appearance.coverSource,'wiki-daily');assert.equal(restored.coverImage,'Preserved manual.jpg');
 const context={window:{}};vm.runInNewContext(activationSnippet(selected),context);
 assert.deepEqual(plain(context.window.PerfilWikiConfig),plain(prepared));
 assert.doesNotMatch(activationSnippet(selected),/daily-cover-v1|dailyCover|#ifexist|action=(?:edit|purge)/);
});

test('all initial layouts and single-block choices install exactly one dynamic native cover',()=>{
 for(const layout of ['integrated','together','separate']) for(const blockOrder of ['cards-first','activity-first']) for(const single of [null,'cards','activity']) {
  const selected=config({layout,blockOrder,showCards:single!=='activity',showActivity:single!=='cards'}),markup=profileSnippet(selected);
  assert.equal(count(markup,/data-perfilwiki-cover-source="wiki-daily"/g),1);
  assert.equal(count(markup,/\{\{#ifexist:/g),1);assert.ok(markup.includes(Native.transclusion()));
  assert.equal(count(markup,/id="dan-pu-profile-header"/g),1);
  assert.ok(markup.indexOf('dan-pu-profile-cover-native-body')<markup.indexOf('dan-pu-top-profile-slot'));
  assert.doesNotMatch(markup,/\[\[Ficheiro:Preserved|data:image|Prévia ilustrativa|data-perfilwiki-daily-cover|fetch\(|<script/);
  const fragments=cardsSnippet(selected)+'\n'+activitySnippet(selected);
  assert.equal(count(fragments,/data-perfilwiki-cover-source="wiki-daily"/g),layout==='integrated'&&!single?0:1);
 }
});

test('native wiki output stays date-selected even when stale manual and Commons daily metadata are present',()=>{
 const prepared=dashboardConfig(config()),now='2026-10-15T14:42:00.000Z';
 const dailyCover=Daily.fromFeed({image:{title:'File:Old Commons image.jpg'}},'2026-10-14',now);
 const native=Text.coverMarkup({...prepared,dailyCover,now},true);
 assert.ok(native.includes(Native.wikitext()));assert.ok(native.includes(Native.caption(true)));
 assert.doesNotMatch(native,/Preserved manual|Old Commons image|data-perfilwiki-daily-cover|14\/10\/2026|Special:FilePath/);
 const withoutProof=Text.coverMarkup({...prepared,now},true);assert.equal(native,withoutProof);
 assert.equal(Text.coverInfo({...prepared,dailyCover,now}).native,true);
});

test('native local illustration remains offline and is excluded from all prepared wiki markup',()=>{
 const prepared=dashboardConfig(config()),local=Text.coverMarkup({...prepared,localCoverPreview:true},false),output=profileSnippet(config());
 assert.match(local,/data:image\/svg\+xml,/);assert.match(local,/Prévia ilustrativa/);
 assert.match(local,/class="imagem-destaque"/);assert.match(local,/class="mw-file-description"/);
 assert.doesNotMatch(local,/src="(?:https?:|\/\/)|href="https?:|\{\{#ifexist|<iframe|<script/);
 assert.doesNotMatch(output,/data:image|Descrição ilustrativa|perfilwiki-local-daily-cover-credit/);
 const unresolved=Text.coverMarkup(prepared,false);
 assert.match(unresolved,/dan-pu-profile-cover-pending/);assert.doesNotMatch(unresolved,/<img|src=""|\{\{#ifexist/);
});

test('installation checker accepts the canonical native calendar cover across all layouts and single-block choices',()=>{
 for(const layout of ['integrated','together','separate']) for(const blockOrder of ['cards-first','activity-first']) for(const single of [null,'cards','activity']) {
  const current=fixture(config({layout,blockOrder,showCards:single!=='activity',showActivity:single!=='cards'}));
  assert.equal(current.status(),'ok',JSON.stringify({layout,blockOrder,single}));
  assert.ok(inspectInstallation(current.plan,current.pages,current.release).every(row=>row.status==='ok'));
 }
});

test('installation checker rejects a frozen image altered calendar attribution duplicate cover or forged proof',()=>{
 const transforms=[
  text=>text.replace(Native.wikitext(),'[[Ficheiro:Frozen cover.jpg|1200px]]'),
  text=>text.replace('{{CURRENTDAY}}','15'),
  text=>text.replace('Wikipédia:Imagem em destaque/','Wikipédia:Outra página/'),
  text=>text.replace('min=1200|max=1200','min=400|max=800'),
  text=>text.replace('data-perfilwiki-cover-source="wiki-daily"','data-perfilwiki-cover-source="daily"'),
  text=>text.replace('data-perfilwiki-cover=""','data-perfilwiki-cover="Frozen cover.jpg"'),
  text=>text.replace('data-perfilwiki-cover-source="wiki-daily"','data-perfilwiki-cover-source="wiki-daily" data-perfilwiki-daily-cover="{}"'),
  text=>text.replace(Native.caption(true),'Imagem do dia sem arquivo ou créditos'),
  text=>text.replace(Native.wikitext(),'<!-- '+Native.wikitext()+' -->'),
  text=>text+Text.coverMarkup(dashboardConfig(config()),true),
 ];
 for(const transform of transforms) {
  const current=fixture();current.profile.content=transform(current.profile.content);
  assert.equal(current.status(),'different',transform.toString());
 }
});
