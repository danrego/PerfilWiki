import test from 'node:test';
import assert from 'node:assert/strict';
import I18n from '../../src/I18n.js';
import {COMMON_TIME_ZONES,listCommonTimeZones,listTimeZones,groupTimeZones} from '../src/timezones.mjs';
const DATE=new Date('2026-10-15T12:00:00.000Z');
const list=(language,extra={})=>listCommonTimeZones({language,date:DATE,selectedTimeZone:'UTC',...extra});

test('all six interface languages translate common authored city/group labels without changing IANA values or offsets',()=>{
  const baseline=new Map(list('pt-BR').map(option=>[option.value,option]));
  assert.equal(baseline.size,55);
  for(const language of I18n.languages) {
    const options=list(language);
    assert.deepEqual(options.map(option=>option.value).sort(),[...baseline.keys()].sort());
    assert.equal(options[0].value,'UTC');
    for(const option of options) {
      const original=baseline.get(option.value);
      assert.equal(option.city,I18n.t(language,original.city),language+' '+option.value);
      assert.equal(option.regionLabel,I18n.t(language,original.regionLabel),language+' '+option.region);
      assert.equal(option.offsetMinutes,original.offsetMinutes);
      assert.equal(option.offset,original.offset);
      assert.equal(option.label,option.city+' · '+original.offset);
      assert.equal(Object.hasOwn(I18n.catalogs[language],original.city),true,language+' '+original.city);
    }
    const groups=groupTimeZones(options);
    assert.equal(groups.length,8);
    assert.equal(groups.reduce((total,group)=>total+group.options.length,0),COMMON_TIME_ZONES.length);
  }
});

test('English Spanish French and Italian show translated geography in the actual common options',()=>{
  const cases=[
    ['en','America/New_York','Washington / New York','Americas'],
    ['en','Europe/London','London, United Kingdom','Europe'],
    ['es','America/Mexico_City','Ciudad de México, México','América'],
    ['es','Asia/Tokyo','Tokio, Japón','Asia'],
    ['fr','Europe/Lisbon','Lisbonne, Portugal','Europe'],
    ['fr','Pacific/Honolulu','Hawaï / Honolulu, États-Unis','Pacifique'],
    ['it','Europe/Zurich','Zurigo, Svizzera','Europa'],
    ['it','Asia/Seoul','Seul, Corea del Sud','Asia'],
  ];
  for(const [language,value,city,regionLabel]of cases) {
    const option=list(language).find(option=>option.value===value);
    assert.equal(option.city,city);assert.equal(option.regionLabel,regionLabel);
    assert.ok(option.label.startsWith(city+' · UTC'));
  }
});

test('localized sorting follows the chosen language while keeping UTC first and default Portuguese output identical',()=>{
  assert.deepEqual(listCommonTimeZones({date:DATE,selectedTimeZone:'UTC'}),list('pt-BR'));
  assert.deepEqual(list('not-a-language'),list('pt-BR'));
  for(const language of I18n.languages) {
    const options=list(language),collator=new Intl.Collator(language,{sensitivity:'base',numeric:true});
    for(let index=2;index<options.length;index++) {
      const before=options[index-1],after=options[index];
      assert.ok(collator.compare(before.regionLabel,after.regionLabel)<0||before.region===after.region&&collator.compare(before.city,after.city)<=0,language+' sorted labels');
    }
  }
});

test('retained aliases and seasonal fractional offsets remain exact in every language',()=>{
  for(const language of I18n.languages) {
    const winter=list(language,{date:new Date('2026-01-15T12:00:00.000Z'),selectedTimeZone:'Asia/Kathmandu'});
    const summer=list(language,{date:new Date('2026-07-15T12:00:00.000Z'),selectedTimeZone:'Asia/Kathmandu'});
    const get=(options,value)=>options.find(option=>option.value===value);
    assert.equal(winter.filter(option=>option.value==='Asia/Kathmandu').length,1);
    assert.equal(get(winter,'Asia/Kathmandu').offset,'UTC+05:45');
    assert.ok(get(winter,'Asia/Kathmandu').label.endsWith(' · Asia/Kathmandu'));
    assert.equal(get(winter,'Asia/Kolkata').offset,'UTC+05:30');
    assert.equal(get(winter,'Pacific/Honolulu').offset,'UTC-10:00');
    assert.equal(get(summer,'Pacific/Honolulu').offset,'UTC-10:00');
    assert.equal(get(winter,'America/New_York').offset,'UTC-05:00');
    assert.equal(get(summer,'America/New_York').offset,'UTC-04:00');
  }
  // Only the authored common shortlist is localized. The full IANA catalog and
  // its fallback enumeration contract retain their existing behavior.
  const baseline=listTimeZones({date:DATE,selectedTimeZone:'UTC',browserTimeZone:'UTC'});
  assert.deepEqual(listTimeZones({language:'en',date:DATE,selectedTimeZone:'UTC',browserTimeZone:'UTC'}),baseline);
});
