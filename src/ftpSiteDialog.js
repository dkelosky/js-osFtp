define(function (require, exports) {
	"use strict";

	var Dialogs = brackets.getModule("widgets/Dialogs");
	var Strings = require("../strings");

	var ftpSiteDialogTemplat = require("text!templates/ftp-site-dialog.html");

	exports.show = show;

	var dialog,
		$dialog;


	function init(){
		hideChmodOption();

		assignActions();
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
			}
			else {
				hideChmodOption();
			}
		})

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
