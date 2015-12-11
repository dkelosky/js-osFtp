/**
 *  Sites Manager
 */

define(function (require, exports) {
	'use strict';

	var osFtpGlobals = require('src/globals');
	var osFtpStrings = require('strings');

	exports.Site = Site;
	exports.revise = revise;

	function Site(name, hostAddr, rootDir, userName, password) {
		this.objId = osFtpGlobals.OBJECT_FTP_SITE_ID;
		this.name = name;
		this.hostAddr = hostAddr;
		this.rootDir = rootDir;
		this.userName = userName;
		this.password = password;
		this.chmodStr = undefined;
        this.remoteOs = undefined;
	}

	Site.prototype.getName = function () {
		return this.name;
	};

	Site.prototype.getHostAddr = function () {
		return this.hostAddr;
	};

	Site.prototype.getRootDir = function () {
		return this.rootDir;
	};

	Site.prototype.getUserName = function () {
		return this.userName;
	};

	Site.prototype.getPassword = function () {
		return this.password;
	};

	Site.prototype.setChmodStr = function (newMode) {
		this.chmodStr = newMode;
	};

	Site.prototype.getChmodStr = function () {
		return this.chmodStr;
	};

    Site.prototype.setRemoteOs = function (newOs) {
        this.remoteOs = newOs;
    };

    Site.prototype.getRemoteOs = function () {
        return this.remoteOs;
    };

	Site.prototype.getCommandId = function () {
		return osFtpGlobals.COMMAND_RUN_SITE_BASE_ID + this.name;
	};

	Site.prototype.getCommandLabel = function () {
		return osFtpStrings.COMMAND_RUN_SITE_BASE_LABEL + this.name;
	};

	Site.prototype.debugPrint = function () {
		console.log("objId: " + this.objId);
		console.log("name:  " + this.name);
		console.log("hostAddr: " + this.hostAddr);
		console.log("rootDir:  " + this.rootDir);
		console.log("userName: " + this.userName);
		console.log("password: " + '**********');
		console.log("chmodStr: " + this.chmodStr);
        console.log("remoteOs: " + this.remoteOs);
	};

	function revise(object) {
		var newSite = new Site(object.name,
			object.hostAddr,
			object.rootDir,
			object.userName,
			object.password);

		newSite.setChmodStr(object.chmodStr);

		if (object.hasOwnProperty('remoteOs')){
			newSite.setRemoteOs(object.remoteOs);
		} else {
			newSite.setRemoteOs(osFtpGlobals.DEFAULT_REMOTE_OS);
		}

		return newSite;
	}

});
