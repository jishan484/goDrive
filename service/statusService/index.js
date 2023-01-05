const db = require("../../database");
const userService = require("./../userService");
const log = require("./../logService");


class StatusService {

    constructor() {
        log.log("debug", "Status service initialized!");
    }

    // -------------------------------------ENTITIES--------------------------------------------//

    async getTotalSizeByFileTypes(data, callback) {
        db.all("SELECT fileType,SUM(fileSize) AS size,count(id) as count FROM Files where owner = ? GROUP BY fileType",[data.owner], (err, rows) => {
            if (err) {
                log.log("error", err);
                callback(false);
            } else {
                callback(rows);
            }
        });
    }

    
    // -------------------------------------SERVICES--------------------------------------------//

    getTotalUsedSpace(req, callback) {
        req.body.owner = userService.getUserName(req.cookies.seid);
        this.getTotalSizeByFileTypes(req.body, (result) => {
            if (result) {
                let totalSize = 0;
                let totalFileCount = 0;
                let status = {};
                status.fileTypes = [];
                for (let i = 0; i < result.length; i++) {
                    totalSize += result[i].size;
                    totalFileCount += result[i].count;
                    status.fileTypes.push({
                        fileType: result[i].fileType,
                        size: result[i].size,
                        count: result[i].count
                    });
                }
                status.totalSize = totalSize;
                status.totalFileTypes = result.length;
                status.totalFileCount = totalFileCount;
                callback(true, status);
            } else {
                callback(false, "Error while getting total used space!");
            }
        });
    }
     
}

module.exports = new StatusService();