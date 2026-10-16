'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const LiveEdit=require('../src/LiveEdit.js');
const NONCE='a'.repeat(32),NOW=Date.parse('2026-10-15T14:42:00Z');

test('live editor URLs contain only a nonce and accept no caller-supplied destination',()=>{
  assert.equal(LiveEdit.installerUrl(NONCE),'https://danrego.github.io/PerfilWiki/INICIO.html?perfilwiki=handoff#perfilwiki-handoff='+NONCE);
  assert.equal(LiveEdit.nonceFromUrl(LiveEdit.installerUrl(NONCE)),NONCE);
  for(const url of ['https://evil.test/PerfilWiki/INICIO.html','https://danrego.github.io/other/INICIO.html','https://danrego.github.io/PerfilWiki/INICIO.html?perfilwiki=handoff&perfilwiki=handoff#perfilwiki-handoff='+NONCE,'https://user:secret@danrego.github.io/PerfilWiki/INICIO.html?perfilwiki=handoff#perfilwiki-handoff='+NONCE,LiveEdit.installerUrl(NONCE).replace(NONCE,'javascript:alert(1)')])assert.equal(LiveEdit.nonceFromUrl(url),null);
  for(const token of ['',null,'a'.repeat(31),'A'.repeat(32)])assert.throws(()=>LiveEdit.installerUrl(token));
  assert.equal(LiveEdit.localOrigin('http://127.0.0.1:8791'),true);
  for(const origin of ['https://localhost.evil.test','http://user@localhost','file://','http://localhost/path'])assert.equal(LiveEdit.localOrigin(origin),false);
});

test('data-only envelopes reject wrong nonce, expiry, prototypes, cycles and oversized multibyte content',()=>{
  const envelope=LiveEdit.envelope({user:'Marina Exemplo',appearance:{accent:'#123456'}},null,NONCE,NOW);
  assert.equal(LiveEdit.validateEnvelope(envelope,NONCE,NOW),envelope);
  for(const value of [{...envelope,nonce:'b'.repeat(32)},{...envelope,createdAt:NOW-LiveEdit.limits.lifetimeMs-1},{...envelope,createdAt:NOW+5001},{...envelope,extra:true},JSON.parse(JSON.stringify(envelope).replace('"appearance":','"__proto__":'))])assert.throws(()=>LiveEdit.validateEnvelope(value,NONCE,NOW));
  const cyclic={};cyclic.self=cyclic;assert.throws(()=>LiveEdit.envelope(cyclic,null,NONCE,NOW));
  assert.throws(()=>LiveEdit.envelope({content:'á'.repeat(LiveEdit.limits.bytes/2)},null,NONCE,NOW));
  assert.throws(()=>LiveEdit.envelope({execute:()=>{}},null,NONCE,NOW));
  assert.equal(LiveEdit.isSignal(LiveEdit.signal('ready',NONCE),'ready',NONCE),true);
  assert.equal(LiveEdit.isSignal({...LiveEdit.signal('ready',NONCE),extra:true},'ready',NONCE),false);
});

test('public source identity and title are retained and cannot be reassigned to another account',()=>{
  const value={origin:LiveEdit.wikiOrigin,user:'Marina Exemplo',page:{title:'Usuário:Marina Exemplo',revisionId:123,content:'{{Perfil}}\n[[Categoria:Usuários]]'}};
  assert.deepEqual(LiveEdit.source(value,'Marina Exemplo','Usuário:Marina Exemplo'),value);
  for(const source of [{...value,user:'Outra conta'},{...value,origin:'https://en.wikipedia.org'},{...value,page:{...value.page,title:'Usuário:Outra conta'}},{...value,page:{...value.page,revisionId:0}},{...value,page:{...value.page,content:'bad\u0000text'}},JSON.parse('{"origin":"https://pt.wikipedia.org","user":"Marina Exemplo","page":null,"__proto__":{}}')])assert.throws(()=>LiveEdit.source(source,'Marina Exemplo','Usuário:Marina Exemplo'));
});

