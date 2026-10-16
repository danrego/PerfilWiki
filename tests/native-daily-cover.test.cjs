'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Native=require('../src/NativeDailyCover.js');

test('native cover follows the same dynamic title as the ptwiki main page',()=>{
 const title='Wikipédia:Imagem em destaque/{{CURRENTDAY}} de {{CURRENTMONTHNAME}} de {{CURRENTYEAR}}';
 assert.equal(Native.pageTitle(),title);
 assert.equal(Native.transclusion(),'{{'+title+'|min=1200|max=1200}}');
 assert.equal(Object.isFrozen(Native),true);
 assert.doesNotMatch(Native.transclusion(),/subst:|safesubst:|\b20\d{2}\b|\d{4}-\d{2}-\d{2}/);
});

test('one existence guard prevents a missing daily page from creating a red link or a frozen filename',()=>{
 const output=Native.wikitext(),title=Native.pageTitle();
 assert.equal((output.match(/\{\{#ifexist:/g)||[]).length,1);
 assert.equal(output,'{{#ifexist:'+title+'\n|'+Native.transclusion()+'\n|<div class="dan-pu-profile-cover-pending">Imagem do dia indisponível</div>\n}}');
 assert.equal(output.split(title).length-1,2);
 assert.doesNotMatch(output,/\[\[(?:Ficheiro|Arquivo|Imagem):|#invoke:|https?:\/\/|<script|data-perfilwiki-daily-cover/);
});

test('UTC date changes select another native page without editing the saved user-page text',()=>{
 const output=Native.wikitext(),months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
 function expandDate(instant){const now=new Date(instant);return output.replaceAll('{{CURRENTDAY}}',String(now.getUTCDate())).replaceAll('{{CURRENTMONTHNAME}}',months[now.getUTCMonth()]).replaceAll('{{CURRENTYEAR}}',String(now.getUTCFullYear()));}
 const yesterday=expandDate('2026-12-31T23:59:59.000Z'),nextDay=expandDate('2027-01-01T00:00:00.000Z');
 assert.match(yesterday,/Wikipédia:Imagem em destaque\/31 de dezembro de 2026/);
 assert.match(nextDay,/Wikipédia:Imagem em destaque\/1 de janeiro de 2027/);
 assert.notEqual(yesterday,nextDay);
 assert.equal(output,Native.wikitext());
});

test('native caption names ptwiki and keeps the dynamic date and file-credit instructions together',()=>{
 const caption=Native.caption(true);
 assert.equal(caption,'[['+Native.pageTitle()+'|Imagem do dia da Wikipédia em português]] · {{CURRENTDAY}} de {{CURRENTMONTHNAME}} de {{CURRENTYEAR}} · Clique na imagem para ver o arquivo e os créditos.');
 assert.doesNotMatch(caption,/Commons|consultad|atualizad|\d{4}-\d{2}-\d{2}/);
 assert.equal(Native.caption(false),'Imagem do dia da Wikipédia em português · Prévia ilustrativa');
});

test('local native preview has the actual table structure and only an embedded synthetic illustration',()=>{
 const html=Native.preview();
 assert.match(html,/<div align="center"><table><tbody><tr><td><span class="imagem-destaque" typeof="mw:File"><a class="mw-file-description"/);
 assert.match(html,/alt="Prévia ilustrativa da imagem do dia da Wikipédia em português"/);
 const source=html.match(/src="([^"]+)"/)[1];
 assert.match(source,/^data:image\/svg\+xml,/);
 assert.match(decodeURIComponent(source),/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="1200" height="800"/);
 assert.equal((html.match(/<img /g)||[]).length,1);
 assert.doesNotMatch(html,/src="https?:|src="\/\/|href="https?:|<script|<iframe|onload=|onerror=|\{\{/);
});

test('portrait local fixture puts the description in the native sibling table cell',()=>{
 const html=Native.preview('portrait');
 assert.match(html,/<img width="600" height="1000"/);
 assert.match(html,/<\/span><\/td><td><p>Descrição ilustrativa da imagem do dia\.<\/p><\/td><\/tr>/);
 assert.equal((html.match(/<img /g)||[]).length,1);
 assert.doesNotMatch(html,/src="https?:|src="\/\/|href="https?:|<script|<iframe|onload=|onerror=/);
 assert.equal(Native.preview('<script>'),Native.preview());
});

test('browser module is pure and needs no MediaWiki, clock, network or account globals',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/NativeDailyCover.js'),'utf8');
 // A browser has one global object: window and globalThis refer to the same host.
 const context=vm.createContext({encodeURIComponent,Object});context.window=context;
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/I18n.js'),'utf8'),context);
 const before=Object.keys(context),window=context;
 vm.runInContext(source,context);
 assert.equal(window.PerfilWikiNativeDailyCover.wikitext(),Native.wikitext());
 assert.equal(window.PerfilWikiNativeDailyCover.preview(),Native.preview());
 assert.deepEqual(Object.keys(window).filter(key=>!before.includes(key)),['PerfilWikiNativeDailyCover']);
 assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|requestJson\s*\(|localStorage|sessionStorage|Date\s*\(|Date\.now|mw\.config|setTimeout|setInterval/);
});
