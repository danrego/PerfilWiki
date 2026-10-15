'use strict';
// Installed native browsers, localhost fixtures, synthetic data and temporary sessions.
const fs = require('node:fs');
const path = require('node:path');
const { start } = require('../tests/browser/server.cjs');
const { NativeChrome, NativeFirefox, NativeSafari } = require('../tests/browser/native-driver.cjs');
const args = process.argv.slice(2);
const value = key => { const index = args.indexOf(key); return index < 0 ? null : args[index + 1]; };
const output = path.resolve(value('--output') || path.join(__dirname, '../../browser_qa'));
const names = (value('--browsers') || 'chrome,firefox,safari').split(',');
const constructors = { chrome: NativeChrome, firefox: NativeFirefox, safari: NativeSafari };
async function bounded(promise, label) {
    let timer;
    try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(label + ' exceeded 60 seconds.')), 60000); })]); }
    finally { clearTimeout(timer); }
}
const indexExpression = `(async function(){
    var source=JSON.parse(document.getElementById('release-files').textContent), user=document.getElementById('username'), copies=[], rejectCopy=false, blobs=new Map(), createURL=URL.createObjectURL.bind(URL);
    URL.createObjectURL=function(blob){var url=createURL(blob);blobs.set(url,blob);return url;};
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async function(text){if(rejectCopy)throw Error('Synthetic clipboard denial');copies.push(text);}}});
    document.execCommand=function(){throw Error('System clipboard is forbidden in this test');};
    if(user){user.value="Érica D'Ávila";user.dispatchEvent(new Event('input',{bubbles:true}));}
    await new Promise(r=>setTimeout(r,30));
    var cards=Array.from(document.querySelectorAll('.card')), checks=[];
    function check(name,pass,detail){checks.push({name:name,pass:!!pass,detail:detail});if(!pass)throw Error(name+': '+JSON.stringify(detail));}
    function escaped(text){return text.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
    async function sha(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(v=>v.toString(16).padStart(2,'0')).join('');}
    var largest=null;
    for(var card of cards){
      var item=source[card.dataset.file], expected=item.template?item.text.split('SEU_NOME_DE_USUARIO').join(escaped(user.value)):item.text;
      var area=card.querySelector('.full-text');
      check(card.dataset.file+' complete textarea matches source',area.value===expected,{characters:area.value.length});
      card.querySelector('[data-copy="content"]').click();await new Promise(r=>setTimeout(r,30));
      check(card.dataset.file+' complete clipboard payload matches',copies.at(-1)===expected,{characters:copies.at(-1)?.length});
      card.querySelector('[data-copy="summary"]').click();await new Promise(r=>setTimeout(r,10));
      check(card.dataset.file+' edit summary matches',copies.at(-1)===item.summary,{});
      var href=card.querySelector('[data-download]').href, downloaded=href.startsWith('blob:')?await blobs.get(href).text():await(await fetch(href)).text();
      check(card.dataset.file+' download exact content and SHA256',downloaded===expected&&(item.template||await sha(downloaded)===item.sha256),{characters:downloaded.length});
      check(card.dataset.file+' editor link stays beside copy controls',!!card.querySelector('.actions [data-editor]')&&card.querySelector('[data-editor]').href.startsWith('https://pt.wikipedia.org/w/index.php?title='),{});
      if(!largest||expected.length>largest.expected.length)largest={card:card,expected:expected};
    }
    rejectCopy=true;largest.card.querySelector('[data-copy="content"]').click();await new Promise(r=>setTimeout(r,50));
    var fallback=largest.card.querySelector('.full-text');
    check('manual fallback exposes and selects the entire largest file',largest.card.querySelector('details').open&&document.activeElement===fallback&&fallback.value===largest.expected&&fallback.selectionStart===0&&fallback.selectionEnd===fallback.value.length,{characters:fallback.value.length,selectionEnd:fallback.selectionEnd});
    return JSON.stringify({checks:checks,passed:checks.length,failed:0,files:cards.length,largestFile:largest.card.dataset.file,largestCharacters:largest.expected.length,largestSha256:await sha(largest.expected),systemClipboardTouched:false,wikiEditorLinksClicked:false});
  }())`;
