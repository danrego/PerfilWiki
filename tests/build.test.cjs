'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const repository = path.resolve(__dirname, '..');
const python = process.env.PYTHON || 'python3';
const names = ['PerfilWiki.js', 'PerfilWiki-estilos.css', 'Carregador_PerfilWiki.js',
    'Contadores_iniciais.wiki', 'Atividade_inicial.wiki', 'Documentacao_PerfilWiki.wiki', 'Notas_da_versao.txt'];
const modules = ['Configuration', 'PageviewsCore', 'History', 'Statistics', 'Coordinator', 'Presenter', 'ActivityView', 'Cache', 'CardsView'];
let temporary, output, metadata;
const read = name => fs.readFileSync(path.join(output, name), 'utf8');
const hash = name => crypto.createHash('sha256').update(fs.readFileSync(path.join(output, name))).digest('hex');

function build() {
    return spawnSync(python, [path.join(temporary, 'scripts/build.py'), '--root', temporary],
        { cwd: os.tmpdir(), encoding: 'utf8' });
}

function checkPublic() {
    return spawnSync(python, [path.join(temporary, 'scripts/build.py'), '--root', temporary, '--check-public'],
        { cwd: os.tmpdir(), encoding: 'utf8' });
}

before(() => {
    temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'perfilwiki-build-'));
    for (const name of ['src', 'docs', 'scripts', 'package.json']) {
        fs.cpSync(path.join(repository, name), path.join(temporary, name), { recursive: true });
    }
    const result = build();
    assert.equal(result.status, 0, result.stderr || result.error && result.error.message);
    metadata = JSON.parse(result.stdout);
    output = path.join(temporary, 'dist', metadata.version);
});

after(() => { if (temporary) fs.rmSync(temporary, { recursive: true, force: true }); });

test('a relocated source checkout builds all seven release assets and two offline indexes', () => {
    assert.equal(metadata.version, '1.0.0');
    assert.deepEqual(metadata.files, names.slice().sort());
    assert.deepEqual(metadata.indexes, ['INICIO.html', 'dist/1.0.0/INICIO.html']);
    for (const name of names) assert.ok(read(name).trim(), name);
    assert.ok(fs.readFileSync(path.join(temporary, 'INICIO.html'), 'utf8').includes('Copiar arquivo inteiro'));
    assert.ok(read('INICIO.html').includes('Copiar resumo'));
});

test('bundle order matches runtime dependencies and includes the exact embedded styles', () => {
    const bundle = read('PerfilWiki.js');
    let last = -1;
    for (const name of modules) {
        const source = fs.readFileSync(path.join(temporary, 'src', name + '.js'), 'utf8').trim();
        const index = bundle.indexOf(source);
        assert.ok(index > last, name + ' appears after its dependencies');
        last = index;
    }
    const style = bundle.indexOf('root.PerfilWikiStyleText = ');
    const runtime = bundle.indexOf(fs.readFileSync(path.join(temporary, 'src/Runtime.js'), 'utf8').trim());
    assert.ok(style > last && runtime > style);
    const context = vm.createContext({ URL, Intl, console });
    context.window = context;
    vm.runInContext(bundle, context, { timeout: 1000 });
    assert.equal(context.PerfilWikiStyleText, fs.readFileSync(path.join(temporary, 'src/PerfilWiki-estilos.css'), 'utf8'));
    for (const name of modules) assert.ok(context['PerfilWiki' + name], name);
    assert.equal(context.PerfilWiki, undefined, 'No MediaWiki context means no automatic collection');
});

