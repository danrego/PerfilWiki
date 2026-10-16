(function () {
    'use strict';
    var language='pt-BR';
    function t(source,params){return window.PerfilWikiI18n.t(language,source,params);}
    var periods = ['30d', '90d', '12m', 'since', 'custom'];
    var origin = location.origin;
    var dashboard = document.getElementById('dashboard');
    var lastHeight = 0;
    var cachedState = null;
    var cachedIdentity = '';
    var currentColors = {ink:'#202122', tint:'#eaecf0'};
    var editing = false;
    var customRangeEditable = false;
    var sectionEditable = false;
    var drag = null;
    var editStyle = document.createElement('style');
    editStyle.textContent = '.local-card-tools{display:flex;align-items:center;justify-content:space-between;gap:5px;margin-bottom:12px;color:#202122;text-align:left;font:12px/1.4 Arial,Helvetica,sans-serif}.local-card-tools button{font:inherit;border:1px solid #c8ccd1;border-radius:4px;color:#202122;background:#fff;padding:5px;cursor:pointer;min-width:29px;min-height:29px}.local-card-tools button:hover{background:#f8f9fa}.local-card-tools button:disabled{opacity:.4;cursor:not-allowed}.local-card-tools button:focus-visible{outline:2px solid #3366cc;outline-offset:2px}.local-card-drag{touch-action:none;cursor:grab!important;font-size:18px!important;padding:1px 5px!important;line-height:1!important}.local-card-highlight{margin-left:auto;font-size:17px!important;padding:2px 5px!important;line-height:1!important}.local-card-highlight[aria-pressed=true]{background:#eaf3ff;color:#2454a6;border-color:#3366cc}.local-card-remove{font-size:17px!important;line-height:1!important;padding:2px 5px!important}.local-preview-instructions{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.local-preview-drag-source{opacity:.55;outline:2px dashed #72777d;outline-offset:-2px}.local-preview-drop-target{outline:3px solid #3366cc!important;outline-offset:2px}.local-preview-dragging{cursor:grabbing!important;user-select:none}.local-preview-dragging .local-card-drag{cursor:grabbing!important}.local-card-add{display:flex;align-items:center;justify-content:center;min-width:0;width:100%;min-height:110px;padding:18px;border:2px dashed #a2a9b1;border-radius:10px;background:#f8f9fa;color:#54595d;text-align:center;font:600 13px/1.5 Arial,Helvetica,sans-serif;cursor:pointer}.local-card-add:hover{background:#eaf3ff;border-color:#3366cc;color:#2454a6}.local-card-add:focus-visible{outline:2px solid #3366cc;outline-offset:3px}';
    document.head.appendChild(editStyle);
    // A target fragment in an iframe can scroll its outer page when the frame
    // gains focus. The local preview changes panes directly instead.
    if (location.hash) { history.replaceState(null, '', location.pathname + location.search); }

    function notify(type, data) { parent.postMessage(Object.assign({type:type}, data || {}), origin); }
    function contentHeight() { return Math.ceil(document.body.getBoundingClientRect().height); }
    function reportSize() {
        var height = contentHeight();
        if (height !== lastHeight) { lastHeight = height; notify('perfilwiki-preview-state', {height:height}); }
    }
    function stateFor(config) {
        if (!window.PerfilWikiLocalFixture || !window.PerfilWikiPageviewsCore) { throw new Error(t('Os dados locais não foram preparados.')); }
        var fixture = window.PerfilWikiLocalFixture;
        var user = typeof config.user === 'string' ? config.user.replace(/_/g, ' ').trim() : '';
        user = user || 'Seu nome de usuário';
        var timeZone = typeof config.timeZone === 'string' ? config.timeZone : 'UTC';
        var customRange = config.appearance && config.appearance.customRange;
        var identity = JSON.stringify([user, timeZone, customRange || null]);
        if (cachedState && identity === cachedIdentity) { return cachedState; }
        var entries = fixture.entries.map(function (entry) { var copy = entry.slice(); copy[7] = user; return copy; });
        var revisionCount = new Set(entries.map(function (entry) { return entry[0]; })).size;
        var summary = window.PerfilWikiPageviewsCore.summarize(entries, {config:{user:user, timeZone:timeZone}, now:fixture.now});
        cachedState = {
            capturedAt:fixture.now,
            config:{user:user, timeZone:timeZone, project:'pt.wikipedia.org'},
            // The sample maxima are fictional. This fixture has no byte deltas.
            statistics:{user:user, metrics:Object.assign({}, fixture.metrics, {
                thanksSent:128, averageBytesPerEdit:revisionCount ? fixture.metrics.bytesAdded / revisionCount : 0,
                largestAddition:24576, largestRemoval:12288, earliestRegistration:'2008-05-15T12:00:00Z'
            }), metricUpdatedAt:{earliestRegistration:fixture.now},
                userGroups:{version:1,user:user,project:'pt.wikipedia.org',checkedAt:fixture.now,
                    groups:(Array.isArray(fixture.userGroups)?fixture.userGroups.slice():['*','user','autoconfirmed','extendedconfirmed','autoreviewer','rollbacker']).sort()},
                registrationCoverage:{version:1,user:user,checkedAt:fixture.now,complete:true,
                    globalRegistration:'2008-05-15T12:00:00Z',accounts:[{wiki:'ptwiki',url:'https://pt.wikipedia.org',registration:fixture.metrics.registration || '2008-06-12T00:00:00Z'}]}},
            activity:{identity:{user:user, project:'pt.wikipedia.org'}, complete:true, entries:entries, summary:summary},
            pageviews:JSON.parse(JSON.stringify(fixture.pageviews))
        };
        if (customRange && window.PerfilWikiSampleViews) {
            cachedState.pageviews.customRange = {start:customRange.start,end:customRange.end};
            var rows = window.PerfilWikiSampleViews.rowsFor(cachedState.pageviews.metadata.cohort,customRange);
            cachedState.pageviews.periods.custom = {period:{start:customRange.start,end:customRange.end,
                days:(Date.parse(customRange.end) - Date.parse(customRange.start)) / 86400000 + 1,basis:'UTC'},
                rows:rows,complete:true,rankingComplete:true,allArticleTotal:rows.reduce(function (sum,row) { return sum + row.views; },0),
                capturedAt:fixture.now,proof:{eligible:rows.length,truncatedArticles:0}};
        }
        cachedIdentity = identity;
        return cachedState;
    }
    function safeLinks() {
        dashboard.querySelectorAll('a[href]').forEach(function (link) {
            var href = link.getAttribute('href');
            if (periods.some(function (key) { return href === '#dan-pu-view-' + key; })) { return; }
            if (link.closest('.dan-pu-profile-details')) {
                try {
                    var address = new URL(href);
                    if (address.origin === 'https://pt.wikipedia.org' && address.pathname.indexOf('/wiki/') === 0 && !address.username && !address.password && !address.search) {
                        link.removeAttribute('target');
                        link.classList.add('local-profile-anchor');
                        return;
                    }
                } catch (_) { /* Non-wiki links stay inactive in the local preview. */ }
            }
            link.removeAttribute('href');
            link.removeAttribute('target');
            link.setAttribute('aria-disabled', 'true');
            link.classList.add('local-static-link');
        });
        // The fixture deliberately has no image metadata. This second guard also
        // prevents an accidentally added remote asset from becoming a request.
        dashboard.querySelectorAll('img').forEach(function (image) {
            if (!/^data:/.test(image.getAttribute('src') || '')) { image.remove(); }
        });
    }
    function element(tag, attributes, text) {
        var node = document.createElement(tag);
        Object.keys(attributes || {}).forEach(function (name) { node.setAttribute(name, attributes[name]); });
        if (text !== undefined) { node.textContent = text; }
        return node;
    }
    function editorCards() { return Array.prototype.slice.call(dashboard.querySelectorAll('.dan-pu-stat-card[data-preview-metric]')); }
    function dragTargetAt(event) {
        var underPointer = document.elementFromPoint(event.clientX, event.clientY);
        var target = underPointer && underPointer.closest('.dan-pu-stat-card[data-preview-metric]');
        return editorCards().indexOf(target);
    }
    function finishDrag(event, commit) {
        if (!drag) { return; }
        var completed = drag;
        drag = null;
        try { if (completed.handle.hasPointerCapture(completed.pointerId)) { completed.handle.releasePointerCapture(completed.pointerId); } } catch (_) {}
        document.body.classList.remove('local-preview-dragging');
        editorCards().forEach(function (card) { card.classList.remove('local-preview-drag-source', 'local-preview-drop-target'); });
        if (commit && completed.moved && completed.target >= 0 && completed.target !== completed.index) { notify('perfilwiki-preview-move', {metric:completed.metric, targetIndex:completed.target}); }
    }
    function installCardControls(appearance) {
        if (!editing || !appearance.showCards) { return; }
        dashboard.insertBefore(element('span', {id:'pw-preview-move-instructions', 'class':'local-preview-instructions'}, t('Com o botão de mover em foco, use as setas para mudar a ordem da caixa.')), dashboard.firstChild);
        dashboard.querySelectorAll('#dan-pu-estatisticas > .dan-pu-stat-card').forEach(function (card, index) {
            var metric = appearance.metrics[index];
            if (!metric) { return; }
            card.setAttribute('data-preview-metric', metric);
            var labelNode = card.querySelector('.dan-pu-stat-label');
            var label = labelNode ? labelNode.textContent : metric;
            var tools = element('div', {'class':'local-card-tools'});
            var handle = element('button', {type:'button', 'class':'local-card-drag', 'aria-label':t('Arrastar {label}',{label:label}), title:t('Arraste ou use as setas para mudar a ordem'), 'aria-describedby':'pw-preview-move-instructions', 'data-preview-action':'drag', 'data-preview-metric':metric, id:'pw-preview-drag-' + metric}, '⠿');
            tools.appendChild(handle);
            var highlighted = appearance.highlightedMetrics.indexOf(metric) >= 0;
            var highlightLabel = t(highlighted?'Retirar destaque de {label}':'Destacar {label}',{label:label});
            var highlight = element('button', {type:'button', 'class':'local-card-highlight', 'aria-label':highlightLabel, title:highlightLabel, 'aria-pressed':highlighted ? 'true' : 'false', 'data-preview-action':'highlight', 'data-preview-metric':metric, id:'pw-preview-highlight-' + metric}, highlighted ? '★' : '☆');
            tools.appendChild(highlight);
            var remove = element('button', {type:'button', 'class':'local-card-remove', 'aria-label':t('Remover {label}',{label:label}), title:t('Remover caixa'), 'data-preview-action':'remove', 'data-preview-metric':metric, id:'pw-preview-remove-' + metric}, '×');
            remove.disabled = appearance.metrics.length === 1;
            tools.appendChild(remove);
            card.insertBefore(tools, card.firstChild);
        });
        var root = document.getElementById('dan-pu-estatisticas');
        if (root && appearance.metrics.length < window.PerfilWikiAppearance.metricIds.length) {
            var add = element('button', {type:'button', id:'pw-preview-add-card', 'class':'local-card-add', 'data-preview-action':'add', 'aria-label':t('Adicionar caixa'), draggable:'false'}, t('Adicionar caixa +'));
            root.insertBefore(add, root.querySelector('#dan-pu-ritmo-install'));
        }
    }
    function selectPeriod(period, notifyParent) {
        if (periods.indexOf(period) < 0) { return; }
        var next = '#dan-pu-view-' + period;
        periods.forEach(function (key) {
            var pane = document.getElementById('dan-pu-period-' + key);
            if (pane) { pane.style.display = key === period ? 'block' : 'none'; }
        });
        dashboard.querySelectorAll('.dan-pu-period-tabs a').forEach(function (link) {
            var selected = link.getAttribute('href') === next;
            link.style.background = selected ? currentColors.tint : '#fff';
            link.style.borderColor = selected ? currentColors.ink : '#c8ccd1';
            link.style.color = selected ? currentColors.ink : '#54595d';
            link.style.fontWeight = selected ? '600' : '400';
            link.setAttribute('aria-current', selected ? 'true' : 'false');
        });
        if (notifyParent) { notify('perfilwiki-preview-period', {period:period}); }
        requestAnimationFrame(reportSize);
    }
    function render(config, editable, rangeEditable, sectionsEditable) {
        if (!window.PerfilWikiAppearance || !window.PerfilWikiLayoutView || !window.PerfilWikiProfileHeaderView || !window.PerfilWikiCardsView || !window.PerfilWikiActivityView) { throw new Error(t('O código do painel não foi preparado.')); }
        finishDrag(null, false);
        var focusedId = document.activeElement && document.activeElement.id;
        var focusedCard = document.activeElement && document.activeElement.closest('.dan-pu-stat-card[data-preview-metric]');
        var focusedCardIndex = focusedCard ? editorCards().indexOf(focusedCard) : -1;
        editing = editable === true;
        customRangeEditable = rangeEditable === true;
        sectionEditable = sectionsEditable === true;
        var appearance = window.PerfilWikiAppearance.normalize(config.appearance);
        language=appearance.language;document.documentElement.lang=language;
        var previewNote=document.getElementById('local-preview-note');if(previewNote)previewNote.textContent=t('Prévia local, sem consultas à Wikipédia. Os números são fictícios.');
        currentColors = window.PerfilWikiAppearance.colors(appearance);
        var state = stateFor(config);
        var displayName = typeof config.displayName === 'string' && config.displayName.trim() ? config.displayName.trim().normalize('NFC') : typeof config.user==='string'&&config.user.trim()?state.config.user:t('Seu nome de usuário');
        var cards = window.PerfilWikiCardsView.html(state.statistics, state.activity, {user:state.config.user, timeZone:state.config.timeZone, now:window.PerfilWikiLocalFixture.now, appearance:appearance, displayName:displayName, location:config.location, customFields:config.customFields, photo:config.photo, localPhotoPreview:true});
        var activity = window.PerfilWikiActivityView.html(state, {timeZone:state.config.timeZone, now:window.PerfilWikiLocalFixture.now, appearance:appearance, displayName:displayName, location:config.location, customFields:config.customFields, photo:config.photo, localPhotoPreview:true});
        var header = window.PerfilWikiProfileHeaderView.html(state, {user:state.config.user, timeZone:state.config.timeZone, now:window.PerfilWikiLocalFixture.now, appearance:appearance, displayName:displayName, location:config.location, customFields:config.customFields, photo:config.photo, coverImage:config.coverImage, localPhotoPreview:true, localCoverPreview:true});
        var between = cards && activity && appearance.layout === 'separate' ? '<section class="local-profile-between"><h2>'+t('Meu impacto na Wikipédia')+'</h2><p>'+t('Seu texto pode ficar entre os contadores e o painel de atividade.')+'</p></section>' : '';
        if (between) {
            if (appearance.blockOrder === 'activity-first') { activity += between; } else { cards += between; }
        }
        var sections = '', sectionIndices = [];
        try {
            if(window.PerfilWikiProfileSections) {
                sections = window.PerfilWikiProfileSections.html(config.contentSections, {user:state.config.user});
                (config.contentSections || []).forEach(function(row,index){if(row.title.trim() || row.content.trim())sectionIndices.push(index);});
            }
        } catch (_) {
            sections = '<p class="local-preview-error" role="status">'+t('Confira o título e o conteúdo das seções de texto nos ajustes.')+'</p>';
        }
        dashboard.innerHTML = window.PerfilWikiLayoutView.compose(cards, activity, appearance, header) + sections;
        dashboard.querySelectorAll('[data-perfilwiki-edit-section]').forEach(function(button,index){
            button.setAttribute('data-perfilwiki-edit-section',String(sectionIndices[index]));
            button.textContent=t('Editar seção');button.setAttribute('aria-label',t('Editar seção'));
            if(!sectionEditable)button.remove();
        });
        document.body.setAttribute('data-current-appearance', JSON.stringify(appearance));
        document.body.setAttribute('data-current-user', state.config.user);
        document.body.setAttribute('data-current-display-name', displayName);
        document.body.setAttribute('data-current-timezone', state.config.timeZone);
        safeLinks();
        installCardControls(appearance);
        ['dan-pu-custom-start','dan-pu-custom-end','dan-pu-custom-apply'].forEach(function (id) { var control = document.getElementById(id); if (control) { control.disabled = !customRangeEditable; } });
        selectPeriod(appearance.initialPeriod, false);
        if (focusedId && /^(dan-pu-ritmo-tab-|pw-preview-)/.test(focusedId)) {
            var restoredFocus = document.getElementById(focusedId);
            if (!restoredFocus && focusedCardIndex >= 0 && editing) {
                var nextCard = editorCards()[Math.min(focusedCardIndex, appearance.metrics.length - 1)];
                restoredFocus = nextCard && nextCard.querySelector('.local-card-drag');
            }
            if (restoredFocus) { restoredFocus.focus({preventScroll:true}); }
        }
        notify('perfilwiki-preview-state', {height:contentHeight()});
        requestAnimationFrame(reportSize);
    }
    addEventListener('message', function (event) {
        if (event.source !== parent || event.origin !== origin || !event.data || typeof event.data !== 'object') { return; }
        if (event.data.type === 'perfilwiki-preview-focus-add') {
            if (!editing) { return; }
            var focusTarget = document.getElementById('pw-preview-add-card');
            if (!focusTarget) { var cards = editorCards(); focusTarget = cards.length && cards[cards.length - 1].querySelector('.local-card-drag'); }
            if (focusTarget) { focusTarget.focus({preventScroll:true}); }
            return;
        }
        if (event.data.type !== 'perfilwiki-preview-config' ||
            !event.data.config || typeof event.data.config !== 'object' || Array.isArray(event.data.config)) { return; }
        try { render(event.data.config, event.data.editable, event.data.customRangeEditable, event.data.sectionEditable); }
        catch (error) {
            dashboard.textContent = t('Não foi possível preparar os dados de exemplo.');
            dashboard.className = 'local-preview-error';
            notify('perfilwiki-preview-error', {message:String(error && error.message || 'Falha local')});
        }
    });
    document.addEventListener('auxclick', function (event) { if (event.target.closest('a')) { event.preventDefault(); } }, true);
    document.addEventListener('click', function (event) {
        if (event.target.closest('a')) { event.preventDefault(); }
        notify('perfilwiki-preview-interaction');
        var sectionEdit = event.target.closest('[data-perfilwiki-edit-section]');
        if(sectionEditable && sectionEdit){notify('perfilwiki-preview-edit-section',{index:Number(sectionEdit.getAttribute('data-perfilwiki-edit-section'))});return;}
        if (event.target.closest('#dan-pu-custom-apply')) { event.preventDefault(); applyCustomRange(); return; }
        var control = event.target.closest('[data-preview-action]');
        if (editing && control && control.getAttribute('data-preview-action') === 'add' && document.getElementById('pw-preview-add-card') === control) {
            notify('perfilwiki-preview-add');
            return;
        }
        if (editing && control && control.getAttribute('data-preview-action') === 'remove' && !control.disabled) {
            notify('perfilwiki-preview-toggle', {metric:control.getAttribute('data-preview-metric')});
            return;
        }
        if (editing && control && control.getAttribute('data-preview-action') === 'highlight' && !control.disabled) {
            notify('perfilwiki-preview-highlight', {metric:control.getAttribute('data-preview-metric')});
            return;
        }
        var link = event.target.closest('a');
        if (!link) { return; }
        var href = link.getAttribute('href') || '';
        var match = /^#dan-pu-view-(30d|90d|12m|since|custom)$/.exec(href);
        event.preventDefault();
        if (match) { selectPeriod(match[1], true); }
    }, true);
    document.addEventListener('pointerdown', function (event) {
        notify('perfilwiki-preview-interaction');
        var handle = event.target.closest('[data-preview-action="drag"]');
        if (!editing || !handle || event.button !== 0 || event.isPrimary === false) { return; }
        var cards = editorCards();
        var card = handle.closest('[data-preview-metric].dan-pu-stat-card');
        var index = cards.indexOf(card);
        if (index < 0 || cards.length < 2) { return; }
        event.preventDefault();
        handle.focus({preventScroll:true});
        drag = {handle:handle, pointerId:event.pointerId, metric:handle.getAttribute('data-preview-metric'), index:index, target:index, x:event.clientX, y:event.clientY, moved:false};
        try { handle.setPointerCapture(event.pointerId); } catch (_) {}
    });
    document.addEventListener('pointermove', function (event) {
        if (!drag || event.pointerId !== drag.pointerId) { return; }
        if (!drag.moved && Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y) < 6) { return; }
        event.preventDefault();
        drag.moved = true;
        document.body.classList.add('local-preview-dragging');
        var cards = editorCards();
        drag.target = dragTargetAt(event);
        cards.forEach(function (card, index) { card.classList.toggle('local-preview-drag-source', index === drag.index); card.classList.toggle('local-preview-drop-target', index === drag.target && drag.target !== drag.index); });
    }, {passive:false});
    document.addEventListener('pointerup', function (event) { if (drag && event.pointerId === drag.pointerId) { drag.target = dragTargetAt(event); finishDrag(event, true); } });
    document.addEventListener('pointercancel', function (event) { if (drag && event.pointerId === drag.pointerId) { finishDrag(event, false); } });
    document.addEventListener('lostpointercapture', function (event) { if (drag && event.pointerId === drag.pointerId) { finishDrag(event, false); } });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { finishDrag(event, false); return; }
        if (!editing || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) { return; }
        var direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : 0;
        if (!direction) { return; }
        var handle = event.target.closest('[data-preview-action="drag"]');
        if (!handle) { return; }
        var cards = editorCards();
        var index = cards.indexOf(handle.closest('[data-preview-metric].dan-pu-stat-card'));
        if (index < 0) { return; }
        event.preventDefault();
        finishDrag(event, false);
        notify('perfilwiki-preview-interaction');
        var target = index + direction;
        if (target >= 0 && target < cards.length) { notify('perfilwiki-preview-move', {metric:handle.getAttribute('data-preview-metric'), targetIndex:target}); }
    });
    document.addEventListener('auxclick', function (event) { if (event.target.closest('a')) { event.preventDefault(); } }, true);
    function applyCustomRange() {
        if (!customRangeEditable) { return; }
        var start = document.getElementById('dan-pu-custom-start'), end = document.getElementById('dan-pu-custom-end');
        if (!start || !end) { return; }
        start.setCustomValidity(''); end.setCustomValidity('');
        var error = document.getElementById('dan-pu-custom-error');
        if (error) { error.textContent = ''; }
        start.setAttribute('aria-invalid','false'); end.setAttribute('aria-invalid','false');
        var lastDay = new Date(Date.now() - 86400000).toISOString().slice(0,10);
        if (!start.value || !end.value || start.value < '2015-07-01' || start.value > end.value || end.value > lastDay) {
            var message = t('Escolha um período entre 1 de julho de 2015 e ontem em UTC, com início até o fim.');
            start.setCustomValidity(message);
            start.setAttribute('aria-invalid','true'); end.setAttribute('aria-invalid','true');
            if (error) { error.textContent = message; }
            start.reportValidity(); return;
        }
        if (start.reportValidity() && end.reportValidity()) { notify('perfilwiki-preview-custom-range', {start:start.value,end:end.value}); }
    }
    document.addEventListener('submit', function (event) { event.preventDefault(); if (event.target.querySelector && event.target.querySelector('#dan-pu-custom-start')) { applyCustomRange(); } });
    if (typeof ResizeObserver === 'function') { new ResizeObserver(reportSize).observe(document.body); }
    notify('perfilwiki-preview-ready');
}());
