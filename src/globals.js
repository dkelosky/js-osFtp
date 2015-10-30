define(function (require, exports, module) {
	'use strict';


	/**
	 * Global variables
	 */
	var COMMAND_PROD_SETTINGS_ID = 'theauthor.osftp.osftp-settings';
	var COMMAND_GET_FROM_SITE_ID = 'theauthor.osftp.osftp-get-from-site';
	var COMMAND_EDIT_SITE_ID = 'theauthor.osftp.osftp-edit-site';
	var COMMAND_NEW_SITE_ID = 'theauthor.osftp.osftp-new-site';
	var COMMAND_RUN_SCRIPT_ID = 'theauthor.osftp.osftp-run-script';
	var COMMAND_RUN_SITE_BASE_ID = 'theauthor.osftp.osftp-run-';

	var OBJECT_FTP_SITE_ID = 'FTP_SITE_OBJECT';

	var ESCAPE_KEY = 27;

	var FTP_SCRIPT_FILE_NAME = 'FTP_script';
	var FTP_SCRIPT_FILE_EXTENSION = '.txt';

	var PREF = 'theauthor.osftp.preferences';
	var PREF_SITES = 'theauthor.osftp.preferences.sites-'

	var SETTINGS_PREF = 'theauthor.osftp.setting-preferences';

	var sites = [];

	var STATUS_INDICATOR_HTML_ID = 'theauthor-osftp-status-indicator';
	var STATUS_INDICATOR_ID = 'theauthor.osftp.status-indicator';

	var STATUS_VISIBLE_TIME = 3 * 1000;


	/**
	 * Exported variables
	 */

	exports.COMMAND_PROD_SETTINGS_ID = COMMAND_PROD_SETTINGS_ID;
	exports.COMMAND_GET_FROM_SITE_ID = COMMAND_GET_FROM_SITE_ID;
	exports.COMMAND_EDIT_SITE_ID = COMMAND_EDIT_SITE_ID;
	exports.COMMAND_NEW_SITE_ID = COMMAND_NEW_SITE_ID;
	exports.COMMAND_RUN_SCRIPT_ID = COMMAND_RUN_SCRIPT_ID;
	exports.COMMAND_RUN_SITE_BASE_ID = COMMAND_RUN_SITE_BASE_ID;

	exports.OBJECT_FTP_SITE_ID = OBJECT_FTP_SITE_ID;

	exports.ESCAPE_KEY = ESCAPE_KEY;

	exports.FTP_SCRIPT_FILE_NAME = FTP_SCRIPT_FILE_NAME;
	exports.FTP_SCRIPT_FILE_EXTENSION = FTP_SCRIPT_FILE_EXTENSION;

	exports.PREF = PREF;
	exports.PREF_SITES = PREF_SITES;

	exports.SETTINGS_PREF = SETTINGS_PREF;

	exports.sites = sites;

	exports.STATUS_INDICATOR_HTML_ID = STATUS_INDICATOR_HTML_ID;
	exports.STATUS_INDICATOR_ID = STATUS_INDICATOR_ID;

	exports.STATUS_VISIBLE_TIME = STATUS_VISIBLE_TIME;

});
