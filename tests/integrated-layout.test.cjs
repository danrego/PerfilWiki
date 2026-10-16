'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Appearance=require('../src/Appearance.js');
const Layout=require('../src/LayoutView.js');
const Activity=require('../src/ActivityView.js');
const Cards=require('../src/CardsView.js');
const Core=require('../src/PageviewsCore.js');
const fs=require('node:fs');
const user='Marina Exemplo',now='2026-10-15T14:42:00.000Z';
const entries=[[5,9,0,'Artigo Exemplo','2026-10-14T12:00:00.000Z',0]];
const config={user,project:'pt.wikipedia.org',timeZone:'UTC'};
const state={config,capturedAt:now,activity:{complete:true,identity:{user,project:config.project},entries,capturedAt:now,summary:Core.summarize(entries,{config,now})},statistics:{user,metrics:{edits:1,thanks:2}},pageviews:null};
const count=(text,needle)=>text.split(needle).length-1;

test('integrated is the default while explicit legacy layouts and field placements remain valid',()=>{
 assert.equal(Appearance.normalize().layout,'integrated');
 for(const layout of ['integrated','together','separate'])assert.equal(Appearance.normalize({layout}).layout,layout);
 assert.throws(()=>Appearance.normalize({layout:'nested;display:none'}));
 for(const blockOrder of ['cards-first','activity-first'])assert.equal(Appearance.footerOwner({blockOrder}),'activity');
 assert.equal(Appearance.footerOwner({showActivity:false}),'cards');
 assert.equal(Appearance.footerOwner({showCards:false}),'activity');
 assert.equal(Appearance.footerOwner({layout:'together',blockOrder:'activity-first'}),'cards');
 assert.equal(Appearance.fieldIn({profilePlacements:{name:'cards'}},'cards','name'),true);
 assert.equal(Appearance.fieldIn({profilePlacements:{name:'cards'}},'activity','name'),false);
});

test('shared composition nests exactly one set of cards after the unchanged header and before the chart',()=>{
 for(const format of ['html','wikitext'])for(const blockOrder of ['cards-first','activity-first']){
  const options={user,displayName:'Marina Pesquisa',now,appearance:{blockOrder,profilePlacement:'activity'}},activity=Activity[format](state,options),cards=Cards[format](state.statistics,state.activity,options);
  const result=Layout.compose(cards,activity,options.appearance),slot=Layout.slotMarkup(options.appearance);
  assert.equal(count(result,'id="dan-pu-ritmo"'),1);assert.equal(count(result,'id="dan-pu-estatisticas"'),1);
  assert.equal(count(result,'id="dan-pu-integrated-cards"'),1);assert.equal(count(result,'class="dan-pu-profile-label"'),1);
  assert.equal(count(result,'Gostou deste painel?'),1);assert.equal(result.includes(slot),false,'Cards fill the empty slot');
  const headerEnd=result.indexOf('Depois:'),cardPosition=result.indexOf('id="dan-pu-estatisticas"'),chartPosition=result.indexOf('>12 semanas</strong>');
  assert.ok(headerEnd<cardPosition&&cardPosition<chartPosition);
  const prefix='<div style="display:flex;flex-wrap:wrap;align-items:center;gap:20px;margin-bottom:25px;">';
  const legacy=Activity[format](state,{...options,appearance:{...options.appearance,layout:'together'}});
  const header=activity.slice(activity.indexOf(prefix),activity.indexOf(slot));
  assert.ok(legacy.includes(header),'Integration leaves title, profile, last edit and streak markup unchanged');
  if(format==='wikitext')assert.ok(result.startsWith('<templatestyles'));
 }
});

