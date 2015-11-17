define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var Dialog = brackets.getModule('widgets/Dialogs');
	var File = brackets.getModule('file/FileUtils');
	var Project = brackets.getModule('project/ProjectManager');


	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var osFtpDialog = require('src/dialog');
	var osFtpDomain = require('src/domain');
	var osFtpGlobals = require('src/globals');
	var osFtpHandlersHelpers = require('src/handlersHelpers');
	var osFtpPackage = require('src/package');
	var osFtpScripts = require('src/scripts');
	var osFtpStrings = require('strings');
	var osFtpSitesManager = require('src/sitesManager');
	var osFtpSiteDialog   = require('src/ftpSiteDialog');
	var osFtpSelectDialog = require('src/listSelectionDialog');

	/**
	 * Exported functions
	 */
	exports.handleNewOrEditSite  = handleNewOrEditSite;
	exports.handleEditSite       = handleEditSite;
	exports.handleRunScript      = handleRunScript;
	exports.handleRunSite        = handleRunSite;
	exports.handleUploadProject  = handleUploadProject;

	/**
	 * Handler function for when a new site is added or an existing site is updated
	 * @param {Number} oldSiteIndex Index into sites array
	 */
	function handleNewOrEditSite(site){
		console.log('handleNewOrEditSite()');
		if (osFtpSitesManager.validateSite(site)){
			osFtpSiteDialog.show(site);
		} else {
			// Show new site dialog
			osFtpSiteDialog.show();
		}
	}

	/**
	 * Handler function for upload the entire project to site.
	 */
	function handleUploadProject(){
		console.log('handleUploadProject()');

		//radio button site name
		var RADIO_SITE_NAME = 'site';

		//show dialog
		var selectDialog = osFtpDialog.showSiteSelectDialog(osFtpSitesManager.getSitesArray(), RADIO_SITE_NAME);

		var selectedSiteIndex;

		//listen for escape key
		osFtpHandlersHelpers.handleEscape(selectDialog);

		//handle cancel button
		osFtpHandlersHelpers.handleCancel(selectDialog);

		//listen for ok
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

			//get the site that was checked
			selectedSiteIndex = $('input[name=' + RADIO_SITE_NAME + ']:checked').val();

			//if no option was choosen
			if (!osFtpCommon.isSet(selectedSiteIndex))
				console.log('No site was selected');

			//log that we are closing
			console.log('Dialog closed with save');

			//turn off listeners
			osFtpHandlersHelpers.disableListeners();

			//close the dialog
			selectDialog.close();

		});


		//listen for dialog done
		selectDialog.done(function () {
			//log that the modal is gone
			console.log('Dialog modal is dismissed');

			var sitesArr = osFtpSitesManager.getSitesArray();
			//if edit site index was set
			if (osFtpCommon.isSet(selectedSiteIndex)) {
				var site = sitesArr[selectedSiteIndex];
				var listFiles = osFtpCommon.getProjectFiles();

				osFtpHandlersHelpers.uploadDirectory(site, listFiles);
			}

		});
	}

	/**
	 * Handler for editting an added site
	 */
	function handleEditSite() {

		//log that we were called
		console.log('handleEditSite()');

		//radio button site name
		var RADIO_SITE_NAME = 'site';

		//show dialog
		var selectDialog = osFtpDialog.showSiteSelectDialog(osFtpSitesManager.getSitesArray(), RADIO_SITE_NAME);

		var selectedSiteIndex;

		//listen for escape key
		osFtpHandlersHelpers.handleEscape(selectDialog);

		//handle cancel button
		osFtpHandlersHelpers.handleCancel(selectDialog);

		//listen for ok
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

			//get the site that was checked
			selectedSiteIndex = $('input[name=' + RADIO_SITE_NAME + ']:checked').val();

			//if no option was choosen
			if (!osFtpCommon.isSet(selectedSiteIndex))
				console.log('No site was selected');

			//log that we are closing
			console.log('Dialog closed with save');

			//turn off listeners
			osFtpHandlersHelpers.disableListeners();

			//close the dialog
			selectDialog.close();

		});


		//listen for dialog done
		selectDialog.done(function () {

			//log that the modal is gone
			console.log('Dialog modal is dismissed');

			var sitesArr = osFtpSitesManager.getSitesArray();

			//if edit site index was set
			if (osFtpCommon.isSet(selectedSiteIndex)) {

				osFtpPackage.getPackage(function(packageJson) {

					var newId = packageJson.name + osFtpGlobals.COMMAND_NEW_SITE_ID;

					//register command and add a context menu to create a site
					CommandManager.execute(newId, sitesArr[selectedSiteIndex]);

				});
			}

		});

	}


	/**
	 * Function driven when a file is called to be executed as an FTP script
	 */
	function handleRunScript() {

		//log that we were called
		console.log('handleRunScript();');

		//get the full path to the item that was selected
		var itemFullPath = Project.getSelectedItem().fullPath;

		//determine if the file choosen is a directory or an individual file
		if (File.getDirectoryPath(itemFullPath) == itemFullPath) {

			//attempt is made to ftp a directory
			console.log('Select FTP script file - not a directory');

			//show error dialog
			osFtpDialog.showFailDialog(osFtpStrings.FAILURE_FTP_RUN_DIRECTORY);

		//an individual file was choose, build a script string and invoke node to run FTP and this script
		} else {

			//invoke node js to run our ftp script file
			osFtpDomain.runFtpCommand(Project.getSelectedItem().fullPath);

		}
	}


	/**
	 * Handler for executing an added site
	 */
	function handleRunSite() {

		//log that we were called
		console.log('handleRunSite();');

		//get the command name
		var name = this.getName();
		name = name.substring(osFtpStrings.COMMAND_RUN_SITE_BASE_LABEL.length, name.length);

		//log that we were called
		console.log('handleRunSite(' + name + ');');

		//site object associated with this command name
		var thisSite = osFtpSitesManager.getSiteByName(name);

		// get the list of the selected file
		var selectedFiles = osFtpCommon.getSelectedFiles();

		//determine if the file choosen is a directory or an individual file
		if (Project.getSelectedItem().isDirectory) {

			//upload this directory
			osFtpHandlersHelpers.uploadDirectory(thisSite, selectedFiles);

		//an individual file was choose, build a script string and invoke node to run FTP and this script
		} else {

			//build our ftp script
			var ftpScript = osFtpScripts.generateUploadScript(selectedFiles, thisSite);
			osFtpHandlersHelpers.invokeFtpScript(ftpScript);
		}

	}

});
