/* Reversible local JSON cache dictionary. No network, DOM, or wiki writes. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    if (root) { root.PerfilWikiCache = api; }
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';
    var FORMAT = 'dan-pu-cache-dictionary-v1';
    var PACKED_LIMIT = 4000000;
    var EXPANDED_LIMIT = 12000000;
    var DICTIONARY_LIMIT = 100000;
    var BLOCK_LIMIT = 4096;
    var SHORT_INDEX_LIMIT = 0xd700;
    var STRING_TOKEN = /"(?:[^"\\]|\\.)*"/g;
    function fail() { throw new Error('Invalid or oversized local cache dictionary.'); }
    function repeatedArrays(payload) {
        var starts = [], counts = new Map();
        for (var index = 0; index < payload.length; index += 1) {
            if (payload[index] === '[' || payload[index] === '{') {
                starts.push({ at: index, close: payload[index] === '[' ? ']' : '}' });
            } else if (payload[index] === ']' || payload[index] === '}') {
                var opening = starts.pop();
                if (!opening || opening.close !== payload[index]) { fail(); }
                var start = opening.at, length = index - start + 1;
                if (opening.close === ']' && length >= 2048 || opening.close === '}' && length >= 24 && length <= 512) {
                    var value = payload.slice(start, index + 1);
                    counts.set(value, (counts.get(value) || 0) + 1);
                }
            }
        }
        if (starts.length) { fail(); }
        var candidates = Array.from(counts.keys()).filter(function (value) { return value[0] === '[' && counts.get(value) > 1; }).sort(function (a, b) { return b.length - a.length; });
        var arrays = [];
        candidates.forEach(function (value) {
            if (arrays.length >= 128) { return; }
            var pieces = payload.split(value);
            if (pieces.length < 3) { return; }
            payload = pieces.join('$' + arrays.length.toString(36) + ';');
            arrays.push(value);
        });
        // Replace small repeated objects in one pass. Array blocks remain
        // nonrecursive, and their large contents are never rescanned per object.
        var objectCounts = new Map(), occurrences = [], stack = [];
        for (var at = 0; at < payload.length; at += 1) {
            var character = payload[at];
            if (character === '[' || character === '{') { stack.push({ at: at, close: character === '[' ? ']' : '}' }); }
            else if (character === ']' || character === '}') {
                var open = stack.pop();
                if (!open || open.close !== character) { fail(); }
                var size = at - open.at + 1;
                if (character === '}' && size >= 24 && size <= 512) {
                    var object = payload.slice(open.at, at + 1);
                    if (object.indexOf('$') < 0) {
                        objectCounts.set(object, (objectCounts.get(object) || 0) + 1);
                        occurrences.push({ start: open.at, end: at + 1, value: object });
                    }
                }
            }
        }
        if (stack.length) { fail(); }
        occurrences.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
        var pieces = [], cursor = 0, objectIndexes = new Map();
        occurrences.forEach(function (occurrence) {
            if (occurrence.start < cursor || objectCounts.get(occurrence.value) < 2) { return; }
            var index = objectIndexes.get(occurrence.value);
            if (index === undefined) {
                if (arrays.length >= BLOCK_LIMIT) { return; }
                index = arrays.length; arrays.push(occurrence.value); objectIndexes.set(occurrence.value, index);
            }
            pieces.push(payload.slice(cursor, occurrence.start), '$' + index.toString(36) + ';'); cursor = occurrence.end;
        });
        pieces.push(payload.slice(cursor)); payload = pieces.join('');
        return { payload: payload, arrays: arrays };
    }
    function packJson(raw) {
        if (typeof raw !== 'string' || raw.length > EXPANDED_LIMIT) { fail(); }
        if (raw.length <= 100000) { return raw; }
        JSON.parse(raw);
        var dictionary = [], indexes = new Map();
        var payload = raw.replace(STRING_TOKEN, function (token) {
            var index = indexes.get(token);
            if (index === undefined) {
                index = dictionary.length;
                if (index >= DICTIONARY_LIMIT) { fail(); }
                dictionary.push(token); indexes.set(token, index);
            }
            return index < SHORT_INDEX_LIMIT ? '@' + String.fromCharCode(0x100 + index) : '@!' + index.toString(36) + ';';
        });
        var repeated = repeatedArrays(payload);
        var packed = JSON.stringify({ format: FORMAT, encoding: 'unicode-index', dictionary: dictionary,
            arrays: repeated.arrays, payload: repeated.payload });
        if (packed.length > PACKED_LIMIT) { fail(); }
        return packed.length < raw.length ? packed : raw;
    }
    function unpack(raw, parsedValue) {
        if (typeof raw !== 'string' || raw.length > PACKED_LIMIT) { fail(); }
        var envelope = JSON.parse(raw);
        if (!envelope || envelope.format !== FORMAT) { return parsedValue ? envelope : raw; }
        if (!Array.isArray(envelope.dictionary) || envelope.dictionary.length > DICTIONARY_LIMIT || typeof envelope.payload !== 'string') { fail(); }
        envelope.dictionary.forEach(function (token) {
            if (typeof token !== 'string' || token[0] !== '"' || token[token.length - 1] !== '"' || typeof JSON.parse(token) !== 'string') { fail(); }
        });
        if (envelope.encoding !== 'unicode-index' && envelope.encoding !== undefined) { fail(); }
        var payload = envelope.payload;
        if (envelope.arrays !== undefined) {
            if (!Array.isArray(envelope.arrays) || envelope.arrays.length > BLOCK_LIMIT) { fail(); }
            envelope.arrays.forEach(function (array) {
                if (typeof array !== 'string' || !((array[0] === '[' && array[array.length - 1] === ']') ||
                    (array[0] === '{' && array[array.length - 1] === '}')) || array.indexOf('$') >= 0 || array.length > EXPANDED_LIMIT) { fail(); }
            });
            var arrayExpandedLength = payload.length;
            payload = payload.replace(/\$([0-9a-z]+);/g, function (token, digits) {
                var index = parseInt(digits, 36);
                if (!Number.isSafeInteger(index) || index < 0 || index >= envelope.arrays.length || index.toString(36) !== digits) { fail(); }
                var value = envelope.arrays[index];
                arrayExpandedLength += value.length - token.length;
                if (arrayExpandedLength > EXPANDED_LIMIT) { fail(); }
                return value;
            });
        }
        if (payload.length > EXPANDED_LIMIT) { fail(); }
        var expandedLength = payload.length;
        function restore(token, index) {
            if (!Number.isSafeInteger(index) || index < 0 || index >= envelope.dictionary.length) { fail(); }
            var value = envelope.dictionary[index];
            expandedLength += value.length - token.length;
            if (expandedLength > EXPANDED_LIMIT) { fail(); }
            return value;
        }
        var expanded = envelope.encoding === 'unicode-index' ?
            payload.replace(/@(?:([\u0100-\ud7ff])|!([0-9a-z]+);)/g, function (token, character, digits) {
                var index = character ? character.charCodeAt(0) - 0x100 : parseInt(digits, 36);
                if (digits && (index < SHORT_INDEX_LIMIT || index.toString(36) !== digits)) { fail(); }
                return restore(token, index);
            }) : payload.replace(/@([0-9a-z]+);/g, function (token, digits) {
                var index = parseInt(digits, 36);
                if (index.toString(36) !== digits) { fail(); }
                return restore(token, index);
            });
        if (expanded.length > EXPANDED_LIMIT) { fail(); }
        var value = JSON.parse(expanded);
        return parsedValue ? value : expanded;
    }
    function unpackJson(raw) { return unpack(raw, false); }
    function parseJson(raw) { return unpack(raw, true); }
    return Object.freeze({ packJson: packJson, unpackJson: unpackJson, parseJson: parseJson, format: FORMAT,
        packedLimit: PACKED_LIMIT, expandedLimit: EXPANDED_LIMIT });
}));
