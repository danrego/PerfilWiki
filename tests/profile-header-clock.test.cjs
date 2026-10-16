'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Appearance=require('../src/Appearance.js');
const Header=require('../src/ProfileHeaderView.js');
const Clock=require('../src/ProfileClock.js');
const Activity=require('../src/ActivityView.js');
const user='Marina Exemplo',now='2026-10-15T14:42:00.000Z',zone='America/New_York';
const base={appearance:{profilePlacement:'activity'},user,displayName:'Marina Pesquisa',timeZone:zone,now};
const state={config:{user,timeZone:zone}};

test('top placement combinations preserve legacy both and never fallback a top-only field into a panel',()=>{
 const expected={cards:['cards'],activity:['activity'],both:['cards','activity'],top:['top'],'top-activity':['top','activity'],'top-cards':['top','cards'],all:['top','cards','activity'],hidden:[]};
 for(const [placement,scopes]of Object.entries(expected))for(const block of ['top','cards','activity']){
  assert.equal(Appearance.fieldIn({profilePlacements:{location:placement}},block,'location'),scopes.includes(block),placement+' '+block);
 }
 for(const placement of Object.keys(expected))for(const single of ['cards','activity'])for(const block of ['top','cards','activity']){
  const source=expected[placement],selected=single==='cards'?{showActivity:false}:{showCards:false};
  const wanted=block==='top'?source.includes('top'):block===single&&(source.includes('cards')||source.includes('activity'));
  assert.equal(Appearance.fieldIn({...selected,profilePlacements:{name:placement}},block,'name'),wanted,placement+' '+single+' '+block);
 }
 for(const profilePlacement of ['activity','cards','both','top','all']){
  assert.equal(Appearance.fieldIn({profilePlacement},'top','name'),profilePlacement==='top'||profilePlacement==='all');
 }
 assert.equal(Appearance.normalize().showLocalTime,false);assert.equal(Appearance.normalize().profilePlacements.localTime,'top');
 for(const showLocalTime of [true,false])assert.equal(Appearance.normalize({showLocalTime}).showLocalTime,showLocalTime);
 for(const showLocalTime of ['true',1,null,{}])assert.throws(()=>Appearance.normalize({showLocalTime}));
 const hidden={profilePlacements:{name:'hidden',location:'hidden',photo:'hidden',accountCreated:'hidden',localTime:'hidden'}};
 assert.equal(Appearance.profileIn(hidden,'top',[{label:'Teste',value:'Texto',placement:'unsafe'}]),false);
 assert.doesNotThrow(()=>Activity.profileMarkup(state,{...base,appearance:hidden,customFields:[{label:'Teste',value:'Texto',placement:'unsafe'}]},false,'top'));
 assert.throws(()=>Appearance.fieldIn(hidden,'top','unsafe'));
});

test('inherited identity fields default to the top in every visible panel combination',()=>{
 assert.equal(Appearance.defaults.profilePlacement,'top');
 for(const panels of [{},{showCards:false},{showActivity:false}])for(const field of ['name','location','accountCreated','photo','localTime','inherit'])for(const scope of ['top','cards','activity']){
  assert.equal(Appearance.fieldIn(panels,scope,field),scope==='top',JSON.stringify(panels)+' '+field+' '+scope);
 }
 const options={...base,appearance:{},location:'[[Rio de Janeiro]]',customFields:[{label:'Área',value:'[[História]]'}]};
 const top=Header.html(state,options);assert.match(top,/Marina Pesquisa/);assert.match(top,/Rio_de_Janeiro/);assert.match(top,/História/);
 for(const scope of ['activity','cards'])assert.equal(Activity.profileMarkup(state,options,false,scope),'');
 for(const profilePlacement of ['activity','cards','both','all'])assert.equal(Appearance.normalize({profilePlacement}).profilePlacement,profilePlacement);
});

