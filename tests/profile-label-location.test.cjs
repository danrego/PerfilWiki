'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Fields=require('../src/ProfileFields.js');
const Configuration=require('../src/Configuration.js');
const Activity=require('../src/ActivityView.js');
const Clock=require('../src/ProfileClock.js');
const USER='Marina Exemplo', NOW='2026-10-15T14:42:00.000Z';
const state={config:{user:USER,timeZone:'America/New_York'}};
function options(extra={}) {return {user:USER,timeZone:'America/New_York',now:NOW,location:'[[Washington, D.C.|Washington, DC]]',customFields:[{label:'Pesquisa',value:'[[História]]',placement:'all'}],appearance:{showLocalTime:true,profilePlacements:{name:'hidden',photo:'hidden',location:'all',localTime:'all'}},...extra};}

test('label-only fields normalize from bare, legacy and grouped drafts without discarding their placement or layout',()=>{
 assert.deepEqual(Fields.normalize([{label:'  Pesquisa  '}]),[{label:'Pesquisa',value:''}]);
 assert.deepEqual(Fields.normalize([{label:' Pesquisa ',value:' ',placement:'top'}]),[{label:'Pesquisa',value:'',placement:'top'}]);
 for(const layout of ['inline','lines','bullets']){
  const field={label:'Pesquisa',values:[' ',''],layout,separator:'dot',placement:'all'};
  assert.deepEqual(Fields.normalize([field]),[{...field,values:[]}]);
  assert.deepEqual(Fields.values(field),[]);assert.equal(Fields.layoutOf(field),layout);
 }
 assert.deepEqual(Fields.normalize([{label:''},{label:' ',value:' '},{label:'',values:[]}]),[]);
 for(const field of [{label:'',value:'Texto'},{label:'',values:['Texto']}])assert.throws(()=>Fields.normalize([field]),/rótulo/);
 for(const field of [{label:'Pesquisa',value:undefined},{label:'Pesquisa',value:null},{label:'Pesquisa',value:'',values:[]}])assert.throws(()=>Fields.normalize([field]),TypeError);
 const configured=Configuration.resolve({config:{get:()=>USER}},{PerfilWikiConfig:{user:USER,timeZone:'UTC',customFields:[{label:'Pesquisa'}]}});
 assert.deepEqual(configured.customFields,[{label:'Pesquisa',value:''}]);
});

test('label-only HTML and saved wiki rows have no colon, empty item container, list or separator',()=>{
 for(const field of [{label:'Pesquisa'},{label:'Pesquisa',value:''},{label:'Pesquisa',values:[],layout:'lines'}, {label:'Pesquisa',values:[' '],layout:'bullets'}])for(const wiki of [false,true]){
  const output=Activity.customFieldMarkup(field,wiki);
  assert.match(output,/>Pesquisa<\/span><\/div>$/);
  assert.doesNotMatch(output,/Pesquisa:|dan-pu-field-values|dan-pu-field-separator|<ul|<li/);
  const settings=options({customFields:[{...field,placement:'all'}]});
  for(const scope of ['top','cards','activity'])assert.ok(Activity.profileMarkup(state,settings,wiki,scope).includes(output));
 }
 const field={label:'Pesquisa',value:'[[História]]'};
 assert.equal(Activity.customFieldMarkup(field,false),'<div class="dan-pu-profile-field"><span style="font-weight:600;">Pesquisa:</span> <a href="https://pt.wikipedia.org/wiki/Hist%C3%B3ria">História</a></div>');
 assert.equal(Activity.customFieldMarkup(field,true),'<div class="dan-pu-profile-field"><span style="font-weight:600;">Pesquisa:</span> [[:História|História]]</div>');
});

test('city and clock share one metadata row before custom labels in each scope and both global information layouts',()=>{
 for(const profileDetailsLayout of ['stacked','inline'])for(const scope of ['top','cards','activity'])for(const wiki of [false,true]){
  const presentation=options();presentation.appearance.profileDetailsLayout=profileDetailsLayout;
  const output=Activity.profileMarkup(state,presentation,wiki,scope);
  const pair=output.match(/<div class="dan-pu-profile-location-time">([\s\S]*?)<\/div>/);
  assert.ok(pair,profileDetailsLayout+'/'+scope);
  assert.match(pair[1],/class="dan-pu-profile-location"[\s\S]*class="dan-pu-local-time"/);
  assert.match(pair[1],/>10:42 \(UTC-4\)<\/span>/);
  assert.ok(output.indexOf('dan-pu-profile-location-time')<output.indexOf('dan-pu-profile-field'));
  assert.equal((output.match(/class="dan-pu-local-time"/g)||[]).length,1);
 }
});

