import test from 'node:test';
import assert from 'node:assert/strict';
import { previewAction } from '../src/preview-actions.mjs';
import { createInitialConfig, METRICS } from '../src/model.mjs';

const origin = 'http://127.0.0.1:8788';
const source = {};
const config = () => createInitialConfig({});
const message = data => ({ origin, source, data });
const receive = (data, state = config()) => previewAction(message(data), origin, source, state);

test('preview edits accept only this preview window and exact local origin', () => {
  const data = { type: 'perfilwiki-preview-move', metric: 'tenure', targetIndex: 3 };
  assert.deepEqual(receive(data), { kind: 'move', id: 'tenure', targetIndex: 3 });
  assert.equal(previewAction({ origin: 'https://pt.wikipedia.org', source, data }, origin, source, config()), null);
  assert.equal(previewAction({ origin, source: {}, data }, origin, source, config()), null);
  assert.equal(previewAction(message(data), origin, null, config()), null);
});

test('preview moves reject foreign boxes and invalid or unchanged positions', () => {
  for (const targetIndex of [-1, 8, 0, 1.5, NaN, Infinity, '2', null, undefined]) {
    assert.equal(receive({ type: 'perfilwiki-preview-move', metric: 'tenure', targetIndex }), null);
  }
  for (const metric of ['bytesAdded', '__proto__', '<script>', '', null, {}, undefined]) {
    assert.equal(receive({ type: 'perfilwiki-preview-move', metric, targetIndex: 1 }), null);
  }
  const all = config();
  all.appearance.metrics = METRICS.map(metric => metric.id);
  assert.deepEqual(receive({ type: 'perfilwiki-preview-move', metric: all.appearance.metrics[0], targetIndex: METRICS.length - 1 }, all), { kind: 'move', id: all.appearance.metrics[0], targetIndex: METRICS.length - 1 });
});

test('removal keeps at least one selected box and highlighting targets a visible box', () => {
  assert.deepEqual(receive({ type: 'perfilwiki-preview-toggle', metric: 'tenure' }), { kind: 'toggle', id: 'tenure' });
  assert.deepEqual(receive({ type: 'perfilwiki-preview-highlight', metric: 'tenure' }), { kind: 'highlight', id: 'tenure' });
  assert.equal(receive({ type: 'perfilwiki-preview-toggle', metric: 'bytesAdded' }), null);
  assert.equal(receive({ type: 'perfilwiki-preview-highlight', metric: 'bytesAdded' }), null);
  const one = config();
  one.appearance.metrics = ['tenure'];
  assert.equal(receive({ type: 'perfilwiki-preview-toggle', metric: 'tenure' }, one), null);
  assert.deepEqual(receive({ type: 'perfilwiki-preview-highlight', metric: 'tenure' }, one), { kind: 'highlight', id: 'tenure' });
});

test('hidden boxes and malformed editor data cannot change the config', () => {
  const hidden = config();
  hidden.appearance.showCards = false;
  assert.equal(receive({ type: 'perfilwiki-preview-highlight', metric: 'tenure' }, hidden), null);
  for (const data of [null, 4, 'move', [], {}, { type: 'unknown', metric: 'tenure' }]) assert.equal(receive(data), null);
  for (const metrics of [null, [], ['tenure', 'tenure'], ['tenure', 'foreign']]) {
    const broken = config();
    broken.appearance.metrics = metrics;
    assert.equal(receive({ type: 'perfilwiki-preview-highlight', metric: 'tenure' }, broken), null);
  }
});

test('only a valid same-frame preview with an available box can open the add chooser', () => {
  const data = { type: 'perfilwiki-preview-add' };
  assert.deepEqual(receive(data), { kind: 'add' });
  assert.equal(previewAction({ origin: 'https://example.com', source, data }, origin, source, config()), null);
  assert.equal(previewAction({ origin, source: {}, data }, origin, source, config()), null);
  const full = config();
  full.appearance.metrics = METRICS.map(metric => metric.id);
  assert.equal(receive(data, full), null);
  const hidden = config();
  hidden.appearance.showCards = false;
  assert.equal(receive(data, hidden), null);
  for (const metrics of [[], ['tenure', 'tenure'], ['tenure', 'foreign']]) {
    const malformed = config();
    malformed.appearance.metrics = metrics;
    assert.equal(receive(data, malformed), null);
  }
});

test('custom range messages require the same preview source, visible activity and complete UTC dates', async () => {
  const { validPreviewRange, previewRangeAction } = await import('../src/preview-actions.mjs');
  const now = '2026-10-15T12:00:00Z';
  const range = {start:'2026-10-01',end:'2026-10-14'};
  assert.equal(validPreviewRange(range,now),true);
  assert.equal(validPreviewRange({start:'2024-02-29',end:'2024-03-01'},now),true);
  for (const invalid of [{start:'2015-06-30',end:'2026-10-14'},{start:'2026-10-15',end:'2026-10-15'},{start:'2026-10-14',end:'2026-10-01'},{start:'2026-02-30',end:'2026-03-01'},{start:' 2026-10-01',end:'2026-10-14'},{...range,extra:1},null]) assert.equal(validPreviewRange(invalid,now),false);
  const data = {type:'perfilwiki-preview-custom-range',...range};
  assert.deepEqual(previewRangeAction(message(data),origin,source,config(),now),range);
  assert.equal(previewRangeAction({origin:'https://example.com',source,data},origin,source,config(),now),null);
  assert.equal(previewRangeAction({origin,source:{},data},origin,source,config(),now),null);
  const hidden=config();hidden.appearance.showActivity=false;
  assert.equal(previewRangeAction(message(data),origin,source,hidden,now),null);
  assert.equal(previewRangeAction(message({...data,end:'2026-10-15'}),origin,source,config(),now),null);
});
