const express = require('express');
const router = express.Router({ mergeParams: true });
const fileService = require("./../../../service/fileService");


router.get('/', getFile);
router.get('/download', downloadFile); //download file/s by id or (filename and folder name)
router.post('/', uploadFile);

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
    req.body.fileType = (req.headers['m-mimetype']=='')?'application/octet-stream':req.headers['m-mimetype'];
    req.body.fileSize = req.headers['content-length'];

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

    fileService.uploadFile(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function downloadFile(req,res){
    req.body = req.query;
    console.log(req.body.fileId)
    fileService.downloadFile(req,(status,data)=>{
        if (status) {
            res.set('Content-Disposition',' attachment; filename="'+req.body.fileName+'"');
            res.set('Content-Length', req.body.fileSizeX);
            console.log(req.body.fileSizeX, req.body.fileName, req.body.fileType)
            data.pipe(res);
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    })
}