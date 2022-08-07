const express = require('express');
const router = express.Router({ mergeParams: true });

router.post('/', createFolder);

module.exports = router;



// MiddleWares:

function createFolder(req, res){
    res.status(200).send({ status: 'success', error: null, code: '200' });
    //Date.now().toString(36)
}