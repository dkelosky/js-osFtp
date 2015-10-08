define(function (require, exports, module) {
  'use strict';

  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  var NodeDomain = brackets.getModule('utils/NodeDomain');

  var simpleDomain = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, 'node/FtpDomain'));

  function runFtpCommand(text) {

    simpleDomain.exec('doFtp', text)

    .done(
      function () {
        console.log('function is done');
      }
    )

    .fail(
      function () {
        console.error('function had an error');
      }
    )
  }

  runFtpCommand('passed text');

});