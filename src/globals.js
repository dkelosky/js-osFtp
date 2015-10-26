define(function (require, exports, module) {
   'use strict';


  /**
   * Global variables
   */
  var COMMAND_GET_FROM_SITE_ID  = 'theauthor.osftp.osftp_get_from_site';
  var COMMAND_EDIT_SITE_ID      = 'theauthor.osftp.osftp_edit_site';
  var COMMAND_NEW_SITE_ID       = 'theauthor.osftp.osftp_new_site';
  var COMMAND_RUN_SCRIPT_ID     = 'theauthor.osftp.osftp_run_script';
  var COMMAND_RUN_SITE_BASE_ID  = 'theauthor.osftp.osftp_run_';
	var COMMAND_RUN_SITE_BASE_LABEL = 'Upload To ';

	var OBJECT_FTP_SITE_ID        = 'FTP_SITE_OBJECT';

  var ESCAPE_KEY                = 27;

  var FTP_SCRIPT_FILE_EXTENSION = '.txt';

  var PREF                      = 'theauthor.osftp.preferences';
  var PREF_SITES                = 'theauthor.osftp.preferences.sites_'

  var sites                     = [];


  /**
   * Exported variables
   */
  exports.COMMAND_GET_FROM_SITE_ID  = COMMAND_GET_FROM_SITE_ID;
  exports.COMMAND_EDIT_SITE_ID      = COMMAND_EDIT_SITE_ID;
  exports.COMMAND_NEW_SITE_ID       = COMMAND_NEW_SITE_ID;
  exports.COMMAND_RUN_SCRIPT_ID     = COMMAND_RUN_SCRIPT_ID;
  exports.COMMAND_RUN_SITE_BASE_ID  = COMMAND_RUN_SITE_BASE_ID;
	exports.COMMAND_RUN_SITE_BASE_LABEL = COMMAND_RUN_SITE_BASE_LABEL;

	exports.OBJECT_FTP_SITE_ID        = OBJECT_FTP_SITE_ID;

  exports.ESCAPE_KEY                = ESCAPE_KEY;

  exports.FTP_SCRIPT_FILE_EXTENSION = FTP_SCRIPT_FILE_EXTENSION;

  exports.PREF                      = PREF;
  exports.PREF_SITES                = PREF_SITES;

  exports.sites                     = sites;

});
