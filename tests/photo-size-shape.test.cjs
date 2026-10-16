'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Appearance=require('../src/Appearance.js');
const Text=require('../src/ProfileText.js');
const Activity=require('../src/ActivityView.js');
const USER='Marina Exemplo';
const SIZES=[64,96,128,160,200],SHAPES=['square','round'];
function options(appearance={}){return {user:USER,displayName:'Marina Pesquisa',photo:'Marina Exemplo.jpg',localPhotoPreview:true,appearance:{profilePlacement:'all',profilePlacements:{photo:'all'},...appearance}};}
class Element{
 constructor(tag='div'){this.tagName=tag;this.className='';this.attributes={};this.childNodes=[];this.style={};this.parentNode=null;this.ownText='';this.writes=[];}
 get firstChild(){return this.childNodes[0]||null;}
 set textContent(value){this.ownText=String(value);this.childNodes.forEach(child=>child.parentNode=null);this.childNodes=[];}
 get textContent(){return this.ownText+this.childNodes.map(child=>child.textContent).join('');}
 set innerHTML(_){assert.fail('Photo paint must keep safe DOM operations.');}
 setAttribute(key,value){this.attributes[key]=String(value);this.writes.push(key);}getAttribute(key){return this.attributes[key]??null;}
 appendChild(node){return this.insertBefore(node,null);}
 insertBefore(node,next){if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.childNodes.length:this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,node);node.parentNode=this;return node;}
 removeChild(node){const index=this.childNodes.indexOf(node);assert.ok(index>=0);this.childNodes.splice(index,1);node.parentNode=null;return node;}
 matches(selector){return selector[0]==='.'?this.className.split(' ').includes(selector.slice(1)):this.tagName===selector;}
 querySelector(selector){for(const child of this.childNodes){if(child.matches(selector))return child;const nested=child.querySelector(selector);if(nested)return nested;}return null;}
}
function fixture(){const roots=new Map(['dan-pu-profile-header','dan-pu-estatisticas','dan-pu-ritmo'].map(id=>{const element=new Element();element.setAttribute('data-perfilwiki-user',USER);return [id,element];}));return {roots:[...roots.values()],document:{getElementById:id=>roots.get(id)||null,createElement:tag=>new Element(tag)}};}

test('legacy appearance preserves 96px square photos while sizes and shapes reject coercion and hostile values',()=>{
 assert.equal(Appearance.normalize().photoSize,96);assert.equal(Appearance.normalize().photoShape,'square');
 const omitted=Appearance.normalize({photoSize:undefined,photoShape:undefined});assert.equal(omitted.photoSize,96);assert.equal(omitted.photoShape,'square');
 for(const photoSize of SIZES)for(const photoShape of SHAPES){const normalized=Appearance.normalize({photoSize,photoShape});assert.equal(normalized.photoSize,photoSize);assert.equal(normalized.photoShape,photoShape);}
 for(const photoSize of [null,true,'96',0,1,95,97,201,Infinity,NaN,{},[],'200;display:none'])assert.throws(()=>Appearance.normalize({photoSize}));
 for(const photoShape of [null,true,0,{},[],'circle','rounded','round" onclick="x'])assert.throws(()=>Appearance.normalize({photoShape}));
});

test('shared photo markup normalizes presentation and exports responsive visual separate from Commons caption',()=>{
 for(const photoSize of SIZES)for(const photoShape of SHAPES)for(const wiki of [false,true]){
  const markup=Text.photoMarkup(options({photoSize,photoShape}),wiki);
  assert.match(markup,new RegExp('data-photo-size="'+photoSize+'" data-photo-shape="'+photoShape+'"'));
  assert.match(markup,/class="dan-pu-profile-photo-visual">/);assert.match(markup,/<\/div><div class="dan-pu-profile-photo-caption">/);
  if(wiki)assert.match(markup,new RegExp('\\|'+photoSize+'x'+photoSize+'px\\|link='));
  else {assert.match(markup,/src="data:image\/svg\+xml,/);assert.match(markup,/crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"/);}
 }
 assert.match(Text.photoMarkup({photo:'Marina Exemplo.jpg'},false),/data-photo-size="96" data-photo-shape="square"/);
 assert.throws(()=>Text.photoMarkup(options({photoSize:99}),false));assert.throws(()=>Text.photoMarkup(options({photoShape:'circle'}),true));
});

