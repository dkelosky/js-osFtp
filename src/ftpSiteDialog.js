define(function (require, exports) {
	"use strict";

	var Dialogs      = brackets.getModule("widgets/Dialogs");
	var Strings      = require("../strings");
	var SitesManager = require("./sitesManager");
	var osftpCommon  = require("./common");

	var ftpSiteDialogTemplat = require("text!templates/ftp-site-dialog.html");

	exports.show = show;

	var dialog,
		$dialog;
	var isEditMode;
    var isChmodOpstionShow;

	var SERVER_TYPES = ["zOS", "Windows", "Linux"];

	function okButtonHandle(){
		var site = collectValues();
		SitesManager.registerSite(site);
		console.log(SitesManager.getSitesArray());
	}

	function cancelButtonHandle(){
	}

	function removeButtonHandle(){
		var site = collectValues();
		SitesManager.removeSite(site.name);
	}

	function init(inputSite){
		setValues(inputSite);
		assignActions();
	}

	function setValues(inputSite){
        // Set server types list:
		for (var i in SERVER_TYPES){
			$("#osftp-ftp-site-serverType", $dialog)
				.append($("<option></options>")
				.attr("value", i.toString())
				.text(SERVER_TYPES[i]));
		}

		// If input is a site then fill in the fields with info
		if (SitesManager.validateSite(inputSite)){

			$("#osftp-ftp-site-siteName", $dialog).val(inputSite.name);
			$("#osftp-ftp-site-hostName", $dialog).val(inputSite.hostAddr);
			$("#osftp-ftp-site-rootDir",  $dialog).val(inputSite.rootDir);
			$("#osftp-ftp-site-userName", $dialog).val(inputSite.userName);
			$("#osftp-ftp-site-password", $dialog).val(inputSite.password);

			if (osftpCommon.isSet(inputSite.getChmodStr())){
				setChmodMode(inputSite.chmodStr);
				$('#toggle-chmod-option', $dialog).prop("checked",true);
			}

            // set remote OS
            $('#osftp-ftp-site-serverType', $dialog).val(SERVER_TYPES.indexOf(inputSite.getRemoteOs()));
            updateServerType();

			isEditMode = true;
		} else {
			isEditMode = false;
		}

		// Set the correct title
		if (isEditMode){
			var title = Strings.DIALOG_TITLE_EDIT_SITE + ' ' + inputSite.name;
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

		// Update Chmod options
		updateChmodOption();
	}


	function collectValues(){
		// If all is pass then collect data
		var site = SitesManager.newSite($("#osftp-ftp-site-siteName", $dialog).val().replace(/\s+/g, '-'),
										$("#osftp-ftp-site-hostName", $dialog).val(),
										$("#osftp-ftp-site-rootDir",  $dialog).val(),
										$("#osftp-ftp-site-userName", $dialog).val(),
										$("#osftp-ftp-site-password", $dialog).val());

		if ($('#toggle-chmod-option', $dialog).prop("checked")){
			site.setChmodStr(getChmodModeString());
		}

        site.setRemoteOs($('#osftp-ftp-site-serverType option:selected', $dialog).text());

		site.debugPrint();

		return site;
	}


	function validateInputs(){

		var siteName = $("#osftp-ftp-site-siteName", $dialog).val();
		var hostName = $("#osftp-ftp-site-hostName", $dialog).val();

		/**
		 * Save these variable inputs but comment them to remove JSHint errors
		 */
		//var rootDir  = $("#osftp-ftp-site-rootDir",  $dialog).val();
		//var userName = $("#osftp-ftp-site-userName", $dialog).val();
		//var password = $("#osftp-ftp-site-password", $dialog).val();

		if (!isEditMode){
			if (!osftpCommon.isSet(siteName)){
				setErrorMessage(Strings.DIALOG_ERROR_SITE_INVALID);
				return false;
			}

			if (SitesManager.isSiteExisted(siteName)){
				setErrorMessage(Strings.DIALOG_ERROR_SITE_EXISTS);
				return false;
			}
		}

		// Validate host name
		if (!osftpCommon.isSet(hostName)){
			setErrorMessage(Strings.DIALOG_ERROR_HOST_INVALID);
			return false;
		}

		// Validate file permission
		if (!setChmodMode(getChmodModeString())){
			return false;
		}

        // Check if chmod option is showed if no then clear chmod checkbox.
        if (!isChmodOpstionShow){
            $('#toggle-chmod-option', $dialog).prop("checked", false);
        }

		return true;
	}

	function setErrorMessage(message){
		$("#osftp-ftp-site-inputErrorMessage").text(message);
	}

    function hideChmodOption(){
        isChmodOpstionShow = false;
        $('#osftp-ftp-input-chmod-option', $dialog).hide();

        $("*[chmodOption]", $dialog).each(function(){
            $(this).hide();
		});
    }

    function showChmodOption(){
        isChmodOpstionShow = true;
        $('#osftp-ftp-input-chmod-option', $dialog).show();
        updateChmodOption();
    }

	function updateChmodOption(){
		$("*[chmodOption]", $dialog).each(function(){
			if ($('#toggle-chmod-option', $dialog).prop("checked")){
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	}

    function updateServerType(){
        console.log('serverType changed');
        var serverType =  $('#osftp-ftp-site-serverType option:selected', $dialog).text();
        if (serverType === 'Windows'){
            hideChmodOption();
        }
        else{
            showChmodOption();
        }
    }

	function assignActions(){

		$('#toggle-chmod-option', $dialog).change(function(){
			updateChmodOption();
		});

        $('#osftp-ftp-site-serverType', $dialog).change(function(){
            updateServerType();
        });

		$("input[type='checkbox']", $dialog).change(function(){
			$("#osftp-ftp-site-chmodNumericValue", $dialog).val(getChmodModeString());
		});

		$("#osftp-ftp-site-chmodNumericValue", $dialog).change(function(){
			setChmodMode($(this).val());
		});

		$("button[data-button-id='ok']", $dialog).on("click", function(e) {
			// Validate input here
			if (!validateInputs()){
				e.stopPropagation();
			}
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

			$("#osftp-ftp-site-chmodNumericValue", $dialog).val(getChmodModeString());

			return true;
		} else {
			$("#osftp-ftp-site-chmodNumericValue", $dialog).val(getChmodModeString());
			$("#osftp-ftp-site-chmodNumericValueStatus", $dialog).text("Invalid");

			return false;
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
				okButtonHandle();
			} else if (buttonId === "cancel"){
				cancelButtonHandle();
			} else if (buttonId === "remove"){
				removeButtonHandle();
			}
		});
	}
});
