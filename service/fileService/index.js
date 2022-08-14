const db = require("../../database");
const userService = require("./../userService");
const log = require("./../../logService");


class FolderService {

    constructor() {
        log.log("debug","folder service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    getByFolder(data, callback) {
        let folderId = data.folderId;
        let fullPath = data.fullPath;
        let owner = data.owner;

        db.get('SELECT * FROM Folders WHERE (parentFolderId = ? or filePath = ?) and owner = ?', [folderId,fullPath, owner], (err, row) => {
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

    getById(data, callback) {
        let folderId = data.folderId;
    }

}