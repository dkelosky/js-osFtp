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

	exports.registerSite = registerSite;
	exports.removeSite   = removeSite;
	exports.getSitesArray = getSitesArray;
	exports.isSiteExisted = isSiteExisted;
	exports.newSite       = newSite;
	exports.validateSite  = validateSite;


	var sitesManager = {};

	function registerSite(newSite){
		var returnStatus = false;

		if (osFtpSite.validateSite(newSite)){
			sitesManager[newSite.name] = newSite;
			returnStatus = true;
        }

        console.log(JSON.stringify(sitesManager));

		return returnStatus;
	}


	function removeSite(siteName){
		var returnStatus = false;

		var Site = getSiteByName(siteName);
		if (osFtpSite.validateSite(Site)){
			sitesManager[siteName] = null;
		}

		return returnStatus;
	}


	function getSiteByName(name){
		return sitesManager[name];
	}

	function isSiteExisted(name){
		return osFtpSite.validateSite(sitesManager[name]);
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