test('local clock uses the selected IANA zone, seasonal offsets and fractional hours without hard-coded offsets',()=>{
 for(const [date,timeZone,expected]of [
  ['2026-01-15T12:05:00Z',zone,'07:05 (UTC-5)'],['2026-07-15T12:05:00Z',zone,'08:05 (UTC-4)'],
  ['2026-01-15T12:05:00Z','Asia/Kolkata','17:35 (UTC+5:30)'],['2026-01-15T12:05:00Z','Asia/Kathmandu','17:50 (UTC+5:45)'],
  ['2026-01-15T12:05:00Z','Australia/Lord_Howe','23:05 (UTC+11)'],['2026-07-15T12:05:00Z','Australia/Lord_Howe','22:35 (UTC+10:30)'],
  ['2026-01-15T00:05:00Z','UTC','00:05 (UTC+0)']])assert.equal(Clock.text(date,timeZone),expected);
 assert.equal(Clock.text('2026-07-15T12:05:00Z',zone,true),'08:05 (UTC-4)');
 assert.equal(Clock.text('2026-01-15T02:05:00Z',zone,true),'21:05 (UTC-5)');
 for(const [date,timeZone]of [['invalid',zone],[now,'Not/AZone'],[now,'<script>'],[Infinity,zone]])assert.equal(Clock.text(date,timeZone),'Horário indisponível');
 assert.equal(Header.clockText,Clock.text);assert.equal(Header.updateClocks,Clock.update);
});

