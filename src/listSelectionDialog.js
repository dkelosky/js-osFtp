define(function (require, exports){
	"use strict";

	var Dialogs      = brackets.getModule("widgets/Dialogs");
	var Strings      = require("../strings");
	var osftpCommon  = require("./common");

	// debug
	var tree         = require("./tree");

	exports.newDialog = newDialog;
	exports.testDialog = testDialog;

	function ListSelectionDialog(inputList){
		this.dialogTemplate = require("text!templates/list-selection-dialog.html");
		this.inputList = inputList;
	}

	ListSelectionDialog.prototype.show = function(){
		if (!osftpCommon.isSet(this.dialog)){
			var compiledTemplate = Mustache.render(this.dialogTemplate, Strings);

			this.dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
			this.$dialog = this.dialog.getElement();

			this.updateTableData(this.inputList);

			this.dialog.done(function(buttonId){

			});
		} else {
			alert("dialog is already shown");
		}
	};

	ListSelectionDialog.prototype.updateTableTitle = function(inputStr){
		$('#list-label', this.$dialog).text(inputStr);
	};

	ListSelectionDialog.prototype.updateTableData = function(inputList){
		var $this = $('#list-table', this.$dialog);
		var id    = $this.attr("id");

		var tableHtml = osftpCommon.generateHtmlTreeTable(inputList, id, 'checkbox');
		$this.html(tableHtml, 'list-table');

		//Format the html output
		$("*[treeNode]", this.$dialog).each(function(){
			var $this = $(this),
				type  = $this.attr("type"),
				level = $this.attr("data-depth");

			var basePadding = $("#list-selection-dialog .level1").css('padding-left');
			var padSize = Number(basePadding.replace('px','')) * Number(level);

			if (type === 'dir-node'){
				$this.css("padding-left", padSize.toString() + "px");
			} else if (type === 'file-node'){
				var toggleSize = $("#list-selection-dialog .toggle").css('width');
				var togglePad  = $("#list-selection-dialog .toggle").css('padding-right');
				padSize += Number(toggleSize.replace('px','')) + Number(togglePad.replace('px',''));
				$this.css("padding-left", padSize.toString() + "px");
			}
		});

		//Reset toggle listeners
		resetTreeToggle("#list-table-tree", this.$dialog);
		resetTreeCheckbox("#list-table-tree", this.$dialog);
		collapseAllTree("#list-table-tree", this.$dialog);

	};

	/*
	 *
	 */

	function resetTreeToggle(treeId, $dialog){
		$(treeId, $dialog).on('click', '.toggle', function () {
			// Get all <tr>'s of the greater depth
			var findChildren = function (tr) {
				var depth = tr.data('depth');
				return tr.nextUntil($('tr').filter(function () {
					return $(this).data('depth') <= depth;
				}));
			};

			var el = $(this);
			var tr = el.closest('tr'); //Get <tr> parent of toggle button
			var children = findChildren(tr);

			//Remove already collapsed nodes from children so that we don't
			//make them visible.
			//(Confused? Remove this code and close Item 2, close Item 1
			//then open Item 1 again, then you will understand)
			var subnodes = children.filter('.expand');
			subnodes.each(function () {
				var subnode = $(this);
				var subnodeChildren = findChildren(subnode);
				children = children.not(subnodeChildren);
			});

			//Change icon and hide/show children
			if (tr.hasClass('collapse')) {
				tr.removeClass('collapse').addClass('expand');
				children.hide();
			} else {
				tr.removeClass('expand').addClass('collapse');
				children.show();
			}
			return children;

		});
	}

	function resetTreeCheckbox(treeId, $dialog){
		$(treeId, $dialog).on('click', 'input:checkbox', function () {
			// Get all <tr>'s of the greater depth
			var findChildren = function (tr) {
				var depth = tr.data('depth');
				return tr.nextUntil($('tr').filter(function () {
					return $(this).data('depth') <= depth;
				}));
			};

			var el = $(this);
			var tr = el.closest('tr'); //Get <tr> parent of toggle button
			var children = findChildren(tr);

			var parentCheckStatus = el.is(':checked');

			children.each(function(){
				var $child = $(this);
				$child.find("input:checkbox").prop("checked", parentCheckStatus);
			});

			return children;
		});
	}

	/*
	 *
	 */

	function collapseAllTree(treeId, $dialog){
		$(treeId + " tr", $dialog).each(function(){
			var $tr = $(this);
			if ($tr.hasClass('collapse')){
				$tr.find(".toggle").click();
			}
		});
	}

	function expandAllTree(treeId, $dialog){
		$(treeId + " tr", $dialog).each(function(){
			var $tr = $(this);
			if ($tr.hasClass('expand')){
				$tr.find(".toggle").click();
			}
		});
	}


	function newDialog(inputList){
		return new ListSelectionDialog(inputList);
	}

	function testDialog(){

		var inputList = [];
		var testingList = osftpCommon.getProjectFiles();

		var newTree = tree.newFileTree(testingList[0].rootDir);

		for (var i in testingList){
			inputList.push(testingList[i].relativePath);
			newTree.addRelativePath(testingList[i].relativePath);
		}

		var dialog1 = newDialog(newTree);
		dialog1.show();
		dialog1.updateTableTitle(testingList[0].rootDir);

		tree.debugPrint(newTree);

	}
});
