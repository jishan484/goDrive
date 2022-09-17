const db = require("../../database");
const userService = require("./../userService");
const log = require("./../logService");


class FolderService {
    constructor() {
        log.log("debug","Folder service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    getById(data, callback) {
        let folder = data.folderId;
        db.get('SELECT * FROM Folders WHERE folderId = ?', [folder], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }

    getFolderByPath(data, callback) {
        let fullPath = data.fullPath;
        let owner = data.owner;
        let folderId = data.folderId;
        let folderPath = data.folderPath;
        // one fullPath for parentDri and another one for targeted dir
        db.all("SELECT * FROM Folders where ( fullPath = ? or fullPath= ? or folderId = ? ) and owner = ?",
            [fullPath,folderPath, folderId, owner], (err, row) => {
                if (err) {
                    log.log("error",err);
                    callback(false);
                }
                else {
                    if (row == undefined) callback(false);
                    else callback(row);
                }
            });
    }

    getSubFolders(data, callback) {
        let parentFolderId = data.parentFolderId;
        let folderPath = data.folderPath;
        let owner = data.owner;
        db.all('SELECT * FROM Folders WHERE ( parentFolderId = ? or folderPath = ? or fullPath = ? ) and owner = ?', [parentFolderId, folderPath, folderPath,owner], (err, rows) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                if (rows == undefined) callback(false);
                else callback(rows);
            }
        });
    }

    save(data, callback) {
        let folderId = data.folderId;
        let folderName = data.folderName;
        let owner = data.owner;
        let parentFolderId = data.parentFolderId;
        let fullPath = data.fullPath;
        let permissions = data.permissions;
        let accesses = data.accesses;
        let priority = data.priority;
        let folderPath = data.folderPath;
        db.run('INSERT INTO Folders (folderId,folderName,folderPath,owner,parentFolderId,fullPath,permissions,accesses,priority) VALUES (?,?,?,?,?,?,?,?,?)',
            [folderId,folderName, folderPath, owner, parentFolderId, fullPath, permissions, accesses, priority], (err) => {
                if (err) {
                    callback(false);
                    log.log("error", err);
                }
                else callback(true);
            });
    }

    update(subquery, data, callback) {
        db.run('UPDATE Folders SET ' + subquery + ', modifiedOn=CURRENT_TIMESTAMP WHERE (folderId = ? OR (folderName = ? AND folderPath = ? )) and owner = ?', data, (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else callback(true);
        });
    }

    updateFullPath(oldPath, newPath, owner, callback){
        db.run('UPDATE Folders SET folderPath = REPLACE(folderPath ,? , ?) , fullPath = REPLACE(fullPath ,? , ?) WHERE owner= ? and fullPath like ?', [oldPath,newPath,oldPath,newPath,owner,oldPath+"/%"], (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else callback(true);
        });
        setImmediate(()=>{
            db.run('UPDATE Files SET filePath = REPLACE(filePath ,? , ?) WHERE owner= ? and filePath like ?', [oldPath, newPath, owner, oldPath + "%"], (err) => {
                if (err) {
                    log.log("error", err);
                }
            });
        });
    }

    delete(data, callback) {
        let fullPath = data.fullPath;
        let folderId = data.folderId;
        let owner = data.owner;
        console.log(fullPath,folderId,owner)

        db.run('DELETE FROM Folders WHERE ( folderId = ? or fullPath = ? ) and owner = ?', [folderId,fullPath,owner], (err) => {
            if (err){
                callback(false);
                log.log("error",err);
            }
            else callback(true);
        });
    }


    // -------------------------------------SERVICES--------------------------------------------//


    getFolderTree(req, callback) {
        let data = {};
        data.owner = userService.getUserName(req.cookies.seid);
        data.folderPath = req.body.folderPath;
        data.parentFolderId = req.body.parentFolderId;
        this.getSubFolders(data, (result) => {
            if(result){
                let folders = {};
                let isRoot = (data.folderPath == "/home");
                let isParentFolderFound = false;
                for(let i = 0; i < result.length; i++){
                    if(result[i].fullPath == data.folderPath){
                        folders.id = result[i].folderId;
                        folders.folderPath = result[i].folderPath;
                        folders.fullPath = result[i].fullPath;
                        folders.folderName = result[i].folderName;
                        folders.parentFolderId = result[i].parentFolderId;
                        folders.permissions = result[i].permissions;
                        folders.accesses = result[i].accesses;
                        folders.priority = result[i].priority;
                        isParentFolderFound = true;
                    }
                }
                if(!isRoot && !isParentFolderFound){
                    callback(false, "Given Folder path does not exist!");
                    return;
                }
                if(isRoot){
                    folders.folderId = "0";
                    folders.folderPath = "/home";
                    folders.fullPath = "/home";
                    folders.folderName = "home";
                    folders.permissions = "RW";
                    folders.accesses = "FULL";
                    folders.priority = "NORMAL";
                }
                folders.subFolders = [];
                for(let i = 0; i < result.length; i++){
                    if(result[i].fullPath != data.folderPath){
                        let folder = {};
                        folder.folderId = result[i].folderId;
                        folder.folderName = result[i].folderName;
                        folder.folderPath = result[i].folderPath;
                        folder.fullPath = result[i].fullPath;
                        folder.parentFolderId = result[i].parentFolderId;
                        folder.createdOn = result[i].createdOn;
                        folder.permissions = result[i].permissions;
                        folder.accesses = result[i].accesses;
                        folder.priority = result[i].priority;
                        folders.subFolders.push(folder);
                    }
                }
                callback(true,folders);
                return;
            }
            else{
                callback(false,"Folder tree retrieval failed!");
                return;
            }
        });
    }