test('managed replacement preserves every byte of arbitrary personal content outside PROFILE markers',()=>{
  const begin='<!-- PERFILWIKI-PROFILE-BEGIN -->',end='<!-- PERFILWIKI-PROFILE-END -->';
  const before='{{Cabeçalho}}\r\n== Sobre mim ==\n{| class="wikitable"\n| A || B\n|}\n';
  const after='\n<!-- PERFILWIKI-CONTENT-BEGIN -->\n{{Meta|a=b}}\n<!-- PERFILWIKI-CONTENT-END -->\n[[Categoria:Wikipedistas]]\n';
  const original=before+begin+'\nPAINEL ANTIGO\n'+end+after;
  const replacement='<!-- release -->\n'+begin+'\nNOVO PAINEL\n'+end+'\nTEXTO NOVO FORA DO BLOCO';
  assert.equal(LiveEdit.replaceProfile(original,replacement),before+begin+'\nNOVO PAINEL\n'+end+after);
  assert.equal(LiveEdit.managedBlock(replacement),begin+'\nNOVO PAINEL\n'+end);
  for(const damaged of ['painel legado sem marcas',begin,begin+end+begin+end,end+begin]){assert.equal(LiveEdit.hasProfile(damaged),false);assert.throws(()=>LiveEdit.replaceProfile(damaged,replacement));}
  assert.throws(()=>LiveEdit.replaceProfile(original,begin+end+begin+end));
});

test('only an unambiguous simple relative subpage can be followed from a main-page transclusion',()=>{
  assert.equal(LiveEdit.relativeSource('{{/PU}}\n[[Categoria:Wikipedistas]]'),'PU');
  assert.equal(LiveEdit.relativeSource('<!-- {{/Antiga}} -->\n{{/Meu perfil}}'),'Meu perfil');
  for(const content of ['{{/PU}}{{/Outra}}','{{/../PU}}','{{/PU/teste}}','{{Usuário:Outra/PU}}','{{/PU|x=y}}','<div id="dan-pu-ritmo"></div>{{/Outra}}'])assert.equal(LiveEdit.relativeSource(content),null);
  assert.equal(LiveEdit.containsPanel('<div id="dan-pu-estatisticas">'),true);
});

test('literal code regions and ordinary comments never become editable markers, IDs or transclusions',()=>{
  const begin='<!-- PERFILWIKI-PROFILE-BEGIN -->',end='<!-- PERFILWIKI-PROFILE-END -->',real=begin+'ATUAL'+end;
  for(const name of ['nowiki','pre','source','syntaxhighlight']){
    const example='<'+name+' lang="wikitext">'+begin+'EXEMPLO'+end+'\n<div id="dan-pu-ritmo">\n{{/Arquivo}}\n</'+name+'>';
    assert.equal(LiveEdit.hasProfile(example),false);assert.equal(LiveEdit.containsPanel(example),false);assert.equal(LiveEdit.relativeSource(example),null);
    assert.equal(LiveEdit.relativeSource(example+'\n{{/PU}}'),'PU');
    const original=example+'\n'+real+'\n[[Categoria:Preservada]]';
    assert.equal(LiveEdit.replaceProfile(original,begin+'NOVO'+end),example+'\n'+begin+'NOVO'+end+'\n[[Categoria:Preservada]]');
    for(const broken of ['<'+name+'>{{/Arquivo}}','</'+name+'>\n'+real,'<'+name+' lang="wikitext>\n'+real]){assert.equal(LiveEdit.hasProfile(broken),false);assert.equal(LiveEdit.relativeSource(broken),null);assert.throws(()=>LiveEdit.replaceProfile(broken,real));}
  }
  const comment='<!-- Exemplo: '+begin+'EXEMPLO'+end+' -->';
  // A comment with nested marker text is not a valid managed block.
  assert.equal(LiveEdit.hasProfile(comment),false);assert.equal(LiveEdit.containsPanel('<!-- <div id="dan-pu-ritmo"> -->'),false);
  assert.equal(LiveEdit.relativeSource('<!-- {{/Arquivo}} -->\n{{/PU}}'),'PU');
  assert.equal(LiveEdit.hasProfile('<!-- comentário sem fim\n'+real),false);
  assert.throws(()=>LiveEdit.replaceProfile('<!-- comentário sem fim\n'+real,real));
  assert.equal(LiveEdit.relativeSource('<nowiki/>\n{{/PU}}'),'PU');
  assert.equal(LiveEdit.relativeSource('{{Outro|{{/PU}}}}'),null);
  const quoted='<div title="'+begin+'EXEMPLO'+end+'">Texto</div>';
  assert.equal(LiveEdit.hasProfile(quoted),false);
  assert.equal(LiveEdit.replaceProfile(quoted+'\n'+real,begin+'NOVO'+end),quoted+'\n'+begin+'NOVO'+end);
});
