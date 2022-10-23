const express = require('express');
const router = express.Router({ mergeParams: true });
const fileService = require("./../../../service/fileService");
const log = require('../../../service/logService/index.js');


router.get('/', getFile);
router.get('/download', downloadFile); //download file/s by id or (filename and folder name)
router.post('/', uploadFile);
router.delete('/',deleteFile);

module.exports = router;



// MiddleWares:


function getFile(req, res) {
    req.body = req.query;
    fileService.getFiles(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    });
}

function uploadFile(req, res) {
    req.body.fileName = req.headers['m-filename'];
    req.body.filePath = req.headers['m-filepath'];
    req.body.checkDuplicate = req.headers['m-chkdup'];
    req.body.fileType = (req.headers['m-mimetype']=='')?'application/octet-stream':req.headers['m-mimetype'];
    req.body.fileSize = parseInt(req.headers['content-length']);

    if (req.body.fileName == undefined || req.body.fileName == null || req.body.fileName == "") {
        res.status(400).json({ status: 'error', data: null, error: "m-filename header is required", code: '400' });
        return;
    }
    if (req.body.filePath == undefined || req.body.filePath == null || req.body.filePath == "") {
        res.status(400).json({ status: 'error', data: null, error: "m-foldername header is required", code: '400' });
        return;
    }
    if (req.body.fileType == undefined || req.body.fileType == null) {
        res.status(400).json({ status: 'error', data: null, error: "m-mimetype header is required", code: '400' });
        return;
    }
    req.on('close',()=>{
        req.unpipe();
    });
    fileService.uploadFile(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function downloadFile(req,res){
    req.setTimeout(35000);
    let timeout = setTimeout(()=>{
        log.log("error", "File download timeout : " + req.query.fileId +" : fileName : " + req.query.fileName);
    },34900);
    req.body = req.query;
    fileService.downloadFile(req,(status,data)=>{
        clearTimeout(timeout);
        if (status) {
            res.set('Content-Disposition',' attachment; filename="'+req.body.fileName+'"');
            res.set('Content-Length', req.body.fileSize);
            data.pipe(res);
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}


function deleteFile(req , res){
    fileService.deleteFile(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}