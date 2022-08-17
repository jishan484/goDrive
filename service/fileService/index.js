const db = require("../../database");
const userService = require("./../userService");
const log = require("./../logService");


class FileService {

    constructor() {
        log.log("debug","folder service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    getByFolder(data, callback) {
        let folderId = data.folderId;
        let filePath = data.filePath;
        let owner = data.owner;

        db.all('SELECT * FROM Files WHERE (parentFolderId = ? or filePath = ?) and owner = ?', [folderId,filePath, owner], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(row);
            }
        });
    }

    getById(data, callback) {
        let fileId = data.fileId;
        let owner = data.owner;

        db.get('SELECT * FROM Files WHERE fileId = ? and owner = ?', [fileId, owner], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(row);
            }
        });
    }

    save(data, callback) {
        let fileId = data.fileId;
        let filePath = data.filePath;
        let fileName = data.fileName;
        let fileType = data.fileType;
        let fileSize = data.fileSize;
        let fileFormat = data.fileFormat;
        let owner = data.owner;
        let parentFolderId = data.parentFolderId;
        let nodeId = data.nodeId;
        let access = data.access;
        let star = data.star;
        if(data.FETCH_PARENT == false){
            db.run('INSERT INTO Files (fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, accesses, star, fileFormat) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, access, star, fileFormat], (err) => {
                if (err) {
                    callback(false);
                    log.log("error", err);
                }
                else {
                    callback(true);
                }
            });
        }
        else{
            db.run('INSERT INTO Files (fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, accesses, star) VALUES (?,?,?,?,?,?,(SELECT folderId FROM Folders where fullPath= ? and owner= ? ),?,?,?)', [fileId, filePath, fileName, fileType, fileSize, owner, filePath,owner, nodeId, access, star], (err) => {
                if (err) {
                    callback(false);
                    log.log("error", err);
                }
                else {
                    callback(true);
                }
            });
        }
    }

    update(data, callback) {
        let folderId = data.folderId;
        let folderName = data.folderName;
        let owner = data.owner;
        let parentFolderId = data.parentFolderId;
        let filePath = data.filePath;
        let permissions = data.permissions;
        let accesses = data.accesses;
        let priority = data.priority;
        let folderPath = data.folderPath;
        db.run('UPDATE Folders SET folderName = ?, parentFolderId = ?, filePath = ?, permissions = ?, accesses = ?, priority = ?, folderPath = ? WHERE folderId = ? and owner = ?', [folderName, parentFolderId, filePath, permissions, accesses, priority, folderPath, folderId, owner], (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(true);
            }
        });
    }



    // -------------------------------------UTILITY--------------------------------------------//

    getFiles(req, callback) {
        let data = {};
        data.parentFolderId = (req.body.folderId==undefined)?'':req.body.folderId;
        data.owner = userService.getUserName(req.cookies.seid);
        data.filePath = req.body.filePath;

        if(data.parentFolderId == '' && data.filePath == undefined) {
            callback(false,"Missing parameters: parentFolderId and filePath");
            return;
        }
        let response = {};
        response.files = [];
        response.folder = data.filePath;
        this.getByFolder(data, (row) => {
            if(row){
                for (let i = 0; i < row.length; i++) {
                    let file = {};
                    file.fileId = row[i].fileId;
                    file.filePath = row[i].filePath;
                    file.fileName = row[i].fileName;
                    file.fileType = row[i].fileType;
                    file.fileSize = row[i].fileSize;
                    file.fileFormat = row[i].fileFormat;
                    file.access = row[i].accesses;
                    file.icon = row[i].fileFormat + '.svg';
                    file.star = row[i].star;
                    response.files.push(file);
                }
                callback(true, response);
            }
            else{
                callback(false, "No files found");
            }
        });
    }

    saveFile(req, callback) {
        let data = {};
        data.fileId = "FL"+ Date.now().toString(36);  // from random generator
        data.filePath = req.body.filePath;
        data.fileName = req.body.fileName;
        data.fileType = req.body.fileType;
        data.fileSize = req.body.fileSize; //from gd
        data.fileFormat = req.body.fileName.split('.').pop();
        data.owner = userService.getUserName(req.cookies.seid);  //from cookie
        data.parentFolderId = 0;  //from FolderService
        data.nodeId = req.body.nodeId; //from gd
        data.access = "RW"; 
        data.star = 0;
        data.FETCH_PARENT = false;

        if(data.filePath =='/home'){
            data.parentFolderId = '0';
        }
        else if (req.body.parentFolderId != undefined) {
            data.parentFolderId = req.body.parentFolderId;
        }
        else{
            data.FETCH_PARENT  = true;
        }

        this.save(data, (result) => {
            if (result == false) {
                callback(false,"File not saved");
            }
            else {
                callback(true,"File saved id: "+data.fileId);
            }
        });
    }

}

module.exports = new FileService();