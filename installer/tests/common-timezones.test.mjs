import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMON_TIME_ZONES, isSupportedTimeZone, listCommonTimeZones, groupTimeZones,
} from '../src/timezones.mjs';

const winter = new Date('2026-01-15T12:00:00Z');
const summer = new Date('2026-07-15T12:00:00Z');
const usual = [
  'UTC',
  'America/Sao_Paulo', 'America/Manaus', 'America/Campo_Grande', 'America/Rio_Branco', 'America/Noronha',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'America/Phoenix', 'America/Toronto', 'America/Mexico_City',
  'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Argentina/Buenos_Aires',
  'Europe/Lisbon', 'Europe/London', 'Europe/Paris', 'Europe/Madrid', 'Europe/Berlin',
  'Europe/Rome', 'Europe/Zurich', 'Europe/Stockholm', 'Europe/Athens', 'Europe/Istanbul', 'Europe/Moscow',
  'Atlantic/Azores',
  'Africa/Luanda', 'Africa/Maputo', 'Africa/Bissau', 'Africa/Sao_Tome', 'Atlantic/Cape_Verde',
  'Africa/Cairo', 'Africa/Casablanca', 'Africa/Nairobi', 'Africa/Johannesburg',
  'Asia/Tokyo', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Macau',
  'Asia/Singapore', 'Asia/Dili', 'Asia/Seoul', 'Asia/Bangkok', 'Asia/Dubai', 'Asia/Jakarta',
  'Australia/Sydney', 'Australia/Perth', 'Australia/Adelaide', 'Pacific/Auckland', 'Pacific/Honolulu',
];

test('the installer shortlist has 55 supported worldwide choices and clear city/offset labels', () => {
  assert.equal(COMMON_TIME_ZONES.length, 55);
  assert.ok(Object.isFrozen(COMMON_TIME_ZONES));
  assert.deepEqual(COMMON_TIME_ZONES, usual);
  const options = listCommonTimeZones({ browserTimeZone: 'UTC', date: winter });
  assert.equal(options.length, 55);
  assert.deepEqual(new Set(options.map(({ value }) => value)), new Set(usual));
  assert.equal(options[0].value, 'UTC');
  for (const option of options) {
    assert.equal(isSupportedTimeZone(option.value), true, option.value);
    assert.equal(option.label, option.city + ' · ' + option.offset);
    if (option.value !== 'UTC') assert.ok(!option.label.includes(option.value), option.label);
  }
  assert.equal(options.find(({ value }) => value === 'America/Sao_Paulo').label, 'Brasília / São Paulo · UTC-03:00');
  assert.equal(options.find(({ value }) => value === 'America/Noronha').label, 'Fernando de Noronha · UTC-02:00');
  assert.equal(options.find(({ value }) => value === 'America/New_York').label, 'Washington / Nova York · UTC-05:00');
  const groups = groupTimeZones(options);
  assert.equal(groups[0].id, 'UTC');
  assert.equal(groups.reduce((count, group) => count + group.options.length, 0), 55);
});

test('the grouped shortlist covers Hawaii, wider Europe and Asia without becoming a full catalog', () => {
  const options = listCommonTimeZones({ browserTimeZone: 'UTC', date: winter });
  const groups = groupTimeZones(options);
  assert.deepEqual(groups.map(({ id }) => id), ['UTC', 'Africa', 'America', 'Asia', 'Atlantic', 'Australia', 'Europe', 'Pacific']);
  const counts = Object.fromEntries(groups.map(({ id, options: entries }) => [id, entries.length]));
  assert.deepEqual(counts, { UTC: 1, Africa: 8, America: 17, Asia: 11, Atlantic: 2, Australia: 3, Europe: 11, Pacific: 2 });
  for (const zone of ['Pacific/Honolulu', 'America/Anchorage', 'America/Phoenix', 'Europe/Madrid',
    'Europe/Berlin', 'Europe/Rome', 'Europe/Stockholm', 'Europe/Athens', 'Asia/Kolkata',
    'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Macau', 'Asia/Singapore', 'Asia/Dili',
    'Asia/Seoul', 'Asia/Bangkok', 'Asia/Dubai', 'Africa/Nairobi', 'Pacific/Auckland']) {
    assert.ok(options.some(({ value }) => value === zone), zone);
  }
  assert.equal(options.find(({ value }) => value === 'Pacific/Honolulu').label, 'Havaí / Honolulu, EUA · UTC-10:00');
  assert.equal(options.find(({ value }) => value === 'Asia/Kolkata').label, 'Nova Délhi / Calcutá, Índia · UTC+05:30');
  assert.equal(options.find(({ value }) => value === 'Asia/Dili').label, 'Díli, Timor-Leste · UTC+09:00');
});

test('building the short list never enumerates the complete catalog', () => {
  let enumerationCalls = 0;
  const intl = {
    DateTimeFormat: Intl.DateTimeFormat,
    supportedValuesOf() { enumerationCalls += 1; throw new Error('The full catalog must stay unused.'); },
  };
  assert.equal(listCommonTimeZones({ intl, browserTimeZone: 'UTC', date: winter }).length, 55);
  assert.equal(enumerationCalls, 0);
});