test('each selected HTML and wiki scope carries size and shape without changing name or photo alignment',()=>{
 for(const scope of ['top','cards','activity'])for(const photoSize of SIZES)for(const photoShape of SHAPES)for(const wiki of [false,true]){
  const markup=Activity.profileMarkup({},options({photoSize,photoShape,photoAlignment:'right',nameAlignment:'center'}),wiki,scope);
  assert.match(markup,new RegExp('data-photo-size="'+photoSize+'" data-photo-shape="'+photoShape+'"'));
  assert.match(markup,/data-photo-align="right"/);assert.match(markup,/class="dan-pu-profile-label"[^>]*text-align:center/);
 }
});

test('safe DOM photo size and shape changes preserve all existing image nodes and never reassign sources',()=>{
 const f=fixture(),presentation=options();Activity.paintProfile(f.document,{},presentation);
 const images=f.roots.map(root=>root.querySelector('.dan-pu-profile-photo-image'));
 const photos=f.roots.map(root=>root.querySelector('.dan-pu-profile-photo'));
 for(const image of images)image.writes=[];
 for(const photoSize of SIZES)for(const photoShape of SHAPES){
  presentation.appearance.photoSize=photoSize;presentation.appearance.photoShape=photoShape;Activity.paintProfile(f.document,{},presentation);
  f.roots.forEach((root,index)=>{const photo=root.querySelector('.dan-pu-profile-photo'),image=photo.querySelector('.dan-pu-profile-photo-image');assert.equal(photo,photos[index]);assert.equal(image,images[index]);assert.equal(photo.getAttribute('data-photo-size'),String(photoSize));assert.equal(photo.getAttribute('data-photo-shape'),photoShape);assert.ok(!image.writes.includes('src'));assert.equal(photo.querySelector('.dan-pu-profile-photo-visual').querySelector('.dan-pu-profile-photo-image'),image);assert.equal(photo.querySelector('.dan-pu-profile-photo-caption').parentNode,photo);});
 }
});

test('old DOM photo without visual wrapper migrates without losing source, privacy attributes or failure placeholder',()=>{
 const f=fixture(),presentation=options();Activity.paintProfile(f.document,{},presentation);
 const images=f.roots.map(root=>root.querySelector('.dan-pu-profile-photo-image'));
 f.roots.forEach(root=>{const photo=root.querySelector('.dan-pu-profile-photo'),visual=photo.querySelector('.dan-pu-profile-photo-visual');while(visual.childNodes.length)photo.appendChild(visual.childNodes[0]);photo.removeChild(visual);});
 images.forEach(image=>image.writes=[]);presentation.appearance.photoShape='round';presentation.appearance.photoSize=200;Activity.paintProfile(f.document,{},presentation);
 f.roots.forEach((root,index)=>{const photo=root.querySelector('.dan-pu-profile-photo'),image=photo.querySelector('.dan-pu-profile-photo-image'),visual=photo.querySelector('.dan-pu-profile-photo-visual');assert.equal(image,images[index]);assert.equal(image.writes.includes('src'),false);assert.equal(image.getAttribute('crossorigin'),'anonymous');assert.equal(image.getAttribute('referrerpolicy'),'no-referrer');assert.equal(visual.querySelector('.dan-pu-profile-photo-placeholder').hidden,true);});
});

test('photo CSS supports native wiki images, caps width and masks only the square visual while captions remain readable',()=>{
 const css=fs.readFileSync(require.resolve('../src/PerfilWiki-estilos.css'),'utf8');
 assert.match(css,/\.dan-pu-profile-photo \{[^}]*max-width: 100%/);
 assert.match(css,/\.dan-pu-profile-photo-visual \{[^}]*position: relative;[^}]*padding-top: 100%/);
 assert.match(css,/\.dan-pu-profile-photo img \{[^}]*width: 100%; height: 100%; object-fit: cover/);
 assert.match(css,/\.dan-pu-profile-photo\[data-photo-shape="round"\] img,[\s\S]*?border-radius: 50%/);
 assert.doesNotMatch(css,/\.dan-pu-profile-photo\[data-photo-shape="round"\](?:\s*\{|[^\{]*caption)/);
 for(const size of [64,128,160,200])assert.match(css,new RegExp('\\.dan-pu-profile-photo\\[data-photo-size="'+size+'"\\] \\{ width: '+size+'px; \\}'));
});
