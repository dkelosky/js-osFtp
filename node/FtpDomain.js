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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global */

(function () {
  'use strict';
  
  //this is required, not sure what it does
  exports.init = init;

  /**
   * Initialize this domain
   * @param {Object} domainManager See Brackets documentation on the domainManger object
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
      'overal description goes here',
      [{
      name: 'scriptFile', // parameters
      type: 'string',
      description: 'Fully qualified FTP script file to execute'
      }], [{
      name: 'output1', // return values
      type: 'number',
      description: 'output 1 desc goes here'
      }]
    );

    /**
     * The last three parameters of each domainManager are documentation for api usage
     */
    domainManager.registerCommand(
      'ftp',
      'doFtpStdin',
      doFtpStdin,
      false,
      'overal description goes here',
      [{
      name: 'scriptFile',
      type: 'string',
      description: 'Fully qualified FTP script file to execute'
      },
      {
      name: 'scriptFile',
      type: 'string',
      description: 'Fully qualified FTP script file to execute'
      }], [{
      name: 'output1',
      type: 'number',
      description: 'output 1 desc goes here'
      }]
      );
    }

  /**
   * Command handler
   * @param {string} ftpScriptFile Fully qualified FTP script file to execute
   */
  function doFtp(ftpScriptFile) {

    //log input script file
    console.log('Input file specified was: ' + ftpScriptFile);

    //run ftp with options to suppress auto login and to supply a script file
    var bar = new runProcess('ftp', ['-ns:' + ftpScriptFile], function(response) {
      console.log('Command response was: \n' + response)
    });
  }

  /**
   * Command handler
   * @param {string} ftpScriptFile Fully qualified FTP script file to execute
   */
  function doFtpStdin(file, data) {

    //orient to node file system
    var fs = require('fs');

    //sychronously open, write to, and close a temp script file
    console.log('Opening file - ' + file);
    var newFile = fs.openSync(file, 'w');

    console.log('Writing file data...');
    fs.writeSync(newFile, data);

    console.log('Closing file...');
    fs.closeSync(newFile);
    console.log('File closed');

    //run ftp with options to suppress auto login and to supply a script file
    var bar = new runProcess('ftp', ['-ns:' + file], function(response, isError) {

      if (isError) {
        console.log('Error response was: \n' + response)

      }

      else {
        console.log('Command response was: \n' + response)
      }
    });
  }


  /**
   * Wrapper for spawning a child process
   * @param {String} cmd      Executable command
   * @param {String} args     Arguments for cmd executable
   * @param {Function} callBack Callback for function complete
   */
  function runProcess(cmd, args, callBack) {

    var spawn = require('child_process').spawn;
    var fs = require('stream');                   //stream

    var options = {

      /**
       * 'pipe'             - pipe parent to child for stdio
       * 'ipc'              - ???
       * 'ignore'           - ???
       * 'Stream object'    - ttyl, file, socket, or pipe
       * 'Positive integer' - integer is file descriptor (fd) that is currently open
       * 'null,undefined'   - means use defaults ('pipe' for stdin, stdout, and stder, else 'ignore')
       */
      stdio: [
        'pipe', //'pipe' is an option          --- child.stdin is shorthand for stdio[0]
        'pipe', //fs.openSync('out.txt', 'w'), --- child.stdout is shorthand for stdio[1]
        'pipe'  //fs.openSync('err.txt', 'w')  --- child.stderr is shorthand for stdio[3]
        ]
    };

    //log our spawn
    console.log('Spawning command: ' + cmd + ' ' + args);

    //spawn
    var child = spawn(cmd, args, options);

    //init response variable
    var resp = '';
    var failResp = '';

    //must end input
    child.stdin.end();

    //log if error data present
    child.on('error', function (err) {

      //log error
      console.log('Failed to start child process.' + err.message);

    });

    //listen for data present
    child.stdout.on('data', function (buffer) {

      //append to and build response
      resp += buffer.toString();

    });

    //listen for data present
    child.stderr.on('data', function (buffer) {

      //append to and build response
      failResp += buffer.toString();

    });

    //listen for end of data
    child.stdout.on('end', function() {

      //provide text response to callback
      callBack(resp, false);

      //log that we reached the end
      console.log('End of stdout reached');
    });


    //listen for end of data
    child.stderr.on('end', function() {

      //provide text response to callback
      callBack(failResp, true);

      //log that we reached the end
      console.log('End of stderr reached');
    });
  }


}());
