# js-osFtp

This Brackets extension uses native OS services for FTP.  Native OS FTP services are more robust and work well when other extensions fall short, 
for example, at the time this was created, no existing Bracket's FTP extension could propertly FTP to and from z/OS.

--- 
## FTP Files to a Remote Destiniation

Right click a file (not a directory) in the Working file set or Project set and 'New Ftp Site...'

| Input    | Description                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------- |
| Name     | name for the site                                                                                         |
| Host     | host name, to specify a port use a space between hostname and port without quotes (e.g. `hostname port`)  |
| Root     | Remote directory to ftp to                                                                                |
| User     | User name                                                                                                 |
| Password | Password                                                                                                  |

Right click a file (not a directory) in the Working file set or Project set and select the site you added.  This builds
a script file in the extension directory and executes the script.

---

## Run Your Own FTP Script

Create an FTP script file like (you must specify the keyword 'user' since autologin is supressed):

    op some_host
    user 
    some_user 
    some_password
    prompt
    ...
    quit
  
Right click a file (not a directory) in the Working file set or Project set and 'Run as FTP Script'
