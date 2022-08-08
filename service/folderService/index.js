const db = require("../../database");
const userService = require("./../userService");


class FolderService {
    constructor(folderRepository) {
        console.log("[DLOG] folder service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    getById(data, callback) {
        let folder = data.folderId;
        db.get('SELECT * FROM Folders WHERE folderId = ?', [folder], (err, row) => {
            if (err) callback(false);
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }

    getFolderByPath(data, callback) {
        let path = data.fullPath;
        let owner = data.owner;
        let parentFolderId = data.parentFolderId;
        db.all("SELECT * FROM Folders where ( fullPath = ? or parentFolderId = ? ) and owner = ?",
            [path, parentFolderId, owner], (err, row) => {
                if (err) {
                    console.log(err);
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
            if (err) callback(false);
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
                if (err) callback(false);
                else callback(true);
            });
    }

    update(data, type, callback) {
        if (type == 'folderName') {
            let folderName = data.folderName;
            let folderId = data.folderId;
            db.run('UPDATE Folders SET folderName = ?, modifiedOn=CURRENT_TIMESTAMP WHERE folderId = ?', [folderName, folderId], (err) => {
                if (err) callback(false);
                else callback(true);
            });
        }
    }

    delete(data, callback) {
        let fullPath = data.fullPath;
        let folderId = data.folderId;
        let owner = data.owner;

        db.run('DELETE FROM Folders WHERE ( folderId = ? or fullPath = ? ) and owner = ?', [folderId,fullPath,owner], (err) => {
            if (err) callback(false);
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
                    if(result.fullPath == data.folderPath){
                        folders.id = result.folderId;
                        folders.folderPath = result.fullPath;
                        folders.folderName = result.folderName;
                        folders.parentFolderId = result.parentFolderId;
                        folders.permissions = result.permissions;
                        folders.accesses = result.accesses;
                        folders.priority = result.priority;
                        isParentFolderFound = true;
                    }
                }
                if(!isRoot && !isParentFolderFound){
                    callback(false, "Given Folder path does not exist!");
                    return;
                }
                if(isRoot){
                    folders.folderId = "0";
                    folders.folderPath = "/";
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
        data.parentFolderId = 'unknown';
        data.priority = "NORMAL";

        if(data.folderPath == "/home"){
            data.parentFolderId = "0";
        }

        this.getFolderByPath({ fullPath: data.folderPath, owner: data.owner, parentFolderId: data.parentFolderId }, (result) => {
            for(let i = 0; i < result.length; i++){
                if(result[i].fullPath == data.folderPath){
                    data.parentFolderId = result[i].folderId;
                    console.log("ooi");
                }
                if(result[i].fullPath == data.fullPath){
                    callback(false,"Folder already exists in the given path!");
                    return;
                }
            }
            if(data.parentFolderId == "unknown"){
                console.log("[DLOG] Parent folder not found!");
                callback(false,"Given parent path does not exist!");
                return;
            }
            else{
                this.save(data, (result) => {
                    if(result){
                        callback(true,"Folder created successfully!");
                        return;
                    }
                    else{
                        callback(false,"Folder creation failed! Server error!");
                        return;
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

}


// db.all('SELECT * FROM Folders where folderPath="/home" and owner="jishan"',(err, rows) => {
//     if (err) callback(false);
//     else {
//         console.log(rows);
//     }
// });


module.exports = new FolderService();