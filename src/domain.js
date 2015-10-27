define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils');
  var File            = brackets.getModule('file/FileUtils');
  var NodeDomain      = brackets.getModule('utils/NodeDomain');
  var StatusBar       = brackets.getModule('widgets/StatusBar');


  /**
   * Extension modules
   */
  var osFtpCommon   = require('src/common');
  var osFtpDomain   = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, '../node/FtpDomain'));
  var osFtpDialog   = require('src/dialog');
  var osFtpGlobals  = require('src/globals');


  /**
   * Exported functions
   */
  exports.runFtpCommand       = runFtpCommand;
  exports.runFtpCommandStdin  = runFtpCommandStdin;


  /**
   * Function wrapper to invoke our domain function
   * @param {string} file File to use as an ftp script file
   */
  function runFtpCommand(file) {

    //log input
    console.log('runFtpCommand(' + file+ ');');

    //call common wrapper to invoke node functions
    invokeNode(file);

  }


  /**
   * Function wrapper to invoke our domain function
   * @param {string} scriptFile File to use as an ftp script file
   */
  function runFtpCommandStdin(file, data) {

    //log input
    console.log('runFtpCommandStdin(' + file+ ', ...);');

    //call common wrapper to invoke node functions
    invokeNode(file, data);

  }


  /**
   * Common function to invoke node domain functions
   * @param {String} file Filename of script file
   * @param {String} data Optional script file content (file will be created)
   */
  function invokeNode(file, data) {

    //log input
    console.log('doFtpStdin(\n' + file + ', ...);');

    //show we're busy
    showBusy();

    var nodeExec;

    //if we just have a file
    if (!osFtpCommon.isSet(data))

      //invoke domain function
      nodeExec = osFtpDomain.exec('doFtp', getNodeDirectory(), file)

    //else we have data in addition to a file
    else

      //invoke domain function
      nodeExec = osFtpDomain.exec('doFtpStdin', getNodeDirectory(), file, data)

    //set listener for done
    nodeExec.done(function() {

      //do done stuff
      nodeDone();

    });

    //set listener for faile
    nodeExec.fail(function() {

      //do failure stuff
      nodeFail();

    });

  }


  /**
   * Handle node domain call .done callback
   */
  function nodeDone() {

    //log that we completed
    console.log('Completed via .done');

    //show we're busy
    showDone();

    //clear the status after a short time
    clearStatus();

  }


  /**
   * Handle node domain call .fail callback
   */
  function nodeFail() {

    //log that we completed
    console.error('Completed via .fail');

    //show error dialog
    osFtpDialog.showFailDialog('Failure information goes here...');
  }


  /**
   * Function to get the working directory for the NodeJs code
   * @returns {String} The directory where the NodeJs source code resides
   */
  function getNodeDirectory() {

    var extensionDirectory = File.getNativeModuleDirectoryPath(module);
    var extensionDirectories = extensionDirectory.split('\/');
    extensionDirectories.pop();
    extensionDirectories.push('node/');
    return extensionDirectories.join('\/');

  }


  /**
   * Show busy status on status bar
   */
  function showBusy() {

    //log call
    console.log('showBusy()');

    //make sure status bar is showing
    StatusBar.show();
    StatusBar.showIndicators();

    //alter status bar color
    ExtensionUtils.loadStyleSheet(module, '../css/osFtp.css');
    StatusBar.updateIndicator(osFtpGlobals.STATUS_INDICATOR_ID, true, 'osftp-status-busy');

  }


  /**
   * Show done status on status bar
   */
  function showDone() {

    //alter status bar color
    ExtensionUtils.loadStyleSheet(module, '../css/osFtp.css');
    StatusBar.updateIndicator(osFtpGlobals.STATUS_INDICATOR_ID, true, 'osftp-status-done');

  }


  /**
   * Show error status on status bar
   */
  function showError() {

    //alter status bar color
    ExtensionUtils.loadStyleSheet(module, '../css/osFtp.css');
    StatusBar.updateIndicator(osFtpGlobals.STATUS_INDICATOR_ID, true, 'osftp-status-error');

  }


  /**
   * Clear status on status bar
   */
  function clearStatus() {

    setTimeout(function () {

      //log this event
      console.log('Status clear');

      //alter status bar color
      ExtensionUtils.loadStyleSheet(module, '../css/osFtp.css');
      StatusBar.updateIndicator(osFtpGlobals.STATUS_INDICATOR_ID, true, '');

    },

    osFtpGlobals.STATUS_VISIBLE_TIME);

  };

});
