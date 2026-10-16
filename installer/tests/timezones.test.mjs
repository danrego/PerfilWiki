import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_TIME_ZONES, TIME_ZONE_REGIONS, isSupportedTimeZone, listTimeZones,
  timeZoneLabel, timeZoneOffsetMinutes, formatUtcOffset, filterTimeZones, groupTimeZones,
} from '../src/timezones.mjs';

const winter = new Date('2026-01-15T12:00:00Z');
const summer = new Date('2026-07-15T12:00:00Z');
const noEnumeration = { DateTimeFormat: Intl.DateTimeFormat };

test('the standard selector has the complete native list and explicit UTC without duplicates', () => {
  const native = Intl.supportedValuesOf('timeZone');
  const options = listTimeZones({ date: winter, browserTimeZone: 'UTC' });
  assert.deepEqual(new Set(options.map(({ value }) => value)), new Set([...native, 'UTC']));
  assert.equal(new Set(options.map(({ value }) => value)).size, options.length);
  assert.equal(options[0].value, 'UTC');
  for (const option of options) {
    assert.equal(isSupportedTimeZone(option.value), true, option.value);
    assert.equal(TIME_ZONE_REGIONS[option.region], option.regionLabel);
    assert.ok(option.label.includes(option.offset));
    assert.ok(option.label.includes(option.value));
  }
});

test('the bundled offline list is unabridged and fallback produces the same supported set', () => {
  // A timezone-data refresh must deliberately refresh this generated fixture.
  assert.equal(FALLBACK_TIME_ZONES.length, 418);
  assert.ok(Object.isFrozen(FALLBACK_TIME_ZONES));
  assert.equal(new Set(FALLBACK_TIME_ZONES).size, FALLBACK_TIME_ZONES.length);
  assert.ok(FALLBACK_TIME_ZONES.includes('America/Coyhaique'));
  assert.ok(FALLBACK_TIME_ZONES.includes('Pacific/Chatham'));
  const options = listTimeZones({ intl: noEnumeration, date: winter, browserTimeZone: 'UTC' });
  const expected = FALLBACK_TIME_ZONES.filter((zone) => isSupportedTimeZone(zone));
  assert.deepEqual(new Set(options.map(({ value }) => value)), new Set(['UTC', ...expected]));
});

test('fallback rejects a zone unsupported by an older browser and accepts valid selected aliases', () => {
  function OlderDateTimeFormat(locale, options) {
    if (options?.timeZone === 'America/Coyhaique') throw new RangeError('Unknown timezone in this browser');
    return new Intl.DateTimeFormat(locale, options);
  }
  const intl = { DateTimeFormat: OlderDateTimeFormat };
  const options = listTimeZones({ intl, date: winter, selectedTimeZone: 'US/Eastern', browserTimeZone: 'Asia/Kathmandu' });
  assert.ok(!options.some(({ value }) => value === 'America/Coyhaique'));
  assert.ok(options.some(({ value }) => value === 'US/Eastern'));
  assert.ok(options.some(({ value }) => value === 'Asia/Kathmandu'));
  const clean = listTimeZones({ intl, date: winter, selectedTimeZone: 'Mars/Crater', browserTimeZone: ' UTC ' });
  assert.ok(!clean.some(({ value }) => value === 'Mars/Crater' || value === ' UTC '));
});

test('valid browser and selected aliases retain their exact identifiers outside the native enumeration', () => {
  const options = listTimeZones({ date: winter, selectedTimeZone: 'US/Eastern', browserTimeZone: 'Asia/Kathmandu' });
  assert.equal(options.filter(({ value }) => value === 'US/Eastern').length, 1);
  assert.equal(options.filter(({ value }) => value === 'Asia/Kathmandu').length, 1);
  assert.equal(options.find(({ value }) => value === 'US/Eastern').regionLabel, 'Outros');
  assert.equal(options.find(({ value }) => value === 'Asia/Kathmandu').offset, 'UTC+05:45');
});

test('positive and negative partial-hour zones have correct current offsets', () => {
  for (const [zone, minutes, text] of [
    ['UTC', 0, 'UTC+00:00'],
    ['Asia/Kathmandu', 345, 'UTC+05:45'],
    ['Asia/Kolkata', 330, 'UTC+05:30'],
    ['America/St_Johns', -210, 'UTC-03:30'],
    ['Pacific/Marquesas', -570, 'UTC-09:30'],
    ['Australia/Eucla', 525, 'UTC+08:45'],
  ]) {
    assert.equal(timeZoneOffsetMinutes(zone, { date: winter }), minutes, zone);
    assert.equal(formatUtcOffset(minutes), text, zone);
    assert.ok(timeZoneLabel(zone, { date: winter }).includes(text), zone);
  }
});

