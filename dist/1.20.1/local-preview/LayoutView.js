/* PerfilWiki. Request-free block composition and owned DOM arrangement. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./Appearance.js'):root.PerfilWikiAppearance);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiLayoutView=api;
}(typeof window!=='undefined'?window:this,function(appearance){
    'use strict';
    var SLOT='<div id="dan-pu-integrated-cards" class="dan-pu-integrated-cards-slot" data-perfilwiki-cards-slot="true"></div>';
    function integrated(settings){return settings.layout==='integrated'&&settings.showCards&&settings.showActivity;}
    function slotMarkup(input){return integrated(appearance.normalize(input))?SLOT:'';}
    function compose(cardsMarkup,activityMarkup,input,headerMarkup){
        var settings=appearance.normalize(input);
        if(cardsMarkup===undefined||cardsMarkup===null)cardsMarkup='';
        if(activityMarkup===undefined||activityMarkup===null)activityMarkup='';
        if(headerMarkup===undefined||headerMarkup===null)headerMarkup='';
        if(typeof cardsMarkup!=='string'||typeof activityMarkup!=='string'||typeof headerMarkup!=='string')throw new TypeError('Os blocos do painel devem conter texto.');
        var cards=settings.showCards?cardsMarkup:'',activity=settings.showActivity?activityMarkup:'';
        if(integrated(settings)&&activity.indexOf(SLOT)>=0&&activity.indexOf(SLOT)===activity.lastIndexOf(SLOT))return headerMarkup+activity.replace(SLOT,function(){return SLOT.slice(0,-6)+cards+'</div>';});
        return headerMarkup+(settings.blockOrder==='activity-first'?activity+cards:cards+activity);
    }
    function owned(node,user){return !!node&&typeof node.getAttribute==='function'&&node.getAttribute('data-perfilwiki-user')===user;}
    function contains(parent,node){for(var cursor=node;cursor;cursor=cursor.parentNode)if(cursor===parent)return true;return false;}
    function groupOf(node,user){
        for(var parent=node&&node.parentNode;parent;parent=parent.parentNode){
            if(typeof parent.getAttribute==='function'&&parent.getAttribute('data-perfilwiki-group')==='true')return owned(parent,user)?parent:null;
        }
        return null;
    }
    function arrange(document,input,user){
        var settings=appearance.normalize(input);
        if(!document||typeof document.getElementById!=='function'||typeof user!=='string'||!user)return false;
        var cards=document.getElementById('dan-pu-estatisticas'),activity=document.getElementById('dan-pu-ritmo');
        if(!owned(cards,user)||!owned(activity,user)||typeof activity.querySelector!=='function')return false;
        var slot=activity.querySelector('#dan-pu-integrated-cards');
        if(slot&&(!slot.getAttribute||slot.getAttribute('data-perfilwiki-cards-slot')!=='true'||!contains(activity,slot)))slot=null;
        var nested=!!slot&&cards.parentNode===slot;
        var group=groupOf(activity,user),sameGroup=!!group&&groupOf(cards,user)===group&&activity.parentNode===group;
        var direct=sameGroup&&(cards.parentNode===group||nested);
        if(integrated(settings)){
            if(!slot||nested||!direct||typeof slot.appendChild!=='function')return false;
            slot.appendChild(cards);return true;
        }
        var changed=false;
        // An existing owned combined snapshot may be unwrapped by its owner.
        // Extract only from our recognized slot, immediately beside its panel.
        if(nested&&activity.parentNode&&typeof activity.parentNode.insertBefore==='function'){
            activity.parentNode.insertBefore(cards,activity);changed=true;
        }
        if(settings.layout!=='together'||!settings.showCards||!settings.showActivity||!sameGroup||cards.parentNode!==group)return changed;
        var first=settings.blockOrder==='activity-first'?activity:cards,second=first===activity?cards:activity;
        var children=Array.from(group.children||group.childNodes||[]);
        if(children.indexOf(first)>children.indexOf(second)){group.insertBefore(first,second);changed=true;}
        return changed;
    }
    return Object.freeze({slotMarkup:slotMarkup,compose:compose,arrange:arrange});
}));
