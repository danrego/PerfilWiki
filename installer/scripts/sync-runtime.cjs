'use strict';
// Copy real presentation modules and generate synthetic data. No transport runs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
function argument(name) { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; }
const candidates = [path.resolve(__dirname, '../..'), path.resolve(__dirname, '../../perfilwiki_v1/repository')];
const repository = argument('--repo') ? path.resolve(argument('--repo')) : candidates.find(candidate => fs.existsSync(path.join(candidate, 'src/Appearance.js')));
if (!repository) throw new Error('Use --repo CAMINHO para indicar o código local do PerfilWiki.');
const destination = argument('--dest') ? path.resolve(argument('--dest')) : path.resolve(__dirname, '../public/local-preview');
fs.mkdirSync(destination, { recursive: true });
const files = ['I18n.js', 'Appearance.js', 'LayoutView.js', 'DailyCover.js', 'NativeDailyCover.js', 'ProfileText.js', 'ProfileSections.js', 'ProfileFields.js', 'ProfileClock.js', 'UserGroups.js', 'Presenter.js', 'PageviewsCore.js', 'ActivityView.js', 'ProfileHeaderView.js', 'CardsView.js', 'PerfilWiki-estilos.css'];
const hashes = {};
for (const file of files) {
  const content = fs.readFileSync(path.join(repository, 'src', file));
  fs.writeFileSync(path.join(destination, file), content);
  hashes[file] = crypto.createHash('sha256').update(content).digest('hex');
}
const Core = require(path.join(repository, 'src/PageviewsCore.js'));
const sampleContext = {module:{exports:{}}};
require('node:vm').runInNewContext(fs.readFileSync(path.join(__dirname,'../public/local-preview/sample-views.js'),'utf8'),sampleContext);
const SampleViews = sampleContext.module.exports;
const now = '2026-10-15T14:42:00.000Z';
const day = 86400000;
const today = Date.parse('2026-10-15T00:00:00.000Z');
const titles = ['Brasil', 'Biblioteca Nacional do Brasil', 'Língua portuguesa', 'História do Brasil', 'Rio de Janeiro', 'Wikipédia', 'Inteligência artificial', 'Portugal', 'Biblioteca do Congresso', 'Sistema Solar'];
const firstEdits = ['2008-06-12T12:00:00.000Z', '2010-04-09T12:00:00.000Z', '2016-02-18T12:00:00.000Z', '2020-08-05T12:00:00.000Z', '2012-05-17T12:00:00.000Z', '2009-03-06T12:00:00.000Z', '2021-07-10T12:00:00.000Z', '2011-09-04T12:00:00.000Z', '2014-03-28T12:00:00.000Z', '2013-11-08T12:00:00.000Z'];
const entries = [];
let revision = 1;
function entry(index, stamp) { entries.push([revision++, index + 1, 0, titles[index], stamp, 0, 1, 'PerfilWiki Exemplo', []]); }
firstEdits.forEach((stamp, index) => entry(index, stamp));
for (let offset = 200; offset >= 0; offset -= 1) {
  const active = offset <= 42 || offset >= 133 && offset <= 200 || offset >= 64 && offset <= 111 && offset % 7 === 0;
  if (!active) continue;
  const count = 4 + (offset * 17 % 45);
  for (let edit = 0; edit < count; edit += 1) entry((offset + edit) % titles.length, new Date(today - offset * day + 12 * 3600000 + edit * 1000).toISOString());
}
entry(0, '2026-10-15T14:32:00.000Z');
entries.sort((a, b) => b[4].localeCompare(a[4]) || b[0] - a[0]);
const definitions = Core.periodsFor(now);
const cohort = titles.map((title,index) => ({pageid:index + 1,title,firstEditAt:firstEdits[index]}));
const periods = {};
for (const id of ['30d', '90d', '12m', 'since']) {
  const rows = SampleViews.rowsFor(cohort,definitions[id]);
  const total = rows.reduce((sum, row) => sum + row.views, 0);
  periods[id] = {period:definitions[id], rows, complete:true, rankingComplete:true, allArticleTotal:total, capturedAt:now, proof:{eligible:titles.length, truncatedArticles:id === 'since' ? firstEdits.filter(stamp=>stamp.slice(0,10) < '2015-07-01').length : 0}};
}
const fixture = {
  now, entries,
  metrics:{registration:'2008-06-12T00:00:00.000Z', thanks:246, edits:24368, reverts:1204, edited:titles.length, articles:183, technicalCreated:42, bytesAdded:19427584, bytesRemoved:5473280},
  pageviews:{periods, capturedAt:now, metadata:{cohort:cohort}}
};
const encoded = JSON.stringify(fixture).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
fs.writeFileSync(path.join(destination, 'fixture.js'), '/* Synthetic example data. No Wikimedia account or data requests. */\nwindow.PerfilWikiLocalFixture = ' + encoded + ';\n');
fs.writeFileSync(path.join(destination, 'source-manifest.json'), JSON.stringify({scope:'real presentation code with synthetic local data', sha256:hashes}, null, 2) + '\n');
console.log('Prepared local presentation modules and synthetic fixture in ' + destination);