test('seasonal offsets are evaluated at the supplied instant, not a fixed UTC label', () => {
  assert.equal(timeZoneOffsetMinutes('America/New_York', { date: winter }), -300);
  assert.equal(timeZoneOffsetMinutes('America/New_York', { date: summer }), -240);
  assert.equal(timeZoneOffsetMinutes('Europe/Lisbon', { date: winter }), 0);
  assert.equal(timeZoneOffsetMinutes('Europe/Lisbon', { date: summer }), 60);
  assert.equal(timeZoneOffsetMinutes('Australia/Lord_Howe', { date: winter }), 660);
  assert.equal(timeZoneOffsetMinutes('Australia/Lord_Howe', { date: summer }), 630);
});

test('Intl implementations without longOffset use date parts across day/year boundaries', () => {
  function LegacyDateTimeFormat(locale, options) {
    if (options?.timeZoneName === 'longOffset') throw new RangeError('Unsupported timeZoneName');
    return new Intl.DateTimeFormat(locale, options);
  }
  const intl = { DateTimeFormat: LegacyDateTimeFormat };
  for (const [zone, date, expected] of [
    ['Pacific/Kiritimati', new Date('2026-12-31T18:30:15.100Z'), 840],
    ['America/St_Johns', winter, -210],
    ['Asia/Kathmandu', winter, 345],
    ['America/New_York', summer, -240],
    ['UTC', new Date('2026-01-01T00:00:00Z'), 0],
  ]) assert.equal(timeZoneOffsetMinutes(zone, { date, intl }), expected, zone);
});

test('Portuguese group labels are stable and all options remain accounted for', () => {
  const options = listTimeZones({ date: winter, browserTimeZone: 'UTC' });
  const groups = groupTimeZones(options);
  assert.equal(groups[0].id, 'UTC');
  assert.equal(groups.reduce((count, group) => count + group.options.length, 0), options.length);
  assert.ok(groups.some(({ label }) => label === 'África'));
  assert.ok(groups.some(({ label }) => label === 'Américas'));
  assert.ok(groups.some(({ label }) => label === 'Oceano Índico'));
  assert.deepEqual(groups, groupTimeZones(options));
  for (const group of groups) assert.ok(group.options.every(({ region }) => region === group.id));
});

test('search accepts accents, city names, IANA identifiers, regions and UTC offsets', () => {
  const options = listTimeZones({ date: winter, browserTimeZone: 'UTC' });
  for (const query of ['São Paulo', 'sao paulo', 'SÃO_PAULO', 'America/Sao_Paulo', 'Américas paulo', 'Brasília']) {
    assert.deepEqual(filterTimeZones(options, query).map(({ value }) => value), ['America/Sao_Paulo'], query);
  }
  assert.deepEqual(filterTimeZones(options, 'Washington').map(({ value }) => value), ['America/New_York']);
  assert.ok(filterTimeZones(options, 'lisboa').some(({ value }) => value === 'Europe/Lisbon'));
  assert.ok(filterTimeZones(options, 'UTC+05:45').some(({ value }) => value === 'Asia/Katmandu'));
  assert.deepEqual(filterTimeZones(options, 'GMT-03:30').map(({ value }) => value), ['America/St_Johns']);
  assert.ok(groupTimeZones(options, 'europa').every(({ id }) => id === 'Europe'));
  assert.deepEqual(groupTimeZones(options, 'cidade que não existe'), []);
  assert.deepEqual(filterTimeZones(options, ''), options);
  assert.notEqual(filterTimeZones(options, ''), options);
});

test('invalid inputs cannot create malformed UTC labels', () => {
  for (const zone of [null, '', ' UTC ', 'Mars/Crater']) {
    assert.equal(isSupportedTimeZone(zone), false);
    assert.throws(() => timeZoneLabel(zone, { date: winter }), TypeError);
  }
  assert.throws(() => listTimeZones({ date: new Date('invalid') }), TypeError);
  assert.throws(() => formatUtcOffset(NaN), TypeError);
});
