# js-osFtp

This Brackets extension uses native OS FTP clients to perform FTP.  You can even FTP to a mainframe!  

Native OS FTP services are more robust and work well when other FTP clients / extensions fall short.  At the time this extension was created, no existing Bracket's FTP extension could propertly FTP to and from z/OS.

### Features
* Uploads individual files or complete directory structures to a remote site root path.  
* Local directory structure is replicated and maintained in the same fashion on the remote site root path.  
* Allows for explicit setting of transfer types for a given file extension
* Allows for executing your own FTP scripts

### Installation
Install via the Brackets Extension  Manager or clone / fork with Git.

To install using Git:
* Use ‘Help’ -> ‘Show Extensions Folder’.  
* Open the ‘user’ folder.  
* Copy this path and CD to it in Git CMD.  
* git clone https://github.com/dkelosky/js-osFtp.git
* Restart Brackets.  

### Limitations
* Only basic error checking is performed.  Verify your first FTP for a newly defined site.
* Retrieval from a remote site is not yet implemented.
* FTP to a remote Windows machine is not supported
* FTP from Linux is not supported

--- 
## FTP Files to a Remote Destination

Right click a file in the Working file set or Project set and 'New Ftp Site...'

### Create a Site

![alt text][newFtpSite]

Fill in the dialog:

![alt text][addFtpSite]

The dialog input field descriptions  are:

| Input       | Description                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Site Name   | name for the site                                                                                         |
| Host        | host name, to specify a port use a space between hostname and port without quotes (e.g. `hostname port`)  |
| Root        | Remote directory to ftp to                                                                                |
| User        | User name                                                                                                 |
| Password    | Password                                                                                                  |
| Server Type | Option remote server OS used in conjunction with "Set permission" to attempt CHMOD against files.         |

### FTP to a Created Site

Right click a file in the Working file set or Project set and select the site you added.  This builds
a script file in the extension directory and executes the script:

![alt text][runSite]

### View Status

You can observe the status by the "OS FTP" status bar notification area.  
* White text means no FTP is in progress
* Orange text means FTP is in progress.
* Green text means FTP has completed without any known errors.
* Red text means FTP has completed with errors.  You should also see an error dialog presented to you.

Otherwise, F12 will should the complete log of FTP script statements that have been executed. 

![alt text][status]

### Upload Selection

You will receive a confirmation prompt if attempting to upload an entire directory.  You can use this prompt to de-select 
files from the FTP.

![alt text][directoryUpload]

---

## Run Your Own FTP Script

Create an FTP script file like the following example supplying your own user name and password for myUserName and myPassword respectively and altering the local directory (lcd) and remote directory (cd) to the desired local and remote locations.

Note: The ftp executable is invoked with the -ins options so autologin is suppressed (you must specify the keyword 'user') and interactive mode is defaulted to be OFF:

    open 192.168.0.106
    user 
    myUsername
    myPassword
    lcd C:\Users\myUser\dev
    cd dev
    mput *
    quit
  
Right click a file (not a directory) in the Working file set or Project set and 'Run as FTP Script'

---

## Settings

Add file extensions to control FTP as ASCII or binary.  See File->OS FTP Settings...

![alt text][settings]

[newFtpSite]: https://github.com/dkelosky/js-osFtp/blob/master/images/newFtpSite.PNG "New Ftp Site..."
[addFtpSite]: https://github.com/dkelosky/js-osFtp/blob/master/images/addFtpSite.PNG "Add Ftp Site"
[runSite]: https://github.com/dkelosky/js-osFtp/blob/master/images/runSite.PNG "Run Site"
[settings]: https://github.com/dkelosky/js-osFtp/blob/master/images/settings.PNG "Settings"
[directoryUpload]: https://github.com/dkelosky/js-osFtp/blob/master/images/directoryUpload.PNG "Directory Upload"
[status]: https://github.com/dkelosky/js-osFtp/blob/master/images/status.PNG "Status"
