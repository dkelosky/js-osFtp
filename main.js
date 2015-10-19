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
 * @TODO - add config file for default / editable transfer types (e.g. ascii, binary, ...)
 */
define(function (require, exports, module) {
  'use strict';

  //these map to folders in http://brackets.io/docs (e.g. see utils/NodeDomain)
  var NodeDomain = brackets.getModule('utils/NodeDomain');
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  var osFtpDomain = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, 'node/FtpDomain'));

  var CommandManager = brackets.getModule('command/CommandManager');
  var Menus = brackets.getModule('command/Menus');

  var AppInit = brackets.getModule('utils/AppInit');
  var File = brackets.getModule('file/FileUtils');

  var Project = brackets.getModule('project/ProjectManager');

  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');

  var Dialog = brackets.getModule('widgets/Dialogs');

  var COMMAND_RUN_SCRIPT_LABEL            = 'Run as FTP Script';
  var COMMAND_RUN_SCRIPT_ID               = 'osftp_run_script';
  var COMMAND_RUN_SCRIPT_ID_EXECUTE       = COMMAND_RUN_SCRIPT_ID + '_execute';
  var COMMAND_RUN_SCRIPT_ID_WM_CONTEXTUAL = COMMAND_RUN_SCRIPT_ID + '_wm_contextual'; //working set
  var COMMAND_RUN_SCRIPT_ID_PM_CONTEXTUAL = COMMAND_RUN_SCRIPT_ID + '_pm_contextual'; //project set

  var COMMAND_NEW_SITE_LABEL            = 'New FTP Site...';
  var COMMAND_NEW_SITE_ID               = 'osftp_new_site';
  var COMMAND_NEW_SITE_ID_EXECUTE       = COMMAND_NEW_SITE_ID + '_execute';
  var COMMAND_NEW_SITE_ID_WM_CONTEXTUAL = COMMAND_NEW_SITE_ID + '_wm_contextual'; //working set
  var COMMAND_NEW_SITE_ID_PM_CONTEXTUAL = COMMAND_NEW_SITE_ID + '_pm_contextual'; //project set

  //preference ids
  var PREF_USER = 'user';
  var PREF_PASS = 'password';
  var PREF_HOST = 'localhost';

  //preference default values
  var PREF_DFLT_USER = 'user';
  var PREF_DFLT_PASS = 'password';
  var PREF_DFLT_HOST = 'localhost';

  var osFtpPreferences = PreferencesManager.getExtensionPrefs(COMMAND_RUN_SCRIPT_ID);

  var user = osFtpPreferences.get(PREF_USER) || PREF_DFLT_USER;
  var pass = osFtpPreferences.get(PREF_PASS) || PREF_DFLT_PASS;
  var host = osFtpPreferences.get(PREF_HOST) || PREF_DFLT_HOST;

  console.log('Preferences are: ' +
    'user - ' + user + ', ' +
    'pass - ' + pass + ', ' +
    'host - ' + host
  );

  AppInit.appReady(function () {

    var contextMenu;

    //register handlers for two menu contexts
    CommandManager.register(COMMAND_RUN_SCRIPT_LABEL, COMMAND_RUN_SCRIPT_ID_WM_CONTEXTUAL, handleRunScript);
    CommandManager.register(COMMAND_RUN_SCRIPT_LABEL, COMMAND_RUN_SCRIPT_ID_PM_CONTEXTUAL, handleRunScript);

    //add menu item for working set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU);
    contextMenu.addMenuDivider();
    contextMenu.addMenuItem(COMMAND_RUN_SCRIPT_ID_WM_CONTEXTUAL);

    //add menu item for project set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    contextMenu.addMenuDivider();
    contextMenu.addMenuItem(COMMAND_RUN_SCRIPT_ID_PM_CONTEXTUAL);


    //register handlers for two menu contexts
    CommandManager.register(COMMAND_NEW_SITE_LABEL, COMMAND_NEW_SITE_ID_WM_CONTEXTUAL, handleNewSite);
    CommandManager.register(COMMAND_NEW_SITE_LABEL, COMMAND_NEW_SITE_ID_PM_CONTEXTUAL, handleNewSite);

    //add menu item for working set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU);
    contextMenu.addMenuItem(COMMAND_NEW_SITE_ID_WM_CONTEXTUAL);

    //add menu item for project set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    contextMenu.addMenuItem(COMMAND_NEW_SITE_ID_PM_CONTEXTUAL);

  });


function handleNewSite() {

  Dialog.showModalDialog(null, //class
    'Add New Site', //title
    'Host:' +
    '<br>' +
    '<input type="text" name="host">' +
    '<br>' +
    'Root:' +
    '<br>' +
    '<input type="text" name="root">' +
    '<br>' +
    '<form>' +
    'User:' +
    '<br>' +
    '<input type="text" name="user">' +
    '<br>' +
    'Password:' +
    '<br>' +
    '<input type="password" name="password">' +
    '</form>',
    null, //buttons
    true); //auto dismiss

}



  function handleRunScript() {

    if (File.getDirectoryPath(Project.getSelectedItem().fullPath) == Project.getSelectedItem().fullPath)
      console.log('Select FTP script file - not a directory');
    else
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
