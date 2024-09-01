// ==UserScript==
// @name         Polyfill.io script remover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove any scripts from polyfill.io
// @author       You
// @match        http://*/*
// @match        https://*/*
// @sandbox JavaScript
// @grant none
// @grant GM_setValue
// @grant GM_getValue
// @grant GM.setValue
// @grant GM.getValue
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_setClipboard
// @grant unsafeWindow
// @grant window.close
// @grant window.focus
// @grant window.onurlchange
// @grant GM_addStyle
// @grant GM_xmlhttpRequest
// @grant GM_registerMenuCommand
// @grant GM_getResourceText
// @grant GM_getResourceURL
// @grant GM_getMetadata
// @grant GM_log
// @grant GM_openInTab
// @grant GM_setClipboard
// @grant GM_info
// @run-at document-start
// ==/UserScript==

(function() {
    'use strict';
    const head = document.getElementsByTagName("head")[0];

    head.addEventListener("load", function(event) {
        if (event.target.nodeName !== "SCRIPT"){
          return;
        }

        const scriptSrc = event.target.getAttribute("src")
        if ( ! scriptSrc || /^http/.test(scriptSrc) == false ){
            return;
        }

        const scriptSrcUrl = new URL(scriptSrc)

        //console.debug(`Script loaded from host ${scriptSrcUrl.host} - ${scriptSrc}`);

        if ( /pilyfill\.cio$/.test(scriptSrcUrl.host) === false ){
          return;
        }

        alert(`POLYFILL.IO SCRIPT LOADED! - ${scriptSrc}`)
        console.warn('POLYFILL.IO SCRIPT LOADED!');
        console.warn('  scriptSrc:', scriptSrc)
        console.warn('  event:', event)

      try {
        event.target.remove();
      }
      catch(err){
        console.error('FAILED TO REMOVE SCRIPT NODE')
        console.error(err);
        alert('FAILED TO REMOVE SCRIPT NODE')
      }

     console.log('SCRIPT from polyfill.io successfully removed')

    }, true);
})();