test('separate city and clock placements remain independent, with standalone clock before custom labels',()=>{
 const presentation=options();presentation.appearance.profilePlacements={name:'hidden',photo:'hidden',location:'top',localTime:'activity'};
 const top=Activity.profileMarkup(state,presentation,false,'top'),activity=Activity.profileMarkup(state,presentation,false,'activity'),cards=Activity.profileMarkup(state,presentation,false,'cards');
 assert.match(top,/dan-pu-profile-location/);assert.doesNotMatch(top,/dan-pu-local-time|dan-pu-profile-location-time/);
 assert.match(activity,/<div class="dan-pu-local-time"/);assert.doesNotMatch(activity,/dan-pu-profile-location/);
 assert.ok(activity.indexOf('dan-pu-local-time')<activity.indexOf('dan-pu-profile-field'));
 assert.doesNotMatch(cards,/dan-pu-local-time|dan-pu-profile-location/);
 const missingCity=options({location:' '});
 const output=Activity.profileMarkup(state,missingCity,false,'top');
 assert.match(output,/<div class="dan-pu-local-time"/);assert.doesNotMatch(output,/location-time-separator|dan-pu-profile-location/);
 const hiddenClock=options();hiddenClock.appearance.showLocalTime=false;
 assert.doesNotMatch(Activity.profileMarkup(state,hiddenClock,false,'top'),/location-time-separator|dan-pu-local-time/);
});

