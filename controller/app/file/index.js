const express = require('express');
const router = express.Router({ mergeParams: true });
const folderService = require("./../../../service/folderService");
const Busboy = require('busboy');
const Drive = require("./../../../utilities/drive.js");

var drive = new Drive();


router.get('/', getFile); //download file/s by id , filename and folder name
router.post('/',(req,res)=>{
    var busboy = Busboy({
        headers: req.headers
    });
    
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        drive.writeFile(filename, file);
    });
    busboy.on('finish', function () {
        res.end("That's all folks!");
    });
    return req.pipe(busboy);
}); //upload file/s: folder name is required

module.exports = router;



// MiddleWares:


function getFile(req, res) {
    res.status(200).json({ status: 'success', data: "result", error: null, code: '200' });
}

function uploadFile(req, res, next){
    
}