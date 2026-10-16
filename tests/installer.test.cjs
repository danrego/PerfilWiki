'use strict';

// The installer is exercised against the real dashboard modules with entirely
// synthetic accounts and a stubbed importScript. These tests make no requests.
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const Appearance = require('../src/Appearance.js');
const Configuration = require('../src/Configuration.js');
const Cards = require('../src/CardsView.js');
const Activity = require('../src/ActivityView.js');
const Core = require('../src/PageviewsCore.js');

const repository = path.resolve(__dirname, '..');
const installer = path.join(repository, 'installer');
const version = JSON.parse(fs.readFileSync(path.join(repository, 'package.json'), 'utf8')).version;
const output = path.join(repository, 'dist', version);
const originalCounters = ['tenure', 'bestStreak', 'thanks', 'edits', 'reverts', 'edited', 'articles', 'technicalCreated'];
const optionalCounters = ['mostEditedArticle', 'bytesAdded', 'bytesRemoved', 'activeDays', 'articleEdits', 'talkEdits', 'activeMonths', 'busiestDay', 'edits30', 'averagePerActiveDay', 'activeYears', 'busiestMonth', 'thanksSent', 'averageBytesPerEdit', 'largestAddition', 'largestRemoval'];
const now = '2026-10-15T14:42:00.000Z';
let Model;

before(async () => {
    Model = await import(pathToFileURL(path.join(installer, 'src/model.mjs')).href);
});

function ready(overrides = {}, appearance = {}) {
    const config = Object.assign(Model.createInitialConfig(), {
        user: 'Editora Exemplo', timeZone: 'America/Sao_Paulo'
    }, overrides);
    config.appearance = Object.assign({}, config.appearance, appearance);
    return config;
}

function environment(config, fields = {}, windowFields = {}) {
    const expected = Model.dashboardConfig(config);
    const settings = Object.assign({wgDBname:'ptwiki', wgAction:'view', wgNamespaceNumber:2,
        wgUserName:expected.user, wgRelevantUserName:expected.user, wgTitle:expected.user + '/Painel'}, fields);
    const imports = [];
    const sandbox = {window:Object.assign({}, windowFields),
        mw:{config:{get:key => settings[key]}}, importScript:title => imports.push(title)};
    const context = vm.createContext(sandbox);
    return {context, imports, run() {
        vm.runInContext(Model.activationSnippet(config), context, {timeout:100});
        return context.window;
    }};
}

function runtimeConfiguration(config) {
    const env = environment(config);
    const window = env.run();
    // The generated JavaScript runs in another realm. Compare its public data
    // after normalizing realm-specific Array prototypes, not object identity.
    return JSON.parse(JSON.stringify(Configuration.resolve(env.context.mw, window)));
}

function fixture(user) {
    const entries = [
        [3, 12, 0, 'Artigo Exemplo', '2026-10-15T12:00:00.000Z', 2],
        [2, 12, 0, 'Artigo Exemplo', '2026-10-14T12:00:00.000Z', 1],
        [1, 14, 0, 'Outro artigo', '2026-10-12T12:00:00.000Z', 0]
    ];
    const config = {user, project:'pt.wikipedia.org', timeZone:'America/Sao_Paulo'};
    const activity = {complete:true, entries, capturedAt:now, identity:{user, project:config.project},
        summary:Core.summarize(entries, {config, now})};
    return {config, capturedAt:now, activity, pageviews:null,
        statistics:{user, metrics:{edits:12, thanks:0, articles:1, edited:2,
            technicalCreated:0, reverts:1, bytesAdded:4096, bytesRemoved:512,
            registration:'2020-10-15T00:00:00.000Z'}}};
}

