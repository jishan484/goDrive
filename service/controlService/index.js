// This module is for Admin dashboard's status and controls
// Sets server settings, APIs settings, user permissions and accesses

const driveService = require('../driveService');
const log = require("../logService");
const db = require("../../database");
const {appConfig} = require("../../SystemConfig.js")

class AppControlService {
    constructor() {
        log.log('debug', 'App control service initialized!');
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    getUserAndMessageCounts(callback){
        db.all('SELECT count(id) as users FROM Users', (err, row) => {
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

   getStatus(callback){
        this.getUserAndMessageCounts(counts=>{
            let result = {};
            result.refreshRequired = false;
            result.usersCount = counts.users;
            result.drivesCount = driveService.getDriveUtil().drives.ActiveDrives.length;
            result.logsCount = 0; // TODO
            result.messagesCount = 0; //TODO
            result.serverStatus = appConfig;
            callback(true, result);
        })
   }
}


module.exports = new AppControlService();