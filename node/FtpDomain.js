(function () {

  'use strict';
  
  /**
   * Initialize this domain
   * @param {[[Type]]} domainManager [[Description]]
   */
  function init(domainManager) {
    
    if (!domainManager.hasDomain('ftp')) {
      
      domainManager.registerDomain('ftp', {
        major: 0,
        minor: 1
      });
    }
    
    /**
     * The last three parameters of each domainManager are documentation for api usage
     */
    domainManager.registerCommand(
      'ftp', // domain name
      'doFtp', // command name
      doFtp, // command handler function
      false, // this command is synchronous in Node
      'overal description goes here', [{
        name: 'input1', // parameters
        type: 'string',
        description: 'input 1 desc goes here'
      }], [{
        name: 'output1', // return values
        type: 'number',
        description: 'output 1 desc goes here'
      }]
    );
  }

  exports.init = init;


  /**
   * Command handler
   * @param {string} text Text data that is passed to the process
   */
  function doFtp(ftpScriptFile) {

    //log input script file
    console.log('Input file specified was: ' + ftpScriptFile);

    //var bar = new runProcess('hostname', [], function(text) { console.log(text) });
    var bar = new runProcess('ftp', ['-s:' + ftpScriptFile], function(response) { console.log(response) });
    //var bar = new runProcess('ftp', ['-d'], null, function(response) { console.log(response) });
  }



  function runProcess(cmd, args, callBack) {

    var spawn = require('child_process').spawn;
    var fs = require('fs'); //file system
    var fs = require('stream'); //stream

    var options = {

      /**
       * 'pipe' - pipe parent to child for stdio
       * 'ipc' - WTF
       * 'ignore'
       * 'Stream object' - ttyl, file, socket, or pipe
       * 'Positive integer' - integer is file descriptor (fd) that is currently open
       * 'null,undefined' - means use defaults ('pipe' for stdin, stdout, and stder, else 'ignore')
       */
      cwd: 'C:\\Users\\KELDA16\\AppData\\Roaming\\Brackets\\extensions\\user\\osFtp\\node',
      stdio: [
        'pipe',  //'pipe' is an option            --- child.stdin is shorthand for stdio[0]
        'pipe', //fs.openSync('out.txt', 'w'), // --- child.stdout is shorthand for stdio[1]
        'pipe' //fs.openSync('err.txt', 'w') //   --- child.stderr is shorthand for stdio[3]
        ]
    };

    console.log('args: ' + args);
    //var child = spawn(cmd, args, options);
    var child = spawn(cmd, args, options);
    var resp = '';

    console.log('Current working directory: ' + options.cwd);

    //console.log('inData: ' + inData);
    child.stdin.write('\n');
    child.stdin.end();


    child.on('error', function (err) {
      console.log('Failed to start child process.' + err.message);
    });


    /**
     * stdout.on registers a listener
     *
     * the first parameter in the on method is the event we're listening for (e.g. listening for the 'data' event here)
     *  - see https://nodejs.org/api/stream.html
     */
    child.stdout.on('data', function (buffer) {
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& - DATA');

      //build response
      resp += buffer.toString();
    });

    child.stdout.on('end', function() {

      //provide text response to callback
      console.log('callBack(cmd: resp);');
      callBack(cmd + ': ' + resp);

      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& - END');
    });
  }


}());
