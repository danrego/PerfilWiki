import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {
  createInitialConfig, validateConfig, dashboardConfig, activationSnippet, activitySnippet, profileSnippet,
} from '../src/model.mjs';
import Appearance from '../../src/Appearance.js';
import Configuration from '../../src/Configuration.js';
import Activity from '../../src/ActivityView.js';
import Cards from '../../src/CardsView.js';
import Cache from '../../src/Cache.js';
import Core from '../../src/PageviewsCore.js';
import Presenter from '../../src/Presenter.js';

const user = 'Editora Exemplo';
const now = '2026-10-15T14:42:00Z';
const firstDate = '2007-08-20T23:30:00Z';
function config(patch = {}, appearance = {}) {
  const selected = { ...createInitialConfig(), user, displayName: 'Marina Pesquisa', timeZone: 'UTC', ...patch };
  Object.assign(selected.appearance, {profilePlacement:'activity'}, appearance);
  return selected;
}
function resolve(input) {
  return Configuration.resolve({ config: { get: () => user } }, { PerfilWikiConfig: input });
}
function state() {
  const settings = { user, project: 'pt.wikipedia.org', timeZone: 'UTC' };
  const entries = [[1, 9, 0, 'Artigo de exemplo', '2026-10-14T12:00:00Z', 0]];
  return { config: settings, capturedAt: now, pageviews: null, fresh: true,
    activity: { complete: true, entries, identity: settings, summary: Core.summarize(entries, { config: settings, now }) },
    statistics: { user, metrics: { edits: 1, registration: '2010-01-01T00:00:00Z', earliestRegistration: firstDate },
      registrationCoverage: { version: 1, user, checkedAt: now, complete: true,
        globalRegistration: '2008-01-01T00:00:00Z', accounts: [
          { wiki: 'enwiki', url: 'https://en.wikipedia.org', registration: firstDate },
          { wiki: 'ptwiki', url: 'https://pt.wikipedia.org', registration: '2010-01-01T00:00:00Z' },
        ] } } };
}
function options(input = {}, appearance = {}) {
  const selected = dashboardConfig(config(input, appearance));
  return { ...selected, now };
}

test('optional profile information and account-created visibility default empty without changing old configurations', () => {
  const first = createInitialConfig(), second = createInitialConfig();
  assert.equal(first.location, '');
  assert.deepEqual(first.customFields, []);
  assert.equal(first.appearance.showAccountCreated, false);
  first.customFields.push({ label: 'Interesse', value: 'História' });
  assert.deepEqual(second.customFields, []);
  const old = resolve({ user, timeZone: 'UTC' });
  assert.equal(old.location, '');
  assert.deepEqual(old.customFields, []);
  assert.equal(old.appearance.nameAlignment, 'left');
  assert.equal(old.appearance.showAccountCreated, false);
  const selected = config();
  delete selected.location;
  delete selected.customFields;
  delete selected.appearance.showAccountCreated;
  assert.equal(validateConfig(selected).valid, true);
  assert.equal(dashboardConfig(selected).appearance.showAccountCreated, false);
});

test('profile fields normalize plain Unicode text with the same point limits in both paths', () => {
  const selected = config({ location: '  E\u0301vora & Lisboa  ', customFields: [{ label: '  A\u0301rea  ', value: '  História 🧩  ' }] });
  const prepared = dashboardConfig(selected);
  assert.equal(prepared.location, 'Évora & Lisboa');
  assert.deepEqual(prepared.customFields, [{ label: 'Área', value: 'História 🧩' }]);
  const actual = resolve(prepared);
  assert.equal(actual.location, prepared.location);
  assert.deepEqual(actual.customFields, prepared.customFields);
  assert.equal(validateConfig(config({ location: '🧩'.repeat(120), customFields: [{ label: '🧩'.repeat(40), value: '🧩'.repeat(160) }] })).valid, true);
  assert.equal(resolve({ user, location: '🧩'.repeat(120) }).location.length, 240);
});

