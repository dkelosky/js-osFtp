define(function(require, exports) {
    "use strict";

    var Dialogs = brackets.getModule("widgets/Dialogs");
    var Strings = require("../strings");
    var Preferences = require("./preferences");
    var osFtpCommon = require("./common");

    var settingsDialogTemplate = require("text!templates/settings-dialog.html");

    exports.show = show;

    var dialog,
        $dialog;

    var asciiTabledata;

	/**
	 * set dialog values.
	 **/

    function setValues(values) {
		osFtpCommon.consoleDebug('setValues()');
        $("*[settingsProperty]", $dialog).each(function() {
            var $this = $(this),
                id = $this.attr("id"),
                type = $this.attr("type"),
                tag = $this.prop("tagName").toLowerCase(),
                property = $this.attr("settingsProperty");

            osFtpCommon.consoleDebug("SETTING PROPERTIES: " + id + " " + type + " " + tag + " " + property);

            if (type === "checkbox") {
                $this.prop("checked", values[property]);
            } else if (tag === "select") {
                $("option[value=" + values[property] + "]", $this).prop("selected", true);
            } else if (type === "table") {
                if (property === "transferAsAsciiTable"){
                    asciiTabledata = JSON.parse(values[property]);
                    refreshTransferAsciiTable();
                } else {
                    $this.html(osFtpCommon.generateHtmlTable(JSON.parse(values[property]), id));
                }
            } else {
                $this.val(values[property]);
            }
        });
    }

	/**
	 * Collecting values from the dialog and save it to preferences
	 **/

    function collectValues() {
		osFtpCommon.consoleDebug('collectValues()');
        $("*[settingsProperty]", $dialog).each(function() {
            var $this = $(this),
                id = $this.attr("id"),
                type = $this.attr("type"),
                property = $this.attr("settingsProperty"),
                prefType = Preferences.getType(property);

            console.log("Collect PROPERTIES: " + id + " " + type + " " + property);

            if (type === "checkbox") {
                Preferences.set(property, $this.prop("checked"));
            } else if (prefType === "number") {
                var newValue = parseInt($this.val().trim(), 1);
                if (isNaN(newValue)) {
                    newValue = Preferences.getDefaults()[property];
                }
                Preferences.set(property, newValue);
            } else if (type === "table") {
                var $table = $this.find("table");
                var object = osFtpCommon.extractTableData($table);
                Preferences.set(property, JSON.stringify(object));
            } else {
                Preferences.set(property, $this.val().trim() || null);
            }
        });
        Preferences.save();
    }

	/**
	 * Asigning action handler for the dialog
	 **/

    function assignActions() {
		osFtpCommon.consoleDebug('assignActions()');
        $("button[data-button-id='add']", $dialog).on("click", function(e) {
            e.stopPropagation();

            // Extract text from input
            var text = $("#osftp-settings-fileExtensionInput").val().toLowerCase();
            if (osFtpCommon.isSet(text)){
                if (asciiTabledata.tableData.indexOf(text) == -1){
                    asciiTabledata.tableData.push(text);
					asciiTabledata.tableData.sort();
                    refreshTransferAsciiTable();
                }
            }

            // Clear input field
            $("#osftp-settings-fileExtensionInput").val('');
        });

        $("button[data-button-id='remove']", $dialog).on("click", function(e) {
            e.stopPropagation();

            var text = $("#osftp-settings-fileExtensionInput").val();
            if (osFtpCommon.isSet(text)){
                var index = asciiTabledata.tableData.indexOf(text);
                if (index != -1){
                    asciiTabledata.tableData.splice(index, 1);
                    refreshTransferAsciiTable();
                }
            }

            $("#osftp-settings-fileExtensionInput").val('');
        });

        $("button[data-button-id='defaults']", $dialog).on("click", function(e) {
            e.stopPropagation();
            setValues(Preferences.getDefaults());
        });
    }

	/**
	 * Init dialog
	 **/

    function init() {
		osFtpCommon.consoleDebug('init()');
        setValues(Preferences.getAll());
        assignActions();

        $("#osftp-settings-tabs a", $dialog).click(function(e) {
            e.preventDefault();
            $(this).tab("show");
        });
    }

	/**
	 * Refresh transfer Ascci Table handler
	 **/

    function refreshTransferAsciiTable(){
		osFtpCommon.consoleDebug('refreshTransferAsciiTable()');
        var tableDivId = "osftp-settings-transferAsAsciiTable";
        var html = osFtpCommon.generateHtmlTable(asciiTabledata, tableDivId);
        $('#'+tableDivId, $dialog).html(html);
        $('#'+tableDivId, $dialog).find("table tbody tr").click(function(){
            $("#osftp-settings-fileExtensionInput").val($(this).text());
        });
    }

	/**
	 * Show dialog
	 **/

    function show() {
		osFtpCommon.consoleDebug('show()');
        var compiledTemplate = Mustache.render(settingsDialogTemplate, Strings);

        dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
        $dialog = dialog.getElement();

        init();

        dialog.done(function(buttonId) {
            if (buttonId === "ok") {
                // Save everything to preferences
                collectValues();
            }
        });
    }
});
