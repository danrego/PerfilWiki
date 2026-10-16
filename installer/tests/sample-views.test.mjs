import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const sampleContext={module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(new URL('../public/local-preview/sample-views.js',import.meta.url),'utf8'),sampleContext);
const SampleViews=sampleContext.module.exports;

const cohort=Array.from({length:10},(_,index)=>({pageid:index+1,title:'Artigo '+(index+1),firstEditAt:'2014-01-01T12:00:00Z'}));

test('fictional custom counts use actual dates, add complete days and respect the first-edit cutoff',()=>{
  const left=SampleViews.rowsFor(cohort,{start:'2026-10-01',end:'2026-10-07'});
  const right=SampleViews.rowsFor(cohort,{start:'2026-10-08',end:'2026-10-14'});
  const whole=SampleViews.rowsFor(cohort,{start:'2026-10-01',end:'2026-10-14'});
  assert.equal(whole.length,10);
  assert.equal(new Set(whole.map(row=>row.pageid)).size,10);
  for(const row of whole) assert.equal(row.views,left.find(part=>part.pageid===row.pageid).views+right.find(part=>part.pageid===row.pageid).views);
  assert.ok(whole.every((row,index)=>index===0||row.views<=whole[index-1].views));
  const newArticle=[{pageid:1,title:'Novo artigo',firstEditAt:'2026-10-10T20:00:00Z'}];
  assert.deepEqual(SampleViews.rowsFor(newArticle,{start:'2026-10-01',end:'2026-10-10'}),[]);
  assert.equal(SampleViews.rowsFor(newArticle,{start:'2026-10-01',end:'2026-10-14'})[0].countFromDate,'2026-10-11');
  assert.throws(()=>SampleViews.rowsFor(cohort,{start:'2026-02-30',end:'2026-03-05'}));
});

test('generated offline examples contain ten ranked articles in every fixed period and agree with custom date counts',()=>{
  const destination=fs.mkdtempSync(path.join(os.tmpdir(),'perfilwiki-sample-'));
  try {
    execFileSync(process.execPath,[new URL('../scripts/sync-runtime.cjs',import.meta.url).pathname,'--dest',destination],{stdio:'pipe'});
    const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(destination,'fixture.js'),'utf8'),context);
    const fixture=context.window.PerfilWikiLocalFixture;
    assert.equal(fixture.pageviews.metadata.cohort.length,10);
    for(const id of ['30d','90d','12m','since']) {
      const section=fixture.pageviews.periods[id];
      assert.equal(section.rows.length,10);
      assert.equal(new Set(section.rows.map(row=>row.title)).size,10);
      assert.ok(section.rows.every((row,index)=>index===0||row.views<=section.rows[index-1].views));
      assert.equal(section.allArticleTotal,section.rows.reduce((sum,row)=>sum+row.views,0));
      assert.equal(JSON.stringify(section.rows),JSON.stringify(SampleViews.rowsFor(fixture.pageviews.metadata.cohort,section.period)));
    }
  } finally {fs.rmSync(destination,{recursive:true,force:true});}
});
