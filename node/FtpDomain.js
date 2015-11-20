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

(function () {
    'use strict';


    /**
     * Global variables
     */
    var globalDomainManager;
    var osFtpDomainName = 'osFtp';
    var osFtpDomainMessage = osFtpDomainName + '-' + 'msg';
    var osFtpDomainData = osFtpDomainName + '-' + 'data';

    /**
     * We won't catch all errors but can some of the sever ones.  the only garunteed way to know if there is an error
     * in the ftp process is to analyze the console log on every ftp.
     */
    var failureStrings = ['Unknown host', 'Not connected', 'Invalid command'];
    var SCRIPT_PUT = 'PUT "';


    /**
     * Exported functions
     */
    exports.init = init;


    /**
     * Initialize this domain
     * @param {Object} domainManager See Brackets documentation on the domainManger object
     */
    function init(domainManager) {

        //save reference to domain manager
        globalDomainManager = domainManager;

        if (!domainManager.hasDomain(osFtpDomainName)) {

            //Bracket's doc makes me wonder - WHY?!
            domainManager.registerDomain(osFtpDomainName, {
                major: 0,
                minor: 1
            });
        }

        /**
         * The last three parameters of each domainManager are documentation for api usage
         */
        domainManager.registerCommand(
            osFtpDomainName, // domain name
            'doFtp', // command name
            doFtp, // command handler function
            false, // this command is synchronous in Node
            'overal description goes here', [{
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
            osFtpDomainName,
            'doFtpStdin',
            doFtpStdin,
            false,
            'overal description goes here', [{
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

        //notifications for messages
        domainManager.registerEvent(
            osFtpDomainName, //domain name
            osFtpDomainMessage, //event name
      		[{
                name: 'response',
                type: 'Object',
                description: 'contains Boolean "failure" and String "message"'
			}]
        );

        //notifications for data
        domainManager.registerEvent(
            osFtpDomainName, //domain name
            osFtpDomainData, //event name
      		[{
                name: 'data',
                type: 'Object',
                description: 'contains success counter'
			}]
        );

    }

    /**
     * Command handler
     * @param {string} ftpScriptFile Fully qualified FTP script file to execute
     */
    function doFtp(cwd, ftpScriptFile) {

        //log entry
        console.log('doFtp();');

        //log input script file
        console.log('Input file specified was: ' + ftpScriptFile);

        //run ftp with options to suppress auto login and to supply a script file
        new RunProcess(cwd, 'ftp', ['-ins:' + ftpScriptFile], function (isFailure, response) {

            //log complete
            console.log('doFtp(); complete');

            //process the response
            processResponse(isFailure, response);

        });
    }



    /**
     * Determine whether the response is positive or not and route message back to Brackets side of things
     * @param {Boolean} isFailure Indicates whether we think there was a likely failure
     * @param {String} message   General information to accompany our indicator
     */
    function processResponse(isFailure, message) {

        //log this
        console.log('processResponse(' + isFailure + ', ' + message + '');

        //assume success
        var isSucces = true;

        //perform analysis - more in the future
        if (isFailure) isSucces = false;

        //send a response
        issueResponse(isSucces, message);
    }


    /**
     * Command handler
     * @param {string} ftpScriptFile Fully qualified FTP script file to execute
     */
    function doFtpStdin(cwd, file, data) {

        //log entry
        console.log('doFtpStdin();');

        //orient to node file system
        var fs = require('fs');

        //get directory where we want to store the scripts
        var scriptDirectory = getScriptsDirectory(cwd);

        //create directory if it doesn't exist
        if (!fs.existsSync(scriptDirectory))
            fs.mkdirSync(scriptDirectory);

        //sychronously open file
        console.log('Opening file - ' + scriptDirectory + file);
        var newFile = fs.openSync(scriptDirectory + file, 'w');

        //sychronously write file
        console.log('Writing file data...');
        fs.writeSync(newFile, data);

        //sychronously write file
        console.log('Closing file...');
        fs.closeSync(newFile);

        //run ftp with options to suppress auto login and to supply a script file
        new RunProcess(cwd, 'ftp', ['-ins:' + scriptDirectory + file], function (isFailure, response) {

            //log complete
            console.log('doFtpStdin(); complete');

            //sychronously delete file
            console.log('Deleteing file...');
            fs.unlinkSync(scriptDirectory + file);

            //process the response
            processResponse(isFailure, response);

        });
    }


    /**
     * [[Description]]
     * @param {Boolean} successIndicator Indicates whether or not the processed ended successfully
     * @param {String} msg              Message to accompany the indicator
     */
    function issueResponse(successIndicator, msg) {

        //log this
        console.log('issueResponse(' + successIndicator + ', ' + msg + ');');

        //no real error checking is done for now
        var response = {
            success: successIndicator,
            message: msg
        };

        //send event that the process completed
        globalDomainManager.emitEvent(osFtpDomainName, osFtpDomainMessage, response);
    }


    /**
     * Wrapper for spawning a child process
     * @param {String} cwd      Current working directory command
     * @param {String} cmd      Executable command
     * @param {String} args     Arguments for cmd executable
     * @param {Function} callBack Callback for function complete
     */
    function RunProcess(cwd, cmd, args, callBack) {

        //log our spawn
        console.log('runProcess(' + cwd + ', ...);');

        //initialize variables
        var spawn = require('child_process').spawn;
        var os = require('os');

        var isWindows = (os.platform() == 'win32');

        var newCwd = cwd;

        //alter CWD if windows
        if (isWindows) {

            //switch directory indicator
            newCwd = cwd.replace(/\//g, '\\');

            //log new directory
            console.log('New CWD is - ' + newCwd);

        }

        //build spawn options
        var options = {

            cwd: newCwd,

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
			'pipe', //fs.openSync('out.txt', 'w'), //--- child.stdout is shorthand for stdio[1]
			'pipe' //fs.openSync('err.txt', 'w')  --- child.stderr is shorthand for stdio[3]
			]
        };

        //log our spawn
        console.log('Spawning command: ' + cmd + ' ' + args);

        //spawn
        var child = spawn(cmd, args, options);

        //init response variable
        var isFailure = false;
        var response = '';
        var totalCount = 0;

        //must end input
        child.stdin.end();

        //log if error data present
        child.on('error', function (err) {

            //log error
            console.log('Failed to start child process.' + err.message);

        });

        //listen for data present
        child.stdout.on('data', function (buffer) {

            //get output
            var output = buffer.toString();
            var subOutput = '';
            var count = 0;

            //check for fatal errors
            failureStrings.forEach(function (failMessage) {

                //if stdoutput is at least as long as a failure message
                if (failMessage.length <= output.length) {

                    //substring it for this failure message
                    subOutput = output.substring(0, failMessage.length);

                    //if we match on failure, log this failure response
                    if (failMessage == subOutput) {

                        //console
                        console.error('Fatal script error encountered on -' + subOutput);

                        //append failures until we die
                        response += (subOutput + '  ');

                        //log this failure
                        isFailure = true;

                        //this hurts me more than it hurts you... :(
                        child.kill();

                        //log this
                        console.log('child.kill();');
                    }
                }
            });

            //if stdout is at least as long as a message
            if (SCRIPT_PUT.length <= output.length) {

                //get the current count
                count = (output.match(new RegExp(SCRIPT_PUT, 'g')) || []).length;

                //add to total
                totalCount += count;

                //send event that the process completed
                globalDomainManager.emitEvent(osFtpDomainName, osFtpDomainData, {
                    count: count
                });

            }

            //log output
            console.log('stdout: ' + output);

            //log current total
            console.log('Current total is - ' + totalCount);

        });

        //listen for data present
        child.stderr.on('data', function (buffer) {

            //get output
            var output = buffer.toString();

            //console
            console.error('Fatal script error encountered on -' + output);

            //append failures until we die
            response = output;

            //log this failure
            isFailure = true;

            //this hurts me more than it hurts you... :(
            child.kill();

            //log this
            console.log('child.kill();');

            //log output
            console.log('stderr: ' + output);

        });

        //listen for end of data
        child.stdout.on('end', function () {

            //log that we reached the end
            console.log('child.stdout.on("end");');

        });

        //listen for end of data
        child.stderr.on('end', function () {

            //log that we reached the end
            console.log('child.stderr.on("end");');

        });

        child.on('close', function (code) {

            //log process end
            console.log('Process exited with code ' + code);

            //invoke callback
            callBack(isFailure, response);

        });

    }


    /**
     * Function to get the working directory for the script files
     * @returns {String} The directory where the scripts will go
     */
    function getScriptsDirectory(directory) {

        var directories = directory.split('\/');
        directories.pop();
        directories.pop();
        directories.push('scripts/');
        return directories.join('\/');

    }


}());
