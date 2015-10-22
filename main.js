/**
 * @TODO - Package and publish
 * @TODO - add error reporting
 * @TODO - add more extension checking and set transfer type accordingly (e.g. ascii, binary, ...)
 * @TODO - allow for ftp of directory
 * @TODO - allow for key bindings
 * @TODO - allow for ftp get of data
 */
define(function (require, exports, module) {
  'use strict';


  /**
   * Bracket modules
   */
  var AppInit        = brackets.getModule('utils/AppInit');
  var CommandManager = brackets.getModule('command/CommandManager');


  /**
   * Extension modules
   */
  var osFtpGlobals  = require('src/globals');
  var osFtpHandlers = require('src/handlers');
  var osFtpMenu     = require('src/menu');
  var osFtpStrings  = require('strings');


  /**
   * Initialization complete
   */
  AppInit.appReady(function () {

    //register command and add context menu to run a script
    CommandManager.register(osFtpStrings.COMMAND_RUN_SCRIPT_LABEL, osFtpGlobals.COMMAND_RUN_SCRIPT_ID, osFtpHandlers.handleRunScript);
    osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_RUN_SCRIPT_ID, true);

    //register command and add a context menu to create a site
    CommandManager.register(osFtpStrings.COMMAND_NEW_SITE_LABEL, osFtpGlobals.COMMAND_NEW_SITE_ID, osFtpHandlers.handleNewOrEditSite);
    osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_NEW_SITE_ID, false);

    //handlers
    osFtpHandlers.init();

  });


});
