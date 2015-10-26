/**
 *  Sites Manager
 */


define(function (require, exports, module) {
  'use strict';

	/**
	 * Exetension modules
	 */

	var osFtpGlobals = require('src/globals');
	var osFtpCommon  = require('src/common');

	exports.Site        = Site;
	exports.getAllSites = getAllSites;
	exports.registerSite = registerSite;
	exports.removeSite   = removeSite;

	var sitesList = [];

	function Site(name, hostAddr, rootDir, userName, password){
		this.objId    = osFtpGlobals.OBJECT_FTP_SITE_ID;
		this.name     = name;
		this.hostAddr = hostAddr;
		this.rootDir  = rootDir;
		this.userName = userName;
		this.password = password;
		this.getCommandId = function(){
			return osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + this.name;
		};
		this.getCommandLabel = function(){
			return osFtpGlobals.COMMAND_RUN_SITE_BASE_LABEL + this.name;
		};
		this.isValid = function(){
			if (this.objId == osFtpGlobals.OBJECT_FTP_SITE_ID){
				return true;
			} else{
				return false;
			}
		};
	}



	function registerSite(newSite){
		var returnStatus = false;

		if (newSite.isValid()){
			var tempSite = getSiteByName(newSite.name);
			if (osFtpCommon.isSet(tempSite)){
				var index = sitesList.indexOf(tempSite);
				sitesList[index] = newSite;
			}
			else{
				sitesList.push(newSite);
			}

			returnStatus = true;
		}

		return returnStatus;
	}


	function removeSite(siteName){
		var returnStatus = false;

		var Site = getSiteByName(siteName);
		if (Site.isValid()){
			var index = sitesList.indexOf(Site);
			sitesList.splice(index, 1);

			returnStatus = true;
		}

		return returnStatus;
	}


	function getSiteByName(name){
		var returnSite = '';

		for (var i = 0; i < sitesList.length; i++){
			if (sitesList[i].name == name){
				returnSite = sitesList[i];
				break;
			}
		}

		return returnSite;
	}



	function getAllSites(){
		return sitesList;
	}

});
