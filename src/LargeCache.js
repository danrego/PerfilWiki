/* PerfilWiki. Size-bounded IndexedDB fallback for packed metric caches.
 * No requests, DOM, account lookup or wiki writes. CC BY-SA 4.0. */
(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else if (root) { root.PerfilWikiLargeCache = api; }
}(typeof window !== 'undefined' ? window : typeof globalThis === 'object' ? globalThis : this, function (host) {
    'use strict';
    var DATABASE = 'perfilwiki-large-cache-v1', STORE = 'snapshots';
    var PACKED_LIMIT = 4000000, KEY_LIMIT = 4096, TIMEOUT = 1500;
    function now() { return host && host.Date && typeof host.Date.now === 'function' ? host.Date.now() : Date.now(); }
    function validKey(key) {
        return typeof key === 'string' && key.length <= KEY_LIMIT && /^perfilwiki-v1-.+-.+-cache$/.test(key) && !/[\x00-\x20\x7f]/.test(key);
    }
    function validPacked(packed) { return typeof packed === 'string' && packed.length > 0 && packed.length <= PACKED_LIMIT; }
    function timestamp(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
        var date = new Date(value), instant = date.getTime();
        return Number.isFinite(instant) && date.toISOString().replace('.000Z', 'Z') === value.replace('.000Z', 'Z') && instant <= now() ? instant : null;
    }
    function validRecord(record, key) {
        return !!record && typeof record === 'object' && !Array.isArray(record) &&
            Object.keys(record).sort().join(',') === 'capturedAt,key,packed,schema' && record.schema === 1 &&
            record.key === key && validKey(record.key) && validPacked(record.packed) && timestamp(record.capturedAt) !== null;
    }
    function operation(key, mode, next) {
        return new Promise(function (resolve) {
            var settled = false, database = null, transaction = null, completed = false, timer = null;
            var fallback = mode === 'readonly' ? null : false;
            function finish(value) {
                if (settled) { return; }
                settled = true;
                if (timer !== null) { host.clearTimeout(timer); }
                if (transaction && !completed) { try { transaction.abort(); } catch (_) {} }
                if (database) { try { database.close(); } catch (_) {} }
                resolve(value);
            }
            function failed(event) { if (event && event.preventDefault) { event.preventDefault(); } finish(fallback); }
            try {
                if (!validKey(key) || !host || !host.indexedDB || typeof host.indexedDB.open !== 'function' ||
                    typeof host.setTimeout !== 'function' || typeof host.clearTimeout !== 'function') { finish(fallback); return; }
                timer = host.setTimeout(function () { finish(fallback); }, TIMEOUT);
                var request = host.indexedDB.open(DATABASE, 1);
                request.onblocked = failed;
                request.onerror = failed;
                request.onupgradeneeded = function () {
                    if (settled) {
                        try { request.transaction.abort(); } catch (_) {}
                        try { request.result.close(); } catch (_) {}
                        return;
                    }
                    try {
                        database = request.result;
                        if (!database.objectStoreNames.contains(STORE)) { database.createObjectStore(STORE, {keyPath:'key'}); }
                    } catch (_) { try { request.transaction.abort(); } catch (ignore) {} finish(fallback); }
                };
                request.onsuccess = function () {
                    database = request.result;
                    if (settled) { try { database.close(); } catch (_) {} return; }
                    database.onversionchange = function () { finish(fallback); };
                    try {
                        transaction = database.transaction(STORE, mode);
                        var result = fallback;
                        transaction.oncomplete = function () { completed = true; finish(result); };
                        transaction.onerror = failed;
                        transaction.onabort = failed;
                        var store = transaction.objectStore(STORE), read = store.get(key);
                        read.onerror = failed;
                        read.onsuccess = function () {
                            if (settled) { return; }
                            try { result = next(store, validRecord(read.result, key) ? read.result : null); }
                            catch (_) { finish(fallback); }
                        };
                    } catch (_) { finish(fallback); }
                };
            } catch (_) { finish(fallback); }
        });
    }
    function get(key) { return operation(key, 'readonly', function (_store, record) { return record ? record.packed : null; }); }
    function put(key, packed, capturedAt) {
        if (!validKey(key) || !validPacked(packed) || timestamp(capturedAt) === null) { return Promise.resolve(false); }
        // The comparison and write share one readwrite transaction, so another
        // tab cannot replace a newer completed snapshot with an older one.
        return operation(key, 'readwrite', function (store, previous) {
            if (previous && Date.parse(previous.capturedAt) > Date.parse(capturedAt)) { return false; }
            store.put({schema:1,key:key,packed:packed,capturedAt:capturedAt});
            return true;
        });
    }
    return Object.freeze({get:get,put:put,limits:Object.freeze({packedCharacters:PACKED_LIMIT,keyCharacters:KEY_LIMIT,timeoutMs:TIMEOUT})});
}));
