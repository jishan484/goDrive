const db = require("../../database");
const userService = require("./../userService");
const driveService = require("./../driveService");
const base32 = require('base32');
const log = require("./../logService");
const { externalAPIConfig } = require("./../../SystemConfig");
const path = require('path');


class FileService {

    constructor() {
        log.log("debug", "File service initialized!");
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

        db.all('SELECT f.*,s.tokenId FROM Files f LEFT JOIN sharedFileInfo s on f.fileId = s.fileId or f.parentFolderId = s.folderId WHERE (f.parentFolderId = ? or f.filePath = ?) and f.owner = ? and f.isDeleted=0', [folderId, filePath, owner], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(row);
            }
        });
    }

    _getBySharedTokenId(data, callback) {
        let tokenId = data.tokenId;
        db.all(`
        SELECT f.*,s.tokenId FROM Files f
        INNER JOIN sharedFileInfo s on f.fileId = s.fileId or f.parentFolderId = s.folderId 
        WHERE s.tokenId = ? and f.isDeleted=0 and f.accesses = 'RW' and s.owner = f.owner
        `, [tokenId], (err, row) => {
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

    getByPath(data, callback) {
        let fileName = data.fileName;
        let filePath = data.filePath;
        let owner = data.owner;

        db.get('SELECT * FROM Files WHERE (filePath = ? and fileName = ?) and owner = ? and isDeleted=0', [filePath, fileName, owner], (err, row) => {
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
        if (data.FETCH_PARENT == false) {
            db.run('INSERT INTO Files (fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, accesses, star, fileFormat, driveId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [fileId, filePath, fileName, fileType, fileSize, owner, parentFolderId, nodeId, access, star, fileFormat, driveId], (err) => {
                if (err) {
                    callback(false);
                    log.log("error", err);
                }
                else {
                    callback(true);
                }
            });
        }
        else {
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

    delete(data, callback) {
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

    saveChunks(data, callback) {
        let chunkId = "CP" + Date.now().toString(36) + '-' + Math.floor(Math.random() * 100000000000).toString(36);  // from random generator
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

    getChunks(data, callback) {
        let nodeInfo = data.nodeId;
        db.all('SELECT * FROM FileChunks where nodeInfo=?', [nodeInfo], (err, rows) => {
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

    saveSharedFilesDetails(data, callback) {
        let tokenId = data.tokenId;
        let fileId = data.fileId;
        let folderId = data.folderId;
        let type = data.type;
        let owner = data.owner;
        db.run('INSERT INTO sharedFileInfo (tokenId, fileId, folderId, type, owner) VALUES (?,?,?,?,?)', [tokenId, fileId, folderId, type, owner], (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(true);
            }
        });
    }
    deleteSharedFilesDetails(data, callback) {
        let tokenId = data.tokenId;
        let type = data.type;
        let owner = data.owner;
        db.run('DELETE FROM sharedFileInfo where tokenId = ? and owner = ? and type = ?', [tokenId, owner, type], (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(true);
            }
        });
    }

    _getSharedFilesDetails(data, callback) {
        let fileId = data.fileId;
        let folderId = data.folderId;
        let owner = data.owner;
        let tokenId = data.tokenId;
        let type = data.type;
        db.all(`SELECT * FROM sharedFileInfo 
            WHERE ((fileId = ? AND type = 'file') OR (folderId = ? AND type = 'folder') OR tokenId = ?) 
            AND owner = ?`
            , [fileId, folderId, tokenId, owner], (err, row) => {
                if (err) {
                    callback(false);
                    log.log("error", err);
                }
                else {
                    callback(row[0]);
                }
            });
    }
    // -------------------------------------UTILITY--------------------------------------------//

    getFiles(req, callback) {
        let data = {};
        data.parentFolderId = (req.body.folderId == undefined) ? '' : req.body.folderId;
        data.owner = userService.getUserName(req.cookies.seid);
        data.filePath = req.body.filePath;

        if (data.filePath == undefined && data.parentFolderId == '') {
            callback(false, "Missing parameters: parentFolderId and filePath");
            return;
        }
        let response = {};
        response.files = [];
        response.folder = data.filePath;
        this.getByFolder(data, (row) => {
            if (row) {
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
                    file.isShared = (row[i].tokenId != null);
                    response.files.push(file);
                }
                callback(true, response);
            }
            else {
                callback(false, "No files found");
            }
        });
    }

    getFile(req, callback) {
        let data = {};
        data.parentFolderId = (req.body.folderId == undefined) ? '' : req.body.folderId;
        data.owner = userService.getUserName(req.cookies.seid);
        data.fileFullPath = req.body.filePath;
        if (data.fileFullPath == undefined && data.parentFolderId == '') {
            callback(false, "Missing parameters: parentFolderId and filePath");
            return;
        }
        if (data.fileFullPath != undefined) {
            data.filePath = path.dirname(req.body.filePath);
            data.fileName = path.basename(req.body.filePath);
        }
        let response = {};
        response.files = [];
        response.folder = data.filePath;
        this.getByPath(data, (row) => {
            if (row) {
                let file = {};
                file.fileId = row.fileId;
                file.filePath = row.filePath;
                file.fileName = row.fileName;
                file.fileType = row.fileType;
                file.fileSize = row.fileSize;
                file.fileFormat = row.fileFormat;
                file.access = row.accesses;
                file.modifiedOn = row.modifiedOn;
                file.lastAccessedOn = row.lastAccessedOn;
                file.icon = row.fileFormat + '.svg';
                file.star = row.star;
                file.isShared = (row.tokenId != null);
                response.files.push(file);
                callback(true, response);
            }
            else {
                callback(false, "No files found");
            }
        });
    }

    getSharedFiles(req, callback) {
        let data = {};
        data.tokenId = req.body.tokenId;

        if (data.tokenId == undefined && data.tokenId == '') {
            callback(false, "Missing parameters: tokenId");
            return;
        }
        let response = {};
        response.files = [];
        this._getBySharedTokenId(data, (row) => {
            if (row) {
                for (let i = 0; i < row.length; i++) {
                    response.sharedBy = row[0].owner;
                    let file = {};
                    file.fileName = row[i].fileName;
                    file.fileType = row[i].fileType;
                    file.fileSize = row[i].fileSize;
                    file.fileFormat = row[i].fileFormat;
                    file.modifiedOn = row[i].modifiedOn;
                    file.icon = row[i].fileFormat + '.svg';
                    file.downloadURL = new TokenService().encode(row[i].tokenId + "_:_" + row[i].fileId, externalAPIConfig.tokenHashKey);
                    response.files.push(file);
                }
                callback(true, response);
            }
            else {
                callback(false, "No files found");
            }
        });
    }

    saveSharedFiles(req, callback) {
        let data = {};
        data.alreadyShared = false;
        data.type = req.body.type;
        data.folderId = req.body.folderId;
        data.fileId = req.body.fileId;
        data.sharedId = req.body.targetId;
        data.owner = userService.getUserName(req.cookies.seid);
        data.tokenId = "SH" + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000000).toString(36);  // from random generator
        if (data.sharedId != undefined && data.sharedId != null && data.sharedId != '') {
            if (data.type == undefined) {
                callback(false, "Missing parameters: type (folder / file)");
                return;
            }
            else if (data.type == 'file') data.fileId = data.sharedId;
            else if (data.type == 'folder') data.folderId = data.sharedId;
            else {
                callback(false, "Wrong type provided, acceptable types are (folder / file)");
                return;
            }
        }
        if (data.folderId == undefined && data.fileId == undefined) {
            callback(false, "Missing parameters: File id or Folder id");
            return;
        }
        data.fileId = (data.fileId == '') ? null : data.fileId;
        data.folderId = (data.folderId == '') ? null : data.folderId;

        this._getSharedFilesDetails(data, (result) => {
            if (result) {
                result.alreadyShared = true;
                callback(true, result);
            } else {
                this.saveSharedFilesDetails(data, (status) => {
                    if (status == false) {
                        callback(false, "Shared file not saved");
                    }
                    else {
                        callback(true, data);
                    }
                });
            }
        });
    }

    cancelSharedFiles(req, callback) {
        let data = {};
        data.type = req.body.type;
        data.tokenId = req.body.targetId;
        data.owner = userService.getUserName(req.cookies.seid);
        if (data.tokenId == undefined && data.tokenId == null && data.tokenId == '') {
            callback(false, "Missing parameters: token id");
            return;
        }
        if (data.type == undefined) {
            callback(false, "Missing parameters: type (folder / file)");
            return;
        }

        this._getSharedFilesDetails(data, (result) => {
            if (result) {
                this.deleteSharedFilesDetails(data, (status) => {
                    if (status == false) {
                        callback(false, "Shared token not found");
                    }
                    else {
                        callback(true, "deleted");
                    }
                });
            } else {
                callback(false, "Sharing token does not exist.");
            }
        });
    }

    saveFile(req, callback) {
        let data = {};
        data.fileId = "FL" + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000000).toString(36);  // from random generator // from random generator
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
        if (data.filePath == '/home') {
            data.parentFolderId = '0';
        }
        else if (req.body.parentFolderId != undefined) {
            data.parentFolderId = req.body.parentFolderId;
        }
        else {
            data.FETCH_PARENT = true;
        }

        this.save(data, (result) => {
            if (result == false) {
                callback(false, "File not saved");
            }
            else {
                callback(true, "File saved id: " + data.fileId);
            }
        });
    }


    uploadFile(req, callback) {
        req.body.chunked = false;
        req.body.owner = userService.getUserName(req.cookies.seid);  //from cookie
        // if previous upload errored, checks for already existed file
        if (req.body.checkDuplicate != undefined && (req.body.checkDuplicate == 'true' || req.body.checkDuplicate == true)) {
            this.getByName(req.body, (result) => {
                if (result) {
                    callback(true, 'File already uploaded!');
                } else {
                    req.body.checkDuplicate = undefined;
                    this.uploadFile(req, callback);
                }
            });
        } else {
            let reqData = {};
            if (req.body.overwrite != undefined && req.body.overwrite == true) {
                reqData.body = {};
                reqData.cookies = {};
                reqData.cookies.seid = req.cookies.seid;
                reqData.body.filePath = req.body.filePath;
                reqData.body.fileName = req.body.fileName;
            }
            driveService.uploadFile(req, (status, data, code = 507) => {
                if (status == true && req.body.overwrite != undefined && req.body.overwrite == true) {
                    this.deleteFile(reqData, (a, b) => {
                        this._saveUploadedFileInfo(status, data, code, req, callback);
                    });
                } else {
                    this._saveUploadedFileInfo(status, data, code, req, callback);
                }

            });
        }
    }

    _saveUploadedFileInfo(status, data, code, req, callback) {
        if (status == true && req.body.chunked == false) {
            this.saveFile(req, (status, data, code = 500) => {
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
            req.body.nodeId = "CH" + Date.now().toString(36) + '-' + Math.floor(Math.random() * 100000000).toString(36);  // from random generator  // from random generator
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
    }


    downloadFileExternally(req, callback) {
        if (req.params.tokenId == undefined || req.params.tokenId == null || req.params.tokenId == "") {
            callback(false, "Token is not provided");
            return;
        }
        let data = {};
        let paramToken = new TokenService().decode(req.params.tokenId, externalAPIConfig.tokenHashKey).split('_:_');
        data.tokenId = paramToken[0];
        data.fileId = paramToken[1];
        this._getBySharedTokenId(data, (rows) => {
            if (rows == undefined || rows.length == 0) {
                callback(false, 'File Not Found');
                return;
            }
            rows = rows.filter(x => x.fileId == data.fileId)[0];
            req.body.driveId = rows.driveId;
            req.body.nodeId = rows.nodeId;
            req.body.fileName = rows.fileName;
            req.body.fileSize = rows.fileSize;
            req.body.fileType = rows.fileType;

            if (rows.driveId == 'CHUNKED') {
                this.downloadChunked(rows, callback);
                return;
            }
            driveService.downloadFile(req, (status, data) => {
                callback(status, data);
            });
            // TODO: update lastAccessedOn
        });
    }


    downloadFile(req, callback) {
        let data = {};
        data.fileId = req.body.fileId;
        data.owner = userService.getUserName(req.cookies.seid);
        data.filePath = req.body.filePath;
        data.fileName = req.body.fileName;


        if ((data.filePath == undefined && data.fileName == undefined) && data.fileId == undefined) {
            callback(false, "Missing parameters: (filePath and fileName) or fileId");
            return;
        }
        let callerType = (data.fileId != undefined) ? this.getById : this.getByPath;
        callerType(data, (rows) => {
            if (rows == undefined || rows.length == 0) {
                callback(false, 'File Not Found');
                return;
            }

            req.body.driveId = rows.driveId;
            req.body.nodeId = rows.nodeId;
            req.body.fileName = rows.fileName;
            req.body.fileSize = rows.fileSize;
            req.body.fileType = rows.fileType;

            if (rows.driveId == 'CHUNKED') {
                this.downloadChunked(rows, callback);
                return;
            }
            driveService.downloadFile(req, (status, data) => {
                callback(status, data);
            });
            // TODO: update lastAccessedOn
        });
    }

    downloadChunked(result, callback) {
        this.getChunks(result, (rows) => {
            if (rows.length < 2) {
                callback(false, 'Part of this file not present in system!');
                log.log('error', 'Chunk length less than 2 \n' + JSON.stringify(rows));
                return;
            }
            driveService.downloadChunkedFile(rows, (status, data) => {
                callback(status, data);
            })
        });
    }


    deleteFile(req, callback) {
        let requestedData = {};
        requestedData.fileId = req.body.fileId;
        requestedData.owner = userService.getUserName(req.cookies.seid);
        requestedData.filePath = req.body.filePath;
        requestedData.fileName = req.body.fileName;
        if ((requestedData.filePath == undefined && requestedData.fileName == undefined) && requestedData.fileId == undefined) {
            callback(false, "Missing parameters: (filePath and fileName) or fileId");
            return;
        }
        let callerType = (requestedData.fileId != undefined) ? this.getById : this.getByPath;
        callerType(requestedData, (rows) => {
            if (rows == undefined || rows.length == 0) {
                callback(false, 'File Not Found');
                return;
            }
            let reqData = {};
            reqData.body = {};
            reqData.body.driveId = rows.driveId;
            reqData.body.nodeId = rows.nodeId;
            reqData.body.fileSize = rows.fileSize;
            reqData.body.owner = rows.owner;
            reqData.body.fileId = rows.fileId;
            if (rows.driveId == 'CHUNKED') {
                this.deleteChunked(rows, (status, requestedData) => {
                    if (status) { //[todo] [redesign] : delete chunked file from drives
                        this.delete(reqData.body, (deleteStatus) => {
                            if (deleteStatus == true)
                                callback(deleteStatus, 'File deleted')
                            else callback(deleteStatus, 'System failed to delete the file from DataBase!')
                        });

                        this.deleteChunks(requestedData);
                    }
                });
                return;
            }

            driveService.deleteFile(reqData, (status, data) => {
                if (status == true) {
                    this.delete(reqData.body, (deleteStatus) => {
                        if (deleteStatus == true)
                            callback(deleteStatus, 'File deleted')
                        else callback(deleteStatus, 'System failed to delete the file from database!')
                    });
                }
                else {
                    callback(status, "File not available in drive!");
                    // mark this for repair or delete:
                }
            });
        });
    }

    deleteChunked(nodeInfo, callback) {
        let count = 0;
        let isFailed = false;
        let error = null;
        this.getChunks(nodeInfo, (rows) => {
            if (rows.length < 2) {
                callback(false, 'Part of this file not present in system!');
                log.log('error', 'Chunk length less than 2 \n' + JSON.stringify(rows));
                return;
            }
            rows.forEach((node) => {
                node.body = {};
                node.body.nodeId = node.nodeId;
                node.body.driveId = node.driveId;

                driveService.deleteFile(node, (status, data) => {
                    if (status == false) {
                        isFailed = true;
                        error = data;
                    }
                    if (count >= rows.length - 1) {
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

    updateFile(req, callback) {
        let requestedData = {};
        requestedData.fileId = req.body.fileId;
        requestedData.owner = userService.getUserName(req.cookies.seid);
        requestedData.filePath = req.body.filePath;
        requestedData.fileName = req.body.fileName;

        if ((requestedData.filePath == undefined && requestedData.fileName == undefined) && requestedData.fileId == undefined) {
            callback(false, "Missing parameters: (filePath and fileName) or fileId");
            return;
        }
        if (req.body.updates == undefined || req.body.updates == null) {
            callback(false, "Missing parameters: updates");
            return;
        }
        this.get(requestedData, (rows) => {
            if (rows == undefined || rows.length == 0) {
                callback(false, 'File Not Found!');
                return;
            } else {
                let statement = [];
                let dataset = [];
                if (req.body.updates.fileName != undefined && req.body.updates.fileName != rows[0].fileName) {
                    statement.push('fileName = ?');
                    dataset.push(req.body.updates.fileName);
                    // checking if format is changed
                    if (req.body.updates.fileName.split('.').length > 1) {
                        statement.push('fileFormat = ?');
                        dataset.push(req.body.updates.fileName.split('.').pop());
                    }
                }
                if (req.body.updates.filePath != undefined && req.body.updates.filePath != rows[0].filePath) {
                    statement.push('filePath = ?');
                    dataset.push(req.body.updates.filePath);
                    if (req.body.updates.filePath != '/home' && (req.body.updates.parentFolderId == undefined || req.body.updates.parentFolderId == null)) {
                        statement.push('parentFolderId = (SELECT folderId FROM Folders where fullPath= ? and owner= ? )')
                        dataset.push(req.body.updates.filePath);
                        dataset.push(requestedData.owner);
                    } else if (req.body.updates.parentFolderId != undefined && req.body.updates.parentFolderId != null) {
                        statement.push('parentFolderId = ?');
                        dataset.push(req.body.updates.parentFolderId);
                    } else {
                        statement.push('parentFolderId = 0');
                    }
                }
                if (req.body.updates.fileFormat != undefined && req.body.updates.fileFormat != rows[0].fileFormat) {
                    statement.push('fileFormat = ?');
                    dataset.push(req.body.updates.fileFormat);
                }
                if (req.body.updates.access != undefined && req.body.updates.access != rows[0].access) {
                    statement.push('access = ?');
                    dataset.push(req.body.updates.access);
                }
                if (req.body.updates.star != undefined && req.body.updates.star != rows[0].star) {
                    statement.push('star = ?');
                    dataset.push(req.body.updates.star);
                }

                if (statement.length == 0) {
                    callback(false, 'No updates found!');
                    return;
                }

                statement.push('modifiedOn = CURRENT_TIMESTAMP');
                dataset.push(rows[0].fileId); // for where clause
                this.update(statement, dataset, (status) => {
                    if (status == true) {
                        callback(true, 'File details updated');
                    } else {
                        callback(false, 'System failed to update the file!');
                    }
                });
            }
        });
    }

    repairFileOparation(data) {

    }
}



class TokenService {

    xorWithKey(input, key) {
        let output = '';
        for (let i = 0; i < input.length; i++) {
            const charCode = input.charCodeAt(i);
            const keyCharCode = key.charCodeAt(i % key.length);
            output += String.fromCharCode(charCode ^ keyCharCode);
        }
        return output;
    }

    encode(text, key) {
        const xorText = this.xorWithKey(text, key);
        return base32.encode(Buffer.from(xorText, 'utf-8')).toString();
    }

    decode(text, key) {
        const decodedBytes = base32.decode(text);
        const decodedText = Buffer.from(decodedBytes).toString('utf-8');
        return this.xorWithKey(decodedText, key);
    }
}

module.exports = new FileService();