'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Sections=require('../src/ProfileSections.js');

test('personal section drafts normalize without changing body markup, newlines or trailing whitespace',()=>{
 const content="Texto de '''exemplo''' com [[História]].\r\n\r\n* Meta um\r\n{{Predefinição|a=1}}\r\n<div class=\"exemplo\">Mais texto</div>  ";
 assert.deepEqual(Sections.normalize(),[]);assert.deepEqual(Sections.normalize([{title:'',content:''}]),[]);
 assert.deepEqual(Sections.normalize([{title:'  Metas  ',content}]),[{title:'Metas',content}]);
 assert.deepEqual(Sections.normalize([{title:'Pesquisadora',content:''}]),[{title:'Pesquisadora',content:''}]);
 const wiki=Sections.wikitext([{title:'Metas',content}],{user:'Marina Exemplo'});
 assert.ok(wiki.includes('\n'+content+'\n</div>'));assert.match(wiki,/\n== Metas ==\n/);
 assert.equal((wiki.match(/PERFILWIKI-CONTENT-BEGIN/g)||[]).length,1);
 assert.doesNotMatch(wiki,/PERFILWIKI-PROFILE|dan-pu-ritmo|Aguardando dados/);
});

test('personal section bounds and reserved marker rejection fail before installation',()=>{
 for(const value of [null,{},'texto',[null],[{title:'A'}],[{title:'A',content:2}],[{title:'A',content:'',extra:true}],[{title:'',content:'Sem título'}],[{title:'== Código ==',content:'A'}],[{title:'A',content:'x'.repeat(50001)}],[{title:'A',content:'\x00'}],[{title:'A',content:'<!-- PERFILWIKI-PROFILE-END -->'}]])assert.throws(()=>Sections.normalize(value));
 assert.throws(()=>Sections.normalize(Array.from({length:9},()=>({title:'A',content:''}))));
 assert.throws(()=>Sections.normalize(Array.from({length:5},()=>({title:'A',content:'x'.repeat(50000)}))));
 assert.equal(Sections.normalize([{title:'😀'.repeat(100),content:'x'.repeat(50000)}])[0].content.length,50000);
 assert.throws(()=>Sections.normalize([{title:'😀'.repeat(101),content:''}]));
});

test('local personal preview formats common wiki text and keeps advanced code inert',()=>{
 const body="Parágrafo com '''negrito''' e ''itálico'' e [[História|pesquisa]].\n\n* Meta um\n* Meta dois\n\n=== Projeto ===\n{{Progresso|5|10}}\n<script>window.secret=true</script>\n<img src=\"https://example.test/x\" onerror=\"bad()\">\n[[Ficheiro:Imagem.jpg|thumb|Exemplo]]\n[javascript:bad() inseguro]";
 const html=Sections.html([{title:'Metas',content:body}],{user:'Marina Exemplo'});
 assert.match(html,/<strong>negrito<\/strong>/);assert.match(html,/<em>itálico<\/em>/);assert.match(html,/<ul><li>Meta um<\/li><li>Meta dois<\/li><\/ul>/);assert.match(html,/<h4>Projeto<\/h4>/);
 assert.match(html,/href="https:\/\/pt\.wikipedia\.org\/wiki\/Hist%C3%B3ria"/);
 assert.match(html,/&lt;script&gt;/);assert.match(html,/\{\{Progresso\|5\|10\}\}/);
 assert.doesNotMatch(html,/<(?:script|img)\b|<[^>]+\sonerror=|href="javascript:/);
 assert.match(html,/data-perfilwiki-edit-section="0"/);assert.match(html,/Prévia simplificada/);
});

test('local preview keeps external links bounded and displays wiki tables without interpreting them',()=>{
 const html=Sections.preview('[https://example.test/fonte Fonte]\n[https://name:password@example.test/ Não]\n\n{| class="wikitable"\n! Nome !! Número\n|-\n| Exemplo || 10\n|}');
 assert.match(html,/href="https:\/\/example.test\/fonte"/);assert.doesNotMatch(html,/href="https:\/\/name:/);
 assert.match(html,/<summary>Tabela em wikitexto<\/summary>/);assert.doesNotMatch(html,/<table/);
});

test('titles and account labels cannot inject HTML, wiki signatures or magic words',()=>{
 const html=Sections.html([{title:'Meu "texto"',content:'Bem-vindo'}],{user:'" onclick="bad'});
 assert.match(html,/data-perfilwiki-user="&quot; onclick=&quot;bad"/);assert.doesNotMatch(html,/data-perfilwiki-user="" onclick=/);
 const wiki=Sections.wikitext([{title:"''Texto'' ~~~~ __TOC__",content:'Preservado'}]);
 assert.doesNotMatch(wiki,/~~~~|__TOC__|== ''Texto''/);assert.match(wiki,/Preservado/);
});

test('maximum malformed drafts are previewed without repeated delimiter scans or code execution',()=>{
 const start=performance.now();
 for(const content of ['<'.repeat(50000),'{{'.repeat(25000),'[['.repeat(25000),'Texto '.repeat(8000)]){
  const markup=Sections.html([{title:'Rascunho',content}]);assert.match(markup,/dan-pu-content-section/);assert.doesNotMatch(markup,/<script\b/);
 }
 assert.ok(performance.now()-start<1000,'Bounded malformed drafts should not stall local typing');
});
