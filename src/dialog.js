define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var Dialog = brackets.getModule('widgets/Dialogs');


	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var osFtpStrings = require('strings');


	/**
	 * Global variables
	 */
	var buttons = [
		{
			className: Dialog.DIALOG_BTN_CLASS_LEFT,
			id: Dialog.DIALOG_BTN_CANCEL,
			text: osFtpStrings.BUTTON_CANCEL
    },
		{
			className: Dialog.DIALOG_BTN_CLASS_PRIMARY,
			id: Dialog.DIALOG_BTN_OK,
			text: osFtpStrings.BUTTON_OK
    }
  ];


	/**
	 * Exported functions
	 */
	exports.showConfirmDirectoryUpload = showConfirmDirectoryUpload;
	exports.showGetDialog = showGetDialog;
	exports.showSiteSelectDialog = showSiteSelectDialog;
	exports.showSiteDialog = showSiteDialog;
	exports.showCommonDialog = showCommonDialog;
	exports.showFailDialog = showFailDialog;


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
			null, //class
			osFtpStrings.DIALOG_TITLE_CONFIRM_UPLOAD, //title
			bodyHtml, //body html
			buttons, //button array
			false); //disable auto dismiss

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
            bodyHtml += '<div class=row-fluid>';
            bodyHtml += '<label for=' + site.name + '>';
			bodyHtml += '<input id="' + site.name + '" value="' + i + '" type="radio" name="' + radioSiteName + '"> ' + site.name;
            bodyHtml += '</label>';
            bodyHtml += '</div>';
		});

		//term html tag
		bodyHtml += '</form>';

		//show the dialog and return the object
		return Dialog.showModalDialog(
			null, //class
			osFtpStrings.DIALOG_TITLE_SELECT_SITE, //title
			bodyHtml, //body html
			buttons, //button array
			false); //disable auto dismiss

	}


	/**
	 * Shows the site edit dialog
	 * @param   {Object}  inputs   Array of input fields in html used to build the dialog
	 * @param   {String}  nameTitle Set if existing site
	 * @returns {Object}  Brackets dialog object
	 */
	function showSiteDialog(inputs, nameTitle, errorId) {

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
		if (osFtpCommon.isSet(nameTitle)) {

			//delete button if we are going are showing an existing site
			var deleteButton = {
				className: Dialog.DIALOG_BTN_CLASS_NORMAL,
				id: Dialog.DIALOG_BTN_DONTSAVE,
				text: osFtpStrings.BUTTON_REMOVE
			};

			//adjust title
			title = osFtpStrings.DIALOG_TITLE_EDIT_SITE + ' - ' + nameTitle;

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

		//error markers
		bodyHtml += '<div id="' + errorId + '"></div>';

		//show the dialog and return the object
		return Dialog.showModalDialog(
			null, //class
			title, //title
			bodyHtml, //body html
			localButtons, //button array
			false); //disable auto dismiss

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
			null, //class
			osFtpStrings.DIALOG_TITLE_FTP_FAIL, //title
			bodyHtml, //body html
			null, //button array
			true); //disable auto dismiss

	}

	/**
	 * Show a general modal where the title and body html are provided by the caller
	 * @param   {String} title title for this modal
	 * @param   {String} html html body content
	 * @returns {Object} Brackets dialog object
	 */
	function showCommonDialog(title, html) {

		//log this
		console.log('showCommonDialog()');

		//show the dialog and return the object
		return Dialog.showModalDialog(
			null, //class
			title, //title
			html, //body html
			null, //button array
			true); //disable auto dismiss

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
			null, //class
			osFtpStrings.DIALOG_TITLE_GET_FROM_SITE, //title
			bodyHtml, //body html
			null, //button array
			true); //disable auto dismiss

	}

});
