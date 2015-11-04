/**
 *
 * See http://brackets.io/docs/current/ for current Brackets extension documentation
 *
 * https://github.com/adobe/brackets/wiki/How-to-Hack-on-Brackets#getcode
 *
 * @TODO - Package and publish
 * @TODO - allow for key bindings
 * @TODO - allow for ftp get
 * @TODO - automation testing to
 * 			add and remove sites,
 * 			submit multiple jobs
 *    		verify success and failures
 *      	verify form input
 *       	run ftp scripts
 *        	adjust settings
 * @TODO - encoding issues (i.e. ftp to unix and remove \r)?
 * @TODO - allow for permission settings (like chmod)
 * @TODO - allow for FTP to a windows machine
 * @TODO - add support for ftp from Linux
 * @TODO - JSHint
 */
define(function (require, exports, module) {

	//http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
	'use strict';


	/**
	 * Bracket modules
	 */
	var AppInit = brackets.getModule('utils/AppInit');
	var CommandManager = brackets.getModule('command/CommandManager');
	var Commands = brackets.getModule('command/Commands');
	var Menus = brackets.getModule('command/Menus');
	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');


	/**
	 * Extension modules
	 */
	var osFtpGlobals = require('src/globals');
	var osFtpHandlers = require('src/handlers');
	var osFtpMenu = require('src/menu');
	var osFtpSettingsDialog = require('src/settingsDialog');
	var osFtpStatus = require('src/status');
	var osFtpStrings = require('strings');


	/**
	 * Perform initialization
	 */

	//load style sheets
	ExtensionUtils.loadStyleSheet(module, 'styles/osFtp.less');

	//register settings command and add it to the menu.
	CommandManager.register(osFtpStrings.COMMAND_PRODUCT_SETTINGS_LABEL, osFtpGlobals.COMMAND_PROD_SETTINGS_ID, osFtpSettingsDialog.show);
	Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem(osFtpGlobals.COMMAND_PROD_SETTINGS_ID, '', Menus.AFTER, Commands.FILE_PROJECT_SETTINGS);

	CommandManager.register("testing dialog", "testing dialog", osFtpHandlers.handleNewSite);
	Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem("testing dialog", '', Menus.AFTER, Commands.FILE_PROJECT_SETTINGS);



	/**
	 * Initialization complete
	 */
	AppInit.appReady(function () {

		//register command and add context menu to run a script
		CommandManager.register(osFtpStrings.COMMAND_RUN_SCRIPT_LABEL, osFtpGlobals.COMMAND_RUN_SCRIPT_ID, osFtpHandlers.handleRunScript);
		osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_RUN_SCRIPT_ID, true);

		//register command and add a context menu to create a site
		CommandManager.register(osFtpStrings.COMMAND_NEW_SITE_LABEL, osFtpGlobals.COMMAND_NEW_SITE_ID, osFtpHandlers.handleNewOrEditSite);
		osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_NEW_SITE_ID, false);

		//handlers
		osFtpHandlers.handlersInit();

		//add the status indicator
		osFtpStatus.addStatusIndicator();

	});


});
