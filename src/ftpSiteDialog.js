define(function (require, exports) {
	"use strict";

	var Dialogs = brackets.getModule("widgets/Dialogs");
	var Strings = require("../strings");

	var ftpSiteDialogTemplat = require("text!templates/ftp-site-dialog.html");

	exports.show = show;

	var dialog,
		$dialog;


	function init(){
		setValues();

		assignActions();
	}

	function setValues(inputSite){



	}

	function collectValues(){



	}


	function showChmodOption(){
		$("*[chmodOption]", $dialog).each(function(){
			$(this).show();
		});

		// testing edit option
		$("*[editOption]", $dialog).each(function(){
			console.log('edit option show');
			$(this).show();
		});
	}

	function hideChmodOption(){
		$("*[chmodOption]", $dialog).each(function(){
			$(this).hide();
		});

		$("*[editOption]", $dialog).each(function(){
			console.log('edit option hide')
			$(this).hide();
		});
	}


	function assignActions(){

		$('#toggle-chmod-option', $dialog).change(function(){
			if (this.checked){
				showChmodOption();
			}
			else {
				hideChmodOption();
			}
		})

	}


	function getCurrentModeString(){
		var returnStr = '';

		// get value from owner

		// get value from group

		// get value from public


		return returnStr;
	}

	function show(){
		var compiledTemplate = Mustache.render(ftpSiteDialogTemplat, Strings);

		dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
		$dialog = dialog.getElement();

		init();

		dialog.done(function(buttonId) {
			if (buttonId === "ok") {
				collectValues();
			}
		});
	}



});
