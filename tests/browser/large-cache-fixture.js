/* Real IndexedDB checks using only a disposable synthetic key. No network or localStorage writes. */
(async function () {
    'use strict';
    var key = 'perfilwiki-v1-Fixture%20local%20IndexedDB-UTC-cache';
    var cache = window.PerfilWikiLargeCache, codec = window.PerfilWikiCache;
    var checks = [], result = {passed:false,checks:checks,packedCharacters:0,estimatedUtf16Bytes:0,cleaned:false};
    function check(label, condition) {
        checks.push({label:label,passed:!!condition});
        var item = document.createElement('li');item.textContent = (condition ? '✓ ' : '✗ ') + label;
        document.getElementById('large-cache-checks').appendChild(item);
        if (!condition) { throw new Error(label); }
    }
    function cleanFixture() {
        return new Promise(function (resolve) {
            var done = false, database = null, transaction = null;
            var timer = setTimeout(function () { finish(false); }, 1500);
            function finish(ok) {
                if (done) { return; }done = true;clearTimeout(timer);
                if (database) { database.close(); }resolve(ok);
            }
            try {
                var request = window.indexedDB.open('perfilwiki-large-cache-v1',1);
                request.onerror = function () { finish(false); };request.onblocked = function () { finish(false); };
                request.onsuccess = function () {
                    database = request.result;if(done){database.close();return;}
                    transaction = database.transaction('snapshots','readwrite');
                    transaction.oncomplete = function () { finish(true); };
                    transaction.onerror = function () { finish(false); };transaction.onabort = function () { finish(false); };
                    transaction.objectStore('snapshots').delete(key);
                };
            } catch (_) { finish(false); }
        });
    }
    try {
        check('O navegador oferece IndexedDB e o módulo local.',!!(window.indexedDB && cache && codec));
        var now = Date.now(), old = new Date(now-5000).toISOString(), newer = new Date(now-4000).toISOString();
        var small = '{"fixture":"História 🧩","value":18}';
        check('Uma entrada pequena é gravada no IndexedDB.',await cache.put(key,small,old));
        check('A leitura conserva todos os caracteres Unicode.',await cache.get(key) === small);
        var content = 'á'.repeat(2800000), raw = JSON.stringify({fixture:content}), packed = codec.packJson(raw);
        result.packedCharacters = packed.length;result.estimatedUtf16Bytes = packed.length*2;
        check('O valor excede cinco MiB em UTF-16 e respeita o limite do codec.',packed.length*2>5*1024*1024 && packed.length<=codec.packedLimit);
        check('Uma entrada de cerca de 2,8 milhões de caracteres é gravada.',await cache.put(key,packed,newer));
        var restored = await cache.get(key);
        check('A leitura grande conserva o texto e a decodificação exatos.',restored === packed && codec.parseJson(restored).fixture === content);
        check('Uma gravação antiga não sobrescreve a cópia mais recente.',await cache.put(key,small,old) === false && await cache.get(key) === packed);
        result.cleaned = await cleanFixture();
        check('Somente a entrada inventada é removida ao terminar.',result.cleaned && await cache.get(key) === null);
        result.passed = true;
    } catch (error) { result.error = error && error.message || 'Falha no teste local.'; }
    finally {
        if (!result.cleaned && window.indexedDB) { result.cleaned = await cleanFixture(); }
        window.PerfilWikiLargeCacheResult = result;
        document.body.setAttribute('data-fixture-status',result.passed?'passed':'failed');
        document.getElementById('large-cache-status').textContent = result.passed ? 'Todos os testes passaram.' : 'O teste encontrou uma falha.';
        document.getElementById('large-cache-details').textContent = JSON.stringify(result,null,2);
    }
}());
