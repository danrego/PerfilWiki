'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { snapshot, compare } = require('../scripts/verify-reproducible.cjs');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('the complete build toolchain pins supported runtime and dependency policy without placeholders', () => {
  const metadata = JSON.parse(read('BUILD_TOOLCHAIN.json'));
  assert.equal(read('.node-version').trim(), metadata.node);
  assert.equal(read('.nvmrc').trim(), metadata.node);
  for (const file of ['package.json', 'installer/package.json']) {
    const pkg = JSON.parse(read(file));
    assert.equal(pkg.packageManager, metadata.packageManager);
    assert.equal(pkg.engines.node, '24.19.x');
    assert.equal(pkg.engines.pnpm, '11.25.0');
  }
  assert.match(read('installer/pnpm-workspace.yaml'), /allowBuilds:\s+esbuild: false\s*$/);
  assert.doesNotMatch(read('installer/pnpm-workspace.yaml'), /set this|allowBuilds:\s+esbuild: true/);
  assert.equal(metadata.dependencyLifecycleScripts, 'disabled');
  assert.match(metadata.dependencyInstall, /--frozen-lockfile --ignore-scripts$/);
});

test('every bundled third-party runtime keeps its complete original MIT permission notice', () => {
  const notices = read('THIRD_PARTY_NOTICES.txt');
  const components = [
    ['React', '19.2.0', 'installer/node_modules/react/LICENSE'],
    ['React DOM', '19.2.0', 'installer/node_modules/react-dom/LICENSE'],
    ['Scheduler', '0.27.0', 'installer/node_modules/.pnpm/scheduler@0.27.0/node_modules/scheduler/LICENSE'],
  ];
  for (const [name, version, filename] of components) {
    assert.ok(notices.includes(name + ' ' + version));
    assert.ok(notices.includes(read(filename).trim()), name + ' full license');
  }
  const vite = read('installer/node_modules/vite/LICENSE.md').split('# Licenses of bundled dependencies')[0].trim();
  assert.ok(notices.includes(vite));
  assert.match(read('scripts/build-all.cjs'), /'LICENSE', 'THIRD_PARTY_NOTICES\.txt', 'BUILD_TOOLCHAIN\.json'/);
  assert.match(read('docs/LICENCAS_E_CREDITOS.md'), /código próprio/);
});

test('compiled parent source enforces local scripts and an exact opt-in read-only checker endpoint', () => {
  const source = read('installer/index.html');
  const policy = source.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert.match(policy, /default-src 'none'/);
  assert.match(policy, /script-src 'self';/);
  assert.match(policy, /connect-src 'self' https:\/\/pt\.wikipedia\.org\/w\/api\.php;/);
  assert.match(policy, /frame-src 'self';/);
  assert.doesNotMatch(policy, /unsafe-eval|script-src[^;]*unsafe-inline|https:\/\/\*|data:.*script/);
  assert.match(source, /<meta name="referrer" content="no-referrer"/);
  assert.match(read('installer/public/local-preview/frame.html'), /connect-src 'none'/);
});

