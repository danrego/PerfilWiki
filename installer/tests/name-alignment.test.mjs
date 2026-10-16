import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {
  DEFAULT_APPEARANCE, createInitialConfig, validateConfig, dashboardConfig,
  activationSnippet, profileSnippet, activitySnippet, cardsSnippet,
} from '../src/model.mjs';
import Appearance from '../../src/Appearance.js';
import Configuration from '../../src/Configuration.js';
import Activity from '../../src/ActivityView.js';
import Cards from '../../src/CardsView.js';
import Core from '../../src/PageviewsCore.js';

const user = 'Editora Exemplo';
const now = '2026-10-15T14:42:00Z';
function config(patch = {}) {
  const result = { ...createInitialConfig(), user, displayName: 'Marina Pesquisa', timeZone: 'UTC' };
  Object.assign(result.appearance, {profilePlacement:'activity'}, patch);
  return result;
}
function resolve(input) {
  return Configuration.resolve({ config: { get: () => user } }, { PerfilWikiConfig: input });
}
function state() {
  const settings = { user, timeZone: 'UTC', project: 'pt.wikipedia.org' };
  const entries = [[1, 9, 0, 'Artigo de exemplo', '2026-10-14T12:00:00Z', 0]];
  return { config: settings, capturedAt: now, pageviews: null,
    activity: { complete: true, entries, summary: Core.summarize(entries, { config: settings, now }) } };
}
function nameStyle(markup) {
  const match = /class="dan-pu-profile-label" style="([^"]*)"/.exec(markup);
  assert.ok(match, 'The display-name element must exist.');
  return match[1];
}

test('display names default left while counter alignment remains independent', () => {
  assert.equal(DEFAULT_APPEARANCE.nameAlignment, 'left');
  assert.equal(Appearance.defaults.nameAlignment, 'left');
  for (const alignment of ['left', 'center', 'right']) {
    const selected = config({ alignment });
    assert.equal(selected.appearance.nameAlignment, 'left');
    for (const nameAlignment of ['left', 'center', 'right']) {
      selected.appearance.nameAlignment = nameAlignment;
      const prepared = dashboardConfig(selected);
      const runtime = resolve(prepared);
      assert.equal(runtime.appearance.nameAlignment, nameAlignment);
      assert.equal(runtime.appearance.alignment, alignment);
      assert.deepEqual(runtime.appearance, prepared.appearance);
    }
  }
});

test('older configurations without display-name alignment retain the left default', () => {
  const selected = config({ alignment: 'center' });
  delete selected.appearance.nameAlignment;
  assert.equal(validateConfig(selected).valid, true);
  assert.equal(dashboardConfig(selected).appearance.nameAlignment, 'left');
  assert.equal(resolve({ user, timeZone: 'UTC', appearance: { alignment: 'right' } }).appearance.nameAlignment, 'left');
  assert.equal(Appearance.normalize({ nameAlignment: undefined }).nameAlignment, 'left');
  assert.match(nameStyle(activitySnippet(selected)), /text-align:left;/);
});

test('unlisted alignment values cannot become CSS or markup in either configuration path', () => {
  for (const nameAlignment of ['', 'LEFT', ' left', 'right ', 'justify', 'left;display:none',
    'url(javascript:alert(1))', '" onmouseover="alert(1)', null, false, 1, [], {}]) {
    const selected = config({ nameAlignment });
    assert.equal(validateConfig(selected).valid, false, JSON.stringify(nameAlignment));
    assert.throws(() => dashboardConfig(selected), TypeError);
    assert.throws(() => activitySnippet(selected), TypeError);
    assert.throws(() => Appearance.normalize({ nameAlignment }));
    assert.throws(() => resolve({ user, timeZone: 'UTC', appearance: { nameAlignment } }));
  }
});

