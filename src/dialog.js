define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var Dialog = brackets.getModule('widgets/Dialogs');


  /**
   * Extension modules
   */
  var Strings = require('strings');


  /**
   * Exported functions
   */
  exports.showSiteSelectDialog  = showSiteSelectDialog;
  exports.showSiteDialog        = showSiteDialog;
  exports.showFailDialog        = showFailDialog;


  /**
   * Show the site select dialog
   * @param   {Object} sites Site object array
   * @returns {[[Type]]} Brackets dialog object
   */
  function showSiteSelectDialog(sites, radioSiteName) {

    //dialog buttons array
    var buttons = [
      {
        className: Dialog.DIALOG_BTN_CLASS_LEFT,
        id: Dialog.DIALOG_BTN_CANCEL,
        text: Strings.DIALOG_CANCEL
      },
      {
        className: Dialog.DIALOG_BTN_CLASS_PRIMARY,
        id: Dialog.DIALOG_BTN_OK,
        text: Strings.DIALOG_OK
      }
    ];


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
      null,                               //class
      Strings.DIALOG_TITLE_SELECT_SITE,   //title
      bodyHtml,                           //body html
      buttons,                            //button array
      false);                             //disable auto dismiss

  }


  /**
   * Shows the site edit dialog
   * @param   {Object} inputs   Array of input fields in html used to build the dialog
   * @param   {Boolean} existing Indicates whether or not this is an existing site
   * @returns {[[Type]]} [[Description]]
   */
  function showSiteDialog(inputs, existing) {

    //log this
    console.log('showSiteDialog()');

    var title = Strings.DIALOG_TITLE_ADD_SITE;

    //dialog buttons array
    var buttons = [
      {
        className: Dialog.DIALOG_BTN_CLASS_LEFT,
        id: Dialog.DIALOG_BTN_CANCEL,
        text: Strings.DIALOG_CANCEL
      },
      {
        className: Dialog.DIALOG_BTN_CLASS_PRIMARY,
        id: Dialog.DIALOG_BTN_OK,
        text: Strings.DIALOG_OK
      }
    ];

    //if existing site
    if (existing) {

      //delete button if we are going are showing an existing site
      var deleteButton = {
        className: Dialog.DIALOG_BTN_CLASS_NORMAL,
        id: Dialog.DIALOG_BTN_DONTSAVE,
        text: Strings.DIALOG_DELETE
      }

      //adjust title
      title = Strings.DIALOG_TITLE_EDIT_SITE;

      //add a delete button
      buttons.push(deleteButton);

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
      buttons,        //button array
      false);         //disable auto dismiss

  }


  /**
   * Shows the failure dialog
   * @returns {Object} data Data to populate into the error dialog
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
      'FTP Failure',  //title
      bodyHtml,       //body html
      null,           //button array
      true);          //disable auto dismiss

  }

});
