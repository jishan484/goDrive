const db = require("../../database");
const userService = require("./../userService");
const driveService = require("./../driveService");
const log = require("./../logService");


class FileService {

    constructor() {
        log.log("debug","File service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    get(data, callback) {
        let fileId = data.fileId;
        let owner = data.owner;
        let filePath = data.filePath;
        let fileName = data.fileName;
        let parentFolderId = data.parentFolderId;
        let driveId = data.driveId;
        
        db.all('SELECT * FROM Files WHERE (fileId = ? or (filePath = ? and fileName = ?))and owner = ?', [fileId, filePath, fileName, owner], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(row);
            }
        });
    }

    getByFolder(data, callback) {
        let folderId = data.folderId;
        let filePath = data.filePath;
        let owner = data.owner;

        db.all('SELECT * FROM Files WHERE (parentFolderId = ? or filePath = ?) and owner = ? and isDeleted=0', [folderId,filePath, owner], (err, row) => {
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

        db.get('SELECT * FROM Files WHERE fileId = ? and owner = ? and isDeleted=0', [fileId, owner], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(row);
            }
        });
    }

    getByName(data, callback) {
        let fileName = data.fileName;
        let filePath = data.filePath;
        let owner = data.owner;

        db.get('SELECT * FROM Files WHERE (filePath = ? or fileName = ?) and owner = ? and isDeleted=0', [filePath, fileName, owner], (err, row) => {
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
        let driveId = data.driveId;
        if(data.FETCH_PARENT == false){
            db.run('INSERT INTO Files (fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, accesses, star, fileFormat, driveId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, access, star, fileFormat,driveId], (err) => {
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
            db.run('INSERT INTO Files (fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, accesses, star, fileFormat, driveId) VALUES (?,?,?,?,?,?,(SELECT folderId FROM Folders where fullPath= ? and owner= ? ),?,?,?,?,?)', [fileId, filePath, fileName, fileType, fileSize, owner, filePath, owner, nodeId, access, star, fileFormat, driveId], (err) => {
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

    update(statement, datas, callback) {
        db.run('UPDATE Files SET ' + statement + ' WHERE fileId = ?', datas, (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(true);
            }
        });
    }

    delete(data, callback){
        let fileId = data.fileId;
        let owner = data.owner;
        db.run('DELETE FROM Files WHERE fileId = ? and owner = ?', [fileId, owner], (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(true);
            }
        });
    }

    saveChunks(data, callback){
        let chunkId = "CP" + Date.now().toString(36)+'-'+Math.floor(Math.random() * 100000000000).toString(36);  // from random generator
        let nodeInfo = data.nodeInfo;
        let orders = data.driveIndex;
        let nodeId = data.id;
        let driveId = data.driveId;
        db.run('INSERT INTO FileChunks (chunkId, nodeInfo, orders, nodeId, driveId) VALUES (?,?,?,?,?)', [chunkId, nodeInfo, orders, nodeId, driveId], (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(true);
            }
        });
    }

    getChunks(data,callback){
        let nodeInfo = data.nodeId;
        db.all('SELECT * FROM FileChunks where nodeInfo=?',[nodeInfo],(err,rows)=>{
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(rows);
            }
        });
    }

    deleteChunks(data) {
        let nodeInfo = data.nodeId;
        db.all('DELETE FROM FileChunks where nodeInfo=?', [nodeInfo], (err) => {
            if (err) {
                log.log("error", err);
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
                    file.modifiedOn = row[i].modifiedOn;
                    file.lastAccessedOn = row[i].lastAccessedOn;
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
        data.fileId = "FL" + Date.now().toString(36)+'-'+Math.floor(Math.random() * 10000000).toString(36);  // from random generator // from random generator
        data.filePath = req.body.filePath;
        data.fileName = req.body.fileName;
        data.fileType = req.body.fileType;
        data.driveId = req.body.driveId;
        data.fileSize = req.body.fileSize; //from gd
        data.fileFormat = req.body.fileName.split('.').pop();
        data.owner = req.body.owner;
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


    uploadFile(req, callback) {
        req.body.chunked = false;
        req.body.owner = userService.getUserName(req.cookies.seid);  //from cookie
        // if previous upload errored, checks for already existed file
        if (req.body.checkDuplicate != undefined && (req.body.checkDuplicate == 'true' || req.body.checkDuplicate == true)){
            this.getByName(req.body, (result)=>{
                if(result){
                    callback(true, 'File already uploaded!');
                } else {
                    req.body.checkDuplicate = undefined;
                    this.uploadFile(req,callback);
                }
            });
        } else {
            driveService.uploadFile(req, (status, data, code = 507) => {
                if (status == true && req.body.chunked == false) {
                    this.saveFile(req, (status, data , code = 500) => {
                        if (status) {
                            callback(true, data);
                        } else {
                            callback(false, data, code);
                        }
                    });
                }
                else if (status == true && req.body.chunked == true) {
                    //insert into Parts table and also inset the details to Files table
                    req.body.driveId = 'CHUNKED';
                    req.body.nodeId = "CH" + Date.now().toString(36)+'-'+Math.floor(Math.random() * 100000000).toString(36);  // from random generator  // from random generator
                    this.saveFile(req, (status, data, code = 500) => {
                        if (status) {
                            let callbackCount = 0, totalPartCount = req.body.nodesInfo.length;
                            req.body.nodesInfo.forEach(partInfo => {
                                partInfo.nodeInfo = req.body.nodeId;
                                this.saveChunks(partInfo, (status) => {
                                    callbackCount++;
                                    if (callbackCount == totalPartCount) {
                                        callback(true, data);
                                    }
                                    if (!status) {
                                        callback(false, 'Failed to save a chunk in DB!', 500);
                                        callbackCount -= 100;
                                    }
                                })
                            });
                        } else {
                            callback(false, data, code);
                        }
                    });
                }
                else {
                    callback(false, data, code);
                }
            });
        }
    }


    downloadFile(req,callback){
        let data = {};
        data.fileId = req.body.fileId;
        data.owner = userService.getUserName(req.cookies.seid);
        data.filePath = req.body.filePath;
        data.fileName = req.body.fileName;


        if ((data.filePath == undefined && data.fileName == undefined) && data.fileId == undefined) {
            callback(false, "Missing parameters: (filePath and fileName) or fileId");
            return;
        }
        this.getById(data, (rows) => {
            if(rows == undefined || rows.length == 0){
                callback(false,'File Not Found');
                return;
            }

            req.body.driveId = rows.driveId;
            req.body.nodeId = rows.nodeId;
            req.body.fileName = rows.fileName;
            req.body.fileSize = rows.fileSize;
            req.body.fileType = rows.fileType;

            if (rows.driveId == 'CHUNKED'){
                this.downloadChunked(rows,callback);
                return;
            }
            driveService.downloadFile(req,(status,data)=>{
                callback(status, data);
            });
            // TODO: update lastAccessedOn
        }); 
    }

    downloadChunked(result,callback){
        this.getChunks(result,(rows)=>{
            if (rows.length < 2) {
                callback(false, 'Part of this file not present in system!');
                log.log('error', 'Chunk length less than 2 \n' + JSON.stringify(rows));
                return;
            }
            driveService.downloadChunkedFile(rows,(status, data)=>{
                callback(status, data);
            })
        });
    }


    deleteFile(req, callback){
        let requestedData = {};
        requestedData.fileId = req.body.fileId;
        requestedData.owner = userService.getUserName(req.cookies.seid);
        requestedData.filePath = req.body.filePath;
        requestedData.fileName = req.body.fileName;

        if ((requestedData.filePath == undefined && requestedData.fileName == undefined) && requestedData.fileId == undefined) {
            callback(false, "Missing parameters: (filePath and fileName) or fileId");
            return;
        }
        this.getById(requestedData, (rows) => {
            if (rows == undefined || rows.length == 0) {
                callback(false, 'File Not Found');
                return;
            }
            req.body.driveId = rows.driveId;
            req.body.nodeId = rows.nodeId;
            req.body.fileSize = rows.fileSize;
            req.body.owner = rows.owner;

            if (rows.driveId == 'CHUNKED') {
                this.deleteChunked(rows, (status, requestedData)=>{
                    if(status){ //[todo] [redesign] : delete chunked file from drives
                        this.delete(req.body, (deleteStatus) => {
                            if (deleteStatus == true)
                                callback(deleteStatus, 'File deleted')
                            else callback(deleteStatus, 'System failed to delete the file from DataBase!')
                        });

                        this.deleteChunks(requestedData);
                    }
                });
                return;
            }

            driveService.deleteFile(req, (status, data) => {
                if(status == true){
                    this.delete(req.body,(deleteStatus)=>{
                        if (deleteStatus == true)
                            callback(deleteStatus,'File deleted')
                        else callback(deleteStatus, 'System failed to delete the file from database!')
                    });
                }
                else{
                    callback(status, "File not available in drive!");
                    // mark this for repair or delete:
                }
            });
        });
    }

    deleteChunked(nodeInfo, callback){
        let count = 0;
        let isFailed = false;
        let error = null;
        this.getChunks(nodeInfo, (rows) => {
            if (rows.length < 2) {
                callback(false, 'Part of this file not present in system!');
                log.log('error', 'Chunk length less than 2 \n' + JSON.stringify(rows));
                return;
            }
            rows.forEach((node)=>{
                node.body = {};
                node.body.nodeId = node.nodeId;
                node.body.driveId = node.driveId;
                
                driveService.deleteFile(node, (status, data) => {
                    if(status == false) {
                        isFailed = true;
                        error = data;
                    }
                    if(count >= rows.length -1){
                        callback(!isFailed, (error == null) ? data : error);
                    }
                    count++;
                });
            })
        });
    }

    // {fileId, owner, filePath, fileName, updates}
    // updates = {fileName, filePath, fileFormat, access, star} | access = {RW,W,R} | star = {true,false}
    // Currently only one file can be updated at a time if similar name is found in same directory
    // TODO: requirement analysis for multiple files update

    updateFile(req, callback){
        let requestedData = {};
        requestedData.fileId = req.body.fileId;
        requestedData.owner = userService.getUserName(req.cookies.seid);
        requestedData.filePath = req.body.filePath;
        requestedData.fileName = req.body.fileName;
        
        if ((requestedData.filePath == undefined && requestedData.fileName == undefined) && requestedData.fileId == undefined) {
            callback(false, "Missing parameters: (filePath and fileName) or fileId");
            return;
        }
        if(req.body.updates == undefined || req.body.updates == null){
            callback(false, "Missing parameters: updates");
            return;
        }
        this.get(requestedData, (rows) => {
            if (rows == undefined || rows.length == 0) {
                callback(false, 'File Not Found!');
                return;
            } else{
                let statement = [];
                let dataset = [];
                if(req.body.updates.fileName != undefined && req.body.updates.fileName != rows[0].fileName){
                    statement.push('fileName = ?');
                    dataset.push(req.body.updates.fileName);
                    // checking if format is changed
                    if(req.body.updates.fileName.split('.').length > 1){
                        statement.push('fileFormat = ?');
                        dataset.push(req.body.updates.fileName.split('.').pop());
                    }
                }
                if(req.body.updates.filePath != undefined && req.body.updates.filePath != rows[0].filePath){
                    statement.push('filePath = ?');
                    dataset.push(req.body.updates.filePath);
                    if(req.body.updates.filePath != '/home' && (req.body.updates.parentFolderId == undefined || req.body.updates.parentFolderId == null) ) {
                        statement.push('parentFolderId = (SELECT folderId FROM Folders where fullPath= ? and owner= ? )')
                        dataset.push(req.body.updates.filePath);
                        dataset.push(requestedData.owner);
                    } else if(req.body.updates.parentFolderId != undefined && req.body.updates.parentFolderId != null){
                        statement.push('parentFolderId = ?');
                        dataset.push(req.body.updates.parentFolderId);
                    } else {
                        statement.push('parentFolderId = 0');
                    }
                }
                if(req.body.updates.fileFormat != undefined && req.body.updates.fileFormat != rows[0].fileFormat){
                    statement.push('fileFormat = ?');
                    dataset.push(req.body.updates.fileFormat);
                }
                if(req.body.updates.access != undefined && req.body.updates.access != rows[0].access){
                    statement.push('access = ?');
                    dataset.push(req.body.updates.access);
                }
                if(req.body.updates.star != undefined && req.body.updates.star != rows[0].star){
                    statement.push('star = ?');
                    dataset.push(req.body.updates.star);
                }

                if(statement.length == 0){
                    callback(false, 'No updates found!');
                    return;
                }

                statement.push('modifiedOn = CURRENT_TIMESTAMP');
                dataset.push(rows[0].fileId); // for where clause
                this.update(statement, dataset, (status)=>{
                    if(status == true){
                        callback(true, 'File details updated');
                    }else{
                        callback(false, 'System failed to update the file!');
                    }
                });
            }
        });
    }

    repairFileOparation(data){
        
    }
}




module.exports = new FileService();