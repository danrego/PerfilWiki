'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Appearance=require('../src/Appearance.js');
const Configuration=require('../src/Configuration.js');
const Text=require('../src/ProfileText.js');
const Activity=require('../src/ActivityView.js');
const Cards=require('../src/CardsView.js');
const fs=require('node:fs');
const user='Marina Exemplo',now='2026-10-15T14:42:00.000Z';
const placements=['inherit','cards','activity','both','hidden'];
function settings(extra={}){return Appearance.normalize(extra);}
function state(){return{config:{user,timeZone:'UTC'},statistics:{user,metrics:{earliestRegistration:'2007-08-20T00:00:00.000Z'},registrationCoverage:{version:1,user,checkedAt:now,complete:true,globalRegistration:'2007-08-20T00:00:00.000Z',accounts:[]}}};}
function presentation(appearance={}){return{user,displayName:'Marina Pesquisa',location:'Em [[Rio de Janeiro|Rio]]',customFields:[{label:'Pesquisa',value:'[[História do Brasil|História]]'}],photo:'File:Marina_Exemplo.jpg',now,appearance};}
const resolve=input=>Configuration.resolve({config:{get:()=>user}},{PerfilWikiConfig:{user,timeZone:'UTC',...input}});

test('per-field placements inherit old behavior, stay isolated and reject malformed maps',()=>{
 const first=settings();assert.deepEqual(first.profilePlacements,{name:'inherit',location:'inherit',accountCreated:'inherit',photo:'top',localTime:'top',userGroups:'inherit'});
 assert.equal(first.profileDetailsLayout,'stacked');first.profilePlacements.name='hidden';assert.equal(settings().profilePlacements.name,'inherit');
 for(const field of ['name','location','accountCreated','photo'])for(const placement of placements)for(const block of ['cards','activity']){
  const input={profilePlacement:'activity',profilePlacements:{[field]:placement}};
  assert.equal(Appearance.fieldIn(input,block,field),placement==='both'||placement===block||placement==='inherit'&&block==='activity');
  assert.equal(Appearance.fieldIn({...input,showActivity:false},'cards',field),placement!=='hidden');
  assert.equal(Appearance.fieldIn({...input,showCards:false},'activity',field),placement!=='hidden');
 }
 for(const input of [{profilePlacements:null},{profilePlacements:[]},{profilePlacements:{unknown:'cards'}},{profilePlacements:{name:'floating'}},{profilePlacements:{photo:'cards;color:red'}},{profileDetailsLayout:'horizontal'}])assert.throws(()=>settings(input));
 assert.equal(Appearance.fieldIn({},'unknown','name'),false);
});

test('custom-row placement preserves old row shape and remains outside metrics identity',()=>{
 const old={label:'Pesquisa',value:'História'};
 assert.deepEqual(resolve({customFields:[old]}).customFields,[old]);
 for(const placement of placements)assert.deepEqual(resolve({customFields:[{...old,placement}]}).customFields,[{...old,placement}]);
 assert.throws(()=>resolve({customFields:[{...old,placement:'activity;display:none'}]}));
 const configured=resolve({photo:'Ficheiro:Marina_Exemplo.jpg',customFields:[{...old,placement:'cards'}],appearance:{profilePlacements:{name:'hidden'}}});
 assert.equal(configured.photo,'Marina Exemplo.jpg');assert.equal(Configuration.normalizePhoto,Text.normalizePhoto);
 assert.equal(Object.hasOwn(configured.metrics,'photo'),false);assert.equal(Object.hasOwn(configured.metrics,'customFields'),false);
});

