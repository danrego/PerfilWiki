import { METRICS } from './model.mjs';

const IDS = new Set(METRICS.map(metric => metric.id));

export function validPreviewRange(range, now = Date.now()) {
  if (!range || typeof range !== 'object' || Array.isArray(range) || Object.keys(range).some(key => key !== 'start' && key !== 'end')) return false;
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!date(range.start) || !date(range.end)) return false;
  const clock = new Date(now);
  if (!Number.isFinite(clock.getTime())) return false;
  const yesterday = new Date(Date.UTC(clock.getUTCFullYear(), clock.getUTCMonth(), clock.getUTCDate()) - 86400000).toISOString().slice(0, 10);
  return range.start >= '2015-07-01' && range.start <= range.end && range.end <= yesterday;
}

export function previewRangeAction(event, expectedOrigin, expectedSource, config, now = Date.now()) {
  if (!event || !expectedSource || event.origin !== expectedOrigin || event.source !== expectedSource || config?.appearance?.showActivity !== true) return null;
  const data = event.data;
  const range = data && { start: data.start, end: data.end };
  if (!data || data.type !== 'perfilwiki-preview-custom-range' || !validPreviewRange(range, now)) return null;
  return range;
}

/** Accept editor messages only from this instance's isolated preview frame. */
export function previewAction(event, expectedOrigin, expectedSource, config) {
  if (!event || !expectedSource || event.origin !== expectedOrigin || event.source !== expectedSource) return null;
  const message = event.data;
  const settings = config?.appearance;
  if (!message || typeof message !== 'object' || Array.isArray(message) || !settings?.showCards || !Array.isArray(settings.metrics)) return null;
  const selected = settings.metrics;
  if (!selected.length || new Set(selected).size !== selected.length || selected.some(id => !IDS.has(id))) return null;
  if (message.type === 'perfilwiki-preview-add') return selected.length < IDS.size ? { kind: 'add' } : null;
  const id = message.metric;
  if (typeof id !== 'string' || !IDS.has(id) || !selected.includes(id)) return null;
  if (message.type === 'perfilwiki-preview-move') {
    if (!Number.isInteger(message.targetIndex) || message.targetIndex < 0 || message.targetIndex >= selected.length || selected.indexOf(id) === message.targetIndex) return null;
    return { kind: 'move', id, targetIndex: message.targetIndex };
  }
  if (message.type === 'perfilwiki-preview-toggle' && selected.length > 1) return { kind: 'toggle', id };
  if (message.type === 'perfilwiki-preview-highlight') return { kind: 'highlight', id };
  return null;
}
