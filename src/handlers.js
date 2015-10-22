define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var CommandManager      = brackets.getModule('command/CommandManager');
  var Dialog              = brackets.getModule('widgets/Dialogs');
  var File                = brackets.getModule('file/FileUtils');
  var PreferencesManager  = brackets.getModule('preferences/PreferencesManager');
  var Project             = brackets.getModule('project/ProjectManager');


  /**
   * Extension modules
   */
  var osFtpCommon   = require('src/common');
  var osFtpDialog   = require('src/dialog');
  var osFtpDomain   = require('src/domain');
  var osFtpGlobals  = require('src/globals');
  var osFtpHandlers = require('src/handlers');
  var osFtpMenu     = require('src/menu');
  var osFtpScripts  = require('src/scripts');
  var osFtpStrings  = require('strings');


  /**
   * Global variables
   */
  var ESCAPE_KEY = 27;

  var PREF = 'osftp';
  var PREF_SITE = 'site_'
  var PREF_SITES = 'sites_'

  var osFtpPreferences = PreferencesManager.getExtensionPrefs(PREF);

  var FTP_SCRIPT_FILE_EXTENSION = '.txt';


  /**
   * Exported functions
   */
  exports.handleEditSite      = handleEditSite;
  exports.handleNewOrEditSite = handleNewOrEditSite;
  exports.handleRunScript     = handleRunScript;
  exports.handleRunSite       = handleRunSite;
  exports.init                = init;


  /**
   * Add a site by registering the site as a command and adding it to the context menus
   * @param {Object} site Site object containing information about this site
   */
  function addSite(site) {

    //setup labels
    var COMMAND_RUN_SITE_LABEL = site.name;
    var COMMAND_RUN_SITE_ID = osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + site.name;

    //register command and add a context menu to create a site
    CommandManager.register(COMMAND_RUN_SITE_LABEL, COMMAND_RUN_SITE_ID, osFtpHandlers.handleRunSite);
    osFtpMenu.addToContextMenus(COMMAND_RUN_SITE_ID, false, osFtpGlobals.COMMAND_NEW_SITE_ID, false);

  }


  /**
   * Enables the edit command for an added site
   */
  function enableEditSite() {

    //register command and add a context menu to create a site
    CommandManager.register(osFtpStrings.COMMAND_EDIT_SITE_LABEL, osFtpGlobals.COMMAND_EDIT_SITE_ID, handleEditSite);
    osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID, false, osFtpGlobals.COMMAND_NEW_SITE_ID, true);

  }


  /**
   * Disables the edit command forsites
   */
  function disableEditSite() {

    //register command and add a context menu to create a site
    osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_EDIT_SITE_ID);

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
    var editDialog = osFtpDialog.showSiteSelectDialog(osFtpGlobals.sites, RADIO_SITE_NAME);

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
        CommandManager.execute(osFtpGlobals.COMMAND_NEW_SITE_ID, editSiteIndex);

    });

  }


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

      nameVal = osFtpGlobals.sites[oldSiteIndex].name;
      hostVal = osFtpGlobals.sites[oldSiteIndex].host;
      rootVal = osFtpGlobals.sites[oldSiteIndex].root;
      userVal = osFtpGlobals.sites[oldSiteIndex].user;
      passVal = osFtpGlobals.sites[oldSiteIndex].pass;

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
        var COMMAND_RUN_SITE_ID = osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + osFtpGlobals.sites[oldSiteIndex].name;

        //remove old site from array
        osFtpGlobals.sites.splice(oldSiteIndex, 1);

        //remove site from context menu
        osFtpMenu.removeFromContextMenus(osFtpGlobals.COMMAND_RUN_SITE_ID);

        //set in preferences
        osFtpPreferences.set(PREF_SITES, osFtpGlobals.sites);

        //save
        osFtpPreferences.save(PREF_SITES, osFtpGlobals.sites);

        //disable editing if we have no more sites
        if (osFtpGlobals.sites.length == 0)
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
        osFtpGlobals.sites.splice(oldSiteIndex, 1);

      //save this site
      osFtpGlobals.sites.push(site);

      //set in preferences
      osFtpPreferences.set(PREF_SITES, osFtpGlobals.sites);

      //save
      osFtpPreferences.save(PREF_SITES, osFtpGlobals.sites);

      if (!oldSession) {
        addSite(site);
      }

      //enable editing if we have at least one site
      if (osFtpGlobals.sites.length > 0)
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
   * Function driven when a file is called to be executed as an FTP script
   */
  function handleRunScript() {

    //log that we were called
    console.log('handleRunScript()');

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
      osFtpDomain.runFtpCommand(Project.getSelectedItem().fullPath);

    }
  }


  /**
   * Handler for executing an added site
   */
  function handleRunSite() {

    //log that we were called
    console.log('handleRunSite()');

    //get the command name
    var name = this.getName();

    //site object associated with this command name
    var thisSite;

    //locate the site object based on site name
    osFtpGlobals.sites.forEach(function(site) {

      //if we match on name this is the site we want
      if (site.name == name)
        thisSite = site;

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
      var ftpScript = osFtpScripts.buildUploadForFileScript(itemFullPath, thisSite);

      //get node folder in this extension
      var extensionDir = File.getNativeModuleDirectoryPath(module) + '/';

      //select the file name we want to create
      var scriptFileName = extensionDir + thisSite.host + FTP_SCRIPT_FILE_EXTENSION;

      //invoke node js to build and run our ftp script file
      osFtpDomain.runFtpCommandStdin(scriptFileName, ftpScript);

    }

  }


  /**
   * Initialize saved handlers and globals
   */
  function init() {

    //get saved preferences
    osFtpGlobals.sites = osFtpPreferences.get(PREF_SITES);

    //add back saved sites
    osFtpGlobals.sites.forEach(function (site) {
      addSite(site);

    });

    //enable editing if we have at least one site
    if (osFtpGlobals.sites.length > 0)
      enableEditSite();
  }


});
