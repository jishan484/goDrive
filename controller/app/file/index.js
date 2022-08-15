const express = require('express');
const router = express.Router({ mergeParams: true });
const fileService = require("./../../../service/fileService");
const Drive = require("./../../../utilities/drive.js");

var drive = new Drive();


router.get('/', getFile); //download file/s by id , filename and folder name
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

    drive.writeFile(req.body.fileName, req.body.fileType, req, (data,err) => {
        if (err) {
            res.status(200).json({ status: 'error', data: null, error: err, code: '204' });
        } else {
            req.body.nodeId = data.id;
            req.body.fileSize = data.size;
            fileService.saveFile(req, (status, data) => {
                if (status) {
                    res.status(200).json({ status: 'success', data: "data", error: null, code: '200' });
                } else {
                    res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
                }
            });
        }
    });
}