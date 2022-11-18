|||
    +++cant be changed but visible
    ---cant be accessed by end user
    -+-sysaccuser can allow view/edit based on situation and user config
|||
Metadata for files
-------------------------------
filename
filesize
filetype
fileformat
+++upload date time
+++uploaded by
last access date time
modified date time
---location
+++nodeId
+++nodeURL
-+-accesses [r w d] [ read-only files can be deleted by sysmonuser(Default user for system monitoring)]
priority [temp parma super]
parent folder [id only]
---encription type
---encription key
+++part details [comma separated] [ max 5 part , minimum 2]
image EXIF JSON [only for images : filetype must have to be image/*]


metadata for folders
------------------------------------
id [78*****000000 ] [* will be replaced by random chars]
folder name
-+-folder description [sys created folder description cant be changed]
folder comment
parent folder
root folder
location
+++creation date
+++last uploaded
+++modified date
+++number of files
+++created by
-+-permissions [shareable , hidden , renameable , locked , compressable , cloneable(copy)] [cut or move will be dependable on write access]
-+-access [r w d]
-+-size
folder color


---------------------------------
system design high level : TODO : TESTING IN PROGRESS
---------------------------------
it devides files in multiple parts. number of parts depends on number of active gdrive account linked.
app encrypts every part with two different keys.
    1. a fixed system generated key(defKey) : not stored db.
    -> sys stores it in a .env file
    -> a backup will be provided to user encripted by a master password
    -> master password cant be storend in any places : so cant be recoverd
    -> if you are not storing defKey then you have to pass that key every time you logged in. a slated hash of that key will be stored in db to check if it is valid.
    2. a ramdomly ganerated key(singleKey)
    -> key will be combined with defKey to encrypt / decript a single file
    -> a copy of singleKey and parts link will be stored in all the gdrive nodes `sysEncTable` folder with same name of the file and current part link details seperated by `.|.`. extension will be `.encd`

-----------------------------------
file parts
-----------------------------------

-----------------------------------
risk and mitigation
-----------------------------------
1. in the event of db leak
    as defKey is not stored in db files cant be decripted. but all file details are visible to hackes
2. in the event of db lost
    if there is no db backup taken, user can decrypt and recover all files based on locally stored encriptrd defKey and singleKey stored in `sysEncTable` folder. process will be shared latter.
3. in the event of db and server hack [not likely it will happen if user is not using proper security mesure]
    then nothing cant be done. [If you know at the right time then lock the system using admin user]
    locking the system will delete all node delails , will delete .env.
    Then updated gdrive details as soon as possible.
    * please only allow port 80 and 443 to access the system. no other ports are required.
    * dont use shared server for this system.
    * if you are using shared server then dont store defKey. if you are not storing defKey then you have to pass that key every time you logged in. a slated hash of that key will be stored in db to check if it is valid.













    --------------------problems / bugs----------------------
    1. In multi node server, the free space of a drive could cause problem, if multiple clients start uploading big file at a same time.
    FIX: add a 2nd param [in-use-space] and put the size of currently uploading file sizes.
         Substract this value for thye next file upload process.
         if a upload gets cancelled, substact that value from [in-use-space].
         On success substact that value from [in-use-space] and add it to [freeScace] param.
    [TODO]{EST:7 days}
    priority: low

    2. drive not initialize if one of them failed! [HIGH]{ETA:3 days}
    3. Add email verification process during user registration...
        This could be optional and admin has to setup SMTP details for that.






    -------------------------planning----------------
    1. create .well-known routes for ssl validation.
        -> not planned : no ETA
    2. create POST admin/api/u/ssl for importing prv & cert.
        -> not planned : no ETA





mkdir -p cert && sudo certbot certonly --manual --config-dir ./cert --work-dir ./cert && echo cert/fullchain.pem && echo '-----private key-----\n\n' && echo cert/privkey.pem




----------------next ticket-------------------

put 'and owner = ?' condition first.....
Rename , move and delete folder functionality
    logics are same for all. It has to be done recursively for all subfolders...

    during folder rename or move... all subfolders will be effected recursively, so the files of those sub folders. Fix: remove filePath params 
    and during fetch query get the folder id using (SELECT folderId FROM Folders where fullPath = ? and owner = ?) subquery. That way dont  have to update files location also.




Repair Failed faile operation: [TODO]
    -> There should be a job to look into this issue:
    scope: Job will look into the particular drive:
        if it is down -> send mail to admins
        if drive is up but file not present there ->manual checkup required
        ....
    table details:
        id, action, driveId, nodeId, type(full,chunk), otherInfo, status
    if status is cleard -> record can be deleted from DB
    if status is checked -> job will not pickup for 2nd time, manual checkup needed
    for other status job can look into that...
    job frequency -> 1 run in 24h


----------------next task------------------
FEATURE: folder upload
-> create all the folders and subfolders at once
-> upload all the files at once [ TODO ][ NF ]
-> resumable upload , so recreate the session if it is expired, ask only password from user, and send a token to 
   check the chalanges in client side.

   ---bug UI---
   put onclick event on the folder/file input field, so that user can select the same file again and again in diffrent folder location.