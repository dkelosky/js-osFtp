define(function (require, exports, module) {
    'use strict';


  /**
   * Global variables
   */
  var sites = [];

  var COMMAND_EDIT_SITE_ID      = 'dkelosky.osftp.osftp_edit_site';
  var COMMAND_NEW_SITE_ID       = 'dkelosky.osftp.osftp_new_site';
  var COMMAND_RUN_SCRIPT_ID     = 'dkelosky.osftp.osftp_run_script';
  var COMMAND_RUN_SITE_BASE_ID  = 'dkelosky.osftp.osftp_run_';


  /**
   * Exported variables
   */
  exports.COMMAND_EDIT_SITE_ID      = COMMAND_EDIT_SITE_ID;
  exports.COMMAND_NEW_SITE_ID       = COMMAND_NEW_SITE_ID;
  exports.COMMAND_RUN_SCRIPT_ID     = COMMAND_RUN_SCRIPT_ID;
  exports.COMMAND_RUN_SITE_BASE_ID  = COMMAND_RUN_SITE_BASE_ID;

  exports.sites                     = sites;


});
