define (function (require, exports){
	"use strict";

	var FileUtils = brackets.getModule('file/FileUtils');
	var osFtpCommon = require('src/common');
	var osFtpGlobals = require('src/globals');

	exports.newFileTree = newFileTree;
	exports.debugPrint  = debugPrint;


	function DirNode(name){
		this.parent     = null;
		this.name       = name || '';
		this.level      = 0;
		this.childDirs  = [];
		this.childFiles = [];
	}

	/**
	 *
	 **/
	DirNode.prototype.addChildDir = function(dirName){
		if (!osFtpCommon.isSet(this.childDirs[dirName])){
			var newChild = new DirNode(dirName);
			newChild.parent = this;
			newChild.level  = this.level + 1;

			this.childDirs[dirName] = newChild;

			console.log(newChild);
		}
	};

	/**
	 *
	 **/
	DirNode.prototype.addChildFiles = function(fileName){
		// Validate imput
		var key = fileName.split(' ').join('_');

		this.childFiles[key] = fileName;
	};

	/**
	 *
	 **/

	DirNode.prototype.addRelativePath = function(filePath){
		console.log('DirNode.addRelativePath(' + filePath + ')');
		if (typeof filePath !== 'string'){
			return false;
		}

		// parse the input path into an array of directories
		filePath = FileUtils.convertWindowsPathToUnixPath(filePath);
		var listDir = filePath.split('/');
		var currNode = this;
		var nodeName = '';

		// Loop through and build the tree
		for (var i = 0; i < listDir.length - 1; i++){
			nodeName = listDir[i];
			currNode.addChildDir(nodeName);

			currNode = currNode.childDirs[nodeName];
		}

		// The last element of the array is always the file.
		currNode.addChildFiles(listDir[listDir.length - 1]);

	};

	/**
	 *
	 */
	DirNode.prototype.getRelativeDir = function(){
		console.log('DirNode.getRelativeDir()');

		var currNode   = this;
		var returnPath = currNode.name;

		while (osFtpCommon.isSet(currNode.parent)){
			currNode = currNode.parent;
			if (currNode.name.length > 0){
				returnPath = currNode.name + '/' + returnPath;
			}
		}

		return returnPath;
	}

	/**
	 * generate new Tree function
	 */

	function newFileTree(rootDir){
		var newTree = new DirNode();
		newTree.type = osFtpGlobals.OBJECT_DIR_TREE_ID;
		newTree.rootDir = rootDir;

		return newTree;
	}

	/**
	 * debugPrint function
	 **/

	function debugPrint(dirNode){
		if (osFtpCommon.isSet(dirNode)){
			console.log('level: ' + dirNode.level);
			console.log('name: ' + dirNode.name);
			console.log('parent: ' + dirNode.parent);

			for (var child in dirNode.childFiles){
				console.log('childFile ' + child + ': ' + dirNode.childFiles[child]);
			}

			for (var childDir in dirNode.childDirs){
				console.log('childDir ' + childDir + ': ' + dirNode.childDirs[childDir]);
				debugPrint(dirNode.childDirs[childDir]);
			}
		}
	}


});
