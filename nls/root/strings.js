/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

// English - root strings

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define({
	EXTENSION: 'OS FTP',
	PRODUCT_SETTINGS: 'JS-OS FTP Settings\u2026',
	TRANSFER_TYPE: 'Transfer Type',
	TREAT_TYPE_AS_ASCII_LABEL: 'Treat the following filetypes as ASCII files:',
	TREAT_FILE_WIHTOUT_EXTENSION_AS_ASCII: 'Treat files without extension as ASCII file',
	BUTTON_DEFAULTS: 'Restore Defaults',
	BUTTON_CANCEL: 'Cancel',
	BUTTON_SAVE: 'Save',
	BUTTON_ADD: 'Add',
	BUTTON_REMOVE: 'Remove',
	CHECKBOX_READ: 'Read',
	CHECKBOX_WRITE: 'Write',
	CHECKBOX_EXECUTE: 'Execute',
	COMMAND_PRODUCT_SETTINGS_LABEL: 'OS FTP Setting\u2026',
	COMMAND_RUN_SCRIPT_LABEL: 'Run as FTP Script',
	COMMAND_GET_FROM_SITE_LABEL: 'Get from FTP Site\u2026',
	COMMAND_EDIT_SITE_LABEL: 'Edit FTP Site\u2026',
	COMMAND_NEW_SITE_LABEL: 'New FTP Site\u2026',
	COMMAND_RUN_SITE_BASE_LABEL: 'Upload to ',
	DIALOG_ERROR_SITE_EXISTS: 'Site already exists',
	DIALOG_ERROR_SITE_INVALID: 'Site name is required',
	DIALOG_ERROR_HOST_INVALID: 'Host name is required',
	DIALOG_TITLE_ADD_SITE: 'Add FTP Site',
	DIALOG_TITLE_EDIT_SITE: 'Edit FTP Site',
	DIALOG_TITLE_CONFIRM_UPLOAD: 'Confirm Directory Upload',
	DIALOG_TITLE_GET_FROM_SITE: 'Get From FTP Site',
	DIALOG_TITLE_FTP_FAIL: 'FTP Failure',
	DIALOG_TITLE_PROJECT_FAIL: 'Project Failure',
	DIALOG_TITLE_NEW_VERSION: 'New Version Detected',
	DIALOG_TITLE_INIT_FAIL: 'Initialization Failure',
	DIALOG_TITLE_SELECT_SITE: 'Select FTP Site',
	DIALOG_TOGGLE_CHMOD: 'Set permission',
	DIALOG_SERVER_TYPE: 'Server Type:',
	DIALOG_CHMOD_GROUP_OWNER: 'Owner permissions',
	DIALOG_CHMOD_GROUP_GROUP: 'Group permissions',
	DIALOG_CHMOD_GROUP_PUBLIC: 'Public permissions',
	DIALOG_CHMOD_NUMERIC_VALUE: 'Numeric Value:',
	DIALOG_OK: 'OK',
	DIALOG_INPUT_NAME: 'Site Name:',
	DIALOG_INPUT_HOST: 'Host:',
	DIALOG_INPUT_ROOT: 'Root:',
	DIALOG_INPUT_USER: 'User:',
	DIALOG_INPUT_PASSWORD: 'Password:',
	DIALOG_CANCEL: 'CANCEL',
	DIALOG_DELETE: 'DELETE',
	DIALOG_CONFIRM_BODY: 'Confirm directory upload to site - ',
	NEW_VERSION_EXEC: 'A new version of OS FTP has been detected.  You must restart Brackets to use this extension.',
	FAILURE_INIT_EXEC: 'Initialization failure.  The package.json file could not be loaded from the root directory.  ' +
		'See the console log (F12) for more information.  You may need a clean install of the extension.  Failure text is:',
	FAILURE_PROJECT_EXEC: 'FTP script generation failure.  The FTP script could not be generated because the file or directory ' +
		'project structures have not been generated by Brackets.  ',
	PLEASE_TRY_AGAIN: 'Please try again.',
	FAILURE_FTP_EXEC: 'FTP execute failure.  The FTP process has been terminated.  See the console log (F12) for more information.  First failure text is:',
	FAILURE_FTP_PROCESS_IN_PROGRESS: 'FTP process is already in progress.  Please wait for process completion.',
	FAILURE_FTP_RUN_DIRECTORY: 'You must select an individual file to run as an FTP script.  Directories are ineligbile.',
	STATUS_FTP_INDICATOR: 'OS FTP',
	STATUS_FTP_TOOLTIP: 'OS FTP Status'
});
