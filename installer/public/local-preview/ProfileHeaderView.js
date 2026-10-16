/* PerfilWiki. Public profile header shared by local preview and saved output. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./ActivityView.js'):root.PerfilWikiActivityView,
        typeof module==='object'&&module.exports?require('./Appearance.js'):root.PerfilWikiAppearance,
        typeof module==='object'&&module.exports?require('./ProfileClock.js'):root.PerfilWikiProfileClock,
        typeof module==='object'&&module.exports?require('./ProfileText.js'):root.PerfilWikiProfileText,
        typeof module === 'object' && module.exports ? require('./I18n.js') : root.PerfilWikiI18n);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiProfileHeaderView=api;
}(typeof window!=='undefined'?window:this,function(activity,appearance,clock,profileText,i18n){
    'use strict';
    var language='pt-BR';
    function tr(source,params){return i18n.t(language,source,params);}
    function inLanguage(fn,presentation,args){var previous=language;language=i18n.normalizeLanguage(presentation&&presentation.language||presentation&&presentation.appearance&&presentation.appearance.language);try{return fn.apply(null,args);}finally{language=previous;}}

    function escape(value,wiki){var text=String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});return wiki?text.replace(/[\[\]{}|~_\r\n]/g,function(c){return '&#'+c.charCodeAt(0)+';';}):text;}
    function identity(state,presentation){return presentation.user||state&&state.config&&state.config.user||'';}
    function rootStyle(settings){var colors=appearance.topColors(settings);return 'border-top-color:'+appearance.colors(settings).accent+';background:'+colors.background+';color:'+colors.foreground+';';}
    function rootClasses(settings,cover,content){return 'dan-pu-profile-header '+appearance.classes(settings)+' dan-pu-top-'+appearance.topColors(settings).tone+(cover?' dan-pu-has-cover':'')+(cover&&!content?' dan-pu-cover-only':'');}
    function markup(state,presentation,wiki){
        presentation=presentation||{};var user=identity(state,presentation);if(!user)return '';
        var settings=appearance.normalize(presentation.appearance),options=Object.assign({},presentation,{user:user,appearance:settings});
        var content=activity.profileMarkup(state,options,wiki,'top'),cover=profileText.coverMarkup(options,wiki);if(!content&&!cover)return '';
        return '<div id="dan-pu-profile-header" class="'+rootClasses(settings,cover,content)+'" data-perfilwiki-user="'+escape(user,wiki)+'" data-perfilwiki-project="pt.wikipedia.org" data-perfilwiki-profile-top="true" data-perfilwiki-appearance="'+escape(JSON.stringify(settings),wiki)+'" lang="'+settings.language+'" style="'+rootStyle(settings)+'">'+cover+'<div class="dan-pu-top-profile-slot">'+content+'</div></div>';
    }
    function owned(node,user){return node&&node.getAttribute&&node.getAttribute('data-perfilwiki-user')===user;}
    function anchor(document,user){
        if(document.querySelectorAll){
            var group=Array.from(document.querySelectorAll('[data-perfilwiki-group="true"]')).find(function(node){return owned(node,user);});if(group)return group;
            var panel=Array.from(document.querySelectorAll('#dan-pu-ritmo, #dan-pu-estatisticas')).find(function(node){return owned(node,user);});if(panel)return panel;
        }
        return ['dan-pu-ritmo','dan-pu-estatisticas'].map(function(id){return document.getElementById(id);}).find(function(node){return owned(node,user);})||null;
    }
    function paint(document,state,presentation){
        presentation=presentation||{};var user=identity(state,presentation);
        if(!document||!user||!document.getElementById||!document.createElement)return false;
        var root=document.getElementById('dan-pu-profile-header');
        if(root&&(!owned(root,user)||root.getAttribute('data-perfilwiki-profile-top')!=='true'))return false;
        var saved=root&&activity.captureAccountCreated(root,user,presentation.now),options=Object.assign({},presentation,{user:user});
        if(saved&&!options.savedAccountCreated)options.savedAccountCreated=saved;
        var settings=appearance.normalize(options.appearance),content=activity.profileMarkup(state,options,false,'top'),coverData=profileText.coverInfo(options);
        if(!content&&!coverData){if(root&&root.parentNode){root.parentNode.removeChild(root);return true;}return false;}
        var before=anchor(document,user);
        if(!root){
            if(!before||!before.parentNode)return false;
            root=document.createElement('div');root.id='dan-pu-profile-header';root.setAttribute('data-perfilwiki-user',user);root.setAttribute('data-perfilwiki-project','pt.wikipedia.org');root.setAttribute('data-perfilwiki-profile-top','true');
            var slot=document.createElement('div');slot.className='dan-pu-top-profile-slot';root.appendChild(slot);before.parentNode.insertBefore(root,before);
        }
        root.setAttribute('lang',settings.language);root.className=rootClasses(settings,coverData,content);root.setAttribute('data-perfilwiki-appearance',JSON.stringify(settings));root.style.borderTopColor=appearance.colors(settings).accent;
        var topColors=appearance.topColors(settings);root.style.background=topColors.background;root.style.color=topColors.foreground;
        var cover=root.querySelector('.dan-pu-profile-cover'),image=cover&&cover.querySelector('.dan-pu-profile-cover-image');
        if(!coverData){if(cover&&cover.parentNode)cover.parentNode.removeChild(cover);}
        else if(coverData.native){
            // Keep the server-rendered dated transclusion and its image node intact.
            if(!cover||cover.getAttribute('data-perfilwiki-cover-source')!=='wiki-daily'){
                if(cover&&cover.parentNode)cover.parentNode.removeChild(cover);
                cover=document.createElement('div');cover.className='dan-pu-profile-cover';cover.setAttribute('data-perfilwiki-cover','');cover.setAttribute('data-perfilwiki-cover-source','wiki-daily');
                var nativeBody=document.createElement('div');nativeBody.className='dan-pu-profile-cover-native-body';
                var nativePending=document.createElement('div');nativePending.className='dan-pu-profile-cover-pending';nativePending.textContent=tr("Imagem do dia da Wikipédia em português");nativeBody.appendChild(nativePending);cover.appendChild(nativeBody);
                var nativeCaption=document.createElement('div');nativeCaption.className='dan-pu-profile-cover-caption';nativeCaption.textContent=tr("Atualize o trecho do perfil para carregar a capa pelo calendário da Wikipédia.");cover.appendChild(nativeCaption);
                root.insertBefore(cover,root.firstChild||root.childNodes&&root.childNodes[0]||null);
            }
        }
        else{
            var proof=coverData.proof?JSON.stringify(coverData.proof):'',source=coverData.daily?'daily':'manual';
            if(!cover||cover.getAttribute('data-perfilwiki-cover')!==coverData.filename||cover.getAttribute('data-perfilwiki-cover-source')!==source||(cover.getAttribute('data-perfilwiki-daily-cover')||'')!==proof||coverData.src&&(!image||image.getAttribute('src')!==coverData.src)){
                if(cover&&cover.parentNode)cover.parentNode.removeChild(cover);
                cover=document.createElement('div');cover.className='dan-pu-profile-cover';cover.setAttribute('data-perfilwiki-cover',coverData.filename);cover.setAttribute('data-perfilwiki-cover-source',source);
                if(proof)cover.setAttribute('data-perfilwiki-daily-cover',proof);
                if(coverData.src){
                    var link=coverData.href?document.createElement('a'):null;if(link){link.className='dan-pu-profile-cover-image-link';link.setAttribute('href',coverData.href);}
                    image=document.createElement('img');image.className='dan-pu-profile-cover-image';
                    [['width','1200'],['height','300'],['crossorigin','anonymous'],['referrerpolicy','no-referrer'],['loading','lazy'],['decoding','async'],['src',coverData.src]].forEach(function(pair){image.setAttribute(pair[0],pair[1]);});
                    if(link){link.appendChild(image);cover.appendChild(link);}else cover.appendChild(image);
                    var fallback=document.createElement('span');fallback.className='dan-pu-profile-cover-placeholder';fallback.hidden=true;fallback.textContent=tr("Imagem de capa indisponível");cover.appendChild(fallback);
                }else{image=null;var pending=document.createElement('div');pending.className='dan-pu-profile-cover-pending';pending.textContent=tr("Imagem do dia do Commons");cover.appendChild(pending);}
                if(coverData.daily){var caption=document.createElement('div');caption.className='dan-pu-profile-cover-caption';var captionText=document.createElement('span');captionText.textContent=coverData.caption+(coverData.href?' · ':'');caption.appendChild(captionText);if(coverData.href){var credits=document.createElement('a');credits.setAttribute('href',coverData.href);credits.textContent=tr("Ver arquivo e créditos");caption.appendChild(credits);}cover.appendChild(caption);}
                root.insertBefore(cover,root.firstChild||root.childNodes&&root.childNodes[0]||null);
            }
            if(image)image.setAttribute('alt',coverData.alt);
        }
        activity.paintProfile(document,state,options,'top');clock.update(document,presentation.now,user,options.timeZone||state&&state.config&&state.config.timeZone,settings.language);
        return true;
    }
    return Object.freeze({html:function(state,presentation){return inLanguage(markup,presentation,[state,presentation,false]);},wikitext:function(state,presentation){return inLanguage(markup,presentation,[state,presentation,true]);},paint:function(){return inLanguage(paint,arguments[2],arguments);},clockText:clock.text,updateClocks:clock.update,rootStyle:rootStyle,coverInfo:profileText.coverInfo,coverMarkup:profileText.coverMarkup});
}));
