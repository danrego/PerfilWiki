/* PerfilWiki. Verified public ptwiki user groups, without requests or DOM. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiUserGroups = api; }
}(typeof globalThis === 'object' ? globalThis : this, function (i18n) {
    'use strict';
    var LABELS = Object.freeze({user:'Usuário registrado',autoconfirmed:'Autoconfirmado',confirmed:'Confirmado',
        extendedconfirmed:'Autoconfirmado estendido',autoreviewer:'Autorrevisor',reviewer:'Revisor',rollbacker:'Reversor',
        eliminator:'Eliminador',sysop:'Administrador',bureaucrat:'Burocrata',checkuser:'Verificador de contas',
        oversight:'Supervisor',bot:'Robô','interface-admin':'Administrador de interface','interface-editor':'Editor de interface',
        'ipblock-exempt':'Isento de bloqueio de IP',import:'Importador',
        transwiki:'Importador transwiki'});
    var ORDER = ['extendedconfirmed','confirmed','autoconfirmed','autoreviewer','reviewer','rollbacker','eliminator',
        'sysop','bureaucrat','checkuser','oversight','interface-admin','interface-editor','ipblock-exempt','bot','import','transwiki'];
    function normalize(groups) {
        if (!Array.isArray(groups) || groups.length > 128 || Array.from(groups).some(function (group) {
            return typeof group !== 'string' || group !== '*' && !/^[a-z][a-z0-9_-]{0,63}$/.test(group);
        })) { throw new Error('Estatutos públicos inválidos.'); }
        return Array.from(new Set(groups)).sort();
    }
    function visible(groups) {
        var values = normalize(groups).filter(function (group) { return group !== '*' && group !== 'user'; });
        if (values.indexOf('extendedconfirmed') >= 0) {
            values = values.filter(function (group) { return group !== 'autoconfirmed' && group !== 'confirmed'; });
        }
        if (!values.length) { return ['user']; }
        return values.sort(function (a,b) {
            var first = ORDER.indexOf(a), second = ORDER.indexOf(b);
            if (first < 0) { first = ORDER.length; } if (second < 0) { second = ORDER.length; }
            return first - second || (a < b ? -1 : a > b ? 1 : 0);
        });
    }
    function labels(groups,language) { return visible(groups).map(function (group) { return Object.prototype.hasOwnProperty.call(LABELS,group) ? i18n.t(language,LABELS[group]) : group; }); }
    function fromProof(proof,user,now) {
        try {
            if (!proof || typeof proof !== 'object' || Array.isArray(proof) || proof.version !== 1 ||
                proof.user !== user || typeof user !== 'string' || !user || user !== user.trim() || user.length > 255 ||
                /[\x00-\x1f\x7f|<>\[\]{}#]/.test(user) || proof.project !== 'pt.wikipedia.org' ||
                Object.keys(proof).some(function (key) { return ['version','user','project','checkedAt','groups'].indexOf(key) < 0; }) ||
                typeof proof.checkedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(proof.checkedAt)) { return null; }
            var checked = Date.parse(proof.checkedAt), at = new Date(now === undefined ? Date.now() : now).getTime();
            if (!Number.isFinite(checked) || !Number.isFinite(at) || checked > at ||
                new Date(checked).toISOString().replace('.000Z','Z') !== proof.checkedAt.replace('.000Z','Z')) { return null; }
            var groups = normalize(proof.groups);
            if (JSON.stringify(groups) !== JSON.stringify(proof.groups)) { return null; }
            return {version:1,user:user,project:'pt.wikipedia.org',checkedAt:proof.checkedAt,groups:groups};
        } catch (_) { return null; }
    }
    function text(proof,user,now,language) { var checked = fromProof(proof,user,now); return checked ? labels(checked.groups,language).join(' · ') : null; }
    return Object.freeze({normalize:normalize,visible:visible,labels:labels,fromProof:fromProof,text:text});
}));
