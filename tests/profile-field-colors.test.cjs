'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Fields=require('../src/ProfileFields.js');
const Activity=require('../src/ActivityView.js');
const Configuration=require('../src/Configuration.js');
const Core=require('../src/PageviewsCore.js');
const USER='Marina Exemplo',NOW='2026-10-15T14:42:00.000Z';
const group=extra=>({label:'Alma mater',values:['Em [[GWU]]','[[MIT]]','Pesquisa'],layout:'inline',separator:'pipe',placement:'all',...extra});
const fieldColors={labelColor:'#a52a2a',valueColors:['#2454a6','#246342','']};
function options(extra={}){return {user:USER,displayName:'Marina Pesquisa',timeZone:'UTC',now:NOW,location:'[[Brasília]]',customFields:[group(fieldColors),{label:'Interesse',value:'Em [[História]]',labelColor:'#8654a4',valueColor:'#885522',placement:'all'},{label:'Pesquisa',values:[],labelColor:'#5544aa',placement:'all'}],appearance:{profilePlacement:'all',showAccountCreated:true,showUserGroups:true,labelColor:'#123456',informationColor:'#654321',...extra}};}
function state(){const config={user:USER,timeZone:'UTC',project:'pt.wikipedia.org'},entries=[[1,1,0,'Artigo de exemplo','2026-10-14T12:00:00Z',0]];return {config,capturedAt:NOW,statistics:{user:USER,metrics:{}},activity:{complete:true,identity:{user:USER,project:config.project},entries,summary:Core.summarize(entries,{config,now:NOW})}};}

test('independent colors normalize safely, retain item alignment and leave old field shapes unchanged',()=>{
 const old={label:'Pesquisa',value:'Bibliotecas'};
 assert.deepEqual(Fields.normalize([old]),[old]);
 assert.deepEqual(Fields.normalize([{...old,labelColor:'',valueColor:''}]),[old]);
 assert.deepEqual(Fields.normalize([{...old,labelColor:undefined,valueColor:undefined}]),[old]);
 assert.deepEqual(Fields.normalize([group({valueColors:['','',''],labelColor:''})]),[group()]);
 const input=group({values:[' ','Em [[GWU]]','',' [[MIT]] '],valueColors:['#ff0000','#ABCDEF','#00ff00',''],labelColor:'#Aa2211'});
 const expected=group({values:['Em [[GWU]]','[[MIT]]'],valueColors:['#abcdef',''],labelColor:'#aa2211'});
 const before=JSON.stringify(input),normalized=Fields.normalize([input]);
 assert.deepEqual(normalized,[expected]);assert.equal(JSON.stringify(input),before);
 assert.deepEqual(Fields.valueColors(input),['#abcdef','']);
 normalized[0].valueColors[0]='#ffffff';assert.equal(input.valueColors[1],'#ABCDEF');
 const fromHelper=Fields.valueColors(input);fromHelper[0]='#ffffff';assert.deepEqual(Fields.valueColors(input),['#abcdef','']);
 assert.deepEqual(Fields.valueColors({...old,valueColor:'#ABCDEF'}),['#abcdef']);
 assert.deepEqual(Fields.valueColors({label:'Pesquisa',values:[],valueColors:[]}),[]);
});

test('color validation rejects injection, ambiguous schema, sparse arrays and mismatched raw lengths before filtering',()=>{
 const invalid=[null,7,false,{},[],'red','#abc','#ffffffff',' #abcdef','#abcdef ','#abcdef;display:none','url(x)','var(--x)','" onmouseover="x'];
 for(const value of invalid){
  assert.throws(()=>Fields.normalize([group({labelColor:value})]),TypeError,String(value));
  assert.throws(()=>Fields.normalize([{label:'Pesquisa',value:'Texto',valueColor:value}]),TypeError,String(value));
  assert.throws(()=>Fields.normalize([group({valueColors:[value,'','']})]),TypeError,String(value));
 }
 for(const valueColors of [null,'#abcdef',[],[''],['','','',''],['',undefined,''],Array(3)])assert.throws(()=>Fields.normalize([group({valueColors})]),TypeError);
 assert.throws(()=>Fields.normalize([group({values:['','Texto'],valueColors:['#123456']})]),TypeError,'Lengths refer to raw values, before blanks are filtered');
 assert.throws(()=>Fields.normalize([group({valueColor:'#123456'})]),TypeError);
 assert.throws(()=>Fields.normalize([{label:'X',value:'Y',valueColors:['#123456']}]),TypeError);
 assert.throws(()=>Fields.normalize([group({informationColor:'#123456'})]),TypeError);
 assert.throws(()=>Fields.normalize([{label:'',value:'',labelColor:'red'}]),TypeError,'Empty draft rows cannot bypass color validation');
});