test('maintenance index authorizes only its exact inline program by SHA-256 and refuses connections', () => {
  const program = `import importlib.util\ns=importlib.util.spec_from_file_location('index',${JSON.stringify(path.join(root, 'scripts/build_index.py'))})\nm=importlib.util.module_from_spec(s);s.loader.exec_module(m)\npayload={item[0]:{'bytes':1,'sha256':'a'*64,'text':'synthetic','summary':'synthetic'} for item in m.FILES}\nprint(m.render_index('1.19.0',[{'version':'1.19.0','date':'2026-10-15','changes':['Synthetic']}],payload,distribution=True))`;
  const result = spawnSync('python3', ['-c', program], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const html = result.stdout;
  const source = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
  const expected = crypto.createHash('sha256').update(source).digest('base64');
  assert.ok(html.includes('sha256-' + expected));
  assert.match(html, /connect-src &#x27;none&#x27;/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.doesNotMatch(html, /script-src[^;]*unsafe-inline|unsafe-eval/);
});

test('CI runs only unprivileged verification with official actions pinned to full verified commits', () => {
  const source = read('.github/workflows/ci.yml');
  const metadata = JSON.parse(read('BUILD_TOOLCHAIN.json'));
  assert.match(source, /permissions:\s+contents: read/);
  assert.match(source, /persist-credentials: false/);
  assert.match(source, /package-manager-cache: false/);
  for (const action of metadata.actions) {
    assert.match(action.sha, /^[a-f0-9]{40}$/);
    assert.ok(source.includes('uses: ' + action.repository + '@' + action.sha));
  }
  assert.equal([...source.matchAll(/uses:/g)].length, metadata.actions.length);
  assert.doesNotMatch(source, /pull_request_target:|workflow_run:|contents: write|pages: write|id-token: write|secrets\.|deploy-pages|upload-artifact|git push|npm publish/);
  assert.match(source, /install --frozen-lockfile --ignore-scripts/);
  assert.match(source, /npm run verify:reproducible/);
  assert.match(source, /npm test/);
});

test('whole-distribution snapshots detect additions, removals and byte changes, independent of file times', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'perfilwiki-repro-'));
  try {
    fs.mkdirSync(path.join(temporary, 'assets'));
    fs.writeFileSync(path.join(temporary, 'assets/app.js'), 'first');
    const before = snapshot(temporary);
    fs.utimesSync(path.join(temporary, 'assets/app.js'), 10, 10);
    assert.deepEqual(compare(before, snapshot(temporary)), []);
    fs.writeFileSync(path.join(temporary, 'assets/app.js'), 'second');
    fs.writeFileSync(path.join(temporary, 'extra.txt'), 'new');
    assert.deepEqual(compare(before, snapshot(temporary)), ['assets/app.js', 'extra.txt']);
    fs.rmSync(path.join(temporary, 'assets/app.js'));
    assert.deepEqual(compare(before, snapshot(temporary)), ['assets/app.js', 'extra.txt']);
    if (process.platform !== 'win32') {
      fs.symlinkSync(path.join(temporary, 'extra.txt'), path.join(temporary, 'link'));
      assert.throws(() => snapshot(temporary), /simbólica/);
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

function fixture() {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'perfilwiki-public-'));
  const source = path.join(parent, 'source'), output = path.join(parent, 'export');
  const py = `import importlib.util,json\ns=importlib.util.spec_from_file_location('export_public',${JSON.stringify(path.join(root, 'scripts/export_public.py'))})\nm=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nprint(json.dumps({'files':m.ROOT_FILES+m.INSTALLER_FILES,'dirs':m.SOURCE_DIRS+m.STATIC_DIRS}))`;
  const result = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const spec = JSON.parse(result.stdout);
  for (const name of spec.files) { const target = path.join(source, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, 'Synthetic public input\n'); }
  for (const name of spec.dirs.concat('dist/1.19.0')) fs.mkdirSync(path.join(source, name), { recursive: true });
  fs.writeFileSync(path.join(source, 'package.json'), JSON.stringify({ version: '1.19.0' }));
  fs.copyFileSync(path.join(root, 'scripts/build.py'), path.join(source, 'scripts/build.py'));
  fs.writeFileSync(path.join(source, 'dist/1.19.0/current.txt'), 'Current synthetic release\n');
  fs.writeFileSync(path.join(source, 'dist/1.19.0/LICENSE'), 'Synthetic release license notice\n');
  for (const name of ['mockups/private-demo.html', 'dist/1.18.0/historical.txt', 'qa/synthetic-session.json', '.git/private-history']) {
    const target = path.join(source, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, 'Excluded synthetic material\n');
  }
  return { parent, source, output, run: () => spawnSync('python3', [path.join(root, 'scripts/export_public.py'), '--root', source, '--output', output], { encoding: 'utf8' }) };
}

test('curated export copies source and current release with verifiable hashes and omits history and drafts', () => {
  const f = fixture();
  try {
    const result = f.run(); assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(fs.readFileSync(path.join(f.output, 'PUBLIC_MANIFEST.json'), 'utf8'));
    assert.equal(manifest.publicationPerformed, false);
    assert.ok(manifest.files['dist/1.19.0/current.txt']);
    assert.ok(manifest.files['dist/1.19.0/LICENSE'], 'The extensionless distribution license must be retained');
    for (const name of ['mockups', 'qa', '.git', 'node_modules', 'dist/1.18.0']) assert.equal(fs.existsSync(path.join(f.output, name)), false, name);
    for (const [name, item] of Object.entries(manifest.files)) {
      const content = fs.readFileSync(path.join(f.output, name));
      assert.equal(content.length, item.bytes); assert.equal(crypto.createHash('sha256').update(content).digest('hex'), item.sha256);
    }
    assert.deepEqual(Object.keys(snapshot(f.output)).sort(),Object.keys(manifest.files).concat('PUBLIC_MANIFEST.json').sort(), 'Guard imports must not add cache, bytecode or any other unmanifested file');
    fs.writeFileSync(path.join(f.output, 'keep.txt'), 'Keep existing');
    assert.notEqual(f.run().status, 0); assert.equal(fs.readFileSync(path.join(f.output, 'keep.txt'), 'utf8'), 'Keep existing');
  } finally { fs.rmSync(f.parent, { recursive: true, force: true }); }
});

test('curated export rejects unreviewed binaries and sensitive inputs before creating a destination', () => {
  for (const name of ['src/unreviewed.png', '.env']) {
    const f = fixture();
    try {
      fs.writeFileSync(path.join(f.source, name), Buffer.from([0xff, 0, 0x80]));
      assert.notEqual(f.run().status, 0); assert.equal(fs.existsSync(f.output), false);
    } finally { fs.rmSync(f.parent, { recursive: true, force: true }); }
  }
});
