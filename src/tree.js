define (function (require, exports){
	"use strict";

	var FileUtils = brackets.getModule('file/FileUtils');
	var osFtpCommon = require('src/common');
	var osFtpGlobals = require('src/globals');

	exports.newFileTree = newFileTree;
	exports.debugPrint  = debugPrint;
	exports.generateHtmlTreeContainer = generateHtmlTreeContainer;
	exports.generateHtmlTreeNode      = generateHtmlTreeNode;


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
	 * Add child directory node to the current node
	 **/
	TreeNode.prototype.addChildDir = function(dirName){
		if (!osFtpCommon.isSet(this.childDirs[dirName])){
			var newNode = new TreeNode(dirName);
			newNode.parent = this;
			newNode.type   = osFtpGlobals.TREE_TYPE_DIR;
			newNode.level  = this.level + 1;

			this.childDirs[dirName] = newNode;
			registerTreeNode(newNode);

			console.log(newNode);
		}
	};

	/**
	 * Add child file node to the current node
	 **/
	TreeNode.prototype.addChildFiles = function(fileName){
		// Validate imput
		var key = fileName.split(' ').join('_');

		this.childFiles[key] = fileName;
	};

	/**
	 * Build the tree relative path from the root.
	 **/

	TreeNode.prototype.addRelativePath = function(filePath){
		console.log('TreeNode.addRelativePath(' + filePath + ')');
		if (typeof filePath !== 'string'){
			return false;
		}

		// parse the input path into an array of directories
		filePath = FileUtils.convertWindowsPathToUnixPath(filePath);
		var listDir = filePath.split('/');
		var currNode = this.getRootNode();
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
	 * Return this node directory relative to root
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
	 * Return root node
	 **/
	TreeNode.prototype.getRootNode = function(){
		var currNode = this;

		while(currNode.type !== osFtpGlobals.TREE_TYPE_ROOT){
			currNode = currNode.parent;
		}

		return currNode;
	};

	/**
	 * Search and return the node that contain the input id
	 **/
	TreeNode.prototype.getNodeById = function(id){
		var rootNode = this.getRootNode();
		var retNode = rootNode.nodeInventory[id];

		return retNode;
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
		registerTreeNode(newTree);

		return newTree;
	}


	/**
	 *
	 **/

	function generateHtmlTreeContainer(treeData, treeDiv){
		console.log("generateHtmlTreeContainer()");
		var tableId = treeDiv + '-tree';

		var html = '<table id="' + tableId + '" class="table table-striped table-bordered">';
		html += "</table>";
		return html;
	}

	/**
	 *
	 **/

	function generateHtmlTreeNode(treeNode, treeId, otherAttr){
		console.log('generateHtmlTree()');

		var nodeId;
		var isCheckbox = false;
		var html = '';

		//check for other attribute
		if (osFtpCommon.isSet(otherAttr)){
			if (otherAttr.indexOf('checkbox') > -1){
				isCheckbox = true;
			}
		}

		// Generate node for directories
		for (var dir in treeNode.childDirs){
			var currNode = treeNode.childDirs[dir];
			nodeId = treeId + '-dir' + dir;

			html += '<tr data-depth="' + treeNode.level + '" class="collapse collapsable level' + treeNode.level + '">';

			html += '<td treeNode type="dir-node" data-depth="' + treeNode.level + '"><span class="toggle"></span>';

			if (isCheckbox){
				html += '<input type="checkbox"/>';
			}

			html += currNode.name + '</td>';

			html += '</tr>';
		}

		// Generate node for files
		for (var file in treeNode.childFiles){
			nodeId = treeId + '-file' + file;
			var relativePath = treeNode.getRelativeDir() + '/' + treeNode.childFiles[file];

			html += '<tr data-depth="' + treeNode.level + '" class="collapse level' + treeNode.level + '">';

			html += '<td treeNode type="file-node" data-depth="' + treeNode.level + '">';

			if (isCheckbox){
				html += '<input type="checkbox"/>';
			}

			html += treeNode.childFiles[file];
			html += '<input type="hidden" value="' + relativePath + '"/>';
			html += '</td>';
			html += '</tr>';
		}

		return html;
	}


	/**
	 * debugPrint function
	 **/

	function debugPrint(TreeNode){
		if (osFtpCommon.isSet(TreeNode)){
			console.log('id:     ' + TreeNode.id);
			console.log('type:   ' + TreeNode.type);
			console.log('level:  ' + TreeNode.level);
			console.log('name:   ' + TreeNode.name);
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

	function registerTreeNode(node){
		var rootNode = node.getRootNode();
		console.log(rootNode);
		rootNode.nodeInventory[node.id] = node;
	}

	function newNodeId(){
		var returnId = nodeId;
		nodeId++;

		return returnId;
	}


});
