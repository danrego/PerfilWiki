/* PerfilWiki 1.20.1. Shared scheduler and anonymous transport. Daniel G Rego, CC BY-SA 4.0. */
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
    var appearance = profileOptions.appearance, appearanceColors = win.PerfilWikiAppearance.colors(appearance);
    var defaultUser = false;
    var PREFIX = 'perfilwiki-v1-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-';
    if (win.PerfilWikiStyleText && !win.document.getElementById('perfilwiki-style-v1')) {
        var style = win.document.createElement('style'); style.id = 'perfilwiki-style-v1'; style.textContent = win.PerfilWikiStyleText;
        (win.document.head || win.document.documentElement).appendChild(style);
    }
    var REFRESH = 300000;
    var BLACKLIST_URL = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
    var queryAnchor = null, nextRequestAt = 0, nextActionRequestAt = 0;
    var API_USER_AGENT = 'PerfilWiki/1.20.1 (https://github.com/danrego/PerfilWiki)';
    var TRANSPORT_PREFIX = 'perfilwiki-transport-v1-', TRANSPORT_LOCK = 'perfilwiki-public-transport-v1';
    var JSON_RESPONSE_LIMIT = 8 * 1024 * 1024, BLACKLIST_RESPONSE_LIMIT = 256000;
    var periodKeys = ['30d', '90d', '12m', 'since', 'custom'];
    var visibleCounts = { '30d': 10, '90d': 10, '12m': 10, 'since': 10, 'custom':10 };
    var activePeriod = appearance.initialPeriod, priorityChanged = false;
    function periodFromHash() {
        var hash = win.location && win.location.hash || '';
        var match = /^#dan-pu-view-(30d|90d|12m|since|custom)$/.exec(hash);
        return match ? match[1] : null;
    }
    activePeriod = periodFromHash() || activePeriod;
    var current = null, started = false, running = false, suspended = false, timer;
    var lifecycle = 0, releaseActiveLease = null, nextCheck = 0;
    var cachedRaw = null, cachedState = null;
    var legacyPreviewApi = win.PerfilWikiLegacyStatsPreview, legacyPreview = null, legacyBootstrapAttempted = false;
    var legacyCardIds = {edits:'dan-pu-edicoes',thanks:'dan-pu-agradecimentos',articles:'dan-pu-artigos',
        bestStreak:'dan-pu-ritmo-melhor-sequencia',edited:'dan-pu-editados',technicalCreated:'dan-pu-criados-tecnicos',reverts:'dan-pu-reversoes'};
    var controllers = new Set(), pauses = Object.create(null);
    var active = 0, waiters = [];
    var images = Object.create(null), imageAttempts = Object.create(null), brokenImages = new Set();
    var imagesLoaded = false, imagesInFlight = false, imageTimer, clockTimer, imageRequests = 0, imageCycleStarted = false;
    var dailyCoverApi=win.PerfilWikiDailyCover,dailyCover=null,dailyCoverInFlight=null;
    function storageGet(key) { try { return win.localStorage.getItem(PREFIX + key); } catch (_) { return null; } }
    var largeCache = win.PerfilWikiLargeCache, cacheRestore = null, hasAdvancedCurrent = false;
    var localRevision = 0, appliedLocalRevision = 0, cacheSequence = 0, committedSequence = 0, currentCheckpoint = 0;
    var checkpointAnchor = -Infinity, checkpointOrdinal = 0, CHECKPOINT_LIMIT = 1000000;
    var lastQueuedAnchor = -Infinity, lastCommittedAnchor = -Infinity, lastProgressSaveAt = -Infinity;
    var cacheSaveQueue = Promise.resolve(), cacheWarningShown = false;
    function storageSet(key, value) {
        try { win.localStorage.setItem(PREFIX + key, value); return true; }
        catch (_) { return false; }
    }
    function checkpointNumber(state) { return state && state.cacheCheckpoint ? state.cacheCheckpoint.sequence : 0; }
    function seedCheckpoint(state) {
        if (!state) { return; }
        var anchor = Date.parse(state.capturedAt), sequence = checkpointNumber(state);
        if (anchor > checkpointAnchor) { checkpointAnchor = anchor; checkpointOrdinal = sequence; }
        else if (anchor === checkpointAnchor) { checkpointOrdinal = Math.max(checkpointOrdinal,sequence); }
    }
    function warnCacheFailure() {
        if (cacheWarningShown) { return; }
        cacheWarningShown = true;
        notify('O navegador não guardou esta consulta. Os resultados continuam disponíveis nesta aba.', 'warn');
    }
    function saveCache(state, force) {
        var now = Date.now(), anchor = state && Date.parse(state.capturedAt);
        if (!state || !Number.isFinite(anchor) || anchor < lastQueuedAnchor ||
            !force && now - lastProgressSaveAt < 15000) { return cacheSaveQueue; }
        seedCheckpoint(state);
        if (anchor < checkpointAnchor || checkpointOrdinal + 1 >= CHECKPOINT_LIMIT) { warnCacheFailure(); return cacheSaveQueue; }
        lastProgressSaveAt = now; lastQueuedAnchor = anchor;
        var sequence = ++cacheSequence, ordinal = ++checkpointOrdinal, raw;
        var persisted = Object.assign({},state,{cacheCheckpoint:{schema:1,sequence:ordinal}});
        if (state === current) { currentCheckpoint = ordinal; }
        // Serialize only accepted checkpoints. The immutable string also keeps
        // a collector's later mutations out of an older asynchronous write.
        try { raw = JSON.stringify(persisted); }
        catch (_) { warnCacheFailure(); return cacheSaveQueue; }
        cacheSaveQueue = cacheSaveQueue.catch(function () {}).then(async function () {
            if (anchor < lastCommittedAnchor || anchor === lastCommittedAnchor && sequence <= committedSequence) { return false; }
            var packed;
            try { packed = codec.packJson(raw); }
            catch (_) { warnCacheFailure(); return false; }
            var localSaved = storageSet('cache',packed), largeSaved = false;
            if (localSaved) {
                if (packed !== cachedRaw) { localRevision += 1; }
                cachedRaw = packed; cachedState = persisted; appliedLocalRevision = localRevision;
            }
            // Mirroring successful local writes prevents an older same-anchor
            // IndexedDB checkpoint from winning during a subsequent visit.
            if (largeCache && typeof largeCache.put === 'function') {
                try { largeSaved = await largeCache.put(PREFIX + 'cache',packed,state.capturedAt) === true; } catch (_) {}
            }
            if (localSaved || largeSaved) {
                lastCommittedAnchor = anchor; committedSequence = sequence;
                return true;
            }
            warnCacheFailure(); return false;
        });
        return cacheSaveQueue;
    }
    function applyLocalCache(state) {
        if (!state) { return; }
        var anchor = Date.parse(state.capturedAt), currentAnchor = current && Date.parse(current.capturedAt);
        var ordinal = checkpointNumber(state);
        if (!current || anchor > currentAnchor || anchor === currentAnchor &&
            (ordinal > currentCheckpoint || !ordinal && !currentCheckpoint && localRevision > appliedLocalRevision)) {
            current = state; currentCheckpoint = ordinal; hasAdvancedCurrent = true; appliedLocalRevision = localRevision;
            lastCommittedAnchor = Math.max(lastCommittedAnchor,anchor); paint(current);
        }
    }
    function restoreLargeCache() {
        if (cacheRestore) { return cacheRestore; }
        if (!largeCache || typeof largeCache.get !== 'function') { cacheRestore = Promise.resolve(); return cacheRestore; }
        var epoch = lifecycle, initialSequence = cacheSequence, initialRevision = localRevision;
        cacheRestore = Promise.resolve().then(function () { return largeCache.get(PREFIX + 'cache'); }).then(function (raw) {
            if (suspended || epoch !== lifecycle) { return; }
            var restored = validatedCache(raw,false);
            if (!restored) { return; }
            var anchor = Date.parse(restored.capturedAt), currentAnchor = current && Date.parse(current.capturedAt), ordinal = checkpointNumber(restored);
            seedCheckpoint(restored);
            if (!current || anchor > currentAnchor || anchor === currentAnchor && !hasAdvancedCurrent &&
                cacheSequence === initialSequence && localRevision === initialRevision &&
                (ordinal > currentCheckpoint || !ordinal && !currentCheckpoint)) {
                current = restored; currentCheckpoint = ordinal; hasAdvancedCurrent = true; appliedLocalRevision = localRevision;
                lastCommittedAnchor = Math.max(lastCommittedAnchor,anchor);
                paint(current);
            }
        }).catch(function () {});
        return cacheRestore;
    }
    function validatedCache(raw, upgrade) {
        try {
            if (!raw || raw.length > 4000000) { return null; }
            var state = codec.parseJson(raw);
            if (state.cacheCheckpoint !== undefined) {
                var checkpoint = state.cacheCheckpoint;
                if (!checkpoint || typeof checkpoint !== 'object' || Array.isArray(checkpoint) ||
                    Object.keys(checkpoint).sort().join(',') !== 'schema,sequence' || checkpoint.schema !== 1 ||
                    !Number.isInteger(checkpoint.sequence) || checkpoint.sequence < 1 || checkpoint.sequence >= CHECKPOINT_LIMIT) { return null; }
            }
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
        if (cached) { seedCheckpoint(cached); }
        if (cached && raw !== cachedRaw) { localRevision += 1; }
        cachedRaw = cached ? raw : null; cachedState = cached;
        if (cached) { return cached; }
        var legacyKeys = ['dan-pu-ritmo-v8-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-cache', 'dan-pu-ritmo-v8-cache', 'dan-pu-ritmo-v7-cache', 'dan-pu-ritmo-v6-cache', 'dan-pu-ritmo-v5-cache', 'dan-pu-ritmo-v4-cache', 'dan-pu-ritmo-v3-cache'];
        for (var index = 0; index < legacyKeys.length; index += 1) {
            try {
                var legacyRaw = win.localStorage.getItem(legacyKeys[index]);
                var upgraded = validatedCache(legacyRaw, false) || validatedCache(legacyRaw, true);
                if (upgraded) { seedCheckpoint(upgraded); return upgraded; }
            } catch (_) { /* Try the other strictly validated legacy cache. */ }
        }
        return null;
    }
    function readLegacyCounters() {
        if (!legacyPreviewApi || !appearance.showCards) { return; }
        [PREFIX+'legacy-counter-source-v1','dan-pu-estatisticas-v15-cache','dan-pu-estatisticas-v14-cache'].forEach(function (key) {
            try {
                var candidate = legacyPreviewApi.normalize(win.localStorage.getItem(key),{user:configured.user,now:Date.now()});
                if (!candidate) { return; }
                if (!legacyPreview) { legacyPreview = candidate; return; }
                Object.keys(candidate.metrics).forEach(function (metric) {
                    var old = legacyPreview.metrics[metric], fresh = candidate.metrics[metric];
                    if (!old || Date.parse(fresh.savedAt) > Date.parse(old.savedAt)) { legacyPreview.metrics[metric] = fresh; }
                });
            } catch (_) { /* Unknown legacy data never enters the collector. */ }
        });
    }
    function paintLegacyCounters() {
        if (legacyPreviewApi && legacyPreview) {
            legacyPreviewApi.paint(win.document,legacyPreview,current&&current.statistics,
                {user:configured.user,language:appearance.language,now:Date.now(),activity:current&&current.activity});
        }
    }
    function legacyBootstrapDue() {
        if (!legacyPreviewApi || !appearance.showCards || legacyBootstrapAttempted) { return false; }
        return appearance.metrics.some(function (key) {
            var element = legacyCardIds[key] && win.document.getElementById(legacyCardIds[key]);
            return element && !/\d/.test(element.textContent || '');
        });
    }
    async function bootstrapLegacyCounters(epoch) {
        legacyBootstrapAttempted = true;
        try {
            var title = 'Usuário:'+configured.user+'/PU/Estatísticas', url = new URL('https://pt.wikipedia.org/w/api.php');
            var params = {action:'query',format:'json',formatversion:'2',origin:'*',maxlag:'5',prop:'revisions',titles:title,rvprop:'content',rvslots:'main'};
            Object.keys(params).forEach(function (key) { url.searchParams.set(key,params[key]); });
            var response = await sharedRequestJson(url.toString(),epoch), pages = response.query && response.query.pages;
            checkLifecycle(epoch);
            if (response.batchcomplete !== true || response.continue || !Array.isArray(pages) || pages.length !== 1) { return false; }
            var page = pages[0], revision = page && page.revisions && page.revisions[0], slot = revision && revision.slots && revision.slots.main;
            if (!page || page.title !== title || page.ns !== 2 || page.missing || page.invalid ||
                !Array.isArray(page.revisions) || page.revisions.length !== 1 || !slot || slot.contentmodel !== 'wikitext' ||
                typeof slot.content !== 'string' || slot.content.length > 260000) { return false; }
            var preview = legacyPreviewApi.fromWikitext(slot.content,{user:configured.user,now:Date.now()});
            if (!preview) { return false; }
            legacyPreview = preview;
            var marker = '<noinclude><syntaxhighlight lang="json">\n', start = slot.content.indexOf(marker), end = slot.content.indexOf('\n</syntaxhighlight></noinclude>',start);
            if (start >= 0 && end >= 0) { storageSet('legacy-counter-source-v1',slot.content.slice(start+marker.length,end)); }
            paintLegacyCounters(); return true;
        } catch (_) { return false; }
    }
    function rememberDailyCover(value) {
        var checked=dailyCoverApi&&dailyCoverApi.normalize(value,Date.now());
        if(!checked)return false;
        if(!dailyCover||checked.date>dailyCover.date||checked.date===dailyCover.date&&checked.checkedAt>dailyCover.checkedAt){dailyCover=checked;return true;}
        return false;
    }
    function readDailyCover() {
        if(appearance.coverSource!=='daily'||!dailyCoverApi)return;
        try{var raw=storageGet('daily-cover-v1');if(raw&&raw.length<=4096)rememberDailyCover(JSON.parse(raw));}catch(_){}
        var root=win.document.getElementById('dan-pu-profile-header');
        if(root&&root.getAttribute('data-perfilwiki-user')===configured.user&&root.querySelector){var cover=root.querySelector('.dan-pu-profile-cover');try{if(cover)rememberDailyCover(JSON.parse(cover.getAttribute('data-perfilwiki-daily-cover')||'null'));}catch(_){}}
    }
    function dailyCoverEnabled() {
        if(appearance.coverSource!=='daily'||!dailyCoverApi||win.document.hidden)return false;
        var root=win.document.getElementById('dan-pu-profile-header');
        return !!(root&&root.getAttribute('data-perfilwiki-user')===configured.user&&!root.hidden&&(!root.style||root.style.display!=='none'));
    }
    function dailyCoverDue() {
        if(!dailyCoverEnabled())return false;
        readDailyCover();
        var now=Date.now(),deadline=Number(storageGet('daily-cover-retry-v1'))||0;
        return (!dailyCover||dailyCover.date!==dailyCoverApi.today(now))&&(!Number.isFinite(deadline)||deadline<=now||deadline>now+REFRESH+60000);
    }
    function collectDailyCover(epoch) {
        if(dailyCoverInFlight)return dailyCoverInFlight;
        if(!dailyCoverDue())return Promise.resolve(false);
        var date=dailyCoverApi.today(Date.now()),url=dailyCoverApi.url(date,Date.now());
        if(!url)return Promise.resolve(false);
        storageSet('daily-cover-retry-v1',String(Date.now()+REFRESH));
        dailyCoverInFlight=(async function(){
            try{
                var data=await requestJson(url,epoch);checkLifecycle(epoch);
                var proof=dailyCoverApi.fromFeed(data,date,Date.now());if(!proof)throw new Error('Imagem do dia indisponível.');
                rememberDailyCover(proof);storageSet('daily-cover-v1',JSON.stringify(dailyCover));storageSet('daily-cover-retry-v1','0');
                paintHeader(current);patchProfilePhotos();return true;
            }catch(_){return false;}
            finally{dailyCoverInFlight=null;}
        }());
        return dailyCoverInFlight;
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
    function patchProfilePhotos() {
        var coverFilename=appearance.coverSource==='wiki-daily'?'':appearance.coverSource==='daily'?dailyCover&&dailyCover.filename:profileOptions.coverImage;
        if (!profileOptions.photo && !coverFilename) { return; }
        ['dan-pu-estatisticas', 'dan-pu-ritmo', 'dan-pu-profile-header'].forEach(function (id) {
            var root = win.document.getElementById(id);
            if (!root || root.getAttribute('data-perfilwiki-user') !== configured.user || typeof root.querySelectorAll !== 'function') { return; }
            [{filename:profileOptions.photo,slot:'.dan-pu-profile-photo',attribute:'data-perfilwiki-photo',image:'img.dan-pu-profile-photo-image',fallback:'.dan-pu-profile-photo-placeholder'},
                {filename:coverFilename,slot:'.dan-pu-profile-cover',attribute:'data-perfilwiki-cover',image:'img.dan-pu-profile-cover-image',fallback:'.dan-pu-profile-cover-placeholder'}].forEach(function(kind){
                if(!kind.filename)return;
                Array.from(root.querySelectorAll(kind.slot)).forEach(function (slot) {
                    if (slot.getAttribute(kind.attribute) !== kind.filename) { return; }
                    var image = slot.querySelector(kind.image), fallback = slot.querySelector(kind.fallback);
                    if (!image || !fallback) { return; }
                    function unavailable() {
                        image.hidden = true; image.style.display = 'none';
                        if(kind.attribute==='data-perfilwiki-cover'&&slot.classList)slot.classList.add('is-unavailable');
                        fallback.hidden = false; fallback.removeAttribute('hidden');
                    }
                    if (!image.perfilWikiPhotoBound) {
                        image.perfilWikiPhotoBound = true;
                        image.addEventListener('error', unavailable, {once:true});
                    }
                    // A cached failure can finish before this owner's script runs.
                    if (image.complete && image.naturalWidth === 0 && image.getAttribute('src')) { unavailable(); }
                });
            });
        });
    }
    function updateClock() {
        if (suspended || win.document.hidden) { return; }
        if (appearance.showLocalTime && win.PerfilWikiProfileClock) { win.PerfilWikiProfileClock.update(win.document, Date.now(), configured.user, configured.timeZone, appearance.language); }
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
        if (!suspended && !win.document.hidden && (win.document.getElementById('dan-pu-ritmo') || appearance.showLocalTime && hasPanel())) {
            clockTimer = win.setTimeout(function () { startClock(); }, 60020 - Date.now() % 60000);
        }
    }
    function queueImages() {
        win.clearTimeout(imageTimer);
        if (suspended || imagesInFlight || imageRequests >= 1 || win.document.hidden || !imageSlots().length) { return; }
        imageTimer = win.setTimeout(function () { collectImages(); }, 1800);
    }
    async function collectImages() {
        if (suspended || imagesInFlight || imageRequests >= 1 || win.document.hidden) { return; }
        var epoch = lifecycle, requested = [], seen = new Set(), now = Date.now();
        imageSlots().forEach(function (slot) {
            var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
            var attempt = imageAttempts[row.pageid];
            if (Number.isSafeInteger(row.pageid) && row.pageid > 0 && row.title && row.title.length <= 512 && !seen.has(row.pageid) && requested.length < 50 &&
                !presenter.imageFor(images, row) && !(attempt && attempt.title === row.title && now - attempt.at < 3600000)) {
                seen.add(row.pageid); requested.push(row); imageAttempts[row.pageid] = { title: row.title, at: now };
            }
        });
        var url = presenter.imageRequest(requested);
        if (!url) { return; }
        imagesInFlight = true; imageRequests += 1;
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
        patchProfilePhotos(); patchImages(); startClock(); queueImages();
    }
    function bindControls() {
        var customApply = win.document.getElementById('dan-pu-custom-apply');
        if (customApply && !customApply.danPURitmoBound) {
            function applyCustom(event) {
                if(event&&event.preventDefault)event.preventDefault();
                var start=win.document.getElementById('dan-pu-custom-start'),end=win.document.getElementById('dan-pu-custom-end'),error=win.document.getElementById('dan-pu-custom-error');
                try {
                    var range=core.normalizeCustomRange({start:start&&start.value,end:end&&end.value},Date.now());
                    appearance=win.PerfilWikiAppearance.normalize(Object.assign({},appearance,{customRange:range,initialPeriod:'custom'}));
                    profileOptions.appearance=appearance;activePeriod='custom';visibleCounts.custom=10;priorityChanged=true;
                    if(error)error.textContent='';
                    if(start)start.setAttribute('aria-invalid','false');if(end)end.setAttribute('aria-invalid','false');
                    if(current)paint(current);else applyPeriodVisibility();
                    if(started&&!running&&!suspended)refresh(false,true);
                } catch(failure) {if(error)error.textContent=failure.message||'Confira as datas do intervalo.';if(start)start.setAttribute('aria-invalid','true');if(end)end.setAttribute('aria-invalid','true');}
            }
            customApply.addEventListener('click',applyCustom);
            if(customApply.form)customApply.form.addEventListener('submit',applyCustom);
            customApply.danPURitmoBound=true;
        }
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
                button.style.cssText = 'border:0;background:none;color:' + appearanceColors.ink + ';font:inherit;padding:0;cursor:pointer;text-decoration:underline;';
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
                pill.style.background = selected ? appearanceColors.tint : '#fff';
                pill.style.borderColor = selected ? appearanceColors.ink : '#c8ccd1';
                pill.style.color = selected ? appearanceColors.ink : '#54595d';
                pill.style.fontWeight = selected ? '600' : '400';
                pill.setAttribute('aria-current', selected ? 'true' : 'false');
            }
        });
    }
    function choosePeriod(key) {
        if (periodKeys.indexOf(key) < 0) { return; }
        if(key==='custom'&&!appearance.customRange) {
            var defaults=core.periodsFor(Date.now())['30d'];
            appearance=win.PerfilWikiAppearance.normalize(Object.assign({},appearance,{customRange:{start:defaults.start,end:defaults.end}}));
            profileOptions.appearance=appearance;if(current)paint(current);
        }
        var changed = key !== activePeriod;
        activePeriod = key; applyPeriodVisibility();
        var customReady=current&&current.pageviews&&JSON.stringify(current.pageviews.customRange)===JSON.stringify(appearance.customRange)&&current.pageviews.periods.custom&&current.pageviews.periods.custom.complete;
        if (!changed || !current || !current.pageviews || (key==='custom'?customReady:current.pageviews.allPeriodsComplete)) { return; }
        priorityChanged = true;
        if (started && !running && !suspended) { refresh(false, true); }
    }
    function currentMetricReadership(element) {
        return element && element.getAttribute('data-perfilwiki-user') === configured.user && element.getAttribute('data-perfilwiki-project') === 'pt.wikipedia.org' && element.getAttribute('data-metric-version') === 'after-first-edit-v1' &&
            element.getAttribute('data-total-model') === 'all-periods-all-eligible-v1';
    }
    function applyBlockOrder() {
        if (win.PerfilWikiLayoutView) { win.PerfilWikiLayoutView.arrange(win.document, appearance, configured.user); }
        if (appearance.layout !== 'together' || typeof win.document.querySelectorAll !== 'function') { return; }
        Array.from(win.document.querySelectorAll('[data-perfilwiki-group="true"]')).forEach(function (group) {
            if (group.getAttribute('data-perfilwiki-user') !== configured.user || typeof group.querySelector !== 'function') { return; }
            var cards = group.querySelector('#dan-pu-estatisticas'), activity = group.querySelector('#dan-pu-ritmo');
            // Only the installer-created group owns this order. Existing user
            // prose and separately placed blocks never enter this operation.
            if (!cards || !activity || cards.parentNode !== group || activity.parentNode !== group ||
                cards.getAttribute('data-perfilwiki-user') !== configured.user || activity.getAttribute('data-perfilwiki-user') !== configured.user) { return; }
            var first = appearance.blockOrder === 'activity-first' ? activity : cards;
            var second = first === activity ? cards : activity;
            var children = Array.from(group.children);
            if (children.indexOf(first) > children.indexOf(second)) { group.insertBefore(first, second); }
        });
    }
    function synchronizeActivityFooter() {
        var target = win.document.getElementById('dan-pu-ritmo');
        if (!target || typeof target.querySelector !== 'function' || typeof target.appendChild !== 'function') { return; }
        var footer = target.querySelector('#dan-pu-ritmo-install');
        if (win.PerfilWikiAppearance.footerOwner(appearance) !== 'activity') {
            if (footer && footer.parentNode) { footer.parentNode.removeChild(footer); }
            return;
        }
        if (!footer) {
            footer = win.document.createElement('div'); footer.id = 'dan-pu-ritmo-install';
            footer.style.cssText = 'margin-top:18px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;';
            target.appendChild(footer);
        }
        var link = footer.querySelector('a');
        if (!link) { footer.textContent = 'Gostou deste painel? '; link = win.document.createElement('a'); footer.appendChild(link); }
        link.href = 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(profileOptions.documentationPage.replace(/ /g, '_'));
        link.textContent = 'Veja como adicionar à sua página de usuário.';
        link.style.color = appearanceColors.ink; link.style.textDecoration = 'none';
    }
    function customDraft(root) {
        if(!root||root.getAttribute('data-perfilwiki-user')!==configured.user)return null;
        var start=win.document.getElementById('dan-pu-custom-start'),end=win.document.getElementById('dan-pu-custom-end'),error=win.document.getElementById('dan-pu-custom-error');
        if(!start||!end||root.contains&&(!root.contains(start)||!root.contains(end)))return null;
        var focused=win.document.activeElement,ids=['dan-pu-custom-start','dan-pu-custom-end','dan-pu-custom-apply'];
        return {user:configured.user,start:start.value,end:end.value,error:error&&error.textContent||'',invalidStart:start.getAttribute('aria-invalid'),invalidEnd:end.getAttribute('aria-invalid'),
            focus:focused&&ids.indexOf(focused.id)>=0?focused.id:null};
    }
    function restoreCustomDraft(saved) {
        if(!saved||saved.user!==configured.user)return;
        var root=win.document.getElementById('dan-pu-ritmo'),start=win.document.getElementById('dan-pu-custom-start'),end=win.document.getElementById('dan-pu-custom-end'),error=win.document.getElementById('dan-pu-custom-error');
        if(!root||root.getAttribute('data-perfilwiki-user')!==saved.user||!start||!end)return;
        start.value=saved.start;end.value=saved.end;if(error)error.textContent=saved.error;
        [['aria-invalid',start,saved.invalidStart],['aria-invalid',end,saved.invalidEnd]].forEach(function(item){if(item[2]===null)item[1].removeAttribute(item[0]);else item[1].setAttribute(item[0],item[2]);});
        var focused=saved.focus&&win.document.getElementById(saved.focus);if(focused&&focused.focus)focused.focus({preventScroll:true});
    }
    function detachNestedCards(target) {
        var cards = target && target.querySelector && target.querySelector('#dan-pu-estatisticas');
        if (!cards || cards.getAttribute('data-perfilwiki-user') !== configured.user || !target.parentNode) { return null; }
        // Activity is repainted as a whole. Keep the actual counters node alive,
        // including profile metadata and any last-known-good statistics.
        target.parentNode.insertBefore(cards, target);
        return cards;
    }
    function retainedAccountCreated() {
        if (!view.captureAccountCreated) { return null; }
        return view.captureAccountCreated(win.document.getElementById('dan-pu-ritmo'), configured.user, Date.now()) ||
            view.captureAccountCreated(win.document.getElementById('dan-pu-estatisticas'), configured.user, Date.now()) ||
            view.captureAccountCreated(win.document.getElementById('dan-pu-profile-header'), configured.user, Date.now());
    }
    function headerPresentation() {
        return {user:configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,
            customFields:profileOptions.customFields,appearance:appearance,now:Date.now(),documentationPage:profileOptions.documentationPage,savedAccountCreated:retainedAccountCreated()};
    }
    function paintHeader(state,savedCreated) {
        var presentation=headerPresentation();if(savedCreated)presentation.savedAccountCreated=savedCreated;
        if (win.PerfilWikiProfileHeaderView) { win.PerfilWikiProfileHeaderView.paint(win.document,state,presentation); }
        if (appearance.showLocalTime) { startClock(); }
    }
    function restoreNestedCards(cards) {
        if (!cards || appearance.layout !== 'integrated' || !appearance.showCards || !appearance.showActivity) { return; }
        var target = win.document.getElementById('dan-pu-ritmo');
        var slot = target && target.querySelector && target.querySelector('#dan-pu-integrated-cards');
        if (target && target.getAttribute('data-perfilwiki-user') === configured.user && slot) { slot.appendChild(cards); }
    }
    function paint(state) {
        var retainedCreated=retainedAccountCreated();
        if (state && win.PerfilWikiCardsView) { win.PerfilWikiCardsView.paint(win.document, state.statistics, state.activity, Date.now(), appearance, {user:configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,customFields:profileOptions.customFields,appearance:appearance,now:Date.now(),documentationPage:profileOptions.documentationPage}); }
        paintLegacyCounters();
        paintHeader(state,retainedCreated);
        patchProfilePhotos();
        applyBlockOrder(); synchronizeActivityFooter();
        var target = win.document.getElementById('dan-pu-ritmo');
        if (target) { target.style.display = appearance.showActivity ? '' : 'none'; }
        if (!appearance.showActivity) { return; }
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
        var stagedCustom=customDraft(target);
        var savedAccountCreated = retainedAccountCreated() || retainedCreated;
        var retainedCards = detachNestedCards(target);
        target.outerHTML = view.html(state, { visibleCounts: visibleCounts, images: images, now: Date.now(), displayName:profileOptions.displayName, location:profileOptions.location, photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover, customFields:profileOptions.customFields, stylesPage: profileOptions.stylesPage, documentationPage: profileOptions.documentationPage, appearance:appearance, savedAccountCreated:savedAccountCreated });
        restoreNestedCards(retainedCards);
        applyBlockOrder(); synchronizeActivityFooter();
        paintHeader(state);
        if (preserved) {
            var updated = win.document.getElementById('dan-pu-ritmo');
            var readership = updated && updated.querySelector('.dan-pu-readership');
            if (readership) {
                readership.replaceWith(preserved);
                var preservedHeading = preserved.querySelector('.dan-pu-readership-heading') || preserved.firstElementChild;
                if (preservedHeading) { preservedHeading.textContent = 'Visualizações dos artigos editados por ' + profileOptions.displayName + '.'; }
                Array.from(preserved.querySelectorAll('a')).forEach(function (link) { link.style.color = appearanceColors.ink; });
            }
        }
        var best = win.document.getElementById('dan-pu-ritmo-melhor-sequencia');
        if (best) { var days = state.activity.summary.bestStreak; best.textContent = new Intl.NumberFormat('pt-BR').format(days) + (days === 1 ? ' dia' : ' dias'); }
        bindControls(); applyPeriodVisibility();restoreCustomDraft(stagedCustom);
        if (helpOpen) {
            var nextTarget = win.document.getElementById('dan-pu-ritmo');
            var nextHelp = nextTarget && nextTarget.querySelector('details.dan-pu-data-help');
            if (nextHelp) { nextHelp.open = true; }
        }
        enhancePresentation();
        paintLegacyCounters();
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
            var shared = JSON.parse(transportGet('pausas') || storageGet('pausas') || '{}');
            if (shared && typeof shared === 'object' && !Array.isArray(shared)) {
                Object.keys(shared).forEach(function (key) { if (Number.isFinite(shared[key])) { pauses[key] = Math.max(pauses[key] || 0, shared[key]); } });
            }
        } catch (_) { /* Use the in-memory pause. */ }
        if (until !== undefined) { pauses[origin] = Math.max(pauses[origin] || 0, until); transportSet('pausas', JSON.stringify(pauses)); }
        return pauses[origin] || 0;
    }
    function checkLifecycle(epoch) {
        if (suspended || epoch !== lifecycle) {
            var error = new Error('Página suspensa.'); error.code = 'aborted'; throw error;
        }
    }
    function responseLimitError() { var error = new Error('A resposta pública excedeu o limite de tamanho.'); error.code = 'response-too-large'; return error; }
    function utf8Length(text) {
        var bytes = 0;
        for (var index = 0; index < text.length; index += 1) {
            var code = text.charCodeAt(index);
            if (code < 128) { bytes += 1; }
            else if (code < 2048) { bytes += 2; }
            else if (code >= 0xd800 && code <= 0xdbff && index+1 < text.length && text.charCodeAt(index+1) >= 0xdc00 && text.charCodeAt(index+1) <= 0xdfff) { bytes += 4; index += 1; }
            else { bytes += 3; }
        }
        return bytes;
    }
    async function responseText(response, limit, epoch) {
        var length = response.headers && response.headers.get && response.headers.get('Content-Length');
        if (length !== null && length !== undefined && /^\d+$/.test(length) && Number(length) > limit) { throw responseLimitError(); }
        // Browser responses are bounded while streaming, before building a string
        // or parsing JSON. The text/json fallback supports older test adapters.
        if (response.body && typeof response.body.getReader === 'function') {
            var reader = response.body.getReader(), decoder = new TextDecoder(), pieces = [], size = 0, finished = false;
            try {
                while (true) {
                    checkLifecycle(epoch);
                    var chunk = await reader.read(); checkLifecycle(epoch);
                    if (chunk.done) { finished = true; break; }
                    size += chunk.value.byteLength;
                    if (size > limit) { throw responseLimitError(); }
                    pieces.push(decoder.decode(chunk.value, {stream:true}));
                }
                pieces.push(decoder.decode()); return pieces.join('');
            } finally {
                if (!finished) { try { await reader.cancel(); } catch (_) {} }
                if (typeof reader.releaseLock === 'function') { reader.releaseLock(); }
            }
        }
        var text = typeof response.text === 'function' ? await response.text() : JSON.stringify(await response.json());
        checkLifecycle(epoch);
        if (typeof text !== 'string' || text.length > limit || utf8Length(text) > limit) { throw responseLimitError(); }
        return text;
    }
    function retryDeadline(response, fallback) {
        var retry = response.headers && response.headers.get && response.headers.get('Retry-After');
        var delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 :
            retry && Number.isFinite(Date.parse(retry)) ? Date.parse(retry) - Date.now() : fallback;
        return Date.now() + Math.max(5000, Number.isFinite(delay) ? delay : fallback);
    }
    function actionDeadline() {
        var shared = Number(transportGet('action-next-v1')) || 0;
        if (Number.isFinite(shared) && shared <= Date.now()+65000) { nextActionRequestAt = Math.max(nextActionRequestAt,shared); }
        return nextActionRequestAt;
    }
    function waitForRequest(milliseconds, controller, epoch) {
        if (!milliseconds) { return Promise.resolve(); }
        return new Promise(function (resolve,reject) {
            var timeout;
            function abort() { win.clearTimeout(timeout); controller.signal.removeEventListener('abort',abort); var error=new Error('Página suspensa.'); error.code='aborted'; reject(error); }
            controller.signal.addEventListener('abort',abort,{once:true});
            timeout=win.setTimeout(function () { controller.signal.removeEventListener('abort',abort); try {checkLifecycle(epoch);resolve();} catch(error) {reject(error);} },milliseconds);
            if (controller.signal.aborted) { abort(); }
        });
    }
    function transportGet(key) {try {return win.localStorage.getItem(TRANSPORT_PREFIX+key);}catch(_){return null;}}
    function transportSet(key,value) {try {win.localStorage.setItem(TRANSPORT_PREFIX+key,value);return win.localStorage.getItem(TRANSPORT_PREFIX+key)===value;}catch(_){return false;}}
    async function withTransportLock(task,controller,epoch) {
        // Only PerfilWiki instances from this browser origin share this lock.
        // Account, timezone and optional thumbnail entry points use the same name.
        var timingAvailable=transportSet('timing-available','1');
        if(win.navigator&&win.navigator.locks&&typeof win.navigator.locks.request==='function') {
            return win.navigator.locks.request(TRANSPORT_LOCK,{signal:controller.signal},async function(){
                checkLifecycle(epoch);
                try{return await task();}
                finally {
                    // With storage blocked, retain the timing boundary by holding
                    // this origin's lock. The page can still collect in memory.
                    if(!timingAvailable&&!suspended&&epoch===lifecycle) {
                        var until=Math.max(nextRequestAt,nextActionRequestAt);
                        Object.keys(pauses).forEach(function(origin){until=Math.max(until,pauses[origin]);});
                        if(until>Date.now()) {
                            var cooldown=new AbortController();controllers.add(cooldown);
                            try{await waitForRequest(until-Date.now(),cooldown,epoch);}
                            finally{controllers.delete(cooldown);}
                        }
                    }
                }
            });
        }
        // Browsers without Web Locks use a short verified storage claim. If the
        // claim is unavailable or lost, keep the displayed data and do not fetch.
        if(!timingAvailable)throw new Error('Consulta pausada.');
        var key='bloqueio',now=Date.now(),lease;
        try{lease=JSON.parse(transportGet(key)||'null');}catch(_){lease=null;}
        if(lease&&Number.isFinite(lease.expires)&&lease.expires>now&&lease.expires<=now+180000)throw new Error('Consulta pausada.');
        var token=now+'-'+Math.random().toString(36).slice(2),heartbeat;
        function owns(){try{return JSON.parse(transportGet(key)||'null').token===token;}catch(_){return false;}}
        function release(){if(heartbeat)win.clearInterval(heartbeat);if(owns())transportSet(key,JSON.stringify({token:token,expires:0}));}
        if(!transportSet(key,JSON.stringify({token:token,expires:now+120000})))throw new Error('Consulta pausada.');
        try {
            await waitForRequest(50,controller,epoch);checkLifecycle(epoch);
            if(!owns())throw new Error('Consulta pausada.');
            heartbeat=win.setInterval(function(){if(owns())transportSet(key,JSON.stringify({token:token,expires:Date.now()+120000}));},30000);
            return await task();
        }finally{release();}
    }
    async function requestJson(url, requestEpoch) {
        var epoch = requestEpoch === undefined ? lifecycle : requestEpoch;
        checkLifecycle(epoch);
        if (!requestAllowed(url)) { throw new Error('A consulta não pertence às fontes públicas do painel.'); }
        if (active >= 1) { await new Promise(function (resolve) { waiters.push(resolve); }); } else { active += 1; }
        var controller = new AbortController(); controllers.add(controller);
        async function dispatch() {
            var timeout, requestStartedAt=null, actionApi=new URL(url).pathname==='/w/api.php';
            try {
                checkLifecycle(epoch);
            var origin = new URL(url).origin;
            if (servicePause(origin) > Date.now()) { throw new Error('O serviço pediu uma pausa nas consultas.'); }
            var sharedStart=Number(transportGet('next-start-v1'))||0;
            if(Number.isFinite(sharedStart)&&sharedStart<=Date.now()+65000)nextRequestAt=Math.max(nextRequestAt,sharedStart);
            var wait = Math.max(0, nextRequestAt - Date.now(), actionApi ? actionDeadline() - Date.now() : 0);
            await waitForRequest(wait,controller,epoch);
            checkLifecycle(epoch);
            if (servicePause(origin) > Date.now()) { throw new Error('Consulta pausada.'); }
            timeout = win.setTimeout(function () { controller.abort(); }, 20000);
            var requestOptions={ method:'GET',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal };
            if (actionApi) { requestOptions.headers = {'Api-User-Agent':API_USER_AGENT}; }
            requestStartedAt = Date.now(); nextRequestAt = requestStartedAt + 500; transportSet('next-start-v1',String(nextRequestAt));
            var response = await win.fetch(url,requestOptions);
            checkLifecycle(epoch);
            if (response.redirected || response.type === 'opaqueredirect' || response.type === 'opaque' || response.url && canonicalRequest(response.url) !== canonicalRequest(url)) { throw new Error('A consulta pública foi redirecionada.'); }
            if (!response.ok) {
                if (response.status === 429 || response.status === 503) {
                    servicePause(origin, retryDeadline(response, REFRESH));
                }
                var httpError = new Error('HTTP ' + response.status); httpError.code = response.status;
                if (response.status === 404) {
                    httpError.status = 404;
                    var requestUrl = new URL(url);
                    if (requestUrl.origin === 'https://wikimedia.org' && requestUrl.pathname.indexOf('/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/') === 0) {
                        httpError.requestUrl = url;
                        try { httpError.problem = JSON.parse(await responseText(response,JSON_RESPONSE_LIMIT,epoch)); } catch (_) { /* A proxy response is not analytics evidence. */ }
                    }
                }
                throw httpError;
            }
            if (url === BLACKLIST_URL) {
                var sourceText = await responseText(response,BLACKLIST_RESPONSE_LIMIT,epoch);
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
            var data = JSON.parse(await responseText(response,JSON_RESPONSE_LIMIT,epoch));
            checkLifecycle(epoch);
            if (!data || typeof data !== 'object' || Array.isArray(data)) { throw new Error('Resposta pública inválida.'); }
            if (data.error || data.warnings && Object.keys(data.warnings).length) {
                if (data.error && ['maxlag','ratelimited','rate-limited','readonly'].indexOf(data.error.code) >= 0) { servicePause(origin,retryDeadline(response,REFRESH)); }
                var failure = new Error('Consulta pública incompleta.');
                failure.code = data.error && data.error.code || 'api-warning';
                failure.detail = JSON.stringify(data.error || data.warnings);
                throw failure;
            }
            return data;
            } catch (error) {
                // Refusing a response also stops any unread response body.
                controller.abort();throw error;
            } finally {
                if(actionApi&&requestStartedAt!==null&&Date.now()-requestStartedAt>1000){nextActionRequestAt=Math.max(nextActionRequestAt,Date.now()+5000);transportSet('action-next-v1',String(nextActionRequestAt));}
                if(timeout)win.clearTimeout(timeout);
            }
        }
        try {return await withTransportLock(dispatch,controller,epoch);}
        finally {
            controllers.delete(controller);
            if(waiters.length){waiters.shift()();}else{active-=1;}
        }
    }
    function notify(message, type) { if (mw.notify) { mw.notify(win.PerfilWikiI18n ? win.PerfilWikiI18n.t(appearance.language,message) : message, { tag: 'dan-pu-ritmo', type: type || 'info' }); } }
    function schedule(delay) {
        win.clearTimeout(timer);
        if (!suspended) {
            var wait=delay===undefined?REFRESH:delay;
            if(appearance.coverSource==='daily'&&dailyCoverApi){var instant=new Date(Date.now()),boundary=Date.UTC(instant.getUTCFullYear(),instant.getUTCMonth(),instant.getUTCDate()+1)-Date.now()+50;wait=Math.min(wait,Math.max(50,boundary));}
            timer = win.setTimeout(function () { refresh(false); },wait);
        }
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
        if (!started || running || suspended || !hasPanel()) { return; }
        var epoch = lifecycle;
        await restoreLargeCache();
        if (!started || running || suspended || epoch !== lifecycle || !hasPanel()) { return; }
        applyLocalCache(readCache());
        var storedDeadline = Number(storageGet('proxima-consulta')) || 0;
        if (!Number.isFinite(storedDeadline) || storedDeadline > Date.now() + REFRESH + 60000) { storedDeadline = 0; }
        if (!Number.isFinite(nextCheck) || nextCheck > Date.now() + REFRESH + 60000) { nextCheck = 0; }
        var deadline = Math.max(nextCheck, storedDeadline),metricsDue=manual||priority||deadline<=Date.now(),coverDue=dailyCoverDue();
        if (!metricsDue&&!coverDue && deadline < Date.now() + REFRESH + 60000) { schedule(Math.max(1000, deadline - Date.now())); return; }
        if (!manual && win.document.hidden) { schedule(); return; }
        running = true;
        if (metricsDue) { if (imageCycleStarted) { imageRequests = 0; } else { imageCycleStarted = true; } }
        async function collect(owns) {
            // The optional cover shares the transport and account lease, but never the statistics identity.
            var coverTask=coverDue?collectDailyCover(epoch):Promise.resolve(false);
            if(!metricsDue){await coverTask;return;}
            try {
            if (manual) { notify('Consultando as estatísticas…'); }
            var config = Object.assign({}, configured);
            if (manual) { config.activityRefreshMs = 0; }
            queryAnchor = new Date().toISOString(); sharedRequests.clear();
            var requestedPeriod = activePeriod; priorityChanged = false;
            var firstProgress = true, legacyDue = legacyBootstrapDue();
            var legacyTask = legacyDue ? bootstrapLegacyCounters(epoch) : Promise.resolve(false);
            var next;
            try { next = await core.update({ requestJson: function (url) { checkLifecycle(epoch); return sharedRequestJson(url, epoch); }, previous: current, config: config, now: queryAnchor, activePeriod: requestedPeriod, maxRequests:40-(coverDue?1:0)-(legacyDue?1:0),
                customRange:appearance.customRange,
                includeUserGroups: appearance.showUserGroups && ['top','activity','cards'].some(function(scope){return win.PerfilWikiAppearance.fieldIn(appearance,scope,'userGroups');}),
                includeThanksSent: appearance.showCards && appearance.metrics.indexOf('thanksSent') >= 0,
                includeEarliestRegistration: appearance.showCards && appearance.metrics.indexOf('tenure') >= 0 || appearance.showAccountCreated && (win.PerfilWikiAppearance.fieldIn(appearance, 'cards', 'accountCreated') || win.PerfilWikiAppearance.fieldIn(appearance, 'activity', 'accountCreated') || win.PerfilWikiAppearance.fieldIn(appearance, 'top', 'accountCreated')),
                retryUnavailableSeries: !!manual, retryUnavailableAggregates: !!manual, forceStatistics: !!manual,
                onProgress: function (partial) {
                    if (!owns() || suspended || !core.validateState(partial).valid) { return; }
                    currentCheckpoint = current && current.capturedAt === partial.capturedAt ? Math.max(currentCheckpoint,checkpointNumber(partial)) : checkpointNumber(partial);
                    current = partial; hasAdvancedCurrent = true; paint(current);
                    saveCache(current,firstProgress); firstProgress = false;
                }
            }); } finally { await legacyTask; }
            next.config = Object.assign({}, configured);
            if (!owns()) { return; }
            if (!core.validateState(next).valid) { throw new Error('Os dados novos não passaram pela conferência.'); }
            currentCheckpoint = current && current.capturedAt === next.capturedAt ? Math.max(currentCheckpoint,checkpointNumber(next)) : checkpointNumber(next);
            current = next; hasAdvancedCurrent = true;
            paint(current);
            await saveCache(current,true);
            if (manual) {
                if (next.pageviews && !next.pageviews.allPeriodsComplete && !next.pageviews.error) {
                    notify('Calculando as visualizações de todos os artigos editados por você. O painel acompanha a consulta.');
                } else { notify(next.fresh ? 'Painel atualizado nesta tela.' : 'Os dados disponíveis foram atualizados. As consultas incompletas mantiveram seus últimos resultados.', next.fresh ? 'success' : 'warn'); }
            }
            } finally {await coverTask;}
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
            else if (!suspended&&!metricsDue) {schedule(Math.max(1000,deadline-Date.now()));}
            else if (!suspended) {
                var views = current && current.pageviews;
                var customPending=appearance.customRange&&views&&(!views.periods.custom||JSON.stringify(views.customRange)!==JSON.stringify(appearance.customRange)||!views.periods.custom.complete);
                var continuing = views && (views.allPeriodsComplete && views.stale || !views.allPeriodsComplete && views.progress && views.progress.pending > 0 && !views.error) || customPending&&views.customProgress&&views.customProgress.resumable || current && (current.history && current.history.pending && !current.history.error || current.statistics && current.statistics.pending && !current.statistics.errors.length);
                var delay = priorityChanged && views && (!views.allPeriodsComplete||customPending) ? 0 : (continuing ? 15000 : REFRESH);
                nextCheck = Date.now() + delay;
                storageSet('proxima-consulta', String(nextCheck)); schedule(delay);
            }
        }
    }
    function currentChoices() {
        var page=String(mw.config.get('wgTitle')||configured.user).replace(/_/g,' '),prefix=configured.user+'/';
        var subpage=page.indexOf(prefix)===0?page.slice(prefix.length):'';
        return {version:'1.20.1',user:configured.user,displayName:profileOptions.displayName,location:profileOptions.location,
            photo:profileOptions.photo,coverImage:profileOptions.coverImage,customFields:profileOptions.customFields,
            timeZone:configured.timeZone,destination:subpage?'subpage':'main',subpage:subpage||'PU',appearance:appearance};
    }
    var editingSession=null;
    function ensureEditButton(){
        if(!win.PerfilWikiLiveEdit||win.document.getElementById('perfilwiki-edit-panel'))return;
        var anchor=win.document.getElementById('dan-pu-profile-header')||win.document.getElementById('dan-pu-ritmo')||win.document.getElementById('dan-pu-estatisticas');
        if(!anchor||!anchor.parentNode||typeof anchor.parentNode.insertBefore!=='function')return;
        var button=win.document.createElement('button');button.id='perfilwiki-edit-panel';button.type='button';
        button.textContent=win.PerfilWikiI18n?win.PerfilWikiI18n.t(appearance.language,'Editar painel'):'Editar painel';
        button.title=win.PerfilWikiI18n?win.PerfilWikiI18n.t(appearance.language,'Abre o instalador no GitHub Pages com as escolhas deste painel.'):'Abre o instalador no GitHub Pages com as escolhas deste painel.';
        button.style.cssText='display:block;margin:12px 0;padding:6px 12px;cursor:pointer;';
        button.addEventListener('click',editPanel);anchor.parentNode.insertBefore(button,anchor);
    }
    function editPanel() {
        var api=win.PerfilWikiLiveEdit;
        if(!api||editingSession||!win.crypto||typeof win.crypto.getRandomValues!=='function'||typeof win.open!=='function') { notify('Não foi possível abrir o editor do painel.', 'warn');return; }
        var nonceBytes=new Uint8Array(16);win.crypto.getRandomValues(nonceBytes);
        var nonce=Array.from(nonceBytes,function(value){return value.toString(16).padStart(2,'0');}).join('');
        var popup;
        try {
            // Detach the opener while this blank document is still same-origin.
            // Retain only our WindowProxy for the exact-origin data handoff.
            popup=win.open('about:blank','_blank');
            if(!popup)throw new Error('blocked');
            popup.opener=null;
            popup.document.write('<!doctype html><html><head><meta name="referrer" content="no-referrer"><title>PerfilWiki</title></head><body></body></html>');
            popup.document.close();
        }catch(_){notify('Permita a abertura de uma nova aba para editar o painel.','warn');return;}
        var epoch=lifecycle,choices=currentChoices(),title='Usuário:'+configured.user+(choices.destination==='subpage'?'/'+choices.subpage:'');
        var ready=false,payload=null,sent=false,interval,timeout,done=false;
        function cleanup(){if(done)return;done=true;win.removeEventListener('message',receive);win.clearInterval(interval);win.clearTimeout(timeout);editingSession=null;}
        function fail(){if(done)return;cleanup();notify('O instalador não respondeu. Mantenha esta página aberta e tente "Editar painel" novamente.','warn');}
        function send(){if(done||!ready||!payload||sent)return;try{popup.postMessage(payload,api.installerOrigin);sent=true;}catch(_){fail();}}
        function receive(event){
            if(done||event.origin!==api.installerOrigin||event.source!==popup)return;
            if(api.isSignal(event.data,'ready',nonce)){ready=true;send();}
            else if(sent&&api.isSignal(event.data,'accepted',nonce)){cleanup();}
        }
        editingSession={cancel:cleanup};win.addEventListener('message',receive);
        interval=win.setInterval(function(){if(done)return;if(popup.closed){cleanup();return;}try{popup.postMessage(api.signal('hello',nonce),api.installerOrigin);}catch(_){fail();}},500);
        timeout=win.setTimeout(fail,api.limits.lifetimeMs);
        try{popup.location.replace(api.installerUrl(nonce));}catch(_){fail();return;}
        // Only this explicit click requests the public page text. It uses the
        // same anonymous queue, service pauses, redirect guard and size limits.
        function readPublicPage(pageTitle){
            var url=new URL('https://pt.wikipedia.org/w/api.php');
            url.searchParams.set('action','query');url.searchParams.set('format','json');url.searchParams.set('formatversion','2');url.searchParams.set('maxlag','5');
            url.searchParams.set('prop','revisions');url.searchParams.set('rvslots','main');url.searchParams.set('rvprop','ids|content');url.searchParams.set('rvlimit','1');url.searchParams.set('titles',pageTitle);
            return requestJson(url.href,epoch).then(function(data){
                var pages=data.query&&data.query.pages,entry=Array.isArray(pages)&&pages.length===1?pages[0]:null,revision=entry&&entry.revisions&&entry.revisions.length===1?entry.revisions[0]:null;
                var content=revision&&revision.slots&&revision.slots.main&&revision.slots.main.content;
                return api.page({title:entry&&entry.title,revisionId:revision&&revision.revid,content:content},pageTitle);
            });
        }
        readPublicPage(title).then(async function(publicPage){
            if(done)return;
            // A main user page may transclude its sole panel from {{/PU}}.
            // Follow at most one unambiguous simple own subpage, and accept it
            // only if its public source actually contains the panel.
            var relative=choices.destination==='main'?api.relativeSource(publicPage.content):null;
            if(relative){
                try{var candidate=await readPublicPage(title+'/'+relative);if(api.containsPanel(candidate.content)){publicPage=candidate;choices.destination='subpage';choices.subpage=relative;}}
                catch(_){/* Preserve the main-page draft and require manual placement. */}
            }
            if(done)return;
            payload=api.envelope(choices,publicPage,nonce,Date.now());send();
        }).catch(function(){
            if(done)return;
            try{payload=api.envelope(choices,null,nonce,Date.now());send();}catch(_){fail();}
        });
    }
    function downloadChoices() {
        var choices=currentChoices();
        // Personal wikitext belongs to the page, not to the statistics cache or
        // these appearance settings. Downloading settings never reads or saves it.
        var blob=new Blob([JSON.stringify(choices,null,2)+'\n'],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
        var link=win.document.createElement('a');link.href=url;link.download='PerfilWiki_escolhas.json';link.click();
        win.setTimeout(function(){URL.revokeObjectURL(url);},1000);
    }
    function managedExport(markup){
        var group=appearance.layout!=='separate',user=configured.user.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return '<!-- PERFILWIKI-PROFILE-BEGIN -->\n'+(group?'<div data-perfilwiki-group="true" data-perfilwiki-user="'+user+'">\n':'')+markup+(group?'\n</div>':'')+'\n<!-- PERFILWIKI-PROFILE-END -->';
    }
    function download() {
        if (!current || !current.activity.complete) { notify('Aguarde a primeira consulta completa.', 'warn'); return; }
        if (!appearance.showActivity) { notify('O painel de atividade está desativado nas suas opções.', 'warn'); return; }
        var presentation = {user:configured.user, timeZone:configured.timeZone, now:Date.now(), images:images, displayName:profileOptions.displayName, location:profileOptions.location, photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover, customFields:profileOptions.customFields, stylesPage:profileOptions.stylesPage, documentationPage:profileOptions.documentationPage, appearance:appearance, savedAccountCreated:retainedAccountCreated()};
        var markup = view.wikitext(current, presentation);
        var header = win.PerfilWikiProfileHeaderView ? win.PerfilWikiProfileHeaderView.wikitext(current, presentation) : '';
        if (appearance.layout === 'integrated' && appearance.showCards && win.PerfilWikiLayoutView && win.PerfilWikiCardsView) {
            markup = win.PerfilWikiLayoutView.compose(win.PerfilWikiCardsView.wikitext(current.statistics, current.activity, presentation), markup, appearance, header);
        } else if (!appearance.showCards || appearance.blockOrder === 'activity-first') { markup = header + markup; }
        if(!appearance.showCards||appearance.layout==='integrated'&&win.PerfilWikiLayoutView&&win.PerfilWikiCardsView){markup=managedExport(markup);}
        else {markup='<!-- Trecho de atividade. Substitua somente a atividade, preservando as marcas externas PERFILWIKI-PROFILE e os outros blocos. -->\n'+markup;}
        var blob = new Blob([markup + '\n'], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_atividade.wiki';
        link.click(); win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function downloadCards() {
        if (!current || !current.statistics) { notify('Aguarde a primeira consulta dos contadores.', 'warn'); return; }
        if (!appearance.showCards) { notify('Os contadores estão desativados nas suas opções.', 'warn'); return; }
        var markup = '<templatestyles src="' + profileOptions.stylesPage.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" />' +
            win.PerfilWikiCardsView.wikitext(current.statistics, current.activity, {user: configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,customFields:profileOptions.customFields,now: Date.now(), appearance:appearance, documentationPage:profileOptions.documentationPage,savedAccountCreated:retainedAccountCreated()});
        if (win.PerfilWikiProfileHeaderView && (!appearance.showActivity || appearance.layout !== 'integrated' && appearance.blockOrder === 'cards-first')) {
            markup = win.PerfilWikiProfileHeaderView.wikitext(current,headerPresentation()) + markup;
        }
        if(!appearance.showActivity){markup=managedExport(markup);}
        else {markup='<!-- Trecho de contadores. Substitua somente os contadores, preservando as marcas externas PERFILWIKI-PROFILE e os outros blocos. -->\n'+markup;}
        var url = URL.createObjectURL(new Blob([markup + '\n'], {type:'text/plain;charset=utf-8'}));
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_contadores.wiki'; link.click();
        win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function hasPanel() { return !!(win.document.getElementById('dan-pu-ritmo') || win.document.getElementById('dan-pu-estatisticas')); }
    function begin() {
        if (started || !hasPanel()) { return; }
        started = true; readImages(); current = readCache(); appliedLocalRevision = localRevision;
        readLegacyCounters();
        if (current) { lastCommittedAnchor = Date.parse(current.capturedAt); currentCheckpoint = checkpointNumber(current); }
        var copiedHeader=win.document.getElementById('dan-pu-profile-header');
        if(copiedHeader&&copiedHeader.getAttribute('data-perfilwiki-profile-top')==='true'&&copiedHeader.getAttribute('data-perfilwiki-user')!==configured.user&&copiedHeader.parentNode){copiedHeader.parentNode.removeChild(copiedHeader);}
        readDailyCover();
        var startupCreated=retainedAccountCreated();
        var cards = win.document.getElementById('dan-pu-estatisticas');
        if (cards && !win.document.getElementById('perfilwiki-anos')) {
            var tenure = cards.querySelector('.dan-pu-stat-tenure .dan-pu-stat-value');
            if (tenure) { var tenureValue = win.document.createElement('span'); tenureValue.id = 'perfilwiki-anos'; tenureValue.append.apply(tenureValue, Array.from(tenure.childNodes)); tenure.appendChild(tenureValue); }
        }
        if (cards && cards.getAttribute('data-perfilwiki-user') !== configured.user) {
            ['dan-pu-edicoes','dan-pu-agradecimentos','dan-pu-artigos','dan-pu-editados','dan-pu-criados-tecnicos','dan-pu-reversoes','dan-pu-ritmo-melhor-sequencia','perfilwiki-anos',
                'dan-pu-artigo-mais-editado','dan-pu-bytes-acrescentados','dan-pu-bytes-removidos','dan-pu-dias-com-edicoes','dan-pu-edicoes-em-artigos','dan-pu-edicoes-em-discussoes','dan-pu-meses-com-edicoes','dan-pu-dia-com-mais-edicoes','dan-pu-edicoes-30-dias','dan-pu-media-por-dia-ativo','dan-pu-anos-com-edicoes','dan-pu-mes-com-mais-edicoes','dan-pu-agradecimentos-enviados','dan-pu-media-bytes-por-edicao','dan-pu-maior-acrescimo','dan-pu-maior-remocao'].forEach(function (id) {
                var number = win.document.getElementById(id);
                if (number) {
                    number.textContent = 'Aguardando dados';
                    number.removeAttribute('title');
                    number.removeAttribute('data-perfilwiki-most-edited');
                    number.removeAttribute('data-perfilwiki-busiest-day');
                    number.removeAttribute('data-perfilwiki-busiest-month');
                }
            });
            cards.setAttribute('data-perfilwiki-user', configured.user);
        }
        if (win.PerfilWikiCardsView) { win.PerfilWikiCardsView.paint(win.document, current && current.statistics, current && current.activity, Date.now(), appearance, {user:configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,customFields:profileOptions.customFields,appearance:appearance,now:Date.now(),documentationPage:profileOptions.documentationPage}); }
        applyBlockOrder();
        var activityRoot = win.document.getElementById('dan-pu-ritmo');
        if (activityRoot) { activityRoot.style.display = appearance.showActivity ? '' : 'none'; }

        if (current) { paint(current); }
        else {
            var target = win.document.getElementById('dan-pu-ritmo');
            if (target && target.getAttribute('data-perfilwiki-user') !== configured.user) {
                detachNestedCards(target);
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
            if (view.paintProfile) { view.paintProfile(win.document, null, {user:configured.user, timeZone:configured.timeZone, displayName:profileOptions.displayName, location:profileOptions.location, photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover, customFields:profileOptions.customFields, appearance:appearance, now:Date.now(), savedAccountCreated:startupCreated}); }
            bindControls(); applyPeriodVisibility(); enhancePresentation();
        }
        paintHeader(current,startupCreated); patchProfilePhotos(); synchronizeActivityFooter();ensureEditButton();paintLegacyCounters();
        restoreLargeCache();
        mw.loader.using(['mediawiki.util']).then(function () {
            var refreshLink = mw.util.addPortletLink('p-tb', '#', 'Atualizar estatísticas', 't-perfilwiki-refresh');
            var downloadLink = appearance.showActivity && mw.util.addPortletLink('p-tb', '#', 'Baixar painel atualizado', 't-perfilwiki-download');
            var cardsLink = appearance.showCards && mw.util.addPortletLink('p-tb', '#', 'Baixar contadores atualizados', 't-perfilwiki-cards');
            var choicesLink = mw.util.addPortletLink('p-tb', '#', 'Baixar minhas escolhas', 't-perfilwiki-choices');
            var editLink = win.PerfilWikiLiveEdit && mw.util.addPortletLink('p-tb','#',win.PerfilWikiI18n?win.PerfilWikiI18n.t(appearance.language,'Editar painel'):'Editar painel','t-perfilwiki-edit');
            if (editLink) { editLink.addEventListener('click',function(event){event.preventDefault();editPanel();}); }
            if (choicesLink) { choicesLink.addEventListener('click', function (event) { event.preventDefault(); downloadChoices(); }); }
            if (cardsLink) { cardsLink.addEventListener('click', function (event) { event.preventDefault(); downloadCards(); }); }
            if (refreshLink) { refreshLink.addEventListener('click', function (event) { event.preventDefault(); refresh(true); }); }
            if (downloadLink) { downloadLink.addEventListener('click', function (event) { event.preventDefault(); download(); }); }
            schedule(1500);
        });
    }
    win.PerfilWiki = Object.freeze({ version: '1.20.1', readOnly: true, refreshInterval: REFRESH,
        refresh: function () { return refresh(true); }, download: download, downloadActivity: download, downloadCards: downloadCards,downloadChoices:downloadChoices,editPanel:editPanel,
        getState: function () { return current ? JSON.parse(JSON.stringify(current)) : null; },
        getAppearance: function () { return JSON.parse(JSON.stringify(appearance)); } });
    // Compatibility sentinels stop old loaders from starting a second scheduler.
    win.DanPURitmo = win.PerfilWiki; win.DanPUStats = win.PerfilWiki;
    win.addEventListener('storage', function (event) {
        if(event.key===PREFIX+'daily-cover-v1'&&appearance.coverSource==='daily'){var previousCover=dailyCover;readDailyCover();if(dailyCover!==previousCover){paintHeader(current);patchProfilePhotos();}}
        if (event.key === PREFIX + 'cache') { applyLocalCache(readCache()); }
    });
    win.addEventListener('focus', function () { refresh(false); startClock(); queueImages(); });
    win.addEventListener('hashchange', function () { choosePeriod(periodFromHash() || appearance.initialPeriod); });
    win.document.addEventListener('visibilitychange', function () {
        if (!win.document.hidden) { refresh(false); startClock(); queueImages(); }
        else { win.clearTimeout(clockTimer); win.clearTimeout(imageTimer); }
    });
    win.addEventListener('pagehide', function () {
        if(editingSession){editingSession.cancel();}
        suspended = true; lifecycle += 1; win.clearTimeout(timer); win.clearTimeout(clockTimer); win.clearTimeout(imageTimer);
        controllers.forEach(function (controller) { controller.abort(); });
        if (releaseActiveLease) { releaseActiveLease(); }
    });
    win.addEventListener('pageshow', function () { if (suspended) { suspended = false; cacheRestore = null; restoreLargeCache(); schedule(1500); startClock(); queueImages(); } });
    if (mw.hook) { mw.hook('wikipage.content').add(begin); }
    if (win.document.readyState === 'loading') { win.document.addEventListener('DOMContentLoaded', begin, { once: true }); }
    else { begin(); }
}(window));
