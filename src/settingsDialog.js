define(function (require, exports) {
	"use strict";

	var Dialogs = brackets.getModule("widgets/Dialogs");
	var Strings = require("../strings");
	var settingsDialogTemplate = require("text!templates/settings-dialog.html");

	exports.show = show;

	var dialog,
		$dialog;

	function setValues(values){

	}

	function assignActions(){

	}

	function init() {
		console.log('init');

		setValues(Preferences.getAll());
		asssignActions();

		$("#osftp-setting-tabs a", $dialog).click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});
	}

	function collectValues(){
		console.log('collect Values');
		return false;
	}

	function show() {
		var compiledTemplate = Mustache.render(settingsDialogTemplate, Strings);

		dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
		$dialog = dialog.getElement();

		init();

		dialog.done(function (buttonId) {
			if (buttonId === "ok") {
				// Save everything to preferences
				collectValues();
			}
		});
	}
});
