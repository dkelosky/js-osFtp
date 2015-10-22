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
  var Dialog = brackets.getModule('widgets/Dialogs');

  var CommandManager = brackets.getModule('command/CommandManager');

  var AppInit = brackets.getModule('utils/AppInit');
  var File = brackets.getModule('file/FileUtils');

  var Project = brackets.getModule('project/ProjectManager');

  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');

  var NodeDomain = brackets.getModule('utils/NodeDomain');

  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');


  /**
   * Extension modules
   */
  var Strings = require('strings');

  var osFtpDomain = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, 'node/FtpDomain'));

  var osFtpDialog   = require('src/dialog');
  var osFtpCommon   = require('src/common');
  var osFtpMenu     = require('src/menu');


  /**
   * Global variables
   */
  var COMMAND_RUN_SCRIPT_ID = 'dkelosky.osftp.osftp_run_script';
  var COMMAND_NEW_SITE_ID = 'dkelosky.osftp.osftp_new_site';
  var COMMAND_RUN_SITE_BASE_ID = 'dkelosky.osftp.osftp_run_';
  var COMMAND_EDIT_SITE_ID = 'dkelosky.osftp.osftp_edit_site';

  var PREF = 'osftp';
  var PREF_SITE = 'site_'
  var PREF_SITES = 'sites_'

  var osFtpPreferences = PreferencesManager.getExtensionPrefs(PREF);

  var FTP_SCRIPT_FILE_EXTENSION = '.txt';

  var FTP_BINARY_EXTENSIONS = ['class'];

  var enableEditSites = false;

  var sites = [];

  var ESCAPE_KEY = 27;


  /**
   * Initialization complete
   */
  AppInit.appReady(function () {

    //register command and add context menu to run a script
    CommandManager.register(Strings.COMMAND_RUN_SCRIPT_LABEL, COMMAND_RUN_SCRIPT_ID, handleRunScript);
    osFtpMenu.addToContextMenus(COMMAND_RUN_SCRIPT_ID, true);

    //register command and add a context menu to create a site
    CommandManager.register(Strings.COMMAND_NEW_SITE_LABEL, COMMAND_NEW_SITE_ID, handleNewOrEditSite);
    osFtpMenu.addToContextMenus(COMMAND_NEW_SITE_ID, false);

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
   * Handler function for when a new site is added or an existing site is updated
   * @param {Number} oldSiteIndex Index into sites array
   */
  function handleNewOrEditSite(oldSiteIndex) {

    //log that we were called
    console.log('handleNewOrEditSite()');

    //assume a new site
    var oldSession = false;

    var nameVal = '';
    var hostVal = '';
    var rootVal = '';
    var userVal = '';
    var passVal = '';

    //if old site object is passed
    if (osFtpCommon.isSet(oldSiteIndex)) {

      //log this
      console.log('Old site presented');

      //indicate that this is an old site
      oldSession = true;

      nameVal = sites[oldSiteIndex].name;
      hostVal = sites[oldSiteIndex].host;
      rootVal = sites[oldSiteIndex].root;
      userVal = sites[oldSiteIndex].user;
      passVal = sites[oldSiteIndex].pass;

    }

    //build input html ids
    var name_id = 'input-name';
    var host_id = 'input-host';
    var root_id = 'input-root';
    var user_id = 'input-user';
    var pass_id = 'input-pass';

    //build html input object
    var inputFields = [
      {label: 'Name:', id: name_id, value: nameVal, type: 'text'},
      {label: 'Host:', id: host_id, value: hostVal, type: 'text'},
      {label: 'Root:', id: root_id, value: rootVal, type: 'text'},
      {label: 'User:', id: user_id, value: userVal, type: 'text'},
      {label: 'Password:', id: pass_id, value: passVal, type: 'password'}
    ];

    //show dialog
    var inputDialog = osFtpDialog.showSiteDialog(inputFields, oldSession);

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
        var COMMAND_RUN_SITE_ID = COMMAND_RUN_SITE_BASE_ID + sites[oldSiteIndex].name;

        //remove old site from array
        sites.splice(oldSiteIndex, 1);

        //remove site from context menu
        osFtpMenu.removeFromContextMenus(COMMAND_RUN_SITE_ID);

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
        sites.splice(oldSiteIndex, 1);

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


  /**
   * Add a site by registering the site as a command and adding it to the context menus
   * @param {Object} site Site object containing information about this site
   */
  function addSite(site) {

    //setup labels
    var COMMAND_RUN_SITE_LABEL = site.name;
    var COMMAND_RUN_SITE_ID = COMMAND_RUN_SITE_BASE_ID + site.name;

    //register command and add a context menu to create a site
    CommandManager.register(COMMAND_RUN_SITE_LABEL, COMMAND_RUN_SITE_ID, handleRunSite);
    osFtpMenu.addToContextMenus(COMMAND_RUN_SITE_ID, false, COMMAND_NEW_SITE_ID, false);

  }


  /**
   * Enables the edit command for an added site
   */
  function enableEditSite() {

    //register command and add a context menu to create a site
    CommandManager.register(Strings.COMMAND_EDIT_SITE_LABEL, COMMAND_EDIT_SITE_ID, handleEditSite);
    osFtpMenu.addToContextMenus(COMMAND_EDIT_SITE_ID, false, COMMAND_NEW_SITE_ID, true);

  }


  /**
   * Disables the edit command forsites
   */
  function disableEditSite() {

    //register command and add a context menu to create a site
    osFtpMenu.removeFromContextMenus(COMMAND_EDIT_SITE_ID);

  }


  /**
   * Handler for editting an added site
   */
  function handleEditSite() {

    //radio button site name
    var RADIO_SITE_NAME = 'site';

    //log that we were called
    console.log('handleEditSite()');

    //show dialog
    var editDialog = osFtpDialog.showSiteSelectDialog(sites, RADIO_SITE_NAME);

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
      if (!osFtpCommon.isSet(editSiteIndex))
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
      if (osFtpCommon.isSet(editSiteIndex))
        CommandManager.execute(COMMAND_NEW_SITE_ID, editSiteIndex);

    });

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
   * Build an FTP script based on the file choosen and the site selected
   * @param   {String} itemFullPath Full path to the item that we want to FTP
   * @param   {Object} site         Site object containing information about the site to use
   * @returns {String} Completed FTP script
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
      if (osFtpCommon.isSet(dir)) {

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
        osFtpDialog.showFailDialog('Failure information goes here...');
      }
    )
  }

});
