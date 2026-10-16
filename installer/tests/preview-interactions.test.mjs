import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import Cards from '../../src/CardsView.js';
import Layout from '../../src/LayoutView.js';
import I18n from '../../src/I18n.js';
import { METRICS } from '../src/model.mjs';

const sampleContext={module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(new URL('../public/local-preview/sample-views.js',import.meta.url),'utf8'),sampleContext);
const SampleViews=sampleContext.module.exports;

const script = fs.readFileSync(new URL('../public/local-preview/frame.js', import.meta.url), 'utf8');

function node(tag) {
  const attrs = {}, children = [], names = new Set();
  const result = {
    tag, attrs, children, style: {}, textContent: '', parentNode: null,
    classList: { add: (...items) => items.forEach(item => names.add(item)), remove: (...items) => items.forEach(item => names.delete(item)), toggle: (item, enabled) => enabled ? names.add(item) : names.delete(item), has: item => names.has(item) },
    setAttribute(name, value) { attrs[name] = String(value); if (name === 'class') { names.clear(); value.split(/\s+/).forEach(item => names.add(item)); } },
    getAttribute: name => attrs[name] ?? null,
    removeAttribute(name) { delete attrs[name]; },
    remove() { const index=result.parentNode?.children.indexOf(result); if(index>=0) result.parentNode.children.splice(index,1); },
    appendChild(child) { child.parentNode = result; children.push(child); return child; },
    insertBefore(child, before) { child.parentNode = result; const index = children.indexOf(before); if (index < 0) children.push(child); else children.splice(index, 0, child); return child; },
    get firstChild() { return children[0] || null; },
    matches(selector) {
      const requestedTag = selector.match(/^[a-z]+/i)?.[0];
      const requestedId = selector.match(/#([\w-]+)/)?.[1];
      return (!requestedId || attrs.id === requestedId) && (!requestedTag || tag === requestedTag) && [...selector.matchAll(/\.([\w-]+)/g)].every(([, name]) => names.has(name)) && [...selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)].every(([, name, value]) => value === undefined ? attrs[name] !== undefined : attrs[name] === value);
    },
    closest(selector) { let current = result; while (current) { if (current.matches(selector)) return current; current = current.parentNode; } return null; },
    querySelector(selector) { for (const child of children) { if (child.matches(selector)) return child; const descendant = child.querySelector(selector); if (descendant) return descendant; } return null; },
    focus(options) { result.focused = true; result.focusOptions = options; }, setPointerCapture() {}, hasPointerCapture: () => true, releasePointerCapture() {},
    getBoundingClientRect: () => ({ height: 300 }),
  };
  return result;
}

