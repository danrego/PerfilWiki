'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { seed } = require('./seed.cjs');
const base = __dirname;
const version = require('../../package.json').version;
const distribution = path.resolve(base, '../../dist', version);
const bundle = path.join(distribution, 'PerfilWiki.js');
const personal = path.resolve(process.env.PERFILWIKI_PERSONAL_PACKAGE || path.resolve(base, '../../../../../outputs/perfilwiki_' + version.replace(/\./g, '_')));
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
async function start() {
    if (!fs.existsSync(bundle)) throw new Error('Build dist/' + version + '/PerfilWiki.js before running browser tests.');
    const data = await seed(), requests = [];
    data.releaseVersion = version;
    data.stylesPage = 'Usuário:Daniel G Rego/RitmoPU-estilos';
    const html = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/style.css"><title>PerfilWiki, teste local</title><body style="margin:24px;font-family:sans-serif;background:#fff"><button id="fixture-run" type="button">Executar conferência local</button><div id="fixture-tools"></div><main style="max-width:1180px;margin:auto">' + data.cards + data.activity + '</main><pre id="fixture-results" role="status"></pre><script src="/seed.js"></script><script src="/bootstrap.js"></script><script src="/PerfilWiki.js"></script><script>window.PWTEST.firstApi=window.PerfilWiki;</script><script src="/PerfilWiki.js"></script><script src="/suite.js"></script><script src="/manual-run.js"></script></body></html>';
    const files = { '/bootstrap.js': path.join(base, 'bootstrap.js'), '/suite.js': path.join(base, 'suite.js'), '/manual-run.js':path.join(base,'manual-run.js'), '/PerfilWiki.js': bundle, '/style.css': path.join(distribution, 'PerfilWiki-estilos.css') };
    for (const [prefix, directory] of [['/public/', path.dirname(bundle)], ['/personal/', personal]]) {
        if (fs.existsSync(directory)) for (const name of fs.readdirSync(directory)) if (fs.statSync(path.join(directory, name)).isFile()) files[prefix + name] = path.join(directory, name);
    }
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://127.0.0.1'); requests.push({ method: request.method, path: url.pathname });
        const headers = { 'Content-Security-Policy': CSP, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
        if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, headers).end('GET only'); return; }
        let payload, type;
        if (url.pathname === '/' || url.pathname === '/fixture.html') { payload = url.searchParams.get('scenario') === 'no-script' ? html.replaceAll('<script src="/PerfilWiki.js"></script>', '') : html; type = 'text/html'; }
        else if (url.pathname === '/seed.js') { payload = 'window.PW_SEED=' + JSON.stringify(data).replace(/</g, '\\u003c') + ';'; type = 'text/javascript'; }
        else if (files[url.pathname]) { payload = fs.readFileSync(files[url.pathname]); type = files[url.pathname].endsWith('.html') ? 'text/html' : files[url.pathname].endsWith('.css') ? 'text/css' : files[url.pathname].endsWith('.js') ? 'text/javascript' : 'text/plain'; }
        else if (url.pathname === '/favicon.ico') { response.writeHead(204, headers).end(); return; }
        else { response.writeHead(404, headers).end('Unknown local fixture file'); return; }
        response.writeHead(200, Object.assign(headers, { 'Content-Type': type + '; charset=utf-8' })).end(request.method === 'HEAD' ? undefined : payload);
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    return { server, origin: 'http://127.0.0.1:' + server.address().port, requests,
        bundleSha256: crypto.createHash('sha256').update(fs.readFileSync(bundle)).digest('hex') };
}
module.exports = { start };
if (require.main === module) start().then(r => console.log(JSON.stringify({ origin: r.origin, bundleSha256: r.bundleSha256 }))).catch(e => { console.error(e.stack); process.exitCode = 1; });
