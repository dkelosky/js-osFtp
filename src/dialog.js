define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var Dialog = brackets.getModule('widgets/Dialogs');


  /**
   * Extension modules
   */
  var osFtpStrings = require('strings');


  /**
   * Global variables
   */
  var buttons = [
    {
      className: Dialog.DIALOG_BTN_CLASS_LEFT,
      id: Dialog.DIALOG_BTN_CANCEL,
      text: osFtpStrings.DIALOG_CANCEL
    },
    {
      className: Dialog.DIALOG_BTN_CLASS_PRIMARY,
      id: Dialog.DIALOG_BTN_OK,
      text: osFtpStrings.DIALOG_OK
    }
  ];


  /**
   * Exported functions
   */
  exports.showConfirmDirectoryUpload  = showConfirmDirectoryUpload;
  exports.showGetDialog               = showGetDialog;
  exports.showSiteSelectDialog        = showSiteSelectDialog;
  exports.showSiteDialog              = showSiteDialog;
  exports.showFailDialog              = showFailDialog;



  /**
   * Dialog to present a confirmation dialog before uploading an entire directory
   * @param   {Object} site [[Description]]
   * @returns {Object} Dialog object
   */
  function showConfirmDirectoryUpload(site) {

    //log this
    console.log('showConfirmDirectoryUpload()');

    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<p>';

    //set body content
    bodyHtml += osFtpStrings.DIALOG_CONFIRM_BODY + site.name;

    //term html tag
    bodyHtml += '</p>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,                                     //class
      osFtpStrings.DIALOG_TITLE_CONFIRM_UPLOAD, //title
      bodyHtml,                                 //body html
      buttons,                                  //button array
      false);                                   //disable auto dismiss

  }


  /**
   * Show the site select dialog
   * @param   {Object} sites Site object array
   * @returns {Object} Brackets dialog object
   */
  function showSiteSelectDialog(sites, radioSiteName) {

    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<form>';

    //add radio buttons for each site
    sites.forEach(function (site, i) {
      bodyHtml += '<input id="' + site.name + '" value="' + i + '" type="radio" name="' + radioSiteName + '"> ' + site.name;
      bodyHtml += '<br>';
    });

    //term html tag
    bodyHtml += '</form>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,                                   //class
      osFtpStrings.DIALOG_TITLE_SELECT_SITE,  //title
      bodyHtml,                               //body html
      buttons,                                //button array
      false);                                 //disable auto dismiss

  }


  /**
   * Shows the site edit dialog
   * @param   {Object} inputs   Array of input fields in html used to build the dialog
   * @param   {Boolean} existing Indicates whether or not this is an existing site
   * @returns {Object} Brackets dialog object
   */
  function showSiteDialog(inputs, existing) {

    //log this
    console.log('showSiteDialog()');

    var title = osFtpStrings.DIALOG_TITLE_ADD_SITE;

    //dialog buttons array
    var localButtons = [];

    //add global buttons to our initial array of buttons
    buttons.forEach(function (button) {

      //add this button to the array
      localButtons.push(button);

    });

    //if existing site
    if (existing) {

      //delete button if we are going are showing an existing site
      var deleteButton = {
        className: Dialog.DIALOG_BTN_CLASS_NORMAL,
        id: Dialog.DIALOG_BTN_DONTSAVE,
        text: osFtpStrings.DIALOG_DELETE
      }

      //adjust title
      title = osFtpStrings.DIALOG_TITLE_EDIT_SITE;

      //add a delete button
      localButtons.push(deleteButton);

    }

    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<form>';

    //add radio buttons for each site
    inputs.forEach(function (input) {
      bodyHtml += input.label;
      bodyHtml += '<br>';
      bodyHtml += '<input id="' + input.id + '" type="' + input.type + '" value="' + input.value + '">';
      bodyHtml += '<br>';

    });

    //term html tag
    bodyHtml += '</form>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,           //class
      title,          //title
      bodyHtml,       //body html
      localButtons,   //button array
      false);         //disable auto dismiss

  }


  /**
   * Shows the failure dialog
   * @returns {Object} Brackets dialog object
   */
  function showFailDialog(data) {

    //log this
    console.log('showFailDialog()');

    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<p>';

    //init html tag
    bodyHtml += data;

    //term html tag
    bodyHtml += '</p>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,           //class
      osFtpStrings.DIALOG_TITLE_FAIL,  //title
      bodyHtml,       //body html
      null,           //button array
      true);          //disable auto dismiss

  }


  /**
   * Shows the get dialog
   * @returns {Object} Brackets dialog object
   */
  function showGetDialog(site) {

    //log this
    console.log('showGetDialog()');

    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<p>';

    //init html tag
    bodyHtml += '@TODO - finish implementation to get data from site - ' + site.name;

    //term html tag
    bodyHtml += '</p>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,                                     //class
      osFtpStrings.DIALOG_TITLE_GET_FROM_SITE,  //title
      bodyHtml,                                 //body html
      null,                                     //button array
      true);                                    //disable auto dismiss

  }

});
