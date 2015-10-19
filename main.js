/**
 * @TODO - NLS
 * @TODO - proper file structure (e.g. .html goes in /templates)
 * @TODO - common strcuture
 * @TODO - comment / doc
 * @TODO - settings
 * @TODO - add debugging
 * @TODO - add dialog for errors
 * @TODO - allow for automatically building of FTP command syntax and prompt user for usename and password
 * @TODO - error check handling, don't allow to execut a director as an ftp script for example
 */
define(function (require, exports, module) {
  'use strict';

  var NodeDomain      = brackets.getModule('utils/NodeDomain');
  var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils');
  var osFtpDomain    = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, 'node/FtpDomain'));

  var CommandManager  = brackets.getModule('command/CommandManager');
  var Menus           = brackets.getModule('command/Menus');
  var AppInit         = brackets.getModule('utils/AppInit');

  var Project         = brackets.getModule('project/ProjectManager');

  var COMMAND_LABEL             = 'OS FTP';
  var COMMAND_ID                = 'osftp';
  var COMMAND_ID_EXECUTE        = COMMAND_ID + 'Execute';
  var COMMAND_ID_WM_CONTEXTUAL  = COMMAND_ID + 'WM_Contextual'; //working set
  var COMMAND_ID_PM_CONTEXTUAL  = COMMAND_ID + 'PM_Contextual'; //project set

  AppInit.appReady(function () {

    var contextMenu;

    //register handlers for two menu contexts
    CommandManager.register(COMMAND_LABEL, COMMAND_ID_WM_CONTEXTUAL, handleOsFtp);
    CommandManager.register(COMMAND_LABEL, COMMAND_ID_PM_CONTEXTUAL, handleOsFtp);

    //add menu item for working set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU);
    contextMenu.addMenuDivider();
    contextMenu.addMenuItem(COMMAND_ID_WM_CONTEXTUAL);

    //add menu item for project set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    contextMenu.addMenuDivider();
    contextMenu.addMenuItem(COMMAND_ID_PM_CONTEXTUAL);

  });

  function handleOsFtp() {
    runFtpCommand(Project.getSelectedItem().fullPath);
  }

  /**
   * Function wrapper to invoke our domain function
   * @param {string} scriptFile File to use as an ftp script file
   */
  function runFtpCommand(scriptFile) {

    //invoke domain function
    osFtpDomain.exec('doFtp', scriptFile)

    //listen for done
    .done(
      function () {
        console.log('Completed: doFtp(scriptFile' + scriptFile + ' );');
      }
    )

    //listen for faile
    .fail(
      function () {
        console.error('Error in: doFtp(scriptFile' + scriptFile + ');');
      }
    )
  }

});
