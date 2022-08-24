const db = require("../../database");
const userService = require("./../userService");
const log = require("./../logService");


class DriveInfo{

    constructor(){
        log.log("debug", "Drive service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    getAll(callback){
        db.all('SELECT * FROM Drives', [], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                callback(row);
            }
        });
    }

    save(data, callback){
        let driveName = data.driveName;
        let driveId = data.driveId;
        let driveType = data.driveType;
        let drivePath = data.drivePath;
        let driveToken = data.driveToken;
        let priority =  data.priority;
               
        db.run('INSERT INTO Drives (driveName,driveId,driveType,drivePath,driveToken,priority) VALUES (?,?,?,?,?,?)', [driveName, driveId, driveType, drivePath, driveToken, priority], (err) => {
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

    saveDrive(data, callback){
        data.driveId = "D" + Date.now().toString(36);
        if(data.drivePath == undefined) data.drivePath='';
        if(data.driveToken == undefined) data.driveToken='';
        if(data.drivePath=='' && data.driveToken==''){
            callback(false,'No token or Path provided for a new drive');
            return;
        }
        if(data.priority == undefined) data.priority=0;

        this.save(data,(status)=>{
            if(status){
                callback(true,'Drive saved in database!');
            } else {
                callback(false,'Drive failed to save in database');
            }
        });
    }

}

module.exports = new DriveInfo();