test('clock falls back to calendar parts when longOffset is unavailable and preserves DST and date rollover',()=>{
 const module={exports:{}},FallbackIntl={DateTimeFormat:function(locale,options){if(options.timeZoneName==='longOffset')throw new RangeError('Unsupported longOffset');return new Intl.DateTimeFormat(locale,options);}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/ProfileClock.js'),'utf8'),{module,Intl:FallbackIntl,Date,Map,Set,require:name=>{assert.equal(name,'./I18n.js');return require('../src/I18n.js');}});
 for(const date of ['2026-01-15T02:05:00Z','2026-07-15T12:05:00Z'])for(const timeZone of ['UTC',zone,'Asia/Kolkata','Asia/Kathmandu','Australia/Lord_Howe']){
  assert.equal(module.exports.text(date,timeZone),Clock.text(date,timeZone));assert.equal(module.exports.text(date,timeZone,true),Clock.text(date,timeZone,true));
  assert.deepEqual({...module.exports.details(date,timeZone,true)},Clock.details(date,timeZone,true));
 }
});

test('compact clocks switch offset at the DST boundary and preserve fractional negative offsets',()=>{
 const cases=[['2026-03-08T06:59:00Z',zone,'01:59 (UTC-5)'],['2026-03-08T07:00:00Z',zone,'03:00 (UTC-4)'],
  ['2026-11-01T05:59:00Z',zone,'01:59 (UTC-4)'],['2026-11-01T06:00:00Z',zone,'01:00 (UTC-5)'],
  ['2026-01-15T12:05:00Z','America/St_Johns','08:35 (UTC-3:30)']];
 for(const [instant,timeZone,expected]of cases)for(const wiki of [true,false])assert.equal(Clock.text(instant,timeZone,wiki),expected);
});

test('saved and live clocks share compact text while dated tooltips and ISO metadata retain the instant',()=>{
 const live=Clock.details(now,zone),saved=Clock.details(now,zone,true);
 assert.equal(live.text,'10:42 (UTC-4)');assert.equal(saved.text,live.text);
 assert.equal(live.title,'Horário local em 15/10/2026, 10:42 (UTC-4) · America/New_York');
 assert.equal(saved.title,'Horário salvo em 15/10/2026, 10:42 (UTC-4) · America/New_York');
 assert.equal(saved.timestamp,now);assert.equal(live.timestamp,now);
 for(const [instant,timeZone]of [['invalid',zone],[now,'<bad>'],[Infinity,zone]])assert.deepEqual(Clock.details(instant,timeZone,true),{text:'Horário indisponível',title:'Horário indisponível',timestamp:''});
 for(const wiki of [true,false])for(const scope of ['top','cards','activity']){
  const output=Activity.profileMarkup(state,{...base,appearance:{showLocalTime:true,profilePlacements:{localTime:scope,name:'hidden'}}},wiki,scope);
  assert.match(output,/>10:42 \(UTC-4\)<\/(?:div|span)>/);
  assert.match(output,/data-perfilwiki-clock-at="2026-10-15T14:42:00.000Z"/);
  assert.match(output,wiki?/title="Horário salvo em 15\/10\/2026, 10:42 \(UTC-4\) · America\/New&#95;York"/:/title="Horário local em 15\/10\/2026, 10:42 \(UTC-4\) · America\/New_York"/);
  assert.doesNotMatch(output,/>Hora local:|>Horário salvo:/);
 }
});

class Element{
 constructor(tag='div'){this.tagName=tag;this.attributes={};this.style={};this.childNodes=[];this.parentNode=null;this.ownText='';}
 get children(){return this.childNodes;}get firstChild(){return this.childNodes[0]||null;}get id(){return this.getAttribute('id')||'';}set id(value){this.setAttribute('id',value);}get className(){return this.getAttribute('class')||'';}set className(value){this.setAttribute('class',value);}
 get textContent(){return this.ownText+this.childNodes.map(n=>n.textContent).join('');}set textContent(value){this.ownText=String(value);this.childNodes=[];}
 set innerHTML(_){assert.fail('Header painting must use the shared safe DOM renderer.');}
 getAttribute(key){return this.attributes[key]??null;}setAttribute(key,value){this.attributes[key]=String(value);}
 appendChild(node){return this.insertBefore(node,null);}insertBefore(node,next){if(node===next)return node;if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.childNodes.length:this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,node);node.parentNode=this;return node;}
 removeChild(node){const index=this.childNodes.indexOf(node);assert.ok(index>=0);this.childNodes.splice(index,1);node.parentNode=null;return node;}
 querySelectorAll(selector){const choices=selector.split(',').map(s=>s.trim()),found=[];function visit(parent){for(const child of parent.childNodes){if(choices.some(choice=>choice[0]==='#'?child.id===choice.slice(1):choice[0]==='.'?child.className.split(' ').includes(choice.slice(1)):choice==='[data-perfilwiki-group="true"]'&&child.getAttribute('data-perfilwiki-group')==='true'))found.push(child);visit(child);}}visit(this);return found;}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function fixture({group=true}={}){
 const body=new Element('body'),before=new Element('p'),after=new Element('p'),wrapper=new Element(),activity=new Element(),cards=new Element();before.id='before';before.textContent='Meu texto antes';after.id='after';after.textContent='Meu texto depois';
 wrapper.setAttribute('data-perfilwiki-user',user);if(group)wrapper.setAttribute('data-perfilwiki-group','true');activity.id='dan-pu-ritmo';cards.id='dan-pu-estatisticas';for(const root of [activity,cards])root.setAttribute('data-perfilwiki-user',user);
 body.appendChild(before);body.appendChild(wrapper);body.appendChild(after);wrapper.appendChild(cards);wrapper.appendChild(activity);
 const document={getElementById:id=>body.querySelector('#'+id),querySelectorAll:s=>body.querySelectorAll(s),createElement:tag=>new Element(tag)};
 return{body,before,after,wrapper,activity,cards,document};
}
function topOptions(extra={}){return{...base,...extra,appearance:{profilePlacements:{name:'top',location:'activity'},...extra.appearance}};}

test('header HTML and saved wiki use only selected top fields, share font size and do not duplicate CSS includes',()=>{
 assert.equal(Header.html(state,base),'');assert.equal(Header.wikitext(state,base),'');
 const options=topOptions({location:'[[Rio de Janeiro]]',appearance:{nameFontSize:32,profilePlacements:{name:'top',location:'activity'}}});
 for(const output of [Header.html(state,options),Header.wikitext(state,options)]){
  assert.match(output,/id="dan-pu-profile-header"/);assert.match(output,/data-perfilwiki-profile-top="true"/);assert.match(output,/data-perfilwiki-project="pt.wikipedia.org"/);assert.match(output,/dan-pu-top-profile-slot/);
  assert.match(output,/font-size:32px/);assert.match(output,/Marina Pesquisa/);assert.doesNotMatch(output,/Rio de Janeiro|templatestyles/);
 }
 const onlyTop=Header.html(state,topOptions({appearance:{showActivity:false,profilePlacements:{name:'top'}}}));assert.match(onlyTop,/Marina Pesquisa/);
});

test('header paint creates an owned safe DOM block above the first group and preserves user prose',()=>{
 const f=fixture(),options=topOptions({appearance:{nameFontSize:28,profilePlacements:{name:'top'},showLocalTime:true}});
 assert.equal(Header.paint(f.document,state,options),true);
 const header=f.document.getElementById('dan-pu-profile-header');assert.deepEqual(f.body.childNodes,[f.before,header,f.wrapper,f.after]);
 assert.equal(header.querySelector('.dan-pu-profile-label').textContent,'Marina Pesquisa');assert.equal(header.querySelector('.dan-pu-profile-label').style.fontSize,'28px');
 assert.equal(header.querySelector('.dan-pu-local-time').textContent,'10:42 (UTC-4)');assert.equal(header.querySelector('.dan-pu-local-time').getAttribute('data-perfilwiki-timezone'),zone);
 assert.equal(header.querySelector('.dan-pu-local-time').getAttribute('title'),Clock.details(now,zone).title);assert.equal(header.querySelector('.dan-pu-local-time').getAttribute('data-perfilwiki-clock-at'),now);
 assert.equal(f.before.textContent,'Meu texto antes');assert.equal(f.after.textContent,'Meu texto depois');
 Header.paint(f.document,state,{...options,displayName:'Nome atualizado'});assert.equal(f.document.getElementById('dan-pu-profile-header'),header);assert.match(header.textContent,/Nome atualizado/);
 assert.equal(Header.paint(f.document,state,base),true);assert.equal(f.document.getElementById('dan-pu-profile-header'),null);assert.deepEqual(f.body.childNodes,[f.before,f.wrapper,f.after]);
});

test('clock-only top header is compact in DOM, dated in the saved tooltip, and absent when disabled',()=>{
 const options={...base,appearance:{profilePlacement:'activity',showLocalTime:true}},f=fixture({group:false});
 Header.paint(f.document,null,options);const header=f.document.getElementById('dan-pu-profile-header');assert.ok(header);assert.equal(header.parentNode,f.wrapper);assert.equal(f.wrapper.childNodes[0],header);
 assert.equal(header.querySelector('.dan-pu-profile-label'),null);assert.match(header.textContent,/10:42 \(UTC-4\)/);
 const saved=Header.wikitext(state,options);assert.match(saved,/title=\"Horário salvo em 15\/10\/2026, 10:42 \(UTC-4\) · America\/New&#95;York\"/);assert.doesNotMatch(saved,/Hora local:/);
 assert.equal(Header.html(state,base),'');
});

test('header paint leaves a foreign or unmarked conflicting header untouched',()=>{
 for(const attributes of [{'data-perfilwiki-user':'Outra pessoa','data-perfilwiki-profile-top':'true'},{'data-perfilwiki-user':user}]){
  const f=fixture(),conflict=new Element();conflict.id='dan-pu-profile-header';for(const [key,value]of Object.entries(attributes))conflict.setAttribute(key,value);conflict.textContent='Texto alheio';f.body.insertBefore(conflict,f.wrapper);
  assert.equal(Header.paint(f.document,state,topOptions()),false);assert.equal(conflict.textContent,'Texto alheio');assert.equal(f.body.querySelectorAll('#dan-pu-profile-header').length,1);
 }
});

test('clock update touches only same-user clock rows in known roots and uses each selected zone exactly once',()=>{
 const f=fixture(),nestedForeign=new Element(),top=new Element();top.id='dan-pu-profile-header';top.setAttribute('data-perfilwiki-user',user);f.body.insertBefore(top,f.wrapper);nestedForeign.setAttribute('data-perfilwiki-user','Outra pessoa');f.activity.appendChild(nestedForeign);
 const add=(root,timeZone=zone)=>{const row=new Element();row.className='dan-pu-local-time';row.setAttribute('data-perfilwiki-timezone',timeZone);row.textContent='Original';root.appendChild(row);return row;};
 const a=add(f.activity),b=add(f.cards),c=add(top),foreign=add(nestedForeign),wrongZone=add(f.activity,'UTC'),outside=add(f.before);f.activity.appendChild(f.cards);
 assert.equal(Clock.update(f.document,now,user,zone),3);for(const row of [a,b,c])assert.equal(row.textContent,'10:42 (UTC-4)');for(const row of [foreign,wrongZone,outside])assert.equal(row.textContent,'Original');
 for(const row of [a,b,c]){assert.equal(row.getAttribute('title'),Clock.details(now,zone).title);assert.equal(row.getAttribute('data-perfilwiki-clock-at'),now);}
 for(const row of [foreign,wrongZone,outside])assert.equal(row.getAttribute('data-perfilwiki-clock-at'),null);
 assert.equal(Clock.update(f.document,now,'Outra pessoa',zone),0);
});