function fixture({ editable = true, rangeEditable = true, metrics = ['tenure', 'thanks'], footer = false, profileLinks = false } = {}) {
  const handlers = {}, outerHandlers = {}, messages = [];
  let underPointer = null, renderedStatistics, renderedPresentation, renderedCardsPresentation, renderedHeaderPresentation, renderedState;
  const body = node('body');
  const cards = metrics.map(metric => {
    const card = node('div');
    card.setAttribute('class', 'dan-pu-stat-card');
    const label = node('div');
    label.setAttribute('class', 'dan-pu-stat-label');
    label.textContent = METRICS.find(item => item.id === metric)?.label || metric;
    card.label = label;
    card.appendChild(label);
    Object.defineProperty(card, 'handle', { get: () => card.querySelector('.local-card-drag') });
    return card;
  });
  const root = node('div');
  root.setAttribute('id', 'dan-pu-estatisticas');
  const invitation = node('div');
  invitation.setAttribute('id', 'dan-pu-ritmo-install');
  invitation.textContent = 'Gostou deste painel?';
  const details=node('div'); details.setAttribute('class','dan-pu-profile-details');
  const profileLink=node('a');profileLink.setAttribute('href','https://pt.wikipedia.org/wiki/Washington%2C_D.C.');profileLink.setAttribute('target','_blank');details.appendChild(profileLink);
  const outsideLink=node('a');outsideLink.setAttribute('href','https://pt.wikipedia.org/wiki/Brasil');
  const remoteLink=node('a');remoteLink.setAttribute('href','https://example.com/');details.appendChild(remoteLink);
  const rangeControls=Object.fromEntries(['start','end','apply'].map(name=>{const control=node(name==='apply'?'button':'input');control.setAttribute('id','dan-pu-custom-'+name);control.value='';control.setCustomValidity=value=>{control.validationMessage=value;};control.reportValidity=()=>!control.validationMessage;return ['dan-pu-custom-'+name,control];}));
  const dashboard = node('main');
  dashboard.querySelectorAll = selector => selector === '.dan-pu-stat-card[data-preview-metric]' || selector === '#dan-pu-estatisticas > .dan-pu-stat-card' ? cards : selector === 'a[href]' && profileLinks ? [profileLink,outsideLink,remoteLink] : [];
  Object.defineProperty(dashboard, 'innerHTML', { set() { dashboard.children.length = 0; root.children.length = 0; cards.forEach(card => { card.children.length = 0; card.appendChild(card.label); root.appendChild(card); }); if (footer) root.appendChild(invitation); dashboard.appendChild(root);if(profileLinks){dashboard.appendChild(details);dashboard.appendChild(outsideLink);} } });
  const document = {
    activeElement: body, body, documentElement:{lang:'pt-BR'},
    getElementById: id => id === 'dashboard' ? dashboard : rangeControls[id] || dashboard.querySelector('#' + id),
    createElement: node, head: { appendChild() {} },
    addEventListener: (type, handler) => { handlers[type] = handler; },
    elementFromPoint: () => underPointer,
  };
  const parent = { postMessage: message => messages.push(message) };
  const origin = 'http://127.0.0.1:8788';
  const window = {
    PerfilWikiI18n:I18n,
    PerfilWikiLayoutView:Layout,
    PerfilWikiProfileHeaderView:{html:(_state,options)=>{renderedHeaderPresentation=options;return '';}},
    PerfilWikiAppearance: { normalize: appearance => appearance, metricIds: METRICS.map(metric => metric.id), colors: () => ({ ink: '#202122', tint: '#eaecf0' }) },
    PerfilWikiCardsView: { html: (statistics,_activity,options) => { renderedStatistics = statistics; renderedCardsPresentation=options; return ''; } }, PerfilWikiActivityView: { html: (state, options) => { renderedState=state; renderedPresentation = options; return ''; } },
    PerfilWikiLocalFixture: { entries: [[1], [1], [2]], now: '2026-10-15T12:00:00Z', metrics: { bytesAdded: 126, bytesRemoved: 80 }, pageviews: {periods:{},metadata:{cohort:[{pageid:1,title:'Brasil',firstEditAt:'2014-01-01T00:00:00Z'},{pageid:2,title:'Portugal',firstEditAt:'2014-01-01T00:00:00Z'}]}} },
    PerfilWikiPageviewsCore: { summarize: () => ({}) },PerfilWikiSampleViews:SampleViews,
  };
  vm.runInNewContext(script, {
    window, document, parent, location: { origin, hash: '' },
    addEventListener: (type, handler) => { outerHandlers[type] = handler; },
    requestAnimationFrame: handler => handler(), URL,
  });
  const fromParent = (data, event = {}) => outerHandlers.message({ source: parent, origin, data, ...event });
  const render = (appearance = {}, profile = {}) => fromParent({ type: 'perfilwiki-preview-config', editable, customRangeEditable:rangeEditable, config: { user: 'Editor Exemplo', timeZone: 'UTC', appearance: { showCards: true, showActivity:true, layout:'integrated', metrics, highlightedMetrics: [], initialPeriod: '30d', ...appearance }, ...profile } });
  render();
  const event = (target, x = 10, y = 10) => ({ target, pointerId: 1, button: 0, isPrimary: true, clientX: x, clientY: y, preventDefault() { this.defaultPrevented = true; } });
  return { handlers, cards, root, invitation, profileLink, outsideLink, remoteLink, body, document, messages, event, render, fromParent, rangeControls, statistics: () => renderedStatistics, state:()=>renderedState, presentation: () => renderedPresentation,cardsPresentation:()=>renderedCardsPresentation, headerPresentation:()=>renderedHeaderPresentation, pointAt: card => { underPointer = card; }, moves: () => messages.filter(message => message.type === 'perfilwiki-preview-move') };
}