test('profile information rejects malformed fields, markup, controls and excessive lengths', () => {
  for (const location of [null, 1, {}, [], '🧩'.repeat(121), '<b>Nome</b>', '{{x}}', '[[x]', '[https://example.org X]', 'A|B', 'A\nB', 'A\u0085B', 'A\u2028B', 'A\u2029B']) {
    assert.ok(validateConfig(config({ location })).errors.location, JSON.stringify(location));
    assert.throws(() => dashboardConfig(config({ location })), TypeError);
    assert.throws(() => resolve({ user, location }));
  }
  for (const customFields of [null, {}, [null], [[]], [{ value: 'X' }],
    [{ label: 'X', value: 'Y', href: 'https://example.org' }],
    [{ label: 'a'.repeat(41), value: 'Y' }], [{ label: 'X', value: 'a'.repeat(161) }],
    [{ label: '<b>', value: 'Y' }], [{ label: 'X', value: '[[x]' }],
    Array.from({ length: 4 }, () => ({ label: 'X', value: 'Y' }))]) {
    assert.ok(validateConfig(config({ customFields })).errors.customFields, JSON.stringify(customFields));
    assert.throws(() => dashboardConfig(config({ customFields })), TypeError);
    assert.throws(() => resolve({ user, customFields }));
  }
});

test('blank draft rows are omitted and labels may stand alone while unlabelled values need correction', () => {
  const blank = { label: '  ', value: '' };
  const selected = config({ location: '  ', customFields: [blank, { label: 'Interesse', value: 'História' }] });
  assert.equal(validateConfig(selected).valid, true);
  assert.deepEqual(dashboardConfig(selected).customFields, [{ label: 'Interesse', value: 'História' }]);
  assert.deepEqual(resolve({ user, customFields: [blank] }).customFields, []);
  for (const field of [{ label: '', value: 'História' }]) {
    assert.ok(validateConfig(config({ customFields: [field] })).errors.customFields);
    assert.throws(() => resolve({ user, customFields: [field] }));
  }
  for (const field of [{label:'Pesquisadora'},{label:'Pesquisadora',value:''}]) {
    assert.equal(validateConfig(config({customFields:[field]})).valid,true);
    assert.deepEqual(dashboardConfig(config({customFields:[field]})).customFields,[{label:'Pesquisadora',value:''}]);
    assert.deepEqual(resolve({user,customFields:[field]}).customFields,[{label:'Pesquisadora',value:''}]);
  }
});

test('prepared configuration omits empty profile fields and exports populated root fields separately from metrics', () => {
  assert.equal(Object.hasOwn(dashboardConfig(config()), 'location'), false);
  assert.equal(Object.hasOwn(dashboardConfig(config()), 'customFields'), false);
  const selected = config({ location: 'Washington, DC', customFields: [{ label: 'Interesse', value: 'História' }] }, { showAccountCreated: true });
  const sandbox = { window: {} };
  vm.runInNewContext(activationSnippet(selected), sandbox);
  const prepared = JSON.parse(JSON.stringify(sandbox.window.PerfilWikiConfig));
  assert.equal(prepared.location, 'Washington, DC');
  assert.deepEqual(prepared.customFields, [{ label: 'Interesse', value: 'História' }]);
  assert.equal(prepared.appearance.showAccountCreated, true);
  const ordinary = resolve(dashboardConfig(config()));
  const changed = resolve(prepared);
  assert.deepEqual(changed.metrics, ordinary.metrics);
  for (const field of ['location', 'customFields', 'showAccountCreated']) assert.equal(Object.hasOwn(changed.metrics, field), false);
  assert.equal(changed.metrics.user, user);
});

