define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var Dialog = brackets.getModule('widgets/Dialogs');
	var FileUtils = brackets.getModule('file/FileUtils');
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
		osFtpCommon.consoleDebug('handleNewOrEditSite()');
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
		osFtpCommon.consoleDebug('handleUploadProject()');

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
				osFtpCommon.consoleDebug('No site was selected');

			//log that we are closing
			osFtpCommon.consoleDebug('Dialog closed with save');

			//turn off listeners
			osFtpHandlersHelpers.disableListeners();

			//close the dialog
			selectDialog.close();

		});


		//listen for dialog done
		selectDialog.done(function () {
			//log that the modal is gone
			osFtpCommon.consoleDebug('Dialog modal is dismissed');

			var sitesArr = osFtpSitesManager.getSitesArray();
			//if edit site index was set
			if (osFtpCommon.isSet(selectedSiteIndex)) {
				var site = sitesArr[selectedSiteIndex];

				Project.getAllFiles().done(function(fileList){
					osFtpHandlersHelpers.uploadDirectory(site, fileList);
				});
			}

		});
	}

	/**
	 * Handler for editting an added site
	 */
	function handleEditSite() {

		//log that we were called
		osFtpCommon.consoleDebug('handleEditSite()');

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
				osFtpCommon.consoleDebug('No site was selected');

			//log that we are closing
			osFtpCommon.consoleDebug('Dialog closed with save');

			//turn off listeners
			osFtpHandlersHelpers.disableListeners();

			//close the dialog
			selectDialog.close();

		});


		//listen for dialog done
		selectDialog.done(function () {

			//log that the modal is gone
			osFtpCommon.consoleDebug('Dialog modal is dismissed');

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
		osFtpCommon.consoleDebug('handleRunScript();');

		//get the full path to the item that was selected
		var itemFullPath = Project.getSelectedItem().fullPath;

		//determine if the file choosen is a directory or an individual file
		if (FileUtils.getDirectoryPath(itemFullPath) == itemFullPath) {

			//attempt is made to ftp a directory
			osFtpCommon.consoleDebug('Select FTP script file - not a directory');

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
		osFtpCommon.consoleDebug('handlers.handleRunSite();');

		var selectedFiles = [];

		//get the command name
		var name = this.getName();
		name = name.substring(osFtpStrings.COMMAND_RUN_SITE_BASE_LABEL.length, name.length);

		//log that we were called
		osFtpCommon.consoleDebug('handleRunSite(' + name + ');');

		//site object associated with this command name
		var thisSite = osFtpSitesManager.getSiteByName(name);

		// get the selected Item
		var selectedItem = Project.getSelectedItem();

		//determine if the file choosen is a directory or an individual file
		if (selectedItem.isDirectory) {

			Project.getAllFiles().done(function(fileList){

				for (var index = 0; index < fileList.length; index++){
					var currentFile = fileList[index].fullPath;
					if (currentFile.indexOf(selectedItem.fullPath) > -1){
						selectedFiles.push(fileList[index]);
					}
				}

				osFtpHandlersHelpers.uploadDirectory(thisSite, selectedFiles);
			});

		//an individual file was choose, build a script string and invoke node to run FTP and this script
		} else {

			var rootDir = Project.getProjectRoot().fullPath;
			var relativePath = FileUtils.getRelativeFilename(rootDir, selectedItem.fullPath);
			//build our ftp script
			selectedFiles.push(osFtpCommon.relativePathToFile(relativePath, rootDir));

			var ftpScript = osFtpScripts.generateUploadScript(selectedFiles, thisSite);
			osFtpHandlersHelpers.invokeFtpScript(ftpScript, 1);
		}

	}

});
