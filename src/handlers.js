define(function (require, exports, module) {
	'use strict';


	/**
	 * Bracket modules
	 */
	var CommandManager = brackets.getModule('command/CommandManager');
	var Dialog = brackets.getModule('widgets/Dialogs');
	var File = brackets.getModule('file/FileUtils');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
	var Project = brackets.getModule('project/ProjectManager');


	/**
	 * Extension modules
	 */
	var osFtpCommon = require('src/common');
	var osFtpDialog = require('src/dialog');
	var osFtpDomain = require('src/domain');
	var osFtpGlobals = require('src/globals');
	var osFtpHandlersHelpers = require('src/handlersHelpers');
	var osFtpMenu = require('src/menu');
	var osFtpScripts = require('src/scripts');
	var osFtpStrings = require('strings');
	var osFtpSite = require('src/site');
	var osFtpSitesManager = require('src/sitesManager');


	/**
	 * Exported functions
	 */
	exports.handleEditSite = handleEditSite;
	exports.handleGetFromSite = handleGetFromSite;
	exports.handleNewOrEditSite = handleNewOrEditSite;
	exports.handleRunScript = handleRunScript;
	exports.handleRunSite = handleRunSite;
	exports.handlersInit = handlersInit;


	/**
	 * Handler for editting an added site
	 */
	function handleEditSite() {

		//log that we were called
		console.log('handleEditSite()');

		//radio button site name
		var RADIO_SITE_NAME = 'site';

		//show dialog
		var selectDialog = osFtpDialog.showSiteSelectDialog(osFtpGlobals.sites, RADIO_SITE_NAME);

		var selectedSiteIndex;

		//listen for escape key
		osFtpHandlersHelpers.handleEscape(selectDialog);

		//handle cancel button
		osFtpHandlersHelpers.handleCancel(selectDialog);

		//listen for ok
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

			//get the site that was checked
			selectedSiteIndex = $('input[name=' + RADIO_SITE_NAME + ']:checked').val();

			//if no option was choosen
			if (!osFtpCommon.isSet(selectedSiteIndex))
				console.log('No site was selected');

			//log that we are closing
			console.log('Dialog closed with save');

			//turn off listeners
			osFtpHandlersHelpers.disableListeners();

			//close the dialog
			selectDialog.close();

		});


		//listen for dialog done
		selectDialog.done(function () {

			//log that the modal is gone
			console.log('Dialog modal is dismissed');

			//if edit site index was set
			if (osFtpCommon.isSet(selectedSiteIndex))
				CommandManager.execute(osFtpGlobals.COMMAND_NEW_SITE_ID, selectedSiteIndex);

		});

	}


	/**
	 * Handler for getting from an added site
	 */
	function handleGetFromSite() {

		//log that we were called
		console.log('handleGetFromSite()');

		//radio button site name
		var RADIO_SITE_NAME = 'site';

		//show dialog
		var selectDialog = osFtpDialog.showSiteSelectDialog(osFtpGlobals.sites, RADIO_SITE_NAME);

		var selectedSiteIndex;

		//listen for escape key
		osFtpHandlersHelpers.handleEscape(selectDialog);

		//handle cancel button
		osFtpHandlersHelpers.handleCancel(selectDialog);

		//listen for ok
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

			//get the site that was checked
			selectedSiteIndex = $('input[name=' + RADIO_SITE_NAME + ']:checked').val();

			//if no option was choosen
			if (!osFtpCommon.isSet(selectedSiteIndex))
				console.log('No site was selected');

			//log that we are closing
			console.log('Dialog closed with save');

			//turn off listeners
			osFtpHandlersHelpers.disableListeners();

			//close the dialog
			selectDialog.close();

		});


		//listen for dialog done
		selectDialog.done(function () {

			//log that the modal is gone
			console.log('Dialog modal is dismissed');

			//if edit site index was set
			if (osFtpCommon.isSet(selectedSiteIndex))
				osFtpDialog.showGetDialog(osFtpGlobals.sites[selectedSiteIndex]);

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
		var oldSite = false;

		var nameVal = '';
		var hostVal = '';
		var rootVal = '';
		var userVal = '';
		var passVal = '';

		//build input html ids
		var name_id = 'input-name';
		var host_id = 'input-host';
		var root_id = 'input-root';
		var user_id = 'input-user';
		var pass_id = 'input-pass';

		var errorContainer = 'input-error';

		var nameTitle;

		//if old site object is passed
		if (osFtpCommon.isSet(oldSiteIndex)) {

			//log this
			console.log('Old site presented');

			//indicate that this is an old site
			oldSite = true;

			nameVal = osFtpGlobals.sites[oldSiteIndex].name;
			hostVal = osFtpGlobals.sites[oldSiteIndex].host;
			rootVal = osFtpGlobals.sites[oldSiteIndex].root;
			userVal = osFtpGlobals.sites[oldSiteIndex].user;
			passVal = osFtpGlobals.sites[oldSiteIndex].pass;

			//set the name time
			nameTitle = nameVal;

		}

		//build html input object
		var inputFields = [];

		if (!oldSite)
			inputFields.push({
				label: osFtpStrings.DIALOG_INPUT_NAME,
				id: name_id,
				value: nameVal,
				type: 'text'
			});

		inputFields.push({
			label: osFtpStrings.DIALOG_INPUT_HOST,
			id: host_id,
			value: hostVal,
			type: 'text'
		});
		inputFields.push({
			label: osFtpStrings.DIALOG_INPUT_ROOT,
			id: root_id,
			value: rootVal,
			type: 'text'
		});
		inputFields.push({
			label: osFtpStrings.DIALOG_INPUT_USER,
			id: user_id,
			value: userVal,
			type: 'text'
		});
		inputFields.push({
			label: osFtpStrings.DIALOG_INPUT_PASSWORD,
			id: pass_id,
			value: passVal,
			type: 'password'
		});

		//show dialog
		var inputDialog = osFtpDialog.showSiteDialog(inputFields, nameTitle, errorContainer);

		//hide error area
		$('#' + errorContainer).hide();

		//listen for escape key
		osFtpHandlersHelpers.handleEscape(inputDialog);

		//handle cancel button
		osFtpHandlersHelpers.handleCancel(inputDialog);

		//if old session
		if (oldSite) {

			//listen for delete (modal doesnt have standard id= attribute, it's data-button-id
			$('button[data-button-id="' + Dialog.DIALOG_BTN_DONTSAVE + '"').click(function () {

				//setup labels
				var COMMAND_RUN_SITE_ID = osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + osFtpGlobals.sites[oldSiteIndex].name;

				//remove old site from array
				osFtpGlobals.sites.splice(oldSiteIndex, 1);

				//remove site from context menu
				osFtpMenu.removeFromContextMenus(COMMAND_RUN_SITE_ID);

				//set and save this preference
				osFtpHandlersHelpers.setAndSavePref(osFtpGlobals.PREF, osFtpGlobals.PREF_SITES, osFtpGlobals.sites);

				//disable extra options if we have no more sites
				if (osFtpGlobals.sites.length == 0) {

					//remove edit option
					osFtpHandlersHelpers.disableEditSite();

					//remove get option
					osFtpHandlersHelpers.disableGetFromSite();
				}

				//log that the user wants to close
				console.log('Dialog closed to delete site');

				//turn off listeners
				osFtpHandlersHelpers.disableListeners();

				//close the dialog
				inputDialog.close();

			});
		}

		//listen for ok
		$('button[data-button-id="' + Dialog.DIALOG_BTN_OK + '"').click(function () {

			var oldSitesLength = osFtpGlobals.sites.length;

			var name = nameVal;

			//get input fields
			if (!oldSite)
				name = $('#' + name_id).val();

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
				'pass - ' + '********' //pass
			);

			//force out any spaces in the name
			if (!oldSite)
				name = name.replace(/ /g, '_');

			//build site object
			var site = {
				name: name,
				host: host,
				root: root,
				user: user,
				pass: pass
			};

			//if the input is valud
			if (osFtpHandlersHelpers.isValid(site, oldSite, errorContainer)) {

				// LDL5007 testing
				var newSite = new osFtpSite.Site(name, host, root, user, pass);
				osFtpSitesManager.registerSite(newSite);

				//if old site, delete its contents
				if (oldSite)
					osFtpGlobals.sites.splice(oldSiteIndex, 1);

				//save this site
				osFtpGlobals.sites.push(site);

				//set and save this preference
				osFtpHandlersHelpers.setAndSavePref(osFtpGlobals.PREF, osFtpGlobals.PREF_SITES, osFtpGlobals.sites);

				//enable extra options if we have at least one site
				if (osFtpGlobals.sites.length > 0 && oldSitesLength == 0) {

					//add getting from a site
					osFtpHandlersHelpers.enableGetFromSite();

					//add editing of site
					osFtpHandlersHelpers.enableEditSite();

				}

				//add new site if this didnt exist before
				if (!oldSite)
					osFtpHandlersHelpers.addSite(site);

				//log that we are saving this site
				console.log('Dialog closed with save');

				//turn off listeners
				osFtpHandlersHelpers.disableListeners();

				//close the dialog
				inputDialog.close();

			}

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
		console.log('handleRunScript();');

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

		//get the command name
		var name = this.getName();
		name = name.substring(osFtpStrings.COMMAND_RUN_SITE_BASE_LABEL.length, name.length);

		//log that we were called
		console.log('handleRunSite(' + name + ');');

		//site object associated with this command name
		var thisSite;

		//locate the site object based on site name
		osFtpGlobals.sites.forEach(function (site) {

			//if we match on name this is the site we want
			if (site.name == name)
				thisSite = site;

		});

		// get the list of the selected file
		var selectedFiles = osFtpCommon.getSelectedFiles();

		//determine if the file choosen is a directory or an individual file
		if (Project.getSelectedItem().isDirectory) {

			//upload this directory
			osFtpHandlersHelpers.uploadDirectory(thisSite, selectedFiles);

			//an individual file was choose, build a script string and invoke node to run FTP and this script
		} else {

			//build our ftp script
			var ftpScript = osFtpScripts.generateUploadScript(selectedFiles, thisSite);
			osFtpHandlersHelpers.invokeFtpScript(ftpScript);
		}

	}


	/**
	 * Initialize saved handlers and globals
	 */
	function handlersInit() {

		//log this
		console.log('handlersInit()');

		//init helpers
		osFtpHandlersHelpers.handlersHelpersInit(osFtpGlobals, osFtpDomain);

	}


});
