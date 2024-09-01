// ==UserScript==
// @name         Amazon Wishlist Search
// @version      0.1
// @description  Adds a text input field to the top of the wishlist to add a search feature
// @author       Justin Hyland
// @match        https://www.amazon.com/dp/
// @match        https://www.amazon.com/*/dp/
// @match        https://www.amazon.com/*/dp/*
// @match        https://www.amazon.com/dp/*
// @match        https://www.amazon.com/gp/product/*
// @match        https://www.amazon.com/gp/
// @match        https://www.amazon.com/*/gp/
// @match        https://www.amazon.com/*/gp/*
// @match        https://www.amazon.com/gp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @require      https://gist.githubusercontent.com/jhyland87/b28636effabfc69e316281b004777adf/raw/77699d2539b91a842468b12bf52861f6bf6f4a64/tampermonkey-utilities.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log('LOADED Amazon Wishlist Search');

  /**
   * Active search feature for amazon wish list
   *  1)  Allow viewer to search the wishlist, updating the list as they type.
   *      Highlight the matching letters in the list item.
   *  2)  Keep the last n selected list items at the top, if enabled?
   *  3)  The list needs to go back to showing all items after an item was clicked.
   *
   * TODO:
   *  - Should it auto-complete if there's just 1 match?
   *  - Should the search query/results get reset once the list is closed?
   *  - Should it clear the search/results after a search result was already clicked?
   *  - Allow a limit of search results?
   *  - Sort the search results?
   *  - What if a wishlist group is added while the current tab is open? Any way to refresh it?
   *  - If no search results are shown, show "No matching lists found"
   *  - Add a hotkey to clear the search/results (esc closes the dropdown list, but doesn't reset it)
   *
   *
   * Future features:
   *  Show latest N list items that were selected last.
   */
  // 73
  // How to check if the list is open
  //document.getElementById('atwl-popover-inner').parentElement.parentElement.parentElement.parentElement.getAttribute('aria-hidden')

  const _config = {
    searchDelayMs       : 500,            // Milliseconds to wait to do a search after the input was updated
    searchFocusDelayMs  : 200,            // Time to delay between creating the search input box and focusing
                                          // on it. Without the delay it seems to execute too early and won't
                                          // focus on the element.
    maxSearchResults    : 10,             // Maximum amount of results to show in the search results. Set to
                                          // anything other than an integer to disable the limit.
    minSearchInput      : 0,              // How many characters before searching is triggered?
                                          // Note: It may be useful to have no minimum input requirements for
                                          // RegExp based searches, but since any string can be used as regex,
                                          // that's a little tricky to test for.
    regexSearches       : 'delimiters',   // This determines if regex searches are used, this setting can have
                                          // 3 different values
                                          // 'enable' (or true)   : Enable regex search for every search.
                                          // 'disable' (or false) : No regex searching. Note: The underlying
                                          //                        search logic will still use regex, but the
                                          //                        search string will not be interpreted as a
                                          //                        regex pattern.
                                          // 'delimiters'         : Require delimiters for regex searches.
    styles: {
      searchResultNotice: {
        display :'inline-block'
      }
    }
  };

  /**
   * The ID's of the elements that are dynamically created
   */
  const ELEM_IDENTIFIERS = {
    byClass: {
      wishlistItem : 'a-dropdown-item'
    },
    byId: {
      //
      wishlistSearchResultCount   : 'wishlist-search-result-count',
      addToWishlistButton         : 'add-to-wishlist-button',
      wishlistSearchInput         : 'wishlist-search',
      // ATWL (Add To WishList) components
      atwl: {
        // ATWL dropdown container div
        //wishlistContainer : 'atwl-popover-inner',
                wishlistContainer : 'div.a-popover[aria-hidden="false"] > div.a-popover-wrapper > div.a-popover-inner > div.a-popover-content > div[id="atwl-popover-inner"]',
        // ATWL unordered dropdown list
        wishlistItems     : 'atwl-dd-ul'
      }
    }
  }

  /*
  // Amazon wishlist element selectors. There should be NO document.getElement(s)By? anywhere other than here.
  */
  const amznDomElem = {
    searchInput       : () => document.getElementById( ELEM_IDENTIFIERS.byId.wishlistSearchInput ),       // HTML element of the input textarea
    wishlistBtn       : () => document.getElementById( ELEM_IDENTIFIERS.byId.addToWishlistButton ),       // This is the dropdown button for the list
    // NOTE: Since this loads in the beginning of the page, since #atwl-popover-inner doesn't exist yet, this is no longer a DOM element..
    //wishlistContainer : () => document.getElementById( ELEM_IDENTIFIERS.byId.atwl.wishlistContainer ),    // This seems to be the main inner container for the list
        //wishlistContainer       : () => {let containers = document.querySelectorAll(`#${ELEM_IDENTIFIERS.byId.atwl.wishlistContainer}`); return containers[containers.length-1]; },
        //
        wishlistContainer : () => document.querySelector( ELEM_IDENTIFIERS.byId.atwl.wishlistContainer ),
    wishlistItems     : () => document.getElementById( ELEM_IDENTIFIERS.byId.atwl.wishlistItems ),        // This was set to 'atwl-dd-ul' for some reason?..
    wishlistItem      : () => document.getElementsByClassName( ELEM_IDENTIFIERS.byClass.wishlistItem )    // This will return an array of the items.
  }

  // onKeyDown events..
  document.onkeydown = function(event) {
    event = event || window.event;

    // If the ESC key is pressed, then clear the search and search results
    if (event.code === 'Escape' ) {
      wishlistEscapeEvent( event );
    }
  };

  /**
   *
   */
  function wishlistEscapeEvent( event ){
    // If the list isn't open, then no need to do anything..
    if ( false === isListOpen() ){
      return;
    }

    let currentSearch = amznDomElem.searchInput().value;

    // If the search text is empty, then close the list...
    if ( currentSearch.length === 0 ){
      return;
    }

    // If the search list is NOT empty, then just clear it out and reset the search, but
    // don't close the list (unless esc is hit again)..
    searchTrigger('');

    // But the list still closes!? Why >_<
  }

  /**
   * Function to check if the list is currently open.
   *  1) Does #atwl-popover-inner exist? If not, then it can't be open.
   *  2) If #atwl-popover-inner exists, then check it's 4th parents attribute aria-hidden to see if it's set to hidden or not.
   *
   * The path for the related elements is: div.a-popover > div.a-popover-wrapper > div.a-popover-inner > div#a-popover-content-[ID that changes].a-popover-content > div#atwl-popover-inner
   * Returns: Boolean
   */
  function isListOpen(){
    if ( ! amznDomElem.wishlistContainer() )
      return false

    // The path for the related elements is: div.a-popover > div.a-popover-wrapper > div.a-popover-inner > div#a-popover-content-[ID that changes].a-popover-content > div#atwl-popover-inner
    //let ariaHidden = amznDomElem.wishlistContainer().parentElement.parentElement.parentElement.parentElement.getAttribute( 'aria-hidden' )

    // This works, but it depends on a class used by Amazon
    let ariaHidden = amznDomElem.wishlistContainer().closest('div.a-popover.a-popover-no-header.a-declarative.a-arrow-bottom').getAttribute( 'aria-hidden' );

    // This depends on the display style of one of the parent elements:
    //let ariaHidden = amznDomElem.searchInput().parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display === 'block';

    // Same thing as the above, but a little neater..
    //let ariaHidden = amznDomElem.searchInput().closest('.a-popover.a-popover-no-header').style.display === 'block';

    return ariaHidden === "false"
  }

  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * Create Result Count Element -
   */
  const createResultCountElement = () => {
    if ( document.getElementById( ELEM_IDENTIFIERS.byId.wishlistSearchResultCount ) !== null ){
      // It already exists
      return
    }

    const searchResultCount = document.createElement( 'span' );
    searchResultCount.id = ELEM_IDENTIFIERS.byId.wishlistSearchResultCount;
    searchResultCount.className = 'a-size-small atwl-hz-vertical-align-middle';
    searchResultCount.style = 'align:center; margin-top:5px; margin-bottom:5px; font-weight: 700; width: 100%; text-align: center; display: none;'
    searchResultCount.innerHTML = 'n search results';

    const wishlistResultArea = amznDomElem.wishlistItems();
    const parentNode = wishlistResultArea.parentNode;


    parentNode.insertBefore( searchResultCount, wishlistResultArea );
  }

  /**
   * Update Search Result Text -
   */
  const updateSearchResultTxt = ( html, style ) => {

    if ( document.getElementById( ELEM_IDENTIFIERS.byId.wishlistSearchResultCount ) !== null ){
      createResultCountElement();
    }

    const wishlistSearchResultCountElem = document.getElementById( ELEM_IDENTIFIERS.byId.wishlistSearchResultCount );

    let currentStyle = wishlistSearchResultCountElem.style;

    let newStyle

    if ( ! style || typeof style !== 'object' ){
      newStyle = {..._config.styles.searchResultNotice, ...currentStyle };
    }
    else {
      newStyle = { ..._config.styles.searchResultNotice, ...currentStyle, ...style };
    }

    newStyle.display = 'inline-block';

    wishlistSearchResultCountElem.innerHTML = html;
  }

  /**
   * Hide Search Result Text - This simply hides the search result count element. It's
   * executed whenever the search results are updated or need to be cleared
   */
  const hideSearchResultTxt = (  ) => {
    if ( document.getElementById( ELEM_IDENTIFIERS.byId.wishlistSearchResultCount ) === null ){
      return
    }

    document.getElementById( ELEM_IDENTIFIERS.byId.wishlistSearchResultCount ).style.display = 'none';
  }

  /**
   * Get regex pattern from a search string.
   * @todo Need to escape certain characters, but only if they need it. eg: if I wanted to
   *      the brackets need to be escaped, unless those brackets are actually just a
   *      regexp group.
   * @param {string} searchPatternStr   String to validate as regex and turn into a
   *                    RegExp instance (eg: '/foo/i')
   * @return {bool|RegExp}        Will return false if the provided string is not
   *                    a valid regex pattern, and an instance of the
   *                    RegExp class if it is.
   * @example getRegexpPattern('/Hello /i')
   */
  const getRegexpPattern = searchPatternStr => {

    if ( ! searchPatternStr || typeof searchPatternStr !== 'string' ){
      //console.log(`Error: Must provide a string for regex pattern`);
      return false;
    }

    // Some configurable regex settings
    const regexCfg = {
      // While there are 7 regex flags usable in Javascript, I don't think any of them
      // are applicable in this scenario (eg: no reason to search for/allow newlines,
      // or unicode, etc)
      flags: [
        'i',//,'g','m','y','u','s','d'
      ],
      // Javascript only allows for the delimiter of /, but just to make it easier, we
      // can match for multiple (since they aren't really getting used anyways).
      delimiters: [
        '\\\/','%', '@', '~','#'
      ]
    }

    // '@foobar@'.match(/^(?<delim1>[\/@]{1})(?<pattern>.*)(?<delim2>[\/@]{1})(?<flags>[igm]*)$/)
    // '/foobar/'.match(/^(?<delim1>[\/@]{1})(?<pattern>.*)(?<delim2>[\/@]{1})(?<flags>[igm]*)$/)
    // '/foobar/igm'.match(/^(?<delim1>[\/@]{1})(?<pattern>.*)(?<delim2>[\/@]{1})(?<flags>[igm]*)$/)

    const regexFlags = regexCfg.flags.join('');

    const delimiters = regexCfg.delimiters.join('');

    const regExpPatternStr = `^(?<delim1>[${delimiters}]{1})(?<pattern>.*)(?<delim2>[${delimiters}]{1})(?<flags>[${regexFlags}]*)?$`;

    //const regExpPatternStr = `'^\/(?<pattern>.*)\/(?<flags>[${regexFlags.join('')}])?$'`;
    // Regex pattern to check if searchPatternStr is a valid regex pattern and extract the
    // search pattern (as well as delimiters and flags) from it.
    const regexPatternPattern = new RegExp(regExpPatternStr);

    const searchPatternCheck = searchPatternStr.match(regexPatternPattern);

    if ( ! searchPatternCheck ){
      return false;
    }

    let constructedRegExp;

    // Check if any flags have been provided, and if so, create the RegExp using those.
    if ( searchPatternCheck.groups.flags ){
      constructedRegExp = new RegExp(searchPatternCheck.groups.pattern, searchPatternCheck.groups.flags);
    }
    // If not, then just pass the pattern.
    else {
      constructedRegExp =  RegExp(searchPatternCheck.groups.pattern);
    }

    return constructedRegExp;
  }

    function waitForElm(selector) {
        // https://stackoverflow.com/a/61511955/1596569
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    console.debug(`Element with selector ${selector} has been created - Triggering resolver`);
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

  /**
   * Simple function to check if the search input has been rendered
   */
  function isSearchInputRendered(){
    return !!amznDomElem.searchInput();
  }


  /**
   * Function to add the search input to the top of the wishlist
   */
  function addListSearchInput(){
    if ( amznDomElem.searchInput() ){
      searchFocus();
      return
    }

    // Create the search input element with some attributes
    const searchInput = document.createElement( 'input' )

    // Search input element properties
    const searchInputAttrs = {
      id      : 'wishlist-search',
      placeholder : 'Search Lists...',
      style     : 'width: 100%',
      autocomplete  : 'off' ,
      autocorrect   : 'off' ,
      spellcheck  : 'off' ,
      onkeydown   : 'resetSearchInput(this)',
      onkeyup     : 'searchTrigger(this.value)'
    };


    for ( const [key, value] of Object.entries(searchInputAttrs)) {
        searchInput.setAttribute(key, value);
    }

    // Parent span element of search input
    var newNode = document.createElement( 'span' );
    searchInput.setAttribute( 'class', 'a-link-normal a-dropdown-link' );
    newNode.className = 'a-link-normal a-dropdown-link';

    newNode.innerHTML = searchInput.outerHTML;

    const list = document.getElementById( ELEM_IDENTIFIERS.byId.atwl.wishlistItems );
    const listParent = list.parentNode;

    // Insert the input element in the list but above the wishlist items
    listParent.insertBefore( newNode, list );

    searchFocus();

    createResultCountElement();
  }

  /**
   * Function to focus on the search input (called whenever the list is opened).
   * The setTimeout is necessary because the input only is present when the
   * wishlist dropdown is visible, and it takes a little bit to become visible
   * after the dropdown button has been clicked.
   */
  function searchFocus(){
    setTimeout(() => {
      amznDomElem.searchInput().focus();
    }, _config.searchFocusDelayMs)
  }

  /**
   * Search trigger - This is the function that gets executed by the keyUp event on
   *          the search input. If the searchString is falsey or empty, then
   *          the currently displayed search results are immediately cleared
   *          out. If there's a valid search input, then this will trigger
   *          the delayed search. It doesn't do the search, but makes sure
   *          the search only happens when the input text has been completely
   *          entered (which is done by making sure _config.searchDelayMs
   *          milliseconds have gone by since the keyUp event)
   * @param {string} searchStr  Search string to pass to searchList()
   */
  function searchTrigger( searchStr ){
    // If there's an active search delay (_searchInputDelay), then clear it.
    if ( window._searchInputDelay ){
      clearTimeout(window._searchInputDelay);
    }

    // Is the input empty or falsey? If so, immediately clear the search.
    if ( ! searchStr || searchStr === '' ){
      showAllListItems();
      return;
    }

    // Does the search meet the minimum search input string length?
    if ( searchStr.length <= _config.minSearchInput ){
      return;
    }

    // Create a new _searchInputDelay with the searchList triggered at the end.
    /*window._searchInputDelay = setTimeout(() => {
      searchList(searchStr);
    }, _config.searchDelayMs);
    */

    window._searchInputDelay = setTimeout(() => searchList(searchStr), _config.searchDelayMs);
  }

  /**
   * Search function executor - This is what gets executed on the onKeyDown event of the
   * #wishlist-search search input.
   */
  function resetSearchInput( elem ){
    hideSearchResultTxt();
    //const searchInputBox = amznDomElem.searchInput();

    elem.style.color = 'inherit';
    // Clear the search input color (in case it was red from 0 search results before)
    //searchInputBox.style.color = 'inherit';
    updateSearchResultTxt('');
  }

  /**
   * String to Regex converter - This just takes a search string and tests if itll work
   * as a regular expression pattern. This is useful for if a search with some special
   * characters that would throw an error if used in a pattern.
   *
   * @param searchStr {string}        The search string being used
   * @return          {bool|RegExp}   Either the RegExp instance, or false
   * @examples
   *    str2regex('test')                 // => /test/i
   *    str2regex('/foobar/')             // => /\/foobar\//i
   *    str2regex('[Project] blah')       // => /[Project] blah/i
   *    str2regex('[Projec')              // => false
   *    const ptrn = str2regex('foo');
   *    ptrn.test('a');                   // => false
   *    ptrn.test('foo');                 // => true
   */
  function str2regex( searchStr ){
    if ( ! searchStr || typeof searchStr !== 'string' ) return false;

    let regexSearchPtrn = false;

    try {
      const escapedSearchStr = escapeRegExp( searchStr );

      regexSearchPtrn = new RegExp( escapedSearchStr, 'i' );
    }
    catch(err){
      return false;
    }

    return regexSearchPtrn;
  }

  /**
   * Search function to be executed on key up
   * @param {string}  searchStr     Search string. Can be a simple string or a regex pattern
   *
   */
  function searchList( searchStr ) {
    const searchInputBox = amznDomElem.searchInput();

    // Clear the search input color (in case it was red from 0 search results before)
    //searchInputBox.style.color = 'inherit';
    updateSearchResultTxt('');

    let resultCount = 0;
    let regexSearchPtrn = false; // should only be changed if the _config.regexSearches is enabled

    // If the delimiters are required, then use getRegexpPattern to analyze the input pattern
    if ( _config.regexSearches === 'delimiters' ){
      const checkRegexp = getRegexpPattern( searchStr );

      if ( checkRegexp !== false ){
        regexSearchPtrn = checkRegexp;
      }
      else {
        //regexSearchPtrn = new RegExp( searchStr, 'i' );
        regexSearchPtrn = str2regex( searchStr );
        //regexSearchPtrn = escapeRegExp( searchStr );
      }

    }
    // If the regexSearches is just 'enabled', then construct a regexp out of the search
    // string
    else if ( _config.regexSearches === true || _config.regexSearches === 'enable' ) {
      //regexSearchPtrn = new RegExp( searchStr, 'i' );
      regexSearchPtrn = str2regex( searchStr );
    }

    const wishlistItems = amznDomElem.wishlistItem();

    // Iterate over each wishlist item, checking to see if it matches..
    Array.from(amznDomElem.wishlistItem()).forEach( ( wishlistItem, idx ) => {

      const itemSpan = wishlistItem.querySelector('[id^="atwl-list-name-"]');
      // Get the item name
      const itemName = itemSpan.textContent.trim();

      /*
      // Is there a maxSearchResults limit? Have we met it? If so, show no more.
      if ( typeof _config.maxSearchResults === 'number' && _config.maxSearchResults <= resultCount ){
        if ( _config.maxSearchResults === resultCount ){
          console.log('The maxSearchResults limit has been reached, search results from here on out will be hidden');
        }

        wishlistItem.style.display = 'none';
        return;
      }
      */


      // Wishlist items that are visible should have the style.display set to 'block'
      let itemDisplay = 'block'; // Or should 'inherit' be the right choice?

      let wishlistItemMatch;

      // If regex is enabled, and a proper regex pattern was generated/found, then use that
      // in the search
      if ( regexSearchPtrn !== false ){
        wishlistItemMatch = itemName.match( regexSearchPtrn );
      }
      // If regex is disabled, or no valid pattern was made, then just use the 'includes' fn.
      else {
        wishlistItemMatch = itemName.includes( searchStr );
      }

      // If there was a match found, then do the other stuff (increment count, style it, etc)
      if ( wishlistItemMatch ){
        resultCount++;

        // Does this result put us over the max limit (if there is one)?
        if ( typeof _config.maxSearchResults === 'number' && _config.maxSearchResults < resultCount ){
          // If so, then don't display the result.
          itemDisplay = 'none';
        }
        else {
          // Then style it.

          // If it was a regex search, then use the regex matches as the replacements..
          if ( regexSearchPtrn ){
            itemSpan.innerHTML = itemSpan.innerText.replace(wishlistItemMatch[0], `<strong><u>${wishlistItemMatch[0]}</u></strong>`)
          }
          // If it wasn't, then just use the search string
          else {
            itemSpan.innerHTML = itemSpan.innerText.replace(searchStr, `<strong><u>${searchStr}</u></strong>`)
          }
        }
      }
      else {
        itemSpan.innerHTML = itemSpan.innerText

        // Then hide it
        itemDisplay = 'none';
      }

      /*
      // If this is a regex match, then
      if ( ! wishlistItemMatch ){
        // Remove any style that may have been added if it was a previous match
        itemSpan.innerHTML = itemSpan.innerText

        // Then hide it
        itemDisplay = 'none';
      }
      // If it IS a regex match....
      else {
        resultCount++;
        // Then style it.
        itemSpan.innerHTML = itemSpan.innerText.replace(wishlistItemMatch[0], `<strong><u>${wishlistItemMatch[0]}</u></strong>`)
      }

      */
      // Show/hide the wishlist item.
      wishlistItem.style.display = itemDisplay;
    });


    // if ( typeof _config.maxSearchResults === 'number' && _config.maxSearchResults < resultCount ){

    if ( resultCount === 0 ){
      updateSearchResultTxt(`0 results for <em>${searchStr}</em>`, {
        color: '#00000087'
      });
      searchInputBox.style.color = '#ff0000';
    }
    else if ( typeof _config.maxSearchResults === 'number' && _config.maxSearchResults < resultCount ){
      console.log(`A total of ${resultCount} matches found, but only showing the first ${_config.maxSearchResults}`)
    }
    else {
      hideSearchResultTxt();
    }
  }

  /**
   * Function to clear the search input and make all wishlist items visible again
   */
  function showAllListItems(){
    // Iterate over the items, switching the display back to 'block'
    Array.from(amznDomElem.wishlistItem()).forEach( ( wishlistItem, idx ) => {
      wishlistItem.style.display = 'block';
    });

    // Then clear the search input.
    amznDomElem.searchInput().value = null
  }

  /**
   * Function to check if a function returns true or not. If it does, then
   * execute the provided function (with its parameters), if not, then set
   * another setTimeout
   */
  function execOrDelay(fn, fnCheck, delay){
    if ( fnCheck() ){
      fn()
    }
    else {
      setTimeout(() => execOrDelay(fn, isListOpen, delay),delay)
    }
  }


  // Add some of the functions to the window object, so they can be executed from
  // outside this function.
  window.searchTrigger = searchTrigger;
  window.resetSearchInput = resetSearchInput;

    const initSearchFn = function(e){
        let checkDelay  = 500,      // 1 sec timeout for each loop
                checkLimit  = 5,            // 4 checks (4 seconds)
                isLoaded        = isListOpen(), // Set default value for list status
                checkCount  = 0             // Check count - Gets incremented each check

        if ( isLoaded !== true ){

            execOrDelay(() => {
                // This should only function once the list popover is fully loaded
                if ( ! amznDomElem.searchInput() ){
                    addListSearchInput();
                }
                else {
                    searchFocus()
                }
            }, isListOpen, checkDelay);
        }
    }
    /**
     *
     * Add a click event Listener function to the input#add-to-wishlist-button
     * TODO: If it's the first load - Increate teh checkLimit a bit
     */
    amznDomElem.wishlistBtn().addEventListener( 'click', initSearchFn)

    window.addEventListener('popstate', initSearchFn);

    // Hide the annoying div's that prevent right clicking on some images
    waitForElm(ELEM_IDENTIFIERS.byId.atwl.wishlistContainer).then((elem) => {
       console.log('New atwl-popover-inner created...');
        addListSearchInput();
    });

})();