test('prepared activation and initial activity markup carry the independent choice', () => {
  for (const nameAlignment of ['left', 'center', 'right']) {
    const selected = config({ nameAlignment, alignment: 'right' });
    const sandbox = { window: {} };
    vm.runInNewContext(activationSnippet(selected), sandbox);
    assert.equal(sandbox.window.PerfilWikiConfig.appearance.nameAlignment, nameAlignment);
    for (const markup of [activitySnippet(selected), profileSnippet(selected)]) {
      assert.match(nameStyle(markup), new RegExp('text-align:' + nameAlignment + ';'));
      assert.ok(markup.includes('&quot;nameAlignment&quot;:&quot;' + nameAlignment + '&quot;'));
      assert.match(markup, /data-perfilwiki-user="Editora Exemplo"/);
    }
  }
});

test('live and saved activity align only the display label and leave the other headings unchanged', () => {
  const input = state();
  for (const nameAlignment of ['left', 'center', 'right']) {
    const selected = config({ nameAlignment, alignment: 'right' });
    for (const render of [Activity.html, Activity.wikitext]) {
      const markup = render(input, { displayName: selected.displayName, appearance: selected.appearance, now });
      assert.match(nameStyle(markup), new RegExp('text-align:' + nameAlignment + ';'));
      assert.match(markup, /class="dan-pu-profile-label"[^>]*>Marina Pesquisa<\/div>/);
      assert.match(markup, /Visualizações dos artigos editados por Marina Pesquisa\./);
      const readershipStyle = /class="dan-pu-readership-heading" style="([^"]*)"/.exec(markup)[1];
      assert.doesNotMatch(readershipStyle, /text-align:/);
      const titleStyle = /<div style="([^"]*)">Atividade na Wikipédia em Português<\/div>/.exec(markup)[1];
      assert.doesNotMatch(titleStyle, /text-align:/);
      assert.match(markup, /data-perfilwiki-user="Editora Exemplo"/);
    }
  }
});

test('pending activity keeps the selected alignment and escapes the display name', () => {
  for (const render of [Activity.html, Activity.wikitext]) {
    const markup = render({ config: { user, timeZone: 'UTC' }, activity: null }, {
      displayName: 'Marina "Pesquisa" & ~~~~', appearance: { nameAlignment: 'right', profilePlacement:'activity' },
    });
    assert.match(nameStyle(markup), /text-align:right;/);
    assert.match(markup, /Marina &quot;Pesquisa&quot; &amp;/);
    assert.match(markup, /As estatísticas ainda não foram consultadas/);
    assert.equal((markup.match(/Gostou deste painel\?/g) || []).length, 1);
    if (render === Activity.wikitext) assert.doesNotMatch(markup, /~~~~/);
  }
});

test('cards-only exports retain counter alignment and move the display label into the visible block', () => {
  const selected = config({ nameAlignment: 'center', alignment: 'left', showActivity: false });
  assert.equal(activitySnippet(selected), '');
  assert.match(profileSnippet(selected), /class="dan-pu-profile-label"[^>]*text-align:center;/);
  for (const markup of [cardsSnippet(selected), Cards.html({ user, metrics: {} }, null, { user, appearance: selected.appearance })]) {
    assert.match(markup, /text-align:left;/);
    assert.match(markup, /class="dan-pu-profile-label"[^>]*text-align:center;/);
  }
  assert.equal(Activity.html(state(), { appearance: selected.appearance }), '');
});

test('display-name alignment stays out of metric configuration and account cache identity', () => {
  const normal = resolve(dashboardConfig(config()));
  for (const nameAlignment of ['center', 'right']) {
    const changed = resolve(dashboardConfig(config({ nameAlignment })));
    assert.deepEqual(changed.metrics, normal.metrics);
    assert.equal(changed.displayName, normal.displayName);
    assert.equal(changed.metrics.user, user);
    assert.equal(Object.hasOwn(changed.metrics, 'nameAlignment'), false);
  }
});
