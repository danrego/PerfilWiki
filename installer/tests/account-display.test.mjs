import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createInitialConfig, detectWikiAccount, displayNameFor, validateConfig, dashboardConfig, activationSnippet, profileSnippet, installFiles, profileTitle } from '../src/model.mjs';

function config(displayName = '') { return {...createInitialConfig(),user:'Editora Exemplo',displayName,timeZone:'UTC'}; }
function host(overrides = {}) {
  const values = {wgDBname:'ptwiki',wgUserName:'  E\u0301rica_Exemplo  ',...overrides};
  return {location:{hostname:'pt.wikipedia.org'},mw:{config:{get:key => values[key]}},fetch:() => {throw Error('No requests allowed');}};
}

test('same-page ptwiki context can prefill an account without any request', () => {
  const context = host();
  assert.equal(detectWikiAccount(context),'Érica Exemplo');
  const initial = createInitialConfig(context);
  assert.equal(initial.user,'Érica Exemplo');
  assert.equal(initial.displayName,'');
  assert.equal(displayNameFor(initial),'Érica Exemplo');
});

test('local, anonymous, other-wiki and unavailable contexts never infer a session', () => {
  const local = host();local.location.hostname='127.0.0.1';
  const other = host({wgDBname:'enwiki'});
  const unavailable = host();unavailable.mw.config.get=()=>{throw Error('Unavailable');};
  for(const value of [undefined,{},local,other,unavailable,host({wgUserName:null}),host({wgUserName:'Usuário:Nome'}),host({wgUserName:'A/B'})]) {
    assert.equal(detectWikiAccount(value),'');
  }
});

test('a display name follows the account by default and never changes destinations', () => {
  const first=config();assert.equal(displayNameFor(first),'Editora Exemplo');
  first.user='Outra Conta';assert.equal(displayNameFor(first),'Outra Conta');
  first.displayName='  Nome público  ';assert.equal(displayNameFor(first),'Nome público');
  assert.equal(profileTitle(first),'Usuário:Outra Conta');
  const exported=dashboardConfig(first);
  assert.equal(exported.user,'Outra Conta');assert.equal(exported.displayName,'Nome público');
  for(const file of installFiles(first)) assert.match(file.destination,/^Usuário:Outra Conta(?:\/common\.js)?$/);
});

test('display validation agrees with runtime limits and rejects wikitext markup', () => {
  assert.equal(validateConfig(config('🧩'.repeat(100))).valid,true);
  for(const value of [null,4,'🧩'.repeat(101),'A\nB','A\u0085B','<script>','{{x}}','[[x]]','A|B']) {
    assert.ok(validateConfig(config(value)).errors.displayName,JSON.stringify(value));
    assert.throws(()=>dashboardConfig(config(value)));
  }
});

test('custom display names are escaped in starter text and keep the actual loader identity', () => {
  const selected=config('  E\u0301rica "Pesquisa" & ~~~~ __NOTOC__  ');
  const markup=profileSnippet(selected);
  assert.match(markup,/Érica &quot;Pesquisa&quot; &amp; &#126;&#126;&#126;&#126; &#95;&#95;NOTOC&#95;&#95;/);
  assert.doesNotMatch(markup,/~~~~|__NOTOC__/);
  assert.match(markup,/data-perfilwiki-user="Editora Exemplo"/);
  const calls=[];
  const sandbox={window:{},mw:{config:{get:key=>({wgDBname:'ptwiki',wgAction:'view',wgNamespaceNumber:2,wgUserName:'Editora Exemplo',wgRelevantUserName:'Editora Exemplo'})[key]}},importScript:value=>calls.push(value)};
  vm.runInNewContext(activationSnippet(selected),sandbox);
  assert.equal(calls.length,1);
  assert.equal(sandbox.window.PerfilWikiConfig.user,'Editora Exemplo');
  assert.equal(sandbox.window.PerfilWikiConfig.displayName,'Érica "Pesquisa" & ~~~~ __NOTOC__');
});
