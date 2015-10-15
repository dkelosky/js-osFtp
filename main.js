define(function (require, exports, module) {
  'use strict';

  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  var NodeDomain = brackets.getModule('utils/NodeDomain');

  var simpleDomain = new NodeDomain('ftp', ExtensionUtils.getModulePath(module, 'node/FtpDomain'));


  var CommandManager = brackets.getModule("command/CommandManager");
  var Menus = brackets.getModule("command/Menus");
  var PanelManager = brackets.getModule("view/PanelManager");
  var AppInit = brackets.getModule("utils/AppInit");


      var HELLOWORLD_EXECUTE = "helloworld.execute";
    var panel;
    var panelHtml     = require("text!panel.html");

   function log(s) {
            console.log("[helloworld5] "+s);
    }
      function handleHelloWorld() {
        if(panel.isVisible()) {
            panel.hide();
            CommandManager.get(HELLOWORLD_EXECUTE).setChecked(false);
        } else {
            panel.show();
            CommandManager.get(HELLOWORLD_EXECUTE).setChecked(true);
        }
    }

    AppInit.appReady(function () {

        log("Hello from HelloWorld5.");
        ExtensionUtils.loadStyleSheet(module, "osftp.css");
        CommandManager.register("Run HelloWorld", HELLOWORLD_EXECUTE, handleHelloWorld);

        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(HELLOWORLD_EXECUTE);

        panel = PanelManager.createBottomPanel(HELLOWORLD_EXECUTE, $(panelHtml),200);

    });

  //run FTP commands passed as input
  console.log('runFtpCommand("...");');
  runFtpCommand('myFtpScript.txt');

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
