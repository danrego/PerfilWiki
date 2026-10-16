'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Appearance=require('../src/Appearance.js');
const Text=require('../src/ProfileText.js');
const Header=require('../src/ProfileHeaderView.js');
const Activity=require('../src/ActivityView.js');
const user='Marina Exemplo',state={config:{user,timeZone:'UTC'}};
const hidden={name:'hidden',location:'hidden',photo:'hidden',accountCreated:'hidden',localTime:'hidden'};

test('cover filenames share the photo validator and fixed Commons image address',()=>{
 assert.equal(Text.normalizeCover,Text.normalizePhoto);
 assert.equal(Text.normalizeCover(' Ficheiro:Minha_capa.JPG '),'Minha capa.JPG');
 assert.equal(Text.coverSource('Minha capa.JPG'),'https://commons.wikimedia.org/wiki/Special:FilePath/Minha_capa.JPG?width=1200');
 assert.equal(Text.coverSource(''),'');
 for(const filename of ['https://example.test/a.jpg','../a.jpg','File:a.svg|onerror=x','a.jpg?width=3','a%2ejpg','[[a.jpg]]','a.txt','a.jpg\n']){
  assert.throws(()=>Text.normalizeCover(filename),filename);assert.equal(Text.coverInfo({coverImage:filename}),null,filename);
 }
});

