define(function (require, exports) {
	"use strict";

	var Dialogs = brackets.getModule("widgets/Dialogs");
	var Strings = require("../strings");
	var Sites    = require("./site");

	var ftpSiteDialogTemplat = require("text!templates/ftp-site-dialog.html");

	exports.show = show;

	var dialog,
		$dialog;


	function init(inputSite){
		setValues(inputSite);

		assignActions();
	}

	function setValues(inputSite){
		var isEditMode = false;

		// If input is a site then fill in the fields with info
		if (Sites.validateSite(inputSite)){

			$("#osftp-ftp-site-siteName", $dialog).val(inputSite.name);
			$("#osftp-ftp-site-hostName", $dialog).val(inputSite.hostAddr);
			$("#osftp-ftp-site-rootDir",  $dialog).val(inputSite.rootDir);
			$("#osftp-ftp-site-userName", $dialog).val(inputSite.userName);
			$("#osftp-ftp-site-password", $dialog).val(inputSite.password);

			isEditMode = true;
		}

		// Set the correct title
		if (isEditMode){
			var title = Strings.DIALOG_TITLE_EDIT_SITE + ' ' + inputSite.name;
			console.log(title);
			$(".dialog-title", $dialog).text(title);

		} else {
			$(".dialog-title", $dialog).text(Strings.DIALOG_TITLE_ADD_SITE);
		}

		// Hide fields depend on the mode
		$("*[editOption]", $dialog).each(function(){

			var isShow = $(this).attr("editOption");
			if (isShow === isEditMode.toString()){
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	}

	function collectValues(){



	}





	function showChmodOption(){
		$("*[chmodOption]", $dialog).each(function(){
			$(this).show();
		});
	}

	function hideChmodOption(){
		$("*[chmodOption]", $dialog).each(function(){
			$(this).hide();
		});
	}


	function assignActions(){

		$('#toggle-chmod-option', $dialog).change(function(){
			if (this.checked){
				showChmodOption();

				//Test code
				var site = new Sites.Site("field1", "field2", "field3", "field4", "field5");
				console.log("test edit site " + JSON.stringify(site));
				setValues(site);

			}
			else {
				hideChmodOption();

				//Test code
				console.log("test add site");
				setValues();
			}
		});

		$("input[type='checkbox']", $dialog).change(function(){
			$("#osftp-ftp-site-chmodNumericValue", $dialog).val(getChmodModeString());
		});

		$("#osftp-ftp-site-chmodNumericValue", $dialog).change(function(){
			console.log($(this).val());
			setChmodMode($(this).val());
		})

		$("button[data-button-id='remove']", $dialog).on("click", function(e) {
            e.stopPropagation();
        });

	}


	function isFilePermission(inputStr){

		if (typeof inputStr !== 'string'){
			return false;
		}

		if (inputStr.length != 3){
			return false;
		}

		var arr = inputStr.split('');
		for (var i = 0; i < arr.length; i++){
			var num = Number(arr[i]);
			if (isNaN(num)){
				return false;
			}
			else if (num < 0 || num > 7){
				return false;
			}
		}

		return true;
	}


	function setChmodMode(inputStr){
		if (isFilePermission(inputStr)){

			$("#osftp-ftp-site-chmodNumericValueStatus", $dialog).text("");

			var arr = inputStr.split('');

			$("#osftp-ftp-site-chmodOwnerRead",    $dialog).prop("checked", (arr[0] & 4) ? true : false);
			$("#osftp-ftp-site-chmodOwnerWrite",   $dialog).prop("checked", (arr[0] & 2) ? true : false);
			$("#osftp-ftp-site-chmodOwnerExecute", $dialog).prop("checked", (arr[0] & 1) ? true : false);

			$("#osftp-ftp-site-chmodGroupRead",    $dialog).prop("checked", (arr[1] & 4) ? true : false);
			$("#osftp-ftp-site-chmodGroupWrite",   $dialog).prop("checked", (arr[1] & 2) ? true : false);
			$("#osftp-ftp-site-chmodGroupExecute", $dialog).prop("checked", (arr[1] & 1) ? true : false);

			$("#osftp-ftp-site-chmodPublicRead",    $dialog).prop("checked", (arr[2] & 4) ? true : false);
			$("#osftp-ftp-site-chmodPublicWrite",   $dialog).prop("checked", (arr[2] & 2) ? true : false);
			$("#osftp-ftp-site-chmodPublicExecute", $dialog).prop("checked", (arr[2] & 1) ? true : false);

		} else {
			$("#osftp-ftp-site-chmodNumericValue", $dialog).val(getChmodModeString());
			$("#osftp-ftp-site-chmodNumericValueStatus", $dialog).text("Invalid");
		}
	}

	function getChmodModeString(){
		var ownerGroup = 0;
		var groupGroup = 0;
		var publicGroup = 0;

		// get value from owner
		ownerGroup |= $("#osftp-ftp-site-chmodOwnerRead",    $dialog).prop("checked") ? 4 : 0;
		ownerGroup |= $("#osftp-ftp-site-chmodOwnerWrite",   $dialog).prop("checked") ? 2 : 0;
		ownerGroup |= $("#osftp-ftp-site-chmodOwnerExecute", $dialog).prop("checked") ? 1 : 0;

		// get value from group
		groupGroup |= $("#osftp-ftp-site-chmodGroupRead",    $dialog).prop("checked") ? 4 : 0;
		groupGroup |= $("#osftp-ftp-site-chmodGroupWrite",   $dialog).prop("checked") ? 2 : 0;
		groupGroup |= $("#osftp-ftp-site-chmodGroupExecute", $dialog).prop("checked") ? 1 : 0;

		// get value from public
		publicGroup |= $("#osftp-ftp-site-chmodPublicRead",    $dialog).prop("checked") ? 4 : 0;
		publicGroup |= $("#osftp-ftp-site-chmodPublicWrite",   $dialog).prop("checked") ? 2 : 0;
		publicGroup |= $("#osftp-ftp-site-chmodPublicExecute", $dialog).prop("checked") ? 1 : 0;

		return ownerGroup.toString() + groupGroup.toString() + publicGroup.toString();
	}

	function show(inputSite){
		var compiledTemplate = Mustache.render(ftpSiteDialogTemplat, Strings);

		dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
		$dialog = dialog.getElement();

		init(inputSite);

		dialog.done(function(buttonId) {
			if (buttonId === "ok") {
				inputSite = collectValues();
			}
		});

		return inputSite;
	}



});
