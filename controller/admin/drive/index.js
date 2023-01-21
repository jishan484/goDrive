const express = require('express');
const router = express.Router({ mergeParams: true });
const driveService = require("./../../../service/driveService");

router.post('/', addDrive);
router.get('/callback', addDriveCallback);
router.get('/',getAllDrives);

module.exports = router;


// for dropbox : https://dropbox.tech/developers/oauth-code-flow-implementation-using-node-js-and-dropbox-javascript-sdk
// MiddleWares:



function addDrive(req,res){
    driveService.addNewDrive(req,(status,data)=>{
        if(status){
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    });
}


function addDriveCallback(req,res){
    req.body = req.query;
    driveService.saveNewDriveToken(req,(status,data)=>{
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    })
}

function getAllDrives(req,res){
    driveService.getAllDrives((status,data)=>{
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    })
}

module.exports = router;