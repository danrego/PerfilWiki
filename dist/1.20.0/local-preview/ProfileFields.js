/* PerfilWiki. Shared, request-free custom profile field normalization. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./ProfileText.js') : root.PerfilWikiProfileText);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiProfileFields = api; }
}(typeof window !== 'undefined' ? window : this, function (profileText) {
    'use strict';
    var layouts = ['inline','lines','bullets'];
    var separators = ['pipe','dot','space'];
    var placements = ['inherit','cards','activity','both','hidden','top','top-activity','top-cards','all'];
    function owns(value, key) { return Object.prototype.hasOwnProperty.call(value,key); }
    function plainLabel(value) {
        if (typeof value !== 'string' || /[\x00-\x1f\x7f-\x9f\u2028\u2029<>\[\]{}|]/.test(value)) { throw new TypeError('O rótulo deve conter apenas texto.'); }
        var label = value.normalize('NFC').trim();
        if (Array.from(label).length > 40) { throw new TypeError('O rótulo deve ter até 40 caracteres.'); }
        return label;
    }
    function color(value, optional) {
        if (value === '' || optional && value === undefined) { return ''; }
        if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) { throw new TypeError('Escolha uma cor de texto válida.'); }
        return value.toLowerCase();
    }
    function normalize(input) {
        if (input === undefined) { return []; }
        if (!Array.isArray(input) || input.length > 3) { throw new TypeError('Use até três informações adicionais.'); }
        var normalized = [];
        for (var index = 0; index < input.length; index += 1) {
            var field = input[index];
            if (!field || typeof field !== 'object' || Array.isArray(field)) { throw new TypeError('Informação adicional inválida.'); }
            var legacy = owns(field,'value'), grouped = owns(field,'values');
            var allowed = grouped ? ['label','values','layout','separator','placement','labelColor','valueColors'] : ['label','value','placement','labelColor','valueColor'];
            if (legacy && grouped || !owns(field,'label') || Object.keys(field).some(function (key) { return allowed.indexOf(key) < 0; }) ||
                field.placement !== undefined && placements.indexOf(field.placement) < 0) { throw new TypeError('Informação adicional inválida.'); }
            var label = plainLabel(field.label), labelColor = color(field.labelColor,true), values, value, result, colors = [], valueColor;
            if (grouped) {
                var layout = field.layout === undefined ? 'inline' : field.layout;
                var separator = field.separator === undefined ? 'pipe' : field.separator;
                if (layouts.indexOf(layout) < 0 || separators.indexOf(separator) < 0) { throw new TypeError('Escolha uma disposição e um separador válidos para os itens.'); }
                if (!Array.isArray(field.values) || field.values.length > 8) { throw new TypeError('Use até oito itens em cada informação adicional.'); }
                if (field.valueColors !== undefined && (!Array.isArray(field.valueColors) || field.valueColors.length !== field.values.length)) { throw new TypeError('Cada item deve ter a sua própria opção de cor.'); }
                values = [];
                for (var item = 0; item < field.values.length; item += 1) {
                    value = profileText.normalize(field.values[item],160);
                    valueColor = field.valueColors === undefined ? '' : color(field.valueColors[item],false);
                    if (value) { values.push(value); colors.push(valueColor); }
                }
                if (!label && !values.length) { continue; }
                if (!label) { throw new TypeError('Preencha o rótulo da informação ou remova a linha.'); }
                result = {label:label,values:values,layout:layout,separator:separator};
                if (colors.some(function (entry) { return entry !== ''; })) { result.valueColors = colors; }
            } else {
                value = profileText.normalize(legacy ? field.value : '',160);
                valueColor = color(field.valueColor,true);
                if (!label && !value) { continue; }
                if (!label) { throw new TypeError('Preencha o rótulo da informação ou remova a linha.'); }
                result = {label:label,value:value};
                if (valueColor) { result.valueColor = valueColor; }
            }
            if (labelColor) { result.labelColor = labelColor; }
            if (field.placement !== undefined) { result.placement = field.placement; }
            normalized.push(result);
        }
        return normalized;
    }
    function fieldValue(field) { return normalize([field])[0] || null; }
    function values(field) {
        var normalized = fieldValue(field);
        return !normalized ? [] : owns(normalized,'values') ? normalized.values.slice() : normalized.value ? [normalized.value] : [];
    }
    function layoutOf(field) { var normalized = fieldValue(field); return normalized && normalized.layout || 'inline'; }
    function separatorOf(field) { var normalized = fieldValue(field); return normalized && normalized.separator || 'pipe'; }
    function valueColors(field) {
        var normalized = fieldValue(field);
        if (!normalized) { return []; }
        return owns(normalized,'values') ? normalized.values.map(function (_,index) { return normalized.valueColors && normalized.valueColors[index] || ''; }) : normalized.value ? [normalized.valueColor || ''] : [];
    }
    return Object.freeze({normalize:normalize,values:values,valueColors:valueColors,layoutOf:layoutOf,separatorOf:separatorOf});
}));
