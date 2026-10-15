'use strict';
// Definitions only. Root may invoke start after review; requiring this launches nothing.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const { spawn } = require('node:child_process');
function playwrightModule() {
    try { return require('playwright'); } catch (_) {}
    const location = process.env.PLAYWRIGHT_MODULE_PATH || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
    return require(location);
}
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
function checkOrigin(origin) {
    const url = new URL(origin);
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Only a127.0.0.1 fixture origin is allowed.');
    return url.origin;
}
function localUrl(driver, value) {
    const url = new URL(value);
    if (url.origin !== driver.origin || url.username || url.password) throw new Error('Driver refuses navigation outside its local fixture.');
    return url.href;
}
function localRequest(driver, value) {
    try { const url = new URL(value); return url.origin === driver.origin || value.startsWith('blob:' + driver.origin + '/'); } catch (_) { return false; }
}
async function freePort() {
    const probe = net.createServer();
    await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve); });
    const port = probe.address().port;
    await new Promise(resolve => probe.close(resolve));
    return port;
}
class NativeFirefox {
    async start(origin) {
        this.origin = checkOrigin(origin); this.pending = new Map(); this.serial = 0; this.blocked = []; this.errors = [];
        this.profile = fs.mkdtempSync(path.join(os.tmpdir(), 'perfilwiki-firefox-test-'));
        fs.writeFileSync(path.join(this.profile, 'user.js'), [
            'user_pref("browser.shell.checkDefaultBrowser",false);',
            'user_pref("browser.startup.homepage","about:blank");',
            'user_pref("browser.newtabpage.enabled",false);',
            'user_pref("datareporting.healthreport.uploadEnabled",false);',
            'user_pref("datareporting.policy.dataSubmissionEnabled",false);',
            'user_pref("toolkit.telemetry.enabled",false);'
        ].join('\n'));
        this.process = spawn('/Applications/Firefox.app/Contents/MacOS/firefox', ['--headless', '--no-remote', '--profile', this.profile, '--remote-debugging-port', '0', 'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
        const endpoint = await new Promise((resolve, reject) => {
            let log = '';
            const timer = setTimeout(() => reject(new Error('Firefox BiDi startup timeout: ' + log.slice(-1000))), 20000);
            const read = chunk => { log += chunk; const match = log.match(/WebDriver BiDi listening on (ws:\/\/[^\s]+)/); if (match) { clearTimeout(timer); resolve(match[1]); } };
            this.process.stderr.on('data', read); this.process.stdout.on('data', read);
            this.process.once('exit', code => { clearTimeout(timer); reject(new Error('Test Firefox exited:' + code + ':' + log)); });
        });
        const socketUrl = new URL(endpoint.replace(/\/$/, '') + '/session');
        if (socketUrl.protocol !== 'ws:' || !['127.0.0.1', 'localhost'].includes(socketUrl.hostname)) throw new Error('Unexpected BiDi control endpoint.');
        this.socket = new WebSocket(socketUrl.href);
        await new Promise((resolve, reject) => { this.socket.addEventListener('open', resolve, { once: true }); this.socket.addEventListener('error', reject, { once: true }); });
        this.socket.addEventListener('message', event => {
            const data = JSON.parse(event.data), job = this.pending.get(data.id);
            if (job) { this.pending.delete(data.id); clearTimeout(job.timer); data.type === 'error' ? job.reject(new Error(data.error + ':' + data.message)) : job.resolve(data.result); }
            if (data.method === 'network.beforeRequestSent' && data.params.isBlocked) {
                const request = data.params.request;
                const method = localRequest(this, request.url) ? 'network.continueRequest' : 'network.failRequest';
                if (method === 'network.failRequest') this.blocked.push(request.url);
                this.command(method, { request: request.request }).catch(error => this.errors.push(error.message));
            }
        });
        const session = await this.command('session.new', { capabilities: {} }); this.version = session.capabilities.browserVersion;
        this.context = (await this.command('browsingContext.create', { type: 'tab' })).context;
        await this.command('browsingContext.activate', { context: this.context });
        await this.command('session.subscribe', { events: ['network.beforeRequestSent'], contexts: [this.context] });
        await this.command('network.addIntercept', { phases: ['beforeRequestSent'], contexts: [this.context] });
        await this.setViewport(1280, 1000);
    }
    command(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = ++this.serial;
            const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('BiDi command timeout:' + method)); }, 180000);
            this.pending.set(id, { resolve, reject, timer }); this.socket.send(JSON.stringify({ id, method, params }));
        });
    }
    async navigate(url) { await this.command('browsingContext.navigate', { context: this.context, url: localUrl(this, url), wait: 'complete' }); }
    async evaluate(expression) {
        const result = await this.command('script.evaluate', { expression, target: { context: this.context }, awaitPromise: true });
        if (result.type === 'exception') throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.type === 'undefined' ? undefined : result.result.value;
    }
    async setViewport(width, height) { await this.command('browsingContext.setViewport', { context: this.context, viewport: { width, height }, devicePixelRatio: 1 }); }
    async screenshot(file) { const result = await this.command('browsingContext.captureScreenshot', { context: this.context, origin: 'document' }); fs.writeFileSync(file, Buffer.from(result.data, 'base64')); }
    async close() {
        try { if (this.socket?.readyState === 1) await this.command('session.end'); } catch (_) {}
        this.socket?.close();
        if (this.process && this.process.exitCode === null && this.process.signalCode === null) { this.process.kill('SIGTERM'); await Promise.race([new Promise(resolve => this.process.once('exit', resolve)), delay(3000)]); }
        if (this.process && this.process.exitCode === null && this.process.signalCode === null) { this.process.kill('SIGKILL'); await new Promise(resolve => this.process.once('exit', resolve)); }
        for (const pending of this.pending?.values() || []) { clearTimeout(pending.timer); pending.reject(new Error('Test driver closed.')); }
        this.pending?.clear();
        if (this.profile) fs.rmSync(this.profile, { recursive: true, force: true });
    }
}
class NativeChrome {
    async start(origin) {
        this.origin = checkOrigin(origin); this.blocked = []; this.errors = [];
        this.browser = await playwrightModule().chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--no-first-run', '--no-default-browser-check', '--disable-background-networking'] });
        this.version = this.browser.version(); this.context = await this.browser.newContext({ viewport: { width: 1280, height: 1000 } });
        await this.context.route('**/*', route => { if (localRequest(this, route.request().url())) return route.continue(); this.blocked.push(route.request().url()); return route.abort(); });
        this.page = await this.context.newPage(); this.page.on('pageerror', error => this.errors.push(error.message));
    }
    async navigate(url) { await this.page.goto(localUrl(this, url), { waitUntil: 'load' }); }
    async evaluate(expression) { return this.page.evaluate(expression); }
    async setViewport(width, height) { await this.page.setViewportSize({ width, height }); }
    async screenshot(file) { await this.page.screenshot({ path: file, fullPage: true }); }
    async close() { await this.browser?.close(); }
}
class NativeSafari {
    async start(origin) {
        this.origin = checkOrigin(origin); this.errors = []; this.blocked = []; this.port = await freePort();
        this.process = spawn('/usr/bin/safaridriver', ['-p', String(this.port)], { stdio: ['ignore', 'pipe', 'pipe'] });
        let log = ''; this.process.stderr.on('data', chunk => log += chunk);
        let ready = false;
        for (let tries = 0; tries < 50; tries += 1) { try { await this.request('GET', '/status'); ready = true; break; } catch (_) {} await delay(100); }
        if (!ready) throw new Error('safaridriver unavailable:' + log);
        const session = await this.request('POST', '/session', { capabilities: { alwaysMatch: { browserName: 'safari' } } });
        this.session = session.sessionId; this.version = session.capabilities.browserVersion;
        await this.request('POST', '/session/' + this.session + '/timeouts', { script: 180000, pageLoad: 60000, implicit: 0 });
        await this.setViewport(1280, 1000);
    }
    async request(method, route, data) {
        const result = await fetch('http://127.0.0.1:' + this.port + route, { method, headers: { 'Content-Type': 'application/json' }, ...(data ? { body: JSON.stringify(data) } : {}) });
        const decoded = await result.json(); if (decoded.value?.error) throw new Error(decoded.value.error + ':' + decoded.value.message); return decoded.value;
    }
    async navigate(url) { await this.request('POST', '/session/' + this.session + '/url', { url: localUrl(this, url) }); }
    async evaluate(expression) {
        const result = await this.request('POST', '/session/' + this.session + '/execute/async', {
            script: 'var callback=arguments[arguments.length-1];Promise.resolve().then(function(){return(0,eval)(arguments[0]);}.bind(null,arguments[0])).then(function(value){callback({ok:true,value:value});},function(error){callback({ok:false,error:String(error&&error.stack||error)});});', args: [expression]
        });
        if (!result.ok) throw new Error(result.error); return result.value;
    }
    async setViewport(width, height) { await this.request('POST', '/session/' + this.session + '/window/rect', { width, height }); }
    async screenshot(file) { const result = await this.request('GET', '/session/' + this.session + '/screenshot'); fs.writeFileSync(file, Buffer.from(result, 'base64')); }
    async close() { if (this.session) try { await this.request('DELETE', '/session/' + this.session); } catch (_) {} if (this.process && this.process.exitCode === null) this.process.kill('SIGTERM'); }
}
module.exports = { NativeFirefox, NativeChrome, NativeSafari, delay };
