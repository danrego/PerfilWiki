'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Cards = require('../src/CardsView.js');
const Appearance = require('../src/Appearance.js');
const user = 'Marina Exemplo';
const now = '2026-10-15T14:42:00Z';
function entry(revision, pageid, title, timestamp, ns = 0) { return [revision, pageid, ns, title, timestamp, 0]; }
function activity(entries, complete = true) { return {complete, entries, identity:{user, project:'pt.wikipedia.org'}, summary:{bestStreak:8}}; }
function options(metrics) { return {user, now, appearance:{metrics}}; }

test('curiosity cards are available without changing the original eight defaults', () => {
    assert.equal(Appearance.defaults.metrics.length, 8);
    assert.equal(Appearance.metricIds.length, 24);
    for (const key of ['mostEditedArticle','bytesAdded','bytesRemoved','activeDays']) {
        assert.ok(Appearance.metricIds.includes(key));
        assert.ok(!Appearance.defaults.metrics.includes(key));
    }
    assert.deepEqual(Appearance.normalize({metrics:['bytesRemoved','mostEditedArticle','thanks','bytesAdded']}).metrics,
        ['bytesRemoved','mostEditedArticle','thanks','bytesAdded']);
});
test('article edits are deduplicated by revision and renames keep one page total with the latest title', () => {
    const a = activity([
        entry(2, 10, 'Título antigo', '2026-01-02T12:00:00Z'),
        entry(9, 10, 'Título novo', '2026-09-10T12:00:00.100Z'),
        entry(8, 10, 'Título antigo', '2026-09-10T12:00:00Z'),
        entry(9, 10, 'Título novo', '2026-09-10T12:00:00.100Z'),
        entry(12, 20, 'Outro artigo', '2026-09-11T12:00:00Z'),
        entry(13, 20, 'Outro artigo', '2026-09-12T12:00:00Z'),
        entry(14, 30, 'Discussão de artigo', '2026-09-13T12:00:00Z', 1),
        entry(15, 0, 'Sem página', '2026-09-14T12:00:00Z')
    ]);
    assert.deepEqual(Cards.mostEditedArticle(a), {pageid:10,title:'Título novo',edits:3});
});
test('ties use Portuguese title order and then pageid independent of input order', () => {
    const rows = [entry(1,50,'Zebra','2026-01-01T12:00:00Z'), entry(2,30,'Água','2026-01-01T12:00:00Z'), entry(3,20,'Água','2026-01-01T12:00:00Z')];
    for (const entries of [rows, rows.slice().reverse()]) assert.deepEqual(Cards.mostEditedArticle(activity(entries)), {pageid:20,title:'Água',edits:1});
});
test('incomplete history stays unknown and a complete empty article history has no winner', () => {
    const pending = activity([entry(1,10,'Exemplo','2026-01-01T12:00:00Z')], false);
    assert.equal(Cards.mostEditedArticle(pending), null);
    assert.match(Cards.html({user,metrics:{}},pending,options(['mostEditedArticle'])), /Aguardando dados/);
    assert.doesNotMatch(Cards.html({user,metrics:{}},pending,options(['mostEditedArticle'])), /wiki\/Exemplo/);
    const empty = activity([entry(1,10,'Discussão','2026-01-01T12:00:00Z',1)]);
    assert.deepEqual(Cards.mostEditedArticle(empty), {pageid:null,title:null,edits:0});
    assert.match(Cards.html({user,metrics:{}},empty,options(['mostEditedArticle'])), /Nenhum artigo/);
});
test('a complete history is memoized for appearance updates and rechecked for new history', () => {
    const a = activity([entry(1,10,'Exemplo','2026-01-01T12:00:00Z')]);
    const first = Cards.mostEditedArticle(a);
    assert.equal(Cards.mostEditedArticle(a),first);
    Cards.html({user,metrics:{}},a,{...options(['mostEditedArticle']),appearance:{metrics:['mostEditedArticle'],accent:'#6854a4'}});
    assert.equal(Cards.mostEditedArticle(a),first);
    a.entries = a.entries.concat([entry(2,10,'Exemplo','2026-01-02T12:00:00Z')]);
    assert.notEqual(Cards.mostEditedArticle(a),first);
    assert.equal(Cards.mostEditedArticle(a).edits,2);
});
test('HTML and wikitext show safe linked article titles with their edit counts', () => {
    const a = activity([entry(1,10,'A <img onerror="x"> [[teste]] {{x}} | outro','2026-01-01T12:00:00Z')]);
    const html = Cards.html({user,metrics:{}},a,options(['mostEditedArticle']));
    assert.match(html,/https:\/\/pt\.wikipedia\.org\/wiki\/A_/);
    assert.match(html,/1 edição/);
    assert.match(html,/&lt;img onerror=&quot;x&quot;&gt;/);
    assert.doesNotMatch(html,/<img|<script|href="javascript:/);
    const wiki = Cards.wikitext({user,metrics:{}},a,options(['mostEditedArticle']));
    assert.match(wiki,/\[\[A &#60;img/);
    assert.match(wiki,/&#91;&#91;teste&#93;&#93;/);
    assert.doesNotMatch(wiki,/\{\{x\}\}|<img/);
});
test('byte cards preserve unknowns, verified zeros, binary units and exact raw byte labels', () => {
    const unknown = Cards.html({user,metrics:{bytesAdded:null,bytesRemoved:null}},null,options(['bytesAdded','bytesRemoved']));
    assert.equal((unknown.match(/Aguardando dados/g)||[]).length,2);
    const html = Cards.html({user,metrics:{bytesAdded:1572864,bytesRemoved:0}},null,options(['bytesRemoved','bytesAdded']));
    assert.ok(html.indexOf('id="dan-pu-bytes-removidos"') < html.indexOf('id="dan-pu-bytes-acrescentados"'));
    assert.match(html,/>0 bytes</);
    assert.match(html,/>1,5 MiB</);
    assert.match(html,/title="1\.572\.864 bytes"/);
    assert.match(html,/Saldo positivo por edição/);
    assert.match(html,/Saldo negativo por edição/);
    assert.doesNotMatch(html,/caracteres|qualidade/);
});

class Element {
    constructor() { this.attributes={}; this.style={}; this.children=[]; this.text=''; }
    get textContent() { return this.text + this.children.map(child=>child.textContent).join(''); }
    set textContent(value) { this.text=String(value); this.children=[]; }
    getAttribute(key) { return this.attributes[key] || null; }
    setAttribute(key,value) { this.attributes[key]=String(value); }
    appendChild(element) { this.children.push(element); }
}
test('paint updates the article link and count safely and retains the last verified result when incomplete', () => {
    const article = new Element(), added = new Element();
    const document = {getElementById:id=>id === 'dan-pu-artigo-mais-editado' ? article : id === 'dan-pu-bytes-acrescentados' ? added : null, createElement:()=>new Element()};
    const first = activity([entry(1,10,'Primeiro','2026-01-01T12:00:00Z')]);
    Cards.paint(document,{user,metrics:{bytesAdded:1024}},first,now);
    assert.equal(article.children[0].textContent,'Primeiro');
    assert.equal(article.children[1].textContent,'1 edição');
    assert.equal(added.textContent,'1 KiB');
    const next = activity([entry(2,20,'Novo <título>','2026-01-02T12:00:00Z'),entry(3,20,'Novo <título>','2026-01-03T12:00:00Z')]);
    Cards.paint(document,{user,metrics:{}},next,now);
    assert.equal(article.children[0].textContent,'Novo <título>');
    assert.match(article.children[0].href,/Novo_%3Ct%C3%ADtulo%3E/);
    assert.equal(article.children[1].textContent,'2 edições');
    Cards.paint(document,{user,metrics:{}},activity([],false),now);
    assert.equal(article.children[0].textContent,'Novo <título>');
    Cards.paint(document,{user,metrics:{}},activity([]),now);
    assert.equal(article.textContent,'Nenhum artigo');
});
