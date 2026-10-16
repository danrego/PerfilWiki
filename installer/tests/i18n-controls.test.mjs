import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const localRequire=createRequire(import.meta.url);
const esbuild=createRequire(localRequire.resolve('vite/package.json'))('esbuild');
const bundle=await esbuild.build({stdin:{contents:`export {ColorPicker} from './ColorPicker.jsx'; export {InstallationCheck} from './InstallationCheck.jsx'; export {ProfilePreview} from './DashboardPreview.jsx'; export {LanguageProvider,I18n} from './i18n.jsx';`,resolveDir:new URL('../src/',import.meta.url).pathname,loader:'jsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
const compiled={exports:{}};
vm.runInNewContext(bundle.outputFiles[0].text,{module:compiled,exports:compiled.exports,require:localRequire,Intl,Date,URL,TextEncoder,console});
const {ColorPicker,InstallationCheck,ProfilePreview,LanguageProvider,I18n}=compiled.exports;
const translated=(language,source,params)=>I18n.t(language,source,params);
const escaped=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#x27;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const render=(language,Component,props)=>renderToStaticMarkup(React.createElement(LanguageProvider,{language},React.createElement(Component,props)));

test('color controls translate their names, palette, keyboard instructions and accessible values in all six languages',()=>{
  for(const language of ['pt-BR','pt-PT','en','es','fr','it']) {
    let changed=0;
    const html=render(language,ColorPicker,{id:'color-example',label:'Código da cor',value:'#3366cc',onChange:()=>changed++});
    for(const source of ['Cores','Espectro de cores','Clarear ou escurecer','Escuro','Claro','Código da cor']) assert.ok(html.includes(escaped(translated(language,source))),language+' '+source);
    const blue=translated(language,'Azul');
    assert.ok(html.includes('aria-label="'+escaped(translated(language,'{color} claro',{color:blue}))+'"'),language+' light blue');
    assert.ok(html.includes('aria-label="'+escaped(translated(language,'{color} escuro',{color:blue}))+'"'),language+' dark blue');
    assert.ok(html.includes(escaped(translated(language,'Cor selecionada: {color}',{color:'#3366cc'}))));
    assert.ok(html.includes('aria-valuetext="'+escaped(translated(language,'{amount}% de claridade',{amount:50}))+'"'));
    assert.equal((html.match(/class="color-palette-swatch"/g)||[]).length,18);
    assert.equal(changed,0,'Rendering a translated picker cannot change the selected color');
  }
});

test('dashboard preview translates authored controls and accessible titles without changing the display name',()=>{
  for(const language of ['pt-BR','pt-PT','en','es','fr','it']) {
    const config={user:'Marina Exemplo',displayName:'Nome preservado',appearance:{language,showCards:true,metrics:['edits']}};
    const before=JSON.stringify(config);
    const html=render(language,ProfilePreview,{config,onMoveMetric(){},onToggleMetric(){},onToggleHighlight(){},onEditPanel(){}});
    for(const source of ['Dados de exemplo','Editar painel','Caixas do painel','+ Adicionar caixas','Preparando a prévia local.']) assert.ok(html.includes(escaped(translated(language,source))),language+' '+source);
    assert.ok(html.includes('aria-label="'+escaped(translated(language,'Prévia do PerfilWiki para {user}',{user:'Nome preservado'}))+'"'));
    assert.ok(html.includes('title="'+escaped(translated(language,'Painel de exemplo de {user}',{user:'Nome preservado'}))+'"'));
    assert.ok(html.includes('sandbox="allow-scripts allow-same-origin"'));
    assert.ok(html.includes('referrerPolicy="no-referrer"'));
    assert.equal(JSON.stringify(config),before);
  }
});

test('installation check starts idle with translated public-read-only wording in every language',()=>{
  for(const language of ['pt-BR','pt-PT','en','es','fr','it']) {
    const html=render(language,InstallationCheck,{config:{user:'Marina Exemplo',appearance:{language}}});
    for(const source of ['Conferir a instalação','Verificar instalação','Arquivos e documentação','A consulta lê somente páginas públicas, sem usar seu login. Ela confere os arquivos, mas não executa o script no navegador.']) assert.ok(html.includes(escaped(translated(language,source))),language+' '+source);
    assert.doesNotMatch(html,/data-check-status|installation-check-results/);
    assert.ok(html.includes('href="./Arquivos.html"'));
  }
});

test('public-check result and error messages have complete catalogs instead of foreign-language Portuguese fallbacks',()=>{
  const messages=['Confira a conta e as opções antes de verificar.','Ativação no common.js','Blocos no perfil','Programa do PerfilWiki','Estilos do painel','A página ainda não existe.','Não foi possível conferir o conteúdo público desta página.','O trecho preparado foi encontrado, mas o código ao redor precisa de conferência manual.','O trecho preparado está no nível principal do common.js. A conferência não executa o programa.','A folha precisa ter o modelo CSS higienizado.','Confere com os arquivos e as escolhas preparados.','Os blocos publicados não correspondem às escolhas preparadas.','O carregador está diferente, incompleto ou repetido.','O arquivo compartilhado é diferente desta distribuição.','Consulta pública indisponível. Tente novamente.','A resposta excedeu o limite da conferência.','Os arquivos locais não correspondem a esta versão.','A Wikipédia não devolveu uma resposta completa. Tente novamente.'];
  for(const language of I18n.languages)for(const source of messages) {
    assert.equal(Object.hasOwn(I18n.catalogs[language],source),true,language+' '+source);
    assert.ok(translated(language,source).length>0);
    if(['en','es','fr','it'].includes(language)) assert.notEqual(translated(language,source),source,language+' '+source);
  }
});
