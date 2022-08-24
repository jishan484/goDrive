const Storage = require("./storage.js");
const log = require("../../service/logService");
const { google } = require('googleapis');

const credentials = {
    "installed": {
        "client_id": "362327116008-s84t091me56g2vb812ho3pl0mssfgagn.apps.googleusercontent.com",
        "project_id": "driveapp-359312",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "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",
        "redirect_uris": [
            "http://localhost:80/admin/u/drive/callback" //put your domain and port
        ]
    }
};

let SCOPES= ['https://www.googleapis.com/auth/drive.file'];

module.exports = class GoogleDrive extends Storage{
    constructor(token, redirectURL){
        super("googleDrive");
        this.token = token;
        this.parentFolderId = null;

        if(redirectURL != undefined && redirectURL != null){
            credentials.installed.redirect_uris[0] = redirectURL +"/admin/u/drive/callback";
        }
        let { client_secret, client_id, redirect_uris } = credentials.installed;
        this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        this.driveService = null;
    }

    // initialize the google drive service with new token
    init(){
        return this.auth.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
    }

    // get token from response and initialize the google drive service
    initListeners(code , callback){
        this.auth.getToken(code, (err, token) => {
            if (err) {
                log.log('error',err);
                callback(false, 'Error retrieving access token');
                return;
            }
            this.token = token;
            callback(true, token);
        });
    }

    // prepare the storage for use and get the drive info
    setup(callback){
        // create the driveService object , fetch drive Info and create the default folder if not exists
        this.auth.setCredentials(this.token);
        this.driveService = google.drive({ version: 'v3', auth:this.auth });

        this.driveService.about.get({
            fields: 'user,storageQuota'
        }).then(data => {
            this.displayName = data.data.user.displayName;
            this.freeSpace = (data.data.storageQuota.limit - data.data.storageQuota.usage);
            this.storageInfo.image = data.data.user.photoLink;
            this.storageInfo.email = data.data.user.emailAddress;
        }).catch(err => log.log("error".err));

        this.driveService.files.list({
            q: 'mimeType=\'application/vnd.google-apps.folder\'',
            fields: 'id,name',
            spaces: 'drive',
        }).then(data => {
            if (data.data.files.length > 0) {
                log.log("debug", "Drive [",this.displayName,"] initialized successfully");
                this.parentFolderId = data.data.files[0].id;
                callback(true);
            }
            else {
                var folderMetadata = {
                    'name': "MiFi_ROOT",
                    'mimeType': 'application/vnd.google-apps.folder'
                };
                driveService.files.create({
                    resource: folderMetadata,
                    fields: 'id'
                }).then(data => {
                    this.parentFolderId = data.data.id;
                    callback(true);
                }).catch(err => log.log("error".err));
            }
        }).catch(err => log.log("error".err));
    }

    writeFile(fileName,mimeType,fileData, callback)
    {
        let fileMetadata = { 'name': fileName };
        this.driveService.files.create({
            resource: fileMetadata,
            media: {
                mimeType: mimeType,
                body: fileData
            },
            fields: 'id,size,mimeType,name'
        }).then(data => {
            if (data.status === 200) {
                callback(data.data, null);
            }
            else {
                callback(data.data, true);
            }
        }).catch(err => {
            log.log('error',error);
            callback(null, err);
        });
    }


    readFile(nodeId, callback){
        let fileMetadata = { 'fileId': nodeId };
        this.driveService.files.get({

        });
    }

    deleteFile(nodeId , callback){

    }

    getInfo(){

    }
}