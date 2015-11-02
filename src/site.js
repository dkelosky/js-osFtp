/**
 *  Sites Manager
 */

define(function(require, exports) {
	'use strict';

	var osFtpGlobals = require('src/globals');
	var osFtpStrings = require('strings');

	exports.Site         = Site;
	exports.validateSite = validateSite;

	function Site(name, hostAddr, rootDir, userName, password){
		this.objId    = osFtpGlobals.OBJECT_FTP_SITE_ID;
		this.name     = name;
		this.hostAddr = hostAddr;
		this.rootDir  = rootDir;
		this.userName = userName;
		this.password = password;
	}

	Site.prototype.getCommandId = function(){
		return osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + this.name;
	};

	Site.prototype.getCommandLabel = function(){
		return osFtpStrings.COMMAND_RUN_SITE_BASE_LABEL + this.name;
	};

	function validateSite(Site){
		var returnStatus = false;

		if (Site !== 'undefined'){
			if (this.objId == osFtpGlobals.OBJECT_FTP_SITE_ID){
				return true;
			}
		}

		return returnStatus;
	}






});
