define(function (require, exports) {
	"use strict";

	var _           = brackets.getModule("thirdparty/lodash");
	var Dialogs     = brackets.getModule("widgets/Dialogs");
	var Strings     = require("../strings");
	var Preferences = require("./preferences");
	var osFtpCommon = require("./common");

	var settingsDialogTemplate = require("text!templates/settings-dialog.html");

	exports.show = show;

	var dialog,
		$dialog;

	function setValues(values){
		$("*[settingsProperty]", $dialog).each(function () {
            var $this = $(this),
				id   = $this.attr("id"),
                type = $this.attr("type"),
                tag = $this.prop("tagName").toLowerCase(),
                property = $this.attr("settingsProperty");

			console.log("SETTING PROPERTIES: " + id + " " + type + " " + tag + " " + property)

            if (type === "checkbox") {
                $this.prop("checked", values[property]);
            } else if (tag === "select") {
                $("option[value=" + values[property] + "]", $this).prop("selected", true);
            } else if (type === "table"){
				$this.html(osFtpCommon.generateHtmlTable(JSON.parse(values[property]), id));
			}
			else {
                $this.val(values[property]);
            }
        });

	}

	function collectValues(){
		$("*[settingsProperty]", $dialog).each(function () {
            var $this = $(this),
				id   = $this.attr("id"),
                type = $this.attr("type"),
                property = $this.attr("settingsProperty"),
                prefType = Preferences.getType(property);

			console.log("Collect PROPERTIES: " + id + " " + type + " " + property);

            if (type === "checkbox") {
                Preferences.set(property, $this.prop("checked"));
            } else if (prefType === "number") {
                var newValue = parseInt($this.val().trim(), 1);
                if (isNaN(newValue)) { newValue = Preferences.getDefaults()[property]; }
                Preferences.set(property, newValue);
            } else if (type === "table"){
				var $table = $this.find("table");
				var object = osFtpCommon.extractTableData($table);
				Preferences.set(property, JSON.stringify(object));
			} else {
                Preferences.set(property, $this.val().trim() || null);
            }
        });
        Preferences.save();
	}

	function assignActions(){

		$("button[data-button-id='add']", $dialog).on("click", function (e) {
            e.stopPropagation();
            // do something
        });

		$("button[data-button-id='remove']", $dialog).on("click", function (e) {
            e.stopPropagation();
            // do something
        });

		$("button[data-button-id='defaults']", $dialog).on("click", function (e) {
            e.stopPropagation();
            setValues(Preferences.getDefaults());
        });
	}

	function init() {

		setValues(Preferences.getAll());
		assignActions();

		$("#osftp-setting-tabs a", $dialog).click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});
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