test('cover previews contain only a local landscape while exported images keep privacy attributes',()=>{
 const options={coverImage:'Capa exemplo.svg',displayName:'Marina Pesquisa'};
 const remote=Text.coverInfo(options),local=Text.coverInfo({...options,localCoverPreview:true});
 assert.equal(remote.filename,'Capa exemplo.svg');assert.equal(remote.alt,'Capa do perfil de Marina Pesquisa');
 assert.match(remote.src,/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/Capa_exemplo\.svg\?width=1200$/);
 assert.match(local.src,/^data:image\/svg\+xml,/);assert.doesNotMatch(decodeURIComponent(local.src).replace('xmlns="http://www.w3.org/2000/svg"',''),/href=|https?:\/\//);
 const output=Text.coverMarkup(options,false);
 for(const attribute of ['crossorigin="anonymous"','referrerpolicy="no-referrer"','loading="lazy"','decoding="async"','width="1200"','height="300"'])assert.ok(output.includes(attribute));
 assert.match(output,/class="dan-pu-profile-cover-placeholder" hidden/);assert.match(output,/data-perfilwiki-cover="Capa exemplo.svg"/);
});

test('saved covers use an explicit Commons link and escape wikitext delimiters in captions',()=>{
 const output=Text.coverMarkup({coverImage:'Capa exemplo.png',displayName:'Nome [[X]] | {{Y}}'},true);
 assert.match(output,/\[\[Ficheiro:Capa exemplo\.png\|1200px\|link=https:\/\/commons\.wikimedia\.org\/wiki\/File:Capa_exemplo\.png\|alt=/);
 assert.doesNotMatch(output,/\[\[X\]\]|\{\{Y\}\}|src=|data:image/);
 assert.match(output,/&#91;&#91;X&#93;&#93; &#124; &#123;&#123;Y&#125;&#125;/);
 assert.equal(Text.coverMarkup({},false),'');
});

test('top background normalization rejects style injections and keeps readable colors across the spectrum',()=>{
 assert.equal(Appearance.normalize().topBackground,'#ffffff');assert.equal(Appearance.normalize({topBackground:'#Aa00BB'}).topBackground,'#aa00bb');
 for(const topBackground of ['red','#fff','#ffffff;display:none','url(x)',null,42])assert.throws(()=>Appearance.normalize({topBackground}));
 for(const topBackground of ['#ffffff','#000000','#808080','#777777','#ff0000','#00ff00','#0000ff','#6854a4','#ffeecc']){
  const colors=Appearance.topColors({topBackground});assert.equal(colors.background,topBackground);
  assert.ok(Appearance.contrast(colors.background,colors.foreground)>=4.5,topBackground);
  assert.ok(Appearance.contrast(colors.background,colors.link)>=4.5,topBackground);
  assert.equal(colors.tone,colors.foreground==='#ffffff'?'dark':'light');
 }
});

test('a cover can create its own top block without any profile fields and is above the retained empty slot',()=>{
 const options={user,coverImage:'Cover.svg',appearance:{profilePlacements:hidden}};
 for(const output of [Header.html(state,options),Header.wikitext(state,options)]){
  assert.match(output,/dan-pu-cover-only/);assert.ok(output.indexOf('data-perfilwiki-cover="Cover.svg"')<output.indexOf('class="dan-pu-top-profile-slot"'));
  assert.match(output,/<div class="dan-pu-top-profile-slot"><\/div>/);assert.doesNotMatch(output,/dan-pu-profile-label|templatestyles/);
 }
 assert.equal(Header.html(state,{...options,coverImage:''}),'');
 assert.equal(Header.coverInfo,Text.coverInfo);assert.equal(Header.coverMarkup,Text.coverMarkup);
});

test('custom top colors affect top identity text without changing activity or card identity colors',()=>{
 const options={user,displayName:'Marina Pesquisa',location:'[[História]]',appearance:{topBackground:'#202122',profilePlacement:'all'}};
 const header=Header.html(state,options);
 assert.match(header,/dan-pu-top-dark/);assert.match(header,/background:#202122;color:#ffffff;/);assert.match(header,/class="dan-pu-profile-label" style="color:#ffffff;/);
 assert.match(header,/class="dan-pu-profile-details" style="margin-top:6px;color:#ffffff;/);
 for(const scope of ['activity','cards'])assert.match(Activity.profileMarkup(state,options,false,scope),/class="dan-pu-profile-label" style="color:#54595d;/);
 assert.equal(Header.rootStyle(options.appearance),'border-top-color:#3366cc;background:#202122;color:#ffffff;');
});

class Element{
 constructor(tag='div'){this.tagName=tag;this.attributes={};this.style={};this.childNodes=[];this.parentNode=null;this.ownText='';}
 get firstChild(){return this.childNodes[0]||null;}get id(){return this.getAttribute('id')||'';}set id(value){this.setAttribute('id',value);}get className(){return this.getAttribute('class')||'';}set className(value){this.setAttribute('class',value);}
 get textContent(){return this.ownText+this.childNodes.map(n=>n.textContent).join('');}set textContent(value){this.ownText=String(value);this.childNodes=[];}
 set innerHTML(_){assert.fail('Cover updates must use safe DOM nodes.');}
 getAttribute(key){return this.attributes[key]??null;}setAttribute(key,value){this.attributes[key]=String(value);}
 appendChild(node){return this.insertBefore(node,null);}insertBefore(node,next){if(node===next)return node;if(node.parentNode)node.parentNode.removeChild(node);const index=next===null?this.childNodes.length:this.childNodes.indexOf(next);assert.ok(index>=0);this.childNodes.splice(index,0,node);node.parentNode=this;return node;}
 removeChild(node){const index=this.childNodes.indexOf(node);assert.ok(index>=0);this.childNodes.splice(index,1);node.parentNode=null;return node;}
 querySelectorAll(selector){const choices=selector.split(',').map(s=>s.trim()),found=[];function visit(parent){for(const child of parent.childNodes){if(choices.some(choice=>choice[0]==='#'?child.id===choice.slice(1):choice[0]==='.'?child.className.split(' ').includes(choice.slice(1)):choice==='[data-perfilwiki-group="true"]'&&child.getAttribute('data-perfilwiki-group')==='true'))found.push(child);visit(child);}}visit(this);return found;}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function fixture(){const body=new Element('body'),panel=new Element();panel.id='dan-pu-ritmo';panel.setAttribute('data-perfilwiki-user',user);body.appendChild(panel);return{body,panel,document:{getElementById:id=>body.querySelector('#'+id),querySelectorAll:s=>body.querySelectorAll(s),createElement:tag=>new Element(tag)}};}

test('safe DOM header painting inserts, updates, clears and restores cover-only output without duplicates',()=>{
 const f=fixture(),options={user,coverImage:'Capa.jpg',localCoverPreview:true,appearance:{profilePlacements:hidden,topBackground:'#000000'}};
 assert.equal(Header.paint(f.document,state,options),true);
 const root=f.document.getElementById('dan-pu-profile-header'),cover=root.querySelector('.dan-pu-profile-cover'),image=cover.querySelector('.dan-pu-profile-cover-image');
 assert.equal(root.style.background,'#000000');assert.equal(root.style.color,'#ffffff');assert.equal(root.firstChild,cover);assert.match(root.className,/dan-pu-cover-only/);
 assert.equal(image.getAttribute('crossorigin'),'anonymous');assert.match(image.getAttribute('src'),/^data:/);assert.ok(root.querySelector('.dan-pu-top-profile-slot'));
 Header.paint(f.document,state,{...options,displayName:'Outro nome'});assert.equal(root.querySelector('.dan-pu-profile-cover'),cover);assert.equal(image.getAttribute('alt'),'Capa do perfil de Outro nome');
 Header.paint(f.document,state,{...options,coverImage:'Outra.png',appearance:{topBackground:'#ffffff'}});
 assert.equal(f.document.getElementById('dan-pu-profile-header'),root);assert.equal(root.querySelectorAll('.dan-pu-profile-cover').length,1);assert.equal(root.querySelector('.dan-pu-profile-cover').getAttribute('data-perfilwiki-cover'),'Outra.png');
 assert.equal(root.querySelector('.dan-pu-profile-label').style.color,'#000000');assert.doesNotMatch(root.className,/dan-pu-cover-only/);
 Header.paint(f.document,state,{...options,coverImage:'',appearance:{}});assert.equal(root.querySelector('.dan-pu-profile-cover'),null);assert.ok(root.querySelector('.dan-pu-profile-label'));
 Header.paint(f.document,state,{...options,coverImage:''});assert.equal(f.document.getElementById('dan-pu-profile-header'),null);assert.deepEqual(f.body.childNodes,[f.panel]);
});

test('photo defaults to the top independently of global profile placement while explicit legacy choices remain usable',()=>{
 assert.equal(Appearance.defaults.profilePlacements.photo,'top');
 for(const profilePlacement of ['activity','cards','both','all'])for(const scope of ['top','activity','cards'])assert.equal(Appearance.fieldIn({profilePlacement},scope,'photo'),scope==='top');
 assert.equal(Appearance.fieldIn({profilePlacement:'activity',profilePlacements:{photo:'inherit'}},'activity','photo'),true);
 for(const placement of ['cards','all','top-cards'])assert.equal(Appearance.normalize({profilePlacements:{photo:placement}}).profilePlacements.photo,placement);
});
