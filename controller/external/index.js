const express = require('express');
const router = express.Router({ mergeParams: true });
const fileService = require("./../../service/fileService");
const log = require('../../service/logService/index.js');


router.get("/v1/download/:tokenId", downloadFile);
router.use("/v1/file", getSharedFile);
router.get("/v1/request/:tokenId", getRequestedFileInfo)

module.exports = router



// ============== middleware ================== //



function downloadFile(req, res) {
    req.query.fileId = req.params.tokenId;
    req.setTimeout(35000);
    let timeout = setTimeout(() => {
        log.log("error", "File download timeout : " + req.query.fileId);
    }, 34900);
    req.body = req.query;
    req.connection.setNoDelay(true);
    res.connection.setNoDelay(true);
    fileService.downloadFileExternally(req, (status, data) => {
        clearTimeout(timeout);
        if (status) {
            res.set('Content-Disposition', ' attachment; filename="' + req.body.fileName + '"');
            res.set('Content-Length', req.body.fileSize);
            data._readableState.highWaterMark = 320000;
            data._writableState.highWaterMark = 320000;
            res.socket._readableState.highWaterMark = 320000;
            res.connection._readableState.highWaterMark = 320000;
            res.socket._writableState.highWaterMark = 320000;
            res.connection._writableState.highWaterMark = 320000;

            data.pipe(res);
            res.on('close', () => {
                data.unpipe();
                data.end();
            });
            res.on('finish', () => {
                data.unpipe();
                data.end();
            });
        } else {
            res.status(404).json({ status: 'error', data: null, error: data, code: '404' }).end();
        }
    });
}

function getSharedFile(req,  res) {
    fileService.getSharedFiles(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();            
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '404' }).end();
        }
    });
}

function getRequestedFileInfo(req, res) {
    req.body = req.params;
    fileService.getMyRequests(req, (status, data)=>{
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();            
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '404' }).end();
        }
    });
}