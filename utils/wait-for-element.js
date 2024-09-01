/**
 * Wait For Element - Creates a MutationObserver to watch for an element to be created;
 *
 *
 *
 *
 * @param {object|string} selectorObj - The object with the selector and other params; Can also be a string
 *                                      value of the selector.
 * @property {string}  [selectorObj.selector] - The string to use as the querySelector value.
 * @property {boolean} [selectorObj.multiple] - Determines if the mutation observer should be removed after
 *                                              the first match or not.
 * @property {boolean} [selectorObj.verbose] - If true, some debug logs will be output to console.
 * @see https://stackoverflow.com/a/61511955/1596569
 * @returns {Promise<HTMLElement>} - Resolves with element when it's been created
 * @example:
 *    waitForElem({
 *      selector: '#some-elem',
 *      multiple: true,
 *      verbose: true
 *    }).then(elem => console.log('#some-elem loaded'));
 *
 * @example:
 *    waitForElem('#some-elem').then(elem => console.log('#some-elem loaded'));
 */
// ==UserScript==
// @name Wait For Element
// @description This function takes a selector and waits for an element to be created that matches that selector, then executes then resolves the promise with that element as the resolved object data.
//
// @version 1.0.0
// @license ISC
//
// @grant none
// ==/UserScript==
function waitForElem(selectorObj) {
    return new Promise((resolve, reject) => {
        let queriedElement;
        if ( typeof selectorObj === 'string' ){
            selectorObj = { selector: selectorObj };
        }
        else if ( typeof selectorObj !== 'object' ){
            return reject(`waitForElem expected a string or object as the selectorObj param but encountered a typeof `
                + typeof selectorObj.selector );
        }
        else if ( typeof selectorObj.selector !== 'string' ){
            return reject(`waitForElem expected a string as the selectorObj.selector but encountered a typeof `
                + typeof selectorObj.selector );
        }

        if ( selectorObj.verbose ) {
            console.debug(`[waitForElem] Called waitForElem(${selectorObj})..`);
        }

        //const elem = document.querySelector(selectorObj.selector);

        // Before creating the observer, verify it doesn't already exist. If it does, then return it.
        if ( queriedElement = document.querySelector(selectorObj.selector) ) {
            console.debug(`[waitForElem] Found element at %s before even creating observer:`,
                selectorObj.selector, queriedElement);

            return resolve( queriedElement );
        }

        // Now create the mutationObserver for an element using the provided selector
        const observer = new MutationObserver(mutations => {
            //const observedElem = document.querySelector(selectorObj.selector);
            if ( selectorObj.verbose ) {
                console.debug(`[waitForElem] MutationObserver fired with mutations:`, mutations);
            }

            if ( queriedElement = document.querySelector(selectorObj.selector) ) {
                if ( selectorObj.verbose ){
                    console.debug(`[waitForElem] MutationObserver noticed an element with selector `
                    + `%s has been created:`, selectorObj.selector, queriedElement);
                }

                if ( ! selectorObj.multiple ){
                    if ( selectorObj.verbose ) {
                        console.debug(`[waitForElem] Removing observer for elements with selector %s`,
                            selectorObj.selector);
                    }

                    observer.disconnect();
                }

                if ( selectorObj.verbose ) {
                    console.debug(`[waitForElem] Resolving for element:`, queriedElement);
                }

                resolve(queriedElement);
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}