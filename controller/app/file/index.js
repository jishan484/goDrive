const express = require('express');
const router = express.Router({ mergeParams: true });
const fileService = require("./../../../service/fileService");
const log = require('../../../service/logService/index.js');


router.get('/', getFile);
router.get('/download', downloadFile); //download file/s by id or (filename and folder name)
router.post('/', uploadFile);
router.patch('/', updateFile);
router.delete('/', deleteFile);
router.post('/share', shareFile);
router.delete('/share', cancelSharedFile);
router.get('/request', getMyRequests);
router.post('/request', requestFile);
router.delete('/request/:tokenId', deleteFileRequest);

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
    req.body.fileType = (req.headers['m-mimetype'] == '') ? 'application/octet-stream' : req.headers['m-mimetype'];
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
    req.on('close', () => {
        req.unpipe();
    });
    fileService.uploadFile(req, (status, data, code = 502) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.set("connection", "close");
            res.status(code).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function downloadFile(req, res) {
    req.setTimeout(35000);
    let timeout = setTimeout(() => {
        log.log("error", "File download timeout : " + req.query.fileId + " : fileName : " + req.query.fileName);
    }, 34900);
    req.body = req.query;
    if (req.headers.range) req.body.range = req.headers.range;
    req.connection.setNoDelay(true);
    res.connection.setNoDelay(true);
    fileService.downloadFile(req, (status, data) => {
        clearTimeout(timeout);
        if (status && !req.body.range) {
            res.set('Content-Disposition', ' attachment; filename="' + req.body.fileName + '"');
            res.set('Content-Length', req.body.fileSize);
            res.set('Accept-Ranges', 'bytes');
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
        } else if (status && req.body.range) {
            res.set('Content-Disposition', ' attachment; filename="' + req.body.fileName + '"');
            const rangeMatch = req.body.range.match(/bytes=(\d+)-(\d+)?/);
            if (rangeMatch) {
                let startByte = parseInt(rangeMatch[1], 10);
                let endByte = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : req.body.fileSize - 1;
                res.set('Content-Range', `bytes ${startByte}-${endByte}/${req.body.fileSize}`);
                const contentLength = endByte - startByte + 1;
                res.set('Content-Length', contentLength);
            }
            res.set('Accept-Ranges', 'bytes');
            res.status(206);
            data.pipe(res);
            res.on('close', () => {
                data.unpipe();
            });
            res.on('finish', () => {
                data.unpipe();
            });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}


function deleteFile(req, res) {
    fileService.deleteFile(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function updateFile(req, res) {
    fileService.updateFile(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function shareFile(req, res) {
    fileService.saveSharedFiles(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function cancelSharedFile(req, res) {
    fileService.cancelSharedFiles(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function requestFile(req, res) {
    fileService.initRequestFile(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function getMyRequests(req, res) {
    req.body = req.query;
    fileService.getMyRequests(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}

function deleteFileRequest(req, res) {
    req.body = req.params;
    fileService.deleteFileRequest(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' }).end();
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}