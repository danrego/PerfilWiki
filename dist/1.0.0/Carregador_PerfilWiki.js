/* PerfilWiki 1.0.0. Carregador pessoal. Daniel G Rego, CC BY-SA 4.0. */

(function () {
    'use strict';
    if (typeof mw === 'undefined' || !mw.config || mw.config.get('wgDBname') !== 'ptwiki' ||
        mw.config.get('wgAction') !== 'view' || mw.config.get('wgNamespaceNumber') !== 2) { return; }
    var user = mw.config.get('wgUserName');
    var owner = mw.config.get('wgRelevantUserName') || String(mw.config.get('wgTitle') || '').split('/')[0].replace(/_/g, ' ');
    if (!user || owner !== user || window.PerfilWiki || window.PerfilWikiLoaderRequested || typeof importScript !== 'function') { return; }
    window.PerfilWikiLoaderRequested = true;
    importScript('Usuário:Daniel G Rego/PerfilWiki.js');
}());
