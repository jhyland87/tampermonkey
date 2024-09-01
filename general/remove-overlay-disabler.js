// ==UserScript==
// @name         Remove  Overlay Remover
// @namespace    http://tampermonkey.net/
// @version      2024-07-16
// @description  Remove  Overlay Remover
// @author       Justin Hyland
// @match        https://*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geeksforgeeks.org
// @require      https://gist.githubusercontent.com/jhyland87/b28636effabfc69e316281b004777adf/raw/77699d2539b91a842468b12bf52861f6bf6f4a64/tampermonkey-utilities.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    waitForElem({
        selector: '#playerOverlay',
        verbose: true
    }).then(elem => elem.remove());
    // Your code here...
})();