const express = require('express');
const router = express.Router({ mergeParams: true });
const appControlService = require("./../../../service/controls");

router.get('/', getStatus);

module.exports = router;


// MiddleWares:


function getStatus(req, res) {
    appControlService.getStatus((status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    })
}

module.exports = router;