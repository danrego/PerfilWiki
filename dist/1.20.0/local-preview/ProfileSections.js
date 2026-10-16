/* PerfilWiki. Personal wikitext stays outside the refreshed statistics. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./ProfileText.js'):root.PerfilWikiProfileText);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiProfileSections=api;
}(typeof window!=='undefined'?window:this,function(profileText){
    'use strict';
    var MAX_SECTIONS=8,MAX_CONTENT=50000,MAX_TOTAL=200000;
    var BEGIN='<!-- PERFILWIKI-CONTENT-BEGIN -->',END='<!-- PERFILWIKI-CONTENT-END -->';
    function escape(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function normalize(input){
        if(input===undefined)return [];
        if(!Array.isArray(input)||input.length>MAX_SECTIONS)throw new TypeError('Use até oito blocos de texto.');
        var total=0,result=[];
        input.forEach(function(row){
            if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).some(function(k){return ['title','content'].indexOf(k)<0;})||typeof row.title!=='string'||typeof row.content!=='string')throw new TypeError('Cada bloco precisa de título e conteúdo em texto.');
            var title=row.title.normalize('NFC').trim(),content=row.content;
            if(/[\x00-\x1f\x7f-\x9f<>\[\]{}|=]/.test(title)||Array.from(title).length>100)throw new TypeError('Use um título com até 100 caracteres, sem código ou quebras de linha.');
            if(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(content)||content.length>MAX_CONTENT)throw new TypeError('Use até 50.000 caracteres no conteúdo de cada bloco.');
            if(/PERFILWIKI-(?:PROFILE|ACTIVATION|CARDS|ACTIVITY|CONTENT)-(?:BEGIN|END)/i.test(content))throw new TypeError('Retire as marcas de instalação do conteúdo do bloco.');
            total+=content.length;
            if(total>MAX_TOTAL)throw new TypeError('Os blocos podem somar até 200.000 caracteres de conteúdo.');
            if(!title&&!content.trim())return;
            if(!title)throw new TypeError('Dê um título ao bloco de texto.');
            result.push({title:title,content:content});
        });
        return result;
    }
    // This is a small, inert approximation for the local installer. The original
    // wikitext is exported verbatim and is never sent to a parsing service.
    function inline(value,depth){
        depth=depth||0;
        if(depth>6)return escape(value);
        var expression=/\[\[|\[https?:\/\/|'''|''|\{\{|</g,out='',cursor=0,match;
        while((match=expression.exec(value))){
            var opener=match[0],closing=opener==='[['?']]':opener==='{{'?'}}':opener==='<'?'>':opener.charAt(0)==='['?']':opener;
            var end=value.indexOf(closing,match.index+opener.length);
            // A missing closer consumes the remaining literal text once, avoiding
            // repeated tail scans for malformed but otherwise permitted drafts.
            if(end<0)break;
            var token=value.slice(match.index,end+closing.length);
            out+=escape(value.slice(cursor,match.index));
            if(token.slice(0,2)==='[['){try{out+=profileText.html(token);}catch(_){out+='<code class="dan-pu-section-code">'+escape(token)+'</code>';}}
            else if(token.charAt(0)==='['){
                var link=/^\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\]$/.exec(token),safe=false;
                if(link){try{var url=new URL(link[1]);safe=['http:','https:'].indexOf(url.protocol)>=0&&!url.username&&!url.password;}catch(_) { /* Keep malformed addresses as text. */ }}
                out+=safe?'<a href="'+escape(link[1])+'" rel="noopener noreferrer">'+escape(link[2]||link[1])+'</a>':escape(token);
            }else if(token.slice(0,3)==="'''")out+='<strong>'+inline(token.slice(3,-3),depth+1)+'</strong>';
            else if(token.slice(0,2)==="''")out+='<em>'+inline(token.slice(2,-2),depth+1)+'</em>';
            else out+='<code class="dan-pu-section-code">'+escape(token)+'</code>';
            cursor=end+closing.length;expression.lastIndex=cursor;
        }
        return out+escape(value.slice(cursor));
    }
    function preview(content){
        var lines=content.replace(/\r\n?/g,'\n').split('\n'),out=[],paragraph=[],list=null,table=null;
        function flush(){if(paragraph.length){out.push('<p>'+inline(paragraph.join(' '))+'</p>');paragraph=[];}if(list){out.push('</'+list+'>');list=null;}}
        lines.forEach(function(line){
            if(table){table.push(line);if(/^\s*\|}/.test(line)){out.push('<details class="dan-pu-section-source"><summary>Tabela em wikitexto</summary><pre>'+escape(table.join('\n'))+'</pre></details>');table=null;}return;}
            if(/^\s*\{\|/.test(line)){flush();table=[line];return;}
            if(!line.trim()){flush();return;}
            var heading=/^(={2,6})\s*(.*?)\s*\1\s*$/.exec(line),item=/^([*#]+)\s*(.*)$/.exec(line);
            if(heading){flush();var level=Math.min(6,heading[1].length+1);out.push('<h'+level+'>'+inline(heading[2])+'</h'+level+'>');}
            else if(item){if(paragraph.length){out.push('<p>'+inline(paragraph.join(' '))+'</p>');paragraph=[];}var kind=item[1].charAt(0)==='#'?'ol':'ul';if(list!==kind){if(list)out.push('</'+list+'>');list=kind;out.push('<'+kind+'>');}out.push('<li>'+inline(item[2])+'</li>');}
            else{if(list){out.push('</'+list+'>');list=null;}paragraph.push(line);}
        });
        flush();if(table)out.push('<pre class="dan-pu-section-source">'+escape(table.join('\n'))+'</pre>');
        return out.join('');
    }
    function html(input,options){
        var rows=normalize(input);if(!rows.length)return '';options=options||{};
        return '<div id="dan-pu-content-sections" class="dan-pu-content-sections" data-perfilwiki-user="'+escape(options.user||'')+'">'+rows.map(function(row,index){
            return '<section class="dan-pu-content-section"><div class="dan-pu-content-section-heading"><h2>'+escape(row.title)+'</h2><button type="button" class="dan-pu-section-edit" data-perfilwiki-edit-section="'+index+'" aria-label="Editar '+escape(row.title)+'">Editar</button></div><div class="dan-pu-content-section-body">'+preview(row.content)+'</div></section>';
        }).join('')+'<p class="dan-pu-content-preview-note">Prévia simplificada. Predefinições e código HTML aparecem como texto. O código original é mantido na instalação.</p></div>';
    }
    function wikitext(input,options){
        var rows=normalize(input);if(!rows.length)return '';options=options||{};
        return BEGIN+'\n<div id="dan-pu-content-sections" class="dan-pu-content-sections" data-perfilwiki-user="'+escape(options.user||'')+'">\n'+rows.map(function(row){var title=escape(row.title).replace(/[~_]/g,function(c){return '&#'+c.charCodeAt(0)+';';});return '<div class="dan-pu-content-section">\n== '+title+' ==\n'+row.content+'\n</div>';}).join('\n')+'\n</div>\n'+END;
    }
    return Object.freeze({normalize:normalize,html:html,wikitext:wikitext,preview:preview,markers:Object.freeze({start:BEGIN,end:END}),limits:Object.freeze({sections:MAX_SECTIONS,title:100,content:MAX_CONTENT,total:MAX_TOTAL})});
}));
