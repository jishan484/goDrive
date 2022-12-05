let Drive = require('../utilities/driveUtil/index');
let async = require('async');
let driveutil = new Drive();
driveutil.init();
let drive = null;

setTimeout(() => {
    // all tests sequentially
    drive = driveutil.getDrive(100).drive;
    // console.log(drive);
    // print access token
    let res1,res2;
    uploadFileTest().then((res)=>{
        res1 = res;
        uploadFileTest().then((res)=>{
            res2 = res;
            deleteFileTest(res1,res2);
        });
    });
}, 8000);


function uploadFileTest(){
    return new Promise(async (resolve,reject)=>{
        let fs = require('fs');
        let path = require('path');
        let filePath = path.join(__dirname,'/testText.txt');
        drive.writeFile('test.txt', 'text/plain', fs.readFile(filePath),(status,res)=>{
            if(!status) reject(status);
            else resolve(res);
        });
    });
}

function deleteFileTest(res1,res2){
    var arrayOfFileIds = [res1.id,res2.id];
    // async.eachSeries(arrayOfFileIds, function(fileId, callback) {
    //     drive.deleteFile(fileId,(status,res)=>{
    //         if(!status) callback(status);
    //         else callback();
    //     });
    // }, function(err) {
    //     if(err) console.log(err);
    //     else console.log('All files deleted');
    // });


    var authToken = drive.auth.credentials.access_token;  //your OAuth2 token.
    var boundary = "END_OF_PART";
    var separation = "\n--" + boundary + "\n";
    var ending = "\n--" + boundary + "--";

    var requestBody = arrayOfFileIds.reduce((accum, current) => {
        accum += separation +
            "Content-Type: application/http\n\n" +
            "DELETE https://www.googleapis.com/drive/v3/files/" +current +
            "\nAuthorization: Bearer " + authToken;
        return accum;
    }, "") + ending;
    console.log(requestBody);
    var request = require('request');
    request({
        url: "https://www.googleapis.com/batch/drive/v3",
        method: "POST",
        headers: {
            "Content-Type": "multipart/mixed; boundary=" + boundary,
        },
        body: requestBody
    }, function (err, res, body) {
        console.log(body);
    }
    );
}