const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');


class Drive{
    constructor(){
        this.tokenLocation = __dirname+"/token.json";
        this.scope = "https://www.googleapis.com/auth/drive.file";
        this.credentials = __dirname+"/cred.json";
        this.auth = null;
    }
    authorize(credentials) {
        
    }
    getNewToken(oAuth2Client) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scope,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(this.tokenLocation, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', this.tokenLocation);
                });
                this.auth = oAuth2Client
            });
        });
    }


    getFile(fileId){
        //
    }

    writeFile(fileName,mimeType,fileData,callback){
        
        let contentS = JSON.parse(fs.readFileSync(this.credentials));

        const { client_secret, client_id, redirect_uris } = contentS.installed;
        const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        auth.setCredentials(JSON.parse(fs.readFileSync(this.tokenLocation)));

        const driveService = google.drive({ version: 'v3', auth });
        let fileMetadata = {
            'name': fileName
        };
        
        driveService.files.create({
            resource: fileMetadata,
            media:{
            mimeType: mimeType,
            body: fileData
        },
            fields: 'id'
        }).then(data => {
            callback(data,null);
        }).catch(err => {
            callback(null,err);
        });
    }
}

module.exports = Drive;