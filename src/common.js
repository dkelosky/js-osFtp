define(function (require, exports) {
	'use strict';

	var FileUtils = brackets.getModule('file/FileUtils');

	var Strings     = require('strings');
	var Preferences = require('src/preferences');


	/**
	 * Exported functions
	 */
	exports.isSet = isSet;
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
			var date = new Date();
			var timeStr = '[' + date.toLocaleTimeString() + ']';
			console.log(Strings.EXT_NAME + timeStr + ' '+ msg);
		}

	}


});