test('actual HTML and saved wiki place each profile field independently and keep a single name',()=>{
 const input=presentation({showAccountCreated:true,profileDetailsLayout:'inline',profilePlacements:{name:'cards',location:'activity',accountCreated:'both',photo:'cards'}});
 input.customFields[0].placement='activity';
 for(const wiki of [false,true]){
  const cards=Activity.profileMarkup(state(),input,wiki,'cards'),activity=Activity.profileMarkup(state(),input,wiki,'activity');
  assert.equal((cards.match(/class="dan-pu-profile-label"/g)||[]).length,1);assert.doesNotMatch(activity,/class="dan-pu-profile-label"/);
  assert.match(cards,/dan-pu-profile-photo/);assert.doesNotMatch(activity,/dan-pu-profile-photo/);
  assert.match(activity,/dan-pu-profile-location/);assert.doesNotMatch(cards,/dan-pu-profile-location|class="dan-pu-profile-field"/);
  assert.match(activity,/class="dan-pu-profile-field"/);
  for(const output of [cards,activity]){assert.match(output,/Conta criada em:(?:<\/strong>)? 20 de agosto de 2007/);assert.match(output,/class="dan-pu-profile-details"[^>]*data-layout="inline"/);}
 }
 const html=Cards.html(state().statistics,null,input),wiki=Cards.wikitext(state().statistics,null,input);
 for(const output of [html,wiki])assert.doesNotMatch(output,/class="dan-pu-cards-profile"[^>]*border-bottom/);
});

test('one explicit custom row can create a profile when every standard field is hidden',()=>{
 const input=presentation({profilePlacements:{name:'hidden',location:'hidden',accountCreated:'hidden',photo:'hidden'}});
 input.customFields[0].placement='cards';
 assert.equal(Appearance.profileIn(input.appearance,'cards',input.customFields),true);
 assert.match(Activity.profileMarkup(state(),input,false,'cards'),/Pesquisa/);
 assert.equal(Activity.profileMarkup(state(),input,false,'activity'),'');
 input.customFields[0].placement='hidden';assert.equal(Activity.profileMarkup(state(),input,false,'cards'),'');
});

test('Commons filenames reject paths, protocols, wiki execution and unsupported files',()=>{
 for(const value of ['Marina.jpg','Ficheiro:Marina_Exemplo.PNG','File:Foto de Érica & Marina.webp','Retrato.svg','Retrato.jpeg','Retrato.GIF'])assert.ok(Text.normalizePhoto(value));
 assert.equal(Text.normalizePhoto(undefined),'');assert.equal(Text.normalizePhoto('  '),'');
 assert.equal(Text.normalizePhoto(' File:E\u0301rica_retrato.jpg '),'Érica retrato.jpg');
 for(const value of [null,[],1,'https://commons.wikimedia.org/a.jpg','../a.jpg','folder/a.jpg','a\\b.jpg','File:Foo:Bar.jpg','[[File:X.jpg]]','X|thumb.jpg','{{X}}.jpg','X.jpg#fragment','X.jpg?width=1','\nX.jpg','X.jpg\t','X%2F.jpg','X&#47;.jpg','<img>.jpg','Photo.pdf','Photo.tiff','Photo.html','a'.repeat(240)+'.jpg'])assert.throws(()=>Text.normalizePhoto(value),String(value));
});

