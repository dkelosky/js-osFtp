define(function (require, exports, module) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
	var FileUtils = brackets.getModule('file/FileUtils');
	var FileSystem = brackets.getModule('filesystem/FileSystem');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');


	/**
	 * Extension modules
	 */
	var osFtpDialog = require('src/dialog');
	var osFtpGlobals = require('src/globals');
    var osInitFailDialog = require('text!templates/initFailureDialog.html');
    var osNewVersionDialog = require('text!templates/newVersionDialog.html');
	var osFtpStrings = require('strings');


	/**
	 * Exported functions
	 */
	exports.validateNodeState = validateNodeState;


	/**
	 * Verifies the current state of node and calls to restart if needed
	 */
	function validateNodeState(callBack, parm1, parm2) {

		//log this call
		console.log('validateNodeState();');

		//local vars
		var osFtpPackageJson;
		var osFtpPreferences;
		var osFtpVersion;

		//get package.json file
		osFtpPackageJson = FileUtils.readAsText(FileSystem.getFileForPath(ExtensionUtils.getModulePath(module, '../package.json')));

		//get preferences
		osFtpPreferences = PreferencesManager.getExtensionPrefs(osFtpGlobals.PREF);

		//get saved preferences
		osFtpVersion = osFtpPreferences.get(osFtpGlobals.PREF_VERSION) || osFtpGlobals.DEFAULT_VERSION;


		//handle package.json read complete
		osFtpPackageJson.done(function(jsonText) {

			//parse the package JSON file
    		var packageJson = JSON.parse(jsonText);

			//log the current version
			console.log('Saved extension version number is - ' + osFtpVersion);
			console.log('Current extension version number is - ' + packageJson.version);

			//if the saved version is equal to the current version initialize
			if (osFtpVersion == packageJson.version) {

				//log this event
				console.log('Invoking callback');

				//invoke callback
				callBack(parm1, parm2);

			}

			//prepare for a restart
			else {

				//set in preferences
				osFtpPreferences.set(osFtpGlobals.PREF_VERSION, packageJson.version);

				//save
				osFtpPreferences.save(osFtpGlobals.PREF);

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

		});

		//handle failure finding package - this should never really happen
		osFtpPackageJson.fail(function(errors) {

			//log this error
			console.error('package.json is not found  - this package contains errors: ' + errors);

			//substitute values in our html
			var dialogHtml = Mustache.render(osInitFailDialog, osFtpStrings);

			//show error dialog
			osFtpDialog.showCommonDialog(osFtpStrings.DIALOG_TITLE_INIT_FAIL, dialogHtml);

			//show failure text
			$('#osftp-failure-text').text(errors);

		});


	}


});
