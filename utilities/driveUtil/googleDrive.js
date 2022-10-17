const Storage = require("./storage.js");
const log = require("../../service/logService");
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

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

// this function checks for credential.json file inside /CREDENTIALS folder.
// if exist (use that one)
// else use this common credential and redirect to mifi.eu.org for smooth wild card 
// redirection [GOOGLE DOES NOT ALLOW TO DO THAT, it has to be registered, So using this method]
function credentials_initialize(){
    let status = fs.existsSync(path.join('CREDENTIALS/google.json'));
    let cred = fs.readFileSync(path.join('CREDENTIALS/google.json'));
    try{
        cred = JSON.parse(cred);
        credentials = cred;
    }catch(e){
        log.log('error','Google oAuth2 credential found! But there is a error in JSON format!');
    }
}
credentials_initialize();

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
            prompt:'consent',
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
            this.auth.setCredentials(this.token);
            this.driveService = google.drive({ version: 'v3', auth: this.auth });
            this.driveService.about.get({
                fields: 'user,storageQuota'
            }).then(data => {
                callback(true, token, data.data.user.emailAddress);
            }).catch(err => {
                callback(false, 'Failed to fetch drive information!');
                log.log("error",err);
            });
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
            this.displayName = data.data.user.emailAddress;
            this.freeSpace = (data.data.storageQuota.limit - data.data.storageQuota.usage);
            // this.freeSpace = (this.displayName[0] == 'd') ? 10000000 : 1000; // for chunk upload test only
            this.storageInfo.image = data.data.user.photoLink;
            this.storageInfo.displayName = data.data.user.displayName;
            this._setup(callback);
        }).catch(err => log.log("error",err));
    }

    _setup(callback){
        this.driveService.files.list({
            q: 'mimeType=\'application/vnd.google-apps.folder\'',
            fields: '*',
            spaces: 'drive',
        }).then(data => {
            if (data.data.files.length > 0) {
                log.log("debug", "Drive ["+ this.displayName+ "] initialized successfully");
                this.parentFolderId = data.data.files[0].id;
                callback(true);
            }
            else {
                var folderMetadata = {
                    'name': "MiFi_ROOT",
                    'mimeType': 'application/vnd.google-apps.folder'
                };
                this.driveService.files.create({
                    resource: folderMetadata,
                    fields: 'id'
                }).then(data => {
                    this.parentFolderId = data.data.id;
                    callback(true);
                }).catch(err => log.log("error",err));
            }
        }).catch(err => {log.log("error",err);});
    }

    writeFile(fileName,mimeType,fileData, callback)
    {
        let fileMetadata = { 'name': fileName, parents: [this.parentFolderId] };
        var a = this.driveService.files.create({
            resource: fileMetadata,
            media: {
                mimeType: mimeType,
                body: fileData
            },
            fields: 'id,size,mimeType,name'
        }).then(data => {
            if (data.status === 200) {
                callback(true,data.data);
            }
            else {
                callback(false,data.data);
            }
        }).catch(err => {
            if(err.code == 408) {
                log.log('info','user cancelled file upload! : '+fileName);
            } else {
                log.log('error', err);
            }
            callback(false, err);
        });
    }


    readFile(nodeId, callback){
        this.driveService.files.get({
            fileId:nodeId,
            alt: 'media'
        }, { responseType: 'stream' }).then(res=>{
            callback(true,res.data);
        }).catch(err=>{
            log.log('error', err);
            callback(false, err);
        });
    }

    deleteFile(nodeId , callback , option){
        if(option != undefined && option.trashed){
            return this.moveToTrash(nodeId,callback);
        }
        this.driveService.files.delete({
            fileId: nodeId
        }).then(res => {
            callback(true, res.data);
        }).catch(err => {
            callback(false, err);
            log.log('error', err);
        });
    }
    
    
    moveToTrash(nodeId , callback){
        this.driveService.files.update({
            "fileId": nodeId,
            "trashed": true
        }).then((res)=>{
            callback(true,'File moved to trash!')
        }).catch(err => {
            log.log('error', err);
            callback(false, err);
        });
    }

    getInfo(){

    }
}