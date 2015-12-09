/**
 * See http://brackets.io/docs/current/ for current Brackets extension documentation
 *
 * https://github.com/adobe/brackets/wiki/How-to-Hack-on-Brackets#getcode
 *
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
 * @TODO - allow for FTP to a windows machine
 * @TODO - add support for ftp from Linux
 * @TODO - allow for timeout / kill of long running FTP process
 * @TODO - move menu items into the menu
 * @TODO - dynamically get/set domain name so that concurrent extensions can be run (dev and production version)
 *
 * You must update the version number appropriately for each new packaged files distributed in Brackets registry.
 *
 * Appropriately working in dev or master.
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
	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
	var Menus = brackets.getModule('command/Menus');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');

	/**
	 * Extension modules
	 */

	var osFtpGlobals = require('src/globals');
	var osFtpHandlers = require('src/handlers');
	var osFtpMenu = require('src/menu');
	var osFtpPackage = require('src/package');
	var osFtpSettingsDialog = require('src/settingsDialog');
	var osFtpStatus = require('src/status');
	var osFtpStrings = require('strings');
	var osFtpSitesManager = require('src/sitesManager');

	/**
	 * Perform initialization
	 */

	//load style sheets
	ExtensionUtils.loadStyleSheet(module, 'styles/osFtp.less');

	/**
	 * Initialization complete
	 */
	AppInit.appReady(function () {

		//perform initialization
		osFtpPackage.getPackage(mainInit);

	});


	/**
	 * Perform initializations
	 */
	function mainInit(packageJson) {

		var runId = packageJson.name + osFtpGlobals.COMMAND_RUN_SCRIPT_ID;
		var newId = packageJson.name + osFtpGlobals.COMMAND_NEW_SITE_ID;
		var osFtpPreferences;

		//get preferences
		osFtpPreferences = PreferencesManager.getExtensionPrefs(packageJson.name + osFtpGlobals.PREF);

		//set in preferences
		osFtpPreferences.set(packageJson.name + osFtpGlobals.PREF_VERSION, packageJson.version);

		//save
		osFtpPreferences.save(packageJson.name + osFtpGlobals.PREF);

		//register settings command and add it to the menu.
		CommandManager.register(osFtpStrings.COMMAND_PRODUCT_SETTINGS_LABEL, packageJson.name + osFtpGlobals.COMMAND_PROD_SETTINGS_ID, osFtpSettingsDialog.show);
		Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem(packageJson.name + osFtpGlobals.COMMAND_PROD_SETTINGS_ID, '', Menus.AFTER, Commands.FILE_PROJECT_SETTINGS);

		//register command and add context menu to run a script
		CommandManager.register(osFtpStrings.COMMAND_RUN_SCRIPT_LABEL, runId, osFtpHandlers.handleRunScript);
		osFtpMenu.addToContextMenus(runId, true);

		//register command and add a context menu to create a site
		CommandManager.register(osFtpStrings.COMMAND_NEW_SITE_LABEL, newId, osFtpHandlers.handleNewOrEditSite);
		osFtpMenu.addToContextMenus(newId, false);

		//Sites Manager Init
		osFtpSitesManager.init();

		//add the status indicator
		osFtpStatus.addStatusIndicator(packageJson);
	}


});
