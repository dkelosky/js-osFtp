define(function (require, exports, module) {
    'use strict';


  /**
   * Exported functions
   */
  exports.isSet = isSet;


  /**
   * Determines whether or not a variable exists, is null, or contains no data
   * @param   {String} variable Any variable type
   * @returns {Boolean}  Returns true if the variable is defined
   */
  function isSet(variable) {

    //if there is no problem with this variable, return true
    if (variable != 'undefined' && variable != null && variable != '')
      return true;

    //otherwise return false
    return false;
  }

});
