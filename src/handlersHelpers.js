define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var Dialog = brackets.getModule('widgets/Dialogs');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');


	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var osFtpDialog = require('src/dialog');
	var osFtpHandlers = require('src/handlers');
	var osFtpMenu = require('src/menu');
	var osFtpScripts = require('src/scripts');
	var osFtpStrings = require('strings');
	var osFtpSitesManager = require('src/sitesManager');


	/**
	 * Global variables
	 */
	var osFtpDomain;
	var osFtpGlobals;
	var osFtpPreferences;


	/**
	 * Exported functions
	 */

	exports.updateSiteList = updateSiteList;
	exports.addSite = addSite;
	exports.enableGetFromSite = enableGetFromSite;
	exports.enableEditSite = enableEditSite;
	exports.disableEditSite = disableEditSite;
	exports.disableGetFromSite = disableGetFromSite;
	exports.handlersHelpersInit = handlersHelpersInit;
	exports.invokeFtpScript = invokeFtpScript;
	exports.uploadDirectory = uploadDirectory;
	exports.handleCancel = handleCancel;
	exports.handleEscape = handleEscape;
	exports.disableListeners = disableListeners;
	exports.isValidInput = isValidInput;
	exports.setAndSavePref = setAndSavePref;

	function updateSiteList(){
		console.log('updateSiteList()');
		var sitesCmdArr = [];

		// Get all of the current commands
		var cmdArr = CommandManager.getAll();

		// Filter out only Sites commands

		// Get the list of current monitor sites
		var sitesArr = osFtpSitesManager.getSitesArray();

		if (siteArr.length > 0){
			enableEditSite();
		} else {
			disableEditSite();
		}


		for (var i in sitesArr){
			if (cmdArr.indexOf(sitesArr[i].getCommandId()) === -1)
			{
				addSite(sitesArr[i]);
			}
		}






	}


	/**
	 * Add a site by registering the site as a command and adding it to the context menus
	 * @param {Object} site Site object containing information about this site
	 */
	function addSite(site) {

		//log this call
		console.log('addSite(' + site.name + ');');

		//setup labels
		var COMMAND_RUN_SITE_LABEL = osFtpStrings.COMMAND_RUN_SITE_BASE_LABEL + site.name;
		var COMMAND_RUN_SITE_ID = osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + site.name;

		//register command and add a context menu to create a site
		CommandManager.register(COMMAND_RUN_SITE_LABEL, COMMAND_RUN_SITE_ID, osFtpHandlers.handleRunSite);
		osFtpMenu.addToContextMenus(COMMAND_RUN_SITE_ID, false, osFtpGlobals.COMMAND_GET_FROM_SITE_ID, false);

	}


	/**
	 * Enables the get command for an added site
	 */
	function enableGetFromSite() {

		//log this call
		console.log('enableGetFromSite();');

		//register command and add a context menu to create a site
		CommandManager.register(osFtpStrings.COMMAND_GET_FROM_SITE_LABEL, osFtpGlobals.COMMAND_GET_FROM_SITE_ID, osFtpHandlers.handleGetFromSite);
		osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_GET_FROM_SITE_ID, false, osFtpGlobals.COMMAND_NEW_SITE_ID, false);

	}


	/**
	 * Enables the edit command for an added site
	 */
	function enableEditSite() {

		//log this call
		console.log('enableEditSite();');

		//register command and add a context menu to create a site
		CommandManager.register(osFtpStrings.COMMAND_EDIT_SITE_LABEL, osFtpGlobals.COMMAND_EDIT_SITE_ID, osFtpHandlers.handleEditSite);
		osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID, false, osFtpGlobals.COMMAND_NEW_SITE_ID, false);

	}


	/**
	 * Disables the get command for sites (cannot deregister the command)
	 */
	function disableGetFromSite() {

		//log this call
		console.log('disableGetFromSite();');

		//remove from the menu
		osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_GET_FROM_SITE_ID);

	}


	/**
	 * Disables the edit command for sites (cannot deregister the command)
	 */
	function disableEditSite() {

		//log this call
		console.log('disableEditSite();');

		//remove from the menu
		osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID);

	}


	/**
	 * Initialize
	 */
	function handlersHelpersInit(globals, domain) {

		//log this
		console.log('handlersHelpersInit(globals)');

		//get globals
		osFtpGlobals = globals;
		osFtpDomain = domain;

		//get preferences
		osFtpPreferences = PreferencesManager.getExtensionPrefs(osFtpGlobals.PREF);

		//get saved preferences
		osFtpGlobals.sites = osFtpPreferences.get(osFtpGlobals.PREF_SITES) || [];

		//enable extra options if we have at least one site
		if (osFtpGlobals.sites.length > 0) {

			//add getting from a site
			enableGetFromSite();

			//add editing of site
			enableEditSite();

		}

		//add back saved sites
		osFtpGlobals.sites.forEach(function (site) {
			addSite(site);

		});


	}


	/**
	 * [[Description]]
	 * @param {Object} site Object representing the site to upload to
	 */
	function invokeFtpScript(ftpScript) {

		//if the script is defined
		if (osFtpCommon.isSet(ftpScript)) {

			//select the file name we want to create
			var scriptFileName = osFtpGlobals.FTP_SCRIPT_FILE_NAME + osFtpGlobals.FTP_SCRIPT_FILE_EXTENSION;

			//invoke node js to build and run our ftp script file
			osFtpDomain.runFtpCommandStdin(scriptFileName, ftpScript);

		}
	}


	/**
	 * [[Description]]
	 * @param {Object} site Object representing the site to upload to
	 */
	function uploadDirectory(site, fileList) {

		//show dialog
		var confirmDialog = osFtpDialog.showConfirmDirectoryUpload(site);

		//listen for escape key
		handleEscape(confirmDialog);

		//handle cancel button
		handleCancel(confirmDialog);

		//listen for ok
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

			//log that we are saving this site
			console.log('Dialog closed with save');

			//turn off listeners
			disableListeners();

			//close the dialog
			confirmDialog.close();

			//build our ftp script
			var ftpScript = osFtpScripts.generateUploadScript(fileList, site);

			//invoke script
			invokeFtpScript(ftpScript);

		});


		//listen for dialog done
		confirmDialog.done(function () {

			//log that the modal is gone
			console.log('Dialog modal is dismissed');

		});

	}


	/**
	 * Handle CANCEL button for all dialogs
	 * @param {Object} dialog Dialog object
	 */
	function handleCancel(dialog) {

		//listen for cancel (modal doesnt have standard id= attribute, it's data-button-id
		$('button[data-button-id="' + Dialog.DIALOG_BTN_CANCEL + '"').click(function () {

			//log that the user wants to close
			console.log('Dialog closed without save');

			//turn off listeners
			disableListeners();

			//close the dialog
			dialog.close();

		});

	}


	/**
	 * Handle escape button for all dialogs
	 * @param {Object} dialog Dialog object
	 */
	function handleEscape(dialog) {

		//listener for escape key
		$(document).keyup(function (event) {

			//close if escape key is pressed
			if (event.which == osFtpGlobals.ESCAPE_KEY) {

				//log that the user wants to close
				console.log('Dialog escaped without save');

				//turn off listeners
				disableListeners();

				//close the dialog
				dialog.close();

			}

		});

	}


	/**
	 * Disable all active listeners
	 */
	function disableListeners() {

		//turn off OK listener
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').off('click');

		//turn off ESCAPE listener
		$(document).off('keyup');

		//turn off CANCEL listener
		$('button[data-button-id="' + Dialog.DIALOG_BTN_CANCEL + '"').off('click');

	}



	/**
	 * Validates and issues error messages for user input
	 * @param   {Object}  site The inputted site
	 * @returns {Boolean} Returns whether or not this site input is valid
	 */
	function isValidInput(site, bypassName, errorContainer) {

		var isValid = true;
		var validateResponses = [];

		var errorHtml = '';

		//collect validation of each field
		if (!bypassName)
			validateResponses.push(validateSiteName(site.name));

		validateResponses.push(validateHostName(site.host));

		//process all responses
		validateResponses.forEach(function (validateResponse) {

			//if there is one failure
			if (!validateResponse.isValid) {

				//mark this input as invalud
				isValid = false;

				errorHtml += '<p class="osftp-status-error">';
				errorHtml += validateResponse.msg;
				errorHtml += '</p>';
			}

		});

		//show error area
		$('#' + errorContainer).html(errorHtml);

		//show error area
		$('#' + errorContainer).show();

		//return indicator
		return isValid;
	}


	/**
	 * Validates the site name field
	 * @param   {String} name Name of the site
	 * @returns {Object} Contains a boolean indicator and error message if invalid
	 */
	function validateSiteName(name) {

		//assume valid
		var validateResponse = {
			isValid: true,
			msg: ''
		};


		//verify at minimum a host is set
		if (!osFtpCommon.isSet(name)) {

			//this is required
			validateResponse.isValid = false;
			validateResponse.msg = osFtpStrings.DIALOG_ERROR_SITE_INVALID;
		} else {

			//locate the site object based on site name
			osFtpGlobals.sites.forEach(function (site) {

				//if we match on name this is an error
				if (site.name == name) {

					//site already exists
					validateResponse.isValid = false;
					validateResponse.msg = osFtpStrings.DIALOG_ERROR_SITE_EXISTS;

				}

			});
		}

		//return object
		return validateResponse;

	}


	/**
	 * Validates the site host field
	 * @param   {String} host Host for the site
	 * @returns {Object} Contains a boolean indicator and error message if invalid
	 */
	function validateHostName(host) {

		//assume valid
		var validateResponse = {
			isValid: true,
			msg: ''
		};

		//verify at minimum a host is set
		if (!osFtpCommon.isSet(host)) {

			//this is required
			validateResponse.isValid = false;
			validateResponse.msg = osFtpStrings.DIALOG_ERROR_HOST_INVALID;
		}

		//return object
		return validateResponse;

	}



	/**
	 * Set a preference value with its key and save
	 * @param {String} prefFile Preference file
	 * @param {String} key      Preference key value
	 * @param {Object} value    Any variable type associated with the key
	 */
	function setAndSavePref(prefFile, key, value) {

		//set in preferences
		osFtpPreferences.set(key, value);

		//save
		osFtpPreferences.save(prefFile);
	}


});
