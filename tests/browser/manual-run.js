/* Explicit local UI entry point for browser tools that allow only UI actions. */
(function () {
    'use strict';
    var button = document.getElementById('fixture-run');
    button.addEventListener('click', async function () {
        button.disabled = true;
        var result = document.getElementById('fixture-results');
        result.textContent = 'Conferência em andamento';
        try { result.textContent = JSON.stringify(await window.PWTEST.run(), null, 2); }
        catch (error) { result.textContent = JSON.stringify({failed:true,error:String(error.stack || error),checks:window.PWTEST.checks}, null, 2); }
    });
}());
