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
        let parentFolderPath = data.parentFolderPath;
        // one fullPath for parentDri and another one for targeted dir
        db.all("SELECT * FROM Folders where ( fullPath = ? or fullPath = ? or folderPath= ? or folderId = ? ) and owner = ?",
            [fullPath, folderPath, parentFolderPath, folderId, owner], (err, row) => {
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
        db.run('UPDATE Folders SET ' + subquery + ', modifiedOn=CURRENT_TIMESTAMP WHERE (folderId = ? OR (fullPath = ? )) and owner = ?', data, (err) => {
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
            callback(false,'Folder path or parentFolderId Not provided!',101);
            return;
        }

        if(data.folderName.match(/^[_.]*[a-zA-Z0-9]+[a-zA-Z0-9-_\\+\\. \\(){}"':\[\]]*$/)==null){
            callback(false,"Folder name is invalid!",102);
            return;
        }

        // TODO need improvement
        this.getFolderByPath({ folderPath: data.fullPath,fullPath:data.folderPath, owner: data.owner, folderId: data.parentFolderId }, (result) => {
            for(let i = 0; i < result.length; i++){
                if(result[i].fullPath == data.folderPath){
                    data.parentFolderId = result[i].folderId;
                }
                if(result[i].fullPath == data.fullPath){
                    callback(false,"Folder already exists in the given path!",111);
                    return;
                }
            }
            if(data.parentFolderId == "unknown"){
                log.log("error","Parent folder not found! "+data.fullPath+" : "+data.owner);
                callback(false,"Given parent path does not exist!",103);
                return;
            }
            else{
                this.save(data, (result) => {
                    if(result){
                        callback(true,"Folder created successfully!",19);
                    }
                    else{
                        callback(false,"Folder creation failed! Server error!",122);
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
        let oldData = {} , newData = {} , statement=[] , dataset=[] , propagate=false;
        // must have oldData : folderId , (folderName,folderPath)
        oldData.folderId = req.body.folderId;
        oldData.fullPath = req.body.folderPath + '/' + req.body.folderName;
        oldData.owner = userService.getUserName(req.cookies.seid);
        //check old data
        if (req.body.folderPath == undefined || (oldData.folderId == undefined && (req.body.folderName == undefined && req.body.folderPath == undefined))
            || (oldData.folderId == 'undefined' && req.body.folderName == 'undefined')
            || (oldData.folderId == '' && req.body.folderName == '')) {
            callback(false, 'Target folder details not provided!');
            return;
        }
        // few validation before checking updated data
        if (req.body.data == undefined) {
            callback(false, 'Updates are not mentioned!');
            return;
        }
        if (Object.keys(req.body.data).length == 0){
            callback(false,'No valid changes menioned for this folder!');
            return;
        }
        if (oldData.fullPath == '/home') {
            callback(false, 'Permission Denied! This is a read-only foder!');
            return;
        }
        //update which needs propagation
        if(req.body.data.folderName != undefined || req.body.data.folderPath != undefined){
            if(req.body.data.folderPath == req.body.folderPath){
                callback(false,'New folder Location and Old folder Location is same!'); return;
            }
            if (req.body.data.permissions != undefined || req.body.data.priority != undefined ||
                req.body.data.accesses != undefined) {
                callback(false, 'Folder permission can not be changed with Name and Location update!'); return;
            }
            this.getFolderByPath({ fullPath: oldData.fullPath,folderPath:req.body.data.folderPath, parentFolderPath: req.body.folderPath, folderId: oldData.folderId, owner: oldData.owner }, (results) => {
                let result = null , targetFolderPath = {};
                for (let i = 0; i < results.length; i++) {
                    if (results[i].fullPath == oldData.fullPath || results[i].folderId == oldData.folderId) {
                        result = results[i]; if(req.body.data.folderPath == undefined) break;
                    }
                    if(results[i].fullPath == req.body.data.folderPath){
                        targetFolderPath = results[i];
                    }
                }
                // some more validation
                if(result == undefined || result == null){
                    callback(false, "Sourse folder is not valid!"); return;
                }
                if (req.body.data.folderPath != undefined && targetFolderPath.folderPath == undefined && req.body.data.folderPath != '/home'){
                    callback(false,"New folder location is not valid!"); return;
                }
                if (req.body.data.folderPath != undefined && targetFolderPath.folderPath == result.fullPath) {
                    callback(false, "New folder location is inside the source folder"); return;
                }
                // check and prepare update statement
                if(req.body.data.folderName != undefined){
                    statement.push('folderName=?');
                    dataset.push(req.body.data.folderName);
                    newData.folderName = req.body.data.folderName;
                }
                if (req.body.data.folderPath != undefined) {
                    statement.push('folderPath=?');
                    dataset.push(req.body.data.folderPath);
                    newData.folderPath = req.body.data.folderPath;
                    if(req.body.data.folderPath == '/home'){
                        statement.push('parentFolderId = ?');
                        dataset.push("0");
                    } else {
                        statement.push('parentFolderId = ?');
                        dataset.push(targetFolderPath.folderId);
                    }
                }

                newData.fullPath = (req.body.data.folderPath != undefined)?req.body.data.folderPath:result.folderPath
                newData.fullPath +='/'
                newData.fullPath +=(req.body.data.folderName!=undefined)?req.body.data.folderName:result.folderName;
                statement.push('fullPath= ? ');
                dataset.push(newData.fullPath);

                if (newData.fullPath == result.fullPath){
                    callback(false, 'Updated name and path is similar to the old details!'); return;
                }
                // check if any folder present with updated name in new or old path
                for (let i = 0; i < results.length; i++) {
                    if(results[i].fullPath == newData.fullPath){
                        callback(false,'Duplicate Folder present in same dir!'); return;
                    }
                }
                dataset.push(result.folderId);
                dataset.push(result.fullPath);
                dataset.push(result.owner);
                this.update(statement.join(','), dataset, (status) => {
                    if (status) {
                        this.updateFullPath(result.fullPath, newData.fullPath, oldData.owner, (status) => {
                            if (status) {
                                callback(true, 'updated');
                            } else {
                                callback(false, 'SubFolder details not updated!');
                            }
                        });
                    } else {
                        callback(false, 'Updated Failed!');
                    }
                });
            });
        }else{
            if (req.body.data.permissions != undefined) {
                statement.push('permissions = ?');
                newData.push(req.body.data.permissions);
                propagate = false;
            }
            if (req.body.data.folderAccess != undefined) {
                statement.push('accesses = ?');
                newData.push(req.body.data.folderAccess);
                propagate = false;
            }
            if (req.body.data.priority != undefined) {
                statement.push('priority = ?');
                newData.push(req.body.data.priority);
                propagate = false;
            }
            dataset.push(oldData.folderId);
            if(oldData.folderId != undefined){
                dataset.push('');
            } else {
                dataset.push(oldData.fullPath);
            }
            dataset.push(oldData.owner);
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