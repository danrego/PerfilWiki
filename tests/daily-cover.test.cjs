'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Daily=require('../src/DailyCover.js'),Appearance=require('../src/Appearance.js'),Text=require('../src/ProfileText.js'),Header=require('../src/ProfileHeaderView.js'),Configuration=require('../src/Configuration.js');
const now='2026-10-15T14:42:00.000Z',date='2026-10-15';
const feed={image:{title:'File:Commons_example.jpg',file_page:'https://evil.test/ignored',artist:{text:'Autora Exemplo',html:'<script>bad()</script>'},license:{type:'CC BY-SA 4.0',url:'javascript:bad()'},thumbnail:{source:'https://evil.test/ignored.jpg'},image:{source:'https://evil.test/ignored2.jpg'}}};
const proof=Daily.fromFeed(feed,date,now);
test('daily cover defaults to manual, validates its source and never changes the statistics identity',()=>{
 assert.equal(Appearance.normalize().coverSource,'manual');assert.equal(Appearance.normalize({coverSource:undefined}).coverSource,'manual');
 for(const coverSource of ['manual','daily'])assert.equal(Appearance.normalize({coverSource}).coverSource,coverSource);
 for(const coverSource of [null,1,'url(x)','featured',{}])assert.throws(()=>Appearance.normalize({coverSource}));
 const metrics=source=>Configuration.resolve({config:{get:()=> 'Marina Exemplo'}},{PerfilWikiConfig:{timeZone:'UTC',appearance:{coverSource:source}}}).metrics;
 assert.deepEqual(metrics('daily'),metrics('manual'));
});
test('feed normalization reads only a safe Commons filename and bounded plain credit fields',()=>{
 assert.deepEqual(proof,{version:1,date,filename:'Commons example.jpg',checkedAt:now,artist:'Autora Exemplo',license:'CC BY-SA 4.0'});
 const malicious=structuredClone(feed);malicious.image.artist.text='{{transclusion}}';malicious.image.license.type='<script>x</script>';
 assert.deepEqual(Daily.fromFeed(malicious,date,now),{version:1,date,filename:'Commons example.jpg',checkedAt:now});
 for(const title of ['File:../evil.jpg','File:Bad.jpg|link=evil','File:Bad.jpg?bad','File:Bad%2ejpg','File:Bad.png\n','File:Bad.txt','https://evil.test/a.jpg','Bad.jpg'])assert.equal(Daily.fromFeed({image:{title}},date,now),null,title);
 for(const data of [null,[],{}, {image:null},{image:[]},{image:{title:42}}])assert.equal(Daily.fromFeed(data,date,now),null);
});
test('daily proofs reject noncanonical dates, future checks, unknown fields and unbounded metadata',()=>{
 assert.deepEqual(Daily.normalize(proof,now),proof);
 for(const patch of [{date:'2026-10-16'},{date:'2026-02-30'},{date:'2026-2-03'},{date:'1999-12-31'},{checkedAt:'2026-10-15T14:42:01.000Z'},{checkedAt:'2026-10-15T14:42:00Z'},{checkedAt:'invalid'}, {version:2},{filename:'File:Commons example.jpg'},{filename:'Commons_example.jpg'},{artist:'x'.repeat(201)},{license:'x'.repeat(121)},{other:'value'}])assert.equal(Daily.normalize({...proof,...patch},now),null,JSON.stringify(patch));
 assert.equal(Daily.normalize({...proof,date:'2026-10-15',checkedAt:'2026-10-14T14:00:00.000Z'},now),null);
});
test('the feed transport allows only the exact anonymous dated ptwiki endpoint',()=>{
 const allowed=Daily.url(date,now);assert.equal(allowed,'https://pt.wikipedia.org/api/rest_v1/feed/featured/2026/10/15');assert.equal(Configuration.requestAllowed(allowed),true);
 for(const url of [allowed+'?token=x',allowed+'?x=1',allowed+'#fragment',allowed.replace('https:','http:'),allowed.replace('pt.wikipedia.org','commons.wikimedia.org'),allowed.replace('pt.wikipedia.org','user:pass@pt.wikipedia.org'),allowed.replace('pt.wikipedia.org','pt.wikipedia.org:8080'),allowed.replace('/15','/32'),allowed.replace('/10/15','/02/30'),allowed.replace('/featured/','/onthisday/'),allowed+'/'])assert.equal(Configuration.requestAllowed(url),false,url);
 for(const invalid of ['2026-10-16','2026-02-30','2026-1-01','1999-01-01'])assert.equal(Daily.url(invalid,now),'');
});
test('daily local illustrations avoid remote images while initial wiki waits for an actual Commons filename',()=>{
 const options={user:'Marina Exemplo',coverImage:'Preserved manual.jpg',appearance:{coverSource:'daily'},localCoverPreview:true,now};
 const local=Text.coverInfo(options);assert.equal(local.filename,'');assert.equal(local.href,'');assert.match(local.src,/^data:image\/svg\+xml,/);assert.equal(local.caption,'Imagem do dia do Commons · Prévia ilustrativa');
 const html=Text.coverMarkup(options,false);assert.match(html,/Prévia ilustrativa/);assert.doesNotMatch(html,/Preserved|https:\/\/(?:commons|evil)/);
 for(const output of [Text.coverMarkup({...options,localCoverPreview:false},true),Text.coverMarkup(options,true)]){assert.match(output,/dan-pu-profile-cover-pending/);assert.doesNotMatch(output,/\[\[Ficheiro:|<img|data:image|src=""/);}
 const pending=Header.wikitext({config:{user:'Marina Exemplo'}},{...options,localCoverPreview:false});assert.match(pending,/data-perfilwiki-cover-source="daily"/);assert.match(pending,/Aguardando consulta/);
});
test('resolved daily covers calculate their own image and credit URLs and label stale images with their real date',()=>{
 const options={now,user:'Marina Exemplo',appearance:{coverSource:'daily'},dailyCover:proof};
 const info=Text.coverInfo(options);assert.equal(info.src,'https://commons.wikimedia.org/wiki/Special:FilePath/Commons_example.jpg?width=1200');assert.equal(info.href,'https://commons.wikimedia.org/wiki/File:Commons_example.jpg');
 for(const wiki of [false,true]){const output=Text.coverMarkup(options,wiki);assert.match(output,/15\/10\/2026/);assert.match(output,/Ver arquivo e créditos/);assert.match(output,/data-perfilwiki-daily-cover=/);assert.doesNotMatch(output,/evil\.test|bad\(\)|javascript:|<script>|artist\.html/);}
 const stale=Text.coverMarkup({...options,now:'2026-10-16T14:42:00.000Z'},true);assert.match(stale,/15\/10\/2026/);assert.doesNotMatch(stale,/16\/10\/2026|imagem de hoje/i);
 const wiki=Text.coverMarkup({...options,dailyCover:{...proof,artist:"O'Nome ~ Assinatura"}},true);assert.doesNotMatch(wiki,/O'Nome ~ Assinatura/);assert.match(wiki,/&#39;Nome &#126;/);
});
