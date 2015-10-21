/**
 * @TODO - NLS, define strings in extenal file
 * @TODO - proper file structure (e.g. .html goes in /templates)
 * @TODO - common strcuture
 * @TODO - comment / doc
 * @TODO - settings
 * @TODO - add debugging
 * @TODO - add dialog for errors
 * @TODO - allow for automatically building of FTP command syntax and prompt user for usename and password
 * @TODO - error check handling, don't allow to execut a director as an ftp script for example
 * @TODO - add config file for default / editable transfer types (e.g. ascii, binary, ...)
 * @TODO - separate into multiple pieces
 * @TODO - clean dialog UI
 * @TODO - what goes in app init, can some things be done earlier?
 * @TODO - hide context menu for ineligible ftp(maybe?) perhaps allow for the ability to ftp a directory???
 * @TODO - generalize add context menu, t/f for devider, menu id to append after
 * @TODO - key bindings in dialog for each ftp, (i.e. set Ctrl + Alt + 1 to ftp to ca11?)
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

  var COMMAND_NEW_SITE_LABEL            = 'New FTP Site...';
  var COMMAND_NEW_SITE_ID               = 'osftp_new_site';

  var PREF = 'osftp';
  var PREF_SESSION = 'session_'

  var osFtpPreferences = PreferencesManager.getExtensionPrefs(PREF);

  var EXECUTE = '_execute';


  /**
   * Initialization complete
   */
  AppInit.appReady(function () {

    //add context menu to run a script
    regCommandAndAddToContextMenus(COMMAND_RUN_SCRIPT_LABEL, COMMAND_RUN_SCRIPT_ID, handleRunScript, true);

    //add a context menu to create a site
    regCommandAndAddToContextMenus(COMMAND_NEW_SITE_LABEL, COMMAND_NEW_SITE_ID, handleNewSite, false);

  });


function regCommandAndAddToContextMenus(label, id, handler, addMenuDivider, afterId) {

  var contextMenu;

  var COMMAND_RUN_SCRIPT_LABEL = 'Run as FTP Script';
  var COMMAND_RUN_SCRIPT_ID = 'osftp_run_script';
  var ID_EXECUTE = id + EXECUTE;


  /**
   * Register the command
   */

  //register working set command
  CommandManager.register(label, ID_EXECUTE, handler);


  /**
   * Add to working set
   */

  //get menu item for working set
  contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU);

  //add menu divider if requested
  if (addMenuDivider)
    contextMenu.addMenuDivider();

  //add menu item for working set
  addContextMenuItem(contextMenu, ID_EXECUTE, afterId);


  /**
   * Add to project set
   */

  //get menu item for project set
  contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);

  //add menu divider if requested
  if (addMenuDivider)
    contextMenu.addMenuDivider();

  //add menu item for project set
  addContextMenuItem(contextMenu, ID_EXECUTE, afterId);

}

function addContextMenuItem(contextMenu, id, afterId) {

  //if we don't have an afterId
  if (!isSet(afterId)) {

    //add to menu with defaults
    contextMenu.addMenuItem(id);

  //else we were given an afterId
  } else {

    //orient to id we want to add after
    var AFTER_ID_EXECUTE = afterId + EXECUTE;

    //add to menu after afterId
    contextMenu.addMenuItem(
      id,               //new id
      null,             //no key binding
      Menus.AFTER,      //position
      AFTER_ID_EXECUTE  //after this id
    );
  }

}

function isSet(variable) {
  if (variable != 'undefined' && variable != null && variable != '')
    return true;
  return false;
}