test('photo exports use safe Commons links and anonymous images while previews never assign a remote source',()=>{
 const input=presentation();input.displayName='Marina <script> ~~~~';
 const html=Text.photoMarkup(input,false),wiki=Text.photoMarkup(input,true),preview=Text.photoMarkup({...input,localPhotoPreview:true},false);
 assert.match(html,/crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"/);assert.match(html,/Special:FilePath\/Marina_Exemplo.jpg\?width=160/);
 assert.match(html,/alt="Foto de Marina &lt;script&gt; ~~~~"/);assert.doesNotMatch(html,/<script>/);
 assert.match(wiki,/\[\[Ficheiro:Marina Exemplo.jpg\|96x96px\|link=https:\/\/commons.wikimedia.org\/wiki\/File:Marina_Exemplo.jpg\|alt=/);
 assert.doesNotMatch(wiki,/~~~~|<script>/);assert.match(wiki,/Ver arquivo no Commons/);
 assert.match(preview,/src="data:image\/svg\+xml,/);assert.doesNotMatch(preview,/src="https:/);
 assert.equal(Text.photoMarkup({...input,photo:'{{unsafe}}.jpg'},false),'');
});

class Element{
 constructor(tag='div'){this.tagName=tag;this.childNodes=[];this.parentNode=null;this.className='';this.attributes={};this.style={};this.ownText='';this.setterOrder=[];}
 set textContent(value){this.ownText=String(value);this.childNodes=[];}get textContent(){return this.ownText+this.childNodes.map(n=>n.textContent).join('');}
 set innerHTML(_){assert.fail('Profile DOM must not parse HTML.');}
 setAttribute(key,value){this.setterOrder.push(key);this.attributes[key]=String(value);}getAttribute(key){return this.attributes[key]??null;}
 appendChild(child){if(child.parentNode)child.parentNode.removeChild(child);this.childNodes.push(child);child.parentNode=this;return child;}
 insertBefore(child,next){if(next===null)return this.appendChild(child);if(child.parentNode)child.parentNode.removeChild(child);const index=this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,child);child.parentNode=this;return child;}
 removeChild(child){const index=this.childNodes.indexOf(child);assert.ok(index>=0);this.childNodes.splice(index,1);child.parentNode=null;return child;}
 querySelector(selector){for(const child of this.childNodes){if(selector.startsWith('.')&&child.className.split(' ').includes(selector.slice(1)))return child;const nested=child.querySelector(selector);if(nested)return nested;}return null;}
}
function documentFixture(){const activity=new Element(),cards=new Element(),figure=new Element();for(const root of [activity,cards])root.setAttribute('data-perfilwiki-user',user);figure.textContent='12345';cards.appendChild(figure);return{activity,cards,figure,document:{getElementById:id=>id==='dan-pu-ritmo'?activity:id==='dan-pu-estatisticas'?cards:null,createElement:tag=>new Element(tag)}};}

test('safe DOM moves individual fields, retains saved dates, preserves figures and sets image privacy before src',()=>{
 const f=documentFixture(),input=presentation({showAccountCreated:true,profilePlacements:{name:'cards',location:'activity',accountCreated:'cards',photo:'cards'}});
 Activity.paintProfile(f.document,state(),input);
 assert.equal(f.activity.querySelector('.dan-pu-profile-label'),null);assert.equal(f.cards.querySelector('.dan-pu-profile-label').textContent,'Marina Pesquisa');
 assert.equal(f.activity.querySelector('.dan-pu-profile-location').textContent,'Em Rio');assert.equal(f.cards.querySelector('.dan-pu-profile-location'),null);
 const photo=f.cards.querySelector('.dan-pu-profile-photo'),image=photo.querySelector('.dan-pu-profile-photo-image');
 assert.ok(image.setterOrder.indexOf('crossorigin')<image.setterOrder.indexOf('src'));assert.ok(image.setterOrder.indexOf('referrerpolicy')<image.setterOrder.indexOf('src'));
 assert.equal(photo.querySelector('.dan-pu-profile-photo-placeholder').hidden,true);assert.equal(photo.querySelector('.dan-pu-profile-photo-link').textContent,'Ver arquivo no Commons');
 const moved={...input,appearance:{...input.appearance,profileDetailsLayout:'inline',profilePlacements:{name:'hidden',location:'both',accountCreated:'activity',photo:'hidden'}}};
 Activity.paintProfile(f.document,null,moved);
 assert.equal(f.cards.querySelector('.dan-pu-profile-photo'),null);assert.equal(f.cards.querySelector('.dan-pu-account-created'),null);
 assert.equal(f.activity.querySelector('.dan-pu-account-created').textContent,'Conta criada em: 20 de agosto de 2007');
 assert.equal(f.cards.querySelector('.dan-pu-profile-label'),null);assert.equal(f.activity.querySelector('.dan-pu-profile-details').getAttribute('data-layout'),'inline');
 assert.equal(f.figure.textContent,'12345');assert.equal(f.figure.parentNode,f.cards);
});

test('automatic density chooses five, four or three desktop columns while explicit five remains responsive',()=>{
 const css=fs.readFileSync(require.resolve('../src/PerfilWiki-estilos.css'),'utf8');
 assert.match(css,/\.dan-pu-stats\.dan-pu-columns-5 \{ grid-template-columns: repeat\(5,/);
 assert.match(css,/dan-pu-columns-auto\.dan-pu-density-compact[^}]+\/ 5\)/);
 assert.match(css,/dan-pu-columns-auto\.dan-pu-density-roomy[^}]+\/ 3\)/);
 assert.match(css,/dan-pu-profile-label \+ \.dan-pu-profile-details\[data-layout="inline"\][^}]+border-top:/);
 assert.match(css,/dan-pu-profile-photo-placeholder\[hidden\] \{ display: none; \}/);
 assert.equal(settings({cardColumns:'5'}).cardColumns,'5');
});
