define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  var NodeDomain = brackets.getModule('utils/NodeDomain');


  /**
   * Extension modules
   */
  var osFtpDomain = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, '../node/FtpDomain'));
  var osFtpDialog   = require('src/dialog');


  /**
   * Exported functions
   */
  exports.runFtpCommand       = runFtpCommand;
  exports.runFtpCommandStdin  = runFtpCommandStdin;


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