test('pending rendering has the same stable slot and single-panel visibility never leaves an empty nested layout',()=>{
 for(const format of ['html','wikitext']){
  const pending=Activity[format]({config},{user,now});
  assert.equal(count(pending,Layout.slotMarkup()),1);assert.ok(pending.indexOf('dan-pu-integrated-cards')<pending.indexOf('As estatísticas'));
  assert.match(Layout.compose('<div id="dan-pu-estatisticas">Números</div>',pending),/data-perfilwiki-cards-slot="true"><div id="dan-pu-estatisticas">/);
  for(const appearance of [{showCards:false},{showActivity:false}]){
   assert.equal(Layout.slotMarkup(appearance),'');assert.doesNotMatch(Activity[format]({config},{user,appearance}),/dan-pu-integrated-cards/);
  }
 }
 assert.equal(Layout.compose('CARDS','ACTIVITY',{showActivity:false}),'CARDS');
 assert.equal(Layout.compose('CARDS','ACTIVITY',{showCards:false}),'ACTIVITY');
 for(const layout of ['together','separate'])for(const blockOrder of ['cards-first','activity-first'])assert.equal(Layout.compose('CARDS','ACTIVITY',{layout,blockOrder}),blockOrder==='cards-first'?'CARDSACTIVITY':'ACTIVITYCARDS');
 assert.equal(Layout.compose('CARDS','UNRECOGNIZED'), 'CARDSUNRECOGNIZED');
 const literalCards='<div id="dan-pu-estatisticas">$& $` $\'</div>';
 assert.equal(Layout.compose(literalCards,'BEFORE'+Layout.slotMarkup()+'AFTER'),'BEFORE'+Layout.slotMarkup().slice(0,-6)+literalCards+'</div>AFTER');
 assert.throws(()=>Layout.compose({},'ACTIVITY'));
});

class Node{
 constructor(id='',attributes={}){this.id=id;this.attributes=attributes;this.children=[];this.childNodes=this.children;this.parentNode=null;this.textContent='';}
 getAttribute(key){return this.attributes[key]??null;}
 appendChild(node){if(node.parentNode)node.parentNode.removeChild(node);this.children.push(node);node.parentNode=this;return node;}
 removeChild(node){const index=this.children.indexOf(node);assert.ok(index>=0);this.children.splice(index,1);node.parentNode=null;return node;}
 insertBefore(node,next){if(node===next)return node;if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.children.length:this.children.indexOf(next);assert.ok(index>=0);this.children.splice(index,0,node);node.parentNode=this;return node;}
 querySelector(selector){for(const child of this.children){if(selector==='#'+child.id||selector.startsWith('.')&&(child.className||'').split(' ').includes(selector.slice(1)))return child;const nested=child.querySelector(selector);if(nested)return nested;}return null;}
}
function fixture({group=true,groupUser=user,cardUser=user,activityUser=user,indirect=false}={}){
 const outer=new Node('outer'),before=new Node('before'),after=new Node('after'),wrapper=new Node('group',group?{'data-perfilwiki-group':'true','data-perfilwiki-user':groupUser}:{});
 before.textContent='Texto antes';after.textContent='Texto depois';outer.appendChild(before);outer.appendChild(wrapper);outer.appendChild(after);
 const cards=new Node('dan-pu-estatisticas',{'data-perfilwiki-user':cardUser}),activity=new Node('dan-pu-ritmo',{'data-perfilwiki-user':activityUser}),slot=new Node('dan-pu-integrated-cards',{'data-perfilwiki-cards-slot':'true'}),chart=new Node('chart');
 activity.appendChild(slot);activity.appendChild(chart);wrapper.appendChild(cards);
 if(indirect){const nested=new Node('unowned');wrapper.appendChild(nested);nested.appendChild(activity);}else wrapper.appendChild(activity);
 const document={getElementById:id=>outer.querySelector('#'+id)};
 return{outer,before,after,wrapper,cards,activity,slot,chart,document};
}

test('DOM arrangement moves the actual cards node once and preserves external prose and chart order',()=>{
 const f=fixture();const identity=f.cards;
 assert.equal(Layout.arrange(f.document,{},user),true);assert.equal(f.cards,identity);assert.equal(f.cards.parentNode,f.slot);
 assert.deepEqual(f.wrapper.children,[f.activity]);assert.deepEqual(f.activity.children,[f.slot,f.chart]);
 assert.equal(Layout.arrange(f.document,{},user),false);assert.equal(f.slot.children.length,1);
 assert.deepEqual(f.outer.children,[f.before,f.wrapper,f.after]);assert.equal(f.before.textContent,'Texto antes');assert.equal(f.after.textContent,'Texto depois');
});

