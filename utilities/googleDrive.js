const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
//AIzaSyCVjZzjcduYZ_DoRr2KtFcPISv-TQt7vwA

// service account key file from Google Cloud console.
// const KEYFILEPATH = 'credential.json';

// // Request full drive access.
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// // Create a service account initialize with the service account key file and scope needed
// const auth = new google.auth.GoogleAuth({
//     keyFile: KEYFILEPATH,
//     scopes: SCOPES,
//     clientOptions: {
//         subject: 'jishan9733@gmail.com'
//     }
// });


// const driveService = google.drive({ version: 'v3', auth });

// let fileMetadata = {
//     'name': 'icon.json'
// };
// driveService.files.create({
//     resource: fileMetadata,
//     media: fs.createReadStream('credential.json'),
//     fields: 'id'
// }).then(data=>{
//     switch (data.status) {
//         case 200:
//             let file = data.result;
//             console.log('Created File Id: ', data.data);
//             break;
//         default:
//             console.error(data);
//             break;
//     }
// });



// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const credentials = {
    "installed": {
        "client_id": "362327116008-s84t091me56g2vb812ho3pl0mssfgagn.apps.googleusercontent.com",
        "project_id": "driveapp-359312",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "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",
        "redirect_uris": [
            "http://localhost:8080/admin/u/drive/callback" //put your domain and port
        ]
    }
};

// Load client secrets from a local file.
// fs.readFile('cred.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Tasks API.
authorize(credentials, listConnectionNames);
// });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    console.log(credentials);
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
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
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Print the display name if available for 10 connections.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listConnectionNames(auth) {
    const driveService = google.drive({ version: 'v3', auth });
    
    let fileMetadata = {
    'name': 'icon.json'
};
// driveService.files.create({
//     resource: fileMetadata,
//     media: {
//         mimeType: 'application/json',
//         body: fs.createReadStream('credential.json')
//     },
//     fields: 'id'
// }).then(data=>{
//     switch (data.status) {
//         case 200:
//             let file = data.result;
//             console.log('Created File Id: ', data.data);
//             break;
//         default:
//             console.error(data);
//             break;
//     }
// });

    // function printAbout() {
    //     var request = gapi.client.drive.about.get();
    //     request.execute(function (resp) {
    //         console.log('Current user name: ' + resp.name);
    //         console.log('Root folder ID: ' + resp.rootFolderId);
    //         console.log('Total quota (bytes): ' + resp.quotaBytesTotal);
    //         console.log('Used quota (bytes): ' + resp.quotaBytesUsed);
    //     });
    // }

    // fetch a folder

    // driveService.files.list({
    //     q: 'mimeType=\'application/vnd.google-apps.folder\'',
    //     fields: '*',
    //     spaces: 'drive',
    // }).then(data=>{
    //     if(data.data.files.length > 0) {
    //         console.log("[DLOG] Drive initialized successfully");
    //         console.log(data.data.files[0].id);
    //     }
    //     else{
    //         var folderMetadata = {
    //             'name': "MiFi_ROOT",
    //             'mimeType': 'application/vnd.google-apps.folder'
    //         };
    //         driveService.files.create({
    //             resource: folderMetadata,
    //             fields: 'id'
    //         }).then(data => {
    //             console.log(data.data.id);
    //         }).catch(err => console.log(err));
    //     }
    // }).catch(err => console.log(err));
    
    //  create a folder
    // var folderMetadata = {
    //     'name': "MiFi_ROOT",
    //     'mimeType': 'application/vnd.google-apps.folder'
    // };
    // driveService.files.create({
    //     resource: folderMetadata ,
    //     fields: 'id'
    // }).then(data=>{
    //     console.log(data.data.id);
    // })

    // upload multiple files using multipart
    driveService.files.create({
        resource: fileMetadata,
        media: {
            mimeType: 'application/json',
            body: fs.createReadStream('credential.json')
        },
        fields: 'id'
    }).then(data=>{
        switch (data.status) {
            case 200:
                let file = data.result;
                console.log('Created File Id: ', data.data);
                break;
            default:
                console.error(data);
                break;
        }
    }
}

