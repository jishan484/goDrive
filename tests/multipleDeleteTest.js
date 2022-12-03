let Drive = require('../utilities/driveUtil/index');
let async = require('async');
let driveutil = new Drive();
driveutil.init();
let drive = null;

setTimeout(() => {
    // all tests sequentially
    drive = driveutil.getDrive(100).drive;
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
    async.eachSeries(arrayOfFileIds, function(fileId, callback) {
        drive.deleteFile(fileId,(status,res)=>{
            if(!status) callback(status);
            else callback();
        });
    }, function(err) {
        if(err) console.log(err);
        else console.log('All files deleted');
    });

}