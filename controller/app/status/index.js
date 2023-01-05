const express = require('express');
const router = express.Router({ mergeParams: true });
const statusService = require('./../../../service/statusService')


router.get('/storage', getFolder);

module.exports = router;



// MiddleWares:


function getFolder(req, res) {
    req.body = req.query;
    statusService.getTotalUsedSpace(req, (status, result) => {
        if (status) {
            res.status(200).json({ status: 'success', data: result, error: null, code: '200' }).end();
        } else {
            res.status(402).json({ status: 'error', data: null, error: data, code: '204' }).end();
        }
    });
}