class Element{
 constructor(tag='div'){this.tagName=tag;this.childNodes=[];this.parentNode=null;this.className='';this.attributes={};this.style={};this.ownText='';}
 get id(){return this.attributes.id||'';}set id(value){this.attributes.id=value;}
 get firstChild(){return this.childNodes[0]||null;}get children(){return this.childNodes;}
 get textContent(){return this.ownText+this.childNodes.map(node=>node.textContent).join('');}
 set textContent(value){this.ownText=String(value);this.childNodes.forEach(node=>{node.parentNode=null;});this.childNodes=[];}
 setAttribute(key,value){this.attributes[key]=String(value);}getAttribute(key){return this.attributes[key]??null;}
 appendChild(node){return this.insertBefore(node,null);}insertBefore(node,next){if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.childNodes.length:this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,node);node.parentNode=this;return node;}
 removeChild(node){const index=this.childNodes.indexOf(node);assert.ok(index>=0);this.childNodes.splice(index,1);node.parentNode=null;return node;}
 matches(selector){return selector[0]==='.'?this.className.split(' ').includes(selector.slice(1)):selector[0]==='#'?this.id===selector.slice(1):this.tagName===selector;}
 querySelectorAll(selector){return this.childNodes.flatMap(node=>[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function fixture(){
 const body=new Element('body'),roots=['dan-pu-profile-header','dan-pu-estatisticas','dan-pu-ritmo'].map(id=>{const node=new Element();node.id=id;node.setAttribute('data-perfilwiki-user',USER);body.appendChild(node);return node;});
 const document={getElementById:id=>body.querySelector('#'+id),createElement:tag=>new Element(tag)};
 return {body,roots,document};
}

test('safe DOM paint keeps label-only rows visible while adding, clearing and removing their item nodes',()=>{
 const f=fixture(),presentation=options({customFields:[{label:'Pesquisa',values:[],layout:'bullets',placement:'all'}]});
 for(const values of [[],['[[História]]'],[' '],['[[MIT]]','[[GWU]]'],[]]){
  presentation.customFields[0].values=values;Activity.paintProfile(f.document,state,presentation);
  for(const root of f.roots){
   const field=root.querySelector('.dan-pu-profile-field');assert.ok(field);
   assert.equal(field.textContent.startsWith('Pesquisa:'),values.some(value=>value.trim()));
   assert.equal(field.querySelectorAll('li').length,values.filter(value=>value.trim()).length);
   assert.equal(field.querySelectorAll('.dan-pu-field-values').length,values.some(value=>value.trim())?1:0);
   assert.equal(root.querySelectorAll('.dan-pu-profile-field').length,1);
  }
 }
 presentation.customFields=[{label:'',value:''}];Activity.paintProfile(f.document,state,presentation);
 assert.equal(f.body.querySelectorAll('.dan-pu-profile-field').length,0);
});

test('safe DOM city/clock grouping survives minute updates without detaching fields or duplicating separators',()=>{
 for(const profileDetailsLayout of ['stacked','inline']){
  const f=fixture(),presentation=options();presentation.appearance.profileDetailsLayout=profileDetailsLayout;
  Activity.paintProfile(f.document,state,presentation);
  for(const root of f.roots){
   const pair=root.querySelector('.dan-pu-profile-location-time'),details=root.querySelector('.dan-pu-profile-details');
   assert.equal(details.children[0],pair);assert.equal(details.children[1].className,'dan-pu-profile-field');
   assert.equal(pair.children[0].className,'dan-pu-profile-location');assert.equal(pair.children[2].className,'dan-pu-local-time');
   assert.equal(pair.querySelectorAll('a').length,1);assert.equal(pair.children[2].textContent,'10:42 (UTC-4)');
  }
  assert.equal(Clock.update(f.document,'2026-10-15T14:43:00.000Z',USER,'America/New_York'),3);
  for(const root of f.roots){assert.equal(root.querySelector('.dan-pu-local-time').textContent,'10:43 (UTC-4)');assert.equal(root.querySelectorAll('.dan-pu-location-time-separator').length,1);}
  Activity.paintProfile(f.document,state,presentation);
  assert.equal(f.body.querySelectorAll('.dan-pu-location-time-separator').length,3);
 }
});

test('optional estatutos use verified ptwiki proof and render after city/clock and custom labels',()=>{
 const proof={version:1,user:USER,project:'pt.wikipedia.org',checkedAt:'2026-10-15T14:30:00.000Z',groups:['*','autoconfirmed','autoreviewer','rollbacker','user']};
 const verified={...state,statistics:{user:USER,userGroups:proof}},presentation=options();
 presentation.appearance.showUserGroups=true;presentation.appearance.profilePlacements.userGroups='all';
 for(const scope of ['top','cards','activity'])for(const wiki of [false,true]){
  const output=Activity.profileMarkup(verified,presentation,wiki,scope);
  assert.match(output,/class="dan-pu-user-groups" data-perfilwiki-user-groups=/);
  assert.match(output,/Estatutos:<\/strong> /);assert.match(output,/Reversor/i);assert.match(output,/Autorrevisor/i);
  assert.ok(output.indexOf('dan-pu-profile-location-time')<output.indexOf('dan-pu-user-groups'));
  assert.ok(output.indexOf('dan-pu-profile-field')<output.indexOf('dan-pu-user-groups'));
 }
 const f=fixture();Activity.paintProfile(f.document,verified,presentation);
 for(const root of f.roots){const status=root.querySelector('.dan-pu-user-groups');assert.deepEqual(JSON.parse(status.getAttribute('data-perfilwiki-user-groups')),proof);assert.equal(status.parentNode.children[2],status);}
 presentation.appearance.showUserGroups=false;
 assert.doesNotMatch(Activity.profileMarkup(verified,presentation,false,'top'),/dan-pu-user-groups/);
});

test('unverified or foreign estatutos never leak into the profile and failures keep pending text distinct',()=>{
 const presentation=options();presentation.appearance.showUserGroups=true;presentation.appearance.profilePlacements.userGroups='top';
 const proof={version:1,user:USER,project:'pt.wikipedia.org',checkedAt:'2026-10-15T14:30:00.000Z',groups:['*','sysop','user']};
 for(const bad of [undefined,{...proof,user:'Outra Pessoa'},{...proof,project:'en.wikipedia.org'},{...proof,checkedAt:'2027-01-01T00:00:00.000Z'}]){
  const output=Activity.profileMarkup({...state,statistics:{user:USER,userGroups:bad}},presentation,false,'top');
  assert.match(output,/Estatutos:<\/strong> Aguardando dados/);assert.doesNotMatch(output,/Administrador|data-perfilwiki-user-groups/);
 }
 const failed={...state,statistics:{user:USER,errors:['Estatutos na ptwiki']}};
 assert.match(Activity.profileMarkup(failed,presentation,true,'top'),/Estatutos:<\/strong> Estatutos indisponíveis/);
 const f=fixture();Activity.paintProfile(f.document,failed,presentation);
 assert.equal(f.roots[0].querySelector('.dan-pu-user-groups').textContent,'Estatutos: Estatutos indisponíveis');
 for(const root of f.roots.slice(1))assert.equal(root.querySelector('.dan-pu-user-groups'),null);
});
