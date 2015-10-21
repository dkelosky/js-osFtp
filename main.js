/**
 * @TODO - Package and publish
 * @TODO - NLS, define strings in extenal file
 * @TODO - proper file structure (e.g. .html goes in /templates)
 * @TODO - common strcuture
 * @TODO - comment / doc
 * @TODO - error reporting
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
 * @TODO - allow for ftp get of data
 * @TODO - allow site delete
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

  var COMMAND_RUN_SCRIPT_LABEL = 'Run as FTP Script';
  var COMMAND_RUN_SCRIPT_ID = 'osftp_run_script';

  var COMMAND_NEW_SITE_LABEL = 'New FTP Site...';
  var COMMAND_NEW_SITE_ID = 'osftp_new_site';

  var COMMAND_RUN_SITE_BASE = 'osftp_run_';

  var COMMAND_EDIT_SITE_ID = 'osftp_edit_site';

  var PREF = 'osftp';
  var PREF_SITE = 'site_'
  var PREF_SITES = 'sites_'

  var osFtpPreferences = PreferencesManager.getExtensionPrefs(PREF);

  var EXECUTE = '_execute';

  var FTP_SCRIPT_FILE_EXTENSION = '.txt';

  var FTP_BINARY_EXTENSIONS = ['class'];

  var enableEditSites = false;

  var sites = [];

  var ESCAPE_KEY = 27;

  var RADIO_SITE_NAME = 'site';


  /**
   * Initialization complete
   */
  AppInit.appReady(function () {

    //register command and add context menu to run a script
    regCommandAndAddToContextMenus(COMMAND_RUN_SCRIPT_LABEL, COMMAND_RUN_SCRIPT_ID, handleRunScript, true);

    //register command and add a context menu to create a site
    regCommandAndAddToContextMenus(COMMAND_NEW_SITE_LABEL, COMMAND_NEW_SITE_ID, handleNewSite, false);

    //get saved preferences
    sites = osFtpPreferences.get(PREF_SITES);

    //add back saved sites
    sites.forEach(function (site) {
      addSite(site);

    });

    //enable editing if we have at least one site
    if (sites.length > 0)
      enableEditSite();

  });


  /**
   * Remove items from the context menu
   * @param {String} id Id to remove from the context menu
   */
  function removeFromContextMenus(id) {

    //function vars
    var contextMenu;
    var ID_EXECUTE = id + EXECUTE;

    //remove from the working set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU);
    contextMenu.removeMenuItem(ID_EXECUTE);

    //remove from the project set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    contextMenu.removeMenuItem(ID_EXECUTE);

  }

  /**
   * Register a command and add to the two context menus
   * @param {String}   label          Label to appear in the menu
   * @param {String}   id             Base id for this command, registered by appending EXECUTE constant
   * @param {Function} handler        Function to be called when the command is clicked
   * @param {Boolean}  addMenuDivider Indicator of whether or not a menu divider should be added
   * @param {String}   afterId        Previouslly added menu where we want to place the new item after
   * @param {Boolean}  before         Indicator of whether or not a menu divider should be added before or after
   */
  function regCommandAndAddToContextMenus(label, id, handler, addMenuDivider, afterId, before) {

    //function vars
    var contextMenu;
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
    addContextMenuItem(contextMenu, ID_EXECUTE, afterId, before);


    /**
     * Add to project set
     */

    //get menu item for project set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);

    //add menu divider if requested
    if (addMenuDivider)
      contextMenu.addMenuDivider();

    //add menu item for project set
    addContextMenuItem(contextMenu, ID_EXECUTE, afterId, before);

  }

  /**
   * Add an item to a context menu
   * @param {Object}  contextMenu Project or working set context menu object
   * @param {String}  id          Identifier of command to be added
   * @param {String}  afterId     Id where the menu item will be added after
   * @param {Boolean} before      Indicator of whether or not a menu divider should be added before or after
   */
  function addContextMenuItem(contextMenu, id, afterId, before) {

    //assume position is after
    var position = Menus.AFTER;

    //if before alter position
    if (before)
      position = Menus.BEFORE;

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
        position,         //position
        AFTER_ID_EXECUTE  //after this id
      );
    }

  }

  /**
   * Determines whether or not a variable exists, is null, or contains no data
   * @param   {String} variable Any variable type
   * @returns {Boolean}  Returns true if the variable is defined
   */
  function isSet(variable) {
    if (variable != 'undefined' && variable != null && variable != '')
      return true;
    return false;
  }

  /**
   * Invokes the site dialog
   * @param   {Object}   name_in Object containing an ID and Type
   * @param   {Object}   host_in Object containing an ID and Type
   * @param   {Object}   root_in Object containing an ID and Type
   * @param   {Object}   user_in Object containing an ID and Type
   * @param   {Object}   pass_in Object containing an ID and Type
   * @returns {Object}   Diaglog object for created dialog
   */
  function showSiteDialog(inputs, existing) {

    //log this
    console.log('showSiteDialog()');

    var titleNewPrefix = 'New';
    var titleEditPrefix = 'Edit';
    var titleBase = 'FTP Site';
    var title = titleNewPrefix + ' ' + titleBase;

    //dialog buttons array
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

    //delete button if we are going are showing an existing site
    var deleteButton = {
        className: Dialog.DIALOG_BTN_CLASS_NORMAL,
        id: Dialog.DIALOG_BTN_DONTSAVE,
        text: 'DELETE'
    }

    if (existing) {

      title = titleEditPrefix + ' ' + titleBase;

      buttons.push(deleteButton);

    }


    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<form>';

    //add radio buttons for each site
    inputs.forEach(function (input) {
      bodyHtml += input.label;
      bodyHtml += '<br>';
      bodyHtml += '<input id="' + input.id + '" type="' + input.type + '" value="' + input.value + '">';
      bodyHtml += '<br>';

    });

    //term html tag
    bodyHtml += '</form>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,           //class
      title,          //title
      bodyHtml,       //body html
      buttons,        //button array
      false);         //disable auto dismiss

    }

  /**
   * Handle the site run command for an added site
   */
  function handleNewSite(oldSessionIndex) {

    //log that we were called
    console.log('handleNewSite()');

    //assume a new site
    var oldSession = false;

    var nameVal = '';
    var hostVal = '';
    var rootVal = '';
    var userVal = '';
    var passVal = '';

    //if old site object is passed
    if (isSet(oldSessionIndex)) {

      //log this
      console.log('Old site presented');

      //indicate that this is an old site
      oldSession = true;

      nameVal = sites[oldSessionIndex].name;
      hostVal = sites[oldSessionIndex].host;
      rootVal = sites[oldSessionIndex].root;
      userVal = sites[oldSessionIndex].user;
      passVal = sites[oldSessionIndex].pass;

    }

    var name_id = 'input-name';
    var host_id = 'input-host';
    var root_id = 'input-root';
    var user_id = 'input-user';
    var pass_id = 'input-pass';

    var inputFields = [
      {label: 'Name:', id: name_id, value: nameVal, type: 'text'},
      {label: 'Host:', id: host_id, value: hostVal, type: 'text'},
      {label: 'Root:', id: root_id, value: rootVal, type: 'text'},
      {label: 'User:', id: user_id, value: userVal, type: 'text'},
      {label: 'Password:', id: pass_id, value: passVal, type: 'password'}
    ];

    //show dialog
    var inputDialog = showSiteDialog(inputFields, oldSession);

    //listen for escape key
    $(document).keyup(function (event) {

      //close if escape key is pressed
      if (event.which == ESCAPE_KEY)
        inputDialog.close();

    });

    //listen for cancel (modal doesnt have standard id= attribute, it's data-button-id
    $('button[data-button-id="' + Dialog.DIALOG_BTN_CANCEL + '"').click(function () {

      //log that the user wants to close
      console.log('Dialog closed without save');

      //close the dialog
      inputDialog.close();

    });

    //if old session
    if (oldSession) {

      //listen for delete (modal doesnt have standard id= attribute, it's data-button-id
      $('button[data-button-id="' + Dialog.DIALOG_BTN_DONTSAVE + '"').click(function () {

        //setup labels
        var COMMAND_RUN_SITE_ID = COMMAND_RUN_SITE_BASE + sites[oldSessionIndex].name;

        //remove old site from array
        sites.splice(oldSessionIndex, 1);

        //remove site from context menu
        removeFromContextMenus(COMMAND_RUN_SITE_ID);

        //set in preferences
        osFtpPreferences.set(PREF_SITES, sites);

        //save
        osFtpPreferences.save(PREF_SITES, sites);

        //disable editing if we have no more sites
        if (sites.length == 0)
          disableEditSite();

        //log that the user wants to close
        console.log('Dialog closed to delete site');

        //close the dialog
        inputDialog.close();

      });
    }

    //listen for ok
    $('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

      var name = $('#' + name_id).val();
      var host = $('#' + host_id).val();
      var root = $('#' + root_id).val();
      var user = $('#' + user_id).val();
      var pass = $('#' + pass_id).val();

      //log input
      console.log(
        'Dialog inputs are:  ' +
        'name - ' + name + ', ' +
        'host - ' + host + ', ' +
        'root - ' + root + ', ' +
        'user - ' + user + ', ' +
        'pass - ' + pass
      );

      //@TODO, validate name is not already used

      //@TODO, save preferences

      //build site object
      var site = {
        name: name,
        host: host,
        root: root,
        user: user,
        pass: pass
      };

      //if old site, delete its contents
      if (oldSession)
        sites.splice(oldSessionIndex, 1);

      //save this site
      sites.push(site);

      //set in preferences
      osFtpPreferences.set(PREF_SITES, sites);

      //save
      osFtpPreferences.save(PREF_SITES, sites);

      if (!oldSession) {
        addSite(site);
      }

      //enable editing if we have at least one site
      if (sites.length > 0)
        enableEditSite();

      //log that we are saving this site
      console.log('Dialog closed with save');

      //close the dialog
      inputDialog.close();

    });

    //listen for dialog done
    inputDialog.done(function () {

      //log that the modal is gone
      console.log('Dialog modal is dismissed');

    });

  }

  function addSite(site) {

    //setup labels
    var COMMAND_RUN_SITE_LABEL = site.name;
    var COMMAND_RUN_SITE_ID = COMMAND_RUN_SITE_BASE + site.name;

    //register command and add a context menu to create a site
    regCommandAndAddToContextMenus(COMMAND_RUN_SITE_LABEL, COMMAND_RUN_SITE_ID, handleRunSite, false, COMMAND_NEW_SITE_ID, false);

  }


  /**
   * Enables the edit command for an added site
   */
  function enableEditSite() {

    //setup labels
    var COMMAND_EDIT_SITE_LABEL = 'Edit FTP Site...';
    var COMMAND_EDIT_SITE_ID = 'osftp_edit_site';

    //register command and add a context menu to create a site
    regCommandAndAddToContextMenus(COMMAND_EDIT_SITE_LABEL, COMMAND_EDIT_SITE_ID, handleEditSite, false, COMMAND_NEW_SITE_ID, true);

  }


  /**
   * Disables the edit command forsites
   */
  function disableEditSite() {

    //register command and add a context menu to create a site
    removeFromContextMenus(COMMAND_EDIT_SITE_ID);

  }


  /**
   * Handler for editting an added site
   */
  function handleEditSite() {

    //log that we were called
    console.log('handleEditSite()');

    //show dialog
    var editDialog = showEditSiteDialog();

    var editSiteIndex;

    //listen for escape key
    $(document).keyup(function (event) {

      //close if escape key is pressed
      if (event.which == ESCAPE_KEY)
        editDialog.close();

    });

    //listen for cancel (modal doesnt have standard id= attribute, it's data-button-id
    $('button[data-button-id="' + Dialog.DIALOG_BTN_CANCEL + '"').click(function () {

      //log that the user wants to close
      console.log('Dialog closed without save');

      //close the dialog
      editDialog.close();

    });


    //listen for ok
    $('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

      //get the site that was checked
      editSiteIndex = $('input[name=' + RADIO_SITE_NAME + ']:checked').val();

      //if no option was choosen
      if (!isSet(editSiteIndex))
        console.log('No site was selected');

      //log that we are closing
      console.log('Dialog closed with save');

      //close the dialog
      editDialog.close();

    });


    //listen for dialog done
    editDialog.done(function () {

      //log that the modal is gone
      console.log('Dialog modal is dismissed');

      //if edit site index was set
      if (isSet(editSiteIndex))
        CommandManager.execute(COMMAND_NEW_SITE_ID + EXECUTE, editSiteIndex);

    });

  }


  function showEditSiteDialog() {

    //dialog buttons array
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


    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<form>';

    //add radio buttons for each site
    sites.forEach(function (site, i) {
      bodyHtml += '<input id="' + site.name + '" value="' + i + '" type="radio" name="' + RADIO_SITE_NAME + '"> ' + site.name;
      bodyHtml += '<br>';
    });

    //term html tag
    bodyHtml += '</form>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,           //class
      'Edit FTP Site', //title
      bodyHtml,       //body html
      buttons,        //button array
      false);         //disable auto dismiss

    }

  /**
   * Handler for executing an added site
   */
  function handleRunSite() {

    //log that we were called
    console.log('handleRunSite()');

    //get the command name
    var name = this.getName();

    //get the site object preference associated with this command name
    var thisSite;
    //var site = osFtpPreferences.get(PREF_SITE + name);

    sites.forEach(function(site) {

      if (site.name == name) {

        thisSite = site;
      }

    });

    //get the full path to the item that was selected
    var itemFullPath = Project.getSelectedItem().fullPath;

    //determine if the file choosen is a directory or an individual file
    if (File.getDirectoryPath(itemFullPath) == itemFullPath) {

      //@TODO all for processing and ftp'ing an entire directory
      //for now, log message if an attempt is made to ftp a directory
      console.log('Select FTP script file - not a directory');

    //an individual file was choose, build a script string and invoke node to run FTP and this script
    } else {

      //build our ftp script
      var ftpScript = buildFtpScriptForFile(itemFullPath, thisSite);

      //get node folder in this extension
      var extensionDir = File.getNativeModuleDirectoryPath(module) + '/node/';

      //select the file name we want to create
      var scriptFileName = extensionDir + thisSite.host + FTP_SCRIPT_FILE_EXTENSION;

      //invoke node js to build and run our ftp script file
      runFtpCommandStdin(scriptFileName, ftpScript);

    }

  }


  /**
   * Build ftp script string
   * @param   {String} itemFullPath Complete file path and file to build for
   * @param   {Object}   site      Object containing saved information for the site
   * @returns {String} Return the completed script string
   */
  function buildFtpScriptForFile(itemFullPath, site) {

    //like 'C:' is two characters
    var WINDOWS_DRIVE_LETTER_OFFSET = 0;
    var WINDOWS_DRIVE_LETTER_LEN = 2;
    var WINDOWS_DRIVE_SEPERATOR_OFFSET = 1;
    var WINDOWS_DRIVE_SEPERATOR = ':';
    var WINDOWS_DRIVE_DIRECTORY_CHAR = '\\';

    //initialize script
    var ftpStdin = '';

    //open the host
    ftpStdin += 'op ';
    ftpStdin += site.host;
    ftpStdin += '\n';

    //we no that auto-login will be disabled so specify 'user'
    ftpStdin += 'user\n';

    //provide user name and password to script file
    ftpStdin += site.user;
    ftpStdin += '\n';
    ftpStdin += site.pass;
    ftpStdin += '\n';

    //switch to requested root directory
    ftpStdin += 'cd ';
    ftpStdin += site.root;
    ftpStdin += '\n';

    //directory path with always have forward slash seperators, so parse each directory
    var directory = File.getDirectoryPath(itemFullPath).split('/');

    //if the first directory is a windows type drive
    if (directory[WINDOWS_DRIVE_LETTER_OFFSET].length == WINDOWS_DRIVE_LETTER_LEN) {

      //if the second character after the drive letter is a colon, this should be windows directories
      if (directory[WINDOWS_DRIVE_LETTER_OFFSET].charAt(WINDOWS_DRIVE_SEPERATOR_OFFSET) == WINDOWS_DRIVE_SEPERATOR)

        //append a backlash to the drive letter and colon
        directory[WINDOWS_DRIVE_LETTER_OFFSET] += WINDOWS_DRIVE_DIRECTORY_CHAR;

    }

    //iterate through directories
    directory.forEach(function (dir) {

      //while the directory appears valid
      if (isSet(dir)) {

        //alter local directory to the file we are ftp'ing
        ftpStdin += 'lcd ';
        ftpStdin += dir;
        ftpStdin += '\n';
      }

    });

    //if we need to ftp this file as binary, set indicator
    if (ftpAsBinary(File.getFileExtension(itemFullPath)))
      ftpStdin += 'binary\n';

    //currently we only allow for put
    ftpStdin += 'put ';
    ftpStdin += File.getBaseName(itemFullPath);
    ftpStdin += '\n';

    //quit the script
    ftpStdin += 'quit \n';

    //return completed script string
    return ftpStdin;

  }

  /**
   * Check known extensions to see whether ftp should be done in binary
   * @param   {String} extension extension (without '.') to validate against known extensions
   * @returns {Boolean}  Returns true if this extension should be ftp'ed as binary
   */
  function ftpAsBinary(extension) {

    //if the extension is in our predefined list of things to ftp, return true
    for (var i = 0; i < FTP_BINARY_EXTENSIONS.length; i++)
      if (FTP_BINARY_EXTENSIONS[i] == extension)
        return true

    //no need to ftp this as binary
    return false;

  }

  /**
   * Function driven when a file is called to be executed as an FTP script
   */
  function handleRunScript() {

    //get the full path to the item that was selected
    var itemFullPath = Project.getSelectedItem().fullPath;

    //determine if the file choosen is a directory or an individual file
    if (File.getDirectoryPath(itemFullPath) == itemFullPath) {

      //@TODO all for processing and ftp'ing an entire directory
      //for now, log message if an attempt is made to ftp a directory
      console.log('Select FTP script file - not a directory');

    //an individual file was choose, build a script string and invoke node to run FTP and this script
    } else {

      //invoke node js to run our ftp script file
      runFtpCommand(Project.getSelectedItem().fullPath);

    }
  }


  /**
   * Shows the failure dialog
   * @returns {Object} Dialog object after open
   */
  function showFailDialog(data) {

    //log this
    console.log('showFailDialog()');


    //create the body html
    var bodyHtml = '';

    //init html tag
    bodyHtml += '<p>';

    //init html tag
    bodyHtml += data;

    //term html tag
    bodyHtml += '</p>';

    //show the dialog and return the object
    return Dialog.showModalDialog(
      null,           //class
      'FTP Failure',  //title
      bodyHtml,       //body html
      null,           //button array
      true);          //disable auto dismiss

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
        console.log('Completed: doFtp(\n' + scriptFile + ');');
      }
    )

    //listen for faile
    .fail(
      function () {
        console.error('Error in: doFtp(\n' + scriptFile + ');');
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
        console.log('Completed: doFtpStdin(\n' + file + ', \n' + data + ');');
      }
    )

    //listen for faile
    .fail(
      function () {
        console.error('Error in: doFtpStdin(\n' + file + ', \n' + data + ');');
        showFailDialog('Failure information goes here...');
      }
    )
  }

});
