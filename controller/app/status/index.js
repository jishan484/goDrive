const express = require('express');
const router = express.Router({ mergeParams: true });


router.get('/', getFolder);

module.exports = router;



// MiddleWares:


function getFolder(req, res) {
    req.body = req.query;
    res.status(200).json({ status: 'success', data: "result", error: null, code: '200' });
}
