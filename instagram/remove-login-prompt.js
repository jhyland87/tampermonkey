// ==UserScript==
// @name         Instagram - remove login disabler
// @namespace    http://tampermonkey.net/
// @version      2024-07-08
// @description  Instagram - remove login disabler
// @author       Justin Hyland
// @match        https://www.instagram.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        none
// @require      https://gist.githubusercontent.com/jhyland87/b28636effabfc69e316281b004777adf/raw/77699d2539b91a842468b12bf52861f6bf6f4a64/tampermonkey-utilities.js
// ==/UserScript==

(function() {
    'use strict';
    console.log('Instagram script loaded')

    waitForElem({ selector: 'body > div.x1n2onr6.xzkaem6', verbose: true }).then(elem => elem.remove())

    // Hide the annoying div's that prevent right clicking on some images
    waitForElem({ selector: '._aagw', verbose: true }).then((elem) => elem.remove());

    // Hide the annying login thing at the bottom
    //document.querySelector('button:has([aria-label="Close"])').click()
    waitForElem({ selector: 'button:has([aria-label="Close"])', verbose: true }).then((elem) =>  elem.click());

    //document.querySelectorAll('a[role="link"]').forEach(elem => {
    //    elem.addEventListener('click', () => location.href = elem.href)
    //})
})();