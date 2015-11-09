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
 * @TODO - fix all JSHint
 * @TODO - allow for timeout / kill of long running FTP process
 * @TODO - report total number of files sent over FTP
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
	var Menus = brackets.getModule('command/Menus');
	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
	var FileUtils = brackets.getModule('file/FileUtils');
	var FileSystem = brackets.getModule('filesystem/FileSystem');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');


	/**
	 * Extension modules
	 */
	var osFtpDialog = require('src/dialog');
	var osFtpGlobals = require('src/globals');
    var osInitFailDialog = require('text!templates/initFailureDialog.html');
    var osNewVersionDialog = require('text!templates/newVersionDialog.html');
	var osFtpHandlers = require('src/handlers');
	var osFtpMenu = require('src/menu');
	var osFtpSettingsDialog = require('src/settingsDialog');
	var osFtpStatus = require('src/status');
	var osFtpStrings = require('strings');
	var osFtpSitesManager = require('src/sitesManager');

	/**
	 * Global variables
	 */
	var osFtpPackageJson;
	var osFtpPreferences;
	var osFtpVersion;


	/**
	 * Perform initialization
	 */

	//load style sheets
	ExtensionUtils.loadStyleSheet(module, 'styles/osFtp.less');

	//register settings command and add it to the menu.
	CommandManager.register(osFtpStrings.COMMAND_PRODUCT_SETTINGS_LABEL, osFtpGlobals.COMMAND_PROD_SETTINGS_ID, osFtpSettingsDialog.show);
	Menus.getMenu(Menus.AppMenuBar.FILE_MENU).addMenuItem(osFtpGlobals.COMMAND_PROD_SETTINGS_ID, '', Menus.AFTER, Commands.FILE_PROJECT_SETTINGS);

	//get package.json file
	osFtpPackageJson = FileUtils.readAsText(FileSystem.getFileForPath(ExtensionUtils.getModulePath(module, 'package.json')));

	//get preferences
	osFtpPreferences = PreferencesManager.getExtensionPrefs(osFtpGlobals.PREF);

	//get saved preferences
	osFtpVersion = osFtpPreferences.get(osFtpGlobals.PREF_VERSION) || osFtpGlobals.DEFAULT_VERSION;

	/**
	 * Initialization complete
	 */
	AppInit.appReady(function () {

		//handle package.json read complete
		osFtpPackageJson.done(function(jsonText) {

			//parse the package JSON file
    		var packageJson = JSON.parse(jsonText);

			//log the current version
			console.log('Saved extension version number is - ' + osFtpVersion);
			console.log('Current extension version number is - ' + packageJson.version);

			//if the saved version is equal to the current version initialize
			if (osFtpVersion == packageJson.version) {

				//log this event
				console.log('Performing initialization');

				//perform initialization
				mainInit();

			}

			//prepare for a restart
			else {

				//set in preferences
				osFtpPreferences.set(osFtpGlobals.PREF_VERSION, packageJson.version);

				//save
				osFtpPreferences.save(osFtpGlobals.PREF);

				//substitute values in our html
				var dialogHtml = Mustache.render(osNewVersionDialog, osFtpStrings);

				//show dialog
				var newVersionDialog = osFtpDialog.showCommonDialog(osFtpStrings.DIALOG_TITLE_NEW_VERSION, dialogHtml);

				//listen for dialog done
				newVersionDialog.done(function () {

					//log that the modal is gone
					console.log('Dialog modal is dismissed');

					//restart Brackets
					CommandManager.execute(osFtpGlobals.COMMAND_RESTART_ID);

				});

			}

		});

		//handle failure finding package - this should never really happen
		osFtpPackageJson.fail(function(errors) {

			//log this error
			console.error('package.json is not found  - this package contains errors: ' + errors);

			//substitute values in our html
			var dialogHtml = Mustache.render(osInitFailDialog, osFtpStrings);

			//show error dialog
			osFtpDialog.showCommonDialog(osFtpStrings.DIALOG_TITLE_INIT_FAIL, dialogHtml);

			//show failure text
			$('#osftp-failure-text').text(errors);

		});


	});


	/**
	 * Perform initializations
	 */
	function mainInit() {

		//register command and add context menu to run a script
		CommandManager.register(osFtpStrings.COMMAND_RUN_SCRIPT_LABEL, osFtpGlobals.COMMAND_RUN_SCRIPT_ID, osFtpHandlers.handleRunScript);
		osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_RUN_SCRIPT_ID, true);

		//register command and add a context menu to create a site
		CommandManager.register(osFtpStrings.COMMAND_NEW_SITE_LABEL, osFtpGlobals.COMMAND_NEW_SITE_ID, osFtpHandlers.handleNewOrEditSite);
		osFtpMenu.addToContextMenus(osFtpGlobals.COMMAND_NEW_SITE_ID, false);

		//Sites Manager Init
		osFtpSitesManager.init();

		//add the status indicator
		osFtpStatus.addStatusIndicator();
	}


});
