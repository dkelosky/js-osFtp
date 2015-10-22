define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var FileUtils = brackets.getModule('file/FileUtils');


  /**
   * Extension modules
   */
  var osFtpCommon = require('src/common');


  /**
   * Exported functions
   */
  exports.buildUploadForFileScript = buildUploadForFileScript;
  exports.generateUploadScript     = generateUploadScript;


  /**
   * Global variables
   */
  var FTP_BINARY_EXTENSIONS = ['class'];


  function generateUploadScript(listFile, site){
    console.log("getneratUploadScript");

    var newScript = '';

    console.log(listFile);

    var dirTree = [];

    for (var i = 0; i < listFile.length; i ++){
      var File = listFile[i];
      console.log(JSON.stringify(File));

      var tempDir = File.relativeDir;
      console.log(tempDir);

      tempDir = FileUtils.convertWindowsPathToUnixPath(tempDir);
      tempDir = tempDir.replace('/',' ');
      console.log("tempDir: " + tempDir);

      var folderList = tempDir.split(' ');
      console.log(folderList);

      for (var i = 0; i < folderList.length; i ++){
        var treeLevel = dirTree[i] || [];

        if (treeLevel.indexOf(folderList[i]) == -1){
          treeLevel.push(folderList[i]);
        }

      }

      console.log(dirTree);



    }


    return newScript;
  }


  /**
   * Build an FTP script based on the file choosen and the site selected
   * @param   {String} itemFullPath Full path to the item that we want to FTP
   * @param   {Object} site         Site object containing information about the site to use
   * @returns {String} Completed FTP script
   */
  function buildUploadForFileScript(itemFullPath, site) {

    //like 'C:' is two characters
    var WINDOWS_DRIVE_LETTER_OFFSET = 0;
    var WINDOWS_DRIVE_LETTER_LEN = 2;
    var WINDOWS_DRIVE_SEPERATOR_OFFSET = 1;
    var WINDOWS_DRIVE_SEPERATOR = ':';
    var WINDOWS_DRIVE_DIRECTORY_CHAR = '\\';

    //initialize script
    var ftpStdin = '';

    //open the host
    ftpStdin += 'op ';
    ftpStdin += site.host;
    ftpStdin += '\n';

    //we no that auto-login will be disabled so specify 'user'
    ftpStdin += 'user\n';

    //provide user name and password to script file
    ftpStdin += site.user;
    ftpStdin += '\n';
    ftpStdin += site.pass;
    ftpStdin += '\n';

    //switch to requested root directory
    ftpStdin += 'cd ';
    ftpStdin += site.root;
    ftpStdin += '\n';

    //directory path with always have forward slash seperators, so parse each directory
    var directory = FileUtils.getDirectoryPath(itemFullPath).split('/');

    //if the first directory is a windows type drive
    if (directory[WINDOWS_DRIVE_LETTER_OFFSET].length == WINDOWS_DRIVE_LETTER_LEN) {

      //if the second character after the drive letter is a colon, this should be windows directories
      if (directory[WINDOWS_DRIVE_LETTER_OFFSET].charAt(WINDOWS_DRIVE_SEPERATOR_OFFSET) == WINDOWS_DRIVE_SEPERATOR)

        //append a backlash to the drive letter and colon
        directory[WINDOWS_DRIVE_LETTER_OFFSET] += WINDOWS_DRIVE_DIRECTORY_CHAR;

    }

    //iterate through directories
    directory.forEach(function (dir) {

      //while the directory appears valid
      if (osFtpCommon.isSet(dir)) {

        //alter local directory to the file we are ftp'ing
        ftpStdin += 'lcd ';
        ftpStdin += dir;
        ftpStdin += '\n';
      }

    });

    //if we need to ftp this file as binary, set indicator
    if (ftpAsBinary(FileUtils.getFileExtension(itemFullPath)))
      ftpStdin += 'binary\n';

    //currently we only allow for put
    ftpStdin += 'put ';
    ftpStdin += File.getBaseName(itemFullPath);
    ftpStdin += '\n';

    //quit the script
    ftpStdin += 'quit \n';

    //return completed script string
    return ftpStdin;

  }


  /**
   * Check known extensions to see whether ftp should be done in binary
   * @param   {String} extension extension (without '.') to validate against known extensions
   * @returns {Boolean}  Returns true if this extension should be ftp'ed as binary
   */
  function ftpAsBinary(extension) {

    //if the extension is in our predefined list of things to ftp, return true
    for (var i = 0; i < FTP_BINARY_EXTENSIONS.length; i++)
      if (FTP_BINARY_EXTENSIONS[i] == extension)
        return true

    //no need to ftp this as binary
    return false;

  }

});
