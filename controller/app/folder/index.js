const express = require('express');
const router = express.Router({ mergeParams: true });
const folderService = require("./../../../service/folderService");


router.get('/', getFolder);
router.post('/', createFolder);
router.delete('/', deleteFolder);
router.patch('/',updateFolder);

module.exports = router;



// MiddleWares:


function getFolder(req, res) {
    req.body = req.query;
    folderService.getFolderTree(req, (status,result) => {
        if (status) {
            res.status(200).json({ status: 'success', data: result, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'failed', data: "RETRIVAL_FAILED", error: result, code: '404' });
        }
    }
    );
}


function createFolder(req, res){
    folderService.createFolder(req, (status,result) => {
        if(status){
            res.status(201).send({ status: 'success', data: result, error: null, code: '200' });
        }
        else{
            res.status(200).send({ status: 'error', data: "CREATION_FAILED", error: result, code: '204' });
        }
    });
}

function deleteFolder(req, res){
    folderService.deleteFolder(req, (status,result) => {
        if(status){
            res.status(200).send({ status: 'success', data: result, error: null, code: '200' });
        }
        else{
            res.status(200).send({ status: 'error', data: "DELETION_FAILED", error: result, code: '204' });
        }
    }
    );
}

function updateFolder(req, res) {
    folderService.updateFolder(req, (status, result) => {
        if (status) {
            res.status(200).send({ status: 'success', data: result, error: null, code: '200' });
        }
        else {
            res.status(200).send({ status: 'error', data: "UPDATION_FAILED", error: result, code: '204' });
        }
    }
    );
}