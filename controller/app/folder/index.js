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
    // Folder type : list or folder
    // list should have all parentFolder and subfolders name with full path
    //  eg: /folder1, /folder1/folder2, /folder1/folder2/folder3, /folder1/folder2/folder4
    if (req.body.folderType != undefined && req.body.folderType != "" && req.body.folderType != "undefined" && req.body.folderType=="list"){
        folderService.createFolderTree(req, (status, result, code) => {
            if (status) {
                res.status(201).send({ status: 'success', data: "result", error: null, code: code });
            }
            else {
                res.status(200).send({ status: 'error', data: "CREATION_FAILED", error: result, code: code });
            }
        });
    } else{
        folderService.createFolder(req, (status, result, code) => {
            if (status) {
                res.status(201).send({ status: 'success', data: result, error: null, code: '200' });
            }
            else {
                res.status(200).send({ status: 'error', data: "CREATION_FAILED", error: result, code: code });
            }
        });
    }
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