function beginMove(f) {
  f.handlers.pointerdown(f.event(f.cards[0].handle));
  f.pointAt(f.cards[1]);
  f.handlers.pointermove(f.event(f.cards[0].handle, 100, 20));
  assert.equal(f.cards[1].classList.has('local-preview-drop-target'), true);
}

test('a direct preview drag commits exactly once at the release card', () => {
  const f = fixture();
  beginMove(f);
  f.handlers.pointerup(f.event(f.cards[0].handle, 100, 20));
  f.handlers.lostpointercapture(f.event(f.cards[0].handle));
  assert.equal(f.moves().length, 1);
  assert.equal(f.moves()[0].metric, 'tenure');
  assert.equal(f.moves()[0].targetIndex, 1);
  assert.equal(f.body.classList.has('local-preview-dragging'), false);
  assert.equal(f.cards[1].classList.has('local-preview-drop-target'), false);
});

test('dropping outside all cards clears the target and never changes order', () => {
  const f = fixture();
  beginMove(f);
  f.pointAt(null);
  f.handlers.pointermove(f.event(f.cards[0].handle, 300, 300));
  assert.equal(f.cards[1].classList.has('local-preview-drop-target'), false);
  f.handlers.pointerup(f.event(f.cards[0].handle, 300, 300));
  assert.equal(f.moves().length, 0);
  assert.equal(f.body.classList.has('local-preview-dragging'), false);
});

test('the release location is checked even without a final pointermove event', () => {
  const f = fixture();
  beginMove(f);
  f.pointAt(null);
  f.handlers.pointerup(f.event(f.cards[0].handle, 500, 500));
  assert.equal(f.moves().length, 0);
});

test('pointer cancellation and Escape stop a preview drag without saving its target', () => {
  for (const action of ['pointercancel', 'escape']) {
    const f = fixture();
    beginMove(f);
    if (action === 'escape') f.handlers.keydown({ key: 'Escape' });
    else f.handlers.pointercancel(f.event(f.cards[0].handle));
    f.handlers.pointerup(f.event(f.cards[0].handle, 100, 20));
    assert.equal(f.moves().length, 0);
    assert.equal(f.body.classList.has('local-preview-dragging'), false);
  }
});

test('each card has a direct highlight toggle and no options menu or position selector', () => {
  const f = fixture();
  const card = f.cards[0];
  const star = card.querySelector('.local-card-highlight');
  assert.equal(star.getAttribute('aria-pressed'), 'false');
  assert.equal(star.getAttribute('aria-label'), 'Destacar Anos na Wikipédia');
  assert.equal(star.textContent, '☆');
  assert.equal(card.querySelector('details'), null);
  assert.equal(card.querySelector('select'), null);
  assert.equal(card.querySelector('.local-card-tools').children.length, 3);
  f.handlers.click(f.event(star));
  const highlightMessages = f.messages.filter(message => message.type === 'perfilwiki-preview-highlight');
  assert.equal(highlightMessages.length, 1);
  assert.equal(highlightMessages[0].metric, 'tenure');
  f.render({ highlightedMetrics: ['tenure'] });
  const active = card.querySelector('.local-card-highlight');
  assert.equal(active.getAttribute('aria-pressed'), 'true');
  assert.equal(active.getAttribute('aria-label'), 'Retirar destaque de Anos na Wikipédia');
  assert.equal(active.textContent, '★');
  f.handlers.click(f.event(active));
  assert.equal(f.messages.filter(message => message.type === 'perfilwiki-preview-highlight').length, 2);
  assert.equal(f.statistics().metrics.thanksSent, 128);
});

