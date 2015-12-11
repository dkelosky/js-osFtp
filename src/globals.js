define(function (require, exports) {
	'use strict';


	/**
	 * Global variables
	 */
	var COMMAND_PROD_SETTINGS_ID = '.osftp-settings';
	var COMMAND_EDIT_SITE_ID = '.osftp-edit-site';
	var COMMAND_NEW_SITE_ID = '.osftp-new-site';
	var COMMAND_RUN_SCRIPT_ID = '.osftp-run-script';
	var COMMAND_RUN_SITE_BASE_ID = '.osftp-run-';
	var COMMAND_FTP_PROJECT_ID = '.osftp-ftp-project';

	var COMMAND_RESTART_ID = 'debug.refreshWindow';

	var DEFAULT_VERSION = '0.0.0';

	var OBJECT_FTP_SITE_ID = 'FTP_SITE_OBJECT';
	var OBJECT_DIR_TREE_ID = 'DIR_TREE_OBJECT';

	var ESCAPE_KEY = 27;

	var FTP_SCRIPT_FILE_NAME = 'FTP_script';
	var FTP_SCRIPT_FILE_EXTENSION = '.txt';

	var PREF = '.preferences';
	var PREF_VERSION = '.preferences.version-';

	var SETTINGS_PREF = '.setting-preferences';

	var STATUS_INDICATOR_HTML_ID = 'osftp-status-indicator';
	var STATUS_POPOVER_CONTENT = 'osftp-status-content';
	var STATUS_INDICATOR_ID = '.status-indicator';

	var STATUS_VISIBLE_TIME = 3 * 1000;


	/**
	 * Exported variables
	 */
	exports.COMMAND_PROD_SETTINGS_ID = COMMAND_PROD_SETTINGS_ID;
	exports.COMMAND_EDIT_SITE_ID = COMMAND_EDIT_SITE_ID;
	exports.COMMAND_NEW_SITE_ID = COMMAND_NEW_SITE_ID;
	exports.COMMAND_RUN_SCRIPT_ID = COMMAND_RUN_SCRIPT_ID;
	exports.COMMAND_RUN_SITE_BASE_ID = COMMAND_RUN_SITE_BASE_ID;
	exports.COMMAND_FTP_PROJECT_ID = COMMAND_FTP_PROJECT_ID;

	exports.COMMAND_RESTART_ID = COMMAND_RESTART_ID;
	exports.OBJECT_DIR_TREE_ID = OBJECT_DIR_TREE_ID;

	exports.DEFAULT_VERSION = DEFAULT_VERSION;

	exports.OBJECT_FTP_SITE_ID = OBJECT_FTP_SITE_ID;

	exports.ESCAPE_KEY = ESCAPE_KEY;

	exports.FTP_SCRIPT_FILE_NAME = FTP_SCRIPT_FILE_NAME;
	exports.FTP_SCRIPT_FILE_EXTENSION = FTP_SCRIPT_FILE_EXTENSION;

	exports.PREF = PREF;
	exports.PREF_VERSION = PREF_VERSION;

	exports.SETTINGS_PREF = SETTINGS_PREF;

	exports.STATUS_INDICATOR_HTML_ID = STATUS_INDICATOR_HTML_ID;
	exports.STATUS_POPOVER_CONTENT = STATUS_POPOVER_CONTENT;
	exports.STATUS_INDICATOR_ID = STATUS_INDICATOR_ID;

	exports.STATUS_VISIBLE_TIME = STATUS_VISIBLE_TIME;

	exports.TREE_TYPE_ROOT = 'root';
	exports.TREE_TYPE_DIR  = 'directory';
	exports.TREE_TYPE_FILE = 'file';
	exports.DEFAULT_REMOTE_OS = 'zOS';

});
