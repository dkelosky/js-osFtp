define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var StatusBar = brackets.getModule('widgets/StatusBar');


	/**
	 * Extension modules
	 */
	var osFtpGlobals = require('src/globals');
	var osFtpStrings = require('strings');


	/**
	 * Exported functions
	 */
	exports.addStatusIndicator = addStatusIndicator;


	/**
	 * Adds the status indicator to the bottom bar
	 */
	function addStatusIndicator(packageJson) {

		//build status indicator
		var statusIndicatorHtml = $('<div id="' +
			osFtpGlobals.STATUS_INDICATOR_HTML_ID +
			'">' +
			osFtpStrings.STATUS_FTP_INDICATOR +
			'</div>');

		//add to bar
		StatusBar.addIndicator(
			packageJson.name + osFtpGlobals.STATUS_INDICATOR_ID, //unique id
			statusIndicatorHtml, //html
			true, //show the indicator
			'', //class style
			osFtpStrings.STATUS_FTP_TOOLTIP //tooltip text
		);

	}


});