test('focused drag handles move boxes with arrow keys and explain the keyboard control', () => {
  for (const [key, source, targetIndex] of [['ArrowRight', 0, 1], ['ArrowDown', 0, 1], ['ArrowLeft', 1, 0], ['ArrowUp', 1, 0]]) {
    const f = fixture();
    const handle = f.cards[source].handle;
    assert.match(handle.getAttribute('title'), /use as setas/);
    assert.equal(handle.getAttribute('aria-describedby'), 'pw-preview-move-instructions');
    const event = { ...f.event(handle), key };
    f.handlers.keydown(event);
    assert.equal(event.defaultPrevented, true);
    assert.equal(f.moves().length, 1);
    assert.equal(f.moves()[0].metric, source === 0 ? 'tenure' : 'thanks');
    assert.equal(f.moves()[0].targetIndex, targetIndex);
  }
});

test('keyboard moves keep bounds and leave unrelated or modified key presses alone', () => {
  const f = fixture();
  for (const [key, source] of [['ArrowLeft', 0], ['ArrowUp', 0], ['ArrowRight', 1], ['ArrowDown', 1]]) {
    const event = { ...f.event(f.cards[source].handle), key };
    f.handlers.keydown(event);
    assert.equal(event.defaultPrevented, true);
  }
  assert.equal(f.moves().length, 0);
  for (const modified of [{ altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { defaultPrevented: true }]) {
    f.handlers.keydown({ ...f.event(f.cards[0].handle), key: 'ArrowRight', ...modified });
  }
  const otherControl = { ...f.event(f.cards[0].querySelector('.local-card-highlight')), key: 'ArrowRight' };
  f.handlers.keydown(otherControl);
  assert.notEqual(otherControl.defaultPrevented, true);
  assert.equal(f.moves().length, 0);
});

test('read-only previews expose no card controls and ignore forged highlight or keyboard actions', () => {
  const f = fixture({ editable: false });
  for (const card of f.cards) assert.equal(card.querySelector('.local-card-tools'), null);
  const fake = node('button');
  fake.setAttribute('data-preview-action', 'highlight');
  fake.setAttribute('data-preview-metric', 'tenure');
  f.handlers.click(f.event(fake));
  fake.setAttribute('data-preview-action', 'drag');
  f.handlers.keydown({ ...f.event(fake), key: 'ArrowRight' });
  assert.equal(f.messages.filter(message => message.type === 'perfilwiki-preview-highlight').length, 0);
  assert.equal(f.moves().length, 0);
});

test('all four new local sample metrics reach the actual card renderer with visible values', () => {
  const statistics = fixture().statistics();
  assert.equal(statistics.metrics.averageBytesPerEdit, 63, 'sample average divides by unique public revision IDs');
  assert.equal(statistics.metrics.thanksSent, 128);
  assert.equal(statistics.metrics.largestAddition, 24576);
  assert.equal(statistics.metrics.largestRemoval, 12288);
  const html = Cards.html(statistics, null, { user: 'Editor Exemplo', appearance: { metrics: ['thanksSent', 'averageBytesPerEdit', 'largestAddition', 'largestRemoval'] } });
  assert.doesNotMatch(html, /Aguardando dados/);
  assert.match(html, />128<\/span>/);
  assert.match(html, />63,0 bytes<\/span>/);
  assert.match(html, />24 KiB<\/span>/);
  assert.match(html, />12 KiB<\/span>/);
});


test('one local add tile follows the selected cards and stays before the single cards footer', () => {
  const f = fixture({ metrics: METRICS.slice(0, 7).map(metric => metric.id), footer: true });
  const tile = f.document.getElementById('pw-preview-add-card');
  assert.ok(tile);
  assert.equal(tile.tag, 'button');
  assert.equal(tile.getAttribute('type'), 'button');
  assert.equal(tile.getAttribute('draggable'), 'false');
  assert.equal(tile.getAttribute('aria-label'), 'Adicionar caixa');
  assert.equal(tile.textContent, 'Adicionar caixa +');
  assert.equal(tile.closest('.dan-pu-stat-card'), null);
  assert.equal(tile.getAttribute('data-preview-metric'), null);
  assert.equal(f.root.children.filter(child => child.attrs.id === 'pw-preview-add-card').length, 1);
  assert.equal(f.root.children.indexOf(tile), f.cards.length);
  assert.equal(f.root.children.indexOf(f.invitation), f.cards.length + 1);
  assert.equal(f.root.children.filter(child => child.attrs.id === 'dan-pu-ritmo-install').length, 1);
  f.handlers.click(f.event(tile));
  assert.equal(f.messages.filter(message => message.type === 'perfilwiki-preview-add').length, 1);
  assert.equal(f.moves().length, 0);
});

test('the add tile is absent in read-only, hidden and all-selected previews', () => {
  for (const f of [fixture({ editable: false }), fixture({ metrics: METRICS.map(metric => metric.id) })]) {
    assert.equal(f.document.getElementById('pw-preview-add-card'), null);
  }
  const hidden = fixture();
  hidden.render({ showCards: false });
  assert.equal(hidden.document.getElementById('pw-preview-add-card'), null);
});

test('the add tile cannot be dragged or become an order target', () => {
  const f = fixture();
  const tile = f.document.getElementById('pw-preview-add-card');
  const pointer = f.event(tile);
  f.handlers.pointerdown(pointer);
  assert.notEqual(pointer.defaultPrevented, true);
  assert.equal(f.body.classList.has('local-preview-dragging'), false);
  beginMove(f);
  f.pointAt(tile);
  f.handlers.pointermove(f.event(f.cards[0].handle, 200, 200));
  f.handlers.pointerup(f.event(f.cards[0].handle, 200, 200));
  assert.equal(f.moves().length, 0);
});

test('only the real parent can return focus to the add tile or the last box when it is gone', () => {
  const f = fixture();
  const tile = f.document.getElementById('pw-preview-add-card');
  f.fromParent({ type: 'perfilwiki-preview-focus-add' }, { origin: 'https://example.com' });
  f.fromParent({ type: 'perfilwiki-preview-focus-add' }, { source: {} });
  assert.notEqual(tile.focused, true);
  f.fromParent({ type: 'perfilwiki-preview-focus-add' });
  assert.equal(tile.focused, true);
  assert.equal(tile.focusOptions.preventScroll, true);
  const full = fixture({ metrics: METRICS.map(metric => metric.id) });
  full.fromParent({ type: 'perfilwiki-preview-focus-add' });
  assert.equal(full.cards.at(-1).handle.focused, true);
  const readonly = fixture({ editable: false });
  readonly.fromParent({ type: 'perfilwiki-preview-focus-add' });
  assert.equal(readonly.messages.filter(message => message.type === 'perfilwiki-preview-error').length, 0);
});

test('name alignment reaches the actual renderer without adding a duplicate synthetic heading', () => {
  const f = fixture();
  for (const nameAlignment of ['left', 'center', 'right']) {
    f.render({ nameAlignment });
    assert.equal(f.presentation().appearance.nameAlignment, nameAlignment);
    assert.equal(f.cardsPresentation().appearance.nameAlignment, nameAlignment);
    assert.equal(f.root.style.textAlign, undefined);
  }
  const frame=fs.readFileSync(new URL('../public/local-preview/frame.html',import.meta.url),'utf8');
  assert.doesNotMatch(frame,/local-profile-heading|profile-name|Página de usuário|<h1/);
});

test('local profile fields reach the real activity presentation without entering metrics', () => {
  const f = fixture();
  const profile = { location: 'Washington, DC', customFields: [{ label: 'Pesquisa', value: 'Bibliotecas e arquivos' }] };
  f.render({ nameAlignment: 'right' }, profile);
  assert.equal(f.presentation().location, profile.location);
  assert.deepEqual(f.presentation().customFields, profile.customFields);
  assert.equal(f.presentation().appearance.nameAlignment, 'right');
  assert.equal(f.statistics().location, undefined);
  assert.equal(f.statistics().metrics.customFields, undefined);
});

test('synthetic public group proof follows the preview identity and keeps the higher confirmation group available',()=>{
 const f=fixture();f.render({showUserGroups:true,profilePlacements:{userGroups:'top'}});
 const proof=f.statistics().userGroups;
 assert.deepEqual(JSON.parse(JSON.stringify(proof)),{version:1,user:'Editor Exemplo',project:'pt.wikipedia.org',checkedAt:'2026-10-15T12:00:00Z',groups:['*','autoconfirmed','autoreviewer','extendedconfirmed','rollbacker','user']});
 assert.equal(f.headerPresentation().appearance.showUserGroups,true);
 assert.equal(f.headerPresentation().appearance.profilePlacements.userGroups,'top');
 f.render({showUserGroups:true},{user:'Outro Exemplo'});
 assert.equal(f.statistics().userGroups.user,'Outro Exemplo');
 assert.equal(Object.hasOwn(f.statistics().metrics,'userGroups'),false);
});

test('the optional creation-date preview receives coherent complete account-wide sample proof', () => {
  const f = fixture();
  f.render({ showAccountCreated: true });
  const statistics = f.statistics(), proof = statistics.registrationCoverage;
  assert.equal(f.presentation().appearance.showAccountCreated, true);
  assert.equal(proof.version, 1);
  assert.equal(proof.complete, true);
  assert.equal(proof.user, statistics.user);
  assert.equal(proof.checkedAt, statistics.metricUpdatedAt.earliestRegistration);
  assert.equal(statistics.metrics.earliestRegistration, proof.globalRegistration);
  assert.ok(proof.accounts.length > 0);
  assert.equal(proof.accounts[0].wiki, 'ptwiki');
  assert.equal(proof.accounts[0].url, 'https://pt.wikipedia.org');
  assert.ok(Date.parse(proof.accounts[0].registration) >= Date.parse(statistics.metrics.earliestRegistration));
  assert.ok(Date.parse(proof.checkedAt) >= Date.parse(statistics.metrics.earliestRegistration));
});


test('profile data also reaches the real cards presentation when placement changes',()=>{
  const f=fixture();
  const profile={displayName:'Marina',location:'[[Rio de Janeiro]]',customFields:[{label:'Interesse',value:'[[História|História]]'}]};
  f.render({profilePlacement:'cards',nameAlignment:'center'},profile);
  assert.equal(f.cardsPresentation().displayName,'Marina');
  assert.equal(f.cardsPresentation().location,profile.location);
  assert.deepEqual(f.cardsPresentation().customFields,profile.customFields);
  assert.equal(f.cardsPresentation().appearance.profilePlacement,'cards');
  assert.equal(f.cardsPresentation().appearance.nameAlignment,'center');
});

test('local custom period examples recompute from dates while preserving fixed period data',()=>{
  const f=fixture();
  const first={start:'2026-09-01',end:'2026-09-30'};
  f.render({initialPeriod:'custom',customRange:first});
  const previous=f.state().pageviews.periods.custom;
  assert.equal(previous.period.days,30);
  assert.equal(previous.rows.length,2);
  const next={start:'2026-10-01',end:'2026-10-14'};
  f.render({initialPeriod:'custom',customRange:next});
  const current=f.state().pageviews.periods.custom;
  assert.deepEqual(JSON.parse(JSON.stringify(f.state().pageviews.customRange)),next);
  assert.equal(current.period.days,14);
  assert.equal(current.period.start,next.start);
  assert.notEqual(current.allArticleTotal,previous.allArticleTotal);
  assert.equal(current.allArticleTotal,current.rows.reduce((sum,row)=>sum+row.views,0));
});

test('the preview custom-period apply button reports a range and readonly forms stay disabled',()=>{
  const f=fixture();
  f.rangeControls['dan-pu-custom-start'].value='2026-10-01';
  f.rangeControls['dan-pu-custom-end'].value='2026-10-14';
  f.handlers.click(f.event(f.rangeControls['dan-pu-custom-apply']));
  const messages=f.messages.filter(message=>message.type==='perfilwiki-preview-custom-range');
  assert.equal(messages.length,1);
  assert.equal(messages[0].start,'2026-10-01');assert.equal(messages[0].end,'2026-10-14');
  f.rangeControls['dan-pu-custom-start'].value='2026-10-20';
  f.handlers.click(f.event(f.rangeControls['dan-pu-custom-apply']));
  assert.equal(f.messages.filter(message=>message.type==='perfilwiki-preview-custom-range').length,1);
  const readonly=fixture({rangeEditable:false});
  assert.equal(readonly.rangeControls['dan-pu-custom-apply'].disabled,true);
  readonly.handlers.click(readonly.event(readonly.rangeControls['dan-pu-custom-apply']));
  assert.equal(readonly.messages.filter(message=>message.type==='perfilwiki-preview-custom-range').length,0);
});


test('profile links retain their internal addresses and blue styling while actual handlers prevent navigation',()=>{
  const f=fixture({profileLinks:true});
  assert.equal(f.profileLink.getAttribute('href'),'https://pt.wikipedia.org/wiki/Washington%2C_D.C.');
  assert.equal(f.profileLink.getAttribute('target'),null);
  assert.equal(f.profileLink.classList.has('local-profile-anchor'),true);
  assert.equal(f.profileLink.getAttribute('aria-disabled'),null);
  for(const link of [f.outsideLink,f.remoteLink]) {
    assert.equal(link.getAttribute('href'),null);
    assert.equal(link.getAttribute('aria-disabled'),'true');
  }
  for(const type of ['click','auxclick']) {
    const event=f.event(f.profileLink);f.handlers[type](event);
    assert.equal(event.defaultPrevented,true,type);
  }
});

test('photo and independent placements reach the real renderers with a request-free local placeholder flag',()=>{
  const f=fixture();
  const placements={name:'cards',location:'activity',accountCreated:'both',photo:'cards'};
  const profile={photo:'Example.jpg',customFields:[{label:'Interesse',value:'[[História]]',placement:'hidden'}]};
  f.render({profilePlacements:placements,profileDetailsLayout:'inline'},profile);
  for(const presentation of [f.presentation(),f.cardsPresentation()]) {
    assert.equal(presentation.photo,'Example.jpg');
    assert.equal(presentation.localPhotoPreview,true);
    assert.deepEqual(presentation.appearance.profilePlacements,placements);
    assert.equal(presentation.appearance.profileDetailsLayout,'inline');
    assert.equal(presentation.customFields[0].placement,'hidden');
  }
  assert.equal(f.statistics().photo,undefined);
});


test('the actual top-header preview receives grouped links, configured zone and request-free photo presentation',()=>{
 const f=fixture();
 const profile={photo:'Example.jpg',customFields:[{label:'Alma mater',values:['[[Universidade George Washington|GWU]]','[[Instituto de Tecnologia de Massachusetts|MIT]]'],layout:'lines',separator:'pipe',placement:'top'}]};
 f.render({showLocalTime:true,nameFontSize:32,profilePlacements:{name:'top',localTime:'top',photo:'top'}},profile);
 const presentation=f.headerPresentation();
 assert.equal(presentation.timeZone,'UTC');assert.equal(presentation.localPhotoPreview,true);
 assert.equal(presentation.photo,'Example.jpg');assert.deepEqual(presentation.customFields,profile.customFields);
 assert.equal(presentation.appearance.nameFontSize,32);assert.equal(presentation.appearance.showLocalTime,true);
 assert.equal(f.cardsPresentation().timeZone,'UTC');assert.equal(f.presentation().timeZone,'UTC');
});

test('cover and top background reach only the top preview with an explicit request-free placeholder',()=>{
 const f=fixture();
 f.render({topBackground:'#dfe8f5'},{coverImage:'Panorama example.jpg'});
 assert.equal(f.headerPresentation().coverImage,'Panorama example.jpg');
 assert.equal(f.headerPresentation().localCoverPreview,true);
 assert.equal(f.headerPresentation().appearance.topBackground,'#dfe8f5');
 assert.equal(f.cardsPresentation().coverImage,undefined);assert.equal(f.presentation().coverImage,undefined);
 assert.equal(f.statistics().coverImage,undefined);assert.equal(f.state().config.coverImage,undefined);
});