test('initial, live, pending and saved profile information remains aligned literal text', () => {
  const customFields = [{ label: 'Página', value: 'https://example.org/pesquisa ~~~~ __NOTOC__' }];
  for (const nameAlignment of ['left', 'center', 'right']) {
    const selected = config({ location: 'Washington & Lisboa', customFields }, { nameAlignment });
    const markup = activitySnippet(selected);
    assert.match(markup, new RegExp('class="dan-pu-profile-details" style="[^"]*text-align:' + nameAlignment + ';'));
    assert.match(markup, /Washington &amp; Lisboa/);
    assert.match(markup, /https&#58;\/\/example\.org/);
    assert.doesNotMatch(markup, /~~~~|__NOTOC__/);
    for (const input of [state(), { config: { user, timeZone: 'UTC' }, activity: null }]) {
      for (const render of [Activity.html, Activity.wikitext]) {
        const output = render(input, options({ location: selected.location, customFields }, { nameAlignment }));
        assert.match(output, new RegExp('class="dan-pu-profile-details" style="[^"]*text-align:' + nameAlignment + ';'));
        assert.match(output, /Washington &amp; Lisboa/);
        assert.match(output, /Página:<\/span>/);
        assert.doesNotMatch(output, /<a[^>]+example\.org/);
        if (render === Activity.wikitext) assert.doesNotMatch(output, /~~~~|__NOTOC__|https:\/\/example\.org/);
      }
    }
  }
});

test('direct renderer options cannot inject HTML or wikitext through optional metadata', () => {
  const presentation = { location: '{{evil}} [[target]] <script> ~~~~ __NOTOC__',
    customFields: [{ label: '<img src=x>', value: '{{other}} [[x]] | " & https://example.org' }, {label:'Formação',value:'[[História]]'}], appearance: {profilePlacement:'activity'} };
  for (const render of [Activity.html, Activity.wikitext]) {
    const output = render(state(), presentation);
    assert.doesNotMatch(output, /<script>|<img src=x>/);
    assert.match(output, /&lt;script&gt;/);
    assert.doesNotMatch(output, /&lt;img src=x&gt;/);
    assert.match(output, /Forma/);
    if (render === Activity.wikitext) assert.doesNotMatch(output, /\{\{evil|\[\[target|~~~~|__NOTOC__|https:\/\/example\.org/);
  }
});

test('account-created display requires a strict optional boolean and stays disabled in older configurations', () => {
  assert.equal(Appearance.normalize().showAccountCreated, false);
  assert.equal(Appearance.normalize({ showAccountCreated: undefined }).showAccountCreated, false);
  for (const showAccountCreated of [null, 0, 1, '', 'true', [], {}]) {
    assert.equal(validateConfig(config({}, { showAccountCreated })).valid, false);
    assert.throws(() => Appearance.normalize({ showAccountCreated }));
    assert.throws(() => resolve({ user, appearance: { showAccountCreated } }));
  }
  assert.doesNotMatch(Activity.html(state(), options()), /class="dan-pu-account-created"/);
  assert.doesNotMatch(activitySnippet(config()), /class="dan-pu-account-created"/);
});

test('complete creation evidence renders the earliest linked date in UTC without changing local tenure registration', () => {
  const input = state();
  for (const render of [Activity.html, Activity.wikitext]) {
    const output = render(input, options({}, { showAccountCreated: true, nameAlignment: 'right' }));
    assert.match(output, /Conta criada em:(?:<\/strong>)? 20 de agosto de 2007/);
    assert.doesNotMatch(output, /Pode haver contas anteriores/);
    assert.match(output, /class="dan-pu-profile-details" style="[^"]*text-align:right;/);
    assert.equal(input.statistics.metrics.registration, '2010-01-01T00:00:00Z');
  }
  const selected = config({}, { showAccountCreated: true });
  for (const output of [activitySnippet(selected), profileSnippet(selected)]) assert.match(output, /Conta criada em:(?:<\/strong>)? Aguardando dados/);
});

test('unknown linked dates retain a qualified earliest-known date and cannot become a definite creation claim', () => {
  const input = state();
  input.statistics.registrationCoverage.complete = false;
  input.statistics.registrationCoverage.accounts[1].registration = null;
  for (const render of [Activity.html, Activity.wikitext]) {
    const output = render(input, options({}, { showAccountCreated: true }));
    assert.match(output, /Data de criação mais antiga disponível:(?:<\/strong>)? 20 de agosto de 2007/);
    assert.match(output, /Pode haver contas anteriores sem data registrada\./);
    assert.doesNotMatch(output, /Conta criada em:/);
  }
  input.statistics.registrationCoverage.complete = true;
  assert.doesNotMatch(Activity.html(input, options({}, { showAccountCreated: true })), /Conta criada em:/);
});

test('missing, unknown or inconsistent creation evidence displays unavailable instead of an invented date', () => {
  const variants = [
    input => { delete input.statistics.registrationCoverage; },
    input => { input.statistics.metrics.earliestRegistration = null; },
    input => { input.statistics.registrationCoverage.user = 'Outra pessoa'; },
    input => { input.statistics.user = 'Outra pessoa'; },
    input => { input.statistics.metrics.earliestRegistration = '2006-01-01T00:00:00Z'; },
    input => { input.statistics.registrationCoverage.checkedAt = '2999-01-01T00:00:00Z'; },
    input => { input.statistics.metrics.earliestRegistration = '2007-02-30T00:00:00Z'; },
  ];
  for (const change of variants) {
    const input = state();
    change(input);
    const output = Activity.html(input, options({}, { showAccountCreated: true }));
    assert.match(output, /Data de criação(?:<\/strong>)? indisponível/);
    assert.doesNotMatch(output, /Conta criada em:|Data de criação mais antiga disponível:/);
  }
});

test('runtime forwards optional profile fields into its live renderer and download without changing stored identity', async () => {
  const input = state(), calls = [], downloads = [];
  const store = new Map([['perfilwiki-v1-' + encodeURIComponent(user) + '-UTC-cache', Cache.packJson(JSON.stringify(input))]]);
  const panel = { style: {}, outerHTML: '', getAttribute: key => key === 'data-perfilwiki-user' ? user : null,
    querySelector: () => null, querySelectorAll: () => [] };
  const document = { readyState: 'complete', hidden: false, getElementById: id => id === 'dan-pu-ritmo' ? panel : null,
    addEventListener: () => {}, createElement: () => ({ click: () => {} }) };
  const values = { wgDBname: 'ptwiki', wgAction: 'view', wgUserName: user, wgRelevantUserName: user, wgNamespaceNumber: 2 };
  class LocalURL extends URL { static createObjectURL(blob) { downloads.push(blob); return 'blob:local'; } static revokeObjectURL() {} }
  const prepared = dashboardConfig(config({ location: 'Washington, DC', customFields: [{ label: 'Interesse', value: 'História' }] }, { showAccountCreated: true }));
  const win = { document, console, location: { hash: '' }, navigator: {}, PerfilWikiConfig: prepared,
    PerfilWikiConfiguration: Configuration, PerfilWikiAppearance: Appearance, PerfilWikiCache: Cache, PerfilWikiPresenter: Presenter,
    PerfilWikiActivityView: { html: (value, presentation) => { calls.push(presentation); return Activity.html(value, presentation); }, wikitext: Activity.wikitext },
    PerfilWikiCoordinator: { validateState: () => ({ valid: true }), update: () => assert.fail('No history request is needed for presentation') },
    localStorage: { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value) },
    setTimeout: () => 1, clearTimeout: () => {}, setInterval: () => 1, clearInterval: () => {}, addEventListener: () => {},
    mw: { config: { get: key => values[key] }, loader: { using: () => Promise.resolve() }, util: { addPortletLink: () => null } } };
  vm.runInNewContext(fs.readFileSync(new URL('../../src/Runtime.js', import.meta.url), 'utf8'),
    { window: win, Intl, Date, URL: LocalURL, Blob, Set, Map, AbortController });
  assert.equal(calls[0].location, prepared.location);
  assert.deepEqual(calls[0].customFields, prepared.customFields);
  assert.equal(calls[0].appearance.showAccountCreated, true);
  assert.equal(Object.hasOwn(win.PerfilWiki.getState().config, 'location'), false);
  assert.equal(Object.hasOwn(win.PerfilWiki.getState().config, 'customFields'), false);
  win.PerfilWiki.download();
  const saved = await downloads[0].text();
  assert.match(saved, /Washington, DC/);
  assert.ok(saved.includes(Activity.customFieldMarkup({label:'Interesse',value:'História'},true)));
  assert.match(saved, /Conta criada em:(?:<\/strong>)? 20 de agosto de 2007/);
});

class ProfileElement {
  constructor(tagName = 'div') { this.tagName = tagName; this.childNodes = []; this.style = {}; this.attributes = {}; this.parentNode = null; this.className = ''; this.ownText = ''; }
  set textContent(value) { this.ownText = String(value); this.childNodes = []; }
  get textContent() { return this.ownText + this.childNodes.map(child => child.textContent).join(''); }
  set innerHTML(_) { assert.fail('Profile painting must use safe text nodes, not HTML parsing.'); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return Object.hasOwn(this.attributes, key) ? this.attributes[key] : null; }
  appendChild(child) { if (child.parentNode) child.parentNode.removeChild(child); this.childNodes.push(child); child.parentNode = this; return child; }
  insertBefore(child, next) { if (next === null) return this.appendChild(child); const index = this.childNodes.indexOf(next); assert.ok(index >= 0); this.childNodes.splice(index, 0, child); child.parentNode = this; return child; }
  replaceChild(child, previous) { const index = this.childNodes.indexOf(previous); assert.ok(index >= 0); this.childNodes[index] = child; child.parentNode = this; previous.parentNode = null; return previous; }
  removeChild(child) { const index = this.childNodes.indexOf(child); assert.ok(index >= 0); this.childNodes.splice(index, 1); child.parentNode = null; return child; }
  get nextSibling() { if (!this.parentNode) return null; return this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) + 1] || null; }
  querySelector(selector) { for (const child of this.childNodes) { if (selector.startsWith('.') && child.className.split(' ').includes(selector.slice(1))) return child; const nested = child.querySelector(selector); if (nested) return nested; } return null; }
}
function profileDocument() {
  const panel = new ProfileElement(), label = new ProfileElement(), numbers = new ProfileElement(), readership = new ProfileElement();
  panel.setAttribute('data-perfilwiki-user', user);
  label.className = 'dan-pu-profile-label'; label.textContent = 'Nome antigo';
  numbers.textContent = '12345'; readership.className = 'dan-pu-readership'; readership.textContent = '67890 visualizações';
  panel.appendChild(label); panel.appendChild(numbers); panel.appendChild(readership);
  return { panel, label, numbers, readership,
    document: { getElementById: id => id === 'dan-pu-ritmo' ? panel : null, createElement: tagName => new ProfileElement(tagName) } };
}

test('cold profile painting updates only same-user metadata using safe DOM and preserves existing figures', () => {
  const fixture = profileDocument();
  const presentation = options({ location: 'Washington', customFields: [{ label: 'Interesse', value: 'História' }] });
  presentation.location = 'Washington <script>';
  assert.equal(Activity.paintProfile(fixture.document, null, { ...presentation, appearance: { nameAlignment: 'center', profilePlacement:'activity' } }), true);
  assert.equal(fixture.label.textContent, 'Marina Pesquisa');
  assert.equal(fixture.label.style.textAlign, 'center');
  const details = fixture.panel.querySelector('.dan-pu-profile-details');
  assert.equal(details.style.textAlign, 'center');
  assert.equal(details.querySelector('.dan-pu-profile-location').textContent, 'Washington <script>');
  assert.equal(details.querySelector('.dan-pu-profile-field').textContent, 'Interesse: História');
  assert.equal(fixture.numbers.textContent, '12345');
  assert.equal(fixture.readership.textContent, '67890 visualizações');
  assert.equal(fixture.panel.childNodes.includes(fixture.numbers), true);
  assert.equal(fixture.panel.childNodes.includes(fixture.readership), true);
  const previous = fixture.label.textContent;
  fixture.panel.setAttribute('data-perfilwiki-user', 'Outra pessoa');
  assert.equal(Activity.paintProfile(fixture.document, null, { ...presentation, displayName: 'Outro nome' }), false);
  assert.equal(fixture.label.textContent, previous);
});

test('cold profile painting retains validated saved account-date proof until new coverage is available', () => {
  const fixture = profileDocument(), presentation = options({}, { showAccountCreated: true, nameAlignment: 'right' });
  Activity.paintProfile(fixture.document, state(), presentation);
  let created = fixture.panel.querySelector('.dan-pu-account-created');
  assert.equal(created.textContent, 'Conta criada em: 20 de agosto de 2007');
  const proof = JSON.parse(created.getAttribute('data-perfilwiki-account-created'));
  assert.equal(proof.user, user);
  assert.equal(proof.complete, true);
  Activity.paintProfile(fixture.document, null, { ...presentation, displayName: 'Nome atualizado' });
  created = fixture.panel.querySelector('.dan-pu-account-created');
  assert.equal(created.textContent, 'Conta criada em: 20 de agosto de 2007');
  assert.equal(fixture.label.textContent, 'Nome atualizado');
  const unavailable = state();
  unavailable.statistics.metrics.earliestRegistration = null;
  unavailable.statistics.registrationCoverage.globalRegistration = null;
  unavailable.statistics.registrationCoverage.accounts.forEach(account => { account.registration = null; });
  unavailable.statistics.registrationCoverage.complete = false;
  Activity.paintProfile(fixture.document, unavailable, presentation);
  created = fixture.panel.querySelector('.dan-pu-account-created');
  assert.equal(created.textContent, 'Data de criação indisponível');
  assert.equal(created.getAttribute('data-perfilwiki-account-created'), null);
});

test('saved account dates cannot cross user identities and hidden metadata is removed without touching numbers', () => {
  const fixture = profileDocument(), presentation = options({}, { showAccountCreated: true });
  Activity.paintProfile(fixture.document, state(), presentation);
  fixture.panel.querySelector('.dan-pu-account-created').setAttribute('data-perfilwiki-account-created', JSON.stringify({ version: 1, user: 'Outra pessoa', timestamp: firstDate, complete: true }));
  Activity.paintProfile(fixture.document, null, presentation);
  assert.equal(fixture.panel.querySelector('.dan-pu-account-created').textContent, 'Data de criação indisponível');
  Activity.paintProfile(fixture.document, null, options());
  assert.equal(fixture.panel.querySelector('.dan-pu-profile-details'), null);
  assert.equal(fixture.numbers.textContent, '12345');
  assert.equal(fixture.readership.textContent, '67890 visualizações');
});

test('profile placement reaches both production renderers, saved output and starters with a single installation invitation', () => {
  const input = state();
  for (const profilePlacement of ['activity','cards','both']) {
    for (const [showCards,showActivity] of [[true,true],[true,false],[false,true]]) {
      const selected = config({location:'Em [[Rio de Janeiro|Rio]]',customFields:[{label:'Interesse',value:'[[História]]'}]},
        {profilePlacement,showCards,showActivity,showAccountCreated:true,nameAlignment:'center'});
      const presentation = {...dashboardConfig(selected),now};
      const cardCount = showCards && (!showActivity || profilePlacement !== 'activity') ? 1 : 0;
      const activityCount = showActivity && (!showCards || profilePlacement !== 'cards') ? 1 : 0;
      for (const wiki of [false,true]) {
        const card = wiki ? Cards.wikitext(input.statistics,input.activity,presentation) : Cards.html(input.statistics,input.activity,presentation);
        const activity = wiki ? Activity.wikitext(input,presentation) : Activity.html(input,presentation);
        assert.equal((card.match(/class="dan-pu-profile-label"/g)||[]).length,cardCount,profilePlacement+' cards '+showCards+showActivity);
        assert.equal((activity.match(/class="dan-pu-profile-label"/g)||[]).length,activityCount,profilePlacement+' activity '+showCards+showActivity);
        assert.equal(((card+activity).match(/Gostou deste painel\?/g)||[]).length,1);
        assert.equal(((card+activity).match(/Conta criada em:(?:<\/strong>)? 20 de agosto de 2007/g)||[]).length,cardCount+activityCount);
        if (cardCount) assert.match(card,/class="dan-pu-profile-details"[^>]+text-align:center;/);
        if (activityCount) assert.match(activity,/class="dan-pu-profile-details"[^>]+text-align:center;/);
        if (wiki) assert.equal(((card+activity).match(/\[\[:Rio de Janeiro\|Rio\]\]/g)||[]).length,cardCount+activityCount);
        else assert.equal(((card+activity).match(/href="https:\/\/pt\.wikipedia\.org\/wiki\/Rio_de_Janeiro"/g)||[]).length,cardCount+activityCount);
      }
      const initial = profileSnippet(selected);
      assert.equal((initial.match(/class="dan-pu-profile-label"/g)||[]).length,cardCount+activityCount);
      assert.equal((initial.match(/Gostou deste painel\?/g)||[]).length,1);
      assert.match(initial,/data-perfilwiki-user="Editora Exemplo"/);
    }
  }
});

test('profile placement can move verified linked metadata between roots without moving figures or losing a saved date', () => {
  const fixture = profileDocument(), slot = new ProfileElement(), cardRoot = new ProfileElement(), cardNumber = new ProfileElement();
  slot.className='dan-pu-profile-slot';
  fixture.panel.removeChild(fixture.label);slot.appendChild(fixture.label);fixture.panel.insertBefore(slot,fixture.numbers);
  cardRoot.setAttribute('data-perfilwiki-user',user);cardNumber.textContent='321';cardRoot.appendChild(cardNumber);
  fixture.document.getElementById=id=>id==='dan-pu-ritmo'?fixture.panel:id==='dan-pu-estatisticas'?cardRoot:null;
  const presentation=options({location:'[[Rio de Janeiro|Rio]]'}, {profilePlacement:'activity',showAccountCreated:true});
  Activity.paintProfile(fixture.document,state(),presentation);
  assert.equal(fixture.panel.querySelector('.dan-pu-profile-location').childNodes[0].tagName,'a');
  const moved={...presentation,appearance:{...presentation.appearance,profilePlacement:'cards'}};
  Activity.paintProfile(fixture.document,null,moved);
  assert.equal(fixture.panel.querySelector('.dan-pu-profile-label'),null);
  assert.equal(cardRoot.querySelector('.dan-pu-profile-label').textContent,'Marina Pesquisa');
  assert.equal(cardRoot.querySelector('.dan-pu-profile-location').textContent,'Rio');
  assert.equal(cardRoot.querySelector('.dan-pu-account-created').textContent,'Conta criada em: 20 de agosto de 2007');
  assert.ok(Activity.captureAccountCreated(cardRoot,user,now));
  Activity.paintProfile(fixture.document,null,{...moved,appearance:{...moved.appearance,profilePlacement:'both'}});
  assert.equal(fixture.panel.querySelector('.dan-pu-profile-label').textContent,'Marina Pesquisa');
  assert.equal(cardRoot.querySelector('.dan-pu-profile-label').textContent,'Marina Pesquisa');
  assert.equal(fixture.numbers.textContent,'12345');assert.equal(cardNumber.textContent,'321');
  assert.equal(fixture.readership.textContent,'67890 visualizações');
});

test('cards paint updates profile text when the card appearance is unchanged', () => {
  const root=new ProfileElement(), header=new ProfileElement(), label=new ProfileElement(), number=new ProfileElement();
  const settings=Appearance.normalize({profilePlacement:'cards',metrics:['edits']});
  root.setAttribute('data-perfilwiki-user',user);root.setAttribute('data-perfilwiki-appearance',JSON.stringify(settings));
  root.setAttribute('data-perfilwiki-rendered','ready');root.setAttribute('data-perfilwiki-documentation','Usuário:Daniel G Rego/PerfilWiki');
  header.className='dan-pu-cards-profile';label.className='dan-pu-profile-label';label.textContent='Nome antigo';header.appendChild(label);root.appendChild(header);
  number.textContent='1';root.appendChild(number);
  const document={getElementById:id=>id==='dan-pu-estatisticas'?root:id==='dan-pu-edicoes'?number:null,createElement:tag=>new ProfileElement(tag)};
  Cards.paint(document,state().statistics,state().activity,now,settings,{user,displayName:'Nome atualizado',location:'[[Portugal]]',customFields:[]});
  assert.equal(label.textContent,'Nome atualizado');
  assert.equal(root.querySelector('.dan-pu-profile-location').textContent,'Portugal');
  assert.equal(number.textContent,'1');
});
