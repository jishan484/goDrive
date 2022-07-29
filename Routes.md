#### API NAMES and methods


| API | GET | POST | PUT  | DELETE | DEVELOPED | TESTED |
| :----- | :-: | :-: | :-: | :-: | :-: | :-: |
| /portal/auth | Yes | Yes | Yes | Yes | No | No |
| /portal/v/user/:id | Yes | No | No | No | No | No |
| /portal/v/profile | Yes | No | Yes | No | No | No |
| /portal/v/user/config | Yes | Yes | Yes | No | No | No |
| /portal/v/folder | Yes | Yes | Yes | Yes | No | No |
| /portal/v/file | Yes | Yes | Yes | Yes | No | No |
| /portal/v/file/share | Yes | Yes | Yes | Yes | No | No |
| /portal/v/statistic | Yes | Yes | No | No | No | No |
| /portal/v/ftp | Yes | No | Yes | No | No | No |
| /common/config | Yes | No | Yes | No | No | No |
| /common/content | Yes | No | Yes | No | No | No |



### /common/content
This API is used to get customized content from the server. the POST and PUT methods are only accessible by the admin users. Content like Company Name , Company Logo , welcome message , Helps and FAQs , etc can be retrieved from this API.

### /common/config
This API is used to get customized configuration like Current allowed file types , allowed services , allowed common routes (eg: /register , /contact , /ANY_CUSTOM_PAGE_URL) , system version , Current system build number , Current system build date etc.
Only the `ROOT admin` user can have POST and PUT method for this API.

NOTE : System should have a global configuration and content variables to store the current system configuration and content from DB at the string of the app.
check /service/config.js for the implementation.
To minimize the DB queries, the system should store the current system configuration and content in the primary memory.



User-story: #1
[]: # Log-in process
-> User should be able to log-in to the system using his/her email and password or through SSO login. System Admin can also log-in using SSO login. Admin can chage the SSO login provider details (eg API key , endpoint etc) from the admin panel.

SSO login providers are :
1. Google
2. Microsoft

User-story: #2
[]: # Register process
-> Root Admin can allow new users to register to the system. By default the new user can create account and can log-in to the system. Admins with the `USER_CREATE` permission can also create new users from admin panel. If a new user creates an account, he/she will have only `USER_L1` permission.

please check the `Permission.md` file for more details.


User-story: #3
[]: # User profile process
-> User can update his/her profile details. User can also change his/her password.


User-story: #4
[]: # File upload / download process / folder creation and deletion process
-> Users with `USER_L1` permission can upload files to the system. Users can also download files from the system.
Users with `USER_L1` permission can also create and delete folders in the system.
All users and non-users should have file / folder download permission which is set as 'SUPER_PUBLIC' by default.
Example for the UI url /download/:id?v=123&shareId=1234ASERTVBNHJ345ERTV56HJ78?type=compress.
please refer to the `UI-element.md` file for more details.


User-story: #5
[]: # File share process
-> Users with `USER_L2` permission can share files with other users. Users can also unshare files with other users. Users can also view the shared files.
