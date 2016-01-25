define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var Dialog = brackets.getModule('widgets/Dialogs');
	var Project = brackets.getModule('project/ProjectManager');
	var FileUtils = brackets.getModule('file/FileUtils');

	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var osFtpDomain  = require('src/domain');
	var osFtpHandlers = require('src/handlers');
	var osFtpGlobals = require('src/globals');
	var osFtpMenu = require('src/menu');
	var osFtpPackage = require('src/package');
	var osFtpScripts = require('src/scripts');
	var osFtpStrings = require('strings');
	var osFtpSelectDialog = require('src/listSelectionDialog');
	var osFtpSitesManager = require('src/sitesManager');

	/**
	 * Global variables
	 */
	var osFtpPreferences;


	/**
	 * Exported functions
	 */
	exports.addSite    = addSite;
	exports.removeSite = removeSite;
	exports.enableEditSite = enableEditSite;
	exports.disableEditSite = disableEditSite;
	exports.invokeFtpScript = invokeFtpScript;
	exports.uploadDirectory = uploadDirectory;
	exports.handleCancel = handleCancel;
	exports.handleEscape = handleEscape;
	exports.disableListeners = disableListeners;
	exports.setAndSavePref = setAndSavePref;


	/**
	 * Add a site by registering the site as a command and adding it to the context menus
	 * @param {Object} site Site object containing information about this site
	 */
	function addSite(site) {

		//log this call
		osFtpCommon.consoleDebug('handlersHelpers.addSite(' + site.name + ');');

		if (osFtpSitesManager.getSitesArray().length > 0){
			enableEditSite();
			enableFtpProject();
		}

		osFtpPackage.getPackage(function(packageJson, cmdId, cmdLabel) {

			var newCmdId = packageJson.name + cmdId;
			var editId = packageJson.name + osFtpGlobals.COMMAND_EDIT_SITE_ID;

			//register command and add a context menu to create a site
			CommandManager.register(cmdLabel, newCmdId, osFtpHandlers.handleRunSite);
			osFtpMenu.addToContextMenus(newCmdId, false, editId, false);

		}, site.getCommandId(), site.getCommandLabel());
	}

	/**
	 * Remove a site from menu
	 *
	 */

	function removeSite(site) {
		osFtpCommon.consoleDebug('handlersHelpers.remove(' + site.name + ')');

		//remove site from context menu
		osFtpPackage.getPackage(function(packageJson, cmdId) {

			var newCmdId = packageJson.name + cmdId;

			//register command and add a context menu to create a site
			osFtpMenu.removeFromContextMenus(newCmdId);

		}, site.getCommandId());


		if (osFtpSitesManager.getSitesArray().length === 0){
			disableEditSite();
			disableFtpProject();
		}
	}


	/**
	 * Enables the edit command for an added site
	 */
	function enableEditSite() {

		//log this call
		osFtpCommon.consoleDebug('enableEditSite();');

		osFtpPackage.getPackage(function(packageJson) {

			var editId = packageJson.name + osFtpGlobals.COMMAND_EDIT_SITE_ID;
			var newId = packageJson.name + osFtpGlobals.COMMAND_NEW_SITE_ID;

			//register command and add a context menu to create a site
			CommandManager.register(osFtpStrings.COMMAND_EDIT_SITE_LABEL, editId, osFtpHandlers.handleEditSite);
			osFtpMenu.addToContextMenus(editId, false, newId, false);
		});
	}


	/**
	 * Disables the edit command for sites (cannot deregister the command)
	 */
	function disableEditSite() {
		//log this call
		osFtpCommon.consoleDebug('handlersHelpers.disableEditSite();');

		osFtpPackage.getPackage(function(packageJson) {

			var editId = packageJson.name + osFtpGlobals.COMMAND_EDIT_SITE_ID;

			//remove from the menu
			osFtpMenu.removeFromContextMenus(editId);
		});
	}

	/**
     * Enable the FTP project command
	 **/
	function enableFtpProject(){
		osFtpCommon.consoleDebug('enableFtpProject()');

		osFtpPackage.getPackage(function(packageJson) {

			var editId    = packageJson.name + osFtpGlobals.COMMAND_EDIT_SITE_ID;
			var ftpSiteId = packageJson.name + osFtpGlobals.COMMAND_FTP_PROJECT_ID;

			//register command and add a context menu to create a site
			CommandManager.register(osFtpStrings.COMMAND_FTP_PROJECT_LABEL, ftpSiteId, osFtpHandlers.handleUploadProject);
			osFtpMenu.addToContextMenus(ftpSiteId, false, editId, false);
		});
	}

	/**
	 * Disable FTP project command
	 **/
	function disableFtpProject(){
		osFtpCommon.consoleDebug('disableFtpProject()');

		osFtpPackage.getPackage(function(packageJson) {
			var ftpProjectId = packageJson.name + osFtpGlobals.COMMAND_FTP_PROJECT_ID;

			//remove from the menu
			osFtpMenu.removeFromContextMenus(ftpProjectId);
		});
	}


	/**
	 * [[Description]]
	 * @param {Object} site Object representing the site to upload to
	 */
	function invokeFtpScript(ftpScript, length) {

		//if the script is defined
		if (osFtpCommon.isSet(ftpScript)) {

			//select the file name we want to create
			var scriptFileName = osFtpGlobals.FTP_SCRIPT_FILE_NAME + osFtpGlobals.FTP_SCRIPT_FILE_EXTENSION;

			//invoke node js to build and run our ftp script file
			osFtpDomain.runFtpCommandStdin(length, scriptFileName, ftpScript);

		}
	}


	/**
	 * [[Description]]
	 * @param {Object} site Object representing the site to upload to
	 */
	function uploadDirectory(site, fileList) {
		osFtpCommon.consoleDebug("handlersHelpers.uploadDirectory()");

		//show dialog
		var dlgInputList = [];
		var rootDir = osFtpStrings.SELECTED_EMPTY;
		if (fileList.length > 0){
			rootDir = Project.getProjectRoot().fullPath;

			for (var index = 0; index < fileList.length; index++){
				dlgInputList.push(FileUtils.getRelativeFilename(rootDir, fileList[index].fullPath));
			}
		}

		var selectDialog = osFtpSelectDialog.newDialog(dlgInputList, rootDir);
		selectDialog.show();
		selectDialog.collapseAll();
		selectDialog.checkAll();

		selectDialog.dialog.done(function(buttonId){
			if (buttonId === 'ok'){
				//log that we are saving this site
				osFtpCommon.consoleDebug('Dialog closed with save');

				var selectedList = selectDialog.getSelectedList();
				fileList = [];
				for (var index = 0; index < selectedList.length; index++){
					var obj = osFtpCommon.relativePathToFile(selectedList[index], rootDir);
					fileList.push(obj);
				}

				osFtpCommon.consoleDebug(fileList);
				//build our ftp script
				var ftpScript = osFtpScripts.generateUploadScript(fileList, site);

				//invoke script
				invokeFtpScript(ftpScript, fileList.length);
			}
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
			osFtpCommon.consoleDebug('Dialog closed without save');

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
				osFtpCommon.consoleDebug('Dialog escaped without save');

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
