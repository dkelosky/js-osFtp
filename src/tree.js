define (function (require, exports){
	"use strict";

	var FileUtils = brackets.getModule('file/FileUtils');
	var osFtpCommon = require('src/common');
	var osFtpGlobals = require('src/globals');

	exports.newFileTree = newFileTree;
	exports.debugPrint  = debugPrint;

	var nodeId = 0;

	function TreeNode(name){
		this.parent     = null;
		this.id         = newNodeId();
		this.name       = name || '';
		this.level      = 0;
		this.childDirs  = [];
		this.childFiles = [];
	}

	/**
	 *
	 **/
	TreeNode.prototype.addChildDir = function(dirName){
		if (!osFtpCommon.isSet(this.childDirs[dirName])){
			var newNode = new TreeNode(dirName);
			newNode.parent = this;
			newNode.type   = osFtpGlobals.TREE_TYPE_DIR;
			newNode.level  = this.level + 1;

			this.childDirs[dirName] = newNode;
			this.registerTreeNode(newNode);

			console.log(newNode);
		}
	};

	/**
	 *
	 **/
	TreeNode.prototype.addChildFiles = function(fileName){
		// Validate imput
		var key = fileName.split(' ').join('_');

		this.childFiles[key] = fileName;
	};

	/**
	 *
	 **/

	TreeNode.prototype.addRelativePath = function(filePath){
		console.log('TreeNode.addRelativePath(' + filePath + ')');
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
	TreeNode.prototype.getRelativeDir = function(){
		console.log('TreeNode.getRelativeDir()');

		var currNode   = this;
		var returnPath = currNode.name;

		while (osFtpCommon.isSet(currNode.parent)){
			currNode = currNode.parent;
			if (currNode.name.length > 0){
				returnPath = currNode.name + '/' + returnPath;
			}
		}

		return returnPath;
	};

	/**
	 *
	 **/
	TreeNode.prototype.getRootNode = function(){
		var currNode = this;

		if(this.type != osFtpGlobals.TREE_TYPE_ROOT){
			currNode = this.parent;
		}

		return currNode;
	};

	/**
	 *
	 **/
	TreeNode.prototype.getNodeById = function(id){
		var rootNode = this.getRootNode();
		var retNode = rootNode.nodeInventory[id];

		return retNode;
	};

	/**
	 *
	 **/
	TreeNode.prototype.registerTreeNode = function(newNode){
		var rootNode = this.getRootNode();
		rootNode.nodeInventory[newNode.id] = newNode;
	};


	/**
	 * generate new Tree function
	 */

	function newFileTree(rootDir){
		var newTree = new TreeNode();
		newTree.objType = osFtpGlobals.OBJECT_DIR_TREE_ID;
		newTree.type = osFtpGlobals.TREE_TYPE_ROOT;
		newTree.rootDir = rootDir;

		newTree.nodeInventory = [];
		newTree.registerTreeNode(newTree);

		return newTree;
	}

	/**
	 * debugPrint function
	 **/

	function debugPrint(TreeNode){
		if (osFtpCommon.isSet(TreeNode)){
			console.log('level: ' + TreeNode.level);
			console.log('name: ' + TreeNode.name);
			console.log('parent: ' + TreeNode.parent);

			for (var child in TreeNode.childFiles){
				console.log('childFile ' + child + ': ' + TreeNode.childFiles[child]);
			}

			for (var childDir in TreeNode.childDirs){
				console.log('childDir ' + childDir + ': ' + TreeNode.childDirs[childDir]);
				debugPrint(TreeNode.childDirs[childDir]);
			}
		}
	}

	function newNodeId(){
		var returnId = nodeId;
		nodeId++;

		return returnId;
	}


});
