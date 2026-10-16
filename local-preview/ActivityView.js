/* Interface do painel Atividade na Wikipédia. Nenhuma requisição ou edição. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Presenter.js') : root.PerfilWikiPresenter,
        typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./ProfileText.js') : root.PerfilWikiProfileText,
        typeof module === 'object' && module.exports ? require('./LayoutView.js') : root.PerfilWikiLayoutView,
        typeof module === 'object' && module.exports ? require('./ProfileFields.js') : root.PerfilWikiProfileFields,
        typeof module === 'object' && module.exports ? require('./ProfileClock.js') : root.PerfilWikiProfileClock,
        typeof module === 'object' && module.exports ? require('./UserGroups.js') : root.PerfilWikiUserGroups,
        typeof module === 'object' && module.exports ? require('./I18n.js') : root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiActivityView = api; }
}(typeof window !== 'undefined' ? window : this, function (presenter, appearance, profileTextApi, layoutView, fieldsApi, clockApi, groupsApi, i18n) {
    'use strict';
    var language='pt-BR';
    function tr(source,params){return i18n.t(language,source,params);}
    function inLanguage(fn,presentation,args){var previous=language;language=i18n.normalizeLanguage(presentation&&presentation.language||presentation&&presentation.appearance&&presentation.appearance.language);try{return fn.apply(null,args);}finally{language=previous;}}

    var months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    var weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    var numberFormatter = {format:function(value){return i18n.number(language,value);}};
    var accountDateFormatter = {format:function(value){return i18n.date(language,value,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});}};
    function escape(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function escapeData(value, wiki) {
        var text = escape(value);
        return wiki ? text.replace(/[\[\]{}|~_\r\n\u2028\u2029]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) : text;
    }
    function number(value) { return Number.isSafeInteger(value) ? numberFormatter.format(value) : tr("Aguardando dados"); }
    function shortDate(value) {
        if(language!=='pt-BR'&&language!=='pt-PT')return i18n.date(language,value+'T00:00:00Z',{day:'numeric',month:'short'});
        var p = value.split('-').map(Number);
        return p[2] + ' ' + months[p[1] - 1];
    }
    function range(period) {
        if(language!=='pt-BR'&&language!=='pt-PT')return i18n.date(language,period.start+'T00:00:00Z',{day:'numeric',month:'short',year:'numeric'})+' – '+i18n.date(language,period.end+'T00:00:00Z',{day:'numeric',month:'short',year:'numeric'});
        return shortDate(period.start) + (period.start.slice(0, 4) !== period.end.slice(0, 4) ? tr(" de ") + period.start.slice(0, 4) : '') + tr(" a ") + shortDate(period.end) + tr(" de ") + period.end.slice(0, 4);
    }
    function wikiLink(title, label, wiki, external) {
        if (wiki && !external) {
            // Titles are public API titles. Escape parser delimiters defensively.
            return '[[' + title.replace(/[\[\]{}|<>\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + '|' + escape(label).replace(/[\[\]{}|\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + ']]';
        }
        var href = external || 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
        return wiki ? '[' + href + ' ' + escape(label) + ']' : '<a href="' + escape(href) + '" style="color:#36c;text-decoration:none;">' + escape(label) + '</a>';
    }
    function installationFooter(presentation, settings, wiki) {
        if (appearance.footerOwner(settings) !== 'activity') { return ''; }
        return ("<div id=\"dan-pu-ritmo-install\" style=\"margin-top:18px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;\">"+tr("Gostou deste painel?")+" ") +
            wikiLink(presentation.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki', tr("Veja como adicionar à sua página de usuário."), wiki) + '</div>';
    }
    function profileColors(settings,scope) {
        var automatic=scope==='top'?appearance.topColors(settings).foreground:'#54595d';
        return {name:settings.nameColor||automatic,label:settings.labelColor||automatic,information:settings.informationColor||automatic,
            labelStyle:settings.labelColor||settings.informationColor?'color:'+(settings.labelColor||automatic)+';':''};
    }
    function profileLabel(displayName, settings, wiki, scope) {
        return '<div class="dan-pu-profile-label" style="color:'+profileColors(settings,scope).name+';font-size:' + settings.nameFontSize + 'px;text-align:' + settings.nameAlignment + ';">' + escapeData(displayName,wiki) + '</div>';
    }
    function profileText(value, wiki) {
        var text = escapeData(value,wiki);
        return wiki ? text.replace(/:/g,'&#58;') : text;
    }
    function profileValue(value, wiki,settings) {
        try { return wiki ? profileTextApi.wikitext(value,settings&&settings.informationColor) : profileTextApi.html(value,settings&&settings.informationColor); }
        catch (_) { return profileText(value,wiki); }
    }
    function appendProfileValue(document, parent, value,settings) {
        try { profileTextApi.append(document,parent,value,settings&&settings.informationColor); }
        catch (_) { parent.textContent = value; }
    }
    function profileTimestamp(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
        var date = new Date(value);
        return Number.isFinite(date.getTime()) && date.toISOString().replace('.000Z','Z') === value.replace('.000Z','Z') ? date.getTime() : null;
    }
    function accountCreated(state, user, now) {
        var stats = state.statistics, evidence = stats && stats.registrationCoverage;
        var earliest = stats && stats.metrics && profileTimestamp(stats.metrics.earliestRegistration);
        var checked = evidence && profileTimestamp(evidence.checkedAt);
        var clock = new Date(now === undefined ? Date.now() : now).getTime();
        if (!stats || stats.user !== user || !evidence || evidence.version !== 1 || evidence.user !== user ||
            !Array.isArray(evidence.accounts) || earliest === null || checked === null || !Number.isFinite(clock) || checked > clock) { return null; }
        var known = [], complete = evidence.complete === true, valid = true;
        [evidence.globalRegistration].concat(evidence.accounts.map(function (account) { return account && account.registration; })).forEach(function (value) {
            var timestamp = profileTimestamp(value);
            if (timestamp === null) { complete = false; }
            else if (timestamp > checked) { valid = false; }
            else { known.push(timestamp); }
        });
        if (!valid || !known.length || Math.min.apply(null,known) !== earliest) { return null; }
        return {date:accountDateFormatter.format(new Date(earliest)),timestamp:new Date(earliest).toISOString(),complete:complete};
    }
    function createdParts(created) {
        return created ? {label:created.complete?tr("Conta criada em:"):tr("Data de criação mais antiga disponível:"),value:created.date} : {label:tr("Data de criação"),value:tr("indisponível")};
    }
    function metadataLabel(text,labelStyle) { return '<strong style="font-weight:600;'+(labelStyle||'')+'">'+escape(text)+'</strong>'; }
    function createdMarkup(created,labelStyle) { var parts=createdParts(created);return metadataLabel(parts.label,labelStyle)+' '+escape(parts.value); }

    function createdProof(created, user) {
        return created ? JSON.stringify({version:1,user:user,timestamp:created.timestamp,complete:created.complete}) : null;
    }
    function storedCreated(raw, user, now) {
        try {
            var proof = raw && JSON.parse(raw);
            var timestamp = proof && profileTimestamp(proof.timestamp);
            var clock = new Date(now === undefined ? Date.now() : now).getTime();
            if (!proof || proof.version !== 1 || proof.user !== user || typeof proof.complete !== 'boolean' || timestamp === null ||
                !Number.isFinite(clock) || timestamp > clock) { return null; }
            return {date:accountDateFormatter.format(new Date(timestamp)),timestamp:new Date(timestamp).toISOString(),complete:proof.complete};
        } catch (_) { return null; }
    }
    function savedCreated(element, user, now) {
        return storedCreated(element && element.getAttribute('data-perfilwiki-account-created'),user,now);
    }
    function captureAccountCreated(root, user, now) {
        if (!root || !root.getAttribute || root.getAttribute('data-perfilwiki-user') !== user || !root.querySelector) { return null; }
        var created = savedCreated(root.querySelector('.dan-pu-account-created'),user,now);
        return createdProof(created,user);
    }
    function profileRows(state, presentation, settings, user, scope, created) {
        var rows=[],time=settings.showLocalTime&&appearance.fieldIn(settings,scope,'localTime')?{
            type:'time',zone:presentation.timeZone||state.config&&state.config.timeZone||'UTC',now:presentation.now
        }:null;
        if(appearance.fieldIn(settings,scope,'location')&&typeof presentation.location==='string'&&presentation.location.trim()) {
            rows.push({type:'location',value:presentation.location.normalize('NFC').trim(),time:time});
        }else if(time){
            rows.push(time);
        }
        var normalizedFields=[];
        if(Array.isArray(presentation.customFields))presentation.customFields.slice(0,3).forEach(function(field){
            try { normalizedFields=normalizedFields.concat(fieldsApi.normalize([field])); } catch (_) { /* An incomplete draft does not hide other fields. */ }
        });
        normalizedFields.forEach(function(field){
            if(!appearance.fieldIn(settings,scope,field.placement))return;
            rows.push({type:'field',label:field.label,field:field,values:fieldsApi.values(field),layout:fieldsApi.layoutOf(field),separator:fieldsApi.separatorOf(field)});
        });
        if(settings.showUserGroups&&appearance.fieldIn(settings,scope,'userGroups')){
            var stats=state.statistics,proof=groupsApi.fromProof(stats&&stats.userGroups,user,presentation.now);
            rows.push({type:'groups',proof:proof,text:proof?groupsApi.text(proof,user,presentation.now,settings.language):stats&&Array.isArray(stats.errors)&&stats.errors.indexOf('Estatutos na ptwiki')>=0?tr("Estatutos indisponíveis"):tr("Aguardando dados")});
        }
        if(settings.showAccountCreated&&appearance.fieldIn(settings,scope,'accountCreated'))rows.push({type:'created',created:created});
        return rows;
    }
    function currentCreated(state,presentation,user) {
        var created=accountCreated(state||{},user,presentation.now);
        if(!created&&!(state&&state.statistics&&state.statistics.registrationCoverage))created=storedCreated(presentation.savedAccountCreated,user,presentation.now);
        return created;
    }
    function fieldLabelStyle(field,settings,scope) {
        return field.labelColor ? 'color:'+field.labelColor+';' : profileColors(settings,scope).labelStyle;
    }
    function fieldValueColor(field,index) {
        return Object.prototype.hasOwnProperty.call(field,'value') ? field.valueColor || '' : field.valueColors && field.valueColors[index] || '';
    }
    function fieldValueMarkup(value,field,index,wiki,settings) {
        var color=fieldValueColor(field,index), effective=color?{informationColor:color}:settings;
        var output=profileValue(value,wiki,effective);
        return color?'<span style="color:'+color+';">'+output+'</span>':output;
    }
    function fieldMarkup(row,wiki,settings,scope) {
                settings=settings||appearance.normalize();var labelStyle=fieldLabelStyle(row.field,settings,scope);
                if(!row.values.length)return '<div class="dan-pu-profile-field"'+(Object.prototype.hasOwnProperty.call(row.field,'values')?' data-field-layout="'+row.layout+'"':'')+'><span style="font-weight:600;'+labelStyle+'">'+profileText(row.label,wiki)+'</span></div>';
                if(row.field&&Object.prototype.hasOwnProperty.call(row.field,'value'))return '<div class="dan-pu-profile-field"><span style="font-weight:600;'+labelStyle+'">'+profileText(row.label,wiki)+':</span> '+fieldValueMarkup(row.field.value,row.field,0,wiki,settings)+'</div>';
                var values=row.values.map(function(value,index){return fieldValueMarkup(value,row.field,index,wiki,settings);}), contents;
                if(row.layout==='bullets')contents='<ul class="dan-pu-field-values" data-layout="bullets">'+values.map(function(value){return '<li>'+value+'</li>';}).join('')+'</ul>';
                else if(row.layout==='lines')contents='<div class="dan-pu-field-values" data-layout="lines">'+values.map(function(value){return '<div>'+value+'</div>';}).join('')+'</div>';
                else contents='<span class="dan-pu-field-values" data-layout="inline">'+values.map(function(value,index){return (index?'<span class="dan-pu-field-separator" aria-hidden="true">'+(row.separator==='dot'?' · ':row.separator==='space'?' ':wiki?' &#124; ':' | ')+'</span>':'')+'<span class="dan-pu-field-item">'+value+'</span>';}).join('')+'</span>';
                return '<div class="dan-pu-profile-field" data-field-layout="'+row.layout+'"><span style="font-weight:600;'+labelStyle+'">'+profileText(row.label,wiki)+':</span> '+contents+'</div>';
    }
    function customFieldMarkup(field,wiki,appearanceInput,scope) {
        var normalized=fieldsApi.normalize([field]);
        if(!normalized.length)return '';
        var value=normalized[0];
        return fieldMarkup({field:value,label:value.label,values:fieldsApi.values(value),layout:fieldsApi.layoutOf(value),separator:fieldsApi.separatorOf(value)},wiki,appearance.normalize(appearanceInput),scope||'activity');
    }
    function groupsCheckedTitle(proof) { return tr('Estatutos consultados em {date} UTC',{date:proof.checkedAt.slice(0,19).replace('T',' ')}); }
    function profileMetadata(rows,settings,wiki,user,scope) {
        var textColors=profileColors(settings,scope);
        function clockMarkup(row,tag){var value=clockApi.details(row.now,row.zone,wiki,settings.language);return '<'+tag+' class="dan-pu-local-time" data-perfilwiki-timezone="'+escapeData(row.zone,wiki)+'" data-perfilwiki-clock-at="'+escapeData(value.timestamp,wiki)+'" title="'+escapeData(value.title,wiki)+'">'+escape(value.text)+'</'+tag+'>';}
        var markup=rows.map(function(row){
            if(row.type==='location')return row.time?'<div class="dan-pu-profile-location-time"><span class="dan-pu-profile-location">'+profileValue(row.value,wiki,settings)+'</span><span class="dan-pu-location-time-separator" aria-hidden="true"> · </span>'+clockMarkup(row.time,'span')+'</div>':'<div class="dan-pu-profile-location">'+profileValue(row.value,wiki,settings)+'</div>';
            if(row.type==='field')return fieldMarkup(row,wiki,settings,scope);
            if(row.type==='time')return clockMarkup(row,'div');
            if(row.type==='groups')return '<div class="dan-pu-user-groups"'+(row.proof?' data-perfilwiki-user-groups="'+escapeData(JSON.stringify(row.proof),wiki)+'" title="'+escape(groupsCheckedTitle(row.proof))+'"':'')+'>'+metadataLabel(tr("Estatutos:"),textColors.labelStyle)+' '+escape(row.text)+'</div>';
            var created=row.created;
            return '<div class="dan-pu-account-created"'+(created?' data-perfilwiki-account-created="'+escapeData(createdProof(created,user),wiki)+'"':'')+'>'+createdMarkup(created,textColors.labelStyle)+
                (created&&!created.complete?("<div class=\"dan-pu-account-created-note\" style=\"margin-top:2px;font-size:12px;\">"+tr("Pode haver contas anteriores sem data registrada.")+"</div>"):'')+'</div>';
        }).join('');
        return rows.length?'<div class="dan-pu-profile-details" style="margin-top:6px;color:'+textColors.information+';font-size:13px;text-align:'+settings.nameAlignment+';" data-layout="'+settings.profileDetailsLayout+'" data-align="'+settings.nameAlignment+'">'+markup+'</div>':'';
    }
    function profileMarkup(state,presentation,wiki,scope) {
        presentation=presentation||{};state=state||{};scope=scope||'activity';
        var settings=appearance.normalize(presentation.appearance);
        if(!appearance.profileIn(settings,scope,presentation.customFields))return '';
        var user=presentation.user||state.config&&state.config.user||'';
        var displayName=typeof presentation.displayName==='string'&&presentation.displayName.trim()?presentation.displayName.normalize('NFC').trim():user;
        var rows=profileRows(state,presentation,settings,user,scope,currentCreated(state,presentation,user));
        var label=appearance.fieldIn(settings,scope,'name')?profileLabel(displayName,settings,wiki,scope):'';
        var photo=appearance.fieldIn(settings,scope,'photo')?profileTextApi.photoMarkup(Object.assign({},presentation,{displayName:displayName,user:user}),wiki):'';
        var details=profileMetadata(rows,settings,wiki,user,scope);
        return label||photo||details?'<div class="dan-pu-profile-content" data-layout="'+settings.profileDetailsLayout+'" data-photo-align="'+settings.photoAlignment+'" style="text-align:'+settings.nameAlignment+';">'+photo+'<div class="dan-pu-profile-copy">'+label+details+'</div></div>':'';
    }
    function paintProfile(document,state,presentation,scope) {
        presentation=presentation||{};
        var user=typeof presentation.user==='string'?presentation.user:state&&state.config&&state.config.user;
        if(!document||!user)return false;
        var settings=appearance.normalize(presentation.appearance),changed=false;
        var roots=[{scope:'activity',root:document.getElementById('dan-pu-ritmo')},{scope:'cards',root:document.getElementById('dan-pu-estatisticas')},{scope:'top',root:document.getElementById('dan-pu-profile-header')}];
        var retained=storedCreated(presentation.savedAccountCreated,user,presentation.now);
        roots.forEach(function(item){var root=item.root;if(!retained&&root&&root.getAttribute&&root.getAttribute('data-perfilwiki-user')===user&&root.querySelector)retained=savedCreated(root.querySelector('.dan-pu-account-created'),user,presentation.now);});
        var created=accountCreated(state||{},user,presentation.now);
        if(!created&&!(state&&state.statistics&&state.statistics.registrationCoverage))created=retained;
        function remove(node){if(node&&node.parentNode)node.parentNode.removeChild(node);}
        function element(className,text){var node=document.createElement('div');node.className=className;if(text!==undefined)node.textContent=text;return node;}
        function appendLabel(node,text,textColors){var label=document.createElement('strong');label.style.fontWeight='600';if(textColors.labelStyle)label.style.color=textColors.label;label.textContent=text;node.appendChild(label);}
        roots.forEach(function(item){
            var root=item.root;
            if(scope&&scope!==item.scope||!root||!root.getAttribute||root.getAttribute('data-perfilwiki-user')!==user||!root.querySelector)return;
            var textColors=profileColors(settings,item.scope);
            var slot=root.querySelector(item.scope==='cards'?'.dan-pu-cards-profile':item.scope==='top'?'.dan-pu-top-profile-slot':'.dan-pu-profile-slot'),profileRoot=slot||root;
            var label=profileRoot.querySelector('.dan-pu-profile-label'),previous=profileRoot.querySelector('.dan-pu-profile-details'),photo=profileRoot.querySelector('.dan-pu-profile-photo');
            var content=profileRoot.querySelector('.dan-pu-profile-content');
            var showName=appearance.fieldIn(settings,item.scope,'name'),rows=profileRows(state||{},presentation,settings,user,item.scope,created);
            var photoData=appearance.fieldIn(settings,item.scope,'photo')?profileTextApi.photoInfo(Object.assign({},presentation,{user:user})):null;
            if(!showName&&!rows.length&&!photoData){remove(content);remove(label);remove(previous);remove(photo);if(item.scope==='cards'){remove(slot);root.style.gridAutoRows='';}changed=true;return;}
            if(item.scope==='cards')root.style.gridAutoRows='auto';
            if(!slot){
                if(!root.insertBefore)return;
                slot=element(item.scope==='cards'?'dan-pu-cards-profile':item.scope==='top'?'dan-pu-top-profile-slot':'dan-pu-profile-slot');
                if(item.scope==='cards'){slot.style.gridColumn='1 / -1';slot.style.marginBottom='8px';slot.style.paddingBottom='12px';}
                root.insertBefore(slot,label&&label.parentNode===root?label:root.firstChild||root.childNodes&&root.childNodes[0]||null);
            }
            if(item.scope==='cards')slot.style.borderBottom=settings.profileDetailsLayout==='inline'?'':'1px solid #eaecf0';
            if(!content){content=element('dan-pu-profile-content');slot.appendChild(content);}
            content.setAttribute('data-layout',settings.profileDetailsLayout);content.setAttribute('data-photo-align',settings.photoAlignment);content.style.textAlign=settings.nameAlignment;
            var copy=content.querySelector('.dan-pu-profile-copy');if(!copy){copy=element('dan-pu-profile-copy');content.appendChild(copy);}
            var displayName=typeof presentation.displayName==='string'&&presentation.displayName.trim()?presentation.displayName.normalize('NFC').trim():user;
            if(showName){
                if(!label)label=element('dan-pu-profile-label');
                if(label.parentNode!==copy)copy.appendChild(label);
                label.textContent=displayName;label.style.textAlign=settings.nameAlignment;label.style.color=textColors.name;label.style.fontSize=settings.nameFontSize+'px';
            }else remove(label);
            var details=element('dan-pu-profile-details');details.style.marginTop='6px';details.style.color=textColors.information;details.style.fontSize='13px';details.style.textAlign=settings.nameAlignment;
            details.setAttribute('data-layout',settings.profileDetailsLayout);details.setAttribute('data-align',settings.nameAlignment);
            rows.forEach(function(row){
                var node;
                if(row.type==='location'){
                    node=element(row.time?'dan-pu-profile-location-time':'dan-pu-profile-location');
                    var location=row.time?document.createElement('span'):node;
                    if(row.time){location.className='dan-pu-profile-location';node.appendChild(location);}
                    appendProfileValue(document,location,row.value,settings);
                    if(row.time){
                        var between=document.createElement('span');between.className='dan-pu-location-time-separator';between.setAttribute('aria-hidden','true');between.textContent=' · ';node.appendChild(between);
                        var clock=document.createElement('span');clock.className='dan-pu-local-time';clockApi.paint(clock,row.time.now,row.time.zone,false,settings.language);node.appendChild(clock);
                    }
                }
                else if(row.type==='field'){
                    node=element('dan-pu-profile-field');node.setAttribute('data-field-layout',row.layout);
                    var key=document.createElement('span');key.style.fontWeight='600';if(fieldLabelStyle(row.field,settings,item.scope))key.style.color=row.field.labelColor||textColors.label;key.textContent=row.label+(row.values.length?': ':'');node.appendChild(key);
                    if(!row.values.length){details.appendChild(node);return;}
                    if(Object.prototype.hasOwnProperty.call(row.field,'value')){
                        var legacyValue=document.createElement('span'),legacyColor=fieldValueColor(row.field,0);if(legacyColor)legacyValue.style.color=legacyColor;appendProfileValue(document,legacyValue,row.field.value,legacyColor?{informationColor:legacyColor}:settings);node.appendChild(legacyValue);details.appendChild(node);return;
                    }
                    var values=document.createElement(row.layout==='bullets'?'ul':row.layout==='lines'?'div':'span');values.className='dan-pu-field-values';values.setAttribute('data-layout',row.layout);
                    row.values.forEach(function(value,index){
                        if(row.layout==='inline'&&index){var separator=document.createElement('span');separator.className='dan-pu-field-separator';separator.setAttribute('aria-hidden','true');separator.textContent=row.separator==='dot'?' · ':row.separator==='space'?' ':' | ';values.appendChild(separator);}
                        var valueNode=document.createElement(row.layout==='bullets'?'li':row.layout==='lines'?'div':'span'),valueColor=fieldValueColor(row.field,index);valueNode.className='dan-pu-field-item';if(valueColor)valueNode.style.color=valueColor;appendProfileValue(document,valueNode,value,valueColor?{informationColor:valueColor}:settings);values.appendChild(valueNode);
                    });node.appendChild(values);
                }else if(row.type==='time'){
                    node=element('dan-pu-local-time');clockApi.paint(node,row.now,row.zone,false,settings.language);
                }else if(row.type==='groups'){
                    node=element('dan-pu-user-groups');appendLabel(node,tr("Estatutos:"),textColors);var groupsValue=document.createElement('span');groupsValue.textContent=' '+row.text;node.appendChild(groupsValue);if(row.proof){node.setAttribute('data-perfilwiki-user-groups',JSON.stringify(row.proof));node.setAttribute('title',groupsCheckedTitle(row.proof));}
                }else{
                    node=element('dan-pu-account-created');var creation=createdParts(row.created);appendLabel(node,creation.label,textColors);var dateValue=document.createElement('span');dateValue.textContent=' '+creation.value;node.appendChild(dateValue);if(row.created)node.setAttribute('data-perfilwiki-account-created',createdProof(row.created,user));
                    if(row.created&&!row.created.complete){var note=element('dan-pu-account-created-note',tr("Pode haver contas anteriores sem data registrada."));note.style.marginTop='2px';note.style.fontSize='12px';node.appendChild(note);}
                }
                details.appendChild(node);
            });
            remove(previous);if(rows.length)copy.appendChild(details);
            if(!photoData)remove(photo);
            else{
                var image=photo&&photo.querySelector('.dan-pu-profile-photo-image');
                if(!photo||photo.getAttribute('data-perfilwiki-photo')!==photoData.filename||!image||image.getAttribute('src')!==photoData.src){
                    remove(photo);photo=element('dan-pu-profile-photo');photo.setAttribute('data-perfilwiki-photo',photoData.filename);
                    var imageLink=document.createElement('a');imageLink.className='dan-pu-profile-photo-image-link';imageLink.setAttribute('href',photoData.href);
                    image=document.createElement('img');image.className='dan-pu-profile-photo-image';
                    [['width','160'],['height','160'],['crossorigin','anonymous'],['referrerpolicy','no-referrer'],['loading','lazy'],['decoding','async'],['src',photoData.src]].forEach(function(pair){image.setAttribute(pair[0],pair[1]);});
                    var visual=element('dan-pu-profile-photo-visual');imageLink.appendChild(image);visual.appendChild(imageLink);photo.appendChild(visual);
                    var placeholder=document.createElement('span');placeholder.className='dan-pu-profile-photo-placeholder';placeholder.hidden=true;placeholder.textContent=tr("Imagem indisponível");visual.appendChild(placeholder);
                    var caption=element('dan-pu-profile-photo-caption'),link=document.createElement('a');link.className='dan-pu-profile-photo-link';link.setAttribute('href',photoData.href);link.textContent=tr("Ver arquivo no Commons");caption.appendChild(link);photo.appendChild(caption);
                }
                var photoVisual=photo.querySelector('.dan-pu-profile-photo-visual');
                if(!photoVisual){
                    photoVisual=element('dan-pu-profile-photo-visual');photo.insertBefore(photoVisual,photo.firstChild||photo.childNodes&&photo.childNodes[0]||null);
                    var retainedLink=photo.querySelector('.dan-pu-profile-photo-image-link'),retainedPlaceholder=photo.querySelector('.dan-pu-profile-photo-placeholder');
                    if(retainedLink)photoVisual.appendChild(retainedLink);if(retainedPlaceholder)photoVisual.appendChild(retainedPlaceholder);
                }
                photo.setAttribute('data-photo-size',settings.photoSize);photo.setAttribute('data-photo-shape',settings.photoShape);
                image.setAttribute('alt',tr('Foto de {name}',{name:displayName}));
                if(photo.parentNode!==content)content.insertBefore(photo,copy);
            }
            changed=true;
        });
        return changed;
    }
    function streakGoal(current, best) {
        var goals = [7, 14, 30, 45, 60, 90, 100, 150, 200, 250, 365, 500, 730, 1000];
        var maximum = Math.max(current, best || 0);
        while (goals[goals.length - 1] <= maximum) { goals.push(goals[goals.length - 1] + 365); }
        var nextIndex = goals.findIndex(function (days) { return days > current; });
        var earned = goals.filter(function (days) { return days <= maximum; });
        return { current: current, next: goals[nextIndex], following: goals[nextIndex + 1] || goals[nextIndex] + 365,
            achieved: earned.length ? earned[earned.length - 1] : 0,
            remaining: goals[nextIndex] - current, percent: Math.min(100, current / goals[nextIndex] * 100) };
    }
    function render(state, wiki, allRows) {
        var a = state.activity && state.activity.summary;
        var p = state.pageviews;
        var user = state.config && state.config.user || '';
        var activityZone = state.config && state.config.timeZone || 'UTC';
        var presentation = allRows && typeof allRows === 'object' ? allRows : {};
        var displayName = typeof presentation.displayName === 'string' && presentation.displayName.trim() ? presentation.displayName.normalize('NFC').trim() : user;
        var settings = appearance.normalize(presentation.appearance), colors = appearance.colors(settings), palette = colors.palette;
        if (!settings.showActivity) { return ''; }
        var attributes = ' data-perfilwiki-user="' + escape(user) + '" class="' + appearance.classes(settings) + '" data-perfilwiki-appearance="' + escape(JSON.stringify(settings)) + '" lang="'+settings.language+'"';
        var profile = '<div class="dan-pu-profile-slot" data-perfilwiki-profile-slot="activity">' + profileMarkup(state,presentation,wiki,'activity') + '</div>';
        if (!a) { return (wiki ? '<templatestyles src="' + escape(presentation.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos') + '" />' : '') + '<div id="dan-pu-ritmo"' + attributes + ("><strong>"+tr("Atividade na Wikipédia em Português")+"</strong>") + profile + layoutView.slotMarkup(settings) + ("<p>"+tr("As estatísticas ainda não foram consultadas.")+"</p>") + installationFooter(presentation, settings, wiki) + '</div>'; }
        var h = [];
        h.push('<div id="dan-pu-ritmo"' + attributes + ' data-perfilwiki-project="pt.wikipedia.org" style="clear:both;box-sizing:border-box;margin:2.1em 0;padding:' + (settings.density === 'compact' ? '18px' : settings.density === 'roomy' ? '32px' : '24px') + ';border:1px solid #c8ccd1;border-top:3px solid ' + colors.accent + ';border-radius:12px;background:#fff;color:#202122;font-size:14px;line-height:1.5;">');
        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:20px;margin-bottom:25px;">');
        var lastEdit = presenter && presenter.lastEditAt(state);
        var lastExact = lastEdit && presenter.absoluteTime(lastEdit,settings.language);
        var lastLabel = wiki ? lastExact : lastEdit && presenter.relativeTime(lastEdit, presentation.now,settings.language);
        h.push(("<div style=\"flex:1 1 300px;min-width:0;\"><div style=\"font-family:Georgia,serif;font-size:29px;font-weight:bold;line-height:1.2;margin-bottom:7px;\">"+tr("Atividade na Wikipédia em Português")+"</div>"));
        var profileIndex=h.length;h.push(profile);
        h.push('<div class="dan-pu-last-edit-line" style="margin-top:10px;color:#54595d;font-size:12px;">' + (wiki ? tr("Última edição consultada") : tr("Última edição")) + ' · <span class="dan-pu-last-edit" data-live="' + (wiki ? 'false' : 'true') + '"' + (lastEdit ? ' data-timestamp="' + escape(lastEdit) + '" title="' + escape(lastExact) + '"' : '') + '>' + escape(lastLabel || (lastEdit ? tr("Horário indisponível") : tr("Nenhuma edição encontrada"))) + '</span></div></div>');
        var goal = streakGoal(a.currentStreak, a.bestStreak);
        // Wikipedia removes numeric ARIA attributes from saved markup. A static
        // image label preserves the full value for visitors; the owner's live
        // DOM uses the native progressbar semantics.
        var goalAria = wiki ? 'role="img" aria-label="' + escape(tr('{current} de {goal} dias seguidos, faltam {remaining} dias',{current:a.currentStreak,goal:goal.next,remaining:goal.remaining}))+'"' :
            'role="progressbar" aria-label="'+tr('Meta de dias seguidos')+'" aria-valuemin="0" aria-valuemax="' + goal.next + '" aria-valuenow="' + a.currentStreak + '"';
        h.push('<div style="flex:1 1 300px;background:#faf7ef;border-radius:10px;padding:16px 20px;">');
        h.push('<div style="display:flex;align-items:center;gap:24px;"><div style="flex:1;"><div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(a.currentStreak) + ("</div><div style=\"color:#54595d;\">"+tr("dias seguidos")+"</div></div><div style=\"flex:1.5;min-width:140px;\"><div style=\"color:#54595d;font-size:12px;\">"+tr("Próxima meta")+"</div><div style=\"font-size:24px;font-weight:700;line-height:1.4;\">") + number(goal.next) + (tr(" dias")+"</div><div style=\"display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#54595d;margin:4px 0;\">") + tr('{current} de {goal}',{current:number(a.currentStreak),goal:number(goal.next)}) + '<span>' + tr('Faltam {number}',{number:number(goal.remaining)}) + '</span></div><div ' + goalAria + ' style="height:7px;border-radius:4px;background:#e5e1d7;overflow:hidden;"><div style="height:7px;width:' + goal.percent.toFixed(2) + '%;background:#36c;border-radius:4px;"></div></div></div></div>');
        h.push('<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:13px;padding-top:11px;border-top:1px solid #e5e1d7;font-size:12px;"><span style="color:#246342;font-weight:600;">' + (goal.achieved ? '✓ ' + tr('{number} dias alcançados',{number:number(goal.achieved)}) : tr("Seu primeiro marco: 7 dias")) + '</span><span style="color:#54595d;">' + tr('Depois: {number} dias',{number:number(goal.following)}) + '</span></div></div></div>');
        h.push(layoutView.slotMarkup(settings));
        h.push('<div style="border:1px solid #d8dce3;border-radius:10px;padding:18px;margin-bottom:20px;">');
        h.push(("<div style=\"display:flex;flex-wrap:wrap;align-items:baseline;gap:7px 14px;margin-bottom:18px;\"><strong style=\"font-family:Georgia,serif;font-size:20px;\">"+tr("12 semanas")+"</strong><span style=\"color:#54595d;\">") + shortDate(a.gridStart) + tr(" a ") + shortDate(a.today) + ("</span><span style=\"margin-left:auto;color:#54595d;font-size:12px;\">"+tr("Edições por dia")+"</span></div>"));
        var weeks = a.weeks;
        var max = Math.max.apply(null, weeks.flatMap(function (w) { return w.days.map(function (d) { return d.count || 0; }); }));
        var legend = palette.map(function (color) { return '<span style="display:inline-block;width:15px;height:15px;border-radius:3px;background:' + color + ';vertical-align:middle;"></span>'; }).join(' ');
        h.push('<div style="overflow-x:auto;"><div style="min-width:240px;display:grid;grid-template-columns:28px 1fr;gap:8px;">');
        h.push('<div style="display:grid;grid-template-rows:repeat(7,24px);gap:3px;font-size:11px;color:#54595d;">' + (language==='pt-BR'?weekdays:Array.from({length:7},function(_,index){return i18n.date(language,Date.UTC(2026,9,12+index),{weekday:'short'});})).map(function (d) { return '<span style="display:flex;align-items:center;">' + d + '</span>'; }).join('') + '</div>');
        h.push('<div role="img" aria-label="' + escape(tr('{edits} edições em {days} dos últimos 30 dias. Fuso {zone}.',{edits:a.edits30,days:a.activeDays30,zone:activityZone})) + '" style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));grid-template-rows:repeat(7,24px);grid-auto-flow:column;gap:3px;">');
        weeks.forEach(function (week) {
            week.days.forEach(function (day) {
                var bucket = !day.count ? 0 : Math.max(1, Math.min(4, Math.ceil(Math.log(1 + day.count) / Math.log(1 + Math.max(2, max)) * 4)));
                var label = day.future ? shortDate(day.date) + tr(", dia ainda não concluído") : shortDate(day.date) + ': ' + number(day.count) + tr(" edições");
                h.push('<span data-date="' + day.date + '" data-count="' + day.count + '" title="' + escape(label) + '" style="display:block;border-radius:3px;background:' + (day.future ? '#f8f9fa' : palette[bucket]) + ';' + (day.date === a.today ? 'outline:2px solid #202122;outline-offset:1px;' : '') + '"></span>');
            });
        });
        h.push('</div><span></span><div style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));gap:3px;font-size:9px;color:#54595d;">' + weeks.map(function (w) { var date = w.start.split('-').map(Number); return '<span style="text-align:center;white-space:nowrap;">' + date[2] + '/' + date[1] + '</span>'; }).join('') + '</div></div></div>');
        h.push('<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:17px;font-size:12px;color:#54595d;"><span>' + tr('{edits} edições · {articles} artigos diferentes editados nos últimos 30 dias',{edits:number(a.edits30),articles:number(a.articles30)}) + '</span><span>'+tr('Nenhuma')+' ' + legend + ' '+tr('Mais edições')+'</span></div></div>');
        h.push('<div class="dan-pu-readership" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-project="pt.wikipedia.org" data-metric-version="after-first-edit-v1" data-total-model="all-periods-all-eligible-v1" style="border:1px solid #d8dce3;border-radius:10px;padding:' + (settings.density === 'roomy' ? '24px' : '18px') + ';">');
        h.push('<div class="dan-pu-readership-heading" style="font-family:Georgia,serif;font-size:23px;font-weight:bold;line-height:1.25;margin-bottom:5px;">' + tr('Visualizações dos artigos editados por {name}.',{name:escapeData(displayName,wiki)}) + '</div>');
        h.push(("<div style=\"color:#54595d;font-size:12px;\">"+tr("Somente após sua primeira edição em cada artigo.")+"</div>"));
        var explanation = tr('Os períodos somam as visitas recebidas depois da sua primeira edição em cada artigo. Os totais abrangem todos os artigos elegíveis, mesmo quando a lista mostra apenas uma parte. A contagem de visualizações começa no dia seguinte à primeira edição, em UTC. As sequências usam o fuso {zone}. A última edição corresponde ao histórico consultado, que pode ter sido atualizado antes desta visita.',{zone:escape(activityZone)});
        if (wiki) {
            h.push('<div class="dan-pu-data-help">' + wikiLink(presentation.documentationPage ? presentation.documentationPage + '#Como_os_dados_são_contados' : 'Usuário:Daniel G Rego/PerfilWiki#Como_os_dados_são_contados', tr("Sobre estes dados"), true) + '</div>');
        } else {
            h.push(("<details class=\"dan-pu-data-help\"><summary>"+tr("Sobre estes dados")+"</summary><div>") + explanation + '</div></details>');
        }
        var keys = ['30d', '90d', '12m', 'since', 'custom'];
        var labels = { '30d': tr("30 dias"), '90d': tr("90 dias"), '12m': tr("12 meses"), 'since': tr("Total acumulado"), 'custom':tr("Personalizado") };
        var titles = { '30d': tr("Visualizações nos últimos 30 dias"), '90d': tr("Visualizações nos últimos 90 dias"), '12m': tr("Visualizações nos últimos 12 meses"), 'since': tr("Visualizações acumuladas"), 'custom':tr("Visualizações no período escolhido") };
        keys.forEach(function (key) { h.push('<span id="dan-pu-view-' + key + '" class="dan-pu-view-target" aria-hidden="true"></span>'); });
        h.push(("<div class=\"dan-pu-period-tabs plainlinks\" role=\"navigation\" aria-label=\""+tr("Período de visualizações")+"\">"));
        keys.forEach(function (key) {
            h.push(wiki ? '<span id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '">[{{fullurl:{{FULLPAGENAME}}}}#dan-pu-view-' + key + ' ' + labels[key] + ']</span>' :
                '<a id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '" href="#dan-pu-view-' + key + '">' + labels[key] + '</a>');
        });
        h.push('</div>');
        keys.forEach(function (key) {
            var profile = p && p.periods && p.periods[key];
            var previousProfile = p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.periods && p.lastCompleteSnapshot.periods[key];
            if (key === 'custom') {
                var chosen = settings.customRange;
                var matches = function (period) { return chosen && period && period.start === chosen.start && period.end === chosen.end; };
                if (!matches(p && p.customRange) || !matches(profile && profile.period)) { profile = null; }
                if (!matches(previousProfile && previousProfile.period)) { previousProfile = null; }
            }
            var needsPrevious = profile && !profile.complete;
            var data = needsPrevious && (profile.lastCompleteSnapshot || previousProfile) || profile;
            // The display cap never changes the all-article totals or cached proofs.
            if (key === 'custom' && data && !matches(data.period)) { data = profile; }
            var rows = (data && data.rows || []).slice().sort(function (x, y) { return (y.views == null ? -1 : y.views) - (x.views == null ? -1 : x.views) || x.title.localeCompare(y.title, 'pt'); }).slice(0, 500);
            var eligible = data && data.proof && Number.isSafeInteger(data.proof.eligible) ? data.proof.eligible : (p && p.metadata && p.metadata.cohort ? p.metadata.cohort.length : 0);
            var requestedRows = allRows && allRows.visibleCounts && allRows.visibleCounts[key];
            var expanded = allRows === true || allRows && allRows.expanded && allRows.expanded[key];
            var visibleRows = Math.min(rows.length, expanded ? rows.length : Number.isSafeInteger(requestedRows) ? Math.max(10, requestedRows) : 10);
            var exact = !!data && data.rankingComplete;
            h.push('<div id="dan-pu-period-' + key + '" class="dan-pu-period dan-pu-period-' + key + '">');
            if (key === 'custom' && !wiki) {
                var clock = new Date(presentation.now === undefined ? Date.now() : presentation.now);
                var lastDay = new Date(Date.UTC(clock.getUTCFullYear(),clock.getUTCMonth(),clock.getUTCDate()) - 86400000).toISOString().slice(0,10);
                var defaultStart = new Date(Date.parse(lastDay + 'T00:00:00Z') - 29 * 86400000).toISOString().slice(0,10);
                var selectedRange = settings.customRange || {start:defaultStart,end:lastDay};
                h.push('<form id="dan-pu-custom-form" style="display:flex;flex-wrap:wrap;align-items:end;gap:10px;margin-bottom:16px;">' +
                    ("<label style=\"display:grid;gap:4px;font-size:13px;\">De<input id=\"dan-pu-custom-start\" type=\"date\" aria-label=\""+tr("Data inicial")+"\" aria-describedby=\"dan-pu-custom-error\" min=\"2015-07-01\" max=\"") + lastDay + '" value="' + selectedRange.start + '" style="max-width:100%;box-sizing:border-box;padding:6px;border:1px solid #a2a9b1;border-radius:4px;"></label>' +
                    ("<label style=\"display:grid;gap:4px;font-size:13px;\">Até<input id=\"dan-pu-custom-end\" type=\"date\" aria-label=\""+tr("Data final")+"\" aria-describedby=\"dan-pu-custom-error\" min=\"2015-07-01\" max=\"") + lastDay + '" value="' + selectedRange.end + '" style="max-width:100%;box-sizing:border-box;padding:6px;border:1px solid #a2a9b1;border-radius:4px;"></label>' +
                    '<button id="dan-pu-custom-apply" type="submit" style="padding:7px 12px;border:1px solid ' + colors.ink + ';border-radius:4px;background:' + colors.accent + ';color:' + colors.foreground + (";font-weight:600;cursor:pointer;\">"+tr("Aplicar período")+"</button>") +
                    '<div id="dan-pu-custom-error" role="alert" style="flex-basis:100%;color:#b32424;font-size:12px;"></div></form>');
            }
            h.push('<div style="font-size:17px;font-weight:600;margin-bottom:8px;">' + titles[key] + '</div>');
            var totalExact = exact && data.complete && Number.isSafeInteger(data.allArticleTotal);
            if (totalExact) {
                h.push('<div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(data.allArticleTotal) + '</div>');
                h.push('<div style="color:#54595d;font-size:13px;margin:4px 0 10px;">'+tr('nos {number} artigos editados por você',{number:number(eligible)})+'</div>');
            } else { h.push('<div style="color:#54595d;margin:4px 0 10px;">' + (key === 'custom' && !settings.customRange ? tr("Escolha as datas e aplique o período.") : tr("Somando as visualizações de todos os artigos editados.")) + '</div>'); }
            if (data && data.period) { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:4px;">' + (key === 'since' ? tr('Até {date}',{date:shortDate(data.period.end)+(language==='pt-BR'||language==='pt-PT'?' de ':' ')+data.period.end.slice(0,4)}) : range(data.period)) + ' · UTC</div>'); }
            if (key === 'since' && data && data.proof && data.proof.truncatedArticles > 0) {
                h.push(("<div style=\"color:#54595d;font-size:12px;margin-bottom:8px;\">"+tr("Histórico disponível desde 1 jul. de 2015. Artigos editados antes disso têm contagem parcial.")+"</div>"));
            }
            if (key !== 'since') { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:17px;">'+tr('Todo o histórico · {number} artigos editados',{number:number(eligible)})+'</div>'); }
            if (rows.length) {
                var sorted = rows;
                h.push('<div style="display:flex;justify-content:space-between;gap:12px;padding-bottom:8px;border-bottom:1px solid #c8ccd1;color:#54595d;font-size:12px;"><span>' + (exact ? tr("Artigo") : tr("Ordem provisória")) + ("</span><span>"+tr("Visualizações")+"</span></div>"));
                function renderRow(row, index) {
                    var countedFrom = row.countFromDate || data.period.start;
                    var details = 'https://pageviews.wmcloud.org/?project=pt.wikipedia.org&platform=all-access&agent=user&start=' + countedFrom + '&end=' + data.period.end + '&pages=' + encodeURIComponent(row.title.replace(/ /g, '_'));
                    var firstDate = key === 'since' && row.firstEditAt ? row.firstEditAt.slice(0, 10) : null;
                    var firstLabel = firstDate ? '<span class="dan-pu-view-first">'+tr('Primeira edição: {date}',{date:shortDate(firstDate)+(language==='pt-BR'||language==='pt-PT'?' de ':' ')+firstDate.slice(0,4)})+'</span>' : '';
                    var pending = ("<span class=\"dan-pu-view-pending\"><span aria-hidden=\"true\">◷</span> "+tr("Aguardando dados")+"</span>");
                    var viewLabel = Number.isSafeInteger(row.views) ? countedFrom <= data.period.end ? wikiLink('', number(row.views), wiki, details) : number(row.views) : pending;
                    // Keep the rank as real text. CSS Grid positions it without
                    // a wrapper. The lifetime date stays outside the article link.
                    var articleLabel = wikiLink(row.title, row.title, wiki);
                    if (firstLabel) { articleLabel = '<span class="dan-pu-view-title">' + articleLabel + firstLabel + '</span>'; }
                    var linkedViews = Number.isSafeInteger(row.views) && countedFrom <= data.period.end;
                    if (!linkedViews) { viewLabel = '<span class="dan-pu-view-views">' + viewLabel + '</span>'; }
                    if (index < 10) {
                        var image = presenter && presenter.imageFor(presentation.images, row);
                        var picture = image ? (wiki ? '[[Ficheiro:' + image.file + '|48x48px|link=|alt=]]' : '<img class="dan-pu-thumb" src="' + escape(image.src) + '" alt="" width="48" height="48" loading="lazy" decoding="async" crossorigin="anonymous" referrerpolicy="no-referrer">') : '<span class="dan-pu-thumb-placeholder" aria-hidden="true">▧</span>';
                        h.push('<div class="dan-pu-view-row" data-layout="featured" data-shade="' + (index % 2 ? 'alternate' : 'plain') + '" style="display:grid;grid-template-columns:24px 48px minmax(0,1fr) max-content;column-gap:12px;">' +
                            '<span class="dan-pu-view-rank">' + (index + 1) + '</span><span class="dan-pu-view-image" aria-hidden="true" data-pageid="' + row.pageid + '" data-title="' + escape(row.title) + '">' + picture + '</span>' +
                            '<span class="dan-pu-featured-title">' + wikiLink(row.title, row.title, wiki) + firstLabel + '</span><span class="dan-pu-featured-views">' + viewLabel + '</span></div>');
                    } else {
                        h.push('<div class="dan-pu-view-row" data-layout="compact">' + (index + 1) + articleLabel + viewLabel + '</div>');
                    }
                }
                sorted.slice(0, wiki ? 10 : visibleRows).forEach(renderRow);
                if (sorted.length > 10) {
                    if (wiki) {
                        var stages = 0;
                        for (var start = 10; start < sorted.length; start += 100) {
                            var chunk = sorted.slice(start, start + 100);
                            h.push('<div class="dan-pu-native-more mw-collapsible mw-collapsed" data-expandtext="' + tr('Mostrar mais {number}',{number:chunk.length}) + '" data-collapsetext="' + (start === 10 ? tr("Mostrar só 10") : tr("Ocultar esta etapa")) + '"><div class="mw-collapsible-content">');
                            chunk.forEach(function (row, index) { renderRow(row, index + start); });
                            stages += 1;
                        }
                        for (var stage = 0; stage < stages; stage += 1) { h.push('</div></div>'); }
                    } else {
                        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:13px;">');
                        h.push('<span style="color:#54595d;font-size:12px;">'+tr('Exibindo {shown} de {total} artigos',{shown:number(visibleRows),total:number(sorted.length)})+'</span>');
                        if (visibleRows < sorted.length) {
                            h.push('<span id="dan-pu-ritmo-expand-' + key + '">' + wikiLink('Especial:Contribuições/' + user, tr('Mostrar mais {number}',{number:Math.min(100,sorted.length-visibleRows)}), false) + '</span>');
                        }
                        if (visibleRows > 10) {
                            h.push('<span id="dan-pu-ritmo-collapse-' + key + '">' + wikiLink('Especial:Contribuições/' + user, tr("Mostrar só 10"), false) + '</span>');
                        }
                        h.push('</div>');
                    }
                }
            }
            if (profile && !profile.complete && p && p.progress) {
                var preparing = p.metadata && !p.metadata.complete;
                var progressLabel = preparing ? tr('Preparando artigos · {done} de {total} títulos verificados', {
                    done: number(p.metadata.cursor), total: number(p.candidates.length)
                }) : tr('Consultando visualizações · {done} de {total} artigos', {
                    done: number(p.progress.collectedArticles || 0),
                    total: number(p.progress.eligible || eligible)
                });
                h.push('<div role="status" style="margin-top:12px;color:#54595d;font-size:12px;">'+progressLabel+'</div>');
            }
            var stamp = new Intl.DateTimeFormat(language, { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' }).format(new Date(data && data.capturedAt || (data !== profile && p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.capturedAt) || p && p.capturedAt || state.capturedAt));
            h.push('<div style="margin-top:15px;color:#54595d;font-size:11px;">'+tr('Atualizado em {date} UTC',{date:escape(stamp)})+'</div></div>');
        });
        h.push('</div>' + installationFooter(presentation, settings, wiki) + '</div>');
        // Newlines between inline cells make the wiki parser insert a paragraph
        // inside the CSS grid. Keep the exported HTML fragment contiguous.
        var markup = h.map(function(fragment,index){return index===profileIndex?fragment:fragment.replace(/style="[^"]*"/g, function (style) { return style.replace(/#36c\b|#3366cc\b|#2454a6\b/g, colors.ink); });}).join('');
        return (wiki ? '<templatestyles src="' + escape(presentation.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos') + '" />' : '') + markup;
    }
    return Object.freeze({ streakGoal: streakGoal, paintProfile:function(){return inLanguage(paintProfile,arguments[2],arguments);}, profileMarkup:function(){return inLanguage(profileMarkup,arguments[1],arguments);}, customFieldMarkup:function(){return inLanguage(customFieldMarkup,arguments[2],arguments);}, captureAccountCreated:captureAccountCreated, html: function (s, all) { return inLanguage(render,all,[s,false,all]); }, wikitext: function (s, options) { return inLanguage(render,options,[s,true,options||false]); } });
}));
