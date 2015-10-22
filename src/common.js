define(function (require, exports, module) {
    'use strict';

  var Project = brackets.getModule('project/ProjectManager');

  /**
   * Exported functions
   */
  exports.isSet = isSet;
  exports.getSelectedFiles = getSelectedFiles;


  /**
   * Determines whether or not a variable exists, is null, or contains no data
   * @param   {String} variable Any variable type
   * @returns {Boolean}  Returns true if the variable is defined
   */
  function isSet(variable) {

    //if there is no problem with this variable, return true
    if (variable != 'undefined' && variable != null && variable != '')
      return true;

    //otherwise return false
    return false;
  }

  /**
   * Return list of files
   * @returns (FilesList) Return file list object
   */

  function getSelectedFiles(){
    var returnList   = [];
    var fileList     = [];

    // Get the root directory and selected item
    var rootDir      = Project.getProjectRoot().fullPath;
    var selectedItem = Project.getSelectedItem();

    // If item is a directory then will have to collect all of the files
    //   that is under that directory.
    if (selectedItem.isDirectory){
      var currentDir = selectedItem.fullPath;

      // Loop through all file in root directory to locate file that contain
      //   the selected directory.
      var filesInDir = Project.getAllFiles(function(File, number){
        var currentFile = File.fullPath;
        if (currentFile.indexOf(currentDir) > -1){
          fileList.push(File);
        }
      });

      fileList.push(filesInDir);
    }
    // If item is file then just add the file to the list.
    else{
      fileList.push(selectedItem);
    }

    // Format the return object
    for (var i = 0; i < fileList.length; i ++){

      var object = {
        rootDir:      rootDir,
        name:         fileList[i].name,
        fullDir:      fileList[i].parentPath,
        fullPath:     fileList[i].fullPath,
        relativeDir:  String(fileList[i].parentPath).replace(rootDir,""),
        relativePath: String(fileList[i].fullPath).replace(rootDir, "")
      };

      returnList.push(object);
    }

    for (var i = 0; i < returnList.length; i ++){
      console.log(JSON.stringify(returnList[i]));
    }

    return returnList;
  }

});
