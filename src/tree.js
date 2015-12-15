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

		this.isSelected = false;
	}

	/**
	 * Add child directory node to the current node
	 **/
	TreeNode.prototype.addChildDir = function(dirName, relativePath, isSelected){
		if (this.getChildDirIndexByName(dirName) === -1){
			var newNode = new TreeNode(dirName);
			newNode.parent = this;
			newNode.type   = osFtpGlobals.TREE_TYPE_DIR;
			newNode.level  = this.level + 1;

			newNode.relativePath = relativePath;
			newNode.isSelected = isSelected;

			this.childDirs.push(newNode);
			registerTreeNode(newNode);

			console.log(newNode);
		}
	};

	/**
	 * Add child file node to the current node
	 **/
	TreeNode.prototype.addChildFiles = function(fileName, relativePath, isSelected){
		// Validate imput
		if (this.getChildFileIndexByName(fileName) === -1){
			var newNode = new TreeNode(fileName);
			newNode.parent = this;
			newNode.type   = osFtpGlobals.TREE_TYPE_FILE;
			newNode.level  = this.level + 1;

			newNode.relativePath = relativePath;
			newNode.isSelected   = isSelected;

			this.childFiles.push(newNode);
			registerTreeNode(newNode);

			console.log(newNode);
		}
	};

	/**
	 * Build the tree relative path from the root.
	 **/

	TreeNode.prototype.addRelativePath = function(filePath, isSelected){
		console.log('TreeNode.addRelativePath(' + filePath + ')');
		if (typeof filePath !== 'string'){
			return false;
		}

		// parse the input path into an array of directories
		filePath = FileUtils.convertWindowsPathToUnixPath(filePath);
		var listDir = filePath.split('/');
		var currNode = this.getRootNode();
		var currPath = '';
		var nodeName = '';

		console.log(listDir);

		// Loop through and build the tree
		for (var i = 0; i < listDir.length - 1; i++){
			nodeName = listDir[i];
			if (currPath === ''){
				currPath = listDir[i];
			} else {
				currPath += currPath + '/' + listDir[i];
			}
			currNode.addChildDir(nodeName, currPath, isSelected);

			currNode = currNode.childDirs[currNode.getChildDirIndexByName(nodeName)];
		}

		// The last element of the array is always the file.
		currNode.addChildFiles(listDir[listDir.length - 1], filePath, isSelected);

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
	 *
	 **/
	TreeNode.prototype.getChildDirIndexByName = function (dirName){
		var retIndex = -1;

		for (var index = 0; index < this.childDirs.length; index++){
			if (this.childDirs[index].name === dirName){
				retIndex = index;
			}
		}

		return retIndex;
	};

	/**
	 *
	 **/
	TreeNode.prototype.getChildFileIndexByName = function (fileName){
		var retIndex = -1;

		for (var index = 0; index < this.childFiles.length; index++){
			if (this.childFiles[index] === fileName){
				retIndex = index;
			}
		}

		return retIndex;
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
	 *
	 **/

	TreeNode.prototype.getNodeByHtmlId = function(htmlId){
		var template = this.getRootNode().htmlId + '-node';
		var nodeId = htmlId.replace(template, '');

		return this.getNodeById(nodeId);
	};

	/**
	 *
	 **/
	TreeNode.prototype.getChildren = function(){
		console.log('TreeNode.getChildren()');
		var children = [];

		for (var dir = 0; dir < this.childDirs.length; dir++){
			children.push(this.childDirs[dir]);
			children = children.concat(this.childDirs[dir].getChildren());
		}

		for (var file = 0; file < this.childFiles.length; file++){
			children.push(this.childFiles[file]);
		}


		return children;
	};

	/**
	 *
	 **/
	TreeNode.prototype.isNodeHtmlGenerated = function(){
		for (var dir in this.childDirs){
			var childDir = this.childDirs[dir];
			if (!childDir.hasOwnProperty('htmlId')){
				return false;
			}
		}

		for (var file in this.childFiles){
			var childFile = this.childFiles[file];
			if (!childFile.hasOwnProperty('htmlId')){
				return false;
			}
		}

		return true;
	};

	/**
	 *
	 **/
	TreeNode.prototype.getTotalFilesCount = function(){
		var listNode = this.getRootNode().nodeInventory;
		var retCount = 0;

		for (var index in listNode){
			if (listNode[index].type === osFtpGlobals.TREE_TYPE_FILE){
				retCount++;
			}
		}

		return retCount;
	};

	/**
	 *
	 **/
	TreeNode.prototype.getSelectedFileCount = function(){
		var listNode = this.getRootNode().nodeInventory;
		var retCount = 0;

		for (var index in listNode){
			if (listNode[index].type === osFtpGlobals.TREE_TYPE_FILE && listNode[index].isSelected){
				retCount++;
			}
		}

		return retCount;
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

	function generateHtmlTreeContainer(treeNode, treeDiv){
		console.log("generateHtmlTreeContainer()");
		var tableId = treeDiv + '-tree';

		var html = '<table id="' + tableId + '" class="table table-striped table-bordered">';
		html += "</table>";

		treeNode.htmlId = tableId;

		return html;
	}

	/**
	 *
	 **/

	function generateHtmlTreeNode(treeNode){
		console.log('generateHtmlTreeNode()');

		var nodeId, currNode;
		var html = '';

		// Generate node for directories
		for (var dir = 0; dir < treeNode.childDirs.length; dir++){
			currNode = treeNode.childDirs[dir];
			nodeId = treeNode.getRootNode().htmlId + '-node' + currNode.id ;

			html += '<tr id="' + nodeId + '" ';
			html += 'data-depth="' + treeNode.level + '" class="expand collapsable level' + treeNode.level + '">';

			html += '<td treeNode type="dir-node" data-depth="' + treeNode.level + '"><span class="toggle"></span>';
			html += '<input type="checkbox" ';

			if (currNode.isSelected){
				html += 'checked';
			}

			html += '/>';

			html += currNode.name + '</td>';

			html += '</tr>';

			currNode.htmlId = nodeId;
		}

		// Generate node for files
		for (var file = 0; file < treeNode.childFiles.length; file++){
			currNode = treeNode.childFiles[file];
			nodeId = treeNode.getRootNode().htmlId + '-node' + currNode.id;

			html += '<tr id="' + nodeId + '" ';
			html += 'data-depth="' + treeNode.level + '" class="collapse level' + treeNode.level + '">';

			html += '<td treeNode type="file-node" data-depth="' + treeNode.level + '">';
			html += '<input type="checkbox" ';

			if (currNode.isSelected){
				html += 'checked';
			}

			html += '/>';

			html += currNode.name;
			html += '<input type="hidden" value="' + currNode.relativePath + '"/>';
			html += '</td>';
			html += '</tr>';

			currNode.htmlId = nodeId;
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
			console.log('relativePath: ' + TreeNode.relativePath);
			console.log('isSelected: ' + TreeNode.isSelected);

			for (var child = 0; child < TreeNode.childFiles; child++){
				console.log('childFile ' + child + ': ' + TreeNode.childFiles[child]);
			}

			for (var childDir = 0; childDir < TreeNode.childDirs.length; childDir++){
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
