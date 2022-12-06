// Task will remove all files which are marked as deleted from database
// once deleted from drives, it will also remove the entry from the database
const db = require('../../database');
const logger = require('../../service/logService');
const driveService = require('../../service/driveService');
const async = require('async');
const request = require('request');



class Task{
    constructor(frequency ,param){
        this.taskName = 'clearDeletedFiles';
        let defaultJobParam = {};
        this.lastRun = new Date();
        this.executionTime = 0;
        // frequency can be changed from database
        this.frequency = (frequency == null) ? '*/10 * * * *' : frequency; // default frequency for the task
        this.param = (param == null) ? defaultJobParam : param;
    }

    async run(){
        // worker thread is not required for this task as of now
        // so we are using the main thread to run this task
        this.lastRun = new Date();
        this.executionTime++;
        db.all('SELECT * FROM Files WHERE isDeleted = 1 LIMIT 99', (err, rows) => {
            if(err){
                logger.log("error", "[clearDeletedFiles] Error while fetching files from database!");
                logger.log("error", err);
            } else {
                let fileIds = [];
                if(rows.length == 0){
                    return;
                }

                // put all files based on driveId in a map
                let filesMap = new Map();
                let driveIds = [];
                let deleteList = [];
                let updateList = [];

                for(let i=0;i<rows.length;i++){
                    if(filesMap.has(rows[i].driveId)){
                        filesMap.get(rows[i].driveId).push(rows[i]);
                    } else {
                        filesMap.set(rows[i].driveId, [rows[i]]);
                        driveIds.push(rows[i].driveId);
                    }
                }
                async.eachSeries(driveIds, function (driveId, callback) {
                    let drive = driveService.driveUtil.getDriveById(driveId);

                    if(drive == null){
                        logger.log("error", "[clearDeletedFiles] Drive not found for driveId: " + driveId);
                        updateList = updateList.concat(filesMap.get(driveId).map((file) => { return file.id; }));
                        callback();
                        return;
                    }

                    var authToken = drive.drive.auth.credentials.access_token;  //your OAuth2 token.
                    var boundary = "END_OF_PART";
                    var separation = "\n--" + boundary + "\n";
                    var ending = "\n--" + boundary + "--";

                    var requestBody = filesMap.get(driveId).reduce((accum, current) => {
                        accum += separation +
                            "Content-Type: application/http\n\n" +
                            "DELETE https://www.googleapis.com/drive/v3/files/" + current.nodeId +
                            "\nAuthorization: Bearer " + authToken;
                        return accum;
                    }, "") + ending;                    
                    request({
                        url: "https://www.googleapis.com/batch/drive/v3",
                        method: "POST",
                        headers: {
                            "Content-Type": "multipart/mixed; boundary=" + boundary,
                        },
                        body: requestBody
                    }, function (err, res, body) {
                        if(!err && res.statusCode == 200){
                            deleteList = deleteList.concat(filesMap.get(driveId).map((file) => { return file.id; }));
                        } else {
                            logger.log("warn", "[clearDeletedFiles] Error while deleting files from drive id: " + driveId);
                            updateList = updateList.concat(filesMap.get(driveId).map((file) => { return file.id; }));
                        }
                        callback();
                    });
                }, function (err) {
                    if(err){
                        logger.log("error", "[clearDeletedFiles] Error while deleting files from drive!");
                        logger.log("error", err);
                    } else {
                        // delete all files from database
                        let deleteIds = deleteList.join(',');
                        let updateIds = updateList.join(',');
                        if(deleteList.length > 0){
                            db.run('DELETE FROM Files WHERE id in (' + deleteIds + ')', (err) => {
                                if (err) {
                                    logger.log("error", "[clearDeletedFiles] Error while deleting file from database!");
                                    logger.log("error", err);
                                }
                            });
                        }
                        if(updateList.length > 0){
                            db.run('UPDATE Files SET isDeleted = 3 WHERE id in (' + updateIds + ')', (err) => {
                                if (err) {
                                    logger.log("error", "[clearDeletedFiles] Error while updating file in database!");
                                    logger.log("error", err);
                                }
                                logger.log('info', "[clearDeletedFiles] : " + updateList.length + ' files updated to \'Ignore\' status: ' + new Date());
                            });
                        }
                        logger.log('info', "[clearDeletedFiles] : " + deleteList.length + ' files deleted : ' + new Date());
                        // clear memory
                        deleteList = null;
                        filesMap = null;
                        driveIds = null;
                        // [todo] : job error handling
                    }
                });

            }
        });

    }

}

module.exports = Task;
