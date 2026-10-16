'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Appearance=require('../src/Appearance.js');
test('custom date ranges preserve inclusive UTC dates and isolate their input object',()=>{
 const source={start:'2024-02-01',end:'2024-02-29'};
 const options=Appearance.normalize({initialPeriod:'custom',customRange:source});
 assert.deepEqual(options.customRange,source);
 source.start='2024-01-01';
 assert.equal(options.customRange.start,'2024-02-01');
 assert.equal(Appearance.normalize().customRange,null);
 assert.equal(Appearance.normalize().profilePlacement,'top');
});
test('custom date validation rejects impossible, reversed, incomplete or unsupported intervals',()=>{
 for(const range of [[],{},'2024-01-01',{start:'2024-01-01'},
  {start:'2024-02-30',end:'2024-03-01'}, {start:'2024-01-02',end:'2024-01-01'},
  {start:'2015-06-30',end:'2015-07-01'},{start:'2024-01-01',end:'9999-12-31'},
  {start:'2024-01-01',end:'2024-01-02',anything:true}]) assert.throws(()=>Appearance.normalize({customRange:range}),JSON.stringify(range));
 assert.throws(()=>Appearance.normalize({initialPeriod:'custom'}));
 assert.throws(()=>Appearance.normalizeRange({start:'2024-02-29',end:'2024-03-01'},'2024-03-01T23:59:59Z'));
 assert.deepEqual(Appearance.normalizeRange({start:'2024-02-29',end:'2024-02-29'},'2024-03-01T00:00:00Z'),{start:'2024-02-29',end:'2024-02-29'});
});
test('profile placement chooses requested blocks and follows the sole visible block',()=>{
 for(const profilePlacement of ['activity','cards','both']) {
  assert.equal(Appearance.profileIn({profilePlacement},'cards'),profilePlacement!=='activity');
  assert.equal(Appearance.profileIn({profilePlacement},'activity'),profilePlacement!=='cards');
  assert.equal(Appearance.profileIn({profilePlacement,showActivity:false},'cards'),true);
  assert.equal(Appearance.profileIn({profilePlacement,showCards:false},'activity'),true);
 }
 assert.throws(()=>Appearance.normalize({profilePlacement:'floating'}));
});
