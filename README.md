# js-osFtp
Brackets extension using OS ftp service.  Native OS FTP services are more robust and work well when other extensions fall short, 
for example, not existing Bracket's FTP extension can FTP propertly to and from z/OS.

Use F12 for debugging.

Right click a file (not a directory) in the Working file set or Project set and 'New Ftp Site...'

| -------- | --------------------------------------------------------------------------------------------------------- |
| Name     | name for the site                                                                                         |
| Host     | host name, to specify a port use a space between hostname and port without quotes (e.g. hostname port)    |
| Root     | Remote directory to ftp to                                                                                |
| User     | User name                                                                                                 |
| Password | Password                                                                                                  |

Right click a file (not a directory) in the Working file set or Project set and select the site you added.  This builds
a script file in the extension directory and executes the script.

- OR -

Create an FTP script file like (you must specify the keyword 'user' since autologin is supressed):

    op some_host
    user 
    some_user 
    some_password
    prompt
    ...
    quit
  
Right click a file (not a directory) in the Working file set or Project set and 'Run as FTP Script'