// ==UserScript==
// @name         Remove all3dp adblocker wall
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove the irritating modal that All3DP displays until it decides you've disabled addblocker
// @author       Justin Hyland
// @match        https://all3dp.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=all3dp.com
// @require      https://gist.githubusercontent.com/jhyland87/b28636effabfc69e316281b004777adf/raw/77699d2539b91a842468b12bf52861f6bf6f4a64/tampermonkey-utilities.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    waitForElem({selector: 'div.fc-ab-dialog.fc-dialog', verbose: true}).then( elem => elem.remove() );
    waitForElem({selector: '.fc-dialog-container', verbose: true}).then( elem => elem.remove() );
    waitForElem({selector: '.root-modal-container-open', verbose: true }).then( elem => elem.style.overflow = 'scroll' );
    waitForElem({selector: '.modal-container--open', verbose: true}).then( elem => elem.remove() );
    waitForElem({selector: '#top', verbose: true }).then( elem => elem.style.overflow = 'scroll' );

    function dialogCheckLoop(){
    let dialogChecks = 0

      const dialogChecker = setInterval(() => {
        dialogChecks++
        const dialog = document.querySelector("div.fc-ab-dialog.fc-dialog")

        if (  dialog?.checkVisibility() ){
          try {
            const fcDialogContainer = document.getElementsByClassName('fc-dialog-container');
            if ( fcDialogContainer?.length > 0)
                fcDialogContainer[0].remove();

            // Make it scrollable
            const rootModalContainerOpen = document.getElementsByClassName('root-modal-container-open');
            if ( rootModalContainerOpen?.length > 0)
               rootModalContainerOpen[0].style.overflow = "scroll";

            // modal-container--iframe modal-container--open
            const modalContainerOpen = document.getElementsByClassName('modal-container--open')
            if ( modalContainerOpen?.length > 0)
                modalContainerOpen[0].remove()

            document.getElementById('top').style.overflow = 'scroll'
          }
          catch(err){
            console.error(`Encountered an ERROR while trying to delete the dialogs:`, err)
          }

          clearInterval(dialogChecker);
          return;

        }

        if ( dialogChecks >= 15 ){
          clearInterval(dialogChecker);
        }
      }, 250)
    }

    // Wait 1.5 seconds, then start the looping (which runs every 250ms, 15 times = 3.75 sec)
    //setTimeout(dialogCheckLoop, 1500)

    //All3dp addblocker dialog


})();


//document.querySelector("#top > div.fc-ab-root > div").remove()
//document.querySelector("#top > div.pur-root > div").remove()
//document.querySelector("#top > pur-modal").remove()
