import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createInitialConfig,dashboardConfig,profileSnippet,RELEASE_VERSION} from '../src/model.mjs';
import {installationPlan,inspectInstallation} from '../src/installation-check.mjs';
const require=createRequire(import.meta.url);
const Activity=require('../../src/ActivityView.js'),Cards=require('../../src/CardsView.js'),Header=require('../../src/ProfileHeaderView.js'),Layout=require('../../src/LayoutView.js'),Core=require('../../src/PageviewsCore.js'),I18n=require('../../src/I18n.js');
const NOW='2026-10-14T12:00:00.000Z',USER='Marina Exemplo';
function config(language,extra={}) {
  const initial=createInitialConfig();
  return {...initial,user:USER,displayName:'Nome preservado',location:'[[Belo Horizonte|BH]]',photo:'Example portrait.jpg',customFields:[{label:'Alma mater',values:['[[UFMG]]','Texto preservado'],valueColors:['#112233',''],labelColor:'#552244',placement:'all'}],timeZone:'America/New_York',appearance:{...initial.appearance,language,showLocalTime:true,showAccountCreated:true,showUserGroups:true,profilePlacement:'all',profilePlacements:{...initial.appearance.profilePlacements,localTime:'all',photo:'all'},...extra}};
}
function profileStatus(c,source) {
  const plan=installationPlan(c),page={title:plan.profileTitle,contentmodel:'wikitext',revisions:[{slots:{main:{content:source}}}]};
  return inspectInstallation(plan,new Map([[plan.profileTitle,page]]),{version:RELEASE_VERSION,files:[]}).find(item=>item.id==='profile').status;
}
function snapshot(c) {
  const presentation={...dashboardConfig(c),now:NOW,savedAccountCreated:JSON.stringify({version:1,user:USER,timestamp:'2010-04-09T12:00:00.000Z',complete:true})};
  const entries=[[1,1,0,'Artigo preservado','2026-10-13T12:00:00.000Z',0]];
  const activity={complete:true,identity:{user:USER,project:'pt.wikipedia.org'},capturedAt:NOW,entries,summary:Core.summarize(entries,{now:NOW,config:{user:USER,timeZone:c.timeZone}})};
  const state={config:{user:USER,timeZone:c.timeZone},capturedAt:NOW,activity,pageviews:null,statistics:{user:USER,metrics:{edits:42},userGroups:{version:1,user:USER,project:'pt.wikipedia.org',checkedAt:NOW,groups:['autoconfirmed','extendedconfirmed','rollbacker']}}};
  return '<templatestyles src="'+presentation.stylesPage+'" />'+Layout.compose(c.appearance.showCards?Cards.wikitext(state.statistics,activity,presentation):'',c.appearance.showActivity?Activity.wikitext(state,presentation):'',c.appearance,Header.wikitext(state,presentation));
}

test('every language accepts its canonical pending profile metadata, clocks and covers in all layouts',()=>{
  for(const language of I18n.languages)for(const layout of ['integrated','together','separate'])for(const visibility of [{},{showCards:false},{showActivity:false}])for(const coverSource of ['manual','daily','wiki-daily']) {
    const c=config(language,{layout,coverSource,...visibility});
    assert.equal(profileStatus(c,profileSnippet(c)),'ok',[language,layout,coverSource,JSON.stringify(visibility)].join(' '));
  }
});

test('every language accepts proof-bearing saved account dates and statuses with independent field colors',()=>{
  for(const language of I18n.languages)for(const layout of ['integrated','together','separate']) {
    const c=config(language,{layout,labelColor:'#442266',informationColor:'#225544'}),source=snapshot(c);
    assert.equal(profileStatus(c,source),'ok',language+' '+layout);
    assert.ok(source.includes('Nome preservado'));
    assert.ok(source.includes('Texto preservado'));
    assert.ok(source.includes('Alma mater'));
    assert.ok(source.includes('data-perfilwiki-user-groups='));
    assert.ok(source.includes('data-perfilwiki-account-created='));
  }
});

test('locale checks still reject altered localized clocks, status text and foreign proof owners',()=>{
  for(const language of I18n.languages) {
    const c=config(language),source=snapshot(c);
    for(const change of [
      text=>text.replace(/(class="dan-pu-local-time"[^>]* title=")[^"]*"/,'$1Changed clock tooltip"'),
      text=>text.replace(/(<div class="dan-pu-user-groups"[^>]*>)[\s\S]*?<\/div>/,'$1Changed status</div>'),
      text=>text.replace(/(data-perfilwiki-user-groups="[^"]*?&quot;user&quot;:&quot;)Marina Exemplo/,'$1Outra pessoa'),
    ]) {
      const altered=change(source);assert.notEqual(altered,source,language);
      assert.equal(profileStatus(c,altered),'different',language);
    }
  }
});

test('Portuguese fallback status wording cannot pass a differently localized profile',()=>{
  const portuguese=snapshot(config('pt-BR'));
  const group=portuguese.match(/<div class="dan-pu-user-groups"[^>]*>[\s\S]*?<\/div>/)[0];
  for(const language of ['en','es','fr','it']) {
    const c=config(language),source=snapshot(c),altered=source.replace(/<div class="dan-pu-user-groups"[^>]*>[\s\S]*?<\/div>/,group);
    assert.notEqual(altered,source);
    assert.equal(profileStatus(c,altered),'different',language);
  }
});
