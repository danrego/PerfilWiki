import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import I18n from '../../src/I18n.js';

const script = fs.readFileSync(new URL('../public/local-preview/frame.js', import.meta.url), 'utf8');

function fixture(hash = '') {
  const callbacks = {};
  const outerCallbacks = {};
  const notified = [];
  const historyCalls = [];
  const keys = ['30d', '90d', '12m', 'since'];
  const panes = Object.fromEntries(keys.map(key => [key, { style: {} }]));
  const links = keys.map(key => ({
    attrs: { href: '#dan-pu-view-' + key }, style: {},
    getAttribute(name) { return this.attrs[name]; },
    setAttribute(name, value) { this.attrs[name] = value; },
  }));
  const dashboard = { querySelectorAll: selector => selector === '.dan-pu-period-tabs a' ? links : [] };
  const document = {
    documentElement:{lang:'pt-BR'},
    getElementById: id => id === 'dashboard' ? dashboard : panes[id.replace('dan-pu-period-', '')],
    createElement: () => ({}),
    head: { appendChild() {} },
    body: { getBoundingClientRect: () => ({ height: 300 }) },
    addEventListener: (type, callback) => { callbacks[type] = callback; },
  };
  vm.runInNewContext(script, {
    window:{PerfilWikiI18n:I18n},
    document,
    location: { origin: 'http://127.0.0.1:8788', pathname: '/local-preview/frame.html', search: '?test=1', hash, replace: () => assert.fail('Preview period selection must not navigate a fragment') },
    history: { replaceState: (...args) => historyCalls.push(args) },
    parent: { postMessage: (...args) => notified.push(args) },
    addEventListener: (type, callback) => { outerCallbacks[type] = callback; },
    requestAnimationFrame: callback => callback(),
    scrollTo: () => assert.fail('Preview editing must not scroll the frame or outer page'),
  });
  return { callbacks, outerCallbacks, panes, links, notified, historyCalls };
}

test('local preview tabs change visible panes and selection without fragment navigation or scroll', () => {
  const f = fixture();
  for (const selected of ['since', '90d', '12m', '30d']) {
    const link = f.links.find(item => item.attrs.href === '#dan-pu-view-' + selected);
    let prevented = false;
    f.callbacks.click({ target: { closest: selector => selector === 'a' ? link : null }, preventDefault: () => { prevented = true; } });
    assert.equal(prevented, true);
    for (const [key, pane] of Object.entries(f.panes)) assert.equal(pane.style.display, key === selected ? 'block' : 'none');
    for (const tab of f.links) assert.equal(tab.attrs['aria-current'], tab === link ? 'true' : 'false');
    assert.equal(link.style.fontWeight, '600');
    assert.equal(f.notified.findLast(([message]) => message.type === 'perfilwiki-preview-period')[0].period, selected);
  }
  assert.equal(f.historyCalls.length, 0);
  assert.equal(f.outerCallbacks.hashchange, undefined);
});

test('an old open preview fragment is cleared with replaceState before rendering', () => {
  const f = fixture('#dan-pu-view-30d');
  assert.deepEqual(f.historyCalls, [[null, '', '/local-preview/frame.html?test=1']]);
  assert.equal(f.outerCallbacks.hashchange, undefined);
});