async function main() {
    fs.mkdirSync(output, { recursive: true });
    const fixture = await start(), reports = [];
    try {
        for (const name of names) {
            if (!constructors[name]) throw new Error('Unknown browser: ' + name);
            const driver = new constructors[name](), report = { browser: name, scenarios: [], indexes: [], bundleSha256: fixture.bundleSha256, externalRequests: [], errors: [] };
            try {
                await driver.start(fixture.origin); report.version = driver.version;
                if (!args.includes('--only-indices')) {
                    for (const scenario of (value('--scenarios') || 'seed,unknown,owner-gate,missing-relevant,no-script').split(',')) {
                        await driver.navigate(fixture.origin + '/fixture.html?scenario=' + scenario);
                        const result = JSON.parse(await bounded(driver.evaluate('(async function(){return JSON.stringify(await window.PWTEST.run());}())'), name + ' ' + scenario));
                        report.scenarios.push(result);
                        if (scenario === 'seed') {
                            await driver.screenshot(path.join(output, name + '-desktop.png'));
                            await driver.setViewport(320, 1000);
                            const width = JSON.parse(await driver.evaluate('JSON.stringify({width:window.innerWidth,scrollWidth:document.documentElement.scrollWidth})'));
                            if (width.scrollWidth > width.width) throw new Error('Mobile document overflows: ' + JSON.stringify(width));
                            await driver.screenshot(path.join(output, name + '-' + width.width + '.png'));
                            report.mobile = width; await driver.setViewport(1280, 1000);
                        }
                    }
                }
                if (!args.includes('--no-indices')) {
                    const pages = ['/public/INICIO.html', '/personal/Instalar.html'];
                    for (const page of pages) {
                        await driver.navigate(fixture.origin + page);
                        const result = JSON.parse(await bounded(driver.evaluate(indexExpression), name + ' ' + page));
                        result.page = page; report.indexes.push(result);
                    }
                }
                report.externalRequests = driver.blocked || []; report.errors = driver.errors || [];
                if (report.externalRequests.length || report.errors.length) throw new Error('Unexpected browser requests/errors: ' + JSON.stringify({ blocked: report.externalRequests, errors: report.errors }));
                report.passed = report.scenarios.reduce((sum, r) => sum + r.passed, 0) + report.indexes.reduce((sum, r) => sum + r.passed, 0) + (report.mobile ? 1 : 0);
                report.failed = 0;
            } catch (error) {
                report.failed = 1; report.failure = String(error.stack || error); console.error(name + ': ' + report.failure);
                try { report.diagnostic = JSON.parse(await bounded(driver.evaluate('JSON.stringify(window.PWTEST?{scenario:PWTEST.scenario,stage:PWTEST.stage,checks:PWTEST.checks,requests:PWTEST.requests.slice(-6),errors:PWTEST.errors,notices:PWTEST.notices,state:PerfilWiki&&PerfilWiki.getState()&&{complete:PerfilWiki.getState().complete,statistics:PerfilWiki.getState().statistics&&PerfilWiki.getState().statistics.errors}}:{})'), 'diagnostic')); } catch (_) {}
            }
            finally { await driver.close(); fs.writeFileSync(path.join(output, name + (args.includes('--only-indices') ? '-indices' : '') + '-results.json'), JSON.stringify(report, null, 2) + '\n'); reports.push(report); }
            console.log(JSON.stringify({ browser: name, version: report.version, passed: report.passed, failed: report.failed, scenarios: report.scenarios.length, indexes: report.indexes.length }));
        }
    } finally { fixture.server.closeAllConnections?.(); await new Promise(resolve => fixture.server.close(resolve)); }
    const summary = { bundleSha256: fixture.bundleSha256, browserReports: reports.map(r => ({ browser: r.browser, version: r.version, passed: r.passed || 0, failed: r.failed })), requests: fixture.requests,
        localhostOnly: true, syntheticMetricsOnly: true, authenticatedWikiSession: false, realClipboardWrites: false };
    fs.writeFileSync(path.join(output, args.includes('--only-indices') ? 'index-summary.json' : 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
    if (reports.some(r => r.failed)) process.exitCode = 1;
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