test('absent per-field overrides retain exact prior markup and independent global inheritance',()=>{
 assert.equal(Activity.customFieldMarkup({label:'Pesquisa',value:'Bibliotecas'},false),'<div class="dan-pu-profile-field"><span style="font-weight:600;">Pesquisa:</span> Bibliotecas</div>');
 assert.equal(Activity.customFieldMarkup({label:'Pesquisa',value:'Bibliotecas',labelColor:'',valueColor:''},true),'<div class="dan-pu-profile-field"><span style="font-weight:600;">Pesquisa:</span> Bibliotecas</div>');
 const ordinary=Activity.customFieldMarkup(group(),false,{labelColor:'#123456',informationColor:'#654321'});
 assert.match(ordinary,/<span style="font-weight:600;color:#123456;">Alma mater:<\/span>/);
 assert.match(ordinary,/<a href="https:\/\/pt\.wikipedia\.org\/wiki\/GWU" style="color:#654321;">GWU<\/a>/);
 assert.equal(Activity.customFieldMarkup(group({labelColor:'',valueColors:['','','']}),false,{labelColor:'#123456',informationColor:'#654321'}),ordinary);
});

test('labels and every information item render independently in each scope and layout, including safe wikilinks',()=>{
 for(const scope of ['top','cards','activity'])for(const layout of ['inline','lines','bullets'])for(const wiki of [false,true]){
  const input=options({topBackground:'#111111'});input.customFields[0].layout=layout;
  const output=Activity.profileMarkup(state(),input,wiki,scope);
  assert.match(output,/<span style="font-weight:600;color:#a52a2a;">Alma mater:<\/span>/);
  assert.match(output,/<span style="font-weight:600;color:#8654a4;">Interesse:<\/span>/);
  assert.match(output,/<span style="font-weight:600;color:#5544aa;">Pesquisa<\/span>/);
  assert.match(output,/<span style="color:#2454a6;">Em /,'Plain text and linked text share the per-item color');
  assert.match(output,/<span style="color:#246342;">/);
  if(wiki){assert.match(output,/\[\[:GWU\|<span style="color:#2454a6;">GWU<\/span>\]\]/);assert.match(output,/\[\[:MIT\|<span style="color:#246342;">MIT<\/span>\]\]/);assert.match(output,/\[\[:História\|<span style="color:#885522;">História<\/span>\]\]/);}
  else {assert.match(output,/<a href="https:\/\/pt\.wikipedia\.org\/wiki\/GWU" style="color:#2454a6;">GWU<\/a>/);assert.match(output,/<a href="https:\/\/pt\.wikipedia\.org\/wiki\/MIT" style="color:#246342;">MIT<\/a>/);assert.match(output,/<a href="https:\/\/pt\.wikipedia\.org\/wiki\/Hist%C3%B3ria" style="color:#885522;">História<\/a>/);}
  assert.match(output,/<strong style="font-weight:600;color:#123456;">Estatutos:<\/strong>/,'Unrelated automatic metadata keeps the global label color');
 }
 const escaped=Activity.customFieldMarkup({label:'Área "A" & B',value:'[[Categoria:Ciência|Ciência & arte]]',labelColor:'#ABCDEF',valueColor:'#123456'},true);
 assert.match(escaped,/Área &quot;A&quot; &amp; B:/);assert.match(escaped,/\[\[:Categoria:Ciência\|<span style="color:#123456;">Ciência &amp; arte<\/span>\]\]/);
 for(const wiki of [false,true])assert.throws(()=>Activity.customFieldMarkup(group({labelColor:'#ffffff;display:none'}),wiki),TypeError);
});

