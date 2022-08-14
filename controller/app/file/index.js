const express = require('express');
const router = express.Router({ mergeParams: true });
const folderService = require("./../../../service/folderService");
const Drive = require("./../../../utilities/drive.js");

var drive = new Drive();


router.get('/', getFile); //download file/s by id , filename and folder name
router.post('/', (req, res) => {

    let fileName = req.headers['m-filename'];
    let folderName = req.headers['m-foldername'];
    let mimetype = req.headers['m-mimetype'];
    if(fileName == undefined || fileName == null || fileName == ""){
        res.status(400).json({ status: 'error', data: null, error: "m-filename header is required", code: '400' });
        return;
    }

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