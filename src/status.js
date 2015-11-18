define(function (require, exports) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var StatusBar = brackets.getModule('widgets/StatusBar');


	/**
	 * Third Party
	 * -> These were was copied from the Brackets /widgets folder since our extension doesn't appear to have access to these.
	 * The Brackets doc is aweful in so many ways and really excells at being aweful for the widgets/bootstrap-* APIs.
	 *
	 * These modules add definitions to JQuery for $().tooltip() and $().popover
	 *
	 * See the bottom of bootstrap-tooltip.js which appears to add a class of functions to $ using window.jQuery.
	 */
	require('thirdparty/bootstrap-tooltip');
	require('thirdparty/bootstrap-popover');

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

		var popoverContent =
			'<div id=\'' + osFtpGlobals.STATUS_POPOVER_CONTENT + '\'>' +
			osFtpStrings.UPLOAD + '  /  ' + osFtpStrings.FILES +
			'</div>';

		//build status indicator
		var statusIndicatorHtml =
			$('<div id="' +
			osFtpGlobals.STATUS_INDICATOR_HTML_ID +
			'" ' +
			'class="osftp-status" ' +
			'data-container="body" ' +
			'data-toggle="popover" ' +
			'data-html="true" ' +
			'data-placement="top" ' +
			'data-content="' + popoverContent + '">' +
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

		//enable popovers
		$('[data-toggle="popover"]').popover();
	}


});
