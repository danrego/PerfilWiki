'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Text = require('../src/ProfileText.js');
const Configuration = require('../src/Configuration.js');

test('profile text accepts only the small internal-link subset mixed with normalized plain text', () => {
    const input = '  Moro em [[Rio_de_Janeiro]] e pesquiso [[História do Brasil|história brasileira]].  ';
    assert.equal(Text.normalize(input,160),input.trim());
    assert.deepEqual(Text.tokens(input).map(token => token.type),['text','link','text','link','text']);
    const links = Text.tokens(input).filter(token => token.type === 'link');
    assert.equal(links[0].title,'Rio de Janeiro');
    assert.equal(links[0].label,'Rio de Janeiro');
    assert.equal(links[1].label,'história brasileira');
    assert.equal(links[1].href,'https://pt.wikipedia.org/wiki/Hist%C3%B3ria_do_Brasil');
    assert.equal(Text.normalize(' E\u0301vora ',5),'Évora');
    assert.equal(Text.normalize('🧩'.repeat(120),120).length,240);
    assert.throws(() => Text.normalize('🧩'.repeat(121),120));
    assert.ok(Object.isFrozen(Text.tokens(input)));
    assert.ok(Text.tokens(input).every(Object.isFrozen));
});

test('HTML links always use the fixed ptwiki origin and escaped labels', () => {
    const html = Text.html('[[Rio de Janeiro|Rio & "Cidade"]] / [[Biblioteca Nacional do Brasil#Acervo|Acervo]]');
    assert.match(html,/<a href="https:\/\/pt\.wikipedia\.org\/wiki\/Rio_de_Janeiro">Rio &amp; &quot;Cidade&quot;<\/a>/);
    assert.match(html,/Biblioteca_Nacional_do_Brasil#Acervo/);
    assert.doesNotMatch(html,/<script|javascript:|onmouseover=/);
    for (const match of html.matchAll(/href="([^"]+)"/g)) assert.equal(new URL(match[1]).origin,'https://pt.wikipedia.org');
});

test('saved namespace links have an explicit colon so files and categories remain ordinary links', () => {
    for (const title of ['Categoria:História','Ficheiro:Exemplo.svg','Arquivo:Exemplo.jpg','Usuário:Editora Exemplo','Wikipédia:Esplanada']) {
        assert.match(Text.wikitext('[['+title+'|Ver página]]'),/^\[\[:/);
        assert.equal(Text.tokens('[['+title+']]')[0].title,title);
    }
    assert.equal(Text.wikitext('[[:Categoria:História|História]]'),'[[:Categoria:História|História]]');
});

test('templates, HTML, external-link syntax, encoded escapes and malformed wikilinks are rejected', () => {
    for (const input of [null,{},1,'<b>Rio</b>','{{Rio}}','[https://example.org Rio]','[//example.org Rio]',
        '[[en:Rio]]','[[:commons:File:Foo]]','[[w:Rio]]','[[https://example.org]]','[[javascript:alert(1)]]',
        '[[en%3ARio]]','[[en&#58;Rio]]','[[Foo&#93;&#93;]]','[[Rio]','[[Rio]]]',
        '[[Rio|]]','[[|Rio]]','[[Rio|Um|Dois]]','[[Rio [[Brasil]]]]','[[Rio]] [[Brasil]',
        '[[::Rio]]','[[Categoria:]]','[[Rio#]]','[[#História]]','[[Rio#A#B]]','A|B','A\nB','A\u2028B']) {
        assert.throws(() => Text.normalize(input,160),undefined,String(input));
        assert.throws(() => Text.html(input),undefined,String(input));
        assert.throws(() => Text.wikitext(input),undefined,String(input));
    }
});

test('plain URLs, signatures and behavioral switches stay literal and cannot create external links or wiki actions', () => {
    const input = 'https://example.org ~~~~ __NOTOC__ & texto';
    assert.doesNotMatch(Text.html(input),/<a/);
    const wiki = Text.wikitext(input);
    assert.doesNotMatch(wiki,/https:\/\/|~~~~|__NOTOC__/);
    assert.match(wiki,/https&#58;/);
    assert.match(wiki,/&#126;&#126;&#126;&#126;/);
    assert.match(wiki,/&#95;&#95;NOTOC&#95;&#95;/);
});

test('safe DOM output and markup renderers use the same parsed titles and labels without HTML execution', () => {
    const nodes = [], document = {createElement(tag) {return {tag,textContent:'',attrs:{},setAttribute(key,value) {this.attrs[key]=value;}};}};
    const parent = {appendChild(node) {nodes.push(node);}};
    const input = 'Em [[Rio de Janeiro|Rio]] e [[Portugal]].';
    Text.append(document,parent,input);
    assert.equal(nodes.map(node => node.textContent).join(''),'Em Rio e Portugal.');
    assert.deepEqual(nodes.filter(node => node.tag === 'a').map(node => node.attrs.href),Text.tokens(input).filter(token => token.type === 'link').map(token => token.href));
    assert.equal(nodes.filter(node => node.tag === 'a').length,2);
    const previous = nodes.length;
    assert.throws(() => Text.append(document,parent,'[[unsafe|<img>]]'));
    assert.equal(nodes.length,previous,'Rejected input must not append a partial fragment');
});

test('only location and custom values accept links while display names and field labels remain plain', () => {
    const resolve = input => Configuration.resolve({config:{get:()=>'Editora Exemplo'}},{PerfilWikiConfig:input});
    const linked = resolve({user:'Editora Exemplo',location:'Em [[Rio de Janeiro]]',customFields:[{label:'Interesse',value:'[[História do Brasil|História]]'}]});
    assert.equal(linked.location,'Em [[Rio de Janeiro]]');
    assert.equal(linked.customFields[0].value,'[[História do Brasil|História]]');
    assert.throws(() => resolve({user:'Editora Exemplo',displayName:'[[Rio]]'}));
    assert.throws(() => resolve({user:'Editora Exemplo',customFields:[{label:'[[Interesse]]',value:'História'}]}));
});
