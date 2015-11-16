define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var FileUtils = brackets.getModule('file/FileUtils');


	/**
	 * Extension modules
	 */
	var osFtpCommon  = require('src/common');
	var osFtpDialog = require('src/dialog');
	var osFtpPreferences  = require('src/preferences');
	var osFtpSitesManager = require('src/sitesManager');
	var osProjectFailDialog = require('text!templates/projectFailureDialog.html');
	var osFtpStrings = require('strings');


	/**
	 * Exported functions
	 */
	exports.generateUploadScript = generateUploadScript;


	/**
	 * Build an FTP script based on the list files that was choosen and the site selected
	 * @param   {Object []} listFile  Array of selected file to be FTP
	 * @param   {Object}    site      Site object containing information about the site to use
	 * @returns {String}              Completed FTP script if input is valid
	 *                                Empty string when input in invalid.
	 */
	function generateUploadScript(listFile, site) {

		//log this call
		console.log('getnerateUploadScript();');

		var dialogHtml;

		// validating inputs
		if (!osFtpCommon.isSet(listFile)) {

			//log this project error
			console.error('listFile is undefinded');

			//substitute values in our html
			dialogHtml = Mustache.render(osProjectFailDialog, osFtpStrings);

			//show error dialog
			osFtpDialog.showCommonDialog(osFtpStrings.DIALOG_TITLE_PROJECT_FAIL, dialogHtml);

			return '';
		}
		if (!osFtpSitesManager.validateSite(site)) {
			console.error('site is invalid');
			return '';
		}

		var returnScriptString = '';
		var localRootDir = '';
		var newScript    = [];
		var mkdirList    = [];
		var putBinList   = [];
		var putAsciiList = [];
		var isChmodSet   = false;
		var CHMOD_CMD;

		for (var i = 0; i < listFile.length; i++) {
			if (!osFtpCommon.isSet(localRootDir)) {
				localRootDir = FileUtils.stripTrailingSlash(listFile[i].rootDir);
			}

			mkdirList = generateMkDirList(mkdirList, listFile[i].relativeDir);

			if (isAsciiFileMode(listFile[i].relativePath)) {
				putAsciiList.push(listFile[i].relativePath);
			} else {
				putBinList.push(listFile[i].relativePath);
			}
		}

		if (osFtpCommon.isSet(site.getChmodStr())){
			CHMOD_CMD = 'QUOTE SITE CHMOD ' + site.getChmodStr() + ' ';
			isChmodSet = true;
		}

		//---------------------------------------------------------------------
		// Start generating the FTP script
		//---------------------------------------------------------------------

		// Generate logon command:
		newScript.push('OPEN ' + site.getHostAddr());
		newScript.push('USER');
		newScript.push(site.getUserName());
		newScript.push(site.getPassword());

		newScript.push('CD  ' + site.getRootDir());
		newScript.push('LCD ' + localRootDir);


		// Generate mkdir commands
		for (var i = 0; i < mkdirList.length; i++) {
			newScript.push('MKDIR ' + mkdirList[i]);
		}

		// Generate put ASCII commands
		newScript.push('ASCII');
		for (var i = 0; i < putAsciiList.length; i++) {
			var fromFile = FileUtils.convertToNativePath(putAsciiList[i]);
			var toFile   = FileUtils.convertWindowsPathToUnixPath(putAsciiList[i]).split(' ').join('_');

			newScript.push('PUT ' + '"' + fromFile + '"' + ' ' + toFile);

			if (isChmodSet){
				newScript.push(CHMOD_CMD + toFile);
			}
		}

		// Generate put Binary commands
		newScript.push('BIN');
		for (var i = 0; i < putBinList.length; i++) {
			var fromFile = FileUtils.convertToNativePath(putBinList[i]);
			var toFile   = FileUtils.convertWindowsPathToUnixPath(putBinList[i]).split(' ').join('_');

			newScript.push('PUT ' + '"' + fromFile + '"' + ' ' + toFile);

			if (isChmodSet){
				newScript.push(CHMOD_CMD + toFile);
			}
		}

		// End of script
		newScript.push('QUIT');

		for (var i = 0; i < newScript.length; i++) {
			returnScriptString = returnScriptString + newScript[i] + '\n';
		}

		//console.log(returnScriptString);

		return returnScriptString;
	}

	/**
	 * Generate a list of directory that may need to be created before PUT commands
	 * @param   {String []} currentList current list of the directory
	 * @param   {String}    dirPath     directory path to be consider
	 * @returns {String []} Return Updated version of currentList
	 */

	function generateMkDirList(currentList, dirPath) {
		var tempPath = FileUtils.convertWindowsPathToUnixPath(dirPath);
		var listNode = tempPath.split('/');

		console.log(listNode);

		var tempDir = '';
		for (var i = 0; i < listNode.length; i++) {
			if (osFtpCommon.isSet(listNode[i])) {
				if (!osFtpCommon.isSet(tempDir)) {
					tempDir = listNode[i];
				} else {
					tempDir = tempDir + '/' + listNode[i];
				}

				console.log(tempDir);
				if (currentList.indexOf(tempDir) == -1) {
					currentList.push(tempDir);
				}
			}
		}

		return currentList;
	}


	/**
	 * Check known extensions to see whether ftp should be done in ascii mode
	 * @param   {String}  InputFile file name including extension
	 * @returns {Boolean} Returns true if this extension should be ftp'ed as ascii
	 */

	function isAsciiFileMode(inputFile) {
		var returnStatus = false;

		// Getting list from preferences
		var asciiFileList = JSON.parse(osFtpPreferences.get('transferAsAsciiTable')).tableData;
		var noExtAsAscii  = osFtpPreferences.get('treatFileWithoutExtentionAsAscii');

		console.log(asciiFileList);

		// Extract file extension.
		var fileExt = FileUtils.getFileExtension(inputFile);

		if (asciiFileList.indexOf(fileExt.toLowerCase()) != -1) {
			returnStatus = true;
		} else if (!osFtpCommon.isSet(fileExt)){
			if (noExtAsAscii){
				returnStatus = true;
			}
		}

		return returnStatus;
	}

});
