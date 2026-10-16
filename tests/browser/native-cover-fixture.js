/* Internal local QA. Uses the real shared header and native-cover preview.
 * The two fixed dates simulate separate parser renderings, not a live MediaWiki parser. */
(function () {
    'use strict';
    var header = window.PerfilWikiProfileHeaderView;
    var nativeCover = window.PerfilWikiNativeDailyCover;
    var appearance = window.PerfilWikiAppearance;
    var dashboard = document.getElementById('dashboard');
    var orientation = document.getElementById('qa-orientation');
    var day = document.getElementById('qa-day');
    var status = document.getElementById('qa-render');
    var renderCount = 0;
    var user = 'Marina Exemplo';
    var settings = appearance.normalize({
        coverSource:'wiki-daily',profilePlacement:'top',nameFontSize:28,
        nameColor:'#772244',labelColor:'#244477',informationColor:'#335522',
        showAccountCreated:false,showUserGroups:false,showLocalTime:false
    });
    var state = {config:{user:user,timeZone:'UTC'}};
    function render() {
        var shape = orientation.value === 'portrait' ? 'portrait' : 'landscape';
        var selectedDay = day.value === '2026-10-16' ? '2026-10-16' : '2026-10-15';
        var humanDate = selectedDay.slice(-2) + ' de outubro de 2026';
        var presentation = {
            user:user,displayName:'Marina Exemplo',location:'Rio de Janeiro',
            customFields:[{label:'Interesse',value:'História',placement:'top'}],
            appearance:settings,now:selectedDay+'T12:00:00.000Z',timeZone:'UTC',localCoverPreview:true
        };
        dashboard.innerHTML = header.html(state,presentation);
        var body = dashboard.querySelector('.dan-pu-profile-cover-native-body');
        body.innerHTML = nativeCover.preview(shape);
        var image = body.querySelector('img');
        // A different hill color makes the second synthetic day visible.
        // This edits only the SVG illustration supplied by the local preview helper.
        if (selectedDay === '2026-10-16') {
            var svg = decodeURIComponent(image.getAttribute('src').slice('data:image/svg+xml,'.length));
            image.setAttribute('src','data:image/svg+xml,'+encodeURIComponent(svg.replace('fill="#426e66"','fill="#65557f"')));
        }
        image.setAttribute('alt','Ilustração local, '+humanDate+', '+(shape==='portrait'?'retrato':'paisagem'));
        dashboard.querySelector('.dan-pu-profile-cover-caption').textContent = nativeCover.caption(false)+' · '+humanDate;
        dashboard.setAttribute('data-qa-date',selectedDay);
        dashboard.setAttribute('data-qa-orientation',shape);
        status.textContent = 'Renderização simulada '+(++renderCount)+' · '+humanDate+' · '+(shape==='portrait'?'Retrato':'Paisagem');
    }
    // The fixture never follows profile or credit links to another page.
    dashboard.addEventListener('click',function (event) {
        if (event.target.closest('a')) event.preventDefault();
    });
    orientation.addEventListener('change',render);
    day.addEventListener('change',render);
    render();
}());
