/**
 *  Sites Manager
 */


define(function(require, exports) {
  'use strict';

	/**
	 * Exetension modules
	 */

	var osFtpCommon  = require('src/common');
	var osFtpSite    = require('src/site');
	var osFtpGlobals = require('src/globals');
	var osFtpHandlersHelpers = require('src/handlersHelpers');
	var Preferences  = require('src/preferences');

	exports.init         = init;
	exports.registerSite = registerSite;
	exports.removeSite   = removeSite;
	exports.getSitesArray = getSitesArray;
	exports.getSiteByName = getSiteByName;
	exports.isSiteExisted = isSiteExisted;
	exports.newSite       = newSite;
	exports.validateSite  = validateSite;

	var SITES_MANAGER = "sitesManager";
	var sitesManager;

	function init(){
		console.log('sitesManager.init()');
		sitesManager = {};

		var objString = Preferences.get(SITES_MANAGER) || []; //change from {}


		if (osFtpCommon.isSet(objString)) {
			var tempObj = JSON.parse(objString); //|| {}; fix lees bug,

			for (var i in tempObj){
				if (validateSite(tempObj[i])){
					registerSite(osFtpSite.revise(tempObj[i]));
				}
			}
		}
	}

	function registerSite(newSite){
		var returnStatus = false;

		if (validateSite(newSite)){
			sitesManager[newSite.name] = newSite;

			osFtpHandlersHelpers.addSite(newSite);

			// Update preferences
			Preferences.set(SITES_MANAGER, JSON.stringify(sitesManager));
			Preferences.save();

			returnStatus = true;
        }

        console.log(JSON.stringify(sitesManager));



		return returnStatus;
	}


	function removeSite(siteName){
		var returnStatus = false;

		var site = getSiteByName(siteName);
		if (validateSite(site)){
			delete sitesManager[siteName];

			osFtpHandlersHelpers.removeSite(site);

			Preferences.set(SITES_MANAGER, JSON.stringify(sitesManager));
			Preferences.save();
		}

		return returnStatus;
	}


	function getSiteByName(name){
		return sitesManager[name];
	}

	function isSiteExisted(name){
		return validateSite(sitesManager[name]);
	}

	function getSitesArray(){
		var sitesArray = [];

		for (var name in sitesManager){
			sitesArray.push(sitesManager[name]);
		}

		return sitesArray;
	}

	function validateSite(inputSite){

		// Check if inputSite is an object
		if (typeof inputSite !== 'object'){
			return false;
		}

		// Check if object have objId property
		if (!inputSite.hasOwnProperty("objId")){
			return false;
		}

		// Check if the object ID is correct
		if (inputSite.objId !== osFtpGlobals.OBJECT_FTP_SITE_ID){
			return false;
		}

		return true;
	}

	function newSite(name, hostAddr, rootDir, userName, password){
		return new osFtpSite.Site(name, hostAddr, rootDir, userName, password);
	}

});
