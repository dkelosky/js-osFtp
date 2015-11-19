define(function (require, exports, module) {
	'use strict';


	/**
	 * Global variables
	 */
	var osFtpBusy = false;
	var osFtpPackageJson;
	var osFtpDomainName = 'osFtp';
	var osFtpDomainMessage = osFtpDomainName + '-' + 'msg';
	var osFtpDomainData = osFtpDomainName + '-' + 'data';
	var osFtpLength = 0;


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
	var osFtpDomain = new NodeDomain(osFtpDomainName, ExtensionUtils.getModulePath(module, '../node/FtpDomain'));
	var osFtpDialog = require('src/dialog');
    var osFtpFailDialog = require('text!templates/ftpFailureDialog.html');
	var osFtpGlobals = require('src/globals');
    var osNewVersionDialog = require('text!templates/newVersionDialog.html');
	var osFtpPackage = require('src/package');
	var osFtpStrings = require('strings');


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

		//clear global length
		osFtpLength = 0;

		//get package information
		osFtpPackage.getPackage(validateNode, file);
	}


	/**
	 * Function wrapper to invoke our domain function
	 * @param {string} scriptFile File to use as an ftp script file
	 */
	function runFtpCommandStdin(length, file, data) {

		//log input
		console.log('runFtpCommandStdin(' + length + ', ' + file + ', ...);');

		//save global length
		osFtpLength = length;

		//get package information
		osFtpPackage.getPackage(validateNode, file, data);

	}

	/**
	 * Callback function that will read the current package version and force a restart if needed.
	 * @param {Object}   packageJson package.json object
	 * @param {String} file        script file
	 * @param {String} data        data contained in the file
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
        var totalCount = 0;

		//if we're already processing an FTP script
		if (osFtpBusy) {

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
			osFtpDomain.on(osFtpDomainMessage, function (event, response) {

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

			//set listener for PUT requests
			osFtpDomain.on(osFtpDomainData, function (event, response) {

				//log event
				console.log('osFtpDomain.on(' + response.count + ');');

                //update total count
                totalCount += response.count;

                //if we don't have a length, we're executing a users script
                if (0 != osFtpLength) {

                    //set number of files
                    $('#' + osFtpGlobals.STATUS_POPOVER_CONTENT).text(
                        osFtpStrings.UPLOAD + ' ' + totalCount + '/' + osFtpLength + ' ' + osFtpStrings.FILES
                    );
                }

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
		osFtpDomain.off(osFtpDomainMessage);
		osFtpDomain.off(osFtpDomainData);

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
		osFtpDomain.off(osFtpDomainMessage);
		osFtpDomain.off(osFtpDomainData);

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

		var parsedName;
		var statusDivId;

		//indicate that we're busy
		osFtpBusy = true;

		//make sure status bar is showing
		StatusBar.show();
		StatusBar.showIndicators();

		//alter status bar color through Brackets API
		StatusBar.updateIndicator(osFtpPackageJson.name + osFtpGlobals.STATUS_INDICATOR_ID, true, 'osftp-status-busy');

		/**
		 * Brackets uses the ID you pass to the StatusBar object functions to generate an ID that is the parsed
		 * package.json "name" where name is author.extension but only using the "author" part for the id, adding a
		 * hyphen, and the ID passed into the API, so:
		 *
		 * author-ID
		 */

		//parse out the author nae
		parsedName = osFtpPackageJson.name.split('.');
		statusDivId = parsedName[0] + '-' + osFtpGlobals.STATUS_INDICATOR_HTML_ID;

		//log what we used in case Brackets changes convention and we need to alter this
		console.log('Updating status bar id: ' + statusDivId);

		//show popover
		$('#' + statusDivId).popover('show');

        //if we don't have a length, we're executing a users script
		if (0 == osFtpLength) {

			//set number of files
			$('#' + osFtpGlobals.STATUS_POPOVER_CONTENT).text(osFtpStrings.UNKNOWN);
		}

        //else start off
		else {

			//set number of files
			$('#' + osFtpGlobals.STATUS_POPOVER_CONTENT).text(
				osFtpStrings.UPLOAD + ' ' + '0' + '/' + osFtpLength + ' ' + osFtpStrings.FILES
			);
		}


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

		var parsedName;
		var statusDivId;

		//indcate that we're free
		osFtpBusy = false;

		//set a timer
		setTimeout(function() {

				//log this event
				console.log('Status clear');

				//alter status bar color
				StatusBar.updateIndicator(osFtpPackageJson.name + osFtpGlobals.STATUS_INDICATOR_ID, true, '');

				/**
				 * Brackets uses the ID you pass to the StatusBar object functions to generate an ID that is the parsed
				 * package.json "name" where name is author.extension but only using the "author" part for the id, adding a
				 * hyphen, and the ID passed into the API, so:
				 *
				 * author-ID
				 */

				//parse out the author nae
				parsedName = osFtpPackageJson.name.split('.');
				statusDivId = parsedName[0] + '-' + osFtpGlobals.STATUS_INDICATOR_HTML_ID;

				//set number of files
				$('#' + osFtpGlobals.STATUS_POPOVER_CONTENT).text(
					osFtpStrings.UPLOAD + '  /  ' + osFtpStrings.FILES
				);

				$('#' + statusDivId).popover('hide');

			},

			osFtpGlobals.STATUS_VISIBLE_TIME);

	}

});
