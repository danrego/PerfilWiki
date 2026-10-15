/* PerfilWiki 1.0.1. Shared scheduler and anonymous transport. Daniel G Rego, CC BY-SA 4.0. */
(function (win) {
    'use strict';
    var mw = win.mw, core = win.PerfilWikiCoordinator, view = win.PerfilWikiActivityView, codec = win.PerfilWikiCache, presenter = win.PerfilWikiPresenter;
    if (!mw || !core || !view || !codec || !presenter || !mw.config || mw.config.get('wgDBname') !== 'ptwiki' ||
        mw.config.get('wgAction') !== 'view' || win.PerfilWiki) { return; }
    if (win.DanPURitmo || win.DanPUStats) {
        if (mw.notify) { mw.notify('Retire as chamadas antigas de RitmoPU e EstatisticasPU do common.js antes de carregar PerfilWiki.', {type:'warn'}); }
        return;
    }
    var configured, profileOptions;
    try { profileOptions = win.PerfilWikiConfiguration.resolve(mw, win); configured = profileOptions.metrics; }
    catch (error) { if (win.console) { win.console.warn('PerfilWiki: configuração inválida.', error); } return; }
    if (!mw.config.get('wgUserName') || mw.config.get('wgUserName') !== configured.user) { return; }
    var relevantUser = mw.config.get('wgRelevantUserName') || String(mw.config.get('wgTitle') || '').split('/')[0].replace(/_/g, ' ');
    var namespace = mw.config.get('wgNamespaceNumber');
    if (relevantUser !== configured.user || namespace !== 2) { return; }
    var defaultUser = false;
    var PREFIX = 'perfilwiki-v1-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-';
    if (win.PerfilWikiStyleText && !win.document.getElementById('perfilwiki-style-v1')) {
        var style = win.document.createElement('style'); style.id = 'perfilwiki-style-v1'; style.textContent = win.PerfilWikiStyleText;
        (win.document.head || win.document.documentElement).appendChild(style);
    }
    var REFRESH = 300000;
    var BLACKLIST_URL = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
    var queryAnchor = null, nextRequestAt = 0;
    var periodKeys = ['30d', '90d', '12m', 'since'];
    var visibleCounts = { '30d': 10, '90d': 10, '12m': 10, 'since': 10 };
    var activePeriod = '30d', priorityChanged = false;
    function periodFromHash() {
        var hash = win.location && win.location.hash || '';
        var match = /^#dan-pu-view-(30d|90d|12m|since)$/.exec(hash);
        return match ? match[1] : null;
    }
    activePeriod = periodFromHash() || activePeriod;
    var current = null, started = false, running = false, suspended = false, timer;
    var lifecycle = 0, releaseActiveLease = null, nextCheck = 0;
    var cachedRaw = null, cachedState = null;
    var controllers = new Set(), pauses = Object.create(null);
    var active = 0, waiters = [];
    var images = Object.create(null), imageAttempts = Object.create(null), brokenImages = new Set();
    var imagesLoaded = false, imagesInFlight = false, imageTimer, clockTimer;
    function storageGet(key) { try { return win.localStorage.getItem(PREFIX + key); } catch (_) { return null; } }
    function storageSet(key, value) {
        try {
            var encoded = key === 'cache' ? codec.packJson(value) : value;
            try { win.localStorage.setItem(PREFIX + key, encoded); }
            catch (error) {
                if (key !== 'cache' || !error || (error.name !== 'QuotaExceededError' && error.code !== 22 && error.code !== 1014)) { throw error; }
                if (defaultUser) {
                    ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'].forEach(function (version) { win.localStorage.removeItem('dan-pu-ritmo-' + version + '-cache'); });
                }
                win.localStorage.setItem(PREFIX + key, encoded);
            }
        } catch (_) { /* In-memory results remain usable. */ }
    }
    function validatedCache(raw, upgrade) {
        try {
            if (!raw || raw.length > 4000000) { return null; }
            var state = codec.parseJson(raw);
            if (Date.parse(state.capturedAt) > Date.now() + 60000) { return null; }
            if (upgrade) {
                var upgradeCache = state.schemaVersion === 4 ? core.upgradeAllArticleTotalCache : core.upgradeAfterFirstEditCache;
                if (typeof upgradeCache !== 'function') { return null; }
                state = upgradeCache(state);
            }
            if (!state.config || state.config.user !== configured.user || state.config.project !== configured.project || state.config.timeZone !== configured.timeZone) { return null; }
            return Date.parse(state.capturedAt) <= Date.now() + 60000 && core.validateState(state).valid ? state : null;
        } catch (_) { return null; }
    }
    function readCache() {
        var raw = storageGet('cache');
        if (cachedState && raw === cachedRaw && Date.parse(cachedState.capturedAt) <= Date.now() + 60000) { return cachedState; }
        var cached = validatedCache(raw, false);
        cachedRaw = cached ? raw : null; cachedState = cached;
        if (cached) { return cached; }
        var legacyKeys = ['dan-pu-ritmo-v8-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-cache', 'dan-pu-ritmo-v8-cache', 'dan-pu-ritmo-v7-cache', 'dan-pu-ritmo-v6-cache', 'dan-pu-ritmo-v5-cache', 'dan-pu-ritmo-v4-cache', 'dan-pu-ritmo-v3-cache'];
        for (var index = 0; index < legacyKeys.length; index += 1) {
            try {
                var legacyRaw = win.localStorage.getItem(legacyKeys[index]);
                var upgraded = validatedCache(legacyRaw, false) || validatedCache(legacyRaw, true);
                if (upgraded) { storageSet('cache', JSON.stringify(upgraded)); return upgraded; }
            } catch (_) { /* Try the other strictly validated legacy cache. */ }
        }
        return null;
    }
    function readImages() {
        if (imagesLoaded) { return; }
        imagesLoaded = true;
        try {
            var raw = storageGet('images-v1');
            if (raw && raw.length <= 262144) { images = presenter.normalizeImages(JSON.parse(raw), Date.now()); }
        } catch (_) { /* Optional image metadata never invalidates statistics. */ }
    }
    function imageSlots() {
        var target = win.document.getElementById('dan-pu-ritmo');
        return target && typeof target.querySelectorAll === 'function' ? Array.from(target.querySelectorAll('.dan-pu-view-image[data-pageid]')) : [];
    }
    function placeholder(slot) {
        var fallback = win.document.createElement('span');
        fallback.className = 'dan-pu-thumb-placeholder'; fallback.textContent = '▧'; fallback.setAttribute('aria-hidden', 'true');
        slot.replaceChildren(fallback);
    }
    function patchImages() {
        imageSlots().forEach(function (slot) {
            var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
            var image = presenter.imageFor(images, row);
            var existing = slot.querySelector('img');
            if (!image || brokenImages.has(image.src)) {
                if (existing) { placeholder(slot); }
                return;
            }
            var element = existing;
            if (!element || element.getAttribute('src') !== image.src) {
                element = win.document.createElement('img'); element.className = 'dan-pu-thumb'; element.alt = '';
                element.width = 48; element.height = 48; element.loading = 'lazy'; element.decoding = 'async';
                element.crossOrigin = 'anonymous'; element.referrerPolicy = 'no-referrer'; element.src = image.src;
                slot.replaceChildren(element);
            }
            if (!element.danPURitmoBound) {
                element.danPURitmoBound = true;
                element.addEventListener('error', function () { brokenImages.add(image.src); if (element.parentNode === slot) { placeholder(slot); } }, { once: true });
            }
        });
    }
    function updateClock() {
        if (suspended || win.document.hidden) { return; }
        var target = win.document.getElementById('dan-pu-ritmo');
        if (target && typeof target.querySelectorAll === 'function') {
            Array.from(target.querySelectorAll('.dan-pu-last-edit[data-live="true"]')).forEach(function (label) {
                var value = presenter.relativeTime(label.getAttribute('data-timestamp'), Date.now());
                if (value && label.textContent !== value) { label.textContent = value; }
            });
        }
    }
    function startClock() {
        win.clearTimeout(clockTimer); updateClock();
        if (!suspended && !win.document.hidden && win.document.getElementById('dan-pu-ritmo')) {
            clockTimer = win.setTimeout(function () { startClock(); }, 60020 - Date.now() % 60000);
        }
    }
    function queueImages() {
        win.clearTimeout(imageTimer);
        if (suspended || imagesInFlight || win.document.hidden || !imageSlots().length) { return; }
        imageTimer = win.setTimeout(function () { collectImages(); }, 1800);
    }
    async function collectImages() {
        if (suspended || imagesInFlight || win.document.hidden) { return; }
        var epoch = lifecycle, requested = [], seen = new Set(), now = Date.now();
        imageSlots().forEach(function (slot) {
            var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
            var attempt = imageAttempts[row.pageid];
            if (Number.isSafeInteger(row.pageid) && row.pageid > 0 && row.title && row.title.length <= 512 && !seen.has(row.pageid) && requested.length < 40 &&
                !presenter.imageFor(images, row) && !(attempt && attempt.title === row.title && now - attempt.at < 3600000)) {
                seen.add(row.pageid); requested.push(row); imageAttempts[row.pageid] = { title: row.title, at: now };
            }
        });
        var url = presenter.imageRequest(requested);
        if (!url) { return; }
        imagesInFlight = true;
        try {
            var response = await sharedRequestJson(url, epoch);
            checkLifecycle(epoch);
            if (!response.query || !Array.isArray(response.query.pages) || response.query.pages.length > 50 || response.continue) { throw new Error('Metadados de imagem incompletos.'); }
            var capturedAt = new Date().toISOString();
            response.query.pages.forEach(function (page) {
                var expected = requested.find(function (row) { return row.pageid === page.pageid && row.title === page.title; });
                var image = expected && presenter.validateImage(page, capturedAt);
                if (image) { images[image.pageid] = image; }
            });
            var retained = Object.create(null);
            imageSlots().forEach(function (slot) {
                var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
                var image = presenter.imageFor(images, row);
                if (image) { retained[image.pageid] = image; }
            });
            images = presenter.normalizeImages(retained, Date.now());
            storageSet('images-v1', JSON.stringify(images)); patchImages();
        } catch (error) {
            requested.forEach(function (row) {
                var attempt = imageAttempts[row.pageid];
                if (!attempt || attempt.title !== row.title || attempt.at !== now) { return; }
                if (suspended || epoch !== lifecycle || error.code === 'aborted') { delete imageAttempts[row.pageid]; }
                else { attempt.at = Date.now() - 3300000; }
            });
        } finally {
            imagesInFlight = false;
            if (!suspended) { queueImages(); }
        }
    }
    function enhancePresentation() {
        patchImages(); startClock(); queueImages();
    }
    function bindControls() {
        periodKeys.forEach(function (key) {
            var tab = win.document.getElementById('dan-pu-ritmo-tab-' + key);
            if (tab && !tab.danPURitmoBound) {
                tab.addEventListener('click', function () { choosePeriod(key); }); tab.danPURitmoBound = true;
            }
            var expand = win.document.getElementById('dan-pu-ritmo-expand-' + key);
            var collapse = win.document.getElementById('dan-pu-ritmo-collapse-' + key);
            var pageviews = current && current.pageviews;
            var section = pageviews && pageviews.periods && pageviews.periods[key];
            var previousProfile = pageviews && pageviews.lastCompleteSnapshot && pageviews.lastCompleteSnapshot.periods && pageviews.lastCompleteSnapshot.periods[key];
            var needsPrevious = section && !section.complete;
            var displayed = section && needsPrevious && (section.lastCompleteSnapshot || previousProfile) || section;
            if (!displayed || !Array.isArray(displayed.rows) || displayed.rows.length <= 10) { return; }
            var total = Math.min(500, displayed.rows.length);
            visibleCounts[key] = Math.min(total, Math.max(10, visibleCounts[key]));
            function bindButton(container, label, handler) {
                if (!container) { return; }
                var button = win.document.createElement('button'); button.type = 'button'; button.textContent = label;
                button.style.cssText = 'border:0;background:none;color:#36c;font:inherit;padding:0;cursor:pointer;text-decoration:underline;';
                button.addEventListener('click', handler); container.replaceChildren(button);
            }
            if (visibleCounts[key] < total) {
                bindButton(expand, 'Mostrar mais ' + Math.min(100, total - visibleCounts[key]), function () {
                    visibleCounts[key] = Math.min(total, visibleCounts[key] + 100); paint(current);
                });
            }
            if (visibleCounts[key] > 10) {
                bindButton(collapse, 'Mostrar só 10', function () { visibleCounts[key] = 10; paint(current); });
            }
        });
    }
    function applyPeriodVisibility() {
        periodKeys.forEach(function (key) {
            var selected = key === activePeriod;
            var section = win.document.getElementById('dan-pu-period-' + key);
            if (section) { section.style.display = selected ? 'block' : 'none'; }
            var tab = win.document.getElementById('dan-pu-ritmo-tab-' + key);
            if (tab) {
                var pill = tab.querySelector && tab.querySelector('a') || tab;
                pill.style.background = selected ? '#eaf3ff' : '#fff';
                pill.style.borderColor = selected ? '#36c' : '#c8ccd1';
                pill.style.color = selected ? '#2454a6' : '#54595d';
                pill.style.fontWeight = selected ? '600' : '400';
                pill.setAttribute('aria-current', selected ? 'true' : 'false');
            }
        });
    }
    function choosePeriod(key) {
        if (periodKeys.indexOf(key) < 0) { return; }
        var changed = key !== activePeriod;
        activePeriod = key; applyPeriodVisibility();
        if (!changed || !current || !current.pageviews || current.pageviews.allPeriodsComplete) { return; }
        priorityChanged = true;
        if (started && !running && !suspended) { refresh(false, true); }
    }
    function currentMetricReadership(element) {
        return element && element.getAttribute('data-perfilwiki-user') === configured.user && element.getAttribute('data-perfilwiki-project') === 'pt.wikipedia.org' && element.getAttribute('data-metric-version') === 'after-first-edit-v1' &&
            element.getAttribute('data-total-model') === 'all-periods-all-eligible-v1';
    }
    function paint(state) {
        if (state && win.PerfilWikiCardsView) { win.PerfilWikiCardsView.paint(win.document, state.statistics, state.activity, Date.now()); }
        var target = win.document.getElementById('dan-pu-ritmo');
        if (!target || !state || !state.activity || !state.activity.complete) { return; }
        var pageviews = state.pageviews;
        var hasCompleteProfile = periodKeys.some(function (key) {
            var profile = pageviews && pageviews.periods && pageviews.periods[key];
            var previous = pageviews && pageviews.lastCompleteSnapshot && pageviews.lastCompleteSnapshot.periods && pageviews.lastCompleteSnapshot.periods[key];
            return profile && (profile.complete || profile.lastCompleteSnapshot && profile.lastCompleteSnapshot.complete) || previous && previous.complete;
        });
        var previousReadership = target.querySelector && target.querySelector('.dan-pu-readership');
        var preserved = !hasCompleteProfile && currentMetricReadership(previousReadership) ? previousReadership : null;
        readImages();
        var help = target.querySelector && target.querySelector('details.dan-pu-data-help');
        var helpOpen = help && help.open;
        target.outerHTML = view.html(state, { visibleCounts: visibleCounts, images: images, now: Date.now(), stylesPage: profileOptions.stylesPage, documentationPage: profileOptions.documentationPage });
        if (preserved) {
            var updated = win.document.getElementById('dan-pu-ritmo');
            var readership = updated && updated.querySelector('.dan-pu-readership');
            if (readership) { readership.replaceWith(preserved); }
        }
        var best = win.document.getElementById('dan-pu-ritmo-melhor-sequencia');
        if (best) { var days = state.activity.summary.bestStreak; best.textContent = new Intl.NumberFormat('pt-BR').format(days) + (days === 1 ? ' dia' : ' dias'); }
        bindControls(); applyPeriodVisibility();
        if (helpOpen) {
            var nextTarget = win.document.getElementById('dan-pu-ritmo');
            var nextHelp = nextTarget && nextTarget.querySelector('details.dan-pu-data-help');
            if (nextHelp) { nextHelp.open = true; }
        }
        enhancePresentation();
    }
    function requestAllowed(url) { return win.PerfilWikiConfiguration.requestAllowed(url); }
    function canonicalRequest(url) { var value = new URL(url); value.searchParams.sort(); return value.toString(); }
    var sharedRequests = new Map();
    function sharedRequestJson(url, epoch) {
        var key = canonicalRequest(url);
        if (sharedRequests.has(key)) { return sharedRequests.get(key); }
        var request = requestJson(url, epoch);
        sharedRequests.set(key, request);
        request.catch(function () { if (sharedRequests.get(key) === request) { sharedRequests.delete(key); } });
        return request;
    }
    function servicePause(origin, until) {
        try {
            var shared = JSON.parse(storageGet('pausas') || '{}');
            if (shared && typeof shared === 'object' && !Array.isArray(shared)) {
                Object.keys(shared).forEach(function (key) { if (Number.isFinite(shared[key])) { pauses[key] = Math.max(pauses[key] || 0, shared[key]); } });
            }
        } catch (_) { /* Use the in-memory pause. */ }
        if (until !== undefined) { pauses[origin] = Math.max(pauses[origin] || 0, until); storageSet('pausas', JSON.stringify(pauses)); }
        return pauses[origin] || 0;
    }
    function checkLifecycle(epoch) {
        if (suspended || epoch !== lifecycle) {
            var error = new Error('Página suspensa.'); error.code = 'aborted'; throw error;
        }
    }
    async function requestJson(url, requestEpoch) {
        var epoch = requestEpoch === undefined ? lifecycle : requestEpoch;
        checkLifecycle(epoch);
        if (!requestAllowed(url)) { throw new Error('A consulta não pertence às fontes públicas do painel.'); }
        if (active >= 2) { await new Promise(function (resolve) { waiters.push(resolve); }); } else { active += 1; }
        var controller, timeout;
        try {
            checkLifecycle(epoch);
            var origin = new URL(url).origin;
            if (servicePause(origin) > Date.now()) { throw new Error('O serviço pediu uma pausa nas consultas.'); }
            var wait = Math.max(0, nextRequestAt - Date.now());
            nextRequestAt = Math.max(nextRequestAt, Date.now()) + 500;
            if (wait) { await new Promise(function (resolve) { win.setTimeout(resolve, wait); }); }
            checkLifecycle(epoch);
            if (servicePause(origin) > Date.now()) { throw new Error('Consulta pausada.'); }
            controller = new AbortController(); controllers.add(controller);
            timeout = win.setTimeout(function () { controller.abort(); }, 20000);
            var response = await win.fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store', signal: controller.signal });
            checkLifecycle(epoch);
            if (!response.ok) {
                if (response.status === 429 || response.status === 503) {
                    var retry = response.headers.get('Retry-After');
                    var delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 :
                        retry && Number.isFinite(Date.parse(retry)) ? Date.parse(retry) - Date.now() : REFRESH;
                    servicePause(origin, Date.now() + Math.max(5000, delay));
                }
                var httpError = new Error('HTTP ' + response.status); httpError.code = response.status;
                if (response.status === 404) {
                    httpError.status = 404;
                    var requestUrl = new URL(url);
                    if (requestUrl.origin === 'https://wikimedia.org' && requestUrl.pathname.indexOf('/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/') === 0) {
                        httpError.requestUrl = url;
                        try { httpError.problem = await response.json(); } catch (_) { /* A proxy response is not analytics evidence. */ }
                    }
                }
                throw httpError;
            }
            if (url === BLACKLIST_URL) {
                var sourceText = await response.text();
                checkLifecycle(epoch);
                if (sourceText.length > 256000) { throw new Error('A lista de exclusões excede o tamanho esperado.'); }
                var excludedTitles = [];
                sourceText.split(/\r?\n/).forEach(function (line) {
                    if (!line.trim()) { return; }
                    var fields = line.split('\t');
                    if (fields.length !== 2 || !/^[a-z0-9._-]+$/.test(fields[0]) || !fields[1].trim()) { throw new Error('Lista de exclusões inválida.'); }
                    if (fields[0] === 'pt.wikipedia' || fields[0] === 'pt.wikipedia.org') { excludedTitles.push(fields[1].replace(/ /g, '_')); }
                });
                return { project: 'pt.wikipedia.org', source: BLACKLIST_URL, snapshotAt: queryAnchor || new Date().toISOString(), excludedTitles: excludedTitles };
            }
            var data = await response.json();
            checkLifecycle(epoch);
            if (data.error || data.warnings && Object.keys(data.warnings).length) {
                var failure = new Error('Consulta pública incompleta.');
                failure.code = data.error && data.error.code || 'api-warning';
                failure.detail = JSON.stringify(data.error || data.warnings);
                throw failure;
            }
            return data;
        } finally {
            if (timeout) { win.clearTimeout(timeout); }
            if (controller) { controllers.delete(controller); }
            if (waiters.length) { waiters.shift()(); } else { active -= 1; }
        }
    }
    function notify(message, type) { if (mw.notify) { mw.notify(message, { tag: 'dan-pu-ritmo', type: type || 'info' }); } }
    function schedule(delay) {
        win.clearTimeout(timer);
        if (!suspended) { timer = win.setTimeout(function () { refresh(false); }, delay === undefined ? REFRESH : delay); }
    }
    async function withLease(task) {
        var now = Date.now(), lease;
        var epoch = lifecycle;
        try { lease = JSON.parse(storageGet('bloqueio') || 'null'); } catch (_) { lease = null; }
        if (lease && lease.expires > now) { return false; }
        var token = now + '-' + Math.random().toString(36).slice(2);
        storageSet('bloqueio', JSON.stringify({ token: token, expires: now + 120000 }));
        function owns() {
            if (suspended || epoch !== lifecycle) { return false; }
            var raw = storageGet('bloqueio');
            if (raw === null) { return !suspended; }
            try { return !suspended && JSON.parse(raw).token === token; } catch (_) { return false; }
        }
        if (!owns()) { return false; }
        var heartbeat = win.setInterval(function () {
            if (owns()) { storageSet('bloqueio', JSON.stringify({ token: token, expires: Date.now() + 120000 })); }
        }, 30000);
        function release() {
            win.clearInterval(heartbeat);
            try {
                var finalLease = JSON.parse(storageGet('bloqueio') || 'null');
                if (finalLease && finalLease.token === token) { storageSet('bloqueio', JSON.stringify({ token: token, expires: 0 })); }
            } catch (_) { /* Its deadline still releases an unreadable lease. */ }
        }
        releaseActiveLease = release;
        try { await task(owns); return true; }
        finally { release(); if (releaseActiveLease === release) { releaseActiveLease = null; } }
    }
    async function refresh(manual, priority) {
        if (!started || running || suspended || !win.document.getElementById('dan-pu-ritmo')) { return; }
        var epoch = lifecycle;
        var cached = readCache();
        if (cached && cached !== current && (!current || Date.parse(cached.capturedAt) >= Date.parse(current.capturedAt))) { current = cached; paint(current); }
        var storedDeadline = Number(storageGet('proxima-consulta')) || 0;
        if (!Number.isFinite(storedDeadline) || storedDeadline > Date.now() + REFRESH + 60000) { storedDeadline = 0; }
        if (!Number.isFinite(nextCheck) || nextCheck > Date.now() + REFRESH + 60000) { nextCheck = 0; }
        var deadline = Math.max(nextCheck, storedDeadline);
        if (!manual && !priority && deadline > Date.now() && deadline < Date.now() + REFRESH + 60000) { schedule(Math.max(1000, deadline - Date.now())); return; }
        if (!manual && win.document.hidden) { schedule(); return; }
        running = true;
        async function collect(owns) {
            if (manual) { notify('Consultando as estatísticas…'); }
            var config = Object.assign({}, configured);
            if (manual) { config.activityRefreshMs = 0; }
            queryAnchor = new Date().toISOString(); sharedRequests.clear();
            var requestedPeriod = activePeriod; priorityChanged = false;
            var next = await core.update({ requestJson: function (url) { checkLifecycle(epoch); return sharedRequestJson(url, epoch); }, previous: current, config: config, now: queryAnchor, activePeriod: requestedPeriod, maxRequests: 40,
                retryUnavailableSeries: !!manual, retryUnavailableAggregates: !!manual, forceStatistics: !!manual,
                onProgress: function (partial) {
                    if (!owns() || suspended || !core.validateState(partial).valid) { return; }
                    current = partial; storageSet('cache', JSON.stringify(current)); paint(current);
                }
            });
            next.config = Object.assign({}, configured);
            if (!owns()) { return; }
            if (!core.validateState(next).valid) { throw new Error('Os dados novos não passaram pela conferência.'); }
            current = next;
            storageSet('cache', JSON.stringify(current));
            paint(current);
            if (manual) {
                if (next.pageviews && !next.pageviews.allPeriodsComplete && !next.pageviews.error) {
                    notify('Calculando as visualizações de todos os artigos editados por você. O painel acompanha a consulta.');
                } else { notify(next.fresh ? 'Painel atualizado nesta tela.' : 'Os dados disponíveis foram atualizados. As consultas incompletas mantiveram seus últimos resultados.', next.fresh ? 'success' : 'warn'); }
            }
        }
        try {
            var complete;
            if (win.navigator.locks && win.navigator.locks.request) {
                complete = await win.navigator.locks.request(PREFIX + 'consulta', { ifAvailable: true }, function (lock) { return lock ? withLease(collect) : false; });
            } else { complete = await withLease(collect); }
            if (!complete && manual) { notify('Outra aba já está consultando o painel.'); }
        } catch (error) {
            win.console.warn('Atividade na Wikipédia: os dados anteriores foram mantidos.', error);
            if (manual) { notify('Não foi possível concluir a consulta. O painel anterior foi mantido.', 'warn'); }
        } finally {
            running = false;
            if (!suspended && epoch !== lifecycle) { schedule(1500); }
            else if (!suspended) {
                var views = current && current.pageviews;
                var continuing = views && !views.allPeriodsComplete && views.progress && views.progress.pending > 0 && !views.error || current && (current.history && current.history.pending && !current.history.error || current.statistics && current.statistics.pending && !current.statistics.errors.length);
                var delay = priorityChanged && views && !views.allPeriodsComplete ? 0 : (continuing ? 15000 : REFRESH);
                nextCheck = Date.now() + delay;
                storageSet('proxima-consulta', String(nextCheck)); schedule(delay);
            }
        }
    }
    function download() {
        if (!current || !current.activity.complete) { notify('Aguarde a primeira consulta completa.', 'warn'); return; }
        var markup = view.wikitext(current, { images: images, stylesPage: profileOptions.stylesPage, documentationPage: profileOptions.documentationPage });
        var blob = new Blob([markup + '\n'], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_atividade.wiki';
        link.click(); win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function downloadCards() {
        if (!current || !current.statistics) { notify('Aguarde a primeira consulta dos contadores.', 'warn'); return; }
        var markup = '<templatestyles src="' + profileOptions.stylesPage.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" />' +
            win.PerfilWikiCardsView.wikitext(current.statistics, current.activity, {user: configured.user, now: Date.now()});
        var url = URL.createObjectURL(new Blob([markup + '\n'], {type:'text/plain;charset=utf-8'}));
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_contadores.wiki'; link.click();
        win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function begin() {
        if (started || !win.document.getElementById('dan-pu-ritmo')) { return; }
        started = true; readImages(); current = readCache();
        var cards = win.document.getElementById('dan-pu-estatisticas');
        if (cards && !win.document.getElementById('perfilwiki-anos')) {
            var tenure = cards.querySelector('.dan-pu-stat-tenure .dan-pu-stat-value');
            if (tenure) { var tenureValue = win.document.createElement('span'); tenureValue.id = 'perfilwiki-anos'; tenureValue.append.apply(tenureValue, Array.from(tenure.childNodes)); tenure.appendChild(tenureValue); }
        }
        if (cards && cards.getAttribute('data-perfilwiki-user') !== configured.user) {
            ['dan-pu-edicoes','dan-pu-agradecimentos','dan-pu-artigos','dan-pu-editados','dan-pu-criados-tecnicos','dan-pu-reversoes','dan-pu-ritmo-melhor-sequencia','perfilwiki-anos'].forEach(function (id) {
                var number = win.document.getElementById(id); if (number) { number.textContent = 'Aguardando dados'; }
            });
            cards.setAttribute('data-perfilwiki-user', configured.user);
        }

        if (current) { paint(current); }
        else {
            var target = win.document.getElementById('dan-pu-ritmo');
            if (target && target.getAttribute('data-perfilwiki-user') !== configured.user) {
                target.textContent = 'Consultando a atividade de ' + configured.user + '.';
                target.setAttribute('data-perfilwiki-user', configured.user);
                target.setAttribute('data-perfilwiki-project', configured.project);
            }
            var readership = target && target.querySelector('.dan-pu-readership');
            if (readership && !currentMetricReadership(readership)) {
                var pending = win.document.createElement('div');
                pending.textContent = 'Consultando visualizações após sua primeira edição em cada artigo.';
                readership.replaceChildren(pending);
            }
            bindControls(); applyPeriodVisibility(); enhancePresentation();
        }
        mw.loader.using(['mediawiki.util']).then(function () {
            var refreshLink = mw.util.addPortletLink('p-tb', '#', 'Atualizar estatísticas', 't-perfilwiki-refresh');
            var downloadLink = mw.util.addPortletLink('p-tb', '#', 'Baixar painel atualizado', 't-perfilwiki-download');
            var cardsLink = mw.util.addPortletLink('p-tb', '#', 'Baixar contadores atualizados', 't-perfilwiki-cards');
            if (cardsLink) { cardsLink.addEventListener('click', function (event) { event.preventDefault(); downloadCards(); }); }
            if (refreshLink) { refreshLink.addEventListener('click', function (event) { event.preventDefault(); refresh(true); }); }
            if (downloadLink) { downloadLink.addEventListener('click', function (event) { event.preventDefault(); download(); }); }
            schedule(1500);
        });
    }
    win.PerfilWiki = Object.freeze({ version: '1.0.1', readOnly: true, refreshInterval: REFRESH,
        refresh: function () { return refresh(true); }, download: download, downloadActivity: download, downloadCards: downloadCards,
        getState: function () { return current ? JSON.parse(JSON.stringify(current)) : null; } });
    // Compatibility sentinels stop old loaders from starting a second scheduler.
    win.DanPURitmo = win.PerfilWiki; win.DanPUStats = win.PerfilWiki;
    win.addEventListener('storage', function (event) {
        if (event.key === PREFIX + 'cache') { var state = readCache(); if (state && state !== current && (!current || Date.parse(state.capturedAt) >= Date.parse(current.capturedAt))) { current = state; paint(state); } }
    });
    win.addEventListener('focus', function () { refresh(false); startClock(); queueImages(); });
    win.addEventListener('hashchange', function () { choosePeriod(periodFromHash() || '30d'); });
    win.document.addEventListener('visibilitychange', function () {
        if (!win.document.hidden) { refresh(false); startClock(); queueImages(); }
        else { win.clearTimeout(clockTimer); win.clearTimeout(imageTimer); }
    });
    win.addEventListener('pagehide', function () {
        suspended = true; lifecycle += 1; win.clearTimeout(timer); win.clearTimeout(clockTimer); win.clearTimeout(imageTimer);
        controllers.forEach(function (controller) { controller.abort(); });
        if (releaseActiveLease) { releaseActiveLease(); }
    });
    win.addEventListener('pageshow', function () { if (suspended) { suspended = false; schedule(1500); startClock(); queueImages(); } });
    if (mw.hook) { mw.hook('wikipage.content').add(begin); }
    if (win.document.readyState === 'loading') { win.document.addEventListener('DOMContentLoaded', begin, { once: true }); }
    else { begin(); }
}(window));
