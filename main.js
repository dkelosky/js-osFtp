define(function (require, exports, module) {
  'use strict';

  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  var NodeDomain = brackets.getModule('utils/NodeDomain');

  var simpleDomain = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, 'node/FtpDomain'));

  //run FTP commands passed as input
  console.log('runFtpCommand("passed text");');
  runFtpCommand('passed text');

  /**
   * Function wrapper for invoke our domain function
   * @param {string} text Text to pass to ftp.exe
   */
  function runFtpCommand(text) {

    //invoke domain function
    simpleDomain.exec('doFtp', text)

    //listen for done
    .done(
      function () {
        console.log('Completed: doFtp(text);');
      }
    )

    //listen for faile
    .fail(
      function () {
        console.error('Error in: doFtp(text);');
      }
    )
  }

});
