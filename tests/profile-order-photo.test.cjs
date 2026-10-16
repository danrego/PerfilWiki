'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Appearance=require('../src/Appearance.js');
const Activity=require('../src/ActivityView.js');
const USER='Marina Exemplo',NOW='2026-10-15T14:42:00.000Z',DATE='2007-08-20T00:00:00Z';
function state(){return {config:{user:USER,timeZone:'America/New_York'},statistics:{user:USER,metrics:{earliestRegistration:DATE},registrationCoverage:{version:1,user:USER,checkedAt:NOW,globalRegistration:DATE,accounts:[{registration:DATE}],complete:true},userGroups:{version:1,user:USER,project:'pt.wikipedia.org',checkedAt:NOW,groups:['*','autoconfirmed','rollbacker','user']}}};}
function options(extra={}){return {user:USER,displayName:'Marina Pesquisa',location:'[[Washington, D.C.|Washington, DC]]',photo:'Marina Exemplo.jpg',localPhotoPreview:true,timeZone:'America/New_York',now:NOW,customFields:[{label:'Alma mater',values:['[[GWU]]','[[MIT]]'],placement:'all'}],appearance:{profilePlacement:'all',profilePlacements:{photo:'all',localTime:'all'},showAccountCreated:true,showUserGroups:true,showLocalTime:true,...extra}};}
class Element {
 constructor(tag='div'){this.tagName=tag;this.childNodes=[];this.parentNode=null;this.className='';this.attributes={};this.style={};this.ownText='';}
 get id(){return this.attributes.id||'';} set id(value){this.attributes.id=value;}
 get firstChild(){return this.childNodes[0]||null;}get children(){return this.childNodes;}
 get textContent(){return this.ownText+this.childNodes.map(node=>node.textContent).join('');}
 set textContent(value){this.ownText=String(value);this.childNodes.forEach(node=>node.parentNode=null);this.childNodes=[];}
 set innerHTML(_){assert.fail('Profile paint must use safe DOM nodes.');}
 setAttribute(key,value){this.attributes[key]=String(value);}getAttribute(key){return this.attributes[key]??null;}
 appendChild(node){return this.insertBefore(node,null);}insertBefore(node,next){if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.childNodes.length:this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,node);node.parentNode=this;return node;}
 removeChild(node){const index=this.childNodes.indexOf(node);assert.ok(index>=0);this.childNodes.splice(index,1);node.parentNode=null;return node;}
 matches(selector){return selector[0]==='.'?this.className.split(' ').includes(selector.slice(1)):selector[0]==='#'?this.id===selector.slice(1):this.tagName===selector;}
 querySelectorAll(selector){return this.childNodes.flatMap(node=>[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function fixture(){const body=new Element('body');const roots=['dan-pu-profile-header','dan-pu-estatisticas','dan-pu-ritmo'].map(id=>{const root=new Element();root.id=id;root.setAttribute('data-perfilwiki-user',USER);body.appendChild(root);return root;});return {body,roots,document:{getElementById:id=>body.querySelector('#'+id),createElement:tag=>new Element(tag)}};}

test('photo alignment defaults left and validates independently from name alignment',()=>{
 assert.equal(Appearance.defaults.photoAlignment,'left');assert.equal(Appearance.normalize().photoAlignment,'left');
 assert.equal(Appearance.normalize({photoAlignment:undefined}).photoAlignment,'left');
 for(const photoAlignment of ['left','center','right'])for(const nameAlignment of ['left','center','right']){
  const result=Appearance.normalize({photoAlignment,nameAlignment});assert.equal(result.photoAlignment,photoAlignment);assert.equal(result.nameAlignment,nameAlignment);
 }
 for(const photoAlignment of [null,0,true,{},[],'both','right;display:none','center" onclick="x'])assert.throws(()=>Appearance.normalize({photoAlignment}));
});

test('HTML and wiki metadata ends in bold estatutos then account creation after all custom fields',()=>{
 for(const profileDetailsLayout of ['stacked','inline'])for(const scope of ['top','cards','activity'])for(const wiki of [false,true]){
  const output=Activity.profileMarkup(state(),options({profileDetailsLayout}),wiki,scope);
  const names=['dan-pu-profile-location-time','dan-pu-profile-field','dan-pu-user-groups','dan-pu-account-created'];
  for(let index=1;index<names.length;index++)assert.ok(output.indexOf(names[index-1])<output.indexOf(names[index]),profileDetailsLayout+'/'+scope+'/'+wiki);
  assert.match(output,/<strong style="font-weight:600;">Estatutos:<\/strong> Autoconfirmado · Reversor/);
  assert.match(output,/<strong style="font-weight:600;">Conta criada em:<\/strong> 20 de agosto de 2007/);
  assert.doesNotMatch(output,/<strong[^>]*>[^<]*(?:Reversor|2007)/);
  assert.match(output,/data-perfilwiki-account-created=/);assert.match(output,/data-perfilwiki-user-groups=/);
 }
});

test('partial and unavailable registration retain their qualified wording with only the label bold',()=>{
 const partial=state();partial.statistics.registrationCoverage.complete=false;partial.statistics.registrationCoverage.accounts.push({registration:null});
 for(const wiki of [false,true]){
  const output=Activity.profileMarkup(partial,options(),wiki,'top');
  assert.match(output,/<strong style="font-weight:600;">Data de criação mais antiga disponível:<\/strong> 20 de agosto de 2007/);
  assert.match(output,/Pode haver contas anteriores sem data registrada/);assert.doesNotMatch(output,/Conta criada em:/);
  const pending=Activity.profileMarkup({},options(),wiki,'top');
  assert.match(pending,/<strong style="font-weight:600;">Data de criação<\/strong> indisponível/);
  assert.match(pending,/<strong style="font-weight:600;">Estatutos:<\/strong> Aguardando dados/);
  assert.doesNotMatch(pending,/data-perfilwiki-account-created=|data-perfilwiki-user-groups=|2007/);
 }
});

test('all photo alignments reach each HTML and wiki scope without changing photo placement or name alignment',()=>{
 for(const photoAlignment of ['left','center','right'])for(const scope of ['top','cards','activity'])for(const wiki of [false,true]){
  const output=Activity.profileMarkup(state(),options({photoAlignment,nameAlignment:'right'}),wiki,scope);
  assert.match(output,new RegExp('class="dan-pu-profile-content"[^>]*data-photo-align="'+photoAlignment+'"'));
  assert.match(output,/class="dan-pu-profile-label"[^>]*text-align:right/);assert.match(output,/dan-pu-profile-photo/);
 }
 const output=Activity.profileMarkup(state(),options({photoAlignment:'right',profilePlacements:{photo:'top'}}),false,'activity');
 assert.doesNotMatch(output,/dan-pu-profile-photo/);assert.match(output,/data-photo-align="right"/);
});

test('safe DOM paints final metadata order and bold labels in every selected scope',()=>{
 const f=fixture();Activity.paintProfile(f.document,state(),options());
 for(const root of f.roots){
  const details=root.querySelector('.dan-pu-profile-details');
  assert.deepEqual(details.children.map(node=>node.className),['dan-pu-profile-location-time','dan-pu-profile-field','dan-pu-user-groups','dan-pu-account-created']);
  const groups=details.children[2],created=details.children[3];
  assert.equal(groups.children[0].tagName,'strong');assert.equal(groups.children[0].style.fontWeight,'600');assert.equal(groups.children[0].textContent,'Estatutos:');assert.equal(groups.textContent,'Estatutos: Autoconfirmado · Reversor');
  assert.equal(created.children[0].tagName,'strong');assert.equal(created.children[0].style.fontWeight,'600');assert.equal(created.children[0].textContent,'Conta criada em:');assert.equal(created.textContent,'Conta criada em: 20 de agosto de 2007');
 }
});

test('safe DOM changes photo alignment on existing nodes without moving text alignment or assigning new images',()=>{
 const f=fixture(),presentation=options({nameAlignment:'right'});Activity.paintProfile(f.document,state(),presentation);
 const photos=f.roots.map(root=>root.querySelector('.dan-pu-profile-photo'));
 for(const photoAlignment of ['right','center','left']){
  presentation.appearance.photoAlignment=photoAlignment;Activity.paintProfile(f.document,state(),presentation);
  f.roots.forEach((root,index)=>{
   const content=root.querySelector('.dan-pu-profile-content'),photo=root.querySelector('.dan-pu-profile-photo');
   assert.equal(content.getAttribute('data-photo-align'),photoAlignment);assert.equal(content.style.textAlign,'right');assert.equal(photo,photos[index]);
   assert.equal(content.children[0],photo);assert.equal(content.children[1].className,'dan-pu-profile-copy');
   const image=photo.querySelector('img');assert.equal(image.getAttribute('crossorigin'),'anonymous');assert.equal(image.getAttribute('referrerpolicy'),'no-referrer');assert.match(image.getAttribute('src'),/^data:image\/svg\+xml,/);
  });
 }
});

test('old plain saved account dates retain proof when migrated to bold labels and a new photo alignment',()=>{
 for(const bold of [false,true]){
  const f=fixture(),root=f.roots[0],created=new Element();created.className='dan-pu-account-created';created.setAttribute('data-perfilwiki-account-created',JSON.stringify({version:1,user:USER,timestamp:DATE,complete:true}));
  if(bold){const label=new Element('strong');label.textContent='Conta criada em:';created.appendChild(label);const value=new Element('span');value.textContent=' 20 de agosto de 2007';created.appendChild(value);}else created.textContent='Conta criada em: 20 de agosto de 2007';
  root.appendChild(created);Activity.paintProfile(f.document,{},options({photoAlignment:'center'}));
  for(const destination of f.roots){const current=destination.querySelector('.dan-pu-account-created');assert.equal(current.textContent,'Conta criada em: 20 de agosto de 2007');assert.equal(current.querySelector('strong').textContent,'Conta criada em:');assert.equal(JSON.parse(current.getAttribute('data-perfilwiki-account-created')).user,USER);}
 }
});

test('photo alignment CSS keeps center above text, right beside text and mobile wrapping scoped to owned profiles',()=>{
 const css=fs.readFileSync(require.resolve('../src/PerfilWiki-estilos.css'),'utf8');
 assert.match(css,/\.dan-pu-profile-content\[data-photo-align="right"\] \{ flex-direction: row-reverse; \}/);
 assert.match(css,/\.dan-pu-profile-content\[data-photo-align="center"\] \{ flex-direction: column; align-items: center; \}/);
 assert.match(css,/\.dan-pu-profile-content\[data-photo-align="center"\] > \.dan-pu-profile-copy \{ align-self: stretch; \}/);
 assert.match(css,/@media \(max-width: 400px\)[\s\S]*\.dan-pu-profile-content\[data-photo-align="right"\] > \.dan-pu-profile-photo \{ margin-left: auto; \}/);
});