function handleNewSite() {

  var escapeKey = 27;

  var buttons = [
    {
    className: Dialog.DIALOG_BTN_CLASS_LEFT,
    id: Dialog.DIALOG_BTN_CANCEL,
    text: 'CANCEL'
  },
    {
    className: Dialog.DIALOG_BTN_CLASS_PRIMARY,
    id: Dialog.DIALOG_BTN_OK,
    text: 'OK'
  }
  ];

  var inputDialog = Dialog.showModalDialog(null, //class
    'Add New Site', //title
    'Name:' +
    '<br>' +
    '<input id="input-name" type="text">' +
    '<br>' +
    'Host:' +
    '<br>' +
    '<input id="input-host" type="text">' +
    '<br>' +
    'Root:' +
    '<br>' +
    '<input id="input-root" type="text">' +
    '<br>' +
    '<form>' +
    'User:' +
    '<br>' +
    '<input id="input-user" type="text">' +
    '<br>' +
    'Password:' +
    '<br>' +
    '<input id="input-pass" type="password">' +
    '</form>',
    buttons,
    false); //disable auto dismiss

  //listen for escape key
  $(document).keyup(function (event) {

    if (event.which == escapeKey)

      //close if escape
      inputDialog.close();

  });

  //listen for cancel (modal doesnt have standard id= attribute, it's data-button-id
  $('button[data-button-id="' + Dialog.DIALOG_BTN_CANCEL + '"').click(function () {

    console.log('Dialog closed without save');

    inputDialog.close();

  });

  //listen for ok
  $('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

    var name = $('#input-name').val();
    var host = $('#input-host').val();
    var root = $('#input-root').val();
    var user = $('#input-user').val();
    var pass = $('#input-pass').val();

    console.log('Dialog inputs are: ' +
      'name - ' + name + ', ' +
      'host - ' + host + ', ' +
      'root - ' + root + ', ' +
      'user - ' + user + ', ' +
      'pass - ' + pass
    );

    //@TODO, validate name is not already used

    //@TODO, save preferences

    var session = {
      name: name,
      host: host,
      root: root,
      user: user,
      pass: pass
    };

    osFtpPreferences.set(PREF_SESSION + name, session);

    //@TODO, allow for edit of previous site names

    var COMMAND_RUN_SITE_LABEL            = name;
    var COMMAND_RUN_SITE_ID               = 'osftp_run_' + name;

    //add a context menu to create a site
    regCommandAndAddToContextMenus(COMMAND_RUN_SITE_LABEL, COMMAND_RUN_SITE_ID, handleRunSite, false, COMMAND_NEW_SITE_ID);

    console.log('Dialog closed with save');

    inputDialog.close();

  });

  //listen for dialog done
  inputDialog.done(function () {

    console.log('Dialog modal is dismissed');

  });

}

  function handleRunSite() {

    //like 'C:' is two characters
    var WINDOWS_DRIVE_LETTER_OFFSET = 0;
    var WINDOWS_DRIVE_LETTER_LEN = 2;
    var WINDOWS_DRIVE_SEPERATOR_OFFSET = 1;
    var WINDOWS_DRIVE_SEPERATOR = ':';
    var WINDOWS_DRIVE_DIRECTORY_CHAR= '\\';

    var name = this.getName();

    var session = osFtpPreferences.get(PREF_SESSION + name);


    if (File.getDirectoryPath(Project.getSelectedItem().fullPath) == Project.getSelectedItem().fullPath) {

      console.log('Select FTP script file - not a directory');

    }

    else {

      var ftpStdin = '';

      ftpStdin += 'op ';
      ftpStdin += session.host;
      ftpStdin += '\n';

      ftpStdin += 'user\n';

      ftpStdin += session.user;
      ftpStdin += '\n';
      ftpStdin += session.pass;
      ftpStdin += '\n';

      ftpStdin += 'cd ';
      ftpStdin += session.root;
      ftpStdin += '\n';


      var directory = File.getDirectoryPath(Project.getSelectedItem().fullPath).split('/');



      if (directory[WINDOWS_DRIVE_LETTER_OFFSET].length == WINDOWS_DRIVE_LETTER_LEN) {

        if (directory[WINDOWS_DRIVE_LETTER_OFFSET].charAt(WINDOWS_DRIVE_SEPERATOR_OFFSET) == WINDOWS_DRIVE_SEPERATOR)
          directory[WINDOWS_DRIVE_LETTER_OFFSET] += WINDOWS_DRIVE_DIRECTORY_CHAR;

      }

      directory.forEach(function(dir) {

        if (dir != null && dir != '')     {

          ftpStdin += 'lcd ';
          ftpStdin += dir;
          ftpStdin += '\n';
        }


      });

      var extension = File.getFileExtension(Project.getSelectedItem().fullPath);

      if (extension == 'class')
        ftpStdin += 'binary\n';

      ftpStdin += 'put ';
      ftpStdin += File.getBaseName(Project.getSelectedItem().fullPath);
      ftpStdin += '\n';

      ftpStdin += 'quit \n';

      runFtpCommandStdin(File.getDirectoryPath(Project.getSelectedItem().fullPath) + '/node/' + session.host + '.txt', ftpStdin);
    }

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
        console.log('Completed: doFtp(' + scriptFile + ');');
      }
    )

    //listen for faile
    .fail(
      function () {
        console.error('Error in: doFtp(' + scriptFile + ');');
      }
    )
  }

  /**
   * Function wrapper to invoke our domain function
   * @param {string} scriptFile File to use as an ftp script file
   */
  function runFtpCommandStdin(file, data) {

    //invoke domain function
    osFtpDomain.exec('doFtpStdin', file, data)

    //listen for done
    .done(
      function () {
        console.log('Completed: doFtpStdin(' + file + ', ' + data + ');');
      }
    )

    //listen for faile
    .fail(
      function () {
        console.error('Error in: doFtpStdin(' + file + ', ' + data + ');');
      }
    )
  }

});
