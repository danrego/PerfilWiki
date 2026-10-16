/* PerfilWiki. Local-time presentation from Intl, without requests or timers. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiProfileClock=api;
}(typeof window!=='undefined'?window:this,function(i18n){
    'use strict';
    var cache=new Map();
    function formatters(timeZone,language){
        language=i18n.normalizeLanguage(language);
        var key=language+'|'+timeZone;
        if(typeof timeZone!=='string'||!timeZone)return null;
        if(cache.has(key))return cache.get(key);
        try{
            var options={timeZone:timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'};
            var value={clock:new Intl.DateTimeFormat(language+'-u-ca-gregory-nu-latn',options),
                date:new Intl.DateTimeFormat(language+'-u-ca-gregory-nu-latn',Object.assign({},options,{year:'numeric',month:'2-digit',day:'2-digit'})),offset:null,
                parts:new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn',{timeZone:timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})};
            try{value.offset=new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn',{timeZone:timeZone,timeZoneName:'longOffset'});}catch(_){}
            if(cache.size>=64)cache.delete(cache.keys().next().value);
            cache.set(key,value);return value;
        }catch(_){return null;}
    }
    function offsetAt(date,formats){
        if(formats.offset){
            var part=formats.offset.formatToParts(date).find(function(item){return item.type==='timeZoneName';});
            var raw=part&&part.value.replace(/−/g,'-');
            if(raw==='GMT'||raw==='UTC')return 'UTC+0';
            var matched=/^(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/.exec(raw||'');
            if(matched)return 'UTC'+matched[1]+Number(matched[2])+((matched[3]&&matched[3]!=='00'||matched[4]&&matched[4]!=='00')?':'+(matched[3]||'00'):'')+(matched[4]&&matched[4]!=='00'?':'+matched[4]:'');
        }
        var fields={};formats.parts.formatToParts(date).forEach(function(part){if(part.type!=='literal')fields[part.type]=Number(part.value);});
        var wall=Date.UTC(fields.year,fields.month-1,fields.day,fields.hour%24,fields.minute,fields.second),seconds=Math.round((wall-Math.floor(date.getTime()/1000)*1000)/1000);
        if(!Number.isFinite(seconds)||Math.abs(seconds)>86400)return null;
        var absolute=Math.abs(seconds),hours=Math.floor(absolute/3600),minutes=Math.floor(absolute%3600/60),remainder=absolute%60;
        return 'UTC'+(seconds<0?'-':'+')+hours+(minutes||remainder?':'+String(minutes).padStart(2,'0'):'')+(remainder?':'+String(remainder).padStart(2,'0'):'');
    }
    function details(now,timeZone,wiki,language){
        language=i18n.normalizeLanguage(language);
        try{
            var date=new Date(now===undefined?Date.now():now),formats=formatters(timeZone,language);
            if(!formats||!Number.isFinite(date.getTime()))throw new RangeError('Invalid clock');
            var offset=offsetAt(date,formats);if(!offset)throw new RangeError('Invalid offset');
            return {text:formats.clock.format(date)+' ('+offset+')',
                title:i18n.t(language,wiki?'Horário salvo em {date}':'Horário local em {date}',{date:formats.date.format(date)})+' ('+offset+') · '+timeZone,
                timestamp:date.toISOString()};
        }catch(_){return {text:i18n.t(language,'Horário indisponível'),title:i18n.t(language,'Horário indisponível'),timestamp:''};}
    }
    function text(now,timeZone,wiki,language){return details(now,timeZone,wiki,language).text;}
    function paint(node,now,timeZone,wiki,language){
        var value=details(now,timeZone,wiki,language);
        node.textContent=value.text;node.setAttribute('title',value.title);
        node.setAttribute('data-perfilwiki-clock-at',value.timestamp);
        node.setAttribute('data-perfilwiki-timezone',timeZone);
        return node;
    }
    function update(document,now,user,timeZone,language){
        if(!document||typeof document.getElementById!=='function'||typeof user!=='string'||!user)return 0;
        var seen=new Set(),updated=0;
        ['dan-pu-profile-header','dan-pu-ritmo','dan-pu-estatisticas'].forEach(function(id){
            var root=document.getElementById(id);
            if(!root||!root.getAttribute||root.getAttribute('data-perfilwiki-user')!==user||!root.querySelectorAll)return;
            Array.from(root.querySelectorAll('.dan-pu-local-time')).forEach(function(node){
                if(seen.has(node)||!node.getAttribute)return;
                for(var parent=node.parentNode;parent&&parent!==root;parent=parent.parentNode){
                    if(parent.getAttribute&&parent.getAttribute('data-perfilwiki-user')&&parent.getAttribute('data-perfilwiki-user')!==user)return;
                }
                var zone=node.getAttribute('data-perfilwiki-timezone');
                if(typeof timeZone!=='string'||zone!==timeZone)return;
                seen.add(node);paint(node,now,zone,false,language);updated+=1;
            });
        });
        return updated;
    }
    return Object.freeze({text:text,details:details,paint:paint,update:update});
}));