test('owned nested cards can return to siblings for a legacy layout or a cards-only switch',()=>{
 for(const appearance of [{layout:'together',blockOrder:'activity-first'},{layout:'together',blockOrder:'cards-first'},{layout:'separate',blockOrder:'activity-first'},{showActivity:false}]){
  const f=fixture();Layout.arrange(f.document,{},user);assert.equal(Layout.arrange(f.document,appearance,user),true);
  const expected=appearance.layout==='together'&&appearance.blockOrder==='activity-first'?[f.activity,f.cards]:[f.cards,f.activity];
  assert.deepEqual(f.wrapper.children,expected);assert.equal(f.cards.parentNode,f.wrapper);assert.equal(f.slot.children.length,0);
 }
});

test('independently placed, foreign-owned and arbitrary nested roots never move',()=>{
 for(const options of [{group:false},{groupUser:'Outra pessoa'},{cardUser:'Outra pessoa'},{activityUser:'Outra pessoa'},{indirect:true}]){
  const f=fixture(options),parent=f.cards.parentNode;
  assert.equal(Layout.arrange(f.document,{},user),false,JSON.stringify(options));assert.equal(f.cards.parentNode,parent);assert.equal(f.slot.children.length,0);
 }
 const f=fixture({group:false});f.slot.appendChild(f.cards);
 assert.equal(Layout.arrange(f.document,{},user),false);assert.equal(f.cards.parentNode,f.slot);
 assert.equal(Layout.arrange(f.document,{showActivity:false},user),true);assert.equal(f.cards.parentNode,f.wrapper);
 assert.deepEqual(f.wrapper.children,[f.cards,f.activity]);
});

test('after activity repaint the surviving cards node can be placed into the new owned slot',()=>{
 const f=fixture();Layout.arrange(f.document,{},user);f.wrapper.insertBefore(f.cards,f.activity);
 const fresh=new Node('dan-pu-ritmo',{'data-perfilwiki-user':user}),slot=new Node('dan-pu-integrated-cards',{'data-perfilwiki-cards-slot':'true'});fresh.appendChild(slot);
 f.wrapper.insertBefore(fresh,f.activity);f.wrapper.removeChild(f.activity);
 assert.equal(Layout.arrange(f.document,{},user),true);assert.equal(f.cards.parentNode,slot);assert.equal(slot.children[0],f.cards);
 const css=fs.readFileSync(require.resolve('../src/PerfilWiki-estilos.css'),'utf8');assert.match(css,/dan-pu-integrated-cards-slot > \.dan-pu-stats[^}]*margin: 0 0 20px !important;[^}]*border: 0 !important;/);
});


test('cold activity profile painting cannot remove or steal an independently placed nested card profile',()=>{
 const f=fixture();f.slot.appendChild(f.cards);
 const activityProfile=new Node();activityProfile.className='dan-pu-profile-slot';f.activity.insertBefore(activityProfile,f.slot);
 const cardProfile=new Node();cardProfile.className='dan-pu-cards-profile';const name=new Node();name.className='dan-pu-profile-label';name.textContent='Nome das caixas';cardProfile.appendChild(name);f.cards.appendChild(cardProfile);
 f.activity.style={};f.cards.style={};f.document.createElement=()=>assert.fail('Hidden activity metadata must not recreate or steal the card profile');
 const appearance={profilePlacements:{name:'cards',location:'hidden',accountCreated:'hidden',photo:'hidden'}};
 Activity.paintProfile(f.document,null,{user,displayName:'Nome atualizado',appearance},'activity');
 assert.equal(name.parentNode,cardProfile);assert.equal(name.textContent,'Nome das caixas');assert.equal(cardProfile.parentNode,f.cards);
 assert.equal(activityProfile.children.length,0);
});
