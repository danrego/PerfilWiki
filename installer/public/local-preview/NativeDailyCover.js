/* PerfilWiki. Native date-selected ptwiki cover, without visitor scripts or requests.
 * Uses the same dated transclusion as ptwiki's main page. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiNativeDailyCover=api;
}(typeof window!=='undefined'?window:this,function(i18n){
    'use strict';
    var date='{{CURRENTDAY}} de {{CURRENTMONTHNAME}} de {{CURRENTYEAR}}';
    var title='Wikipédia:Imagem em destaque/'+date;
    function pageTitle(){return title;}
    function transclusion(){return '{{'+title+'|min=1200|max=1200}}';}
    function wikitext(language){
        return '{{#ifexist:'+title+'\n|'+transclusion()+'\n|<div class="dan-pu-profile-cover-pending">'+i18n.t(language,'Imagem do dia indisponível')+'</div>\n}}';
    }
    function caption(wiki,language){
        return wiki?'[['+title+'|'+i18n.t(language,'Imagem do dia da Wikipédia em português')+']] · '+(language&&language.indexOf('pt-')!==0?'{{CURRENTYEAR}}-{{CURRENTMONTH}}-{{CURRENTDAY2}}':date)+i18n.t(language,' · Clique na imagem para ver o arquivo e os créditos.'):
            i18n.t(language,'Imagem do dia da Wikipédia em português · Prévia ilustrativa');
    }
    function preview(orientation,language){
        var portrait=orientation==='portrait',width=portrait?600:1200,height=portrait?1000:800;
        var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><rect width="1200" height="800" fill="#d9e8ed"/><circle cx="940" cy="180" r="85" fill="#fff0bf"/><path d="M0 590L260 180l260 410L770 300l430 330v170H0Z" fill="#8ca9ad"/><path d="M0 700l270-210 290 220 280-180 360 210v60H0Z" fill="#426e66"/></svg>';
        var description='<p>'+i18n.t(language,'Descrição ilustrativa da imagem do dia.')+'</p>';
        return '<div align="center"><table><tbody><tr><td><span class="imagem-destaque" typeof="mw:File"><a class="mw-file-description" href="#perfilwiki-local-daily-cover-credit"><img width="'+width+'" height="'+height+'" alt="'+i18n.t(language,'Prévia ilustrativa da imagem do dia da Wikipédia em português')+'" src="data:image/svg+xml,'+encodeURIComponent(svg)+'"></a></span></td>'+(portrait?'<td>'+description+'</td>':'')+'</tr></tbody></table>'+(portrait?'':description)+'</div>';
    }
    return Object.freeze({pageTitle:pageTitle,transclusion:transclusion,wikitext:wikitext,caption:caption,preview:preview});
}));