test('a valid unlisted selected identifier is kept exactly once without adding a different browser zone', () => {
  const options = listCommonTimeZones({ selectedTimeZone: 'US/Eastern', browserTimeZone: 'Asia/Kathmandu', date: winter });
  assert.equal(options.length, 56);
  assert.equal(options.filter(({ value }) => value === 'US/Eastern').length, 1);
  assert.ok(options.find(({ value }) => value === 'US/Eastern').label.includes('US/Eastern'));
  assert.ok(!options.some(({ value }) => value === 'Asia/Kathmandu'));
  assert.equal(listCommonTimeZones({ selectedTimeZone: 'UTC', browserTimeZone: 'Asia/Kathmandu', date: winter }).length, 55);
});

test('an unlisted browser zone is retained when no valid selection exists and invalid identifiers stay absent', () => {
  for (const selectedTimeZone of [undefined, '', 'Mars/Crater', ' UTC ']) {
    const options = listCommonTimeZones({ selectedTimeZone, browserTimeZone: 'Asia/Kathmandu', date: winter });
    assert.equal(options.length, 56);
    assert.equal(options.filter(({ value }) => value === 'Asia/Kathmandu').length, 1);
    assert.equal(options.find(({ value }) => value === 'Asia/Kathmandu').offset, 'UTC+05:45');
    assert.ok(!options.some(({ value }) => value === 'Mars/Crater' || value === ' UTC '));
  }
  assert.equal(listCommonTimeZones({ selectedTimeZone: 'Mars/Crater', browserTimeZone: ' UTC ', date: winter }).length, 55);
});

test('the browser default is detected only when a valid selected zone is not supplied', () => {
  let detections = 0;
  function BrowserDateTimeFormat(locale, options) {
    if (!locale && !options) {
      detections += 1;
      return { resolvedOptions: () => ({ timeZone: 'Asia/Kathmandu' }) };
    }
    return new Intl.DateTimeFormat(locale, options);
  }
  const intl = { DateTimeFormat: BrowserDateTimeFormat };
  assert.equal(listCommonTimeZones({ selectedTimeZone: 'UTC', date: winter, intl }).length, 55);
  assert.equal(detections, 0);
  assert.equal(listCommonTimeZones({ date: winter, intl }).length, 56);
  assert.equal(detections, 1);
});

test('short-list offsets follow seasonal changes and retained partial-hour zones', () => {
  for (const [date, zone, expected] of [
    [winter, 'America/New_York', 'UTC-05:00'],
    [summer, 'America/New_York', 'UTC-04:00'],
    [winter, 'Europe/Lisbon', 'UTC+00:00'],
    [summer, 'Europe/Lisbon', 'UTC+01:00'],
    [winter, 'Australia/Sydney', 'UTC+11:00'],
    [summer, 'Australia/Sydney', 'UTC+10:00'],
    [winter, 'America/Anchorage', 'UTC-09:00'],
    [summer, 'America/Anchorage', 'UTC-08:00'],
    [winter, 'America/Phoenix', 'UTC-07:00'],
    [summer, 'America/Phoenix', 'UTC-07:00'],
    [winter, 'Pacific/Honolulu', 'UTC-10:00'],
    [summer, 'Pacific/Honolulu', 'UTC-10:00'],
    [winter, 'Europe/Berlin', 'UTC+01:00'],
    [summer, 'Europe/Berlin', 'UTC+02:00'],
    [winter, 'Europe/Athens', 'UTC+02:00'],
    [summer, 'Europe/Athens', 'UTC+03:00'],
    [winter, 'Asia/Kolkata', 'UTC+05:30'],
    [summer, 'Asia/Kolkata', 'UTC+05:30'],
    [winter, 'Australia/Adelaide', 'UTC+10:30'],
    [summer, 'Australia/Adelaide', 'UTC+09:30'],
    [winter, 'Pacific/Auckland', 'UTC+13:00'],
    [summer, 'Pacific/Auckland', 'UTC+12:00'],
    [winter, 'America/St_Johns', 'UTC-03:30'],
    [summer, 'America/St_Johns', 'UTC-02:30'],
    [winter, 'Australia/Lord_Howe', 'UTC+11:00'],
    [summer, 'Australia/Lord_Howe', 'UTC+10:30'],
    [winter, 'Asia/Kathmandu', 'UTC+05:45'],
  ]) {
    const option = listCommonTimeZones({ selectedTimeZone: zone, date }).find(({ value }) => value === zone);
    assert.equal(option.offset, expected, zone);
    assert.ok(option.label.includes(expected), zone);
  }
});

test('a browser can omit unsupported usual choices without breaking selection and dates remain validated', () => {
  function OlderDateTimeFormat(locale, options) {
    if (options?.timeZone === 'Africa/Maputo') throw new RangeError('Unavailable zone');
    return new Intl.DateTimeFormat(locale, options);
  }
  const options = listCommonTimeZones({ intl: { DateTimeFormat: OlderDateTimeFormat }, browserTimeZone: 'UTC', date: winter });
  assert.equal(options.length, 54);
  assert.ok(!options.some(({ value }) => value === 'Africa/Maputo'));
  assert.throws(() => listCommonTimeZones({ date: new Date('invalid') }), TypeError);
});
