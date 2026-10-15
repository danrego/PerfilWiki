'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Configuration = require('../src/Configuration.js');
const Pageviews = require('../src/PageviewsCore.js');

const API = 'https://pt.wikipedia.org/w/api.php';
const AQS = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/Artigo_exemplo/daily/2024080100/2024081900';
const XTOOLS = 'https://xtools.wmcloud.org/api/user/pages_count/pt.wikipedia.org/Editora%20Exemplo/0/noredirects/all';
const BLACKLIST = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';

function resolve(user, input) {
    return Configuration.resolve({ config: { get: key => key === 'wgUserName' ? user : undefined } },
        input === undefined ? {} : { PerfilWikiConfig: input });
}

test('configuration uses the actual supplied account and fixes the project to ptwiki', () => {
    const settings = resolve('Editora Exemplo', { timeZone: 'America/Sao_Paulo' });
    assert.equal(settings.metrics.user, 'Editora Exemplo');
    assert.equal(settings.metrics.project, 'pt.wikipedia.org');
    assert.equal(settings.metrics.timeZone, 'America/Sao_Paulo');
    assert.equal(settings.metrics.rankLimit, 1000);
    assert.equal(settings.metrics.activityRefreshMs, 300000);
    assert.equal(settings.metrics.fullRescanMs, 30 * 86400000);
});

test('the shared default uses the existing sanitized-css page rather than a newly created wikitext page', () => {
    const pageModels = new Map([
        ['Usuário:Daniel G Rego/RitmoPU-estilos', 'sanitized-css'],
        ['Usuário:Daniel G Rego/PerfilWiki-estilos', 'wikitext']
    ]);
    const settings = resolve('Editora Exemplo', { timeZone: 'UTC' });
    assert.equal(settings.stylesPage, 'Usuário:Daniel G Rego/RitmoPU-estilos');
    assert.equal(pageModels.get(settings.stylesPage), 'sanitized-css');
    assert.notEqual(pageModels.get('Usuário:Daniel G Rego/PerfilWiki-estilos'), 'sanitized-css');
});

test('no real person is a fallback metrics user', () => {
    assert.equal(Pageviews.DEFAULT_CONFIG.user, '');
    for (const user of [null, undefined, '', '   ']) {
        assert.throws(() => resolve(user), /usuário/i);
    }
});

test('explicit users normalize underscores and Unicode without replacing the chosen account', () => {
    const settings = resolve('Conta autenticada', { user: '  E\u0301rica_D\'Ávila  ', timeZone: 'UTC',
        stylesPage: 'Usuário:Exemplo/Estilos', documentationPage: 'Usuário:Exemplo/Ajuda' });
    assert.equal(settings.metrics.user, "Érica D'Ávila");
    assert.equal(settings.stylesPage, 'Usuário:Exemplo/Estilos');
    assert.equal(settings.documentationPage, 'Usuário:Exemplo/Ajuda');
});

test('unknown, malformed and unsafe configuration fields are rejected', () => {
    for (const value of [[], { project: 'en.wikipedia.org' }, { requestUrl: 'https://proxy.example/' },
        { user: 'User:Exemplo' }, { user: 'Exemplo/Subpágina' }, { user: '<script>' }, { user: 'a'.repeat(256) },
        { timeZone: 'Invented/Zone' }, { timeZone: 10 }, { stylesPage: 'Bad|title' }, { documentationPage: 'Bad#fragment' }]) {
        assert.throws(() => resolve('Editora Exemplo', value), JSON.stringify(value));
    }
});

test('public Wikimedia query, AQS, documented blacklist and exact XTools URLs are permitted', () => {
    for (const url of [
        API + '?action=query&list=usercontribs&ucuser=Editora%20Exemplo',
        'https://commons.wikimedia.org/w/api.php?action=query&list=logevents',
        'https://en.wikipedia.org/w/api.php?action=query&list=logevents',
        AQS,
        'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/pt.wikipedia.org/all-access/2024/08/19',
        XTOOLS, BLACKLIST
    ]) assert.equal(Configuration.requestAllowed(url), true, url);
});

test('write actions, duplicate actions and authentication or token requests are rejected', () => {
    for (const query of ['action=edit&title=X&text=X', 'action=login', 'action=query&action=edit',
        'action=query&action=query', 'action=query&token=secret', 'action=query&csrftoken=secret',
        'action=query&assert=user', 'action=query&assertuser=Editora', 'action=query&meta=tokens',
        'action=query&meta=siteinfo%7Ctokens', 'list=usercontribs']) {
        assert.equal(Configuration.requestAllowed(API + '?' + query), false, query);
    }
});

test('HTTP, credentials, ports, proxy hosts and lookalike domains are rejected', () => {
    for (const url of [
        'http://pt.wikipedia.org/w/api.php?action=query',
        'https://name:secret@pt.wikipedia.org/w/api.php?action=query',
        'https://pt.wikipedia.org:8443/w/api.php?action=query',
        'https://proxy.example/?url=' + encodeURIComponent(API + '?action=query'),
        'https://pt.wikipedia.org.evil.example/w/api.php?action=query',
        'https://evilwikipedia.org/w/api.php?action=query',
        'https://pt.wikipedia.org/w/api.php?action=query#fragment',
        'https://xtools.wmcloud.org.evil.example/api/user/pages_count/pt.wikipedia.org/Exemplo/0/noredirects/all',
        'https://wikimedia.org.evil.example/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/X/daily/1/2'
    ]) assert.equal(Configuration.requestAllowed(url), false, url);
});

test('AQS and XTools scope cannot be widened to other projects, agents or paths', () => {
    for (const url of [AQS.replace('pt.wikipedia.org', 'en.wikipedia.org'), AQS.replace('/user/', '/spider/'),
        AQS.replace('/per-article/', '/other/'), XTOOLS.replace('/0/noredirects/all', '/0/redirects/all'),
        XTOOLS.replace('/0/noredirects/all', '/0/noredirects/live'), XTOOLS + '?token=secret',
        BLACKLIST + '?proxy=1', BLACKLIST.replace('/master/', '/main/')]) {
        assert.equal(Configuration.requestAllowed(url), false, url);
    }
});

test('token and authentication parameters are rejected even on analytics sources', () => {
    for (const query of ['token=secret', 'csrftoken=secret', 'assert=user', 'meta=tokens', 'action=edit']) {
        assert.equal(Configuration.requestAllowed(AQS + '?' + query), false, query);
    }
});

test('invalid URL inputs fail closed', () => {
    for (const value of ['', 'not a URL', null, undefined, 'javascript:alert(1)', 'file:///tmp/example',
        '/w/api.php?action=query', 'https://pt.wikipedia.org/w/index.php?action=query']) {
        assert.equal(Configuration.requestAllowed(value), false, String(value));
    }
});
