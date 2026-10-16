'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Appearance=require('../src/Appearance.js');
const Activity=require('../src/ActivityView.js');
const Header=require('../src/ProfileHeaderView.js');
const Text=require('../src/ProfileText.js');
const Clock=require('../src/ProfileClock.js');
const Configuration=require('../src/Configuration.js');
const Core=require('../src/PageviewsCore.js');
const USER='Marina Exemplo',NOW='2026-10-15T14:42:00.000Z';
const colors={nameColor:'#3366cc',labelColor:'#246342',informationColor:'#6854a4'};
function options(extra={}){return {user:USER,displayName:'Marina Pesquisa',timeZone:'America/New_York',now:NOW,location:'[[Washington, DC|Washington]]',photo:'Example.jpg',localPhotoPreview:true,customFields:[{label:'Alma mater',values:['[[GWU]]','[[MIT]]'],placement:'all'}],appearance:{profilePlacement:'all',profilePlacements:{photo:'all',localTime:'all'},showLocalTime:true,showAccountCreated:true,showUserGroups:true,...colors,...extra}};}
function state(){const entries=[[1,1,0,'Example','2026-10-14T12:00:00Z',0]],config={user:USER,timeZone:'America/New_York',project:'pt.wikipedia.org'};return {config,capturedAt:NOW,statistics:{user:USER,metrics:{edits:9}},activity:{identity:{user:USER,project:'pt.wikipedia.org'},entries,complete:true,capturedAt:NOW,summary:Core.summarize(entries,{config,now:NOW})}};}
class Element{
 constructor(tag='div'){this.tagName=tag;this.childNodes=[];this.attributes={};this.style={};this.parentNode=null;this.ownText='';}
 get id(){return this.attributes.id||'';}set id(value){this.setAttribute('id',value);}
 get className(){return this.attributes.class||'';}set className(value){this.setAttribute('class',value);}
 get firstChild(){return this.childNodes[0]||null;}get children(){return this.childNodes;}
 get textContent(){return this.ownText+this.childNodes.map(node=>node.textContent).join('');}set textContent(value){this.ownText=String(value);this.childNodes=[];}
 set innerHTML(_){assert.fail('Profile colors must use safe DOM nodes.');}
 getAttribute(key){return this.attributes[key]??null;}setAttribute(key,value){this.attributes[key]=String(value);}
 appendChild(node){return this.insertBefore(node,null);}insertBefore(node,next){if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.childNodes.length:this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,node);node.parentNode=this;return node;}
 removeChild(node){const index=this.childNodes.indexOf(node);assert.ok(index>=0);this.childNodes.splice(index,1);node.parentNode=null;return node;}
 matches(selector){return selector[0]==='.'?this.className.split(/\s+/).includes(selector.slice(1)):selector[0]==='#'?this.id===selector.slice(1):this.tagName===selector;}
 querySelectorAll(selector){return this.childNodes.flatMap(node=>[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function fixture(){const body=new Element('body'),roots=['dan-pu-profile-header','dan-pu-estatisticas','dan-pu-ritmo'].map(id=>{const root=new Element();root.id=id;root.setAttribute('data-perfilwiki-user',USER);body.appendChild(root);return root;});const counter=new Element('strong');counter.textContent='999';counter.style.color='#aabbcc';roots[1].appendChild(counter);return {body,roots,counter,document:{getElementById:id=>body.querySelector('#'+id),createElement:tag=>new Element(tag)}};}

test('profile text colors default to automatic, normalize independently and reject injected or ambiguous CSS',()=>{
 for(const key of Object.keys(colors)){
  assert.equal(Appearance.defaults[key],'');assert.equal(Appearance.normalize({[key]:undefined})[key],'');
  assert.equal(Appearance.normalize({[key]:'#AbCdEf'})[key],'#abcdef');
  for(const value of [null,0,false,{},[],'auto','red','#fff','#ffffff00',' #ffffff','#ffffff ','#ffffff;display:none','url(x)','var(--color)','" onmouseover="x'])assert.throws(()=>Appearance.normalize({[key]:value}),key+' '+String(value));
 }
 const resolve=appearance=>Configuration.resolve({config:{get:()=>USER}},{PerfilWikiConfig:{user:USER,appearance}});
 assert.deepEqual({...resolve(colors).metrics},{...resolve({}).metrics});
 for(const [key,value]of Object.entries(colors))assert.equal(resolve(colors).appearance[key],value);
 assert.equal(Appearance.normalize({coverSource:'wiki-daily'}).coverSource,'wiki-daily');
});

test('name, labels and information reach every HTML and wiki profile scope including linked values',()=>{
 for(const scope of ['top','cards','activity'])for(const wiki of [false,true]){
  const output=Activity.profileMarkup(state(),options({topBackground:'#111111'}),wiki,scope);
  assert.match(output,/class="dan-pu-profile-label" style="color:#3366cc;/);
  assert.match(output,/class="dan-pu-profile-details" style="margin-top:6px;color:#6854a4;/);
  assert.match(output,/<span style="font-weight:600;color:#246342;">Alma mater:<\/span>/);
  assert.match(output,/<strong style="font-weight:600;color:#246342;">Estatutos:<\/strong> Aguardando dados/);
  assert.match(output,/<strong style="font-weight:600;color:#246342;">Data de criação<\/strong> indisponível/);
  assert.match(output,/>10:42 \(UTC-4\)<\/span>/);
  if(wiki){assert.match(output,/\[\[:Washington, DC\|<span style="color:#6854a4;">Washington<\/span>\]\]/);assert.match(output,/\[\[:MIT\|<span style="color:#6854a4;">MIT<\/span>\]\]/);}
  else {assert.match(output,/<a href="https:\/\/pt\.wikipedia\.org\/wiki\/Washington%2C_DC" style="color:#6854a4;">Washington<\/a>/);assert.match(output,/<a href="https:\/\/pt\.wikipedia\.org\/wiki\/MIT" style="color:#6854a4;">MIT<\/a>/);}
 }
 const header=Header.wikitext(state(),options());assert.match(header,/color:#3366cc/);assert.match(header,/color:#246342/);assert.match(header,/color:#6854a4/);
});

test('automatic label colors stay independent from chosen information colors on light and dark scopes',()=>{
 for(const scope of ['top','cards','activity'])for(const topBackground of ['#ffffff','#111111'])for(const wiki of [false,true]){
  const output=Activity.profileMarkup(state(),options({nameColor:'',labelColor:'',informationColor:'#123456',topBackground}),wiki,scope);
  const automatic=scope==='top'?Appearance.topColors({topBackground}).foreground:'#54595d';
  assert.ok(output.includes('class="dan-pu-profile-label" style="color:'+automatic+';'));
  assert.ok(output.includes('<span style="font-weight:600;color:'+automatic+';">Alma mater:</span>'));
  assert.ok(output.includes('<strong style="font-weight:600;color:'+automatic+';">Estatutos:</strong>'));
 }
 const automatic=Activity.profileMarkup(state(),options({nameColor:'',labelColor:'',informationColor:'',topBackground:'#111111'}),false,'top');
 assert.match(automatic,/class="dan-pu-profile-details" style="margin-top:6px;color:#ffffff;/);assert.match(automatic,/<span style="font-weight:600;">Alma mater:<\/span>/);assert.doesNotMatch(automatic,/<a[^>]*style=/);
});

test('full activity rendering preserves deliberately chosen blue profile text under a different dashboard accent',()=>{
 const input=options({accent:'#a52a2a',nameColor:'#3366cc',labelColor:'#3366cc',informationColor:'#3366cc'});
 for(const output of [Activity.html(state(),input),Activity.wikitext(state(),input)]){
  assert.match(output,/border-top:3px solid #a52a2a/);assert.match(output,/class="dan-pu-profile-label" style="color:#3366cc;/);
  assert.match(output,/class="dan-pu-profile-details" style="margin-top:6px;color:#3366cc;/);assert.match(output,/<span style="font-weight:600;color:#3366cc;">Alma mater:<\/span>/);
 }
});

test('colored profile links keep titles and labels escaped and never accept CSS through the shared link API',()=>{
 const input='[[:Categoria:História|História & "A"]]';
 assert.equal(Text.html(input,'#ABCDEF'),'<a href="https://pt.wikipedia.org/wiki/Categoria%3AHist%C3%B3ria" style="color:#abcdef;">História &amp; &quot;A&quot;</a>');
 assert.equal(Text.wikitext(input,'#ABCDEF'),'[[:Categoria:História|<span style="color:#abcdef;">História &amp; &quot;A&quot;</span>]]');
 const root=new Element(),document={createElement:tag=>new Element(tag)};Text.append(document,root,input,'#ABCDEF');assert.equal(root.children[0].getAttribute('style'),'color:#abcdef;');assert.equal(root.textContent,'História & "A"');
 for(const color of [null,'red','#abc','#ffffff;display:none','" onload="x'])for(const render of [()=>Text.html(input,color),()=>Text.wikitext(input,color),()=>Text.append(document,root,input,color)])assert.throws(render,TypeError);
 assert.equal(root.children.length,1,'Rejected colors must not append a partial fragment');
});

test('safe DOM repaint updates owned profile colors, resets automatic defaults and preserves photos, counters and clock updates',()=>{
 const f=fixture(),input=options({topBackground:'#111111'});assert.equal(Activity.paintProfile(f.document,state(),input),true);
 const photos=f.roots.map(root=>root.querySelector('.dan-pu-profile-photo'));
 f.roots.forEach(root=>{
  assert.equal(root.querySelector('.dan-pu-profile-label').style.color,colors.nameColor);
  const details=root.querySelector('.dan-pu-profile-details');assert.equal(details.style.color,colors.informationColor);
  assert.equal(root.querySelector('.dan-pu-profile-field').children[0].style.color,colors.labelColor);
  assert.equal(root.querySelector('.dan-pu-user-groups').children[0].style.color,colors.labelColor);
  assert.equal(root.querySelector('.dan-pu-account-created').children[0].style.color,colors.labelColor);
  for(const link of details.querySelectorAll('a'))assert.equal(link.getAttribute('style'),'color:'+colors.informationColor+';');
 });
 Clock.update(f.document,'2026-10-15T14:43:00.000Z',USER,'America/New_York');
 f.roots.forEach(root=>{assert.equal(root.querySelector('.dan-pu-local-time').textContent,'10:43 (UTC-4)');assert.equal(root.querySelector('.dan-pu-profile-details').style.color,colors.informationColor);});
 input.appearance={...input.appearance,nameColor:'',labelColor:'',informationColor:''};Activity.paintProfile(f.document,state(),input);
 f.roots.forEach((root,index)=>{const automatic=index===0?'#ffffff':'#54595d';assert.equal(root.querySelector('.dan-pu-profile-label').style.color,automatic);assert.equal(root.querySelector('.dan-pu-profile-details').style.color,automatic);assert.equal(root.querySelector('.dan-pu-profile-photo'),photos[index]);for(const link of root.querySelector('.dan-pu-profile-details').querySelectorAll('a'))assert.equal(link.getAttribute('style'),null);});
 assert.equal(f.counter.style.color,'#aabbcc');assert.equal(f.counter.textContent,'999');assert.equal(f.counter.parentNode,f.roots[1]);
});

test('foreign profile roots are untouched when the configured owner changes text colors',()=>{
 const f=fixture();f.roots.forEach(root=>root.setAttribute('data-perfilwiki-user','Outra pessoa'));
 assert.equal(Activity.paintProfile(f.document,state(),options()),false);
 assert.equal(f.body.querySelectorAll('.dan-pu-profile-label').length,0);assert.equal(f.counter.style.color,'#aabbcc');
});
