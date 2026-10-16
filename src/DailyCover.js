/* PerfilWiki. Validated Commons daily-image metadata, without requests. CC BY-SA 4.0.
 * Feed: https://www.mediawiki.org/wiki/Wikifeeds */
(function(root,factory){
    var api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiDailyCover=api;
}(typeof window!=='undefined'?window:this,function(){
    'use strict';
    var keys=['version','date','filename','checkedAt','artist','license'];
    function today(now){try{var value=new Date(now===undefined?Date.now():now);return Number.isFinite(value.getTime())?value.toISOString().slice(0,10):null;}catch(_){return null;}}
    function day(value,now){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='2000-01-01'&&value<=today(now)&&new Date(value+'T00:00:00.000Z').toISOString().slice(0,10)===value;}
    function filename(value){
        if(typeof value!=='string'||/[\x00-\x1f\x7f-\x9f\u2028\u2029<>{}]/.test(value))return null;
        var normalized=value.normalize('NFC').trim().replace(/^(?:File|Ficheiro):\s*/i,'').replace(/_/g,' ').trim();
        return normalized&&Array.from(normalized).length<=240&&!/[\x00-\x1f\x7f-\x9f\u2028\u2029<>{}\[\]|:#?\/\\]/.test(normalized)&&
            !/%[0-9a-f]{2}|&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.test(normalized)&&!/^\./.test(normalized)&&/\.(?:jpe?g|png|webp|gif|svg)$/i.test(normalized)?normalized:null;
    }
    function plain(value,limit){return typeof value==='string'&&value===value.normalize('NFC').trim()&&value.length>0&&Array.from(value).length<=limit&&!/[\x00-\x1f\x7f-\x9f\u2028\u2029<>{}\[\]|]/.test(value)?value:null;}
    function normalize(proof,now){
        try{
            if(!proof||typeof proof!=='object'||Array.isArray(proof)||Object.keys(proof).some(function(key){return keys.indexOf(key)<0;})||['version','date','filename','checkedAt'].some(function(key){return !Object.prototype.hasOwnProperty.call(proof,key);})||proof.version!==1||!day(proof.date,now)||filename(proof.filename)!==proof.filename)return null;
            var checked=new Date(proof.checkedAt),clock=new Date(now===undefined?Date.now():now);
            if(typeof proof.checkedAt!=='string'||!Number.isFinite(checked.getTime())||checked.toISOString()!==proof.checkedAt||!Number.isFinite(clock.getTime())||checked>clock||proof.date>today(checked))return null;
            var result={version:1,date:proof.date,filename:proof.filename,checkedAt:proof.checkedAt};
            for(var index=0;index<2;index+=1){var key=index?'license':'artist';if(Object.prototype.hasOwnProperty.call(proof,key)){if(!plain(proof[key],index?120:200))return null;result[key]=proof[key];}}
            return result;
        }catch(_){return null;}
    }
    function fromFeed(data,date,now){
        try{
            if(!data||typeof data!=='object'||Array.isArray(data)||!day(date,now)||!data.image||typeof data.image!=='object'||Array.isArray(data.image)||typeof data.image.title!=='string'||!/^File:/.test(data.image.title))return null;
            var name=filename(data.image.title);if(!name)return null;
            var proof={version:1,date:date,filename:name,checkedAt:new Date(now===undefined?Date.now():now).toISOString()};
            var artist=data.image.artist&&plain(data.image.artist.text,200),license=data.image.license&&plain(data.image.license.type,120);
            if(artist)proof.artist=artist;if(license)proof.license=license;
            return normalize(proof,now);
        }catch(_){return null;}
    }
    function url(date,now){try{return day(date,now)?'https://pt.wikipedia.org/api/rest_v1/feed/featured/'+date.replace(/-/g,'/'):'';}catch(_){return '';}}
    function caption(proof){return 'Imagem do dia do Commons · '+proof.date.slice(8,10)+'/'+proof.date.slice(5,7)+'/'+proof.date.slice(0,4)+(proof.artist?' · '+proof.artist:'')+(proof.license?' · '+proof.license:'');}
    return Object.freeze({today:today,normalize:normalize,fromFeed:fromFeed,url:url,caption:caption});
}));
