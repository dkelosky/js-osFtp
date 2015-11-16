define(function (require, exports, module) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
	var File = brackets.getModule('file/FileUtils');
	var NodeDomain = brackets.getModule('utils/NodeDomain');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
	var StatusBar = brackets.getModule('widgets/StatusBar');


	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var osFtpDomain = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, '../node/FtpDomain'));
	var osFtpDialog = require('src/dialog');
    var osFtpFailDialog = require('text!templates/ftpFailureDialog.html');
	var osFtpGlobals = require('src/globals');
    var osNewVersionDialog = require('text!templates/newVersionDialog.html');
	var osFtpPackage = require('src/package');
	var osFtpStrings = require('strings');


	/**
	 * Global variables
	 */
	var busy = false;
	var osFtpPackageJson;


	/**
	 * Exported functions
	 */
	exports.runFtpCommand = runFtpCommand;
	exports.runFtpCommandStdin = runFtpCommandStdin;


	/**
	 * Function wrapper to invoke our domain function
	 * @param {string} file File to use as an ftp script file
	 */
	function runFtpCommand(file) {

		//log input
		console.log('runFtpCommand(' + file + ');');

		//get package information
		osFtpPackage.getPackage(validateNode, file);
	}


	/**
	 * Function wrapper to invoke our domain function
	 * @param {string} scriptFile File to use as an ftp script file
	 */
	function runFtpCommandStdin(file, data) {

		//log input
		console.log('runFtpCommandStdin(' + file + ', ...);');

		//get package information
		osFtpPackage.getPackage(validateNode, file, data);

	}

	/**
	 * Callback function that will read the current package version and force a restart if needed.
	 * @param {Object}   packageJson [[Description]]
	 * @param {[[Type]]} file        [[Description]]
	 * @param {[[Type]]} data        [[Description]]
	 */
	function validateNode(packageJson, file, data) {

		//log this call
		console.log('validateNode();');

		//set global
		osFtpPackageJson = packageJson;

		//local vars
		var osFtpPreferences;
		var osFtpVersion;

		//get preferences
		osFtpPreferences = PreferencesManager.getExtensionPrefs(osFtpPackageJson.name + osFtpGlobals.PREF);

		//get saved preferences
		osFtpVersion = osFtpPreferences.get(osFtpPackageJson.name + osFtpGlobals.PREF_VERSION) || osFtpGlobals.DEFAULT_VERSION;

		//log the current version
		console.log('Saved extension version number is - ' + osFtpVersion);
		console.log('Current extension version number is - ' + osFtpPackageJson.version);

		//if the saved version is equal to the current version initialize
		if (osFtpVersion == packageJson.version) {

			//invoke node
			invokeNode(file, data);

		}


		//prepare for a restart
		else {

			//set in preferences
			osFtpPreferences.set(osFtpPackageJson.name + osFtpGlobals.PREF_VERSION, osFtpPackageJson.version);

			//save
			osFtpPreferences.save(osFtpPackageJson.name + osFtpGlobals.PREF);

			//substitute values in our html
			var dialogHtml = Mustache.render(osNewVersionDialog, osFtpStrings);

			//show dialog
			var newVersionDialog = osFtpDialog.showCommonDialog(osFtpStrings.DIALOG_TITLE_NEW_VERSION, dialogHtml);

			//listen for dialog done
			newVersionDialog.done(function () {

				//log that the modal is gone
				console.log('Dialog modal is dismissed');

				//restart Brackets
				CommandManager.execute(osFtpGlobals.COMMAND_RESTART_ID);

			});

		}

	}


	/**
	 * Common function to invoke node domain functions
	 * @param {String} file Filename of script file
	 * @param {String} data Optional script file content (file will be created)
	 */
	function invokeNode(file, data) {

		//log input
		console.log('invokeNode(' + file + ', ...);');

		var nodeExec;

		//if we're already processing an FTP script
		if (busy) {

			//log that we're currently busy
			console.log('FTP script process already executing');

			//show error dialog
			osFtpDialog.showFailDialog(osFtpStrings.FAILURE_FTP_PROCESS_IN_PROGRESS);

		} else {

			//show we're busy
			showBusy();

			//if we just have a file
			if (!osFtpCommon.isSet(data))

				//invoke domain function
				nodeExec = osFtpDomain.exec('doFtp', getNodeDirectory(), file);

			//else we have data in addition to a file
			else

				//invoke domain function
				nodeExec = osFtpDomain.exec('doFtpStdin', getNodeDirectory(), file, data);

			//set listener for done
			nodeExec.done(function () {

				//log event
				console.log('nodeExec.done();');

			});

			//set listener for fail
			nodeExec.fail(function () {

				//log event
				console.error('nodeExec.fail();');

				//no other event will be driven
				nodeFail();

			});

			//set listener for process end
			osFtpDomain.on('ftpMsg', function (event, response) {

				//log event
				console.log('osFtpDomain.on(' + response.success + ', ' + response.message + ');');

				//inquire for success or failure and proceed accordingly
				if (response.success)

					//do done stuff
					nodeDone();

				else

					//do failure stuff
					nodeFail(response.message);

			});
		}

	}


	/**
	 * Handle node domain call .done callback
	 */
	function nodeDone() {

		//log that we completed
		console.log('nodeDone()');

		//disable listener
		osFtpDomain.off('ftpMsg');

		//show we're done
		showDone();

		//clear the status after a short time
		clearStatus();

	}


	/**
	 * Handle node domain call .fail callback
	 */
	function nodeFail(failureText) {

		//log that we completed
		console.error('nodeFail(' + failureText + ')');

		var dialogHtml;

		//disable listener
		osFtpDomain.off('ftpMsg');

		//show we've had an error
		showError();

		//clear the status after a short time
		clearStatus();

		//substitute values in our html
		dialogHtml = Mustache.render(osFtpFailDialog, osFtpStrings);

		//show error dialog
		osFtpDialog.showCommonDialog(osFtpStrings.DIALOG_TITLE_FTP_FAIL, dialogHtml);

		//show failure text
		$('#osftp-failure-text').text(failureText);

	}


	/**
	 * Function to get the working directory for the NodeJs code
	 * @returns {String} The directory where the NodeJs source code resides
	 */
	function getNodeDirectory() {

		var extensionDirectory = File.getNativeModuleDirectoryPath(module);
		var extensionDirectories = extensionDirectory.split('\/');
		extensionDirectories.pop();
		extensionDirectories.push('node/');
		return extensionDirectories.join('\/');

	}


	/**
	 * Show busy status on status bar
	 */
	function showBusy() {

		//log call
		console.log('showBusy()');

		//indicate that we're busy
		busy = true;

		//make sure status bar is showing
		StatusBar.show();
		StatusBar.showIndicators();

		//alter status bar color
		StatusBar.updateIndicator(osFtpPackageJson.name + osFtpGlobals.STATUS_INDICATOR_ID, true, 'osftp-status-busy');

	}


	/**
	 * Show done status on status bar
	 */
	function showDone() {

		//alter status bar color
		StatusBar.updateIndicator(osFtpPackageJson.name + osFtpGlobals.STATUS_INDICATOR_ID, true, 'osftp-status-done');

	}


	/**
	 * Show error status on status bar
	 */
	function showError() {

		//alter status bar color
		StatusBar.updateIndicator(osFtpPackageJson.name + osFtpGlobals.STATUS_INDICATOR_ID, true, 'osftp-status-error');

	}


	/**
	 * Clear status on status bar
	 */
	function clearStatus() {

		//log event
		console.log('clearStatus();');

		//indcate that we're free
		busy = false;

		//set a timer
		setTimeout(function() {

				//log this event
				console.log('Status clear');

				//alter status bar color
				StatusBar.updateIndicator(osFtpPackageJson.name + osFtpGlobals.STATUS_INDICATOR_ID, true, '');

			},

			osFtpGlobals.STATUS_VISIBLE_TIME);

	}

});
