// ==UserScript==
// @name         Geeks For Geeks - Remove shaming prompt
// @namespace    http://tampermonkey.net/
// @version      2024-07-08
// @description  Geeks For Geeks - Remove shaming prompt
// @author       Justin Hyland
// @match        https://www.geeksforgeeks.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geeksforgeeks.org
// @require      https://gist.githubusercontent.com/jhyland87/b28636effabfc69e316281b004777adf/raw/77699d2539b91a842468b12bf52861f6bf6f4a64/tampermonkey-utilities.js
// @grant        none
// ==/UserScript==


(function() {
    'use strict';


    // Hide the annoying div's that prevent right clicking on some images
    waitForElem({
        selector: '#ad-blocker-div-continue-btn',
        verbose: true
    }).then((elem) => elem.click());

})();

