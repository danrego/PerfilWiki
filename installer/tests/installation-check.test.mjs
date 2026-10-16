import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {activationSnippet, activitySnippet, cardsSnippet, createInitialConfig, profileSnippet, RELEASE_VERSION} from '../src/model.mjs';
import {checkInstallation, inspectInstallation, installationPlan} from '../src/installation-check.mjs';
const require=createRequire(import.meta.url);
const Cards=require('../../src/CardsView.js'), Activity=require('../../src/ActivityView.js'), Core=require('../../src/PageviewsCore.js'), Layout=require('../../src/LayoutView.js'), Header=require('../../src/ProfileHeaderView.js');
const baseUrl='http://127.0.0.1:8788/INICIO.html';
function config(appearance={}) {const c=createInitialConfig();return {...c,user:'Marina Exemplo',timeZone:'UTC',appearance:{...c.appearance,...appearance}};}
function fixture(c=config()) {
 const plan=installationPlan(c);
 const release={version:RELEASE_VERSION,files:[{destination:plan.programTitle,text:'/* PerfilWiki '+RELEASE_VERSION+' */\nvar example = true;'},{destination:plan.stylesTitle,text:'.example { color: #3366cc; }'}]};
 const page=(title,model,text)=>({title,contentmodel:model,revisions:[{slots:{main:{content:text}}}]});
 const pages=new Map([
  [plan.activationTitle,page(plan.activationTitle,'javascript','// Keep other scripts\n'+activationSnippet(c)+'\n// More scripts')],
  [plan.profileTitle,page(plan.profileTitle,'wikitext','User text\n'+profileSnippet(c)+'\n[[Categoria:Exemplo]]')],
  ...release.files.map(f=>[f.destination,page(f.destination,f.destination===plan.stylesTitle?'sanitized-css':'javascript',f.text)]),
 ]);
 return {plan,release,pages};
}
test('installation inspection accepts complete sources and preserves unrelated code and profile text',()=>{
 const f=fixture();assert.ok(inspectInstallation(f.plan,f.pages,f.release).every(r=>r.status==='ok'));
 assert.throws(()=>installationPlan(config({metrics:[]})),/Confira/);
});
test('profile checks include the display name, location, custom lines and optional date field',()=>{
 const c={...config({nameAlignment:'center',showAccountCreated:true}),displayName:'Marina & Exemplo',location:'Washington, DC',customFields:[{label:'Área de atuação',value:'História'}]};
 const f=fixture(c);assert.ok(inspectInstallation(f.plan,f.pages,f.release).every(r=>r.status==='ok'));
 const page=f.pages.get(f.plan.profileTitle);page.revisions[0].slots.main.content=page.revisions[0].slots.main.content.replace('Washington, DC','Outra cidade');
 assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'different');
});
test('public numeric snapshots are accepted without matching the original unknown-number text',()=>{
 const c=config(),f=fixture(c),now='2026-10-15T16:00:00Z';
 const entries=[[1,1,0,'Artigo','2026-10-14T12:00:00Z',0]];
 const activity={identity:{user:c.user,project:'pt.wikipedia.org'},complete:true,entries,capturedAt:now,summary:Core.summarize(entries,{config:{user:c.user,timeZone:'UTC'},now})};
 const state={config:{user:c.user,timeZone:'UTC'},capturedAt:now,activity,pageviews:null,statistics:{user:c.user,metrics:{edits:42}}};
 const presentation={user:c.user,displayName:c.user,appearance:c.appearance,now};
 const text='<templatestyles src="'+f.plan.stylesTitle+'" />\n'+Layout.compose(Cards.wikitext(state.statistics,activity,presentation),Activity.wikitext(state,presentation),c.appearance,Header.wikitext(state,presentation));
 f.pages.get(f.plan.profileTitle).revisions[0].slots.main.content=text;
 assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'ok');
});
test('separated blocks with personal text between them remain valid',()=>{
 const c=config({layout:'separate',blockOrder:'activity-first'}),f=fixture(c);
 f.pages.get(f.plan.profileTitle).revisions[0].slots.main.content=activitySnippet(c)+'\n== Projetos ==\nMeu texto\n'+cardsSnippet(c);
 assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'ok');
});
test('missing pages and unavailable or hidden text have different results',()=>{
 const f=fixture();f.pages.set(f.plan.activationTitle,{title:f.plan.activationTitle,missing:true});f.pages.delete(f.plan.stylesTitle);
 f.pages.get(f.plan.programTitle).revisions[0].texthidden=true;
 const rows=inspectInstallation(f.plan,f.pages,f.release);
 assert.equal(rows[0].status,'missing');assert.equal(rows[2].status,'unknown');assert.equal(rows[3].status,'unknown');
});
test('wrong owner, duplicate blocks, changed selection and missing TemplateStyles never pass',()=>{
 const c=config(),original=profileSnippet(c);
 for(const source of [original.replace(/Marina Exemplo/g,'Outra pessoa'),original+'\n'+original,original.replace(/<templatestyles[^>]*>/g,''),profileSnippet(config({metrics:['edits']}))]) {
  const f=fixture(c);f.pages.get(f.plan.profileTitle).revisions[0].slots.main.content=source;
  assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'different');
 }
});
test('duplicate loaders and outdated files are detected without executing any source',()=>{
 const f=fixture();f.pages.get(f.plan.activationTitle).revisions[0].slots.main.content+=activationSnippet(f.plan.config);
 f.pages.get(f.plan.programTitle).revisions[0].slots.main.content='throw new Error("Never execute public code");';
 f.pages.get(f.plan.stylesTitle).contentmodel='wikitext';
 const rows=inspectInstallation(f.plan,f.pages,f.release);
 assert.equal(rows[0].status,'different');assert.equal(rows[2].status,'different');assert.equal(rows[3].status,'different');
 assert.match(rows[3].detail,/CSS higienizado/);
});
test('inactive wikitext examples cannot count as installed profile blocks',()=>{
 const c=config(),source=profileSnippet(c).replace(/<!--[\s\S]*?-->/g,'');
 for(const wrap of [text=>'<!--'+text+'-->',text=>'<nowiki>'+text+'</nowiki>',text=>'<pre>'+text+'</pre>',
  text=>'<source lang="wikitext">'+text+'</source>',text=>'<syntaxhighlight lang="wikitext">'+text+'</syntaxhighlight>',
  text=>'<NOWIKI>'+text+'</NOWIKI>',text=>'<!--'+text]) {
  const f=fixture(c);f.pages.get(f.plan.profileTitle).revisions[0].slots.main.content=wrap(source);
  assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'different');
 }
 const f=fixture(c);
 f.pages.get(f.plan.profileTitle).revisions[0].slots.main.content='<nowiki />\n<!-- Example\n'+source+'\n-->\n<pre>'+source+'</pre>\n'+source;
 assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'ok');
});
test('quoted, commented and nested activation examples cannot pass as active top-level loaders',()=>{
 const c=config(),snippet=activationSnippet(c),exact=snippet.slice(snippet.indexOf('// PERFILWIKI-ACTIVATION-BEGIN'));
 for(const source of ['/*\n'+exact+'\n*/','const example = `'+exact+'`;','const example = '+JSON.stringify(exact)+';',
  'if (false) {\n'+exact+'\n}', 'function example() {\n'+exact+'\n}']) {
  const f=fixture(c);f.pages.get(f.plan.activationTitle).revisions[0].slots.main.content=source;
  assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='activation').status,'different');
 }
});
test('an active loader following ordinary complete JavaScript statements is recognized statically',()=>{
 const c=config();
 const prefix='// Existing user tools\nvar settings = {enabled:true};\nfunction otherTool() { return "ok"; }\n(function () { window.otherTool = true; }());\n';
 const f=fixture(c);f.pages.get(f.plan.activationTitle).revisions[0].slots.main.content=prefix+activationSnippet(c)+'\nwindow.after = true;';
 const row=inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='activation');
 assert.equal(row.status,'ok');assert.match(row.detail,/não executa/);
});
test('unsupported or ambiguous surrounding JavaScript remains unresolved rather than passing or claiming broken code',()=>{
 const c=config();
 for(const prefix of ['const pattern = /example/;\n','const example = `${other}`;\n','var other = true\n','if (false)\n',
  'try { window.other = true; }\n','var other = (1;\n']) {
  const f=fixture(c);f.pages.get(f.plan.activationTitle).revisions[0].slots.main.content=prefix+activationSnippet(c);
  const row=inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='activation');
  assert.equal(row.status,'unknown');assert.match(row.detail,/conferência manual/);
 }
 const f=fixture(c);f.pages.get(f.plan.activationTitle).revisions[0].slots.main.content=activationSnippet(c)+'\n/* unclosed';
 assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='activation').status,'unknown');
});
function transport(f,mutate) {
 const calls=[];
 const fetcher=async(address,options)=>{
  calls.push({address,options});
  let data=calls.length===1?f.release:{batchcomplete:true,query:{pages:[...f.pages.values()]}};
  if(mutate)data=mutate(data,calls.length);
  return {ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(data)};
 };
 return {fetcher,calls};
}
test('the explicit check makes only anonymous GETs to the local manifest and public query API',async()=>{
 const c=config(),f=fixture(c),io=transport(f);
 const result=await checkInstallation(c,{fetcher:io.fetcher,baseUrl});
 assert.equal(result.complete,true);assert.equal(io.calls.length,2);
 assert.equal(io.calls[0].address,'http://127.0.0.1:8788/release-files.json');
 const url=new URL(io.calls[1].address);assert.equal(url.origin,'https://pt.wikipedia.org');
 assert.equal(url.searchParams.get('action'),'query');assert.equal(url.searchParams.get('prop'),'info|revisions');assert.equal(url.searchParams.get('rvslots'),'main');
 assert.equal(url.searchParams.has('rvlimit'),false,'rvlimit cannot be used with multiple requested titles');
 for(const {options} of io.calls){assert.equal(options.method,'GET');assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.ok(!options.body);}
 for(const key of ['token','csrftoken','assert','assertuser','meta'])assert.equal(url.searchParams.has(key),false);
});
test('a failed or incomplete request is unresolved, never a missing installation',async()=>{
 const c=config(),f=fixture(c);
 await assert.rejects(checkInstallation(c,{baseUrl,fetcher:async()=>({ok:false,status:403})}),/indisponível/);
 for(const bad of [{error:{code:'maxlag'}},{warnings:{revisions:{'*':'Warning'}}},{continue:{rvcontinue:'next'}},{batchcomplete:false},{query:{pages:[]}}]) {
  const io=transport(f,(data,number)=>number===2?{...data,...bad}:data);
  if(bad.query){const result=await checkInstallation(c,{fetcher:io.fetcher,baseUrl});assert.equal(result.complete,false);assert.ok(result.results.every(r=>r.status==='unknown'));}
  else await assert.rejects(checkInstallation(c,{fetcher:io.fetcher,baseUrl}));
 }
});
test('normalization is mapped by requested title and duplicate returned pages stay unresolved',async()=>{
 const c=config(),f=fixture(c),io=transport(f,(data,number)=>{
  if(number!==2)return data;
  const pages=data.query.pages.map(p=>p.title===f.plan.profileTitle?{...p,title:'User:Marina Exemplo'}:p);
  return {...data,query:{normalized:[{from:f.plan.profileTitle,to:'User:Marina Exemplo'}],pages}};
 });
 assert.equal((await checkInstallation(c,{fetcher:io.fetcher,baseUrl})).complete,true);
 const duplicate=transport(f,(data,n)=>n===2?{...data,query:{pages:[...data.query.pages,data.query.pages[0]]}}:data);
 const result=await checkInstallation(c,{fetcher:duplicate.fetcher,baseUrl});assert.equal(result.results[0].status,'unknown');
});

