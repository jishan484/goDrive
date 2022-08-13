const express = require('express');
const router = express.Router({ mergeParams: true });
const folderService = require("./../../../service/folderService");
const Busboy = require('busboy');
const Drive = require("./../../../utilities/drive.js");

var drive = new Drive();


router.get('/', getFile); //download file/s by id , filename and folder name
router.post('/', (req, res) => {

    drive.writeFile(req.headers['m-filename'], req.headers['m-mimetype'], req, (data, err) => {
        if (err) {
            res.status(500).json({ status: 'error', data: null, error: err, code: '500' });
        } else {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        }
    });

});

module.exports = router;



// MiddleWares:


function getFile(req, res) {
    res.status(200).json({ status: 'success', data: "result", error: null, code: '200' });
}