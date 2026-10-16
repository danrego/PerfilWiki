/* PerfilWiki. Bounded data-only editing handoff and lossless managed-block replacement. CC BY-SA 4.0. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PerfilWikiLiveEdit=api;}(typeof globalThis==='object'?globalThis:this,function(){
    'use strict';
    var ORIGIN='https://danrego.github.io',PATH='/PerfilWiki/INICIO.html',WIKI='https://pt.wikipedia.org';
    var PROTOCOL='perfilwiki-live-edit-v1',NONCE=/^[a-f0-9]{32}$/,MAX_BYTES=1048576,TTL=60000;
    var BEGIN='<!-- PERFILWIKI-PROFILE-BEGIN -->',END='<!-- PERFILWIKI-PROFILE-END -->';
    function bytes(value){var size=0;for(var i=0;i<value.length;i+=1){var c=value.charCodeAt(i);if(c<128)size+=1;else if(c<2048)size+=2;else if(c>=0xd800&&c<=0xdbff&&i+1<value.length&&value.charCodeAt(i+1)>=0xdc00&&value.charCodeAt(i+1)<=0xdfff){size+=4;i+=1;}else size+=3;}return size;}
    function record(value){return !!value&&Object.prototype.toString.call(value)==='[object Object]';}
    function keys(value,expected){return record(value)&&Object.keys(value).sort().join(',')===expected.slice().sort().join(',');}
    function safe(value,depth,parents,counter){
        if(depth>20||++counter.count>100000)throw new TypeError('Dados do painel inválidos.');
        if(value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return;
        if(typeof value==='string'){if(value.length>MAX_BYTES)throw new TypeError('Dados do painel muito grandes.');return;}
        if(!Array.isArray(value)&&!record(value)||parents.indexOf(value)>=0)throw new TypeError('Dados do painel inválidos.');
        var names=Object.keys(value);if(names.length>10000||names.some(function(name){return ['__proto__','prototype','constructor'].indexOf(name)>=0;}))throw new TypeError('Dados do painel inválidos.');
        parents.push(value);names.forEach(function(name){safe(value[name],depth+1,parents,counter);});parents.pop();
    }
    function bounded(value){safe(value,0,[],{count:0});if(bytes(JSON.stringify(value))>MAX_BYTES)throw new TypeError('Dados do painel muito grandes.');return value;}
    function localOrigin(value){try{var url=new URL(value);return ['http:','https:'].indexOf(url.protocol)>=0&&['localhost','127.0.0.1','[::1]'].indexOf(url.hostname)>=0&&!url.username&&!url.password&&url.origin===value;}catch(_){return false;}}
    function installerUrl(nonce){if(!NONCE.test(nonce||''))throw new TypeError('Identificador inválido.');return ORIGIN+PATH+'?perfilwiki=handoff#perfilwiki-handoff='+nonce;}
    function nonceFromUrl(value){try{var url=new URL(value),allowed=url.origin===ORIGIN&&url.pathname===PATH||localOrigin(url.origin);if(!allowed||url.username||url.password||url.searchParams.getAll('perfilwiki').length!==1||url.searchParams.get('perfilwiki')!=='handoff')return null;var match=/^#perfilwiki-handoff=([a-f0-9]{32})$/.exec(url.hash);return match?match[1]:null;}catch(_){return null;}}
    function signal(type,nonce){if(['hello','ready','accepted'].indexOf(type)<0||!NONCE.test(nonce||''))throw new TypeError('Mensagem inválida.');return {protocol:PROTOCOL,type:type,nonce:nonce};}
    function isSignal(value,type,nonce){return keys(value,['protocol','type','nonce'])&&value.protocol===PROTOCOL&&value.type===type&&value.nonce===nonce&&NONCE.test(nonce||'');}
    function page(value,title){
        if(value===null)return null;
        if(!keys(value,['title','revisionId','content'])||value.title!==title||!Number.isSafeInteger(value.revisionId)||value.revisionId<=0||typeof value.content!=='string'||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value.content))throw new TypeError('A página pública recebida é inválida.');
        bounded(value);return {title:value.title,revisionId:value.revisionId,content:value.content};
    }
    function source(value,user,title){if(!keys(value,['origin','user','page'])||value.origin!==WIKI||value.user!==user)throw new TypeError('A conta recebida não corresponde ao painel.');return {origin:WIKI,user:user,page:page(value.page,title)};}
    function envelope(config,publicPage,nonce,now){
        if(!NONCE.test(nonce||'')||!Number.isFinite(now))throw new TypeError('Mensagem inválida.');
        return bounded({protocol:PROTOCOL,type:'settings',nonce:nonce,createdAt:now,config:config,page:publicPage});
    }
    function validateEnvelope(value,nonce,now){
        if(!keys(value,['protocol','type','nonce','createdAt','config','page'])||value.protocol!==PROTOCOL||value.type!=='settings'||value.nonce!==nonce||!NONCE.test(nonce||'')||!Number.isFinite(now)||!Number.isFinite(value.createdAt)||value.createdAt>now+5000||now-value.createdAt>TTL||!record(value.config))throw new TypeError('A transferência do painel expirou ou é inválida.');
        return bounded(value);
    }
    function activeWikitext(text){
        if(typeof text!=='string')throw new TypeError('Use o código completo da página.');
        var chunks=[],cursor=0,scan=0,start;
        function mask(from,to){chunks.push(text.slice(cursor,from),text.slice(from,to).replace(/[^\r\n]/g,' '));cursor=to;scan=to;}
        function tagEndAt(from){
            var quote='',end=from+1;
            for(;end<text.length;end+=1){var character=text.charAt(end);if(quote){if(character===quote)quote='';}else if(character==='"'||character==="'"){quote=character;}else if(character==='>')return end;else if(character==='<')ambiguous();}
            ambiguous();
        }
        function ambiguous(){throw new TypeError('Há trechos de código ou comentários incompletos. Confira a página antes de substituir o painel.');}
        while((start=text.indexOf('<',scan))>=0){
            if(text.slice(start,start+4)==='<!--'){
                if(text.slice(start,start+BEGIN.length)===BEGIN){scan=start+BEGIN.length;continue;}
                if(text.slice(start,start+END.length)===END){scan=start+END.length;continue;}
                var commentEnd=text.indexOf('-->',start+4);if(commentEnd<0)ambiguous();mask(start,commentEnd+3);continue;
            }
            var match=/^<\/?(nowiki|pre|source|syntaxhighlight)(?=[\s/>])/i.exec(text.slice(start,start+32));
            if(!match){
                if(/^<\/?[A-Za-z][A-Za-z0-9:_-]*(?=[\s/>])/.test(text.slice(start,start+128))){
                    var ordinaryEnd=tagEndAt(start)+1;
                    // Keep identifiers available for panel detection while
                    // hiding comment/transclusion delimiters inside attributes.
                    chunks.push(text.slice(cursor,start),text.slice(start,ordinaryEnd).replace(/[<>{}]/g,' '));cursor=ordinaryEnd;scan=ordinaryEnd;
                }else{scan=start+1;}
                continue;
            }
            if(text.charAt(start+1)==='/')ambiguous();
            var tagEnd=tagEndAt(start);
            if(/\/\s*$/.test(text.slice(start,tagEnd))){mask(start,tagEnd+1);continue;}
            var closing=new RegExp('</'+match[1]+'\\s*>','ig');closing.lastIndex=tagEnd+1;var close=closing.exec(text);if(!close)ambiguous();mask(start,close.index+close[0].length);
        }
        chunks.push(text.slice(cursor));return chunks.join('');
    }
    function profileRange(text){
        var start=text.indexOf(BEGIN),end=text.indexOf(END);
        if(start<0&&end<0)throw new TypeError('Esta página ainda não tem um bloco PerfilWiki delimitado. Substitua o painel manualmente, preservando seus outros textos e categorias.');
        if(start<0||end<start||text.indexOf(BEGIN,start+BEGIN.length)>=0||text.indexOf(END,end+END.length)>=0)throw new TypeError('Há marcas incompletas ou repetidas do PerfilWiki. Confira o texto antes de substituir o painel.');
        return {start:start,end:end+END.length};
    }
    function range(text){return profileRange(activeWikitext(text));}
    function managedBlock(text){var span=range(text);return text.slice(span.start,span.end);}
    function replaceProfile(original,replacement){var span=range(original),block=managedBlock(replacement);return original.slice(0,span.start)+block+original.slice(span.end);}
    function hasProfile(text){try{range(text);return true;}catch(_){return false;}}
    function containsPanel(text){try{var active=activeWikitext(text);return hasProfile(text)||/\bid\s*=\s*["'](?:dan-pu-ritmo|dan-pu-estatisticas)["']/i.test(active);}catch(_){return false;}}
    function relativeSource(text){
        if(typeof text!=='string'||containsPanel(text))return null;
        var active;try{active=activeWikitext(text);}catch(_){return null;}
        var matches=Array.from(active.matchAll(/^[ \t]*\{\{\/([^{}|\r\n]+)\}\}[ \t]*$/gm));
        if(matches.length!==1)return null;
        var label=matches[0][1].replace(/_/g,' ').trim().normalize('NFC');
        return label&&label.length<=255&&!/[:\/#<>\[\]{}|\x00-\x1f\x7f-\x9f]/.test(label)&&label.indexOf('..')<0&&label!=='.'?label:null;
    }
    return Object.freeze({installerOrigin:ORIGIN,installerPath:PATH,wikiOrigin:WIKI,protocol:PROTOCOL,limits:Object.freeze({bytes:MAX_BYTES,lifetimeMs:TTL}),bytes:bytes,bounded:bounded,localOrigin:localOrigin,installerUrl:installerUrl,nonceFromUrl:nonceFromUrl,signal:signal,isSignal:isSignal,page:page,source:source,envelope:envelope,validateEnvelope:validateEnvelope,managedBlock:managedBlock,replaceProfile:replaceProfile,hasProfile:hasProfile,containsPanel:containsPanel,relativeSource:relativeSource});
}));
