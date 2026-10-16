/* PerfilWiki. Safe, request-free profile text and internal wiki links. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./DailyCover.js') : root.PerfilWikiDailyCover,
        typeof module === 'object' && module.exports ? require('./NativeDailyCover.js') : root.PerfilWikiNativeDailyCover,
        typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiProfileText = api; }
}(typeof window !== 'undefined' ? window : this, function (appearanceApi,dailyCoverApi,nativeCoverApi,i18n) {
    'use strict';
    var forbidden = /[\x00-\x1f\x7f-\x9f\u2028\u2029<>\{\}]/;
    var localNamespaces = ['media','especial','special','discussão','discussao','talk','usuário','usuario','usuária','usuaria','user',
        'discussão de usuário','discussao de usuario','user talk','wikipédia','wikipedia','discussão sobre a wikipédia','wikipedia talk',
        'predefinição','predefinicao','template','predefinição discussão','template talk','módulo','modulo','module','module talk',
        'ajuda','help','help talk','categoria','category','category talk','ficheiro','arquivo','imagem','file','image','file talk',
        'portal','portal talk','anexo','mediawiki','mediawiki talk','gadget','gadget definition'];
    function fail() { throw new TypeError('Use texto e ligações internas como [[Rio de Janeiro]] ou [[Título|Rótulo]], sem outro código.'); }
    function escape(value) {
        return value.replace(/[&<>"']/g,function (character) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]; });
    }
    function literal(value) {
        return escape(value).replace(/[\[\]{}|~_:]/g,function (character) { return '&#' + character.charCodeAt(0) + ';'; });
    }
    function target(value) {
        var title = value.replace(/_/g,' ').normalize('NFC').trim();
        if (title.charAt(0) === ':') { title = title.slice(1).trim(); }
        if (!title || forbidden.test(title) || /[\[\]|]/.test(title) || /%[0-9a-f]{2}|&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.test(title)) { fail(); }
        var hash = title.indexOf('#'), page = hash < 0 ? title : title.slice(0,hash), fragment = hash < 0 ? '' : title.slice(hash + 1);
        if (!page.trim() || hash >= 0 && (!fragment.trim() || fragment.indexOf('#') >= 0)) { fail(); }
        var colon = page.indexOf(':');
        if (colon >= 0 && localNamespaces.indexOf(page.slice(0,colon).trim().toLocaleLowerCase('pt-BR')) < 0) { fail(); }
        if (colon >= 0 && !page.slice(colon + 1).trim()) { fail(); }
        return title;
    }
    function address(title) {
        var hash = title.indexOf('#'), page = hash < 0 ? title : title.slice(0,hash), fragment = hash < 0 ? '' : title.slice(hash + 1);
        return 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(page.replace(/ /g,'_')) + (fragment ? '#' + encodeURIComponent(fragment.replace(/ /g,'_')) : '');
    }
    function parse(value, limit) {
        if (typeof value !== 'string' || forbidden.test(value)) { fail(); }
        if (limit === undefined) { limit = 1024; }
        if (!Number.isSafeInteger(limit) || limit < 0) { throw new TypeError('Limite de texto inválido.'); }
        value = value.normalize('NFC').trim();
        if (Array.from(value).length > limit) { throw new TypeError('Use até ' + limit + ' caracteres.'); }
        var result = [], cursor = 0;
        while (cursor < value.length) {
            var open = value.indexOf('[[',cursor), plain = value.slice(cursor,open < 0 ? value.length : open);
            if (/[\[\]|]/.test(plain)) { fail(); }
            if (plain) { result.push(Object.freeze({type:'text',value:plain})); }
            if (open < 0) { break; }
            var close = value.indexOf(']]',open + 2);
            if (close < 0) { fail(); }
            var contents = value.slice(open + 2,close), parts = contents.split('|');
            if (parts.length > 2 || /[\[\]]/.test(contents)) { fail(); }
            var title = target(parts[0]), label = parts.length === 2 ? parts[1].trim() : title;
            if (!label || forbidden.test(label) || /[\[\]|]/.test(label)) { fail(); }
            result.push(Object.freeze({type:'link',title:title,label:label,href:address(title)}));
            cursor = close + 2;
        }
        return {value:value,tokens:Object.freeze(result)};
    }
    function tokens(value) { return parse(value).tokens; }
    function linkColor(value) {
        if(value===undefined||value==='')return '';
        if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw new TypeError('Cor do texto inválida.');
        return value.toLowerCase();
    }
    function html(value,color) {
        color=linkColor(color);
        return tokens(value).map(function (token) { return token.type === 'text' ? escape(token.value) : '<a href="' + escape(token.href) + '"'+(color?' style="color:'+color+';"':'')+'>' + escape(token.label) + '</a>'; }).join('');
    }
    function wikitext(value,color) {
        color=linkColor(color);
        return tokens(value).map(function (token) {
            return token.type === 'text' ? literal(token.value) : '[[:' + escape(token.title).replace(/~/g,'&#126;') + '|' + (color?'<span style="color:'+color+';">':'')+literal(token.label)+(color?'</span>':'') + ']]';
        }).join('');
    }
    function append(document, parent, value,color) {
        color=linkColor(color);
        tokens(value).forEach(function (token) {
            var node = document.createElement(token.type === 'link' ? 'a' : 'span');
            node.textContent = token.type === 'link' ? token.label : token.value;
            if (token.type === 'link') { node.setAttribute('href',token.href); }
            if (token.type === 'link'&&color) { node.setAttribute('style','color:'+color+';'); }
            parent.appendChild(node);
        });
        return parent;
    }
    function normalizePhoto(value) {
        if(value===undefined)return '';
        if(typeof value!=='string'||forbidden.test(value))throw new TypeError('Informe o nome de um arquivo de imagem do Wikimedia Commons.');
        var filename=value.normalize('NFC').trim().replace(/^(?:File|Ficheiro):\s*/i,'').replace(/_/g,' ').trim();
        if(!filename)return '';
        if(Array.from(filename).length>240||forbidden.test(filename)||/[\[\]|:#?\/\\]/.test(filename)||
            /%[0-9a-f]{2}|&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.test(filename)||
            /^\./.test(filename)||! /\.(?:jpe?g|png|webp|gif|svg)$/i.test(filename)) {
            throw new TypeError('Use apenas o nome de uma imagem JPG, PNG, WebP, GIF ou SVG do Wikimedia Commons, sem endereço ou código.');
        }
        return filename;
    }
    function photoAddress(value) { var filename=normalizePhoto(value);return filename?'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(filename.replace(/ /g,'_')):''; }
    function photoSource(value) { var filename=normalizePhoto(value);return filename?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(filename.replace(/ /g,'_'))+'?width=160':''; }
    function photoInfo(presentation) {
        presentation=presentation||{};var filename,language=appearanceApi.normalize(presentation.appearance).language;
        try {filename=normalizePhoto(presentation.photo);}catch(_){return null;}
        if(!filename)return null;
        return {filename:filename,href:photoAddress(filename),src:presentation.localPhotoPreview===true ?
            'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="12" fill="#eaecf0"/><circle cx="80" cy="58" r="26" fill="#a2a9b1"/><path d="M30 145c0-38 18-57 50-57s50 19 50 57" fill="#a2a9b1"/></svg>') : photoSource(filename),
            alt:i18n.t(language,'Foto de {name}',{name:String(presentation.displayName||presentation.user||'')})};
    }
    function photoMarkup(presentation,wiki) {
        var settings=appearanceApi.normalize(presentation&&presentation.appearance),photo=photoInfo(presentation),t=function(source,params){return i18n.t(settings.language,source,params);};if(!photo)return '';
        var image=wiki ? '[[Ficheiro:'+literal(photo.filename)+'|'+settings.photoSize+'x'+settings.photoSize+'px|link='+photo.href+'|alt='+literal(photo.alt)+']]' :
            '<a class="dan-pu-profile-photo-image-link" href="'+escape(photo.href)+'"><img class="dan-pu-profile-photo-image" crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy" decoding="async" src="'+escape(photo.src)+'" alt="'+escape(photo.alt)+'" width="160" height="160"></a><span class="dan-pu-profile-photo-placeholder" hidden>'+t('Imagem indisponível')+'</span>';
        var caption=wiki ? '['+photo.href+' '+t('Ver arquivo no Commons')+']' : '<a class="dan-pu-profile-photo-link" href="'+escape(photo.href)+'">'+t('Ver arquivo no Commons')+'</a>';
        return '<div class="dan-pu-profile-photo" data-perfilwiki-photo="'+(wiki?literal(photo.filename):escape(photo.filename))+'" data-photo-size="'+settings.photoSize+'" data-photo-shape="'+settings.photoShape+'"><div class="dan-pu-profile-photo-visual">'+image+'</div><div class="dan-pu-profile-photo-caption">'+caption+'</div></div>';
    }
    function coverSource(value) { var filename=normalizePhoto(value);return filename?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(filename.replace(/ /g,'_'))+'?width=1200':''; }
    function coverInfo(presentation) {
        presentation=presentation||{};var filename,settings=appearanceApi.normalize(presentation.appearance),daily=settings.coverSource==='daily';
        if(settings.coverSource==='wiki-daily')return {native:true,filename:'',src:'',href:'',localPreview:presentation.localCoverPreview===true,caption:nativeCoverApi.caption(false,settings.language)};
        var proof=daily&&dailyCoverApi?dailyCoverApi.normalize(presentation.dailyCover,presentation.now):null;
        try {filename=daily?proof&&proof.filename||'':normalizePhoto(presentation.coverImage);}catch(_){return null;}
        if(!filename&&!daily)return null;
        var illustration='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#b8d8ef"/><stop offset="1" stop-color="#e8f1ed"/></linearGradient></defs><rect width="1200" height="300" fill="url(#sky)"/><circle cx="965" cy="72" r="33" fill="#fff3ca"/><path d="M0 210L175 65l195 159L577 91l201 149 188-122 234 102v80H0Z" fill="#9cb8bc"/><path d="M0 252l178-97 200 117 190-104 187 94 201-86 244 83v41H0Z" fill="#597e78"/><path d="M0 282l241-57 239 64 230-49 226 41 264-62v81H0Z" fill="#315e53"/></svg>';
        return {filename:filename,href:photoAddress(filename),src:presentation.localCoverPreview===true?'data:image/svg+xml,'+encodeURIComponent(illustration):coverSource(filename),
            alt:daily?i18n.t(settings.language,'Imagem do dia do Wikimedia Commons'):i18n.t(settings.language,'Capa do perfil de {name}',{name:String(presentation.displayName||presentation.user||'')}),
            daily:daily,proof:proof,pending:daily&&!filename&&presentation.localCoverPreview!==true,
            caption:daily?(presentation.localCoverPreview===true&&!proof?i18n.t(settings.language,'Imagem do dia do Commons · Prévia ilustrativa'):proof?i18n.t(settings.language,'Imagem do dia do Commons')+' · '+i18n.date(settings.language,proof.date+'T00:00:00Z',{day:'2-digit',month:'2-digit',year:'numeric'})+(proof.artist?' · '+proof.artist:'')+(proof.license?' · '+proof.license:''):i18n.t(settings.language,'Imagem do dia do Commons · Aguardando consulta')):''};
    }
    function coverMarkup(presentation,wiki) {
        var cover=coverInfo(presentation),language=appearanceApi.normalize(presentation&&presentation.appearance).language,t=function(source,params){return i18n.t(language,source,params);};if(!cover)return '';
        if(cover.native)return '<div class="dan-pu-profile-cover" data-perfilwiki-cover="" data-perfilwiki-cover-source="wiki-daily"><div class="dan-pu-profile-cover-native-body">'+(wiki?nativeCoverApi.wikitext(language):cover.localPreview?nativeCoverApi.preview(undefined,language):'<div class="dan-pu-profile-cover-pending">'+t('Imagem do dia da Wikipédia em português')+'</div>')+'</div><div class="dan-pu-profile-cover-caption">'+(wiki?nativeCoverApi.caption(true,language):escape(cover.caption))+'</div></div>';
        var image=cover.pending||wiki&&!cover.filename?'<div class="dan-pu-profile-cover-pending">'+t('Imagem do dia do Commons')+'</div>':wiki&&cover.filename?'[[Ficheiro:'+literal(cover.filename)+'|1200px|link='+cover.href+'|alt='+literal(cover.alt)+']]' :
            (cover.href?'<a class="dan-pu-profile-cover-image-link" href="'+escape(cover.href)+'">':'')+'<img class="dan-pu-profile-cover-image" crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy" decoding="async" src="'+escape(cover.src)+'" alt="'+escape(cover.alt)+'" width="1200" height="300">'+(cover.href?'</a>':'')+'<span class="dan-pu-profile-cover-placeholder" hidden>'+t('Imagem de capa indisponível')+'</span>';
        var caption=cover.daily?'<div class="dan-pu-profile-cover-caption">'+(wiki?literal(cover.caption):escape(cover.caption))+(cover.href?' · '+(wiki?'['+cover.href+' '+t('Ver arquivo e créditos')+']':'<a href="'+escape(cover.href)+'">'+t('Ver arquivo e créditos')+'</a>'):'')+'</div>':'';
        return '<div class="dan-pu-profile-cover" data-perfilwiki-cover="'+(wiki?literal(cover.filename):escape(cover.filename))+'" data-perfilwiki-cover-source="'+(cover.daily?'daily':'manual')+'"'+(cover.proof?' data-perfilwiki-daily-cover="'+(wiki?literal(JSON.stringify(cover.proof)):escape(JSON.stringify(cover.proof)))+'"':'')+'>'+image+caption+'</div>';
    }
    return Object.freeze({normalize:function (value,limit) { return parse(value,limit).value; },tokens:tokens,html:html,wikitext:wikitext,append:append,
        normalizePhoto:normalizePhoto,photoAddress:photoAddress,photoSource:photoSource,photoInfo:photoInfo,photoMarkup:photoMarkup,
        normalizeCover:normalizePhoto,coverSource:coverSource,coverInfo:coverInfo,coverMarkup:coverMarkup});
}));
