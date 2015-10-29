/**
 * @TODO - Package and publish
 * @TODO - add error reporting, perhaps add panel for logging data to see errors
 * @TODO - allow for key bindings
 * @TODO - allow for ftp get of data
 * @TODO - automation testing to add and remove sites, submit jobs, and verify success
 * @TODO - send event on node complete
 * @TODO - allow kill of process if too much time passes (for now, close Brackets)
 */
define(function(require, exports, module) {
  'use strict';


  /**
   * Bracket modules
   */
  var AppInit         = brackets.getModule('utils/AppInit');
  var CommandManager  = brackets.getModule('command/CommandManager');
  var Commands        = brackets.getModule('command/Commands');
  var Menus           = brackets.getModule('command/Menus');
  var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils');
  var StatusBar       = brackets.getModule('widgets/StatusBar');


  /**
   * Extension modules
   */
  var osFtpSettingsDialog = require('src/settingsDialog');
  var osFtpGlobals        = require('src/globals');
  var osFtpHandlers       = require('src/handlers');
  var osFtpMenu           = require('src/menu');
  var osFtpStrings        = require('strings');

  // Register settings command and add it to the menu.
  CommandManager.register(osFtpStrings.COMMAND_PRODUCT_SETTINGS_LABEL, osFtpGlobals.COMMAND_PROD_SETTINGS_ID, osFtpSettingsDialog.show);
  Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem(osFtpGlobals.COMMAND_PROD_SETTINGS_ID, "", Menus.AFTER, Commands.FILE_PROJECT_SETTINGS);

  /**
   * Initialization complete
   */
  AppInit.appReady(function() {

    //register command and add context menu to run a script
    CommandManager.register(osFtpStrings.COMMAND_RUN_SCRIPT_LABEL, osFtpGlobals.COMMAND_RUN_SCRIPT_ID, osFtpHandlers.handleRunScript);
    osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_RUN_SCRIPT_ID, true);

    //register command and add a context menu to create a site
    CommandManager.register(osFtpStrings.COMMAND_NEW_SITE_LABEL, osFtpGlobals.COMMAND_NEW_SITE_ID, osFtpHandlers.handleNewOrEditSite);
    osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_NEW_SITE_ID, false);

    //handlers
    osFtpHandlers.init();

    //add the status indicator
    addStatusIndicator();

  });


  /**
   * Adds the status indicator to the bottom bar
   */
  function addStatusIndicator() {

    //build status indicator
    var statusIndicatorHtml = $('<div id="' +
      osFtpGlobals.STATUS_INDICATOR_HTML_ID +
      '">' +
      osFtpStrings.STATUS_FTP_INDICATOR +
      '</div>');

    //add to bar
    StatusBar.addIndicator(
      osFtpGlobals.STATUS_INDICATOR_ID, //unique id
      statusIndicatorHtml,              //html
      true,                             //show the indicator
      '',                               //class style
      osFtpStrings.STATUS_FTP_TOOLTIP   //tooltip text
    );

  }


});
