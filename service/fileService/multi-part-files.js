const log = require('../logService');
const driveService = require('../driveService');
const Busboy = require('../../utilities/busboy');

log.log("debug", "Multipart Files uploader service initialized!");


var fileDetails = new Map();
var folderPath = "";
var lastUploaded = 0;
var _status = true;
var _response = "Files successfully uploaded!";
const logMessageLimited = limiter((file,callback)=>{
    driveService.uploadFile(file,callback);
}, 650);


class MultiPartUploader{
    
    constructor(){
        folderPath = "";
        fileDetails = new Map();
        _status = true;
        _response = "Files successfully uploaded!";
        lastUploaded = 0;
    }

    uploadMultiPart(req, callback, finalCallback){
        let busboy = Busboy({ headers: req.headers,highWaterMark: 256,writableHighWaterMark: 256 });
        busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
            if(fieldname == "fileDetails"){
                fileDetails = new Map();
                let fileDetail = JSON.parse(val);
                for(let i=0;i<fileDetail.length;i++){
                    fileDetails.set(fileDetail[i][0], fileDetail[i][1]);
                }
            } else if (fieldname == "folderPath"){
                folderPath = val;
            }
        });

        


        busboy.on('file', async function(fieldname, file, filename) {
            
            file.body = {};
            file.headers = {};
            file.body.fileName = filename.filename;
            file.body.mimetype = filename.mimeType;
            file.body.filePath = filename.filePath;
            if (new Date().getTime() - lastUploaded > 10)
                console.log(file.body.fileName,new Date().getTime() - lastUploaded);
            lastUploaded = new Date().getTime();
            file.body.fileSize = fileDetails.get(filename.filePath + '/' + filename.filename);
            file.headers['content-length'] = file.body.fileSize;
            file.body.fileType = file.body.mimetype;
            file.body.filePath = folderPath+'/'+filename.filePath;
            // file.on('data', function(data) {});
            logMessageLimited(file, (status, response) => {
                if (status) {
                    // console.log(response);
                    callback(status, file);
                } else {
                    // file.resume();
                    _status = false;
                    _response = response;
                    console.log(_response);
                }
            });
        });
        req.pipe(busboy);
        busboy.on('finish', function () {
            console.log('Done parsing form!',_status,_response);
            finalCallback(_status, _response);
        });
    }

}



function limiter(fn, wait) {
    let isCalled = false,
        calls = [];

    let caller = function () {
        if (calls.length && !isCalled) {
            isCalled = true;
            calls.shift().call();
            setTimeout(function () {
                isCalled = false;
                caller();
            }, wait);
        }
    };

    return function () {
        calls.push(fn.bind(this, ...arguments));

        caller();
    };
}

module.exports = MultiPartUploader;