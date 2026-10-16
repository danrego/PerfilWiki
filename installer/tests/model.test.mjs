import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {
  METRICS, THEMES, PERIODS, DEFAULT_APPEARANCE, createInitialConfig,
  normalizeUser, validateConfig, profileTitle, moveMetric, hexColorValid,
  contrastRatio, readableForeground, activationSnippet, profileSnippet,
  appendDemo, initialEditorText, dashboardConfig, cardsSnippet, activitySnippet, installFiles, editorUrl, INSTALLER_VERSION, STYLES_PAGE, PROGRAM_PAGE,
} from '../src/model.mjs';

function ready(overrides = {}) {
  return { ...createInitialConfig(), user: 'Editora Exemplo', ...overrides };
}

function configurationFromSnippet(snippet) {
  const sandbox = { window: {} };
  vm.runInNewContext(snippet, sandbox, { timeout: 100 });
  return JSON.parse(JSON.stringify(sandbox.window.PerfilWikiConfig));
}

test('each new wizard gets independent state and a usable automatic timezone', () => {
  const first = createInitialConfig();
  const second = createInitialConfig();
  assert.equal(first.user, '');
  assert.equal(first.appearance.layout, 'integrated');
  assert.equal(validateConfig(first).valid, false);
  assert.equal(validateConfig(ready()).valid, true);
  first.appearance.metrics.pop();
  first.appearance.accent = '#ff0000';
  assert.equal(second.appearance.metrics.length, 8);
  assert.equal(DEFAULT_APPEARANCE.metrics.length, 8);
  assert.equal(second.appearance.accent, '#3366cc');
  assert.equal(METRICS.length, 24);
  assert.equal(new Set(METRICS.map(({ id }) => id)).size, 24);
  assert.deepEqual(PERIODS.map(({ id }) => id), ['30d', '90d', '12m', 'since', 'custom']);
});

test('username normalization preserves accents and normalizes underscores and Unicode', () => {
  assert.equal(normalizeUser('  Jose\u0301_da_Silva  '), 'José da Silva');
  assert.equal(normalizeUser(null), '');
  assert.equal(validateConfig(ready({ user: "Ana d'Ávila" })).valid, true);
  assert.equal(profileTitle(ready({ user: '  Jose\u0301_da_Silva ', destination: 'subpage', subpage: ' Minha página ' })), 'Usuário:José da Silva/Minha página');
});

test('account validation rejects namespace, paths, markup, controls and excessive length', () => {
  for (const user of ['', 'Usuário:Exemplo', 'Exemplo/PU', 'A#B', '<script>', 'A[B', 'A]B', '{{x}}', 'A|B', 'A\nB', 'A\n', '\nA', 'A\t', 'A\u0085B', 'a'.repeat(256), '.', '..']) {
    assert.ok(validateConfig(ready({ user })).errors.user, JSON.stringify(user));
    assert.throws(() => activationSnippet(ready({ user })), TypeError);
    assert.throws(() => profileSnippet(ready({ user })), TypeError);
  }
});

test('timezone and subpage validation prevents invalid destinations while allowing a normal title', () => {
  assert.equal(validateConfig(ready({ timeZone: 'America/Sao_Paulo' })).valid, true);
  assert.equal(validateConfig(ready({ timeZone: 'UTC' })).valid, true);
  assert.ok(validateConfig(ready({ timeZone: 'Mars/Crater' })).errors.timeZone);
  assert.ok(validateConfig(ready({ timeZone: ' UTC ' })).errors.timeZone);
  assert.ok(validateConfig(ready({ destination: 'other' })).errors.subpage);
  for (const subpage of ['', '.', '..', '../PU', 'A/PU', 'A..B', 'A:B', 'A|B', '<x>', 'PU\n']) {
    assert.ok(validateConfig(ready({ destination: 'subpage', subpage })).errors.subpage, subpage);
  }
  assert.equal(validateConfig(ready({ destination: 'subpage', subpage: 'Estatísticas pessoais' })).valid, true);
  assert.equal(validateConfig(ready({ destination: 'main', subpage: '' })).valid, true);
});

