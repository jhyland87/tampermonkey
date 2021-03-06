// ==UserScript==
// @name          Miscellaneous Javascript utilities
// @namespace     https://raw.githubusercontent.com/jhyland87/tampermonkey/master/common/utils.js
// @version       0.1
// @description   Add some additional methods to the standard javascript prototypes
// @author        Justin Hyland (j@linux.com)
// @include       *
// @match         *
// @homepage      https://github.com/jhyland87/tampermonkey
// @grant         none
// @run-at        document-body
// @downloadURL   https://raw.githubusercontent.com/jhyland87/tampermonkey/master/common/utils.js
// @updateURL     https://raw.githubusercontent.com/jhyland87/tampermonkey/master/common/utils.js
// ==/UserScript==

(function() {
  'use strict';

  /**
   * Static function used to determine if an external value is a string or not.
   * @name      String.isString
   * @summary   A simple static member used to determine if a value is a string
   * @desc      Similar to the isArray method of Array, this simply determines if a provided value is a string value.
   * @memberof  String
   * @param     {mixed}   value     Value to inspect
   * @return    {boolean}           Returns true if value is a string, false otherwise
   * @example   String.isString('foo')  // true
   * @example   String.isString(123)    // false
   * @example   String.isString([])     // false
   * @example   String.isString({})     // false
   */
  if ( String.hasOwnProperty('isString') ){
    console.warn( 'The String object already has an "isString" method - Skipping implimentation of String.isString' );
  }
  else {
    // String.isString = val => typeof val === 'string'; // Fails due to Lexical this
    String.isString = function( value ){
      return typeof value === 'string';
    };
  }

  /**
   * Check to see if the value is castable to an integer (EG: "123")
   * @name      String#isInteger
   * @summary   Checks if the strings value is an integer in string format (EG: "1")
   * @desc      Checks if the strings value is an integer in string format (EG: "1")
   * @memberof  String.prototype
   * @return    {boolean}           Returns true if value is an integer in string format
   * @example   "1".isInteger()     // true
   * @example   "1.".isInteger()    // true
   * @example   "1.0".isInteger()   // true
   * @example   "0.0".isInteger()   // true
   * @example   "1.2".isInteger()   // false
   * @example   ".2".isInteger()    // false
   * @example   "test".isInteger()  // false
   */
  if ( String.prototype.hasOwnProperty('isInteger') ) {
    console.warn( 'The String prototype already has an "isInteger" method - Skipping implimentation of String.prototype.isInteger' );
  }
  else {
    // String.prototype.isInteger = () => Number(this) == this && Number(this) % 1 === 0; // Fails due to Lexical this
    String.prototype.isInteger = function( ){
      return Number(this) == this && Number(this) % 1 === 0;
    };
  }

  /**
   * Check to see if the value is castable to a float (EG: "1.2")
   * @name      String#isFloat
   * @summary   Checks if the strings value is a float in string format (EG: "1.2")
   * @desc      Checks if the strings value is a float in string format (EG: "1.2")
   * @memberof  String.prototype
   * @return    {boolean}           Returns true if value is a float in string format
   * @example   "1.2".isFloat()   // true
   * @example   ".2".isFloat()    // true
   * @example   "1".isFloat()     // false
   * @example   "0.0".isFloat()   // false
   * @example   "test".isFloat()  // false
   */
  if ( String.prototype.hasOwnProperty('isFloat') ) {
    console.warn( 'The String prototype already has an "isFloat" method - Skipping implimentation of String.prototype.isFloat' );
  }
  else {
    // String.prototype.isFloat = () => Number(this) == this && Number(this) % 1 !== 0;  // Fails due to Lexical this
    String.prototype.isFloat = function( ){
      return Number(this) == this && Number(this) % 1 !== 0;
    };
  }

  /**
   * Check to see if the value is castable to a float (EG: "1.2")
   * @name      String#isNumber
   * @summary   Checks if the strings value is a number in string format (EG: "1.2", "1", "00.1")
   * @desc      Checks if the strings value is a number in string format (EG: "1.2", "1", "00.1")
   * @memberof  String.prototype
   * @return    {boolean}           Returns true if value is a number in string format
   * @example   "1".isNumber()    // true
   * @example   "1.2".isNumber()  // true
   * @example   ".2".isNumber()   // true
   * @example   "0".isNumber()    // true
   * @example   "test".isFloat()  // false
   */
  if ( String.prototype.hasOwnProperty('isNumber') ) {
    console.warn( 'The String prototype already has an "isNumber" method - Skipping implimentation of String.prototype.isNumber' );
  }
  else {
    // String.prototype.isNumber = () => Number(this) == this; // Fails due to Lexical this
    String.prototype.isNumber = function( ){
      return Number(this) == this;
    };
  }

  /**
   * Static function used to determine if an external value is a number or not.
   * @name      Number.isNumber
   * @summary   A simple static member used to determine if a value is a number
   * @desc      Similar to the isArray method of Array, this simply determines if a provided value is a number value.
   * @memberof  Number
   * @param     {mixed}   value     Value to inspect
   * @return    {boolean}           Returns true if value is a number, false otherwise
   * @example   Number.isNumber(12)   // true
   * @example   Number.isNumber(1.2)  // true
   * @example   Number.isNumber('12') // false
   */
  if ( Number.hasOwnProperty('isNumber') ) {
    console.warn( 'The Number object already has an "isNumber" method - Skipping implimentation of Number.isNumber' );
  }
  else {
    Number.isNumber = val => typeof val === 'number';
    /*
    Number.isNumber = function( value ){
      return typeof value === 'number';
    };
    */
  }

  /**
   * 
   * @name      Number.strNumber
   * @summary   Check if a value is a numerical value casted as a string
   * @desc      
   * @memberof  Number
   * @return    {boolean}     Returns true if the value is a numeric value (as a string or as a number)
   * @example   Number.strNumber('1')   // true
   * @example   Number.strNumber(1)     // true
   * @example   Number.strNumber(1.2')  // true
   * @example   Number.strNumber('1.2)  // true
   * @example   Number.strNumber('0')   // true
   * @example   Number.strNumber(0.1)   // true
   * @example   Number.strNumber('')    // false
   * @example   Number.strNumber('0s')  // false
   * @example   Number.strNumber([])    // false
   * @example   Number.strNumber({})    // false
   * @example   Number.strNumber(null)  // false
   */
  if ( Number.hasOwnProperty('strNumber') ) {
    console.warn( 'The Number object already has a "strNumber" method - Skipping implimentation of Number.strNumber' );
  }
  else {
    Number.strNumber = val => parseFloat( val ) == val;
    /*
    Number.strNumber = function( value ){
      return parseFloat( value ) == value;
    };
    */
  }

  /**
   * 
   * @name      
   * @summary   
   * @desc      
   * @memberof  
   * @param     
   * @return    
   * @example   
   */
  String.isNumber =
  String.isFloat =
  Number.strNumber =
  Number.strFloat = val => parseFloat( val ) == val;
  /*
  Number.strFloat = function( value ){
    return parseFloat( value ) == value;
  };
  */

  /**
   * 
   * @name      
   * @summary   
   * @desc      
   * @memberof  
   * @param     
   * @return    
   * @example   
   */
  String.isInt =
  String.isInteger =
  Number.strInt = val => parseInt( val ) == val;
  /*
  Number.strInt = function( value ){
    return parseInt( value ) == value;
  };
  */

  /**
   * A filter function for plain JS objects, somewhat similar to the Array.prototype.filter() function for arrays.
   * @name      Object#filter
   * @summary   Filter through the contents of an object
   * @desc      Adds the ability to filter through the associated object by iterating through each child element while
   *            executing the predicate function, handing both the element value and the element key.
   * @memberof  Object.prototype
   * @param     {function}  predicate       Function to use for filtering.
   * @param     {boolean}   [noErr=false]   If this is set to true, then any exceptions thrown by the predicate
   *                                        executions will be caught (defaults to false, halting on exceptions)
   * @return    {object}                    Returns an object containing only the filtered results
   * @example  Filtering an object by the value only
   *  { foo : 'bar', baz: '', qux: 'quux', corge: null }.filter( value => !!value )
   *      // {foo: "bar", qux: "quux"}
   * @example  Filtering an object by the key and value
   *  window.location.filter(( value, key ) => ['host', 'protocol', 'port', 'search'].indexOf(key) !== -1 && value )
   *      // protocol: "https:", host: "github.com"}
   */
  if ( Object.prototype.hasOwnProperty('filter') ) {
    console.warn( 'The Object prototype already has a "filter" method - Skipping implimentation of Object.prototype.filter' );
  }
  else {
    Object.prototype.filter = function( predicate, noErr = false ){
      if ( ! predicate )
        throw new TypeError( 'No filter function provided' );

      if ( typeof predicate !== 'function' )
        throw new TypeError( 'Expected to receive a function as predicate - received typeof: '+ typeof predicate );

      var results = {};

      Object.keys( this ).forEach( key => {
        try {
          if ( predicate( this[ key ], key ) )
            results[ key ] = this[ key ];
        }
        catch( err ){
          if ( noErr !== true )
            throw err;
        }
      });

      return results;
    };
  }

  /**
   * 
   * @name      Array#remove
   * @summary   
   * @desc      
   * @memberof  Array.prototype
   * @param     {string|number|array|function}   predicate    What to remove from array
   * @return    {null|array}           Returns a list of removed items, or null of nothing removed
   * @example   Number.isNumber(12)   // true
   * @example   Number.isNumber(1.2)  // true
   * @example   Number.isNumber('12') // false
   */
  if ( Array.prototype.hasOwnProperty('remove') ) {
    console.warn( 'The Array prototype already has a "remove" method - Skipping implimentation of Array.prototype.remove' );
  }
  else {
    Array.prototype.remove = function( predicate ) {
      var removed = [];

      if ( typeof predicate === 'function' ){
        for( var idx = 0; idx < this.length; idx++ ){
          if ( predicate( this[idx], idx ) === true )
            removed.push(this.splice( idx, 1 )[0]);
        }
        return removed;
      }

      if ( String.isString( predicate ) || Number.isNumber( predicate ) )
        predicate = [ predicate ];

      if ( Array.isArray( predicate ) ){
        predicate.forEach( pred => {
          if ( this.indexOf( pred ) === -1 )
            return;

          for( var idx in this ){
            if ( this[idx] === pred )
              removed.push( this.splice( idx, 1 )[0] );
          }
        });

        return removed;
      }
    };
  }

  /**
   * 
   * @name      String#isDate
   * @summary   
   * @desc      
   * @memberof  String.prototype
   * @return    {array}           Returns an array containing only unique values of the original array
   * @example   String(new Date().toLocaleDateString()).isDate() // true
   * @example   String(new Date().toISOString()).isDate()  // true
   * @example   String(new Date().toDateString()).isDate() // true
   * @example   " 11/27/2017  ".isDate()  // true
   * @example   "123".isDate()            // false
   * @example   "Hello World".isDate()    // false
   */
  if ( String.prototype.hasOwnProperty('isDate') ) {
    console.warn( 'The String prototype already has an "isDate" method - Skipping implimentation of String.prototype.isDate' );
  }
  else {
    String.prototype.isDate = function( ) {
      try {
        var d = Date.parse( this.trim() );
        return !isNaN(d);
      }
      catch( err ){
        return false;
      }
    };
  }

  /**
   * Get the epoch value for the Date instances timestamp
   * @name      Date#getEpoch
   * @summary   
   * @desc      
   * @memberof  Date.prototype
   * @return    {number}           A 10 digit long number representing the epoch date
   * @example   new Date().getEpoch()       // 1511848679
   * @example   new Date(98, 1).getEpoch()  // 886316400
   * @example   new Date(Date.parse('Wed, 09 Aug 1995')).getEpoch() // 807951600
   */
  if ( Date.prototype.hasOwnProperty('getEpoch') ) {
    console.warn( 'The Date prototype already has a "getEpoch" method - Skipping implimentation of Date.prototype.getEpoch' );
  }
  else {
    Date.prototype.getEpoch = function( ) {
      return Math.round( this.getTime() / 1000 );
    };
  }

  /**
   * 
   * @name      Array#uniques
   * @summary   
   * @desc      
   * @memberof  Array.prototype
   * @return    {array}           Returns an array containing only unique values of the original array
   * @example   
   */
  Array.prototype.uniques = function( ) {

  };
})();