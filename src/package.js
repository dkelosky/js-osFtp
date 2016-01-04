define(function (require, exports, module) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
	var FileUtils = brackets.getModule('file/FileUtils');
	var FileSystem = brackets.getModule('filesystem/FileSystem');

	/**
	 * Extension modules
	 */
	var osFtpDialog = require('src/dialog');
    var osInitFailDialog = require('text!templates/initFailureDialog.html');
	var osFtpStrings = require('strings');

	/**
	 * Exported functions
	 */
	exports.getPackage = getPackage;


	/**
	 * Get the package information for this extension and call a callback providing the package
	 * JSON object and two user parameters
	 */
	function getPackage(callBack, parm1, parm2) {

		//local vars
		var osFtpPackageJson;

		//get package.json file
		osFtpPackageJson = FileUtils.readAsText(FileSystem.getFileForPath(ExtensionUtils.getModulePath(module, '../package.json')));

		//handle package.json read complete
		osFtpPackageJson.done(function(jsonText) {

			//parse the package JSON file
    		var packageJson = JSON.parse(jsonText);

            //log this event
            console.log('Invoking callback');

            //invoke callback
            callBack(packageJson, parm1, parm2);

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
