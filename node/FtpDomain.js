(function () {
  'use strict';
  
  
  function run_cmd2(cmd, args, callBack ) {
    
    var fs = require('fs'); //file system
    var spawn = require('child_process').spawn;
    
    var options = {
      stdio: [
        'pipe',  //'pipe' is an option --- child.stdin is shorthand for stdio[0]
        'pipe', //fs.openSync('out.txt', 'w'), // --- child.stdout is shorthand for stdio[1]
        'pipe' //fs.openSync('err.txt', 'w') // ---- --- child.stderr is shorthand for stdio[3]
        ]
    };
    
    var child = spawn(cmd, args, options);
    var resp = '';

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
      resp += buffer.toString();
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    });
    
    
  
    child.stdout.on('end', function() { 
      callBack (resp); 
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    });
  } 
  

  function doFtp(text) {
    console.log('input text was: ' + text);
    var bar = new run_cmd2('hostname', [], function(text) { console.log (text) });
  }
  

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

}());