test('profile placement and internal links are checked independently in each enabled block',()=>{
 for(const profilePlacement of ['activity','cards','both']) for(const panels of [{},{showCards:false},{showActivity:false}]) {
  const c={...config({profilePlacement,showAccountCreated:true,...panels}),displayName:'Marina',location:'[[Rio de Janeiro|Rio]]',customFields:[{label:'Área',value:'[[História do Brasil]]'}]};
  const f=fixture(c);
  assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'ok',profilePlacement+JSON.stringify(panels));
  const source=f.pages.get(f.plan.profileTitle).revisions[0].slots.main;
  source.content=source.content.replace('Rio de Janeiro','São Paulo');
  assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(r=>r.id==='profile').status,'different');
 }
});


test('integrated snapshots validate nested cards while keeping each profile field in its chosen scope',()=>{
 const c={...config({profilePlacements:{name:'activity',location:'cards',accountCreated:'activity',photo:'cards'},showAccountCreated:true}),displayName:'Marina',location:'[[Rio de Janeiro|Rio]]',customFields:[{label:'Área',value:'História',placement:'cards'}],photo:'Example.jpg'};
 const f=fixture(c);
 assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status,'ok');
 const source=f.pages.get(f.plan.profileTitle).revisions[0].slots.main;
 const original=source.content;
 for(const mutation of [
  text=>text.replace('data-perfilwiki-cards-slot="true"','data-perfilwiki-cards-slot="false"'),
  text=>text.replace('id="dan-pu-integrated-cards"','id="wrong-slot"'),
  text=>text.replace('id="dan-pu-integrated-cards"','id="dan-pu-integrated-cards" id="duplicate"'),
  text=>text.replace('Rio de Janeiro','São Paulo'),
 ]) {
  source.content=mutation(original);
  assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status,'different');
 }
 source.content=activitySnippet(c)+'\n'+cardsSnippet(c);
 assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status,'different','a flat pair cannot pass for a combined installation');
});

