// ==UserScript==
// @name         Real Python Paywall Remover
// @namespace    https://realpython.com/
// @version      2024-07-15
// @description  Removing the annoying paywalls that disable RealPython.
// @author       Justin Hyland
// @match        https://realpython.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=realpython.com
// @require      https://gist.githubusercontent.com/jhyland87/b28636effabfc69e316281b004777adf/raw/77699d2539b91a842468b12bf52861f6bf6f4a64/tampermonkey-utilities.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    waitForElem({
        selector: '.modal-backdrop',
        verbose: true
    }).then(elem => elem.classList.remove('show'));

    waitForElem({
        selector: 'lesson-player',
        verbose: true
    }).then(elem => elem.remove());

    waitForElem({
        selector: 'div.show[role="dialog"]:has(div.modal-dialog)',
        verbose: true
    }).then(elem => elem.classList.remove('show'));

    //waitForElem('lesson-player').then(elem => elem.remove());
    //waitForElem('div.show[role="dialog"]:has(div.modal-dialog)').then(elem => elem.classList.remove('show'));

    document.querySelector('body').classList.remove('modal-open');
})();