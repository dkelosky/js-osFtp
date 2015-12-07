define(function (require, exports) {
	'use strict';

	var Project = brackets.getModule('project/ProjectManager');
	var FileUtils = brackets.getModule('file/FileUtils');

	var Strings     = require('strings');
	var Preferences = require('src/preferences');


	/**
	 * Exported functions
	 */
	exports.isSet = isSet;
	exports.getSelectedFiles = getSelectedFiles;
	exports.getProjectFiles = getProjectFiles;
	exports.generateHtmlTable = generateHtmlTable;
	exports.extractTableData = extractTableData;
	exports.relativePathToFile = relativePathToFile;
	exports.consoleDebug       = consoleDebug;

	/**
	 * Check if a variable is undefined or null
	 *
	 * @param   {*}  variable The variable to check
	 *
	 * @returns {Boolean} true if the element is defined and not null
	 *                    false if the element is undefined or null
	 */
	function isSet(variable) {
		if (typeof variable == "undefined") {
			return false;
		} else if (variable === null) {
			return false;
		} else if (typeof variable === "string") {
			return variable !== "";
		} else if (typeof variable === "number") {
			return variable !== 0;
		} else if (typeof variable === "object") {
			//Split arrays and objects
			if (typeof variable.length === "undefined") {
				//We are now dealing with an object
				var foundData = false;
				for (var x in variable) {
					if (typeof variable[x] !== "undefined" && variable[x] !== null) {
						foundData = true;
						break;
					}
				}
				return foundData;
			} else {
				//We are now processing an array
				if (variable.length >= 1) return true;
				else return false;
			}
		}

		return true;
	}

	/**
	 * Return list of files
	 * @returns {Array[File]} return array of selected file with the following info:
	 *      File.rootDir      : Root directory of the current open folder
	 *      File.name         : file name
	 *      File.fullDir      : Full directory of the file
	 *      File.fullPath     : Full path of the file
	 *      File.relativeDir  : Directory relative to root directory
	 *      File.relativePath : File path relative to root directory
	 */

	function getSelectedFiles() {

		consoleDebug('getSelectedFiles();');

		var returnList = [];
		var fileList = [];
		var i;

		// Get the root directory and selected item
		var rootDir = Project.getProjectRoot().fullPath;
		var selectedItem = Project.getSelectedItem();

		// If item is a directory then will have to collect all of the files
		//   that is under that directory.
		if (selectedItem.isDirectory) {
			var currentDir = selectedItem.fullPath;

			Project.rerenderTree();

			// Loop through all file in root directory to locate file that contain
			//   the selected directory.
			Project.getAllFiles(function (File) {
				var currentFile = File.fullPath;
				if (currentFile.indexOf(currentDir) > -1) {
					fileList.push(File);
				}
			});
		}
		// If item is file then just add the file to the list.
		else {
			fileList.push(selectedItem);
		}

		// Format the return object
		for (i = 0; i < fileList.length; i++) {

			var object = {
				rootDir: rootDir,
				name: fileList[i].name,
				fullDir: fileList[i].parentPath,
				fullPath: fileList[i].fullPath,
				relativeDir: FileUtils.getRelativeFilename(rootDir, fileList[i].parentPath),
				relativePath: FileUtils.getRelativeFilename(rootDir, fileList[i].fullPath)
			};

			returnList.push(object);
		}

		for (i = 0; i < returnList.length; i++) {
			consoleDebug(JSON.stringify(returnList[i]));
		}

		return returnList;
	}

	/**
	 * Return list of all files in the current project
	 * @returns {Array[File]} return array of selected file with the following info:
	 *      File.rootDir      : Root directory of the current open folder
	 *      File.name         : file name
	 *      File.fullDir      : Full directory of the file
	 *      File.fullPath     : Full path of the file
	 *      File.relativeDir  : Directory relative to root directory
	 *      File.relativePath : File path relative to root directory
	 */

	function getProjectFiles() {
		consoleDebug('getProjectFiles()');

		var returnList = [];

		var rootDir = Project.getProjectRoot().fullPath;

		Project.getAllFiles(function (File) {

			var object = {
				rootDir: rootDir,
				name: File.name,
				fullDir: File.parentPath,
				fullPath: File.fullPath,
				relativeDir: FileUtils.getRelativeFilename(rootDir, File.parentPath),
				relativePath: FileUtils.getRelativeFilename(rootDir, File.fullPath)
			};

			returnList.push(object);
		});

        for (i = 0; i < returnList.length; i++) {
			consoleDebug(JSON.stringify(returnList[i]));
		}

		return returnList;
	}

	function relativePathToFile(inputPath, inputRoot){
		var returnObj = {
				rootDir : inputRoot,
				name    : FileUtils.getBaseName(inputPath),
				fullDir : inputRoot + FileUtils.getDirectoryPath(inputPath),
				fullPath: inputRoot + inputPath,
				relativeDir : FileUtils.getDirectoryPath(inputPath),
				relativePath : inputPath
		};

		return returnObj;
	}

	/**
	 * generate HTML Table
	 * @returns html string of the table
	 */

	function generateHtmlTable(data, tableDiv, otherAttr) {
		consoleDebug(data);
		var isCheckbox = false;
		var cellId;
		var tableId = tableDiv + '-table';
		var row = 1;
		var	rowData;

		var html = '<table id="' + tableId + '" class="table table-striped table-bordered" >';

		//check for other attribute
		if (isSet(otherAttr)){
			if (otherAttr.indexOf('checkbox') > -1){
				isCheckbox = true;
			}
		}

		if (isSet(data)) {
			if ($.isArray(data)) {
				for (row in data) {
					rowData = data[row];

					html += '<tr id="row' + row + '">';

					if (isCheckbox){
						cellId = tableDiv + '-row' + row + '-checkbox';
						html += '<td id="' + cellId + '">' + '<input type="checkbox"/>' + '</td>';
					}

					if ($.isArray(rowData)) {
						for (var col in rowData) {
							cellId = tableDiv + '-row' + row + '-col' + col;
							html += '<td id="' + cellId + '">' + rowData[col] + '</td>';
						}
					} else {
						cellId = tableDiv + '-row' + row + '-col1';
						html += '<td id="' + cellId + '">' + rowData + '</td>';
					}

					html += '</tr>';
				}
			} else if (data.hasOwnProperty('tableData')) {
				for (var i = 0; i < data.tableData.length; i++) {
					rowData = data.tableData[i];

					html += '<tr id="row' + i + '">';

					if (isCheckbox){
						cellId = tableDiv + '-row' + row + '-checkbox';
						html += '<td id="' + cellId + '"' + '<input type="checkbox"/>' + '</td>';
					}

					if ($.isArray(rowData)) {
						for (var j = 0; j < rowData.length; j++) {
							cellId = tableDiv + '-row' + i + '-col' + j;
							html += '<td id="' + cellId + '">' + rowData[j] + '</td>';
						}
					} else {
						cellId = tableDiv + '-row' + i + '-col1';
						html += '<td id="' + cellId + '">' + rowData + '</td>';
					}

					html += '</tr>';
				}
			}
		}

		html += "</table>";

		return html;
	}

	function extractTableData($table) {
		var object = {
			tableData: []
		};

		consoleDebug($table);
		$table.find("tr").each(function () {
			var rowData = [];
			$(this).find("td").each(function (colIndex, c) {
				rowData.push(c.textContent);
			});

			if (rowData.length === 1) {
				object.tableData.push(rowData[0]);
			} else {
				object.tableData.push(rowData);
			}
		});

		return object;
	}

	/**
	 * Debug log function
	 **/
	function consoleDebug(msg) {
		var debugOn     = Preferences.get("debugMode");
		if (debugOn){
			console.log(Strings.EXT_NAME + msg);
		}

	}


});
