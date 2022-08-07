

class FolderService {
    constructor(folderRepository) {
        console.log("[DLOG] folder service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    getById(req, callback) {
        let folder = req.body.folder;
        db.get('SELECT * FROM Folders WHERE folderId = ?', [folder], (err, row) => {
            if (err) callback(false);
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }
    
}