test('local time stays immediately after the city in each selected scope',()=>{
 const c={...config({showLocalTime:true,profilePlacements:{location:'top',localTime:'top'}}),location:'[[Washington, DC]]'};
 const f=fixture(c),slot=f.pages.get(f.plan.profileTitle).revisions[0].slots.main,original=slot.content;
 const status=()=>inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status;
 assert.equal(status(),'ok');
 assert.match(original,/dan-pu-profile-location-time/);
 slot.content=original.replace('dan-pu-profile-location-time','profile-location-separate');assert.equal(status(),'different');
 slot.content=original.replace('dan-pu-location-time-separator','profile-missing-separator');assert.equal(status(),'different');
});

test('saved compact clocks require matching time, UTC offset, dated tooltip and machine instant in every scope',()=>{
 for(const scope of ['top','cards','activity']){
  const c={...config({showLocalTime:true,profilePlacements:{localTime:scope}}),timeZone:'America/New_York'};
  const f=fixture(c),slot=f.pages.get(f.plan.profileTitle).revisions[0].slots.main,original=slot.content;
  const status=()=>inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status;
  assert.equal(status(),'ok',scope);
  assert.match(original,/title="Horário salvo em /);assert.doesNotMatch(original,/>Hora local:|>Horário salvo:/);
  for(const mutate of [
   text=>text.replace(/(data-perfilwiki-clock-at=")[^"]+/, '$1invalid'),
   text=>text.replace(/ data-perfilwiki-clock-at="[^"]+"/, ''),
   text=>text.replace(/(data-perfilwiki-clock-at="[^"]+")/, '$1 data-perfilwiki-clock-at="2026-01-01T00:00:00.000Z"'),
   text=>text.replace('title="Horário salvo em ','title="Horário local em '),
   text=>text.replace(/>(\d{2}:\d{2}) \(UTC-\d\)<\//,'>99:99 (UTC-99)</'),
  ]){slot.content=mutate(original);assert.notEqual(slot.content,original);assert.equal(status(),'different',scope);}
 }
});

test('optional statuses retain the selected placement through configuration and initial snippets',()=>{
 assert.equal(config().appearance.showUserGroups,false);
 for(const placement of ['inherit','top','activity','cards','both','top-cards','top-activity','all','hidden']) {
  const c=config({showUserGroups:true,profilePlacements:{userGroups:placement}}),f=fixture(c);
  assert.equal(JSON.parse(activationSnippet(c).match(/window.PerfilWikiConfig = ([\s\S]*?);\n\(function/)[1]).appearance.showUserGroups,true);
  assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status,'ok',placement);
  const source=f.pages.get(f.plan.profileTitle).revisions[0].slots.main;
  if(placement!=='hidden') {
   assert.match(source.content,/<strong style="font-weight:600;">Estatutos:<\/strong> Aguardando dados/);
   source.content=source.content.replace('<strong style="font-weight:600;">Estatutos:</strong> Aguardando dados','<strong style="font-weight:600;">Estatutos:</strong> Administrador');
   assert.equal(inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status,'different');
  }
 }
});

test('status snapshots accept a verified matching proof and reject changed, unproven or foreign text',()=>{
 const c=config({showUserGroups:true,profilePlacements:{userGroups:'top'}}),f=fixture(c),slot=f.pages.get(f.plan.profileTitle).revisions[0].slots.main;
 const proof={version:1,user:c.user,project:'pt.wikipedia.org',checkedAt:'2020-01-01T00:00:00Z',groups:['*','autoconfirmed','autoreviewer','extendedconfirmed','rollbacker','user']};
 const status=()=>inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status;
 const row=Activity.profileMarkup({config:{user:c.user},statistics:{userGroups:proof}},{...c,now:'2026-10-15T12:00:00Z'},true,'top').match(/<div class="dan-pu-user-groups"[^>]*>[\s\S]*?<\/div>/)[0];
 const verified=slot.content.replace(/<div class="dan-pu-user-groups"><strong style="font-weight:600;">Estatutos:<\/strong> Aguardando dados<\/div>/,row);
 slot.content=verified;assert.equal(status(),'ok');
 assert.match(row,/Autoconfirmado estendido · Autorrevisor · Reversor/);assert.doesNotMatch(row,/>Autoconfirmado ·/);
 for(const changed of [
  verified.replace('Autoconfirmado estendido · Autorrevisor · Reversor','Administrador'),
  verified.replace(/data-perfilwiki-user-groups="[^"]*"/,'data-perfilwiki-user-groups=""'),
  verified.replace(/data-perfilwiki-user-groups="[^"]*"/,match=>match.replace('Marina Exemplo','Outra pessoa')),
  verified.replace(/data-perfilwiki-user-groups="[^"]*"/,''),
 ]) {slot.content=changed;assert.equal(status(),'different');}
});

test('status and creation date close each scope after custom information and cannot be reordered',()=>{
 const c={...config({showUserGroups:true,showAccountCreated:true,profilePlacements:{name:'all',userGroups:'all',accountCreated:'all'}}),customFields:[{label:'Pesquisa',value:'Bibliotecas',placement:'all'}]};
 const f=fixture(c),slot=f.pages.get(f.plan.profileTitle).revisions[0].slots.main,original=slot.content;
 const status=()=>inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status;
 assert.equal(status(),'ok');
 const rows=[...original.matchAll(/(<div class="dan-pu-user-groups"[^>]*>[\s\S]*?<\/div>)(<div class="dan-pu-account-created"[^>]*>[\s\S]*?<\/div>)/g)];
 assert.equal(rows.length,3);
 for(const row of rows) {
  slot.content=original.replace(row[0],row[2]+row[1]);assert.equal(status(),'different');
  slot.content=original.replace(row[0],row[1]+'<div>Informação fora de ordem</div>'+row[2]);assert.equal(status(),'different');
  slot.content=original.replace(row[0],row[0]+'<div>Informação fora de ordem</div>');assert.equal(status(),'different');
 }
});

test('status and creation date label emphasis is checked independently from their values',()=>{
 const c=config({showUserGroups:true,showAccountCreated:true}),f=fixture(c),slot=f.pages.get(f.plan.profileTitle).revisions[0].slots.main,original=slot.content;
 const status=()=>inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status;
 assert.equal(status(),'ok');
 for(const className of ['dan-pu-user-groups','dan-pu-account-created']) {
  slot.content=original.replace(new RegExp('(<div class="'+className+'"[^>]*>)<[^>]+>([^<]+)</[^>]+>'),'$1$2');
  assert.notEqual(slot.content,original,'The label must have its own emphasis element.');
  assert.equal(status(),'different',className);
 }
});

test('creation snapshots keep complete or qualified dates with their matching public proof',()=>{
 const c=config({showAccountCreated:true}),f=fixture(c),slot=f.pages.get(f.plan.profileTitle).revisions[0].slots.main,original=slot.content;
 const pending=/<div class="dan-pu-account-created">[\s\S]*?<\/div>/;
 const status=()=>inspectInstallation(f.plan,f.pages,f.release).find(row=>row.id==='profile').status;
 for(const complete of [true,false]) {
  const proof={version:1,user:c.user,timestamp:'2007-08-20T23:30:00.000Z',complete};
  const label=complete?'Conta criada em:':'Data de criação mais antiga disponível:';
  const row='<div class="dan-pu-account-created" data-perfilwiki-account-created="'+JSON.stringify(proof).replaceAll('"','&quot;').replaceAll('{','&#123;').replaceAll('}','&#125;')+'"><strong style="font-weight:600;">'+label+'</strong> 20 de agosto de 2007'+(complete?'':'<div class="dan-pu-account-created-note" style="margin-top:2px;font-size:12px;">Pode haver contas anteriores sem data registrada.</div>')+'</div>';
  const verified=original.replace(pending,row);
  slot.content=verified;assert.equal(status(),'ok',String(complete));
  for(const mutation of [
   text=>text.replace('20 de agosto de 2007','21 de agosto de 2007'),
   text=>text.replace('data-perfilwiki-account-created="','data-perfilwiki-account-created="broken'),
   text=>text.replace('user&quot;:&quot;Marina Exemplo','user&quot;:&quot;Outra pessoa'),
   text=>text.replace('<strong style="font-weight:600;">'+label+'</strong>',label),
  ]) {slot.content=mutation(verified);assert.equal(status(),'different');}
 }
});