test('full activity rendering preserves selected per-field blue colors under another dashboard accent',()=>{
 const input=options({accent:'#a52a2a'});input.customFields=[group({labelColor:'#3366cc',valueColors:['#3366cc','#2454a6','']})];
 for(const output of [Activity.html(state(),input),Activity.wikitext(state(),input)]){
  assert.match(output,/border-top:3px solid #a52a2a/);assert.match(output,/<span style="font-weight:600;color:#3366cc;">Alma mater:<\/span>/);assert.match(output,/<span style="color:#3366cc;">Em /);assert.match(output,/<span style="color:#2454a6;">/);
 }
});

class Element{
 constructor(tag='div'){this.tagName=tag;this.childNodes=[];this.attributes={};this.style={};this.parentNode=null;this.ownText='';}
 get id(){return this.attributes.id||'';}set id(value){this.setAttribute('id',value);}
 get className(){return this.attributes.class||'';}set className(value){this.setAttribute('class',value);}
 get firstChild(){return this.childNodes[0]||null;}get children(){return this.childNodes;}
 get textContent(){return this.ownText+this.childNodes.map(node=>node.textContent).join('');}set textContent(value){this.ownText=String(value);this.childNodes=[];}
 set innerHTML(_){assert.fail('Field colors must use safe DOM nodes.');}
 getAttribute(key){return this.attributes[key]??null;}setAttribute(key,value){this.attributes[key]=String(value);}
 appendChild(node){return this.insertBefore(node,null);}insertBefore(node,next){if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.childNodes.length:this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,node);node.parentNode=this;return node;}
 removeChild(node){const index=this.childNodes.indexOf(node);assert.ok(index>=0);this.childNodes.splice(index,1);node.parentNode=null;return node;}
 matches(selector){return selector[0]==='.'?this.className.split(/\s+/).includes(selector.slice(1)):selector[0]==='#'?this.id===selector.slice(1):this.tagName===selector;}
 querySelectorAll(selector){return this.childNodes.flatMap(node=>[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function fixture(){const body=new Element('body'),roots=['dan-pu-profile-header','dan-pu-estatisticas','dan-pu-ritmo'].map(id=>{const root=new Element();root.id=id;root.setAttribute('data-perfilwiki-user',USER);body.appendChild(root);return root;});const counter=new Element('strong');counter.textContent='999';counter.style.color='#aabbcc';roots[1].appendChild(counter);return {body,roots,counter,document:{getElementById:id=>body.querySelector('#'+id),createElement:tag=>new Element(tag)}};}

test('safe DOM refresh retains distinct item colors while reset follows current global colors and scope defaults',()=>{
 const f=fixture(),input=options({topBackground:'#111111'});assert.equal(Activity.paintProfile(f.document,state(),input),true);
 for(const root of f.roots){
  const [grouped,legacy,labelOnly]=root.querySelectorAll('.dan-pu-profile-field');
  assert.equal(grouped.children[0].style.color,'#a52a2a');assert.equal(legacy.children[0].style.color,'#8654a4');assert.equal(labelOnly.children[0].style.color,'#5544aa');
  const values=grouped.querySelectorAll('.dan-pu-field-item');assert.equal(values[0].style.color,'#2454a6');assert.equal(values[1].style.color,'#246342');assert.equal(values[2].style.color,undefined);
  assert.equal(values[0].querySelector('a').getAttribute('style'),'color:#2454a6;');assert.equal(values[1].querySelector('a').getAttribute('style'),'color:#246342;');
  assert.equal(legacy.children[1].style.color,'#885522');assert.equal(legacy.querySelector('a').getAttribute('style'),'color:#885522;');
 }
 input.customFields[0].labelColor='';input.customFields[0].valueColors=['','#246342',''];input.appearance.labelColor='#334455';input.appearance.informationColor='#778899';
 Activity.paintProfile(f.document,state(),input);
 for(const root of f.roots){const row=root.querySelector('.dan-pu-profile-field'),items=row.querySelectorAll('.dan-pu-field-item');assert.equal(row.children[0].style.color,'#334455');assert.equal(items[0].style.color,undefined);assert.equal(items[0].querySelector('a').getAttribute('style'),'color:#778899;');assert.equal(items[1].querySelector('a').getAttribute('style'),'color:#246342;');}
 input.customFields=input.customFields.map(field=>({...field,labelColor:'',...(field.values?{valueColors:field.values.map(()=>'')}:{valueColor:''})}));input.appearance.labelColor='';input.appearance.informationColor='';
 Activity.paintProfile(f.document,state(),input);
 f.roots.forEach((root,index)=>{assert.equal(root.querySelector('.dan-pu-profile-details').style.color,index===0?'#ffffff':'#54595d');for(const row of root.querySelectorAll('.dan-pu-profile-field'))assert.equal(row.children[0].style.color,undefined);for(const link of root.querySelector('.dan-pu-profile-details').querySelectorAll('a'))assert.equal(link.getAttribute('style'),null);});
 assert.equal(f.counter.style.color,'#aabbcc');assert.equal(f.counter.textContent,'999');assert.equal(f.counter.parentNode,f.roots[1]);
 f.roots.forEach(root=>root.setAttribute('data-perfilwiki-user','Outra pessoa'));const before=f.body.textContent;assert.equal(Activity.paintProfile(f.document,state(),options()),false);assert.equal(f.body.textContent,before);
});

test('presentation-only field colors do not alter metric identity or caches',()=>{
 const resolve=customFields=>Configuration.resolve({config:{get:()=>USER}},{PerfilWikiConfig:{user:USER,timeZone:'UTC',customFields}});
 const selected=resolve(options().customFields),ordinary=resolve([]);
 assert.deepEqual(selected.customFields,Fields.normalize(options().customFields));assert.deepEqual(selected.metrics,ordinary.metrics);
 assert.equal(Object.hasOwn(selected.metrics,'labelColor'),false);assert.equal(Object.hasOwn(selected.metrics,'valueColors'),false);assert.equal(Object.hasOwn(selected.metrics,'customFields'),false);
});

test('installation checker validates canonical per-item colors in all scopes and rejects altered label or value styling',async()=>{
 const {createInitialConfig,profileSnippet,RELEASE_VERSION}=await import('../installer/src/model.mjs');
 const {installationPlan,inspectInstallation}=await import('../installer/src/installation-check.mjs');
 for(const layout of ['inline','lines','bullets'])for(const profileDetailsLayout of ['inline','stacked']){
  const initial=createInitialConfig(),input=options({profileDetailsLayout}),config={...initial,...input,customFields:input.customFields.map(field=>({...field,...(field.values?{layout}:{})})),appearance:{...initial.appearance,...input.appearance}},plan=installationPlan(config);
  const page=source=>({title:plan.profileTitle,contentmodel:'wikitext',revisions:[{slots:{main:{content:source}}}]}),original=profileSnippet(config);
  const inspect=source=>inspectInstallation(plan,new Map([[plan.profileTitle,page(source)]]),{version:RELEASE_VERSION,files:[]}).find(row=>row.id==='profile').status;
  assert.equal(inspect(original),'ok',layout+'/'+profileDetailsLayout);
  for(const [before,after]of [
   ['font-weight:600;color:#a52a2a;','font-weight:600;color:#000000;'],
   ['<span style="color:#2454a6;">Em ','<span style="color:#000000;">Em '],
   ['<span style="color:#246342;">MIT</span>','<span style="color:#000000;">MIT</span>'],
   ['font-weight:600;color:#5544aa;','font-weight:600;color:#000000;'],
  ]){const changed=original.replace(before,after);assert.notEqual(changed,original);assert.equal(inspect(changed),'different');}
 }
});
