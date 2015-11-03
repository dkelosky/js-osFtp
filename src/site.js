/**
 *  Sites Manager
 */

define(function(require, exports) {
	'use strict';

	var osFtpGlobals = require('src/globals');
	var osFtpStrings = require('strings');

	exports.Site         = Site;
	exports.newSite      = newSite;
	exports.validateSite = validateSite;


	function Site(name, hostAddr, rootDir, userName, password){
		this.objId    = osFtpGlobals.OBJECT_FTP_SITE_ID;
		this.name     = name;
		this.hostAddr = hostAddr;
		this.rootDir  = rootDir;
		this.userName = userName;
		this.password = password;
		this.debugPrint = debugPrint;
	}

	Site.prototype.getCommandId = function(){
		return osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + this.name;
	};

	Site.prototype.getCommandLabel = function(){
		return osFtpStrings.COMMAND_RUN_SITE_BASE_LABEL + this.name;
	};

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

	function debugPrint(){
		console.log("objId: " + this.objId);
		console.log("name:  " + this.name);
		console.log("hostAddr: " + this.hostAddr);
		console.log("rootDir:  " + this.rootDir);
		console.log("userName: " + this.userName);
		console.log("password: " + this.password);

	}

	function newSite(name, hostAddr, rootDir, userName, password){
		return new Site(name, hostAddr, rootDir, userName, password);
	}



});