test('starter markup has one generic owner token, no personal values and stable existing card identifiers', () => {
    for (const name of ['Contadores_iniciais.wiki', 'Atividade_inicial.wiki']) {
        const markup = read(name);
        assert.equal((markup.match(/data-perfilwiki-user="SEU_NOME_DE_USUARIO"/g) || []).length, 1);
        assert.match(markup, /<templatestyles src="Usuário:Daniel G Rego\/PerfilWiki-estilos" \/>/);
        assert.doesNotMatch(markup, /data-perfilwiki-user="Daniel G Rego"/);
        assert.doesNotMatch(markup, /\d[.,]\d{3}/);
    }
    const cards = read('Contadores_iniciais.wiki');
    assert.equal((cards.match(/Aguardando dados/g) || []).length, 8);
    for (const id of ['perfilwiki-anos', 'dan-pu-ritmo-melhor-sequencia', 'dan-pu-agradecimentos',
        'dan-pu-edicoes', 'dan-pu-reversoes', 'dan-pu-editados', 'dan-pu-artigos', 'dan-pu-criados-tecnicos']) {
        assert.equal((cards.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, id);
    }
    assert.equal((read('Atividade_inicial.wiki').match(/id="dan-pu-ritmo"/g) || []).length, 1);
});

function loadLoader(changes = {}, windowChanges = {}) {
    const config = Object.assign({ wgDBname: 'ptwiki', wgAction: 'view', wgNamespaceNumber: 2,
        wgUserName: 'Editora Exemplo', wgRelevantUserName: 'Editora Exemplo', wgTitle: 'Editora Exemplo/PU' }, changes);
    const calls = [];
    const context = vm.createContext({ mw: { config: { get: key => config[key] } },
        window: Object.assign({}, windowChanges), importScript: title => calls.push(title) });
    vm.runInContext(read('Carregador_PerfilWiki.js'), context);
    return { calls, context };
}

test('loader imports exactly one program once for the signed-in owner on a ptwiki userpage view', () => {
    const loaded = loadLoader();
    assert.deepEqual(loaded.calls, ['Usuário:Daniel G Rego/PerfilWiki.js']);
    vm.runInContext(read('Carregador_PerfilWiki.js'), loaded.context);
    assert.equal(loaded.calls.length, 1);
    assert.equal(loadLoader({ wgRelevantUserName: undefined }).calls.length, 1, 'wgTitle supplies the owner fallback');
});

test('loader does nothing on edits, other projects, other users, anonymous views or other namespaces', () => {
    for (const changes of [{ wgDBname: 'enwiki' }, { wgAction: 'edit' }, { wgAction: 'submit' },
        { wgAction: 'history' }, { wgNamespaceNumber: 0 }, { wgNamespaceNumber: 3 },
        { wgUserName: null }, { wgRelevantUserName: 'Outra Editora' },
        { wgRelevantUserName: undefined, wgTitle: 'Outra Editora/PU' }]) {
        assert.deepEqual(loadLoader(changes).calls, [], JSON.stringify(changes));
    }
    assert.deepEqual(loadLoader({}, { PerfilWiki: {} }).calls, []);
});

test('documentation is copied whole and release notes come from the same checked metadata', () => {
    assert.equal(read('Documentacao_PerfilWiki.wiki'), fs.readFileSync(path.join(temporary, 'docs/Documentacao_PerfilWiki.wiki'), 'utf8'));
    const releases = JSON.parse(fs.readFileSync(path.join(temporary, 'docs/RELEASES.json'), 'utf8'));
    assert.equal(releases[0].version, '1.0.0');
    assert.equal(releases[0].date, '2026-10-15');
    for (const change of releases[0].changes) assert.ok(read('Notas_da_versao.txt').includes(change));
});

test('repeat builds produce byte-identical release files and installation index', () => {
    const beforeHashes = Object.fromEntries(names.concat('INICIO.html').map(name => [name, hash(name)]));
    const result = build();
    assert.equal(result.status, 0, result.stderr);
    for (const [name, expected] of Object.entries(beforeHashes)) assert.equal(hash(name), expected, name);
});

test('public-file check permits legitimate shared-host attribution and synthetic fixtures', () => {
    const result = checkPublic();
    assert.equal(result.status, 0, result.stderr);
    assert.ok(JSON.parse(result.stdout).checkedFiles > 10);
});

test('public-file check rejects client paths and credential signatures without printing their values', () => {
    const file = path.join(temporary, 'docs/privacy-test.txt');
    for (const value of ['/Users/' + 'synthetic-client/private/file', 'C:' + '\\Users\\synthetic-client\\private.txt',
        'ghp_' + 'A'.repeat(36), 'sk-proj-' + 'B'.repeat(40), '-----BEGIN ' + 'PRIVATE KEY-----']) {
        try {
            fs.writeFileSync(file, value);
            const result = checkPublic();
            assert.notEqual(result.status, 0);
            assert.match(result.stderr, /docs\/privacy-test\.txt/);
            assert.equal(result.stderr.includes(value), false);
        } finally { fs.rmSync(file, { force: true }); }
    }
});

test('public-file check rejects synced reference folders and copied personal account files', () => {
    for (const name of ['sources/reference.txt', 'outputs/account.json', 'docs/common.js', 'docs/PU.wiki',
        'docs/Dados_consultados.json', '.env']) {
        const file = path.join(temporary, name);
        try {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, 'Synthetic content');
            assert.notEqual(checkPublic().status, 0, name);
        } finally {
            fs.rmSync(name.startsWith('sources/') || name.startsWith('outputs/') ? path.dirname(file) : file,
                { recursive: true, force: true });
        }
    }
});

test('public-file check rejects symbolic release inputs', { skip: process.platform === 'win32' }, () => {
    const file = path.join(temporary, 'docs/symbolic-test.json');
    try {
        fs.symlinkSync(path.join(temporary, 'package.json'), file);
        assert.notEqual(checkPublic().status, 0);
    } finally { fs.rmSync(file, { force: true }); }
});

test('loader version follows release metadata for the next build', () => {
    const packageFile = path.join(temporary, 'package.json');
    const releasesFile = path.join(temporary, 'docs/RELEASES.json');
    const originalPackage = fs.readFileSync(packageFile, 'utf8');
    const originalReleases = fs.readFileSync(releasesFile, 'utf8');
    try {
        fs.writeFileSync(packageFile, JSON.stringify(Object.assign(JSON.parse(originalPackage), { version: '1.0.1' })));
        const releases = JSON.parse(originalReleases);
        releases[0].version = '1.0.1';
        fs.writeFileSync(releasesFile, JSON.stringify(releases));
        const result = build();
        assert.equal(result.status, 0, result.stderr);
        assert.match(fs.readFileSync(path.join(temporary, 'dist/1.0.1/Carregador_PerfilWiki.js'), 'utf8'), /^\/\* PerfilWiki 1\.0\.1\./);
    } finally {
        fs.writeFileSync(packageFile, originalPackage);
        fs.writeFileSync(releasesFile, originalReleases);
    }
});

test('inconsistent release metadata fails the build instead of emitting a mixed version', () => {
    const file = path.join(temporary, 'package.json');
    const original = fs.readFileSync(file, 'utf8');
    try {
        fs.writeFileSync(file, JSON.stringify(Object.assign(JSON.parse(original), { version: '9.9.9' })));
        const result = build();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /versão/);
        assert.equal(fs.existsSync(path.join(temporary, 'dist/9.9.9')), false);
    } finally {
        fs.writeFileSync(file, original);
    }
});