function cardValueIds(markup) {
    return [...markup.matchAll(/<span\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
}

test('installer and runtime agree on the eight default and twenty-four available counters', () => {
    const config = ready();
    assert.deepEqual(config.appearance.metrics, originalCounters);
    assert.deepEqual(Appearance.defaults.metrics, originalCounters);
    assert.deepEqual(Model.METRICS.map(({id}) => id), originalCounters.concat(optionalCounters));
    assert.deepEqual(Appearance.metricIds, Model.METRICS.map(({id}) => id));
    assert.equal(config.appearance.alignment, 'right');
    assert.equal(config.appearance.layout, 'integrated');
    assert.deepEqual(runtimeConfiguration(config).appearance, Model.dashboardConfig(config).appearance);
    assert.equal(Model.validateConfig(ready({}, {metrics:optionalCounters})).valid, true);
});

test('every offered color, alignment, period and layout resolves in the real runtime', () => {
    const variants = [
        ...Model.THEMES.map(({id, accent}) => ({theme:id, accent})),
        {theme:'custom', accent:'#FFEEDD'},
        ...['right', 'left', 'center'].map(alignment => ({alignment})),
        ...Model.PERIODS.map(({id}) => ({initialPeriod:id,...(id==='custom'?{customRange:{start:'2024-02-01',end:'2024-02-29'}}:{})})),
        {density:'compact'}, {density:'roomy'}, ...['auto','2','3','4','5'].map(cardColumns=>({cardColumns})), ...['integrated','together','separate'].map(layout=>({layout})),
        {showCards:false, metrics:[]}, {showActivity:false},
        {metrics:['bytesRemoved', 'mostEditedArticle', 'bytesAdded', 'thanks']}
    ];
    for (const appearance of variants) {
        const config = ready({}, appearance);
        assert.equal(Model.validateConfig(config).valid, true, JSON.stringify(appearance));
        const exported = Model.dashboardConfig(config);
        const actual = runtimeConfiguration(config);
        assert.deepEqual(actual.appearance, exported.appearance, JSON.stringify(appearance));
        assert.equal(actual.metrics.user, exported.user);
        assert.equal(actual.metrics.timeZone, exported.timeZone);
        assert.equal(Object.hasOwn(actual.metrics, 'appearance'), false, 'visual changes do not change the statistics identity');
    }
});

test('installed configuration renders the same selected counter IDs and order as initial markup', () => {
    const config = ready({user:'Pessoa_Exemplo'}, {
        theme:'forest', accent:'#246342', alignment:'center', density:'compact',
        layout:'separate', initialPeriod:'since',
        metrics:['bytesRemoved', 'mostEditedArticle', 'bytesAdded', 'thanks']
    });
    const actual = runtimeConfiguration(config);
    const state = fixture(actual.metrics.user);
    const starter = Model.cardsSnippet(config);
    const rendered = Cards.html(state.statistics, state.activity,
        {user:actual.metrics.user, now, appearance:actual.appearance});
    assert.deepEqual(cardValueIds(starter), cardValueIds(rendered));
    assert.deepEqual(cardValueIds(rendered), ['dan-pu-bytes-removidos', 'dan-pu-artigo-mais-editado',
        'dan-pu-bytes-acrescentados', 'dan-pu-agradecimentos']);
    assert.match(rendered, /text-align:center;/);
    assert.match(rendered, /dan-pu-density-compact dan-pu-align-center dan-pu-layout-separate dan-pu-initial-since/);
    assert.match(rendered, /Artigo Exemplo/);
    assert.match(rendered, /2 edições/);
    assert.match(rendered, /4 KiB/);
    assert.match(rendered, /512 bytes/);
    assert.match(rendered, /id="dan-pu-agradecimentos">0</);
    assert.match(Activity.html(state, {appearance:actual.appearance}), /Atividade na Wikipédia em Português/);
    assert.equal(Cards.html(state.statistics, state.activity,
        {user:actual.metrics.user, now, appearance:{...actual.appearance, showCards:false}}), '');
});

test('all twenty-four installed counters remain unknown until actual data is supplied', () => {
    const config = ready({}, {metrics:Model.METRICS.map(({id}) => id)});
    const actual = runtimeConfiguration(config);
    const starter = Model.cardsSnippet(config);
    const empty = Cards.html({user:actual.metrics.user, metrics:{}}, null,
        {user:actual.metrics.user, now, appearance:actual.appearance});
    assert.deepEqual(cardValueIds(starter), cardValueIds(empty));
    assert.equal((starter.match(/Aguardando dados/g) || []).length, 24);
    assert.equal((empty.match(/Aguardando dados/g) || []).length, 24);
    assert.doesNotMatch(starter, /18 anos|68 dias|24\.368|19\.427\.584|Artigo Exemplo|>0</);
    assert.doesNotMatch(starter, /<script\b|\bonclick\s*=|javascript:/i);
});

test('the actual exported loader imports only for its configured owner and never twice', () => {
    const config = ready({user:'  Editora_Exemplo '});
    const valid = environment(config);
    valid.run();
    valid.run();
    assert.deepEqual(valid.imports, [Model.PROGRAM_PAGE]);
    assert.equal(Configuration.resolve(valid.context.mw, valid.context.window).metrics.user, 'Editora Exemplo');
    const fallback = environment(config, {wgRelevantUserName:undefined, wgTitle:'Editora_Exemplo/Painel'});
    fallback.run();
    assert.deepEqual(fallback.imports, [Model.PROGRAM_PAGE]);
    for (const fields of [
        {wgDBname:'commonswiki'}, {wgDBname:'enwiki'}, {wgAction:'edit'},
        {wgAction:'submit'}, {wgAction:'history'}, {wgNamespaceNumber:0},
        {wgNamespaceNumber:3}, {wgUserName:null}, {wgUserName:'Outra pessoa'},
        {wgRelevantUserName:'Outra pessoa'},
        {wgUserName:'Outra pessoa', wgRelevantUserName:'Outra pessoa'}
    ]) {
        const invalid = environment(config, fields);
        invalid.run();
        assert.deepEqual(invalid.imports, [], JSON.stringify(fields));
    }
    for (const fields of [{PerfilWiki:{}}, {PerfilWikiLoaderRequested:true}]) {
        const prior = environment(config, {}, fields);
        prior.run();
        assert.deepEqual(prior.imports, []);
    }
    const withoutMediaWiki = {window:{}};
    vm.runInNewContext(Model.activationSnippet(config), withoutMediaWiki, {timeout:100});
    assert.equal(withoutMediaWiki.window.PerfilWikiConfig.user, 'Editora Exemplo');
});

test('a complete customized installation preserves scripts, profile text and categories verbatim', () => {
    const config = ready({user:"Ana d'Ávila", destination:'subpage', subpage:'Painel pessoal'},
        {alignment:'left', metrics:['mostEditedArticle', 'bytesAdded'], initialPeriod:'90d'});
    const scriptBefore = '// Meu código já existe\r\nwindow.ferramentaAnterior = { pronta: true };\r\n';
    const profileBefore = '== Sobre mim ==\nTexto com acentos e 🧩.\n[[Categoria:Wikipedistas]]\n';
    const script = Model.appendDemo(scriptBefore, Model.activationSnippet(config));
    const profile = Model.appendDemo(profileBefore, Model.profileSnippet(config));
    assert.ok(script.startsWith(scriptBefore));
    assert.ok(profile.startsWith(profileBefore));
    assert.equal(Model.appendDemo(script, Model.activationSnippet(config)), script);
    assert.equal(Model.appendDemo(profile, Model.profileSnippet(config)), profile);
    const context = vm.createContext({window:{}});
    vm.runInContext(script, context, {timeout:100});
    assert.equal(context.window.ferramentaAnterior.pronta, true);
    assert.deepEqual(JSON.parse(JSON.stringify(context.window.PerfilWikiConfig)), Model.dashboardConfig(config));
    assert.throws(() => Model.appendDemo(profile, Model.profileSnippet(ready({user:'Outra pessoa'}))), /bloco/);
});

test('manual installation exports contain full accepted code, summaries and exact edit destinations', () => {
    const config = ready({user:"Ana d'Ávila", destination:'subpage', subpage:'Painel pessoal'});
    assert.deepEqual(Model.installFiles(config).map(({id}) => id), ['activation', 'profile']);
    const separate = ready({user:config.user, destination:config.destination, subpage:config.subpage}, {layout:'separate'});
    assert.deepEqual(Model.installFiles(separate).map(({id}) => id), ['activation', 'profile', 'cards', 'activity']);
    for (const selected of [config,separate]) {
        const files = Model.installFiles(selected);
        const expectedText = {activation:Model.activationSnippet(selected), profile:Model.profileSnippet(selected),
            cards:Model.cardsSnippet(selected), activity:Model.activitySnippet(selected)};
        for (const file of files) {
            assert.equal(file.text, expectedText[file.id]);
            assert.ok(file.summary.trim().length > 10);
            const destination = file.id === 'activation' ? "Usuário:Ana d'Ávila/common.js" : "Usuário:Ana d'Ávila/Painel pessoal";
            assert.equal(file.destination, destination);
            const url = new URL(file.editorUrl);
            assert.equal(url.origin, 'https://pt.wikipedia.org');
            assert.equal(url.pathname, '/w/index.php');
            assert.equal(url.searchParams.get('title'), destination);
            assert.equal(url.searchParams.get('action'), 'edit');
            assert.deepEqual([...url.searchParams.keys()].sort(), ['action', 'title']);
            assert.doesNotMatch(file.text, /\b(?:csrftoken|assertuser)\b|\baction\s*[:=]\s*['"](?:edit|purge|login)['"]/i);
        }
    }
});

test('the local preview uses byte-identical current renderers and omits transport runtime', () => {
    const preview = path.join(installer, 'public/local-preview');
    const manifest = JSON.parse(fs.readFileSync(path.join(preview, 'source-manifest.json'), 'utf8'));
    assert.deepEqual(Object.keys(manifest.sha256).sort(), [
        'I18n.js', 'Appearance.js', 'LayoutView.js', 'DailyCover.js', 'NativeDailyCover.js', 'ProfileText.js', 'ProfileSections.js', 'ProfileFields.js', 'ProfileClock.js', 'UserGroups.js', 'Presenter.js', 'PageviewsCore.js', 'CardsView.js',
        'ActivityView.js', 'ProfileHeaderView.js', 'PerfilWiki-estilos.css'
    ].sort());
    for (const [filename, expected] of Object.entries(manifest.sha256)) {
        const source = fs.readFileSync(path.join(repository, 'src', filename));
        const copy = fs.readFileSync(path.join(preview, filename));
        assert.deepEqual(copy, source, filename);
        assert.equal(crypto.createHash('sha256').update(copy).digest('hex'), expected, filename);
    }
    assert.equal(fs.existsSync(path.join(preview, 'Runtime.js')), false);
    assert.equal(fs.existsSync(path.join(preview, 'Coordinator.js')), false);
    const frame = fs.readFileSync(path.join(preview, 'frame.html'), 'utf8');
    assert.match(frame, /connect-src 'none'/);
    const context = {window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(preview, 'fixture.js'), 'utf8'), context, {timeout:100});
    const data = context.window.PerfilWikiLocalFixture;
    assert.ok(data.entries.length > 0);
    assert.equal(data.entries.every(entry => entry[7] === 'PerfilWiki Exemplo'), true);
    assert.ok(data.metrics.bytesAdded > 0 && data.metrics.bytesRemoved > 0);
});

test('built maintenance payloads contain the exact current release files and hashes', () => {
    const expectedDestinations = {
        'PerfilWiki.js':Model.PROGRAM_PAGE,
        'PerfilWiki-estilos.css':Model.STYLES_PAGE,
        'Documentacao_PerfilWiki.wiki':Model.DOCUMENTATION_PAGE,
        'Notas_da_versao.txt':Model.DOCUMENTATION_PAGE + '/Notas da versão'
    };
    const manifests = [path.join(installer, 'public/release-files.json'), path.join(output, 'release-files.json')];
    for (const manifestPath of manifests) {
        const payload = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assert.equal(payload.version, version);
        assert.deepEqual(payload.files.map(file => file.filename).sort(), Object.keys(expectedDestinations).sort());
        for (const file of payload.files) {
            const exact = fs.readFileSync(path.join(output, file.filename), 'utf8');
            assert.equal(file.text, exact, file.filename);
            assert.equal(file.destination, expectedDestinations[file.filename]);
            assert.ok(file.summary.trim().length > 10, file.filename);
            assert.equal(file.bytes, Buffer.byteLength(exact), file.filename);
            assert.equal(file.sha256, crypto.createHash('sha256').update(exact).digest('hex'), file.filename);
            const downloadable = fs.readFileSync(path.join(path.dirname(manifestPath), 'release', file.filename), 'utf8');
            assert.equal(downloadable, exact, file.filename);
        }
    }
    assert.ok(fs.readFileSync(path.join(output, 'INICIO.html'), 'utf8').includes('id="root"'));
    assert.ok(fs.readFileSync(path.join(output, 'Arquivos.html'), 'utf8').includes('Copiar arquivo inteiro'));
});