test('custom colors require an exact six-digit hex value', () => {
  for (const value of ['#123abc', '#ABCDEF', '#000000', '#ffffff']) assert.equal(hexColorValid(value), true);
  for (const value of ['#fff', 'red', '123abc', '#123abc;', '#123abc;background:red', null, '#123abg', '#123abc\n']) assert.equal(hexColorValid(value), false);
  const config = ready();
  config.appearance.theme = 'custom';
  config.appearance.accent = '#eeccee';
  assert.equal(validateConfig(config).valid, true);
  config.appearance.accent = 'url(https://example.org)';
  assert.ok(validateConfig(config).errors.appearance);
});

test('contrast uses WCAG luminance and chooses the better text color', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#3366cc', '#3366cc'), 1);
  assert.equal(contrastRatio('#ffffff', '#000000'), 21);
  assert.equal(readableForeground('#ffffff'), '#000000');
  assert.equal(readableForeground('#000000'), '#ffffff');
  for (const { accent } of THEMES) {
    const foreground = readableForeground(accent);
    assert.equal(foreground, '#ffffff');
    assert.ok(contrastRatio(accent, foreground) >= 4.5);
  }
  assert.throws(() => contrastRatio('red', '#000000'), TypeError);
});

test('automatic text color meets AA for midtones, grayscale and a broad RGB sample', () => {
  const colors = ['#808080', '#777777', '#ffffff', '#000000', '#ffff00'];
  for (let value = 0; value <= 255; value += 1) colors.push('#' + value.toString(16).padStart(2, '0').repeat(3));
  const channels = [0, 17, 51, 85, 102, 119, 128, 153, 187, 204, 238, 255];
  for (const red of channels) for (const green of channels) for (const blue of channels) {
    colors.push('#' + [red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join(''));
  }
  for (const color of colors) {
    const foreground = readableForeground(color);
    assert.ok(['#ffffff', '#000000'].includes(foreground));
    assert.ok(contrastRatio(color, foreground) >= 4.5, color);
  }
  assert.equal(readableForeground('#808080'), '#000000');
  assert.equal(readableForeground('#777777'), '#000000');
  assert.equal(readableForeground('#ffff00'), '#000000');
});

test('metric ordering is immutable and stops at each edge', () => {
  const order = ['tenure', 'edits', 'thanks'];
  assert.deepEqual(moveMetric(order, 'edits', -1), ['edits', 'tenure', 'thanks']);
  assert.deepEqual(moveMetric(order, 'edits', 1), ['tenure', 'thanks', 'edits']);
  for (const [id, direction] of [['tenure', -1], ['thanks', 1], ['missing', 1], ['edits', 2]]) {
    assert.deepEqual(moveMetric(order, id, direction), order);
    assert.notEqual(moveMetric(order, id, direction), order);
  }
  assert.deepEqual(order, ['tenure', 'edits', 'thanks']);
});

test('appearance validation prevents an empty page and unknown or duplicate counters', () => {
  for (const change of [
    { showCards: false, showActivity: false }, { metrics: [] },
    { metrics: ['edits', 'edits'] }, { metrics: ['unexpected'] },
    { showCards: 1 }, { initialPeriod: 'forever' }, { density: 'huge' },
    { layout: 'unknown' }, { theme: 'unknown' }, { accent: '#fff' }, { alignment: 'justify' },
  ]) {
    const config = ready();
    Object.assign(config.appearance, change);
    assert.ok(validateConfig(config).errors.appearance, JSON.stringify(change));
  }
  const config = ready();
  Object.assign(config.appearance, { showCards: false, metrics: [], showActivity: true });
  assert.equal(validateConfig(config).valid, true);
});

test('every customization choice reaches the real guarded dashboard configuration', () => {
  const config = ready({ user: '  Editora_Exemplo ', destination: 'subpage', subpage: 'Painel' });
  Object.assign(config.appearance, {
    theme: 'custom', accent: '#EECcEe', density: 'compact', layout: 'separate', alignment: 'left',
    metrics: ['edits', 'bestStreak'], initialPeriod: 'since', showActivity: false,
  });
  const snippet = activationSnippet(config);
  const restored = configurationFromSnippet(snippet);
  assert.deepEqual(restored, {
    user: 'Editora Exemplo', timeZone: config.timeZone,
    stylesPage: STYLES_PAGE, documentationPage: 'Usuário:Daniel G Rego/PerfilWiki',
    appearance: { ...config.appearance, accent: '#eeccee' },
  });
  assert.deepEqual(dashboardConfig(config), restored);
  assert.ok(snippet.includes(INSTALLER_VERSION));
  assert.match(snippet, /importScript\(/u);
  assert.doesNotMatch(snippet, /PerfilWikiPrototype|NÃO INSTALAR|fetch\s*\(|XMLHttpRequest/u);
  assert.equal(config.user, '  Editora_Exemplo ');
  assert.equal(DEFAULT_APPEARANCE.alignment, 'right');
});

test('personal loader imports once only for its configured owner on a Portuguese Wikipedia user-page view', () => {
  const config = ready();
  const snippet = activationSnippet(config);
  const base = { wgDBname: 'ptwiki', wgAction: 'view', wgNamespaceNumber: 2, wgUserName: config.user, wgRelevantUserName: config.user, wgTitle: config.user + '/PU' };
  function run(changes = {}, windowChanges = {}, omitImport = false) {
    const calls = [];
    const fields = { ...base, ...changes };
    const sandbox = { window: { ...windowChanges }, mw: { config: { get: (key) => fields[key] } } };
    if (!omitImport) sandbox.importScript = (title) => calls.push(title);
    vm.runInNewContext(snippet, sandbox, { timeout: 100 });
    vm.runInNewContext(snippet, sandbox, { timeout: 100 });
    return { sandbox, calls };
  }
  assert.deepEqual(run().calls, [PROGRAM_PAGE]);
  assert.deepEqual(run({ wgRelevantUserName: undefined, wgTitle: 'Editora_Exemplo/PU' }).calls, [PROGRAM_PAGE]);
  for (const changes of [
    { wgDBname: 'enwiki' }, { wgAction: 'edit' }, { wgAction: 'submit' },
    { wgNamespaceNumber: 0 }, { wgNamespaceNumber: 3 }, { wgUserName: null },
    { wgUserName: 'Outra pessoa' }, { wgRelevantUserName: 'Outra pessoa' },
    { wgUserName: 'Outra pessoa', wgRelevantUserName: 'Outra pessoa' },
  ]) assert.deepEqual(run(changes).calls, [], JSON.stringify(changes));
  assert.deepEqual(run({}, { PerfilWiki: {} }).calls, []);
  assert.deepEqual(run({}, { PerfilWikiLoaderRequested: true }).calls, []);
  assert.deepEqual(run({}, {}, true).calls, []);
  const noEnvironment = { window: {} };
  assert.doesNotThrow(() => vm.runInNewContext(snippet, noEnvironment, { timeout: 100 }));
});

test('valid punctuation is escaped in exported markup without changing identity', () => {
  const config = ready({ user: "Ana & O'Connor \"Edições\"" });
  assert.equal(configurationFromSnippet(activationSnippet(config)).user, config.user);
  const profile = profileSnippet(config);
  assert.match(profile, /Ana &amp; O&#39;Connor &quot;Edições&quot;/u);
  assert.match(profile, /data-perfilwiki-appearance="\{&quot;theme&quot;/u);
  assert.doesNotMatch(profile, /data-perfilwiki-prototype|PerfilWikiPrototype/u);
});

test('initial blocks use all runtime IDs exactly once and never invent statistics', () => {
  const config = ready();
  const profile = profileSnippet(config);
  const ids = ['perfilwiki-anos', 'dan-pu-ritmo-melhor-sequencia', 'dan-pu-agradecimentos', 'dan-pu-edicoes', 'dan-pu-reversoes', 'dan-pu-editados', 'dan-pu-artigos', 'dan-pu-criados-tecnicos', 'dan-pu-estatisticas', 'dan-pu-ritmo'];
  for (const id of ids) assert.equal(profile.split(`id="${id}"`).length - 1, 1, id);
  assert.equal((profile.match(/<templatestyles /gu) || []).length, 1);
  assert.match(profile, /Atividade na Wikipédia em Português/u);
  assert.match(profile, /data-perfilwiki-project="pt\.wikipedia\.org"/u);
  assert.equal((profile.match(/data-perfilwiki-rendered="pending"/gu) || []).length, 2);
  assert.equal((profile.match(/Aguardando dados/gu) || []).length, 9);
  for (const { value } of METRICS) assert.ok(!profile.includes(`>${value}<`));
  assert.doesNotMatch(profile, /importScript|fetch\s*\(|XMLHttpRequest|<script|https?:\/\//u);
});

test('exports honor selected counter order, alignment, spacing and panel visibility', () => {
  const config = ready();
  Object.assign(config.appearance, { theme: 'custom', accent: '#FFFF00', alignment: 'center', density: 'compact', metrics: ['edits', 'thanks'], initialPeriod: '90d' });
  const profile = profileSnippet(config);
  assert.ok(profile.indexOf('data-perfilwiki-metric="edits"') < profile.indexOf('data-perfilwiki-metric="thanks"'));
  assert.equal((profile.match(/Aguardando dados/gu) || []).length, 3);
  assert.match(profile, /dan-pu-density-compact dan-pu-align-center dan-pu-layout-integrated dan-pu-initial-90d/u);
  assert.match(profile, /text-align:center;/u);
  assert.match(profile, /padding:12px 14px;/u);
  assert.match(profile, /font-size:24px;/u);
  assert.match(profile, /border-top:3px solid #ffff00;/u);
  config.appearance.showCards = false;
  assert.doesNotMatch(profileSnippet(config), /id="dan-pu-estatisticas"/u);
  assert.equal(cardsSnippet(config), '');
  config.appearance.showCards = true;
  config.appearance.showActivity = false;
  assert.doesNotMatch(profileSnippet(config), /id="dan-pu-ritmo"/u);
  assert.equal(activitySnippet(config), '');
});

test('separate placement provides comments only and retains independent block exports', () => {
  const config = ready();
  config.appearance.layout = 'together';
  const together = profileSnippet(config);
  config.appearance.layout = 'separate';
  const separate = profileSnippet(config);
  const cardsPosition = separate.indexOf('id="dan-pu-estatisticas"');
  const slotPosition = separate.indexOf('<!-- Posição dos blocos:');
  const activityPosition = separate.indexOf('id="dan-pu-ritmo"');
  assert.ok(cardsPosition < slotPosition && slotPosition < activityPosition);
  assert.doesNotMatch(separate, /Seu texto pode ficar|Sobre meu trabalho|Aqui você pode apresentar|perfilwiki-prototype/u);
  assert.match(cardsSnippet(config), /id="dan-pu-estatisticas"/u);
  assert.doesNotMatch(cardsSnippet(config), /id="dan-pu-ritmo"/u);
  assert.match(activitySnippet(config), /id="dan-pu-ritmo"/u);
  assert.doesNotMatch(activitySnippet(config), /id="dan-pu-estatisticas"/u);
  config.appearance.layout = 'together';
  assert.equal(profileSnippet(config), together);
});

test('installation file metadata has complete text, destinations and manual editor URLs', () => {
  const config = ready({ user: "Ana d'Ávila", destination: 'subpage', subpage: 'Meu painel' });
  const files = installFiles(config);
  assert.deepEqual(files.map(({ id }) => id), ['activation', 'profile']);
  const standalone = ready({user:config.user,destination:config.destination,subpage:config.subpage});
  standalone.appearance.layout='separate';
  assert.deepEqual(installFiles(standalone).map(({id})=>id),['activation','profile','cards','activity']);
  for (const file of files) {
    assert.ok(file.title && file.filename && file.text && file.summary && file.destination);
    const url = new URL(file.editorUrl);
    assert.equal(url.origin, 'https://pt.wikipedia.org');
    assert.equal(url.pathname, '/w/index.php');
    assert.equal(url.searchParams.get('action'), 'edit');
    assert.equal(url.searchParams.get('title'), file.destination);
    assert.equal([...url.searchParams.keys()].length, 2);
    assert.ok(file.text.includes(INSTALLER_VERSION));
    assert.doesNotMatch(file.filename, /demo/u);
  }
  assert.equal(files[0].destination, "Usuário:Ana d'Ávila/common.js");
  assert.equal(files[1].destination, "Usuário:Ana d'Ávila/Meu painel");
  config.appearance.showCards = false;
  assert.deepEqual(installFiles(config).map(({ id }) => id), ['activation', 'profile', 'activity']);
  for (const title of ['', '<script>', 'A#B', 'A\nB']) assert.throws(() => editorUrl(title), TypeError);
});

test('append simulation preserves every existing byte and never duplicates an owned block', () => {
  const config = ready();
  for (const [kind, snippet] of [['activation', activationSnippet(config)], ['profile', profileSnippet(config)], ['profile', cardsSnippet(config)], ['profile', activitySnippet(config)]]) {
    const base = initialEditorText(kind, config);
    const combined = appendDemo(base, snippet);
    assert.ok(combined.startsWith(base));
    assert.ok(combined.endsWith(snippet));
    assert.equal(appendDemo(combined, snippet), combined);
    assert.equal(appendDemo('', snippet), snippet);
    assert.equal(appendDemo(base + '\n\n', snippet), base + '\n\n' + snippet);
    assert.equal(appendDemo(base + '\n', snippet), base + '\n\n' + snippet);
  }
  const activation = activationSnippet(config);
  const profile = profileSnippet(config);
  const combined = appendDemo(appendDemo('existing', activation), profile);
  assert.ok(combined.includes(activation));
  assert.ok(combined.includes(profile));
  assert.equal(appendDemo(combined, profile), combined);
  assert.throws(() => appendDemo('existing', 'unmarked replacement'), TypeError);
  assert.throws(() => initialEditorText('other', config), TypeError);
});

test('damaged, duplicated, legacy and outdated owned blocks retain the draft and stop appending', () => {
  const config = ready();
  for (const snippet of [activationSnippet(config), profileSnippet(config), cardsSnippet(config), activitySnippet(config)]) {
    const markerLines = snippet.split('\n').filter((line) => /PERFILWIKI-(?:ACTIVATION|PROFILE|CARDS|ACTIVITY)-(BEGIN|END)/u.test(line));
    const start = markerLines[0], end = markerLines.at(-1);
    const damaged = [
      'Original text\n' + start,
      'Original text\n' + end,
      'Original text\n' + end + '\n' + start,
      'Original text\n' + snippet + '\n' + snippet,
      'Original text\n' + snippet.replace(config.user, 'Outra pessoa'),
      '<!-- PERFILWIKI-PROTOTYPE-PROFILE-BEGIN -->legacy',
    ];
    for (const before of damaged) {
      const original = before;
      assert.throws(() => appendDemo(before, snippet), /bloco (?:do PerfilWiki diferente ou incompleto|antigo do protótipo)/u);
      assert.equal(before, original);
    }
    assert.equal(appendDemo('Original text\n' + snippet, snippet), 'Original text\n' + snippet);
  }
});

test('an entire customized local installation retains prior script, page text and categories', () => {
  const config = ready({ user: 'Pessoa_Exemplo', timeZone: 'Europe/Lisbon', destination: 'subpage', subpage: 'Minha página' });
  config.appearance.metrics = moveMetric(['tenure', 'bestStreak', 'edits'], 'edits', -1);
  Object.assign(config.appearance, { theme: 'forest', accent: '#246342', density: 'compact', alignment: 'right', layout: 'separate', initialPeriod: '12m' });
  assert.equal(validateConfig(config).valid, true);
  assert.equal(profileTitle(config), 'Usuário:Pessoa Exemplo/Minha página');
  const scriptBefore = 'window.myExistingTool = { enabled: true };';
  const profileBefore = '== Minha página ==\nTexto já existente.\n[[Categoria:Wikipedistas]]';
  const scriptAfter = appendDemo(scriptBefore, activationSnippet(config));
  const profileAfter = appendDemo(profileBefore, profileSnippet(config));
  assert.ok(scriptAfter.startsWith(scriptBefore));
  assert.ok(profileAfter.startsWith(profileBefore));
  const sandbox = { window: {} };
  vm.runInNewContext(scriptAfter, sandbox, { timeout: 100 });
  assert.equal(sandbox.window.myExistingTool.enabled, true);
  assert.equal(sandbox.window.PerfilWikiConfig.appearance.accent, '#246342');
  assert.equal(sandbox.window.PerfilWikiConfig.appearance.layout, 'separate');
  assert.equal(sandbox.window.PerfilWikiConfig.user, 'Pessoa Exemplo');
  assert.equal(appendDemo(profileAfter, profileSnippet(config)), profileAfter);
});