    createFolder(req, callback) {
        let data = {};
        data.folderName = req.body.folderName;
        data.folderPath = req.body.folderPath;
        data.fullPath = data.folderPath + '/' + data.folderName;
        //-----------------------------------------------------//
        data.folderId = "F"+Date.now().toString(36);
        data.owner = userService.getUserName(req.cookies.seid);
        data.permissions = "RW";
        data.accesses = "FULL";
        data.parentFolderId = (req.body.parentFolderId == undefined) ? 'unknown' : req.body.parentFolderId;
        data.priority = "NORMAL";

        if(data.folderPath == "/home"){
            data.parentFolderId = "0";
        }

        if(data.folderPath == undefined && data.parentFolderId == undefined){
            callback(false,'Folder path or parentFolderId Not provided!');
            return;
        }

        if(data.folderName.match(/^[_.]*[a-zA-Z0-9]+[a-zA-Z0-9-_\\+\\. \\(){}"':\[\]]*$/)==null){
            callback(false,"Folder name is invalid!");
            return;
        }

        // TODO need improvement
        this.getFolderByPath({ folderPath: data.fullPath,fullPath:data.folderPath, owner: data.owner, folderId: data.parentFolderId }, (result) => {
            for(let i = 0; i < result.length; i++){
                if(result[i].fullPath == data.folderPath){
                    data.parentFolderId = result[i].folderId;
                }
                if(result[i].fullPath == data.fullPath){
                    callback(false,"Folder already exists in the given path!");
                    return;
                }
            }
            if(data.parentFolderId == "unknown"){
                log.log("error","Parent folder not found! "+data.parentFolderId+" : "+data.owner);
                callback(false,"Given parent path does not exist!");
                return;
            }
            else{
                this.save(data, (result) => {
                    if(result){
                        callback(true,"Folder created successfully!");
                    }
                    else{
                        callback(false,"Folder creation failed! Server error!");
                    }
                });
            }
        });
    }
    
    deleteFolder(req, callback) {
        let data = {};
        data.folderName = req.body.folderName;
        data.fullPath = req.body.folderPath+'/'+data.folderName;
        data.folderId = req.body.folderId;
        data.owner = userService.getUserName(req.cookies.seid);

        //check request params
        this.delete(data, (result) => {
            if(result){
                callback(true,"Folder deleted successfully!");
                return;
            }
            else{
                callback(false,"Folder deletion failed!");
                return;
            }
        });
    }

    updateFolder(req, callback){
        let oldData = {}, newData = [],newDataSample = {}, statement=[], propagate = false , indexFolderPath = -1 , indexParentId = -1;
        let currentFullPath = null;
        oldData.folderName = req.body.folderName;
        oldData.folderId = req.body.folderId;
        oldData.fullPath = req.body.folderPath + '/' + oldData.folderName;
        oldData.folderPath = req.body.folderPath;
        oldData.owner = userService.getUserName(req.cookies.seid);

        if((oldData.folderId == undefined && (oldData.folderName == undefined && 
            oldData.fullPath == undefined))
            || (oldData.folderId == 'undefined' && oldData.folderName == 'undefined')
            || (oldData.folderId == null  && oldData.folderName == null )
            || (oldData.folderId == ''    && oldData.folderName == '')){
            callback(false, 'Target folder details not provided!');
            return;
        }
        if(req.body.data == undefined){
            callback(false, 'Updates are not mentioned!');
            return;
        }
        if(oldData.fullPath == '/home'){
            callback(false, 'Permission Denied! This is a read-only foder!');
            return;
        }

        if(req.body.data.folderName != undefined){
            if(req.body.data.folderName == req.body.folderName){
                callback(false,'New folder name is similar to the old name!'); return;
            }
            statement.push('folderName = ?');
            newData.push(req.body.data.folderName);
            if(req.body.data.folderPath == undefined){
                statement.push('fullPath = ?');
                newData.push(req.body.folderPath+'/'+req.body.data.folderName);
                newDataSample.folderPath = req.body.folderPath;
                newDataSample.fullPath = req.body.folderPath + '/' + req.body.data.folderName;
            }
            propagate=true;
        }
        if (req.body.data.folderPath != undefined || req.body.data.parentFolderId != undefined){
            if(req.body.folderName == undefined){
                callback(false, 'Folder name is required for changing folder location!'); return;
            }
            statement.push('folderPath = ?');
            indexFolderPath = newData.length;
            newData.push(req.body.data.folderPath);
            newDataSample.folderPath = req.body.data.folderPath;
            indexParentId = newData.length;
            statement.push('parentFolderId = ?');
            newData.push(req.body.data.parentFolderId);
            if(req.body.data.folderName != undefined){
                currentFullPath = req.body.data.folderPath + '/' + req.body.data.folderName;
                statement.push('fullPath = ?');
                newData.push(currentFullPath);
            }else{
                currentFullPath = req.body.data.folderPath + '/' + oldData.folderName;
                statement.push('fullPath = ?');
                newData.push(currentFullPath);
            }
            newDataSample.fullPath = currentFullPath;
            propagate = true;
        }

        // --------non-recursive actions-----------
        if (req.body.data.permissions != undefined || req.body.data.priority != undefined ||
            req.body.data.accesses != undefined){
            if (statement.length > 0) {
                callback(false, 'Folder permission can not be changed with Name and Location update!');
                return;
            }
        }
        if(req.body.data.permissions != undefined){
            statement.push('permissions = ?');
            newData.push(req.body.data.permissions);
            propagate = false;
        }
        if (req.body.data.folderAccess != undefined) {
            statement.push('accesses = ?');
            newData.push(req.body.data.folderAccess);
            propagate = false;
        }
        if(req.body.data.priority != undefined){
            statement.push('priority = ?');
            newData.push(req.body.data.priority);
            propagate = false;
        }


        if(statement.length == 0){
            callback(false,'No valid changes menioned for this folder!');
            return;
        }
        
        newData.push(oldData.folderId);
        newData.push(oldData.folderName);
        newData.push(oldData.folderPath);
        newData.push(oldData.owner);

        if(propagate){
            req.body.data.folderPath = newDataSample.folderPath;
        }
        if (req.body.data.folderPath != undefined || req.body.data.parentFolderId != undefined) {
            this.getFolderByPath({ fullPath: oldData.fullPath, folderId: req.body.folderId, owner: oldData.owner } , (results)=>{
                if(results.length > 1) {
                    callback(false,'Duplicate Folder present in same dir!'); return;
                }
                let result = results[0];
                if (result && req.body.data !=undefined && req.body.data.folderName == result.folderName) {
                    callback(false, 'New folder name is similar to the old name!'); return;
                }
                if (result || req.body.data.folderPath == '/home'){
                    if (req.body.data.folderPath == '/home'){
                        result = {};
                        result.fullPath = '/home';
                        result.folderId = '0';
                    }
                    if(newData[indexFolderPath] != undefined && newData[indexFolderPath] != result.fullPath){
                        callback(false, 'New folder Location and parent folderId is not matching!'); return;
                    }
                    if (newData[indexParentId] != undefined && newData[indexParentId] != result.folderId) {
                        callback(false, 'New folder Location and parent folderId is not matching!'); return;
                    }
                    if(newData[indexFolderPath] == oldData.folderPath){
                        callback(false, 'New folder Location and Old folder Location is same!'); return;
                    }
                    newData[indexFolderPath] = result.fullPath;
                    newData[indexParentId] = result.folderId;
                    this.update(statement.join(','), newData, (status) => {
                        if (status) {
                            if(propagate){
                                if(oldData.folderName == undefined){
                                    oldData.fullPath = results[0].fullPath;
                                }
                                let oldPath = oldData.fullPath;
                                let newPath = newDataSample.fullPath;
                                this.updateFullPath(oldPath, newPath, oldData.owner,(status)=>{
                                    // console.log(status,oldPath,newPath,oldData.owner);
                                    if(status){
                                        callback(true, 'updated');
                                    } else {
                                        callback(false, 'SubFolder details not updated!');
                                    }
                                });
                            } else {
                                callback(true, 'updated');
                            }
                        } else {
                            callback(false, 'Updated Failed!');
                        }
                    });
                } else {
                    callback(false,'New folder location is not valid!');
                }
            });
        } else {
            this.update(statement.join(','), newData, (status) => {
                if (status) {
                    callback(true, 'updated');
                } else {
                    callback(false, 'Updated Failed!');
                }
            });
        }
    }

    
}


module.exports = new FolderService();