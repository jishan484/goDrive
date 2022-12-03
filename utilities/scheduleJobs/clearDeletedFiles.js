// Task will remove all files which are marked as deleted from database
// once deleted from drives, it will also remove the entry from the database
let db = require('../../database');
let logger = require('../../service/logService');
let driveService = require('../../service/driveService');
let async = require('async');



class Task{
    constructor(frequency, param){
        this.taskName = 'clearDeletedFiles';
        this.frequency = '*/1 * * * *';
        this.param = "";
    }

    async run(params, next){
        // worker thread is not required for this task as of now
        // so we are using the main thread to run this task

        db.all('SELECT * FROM Files WHERE isDeleted = 1 LIMIT 25', (err, rows) => {
            if(err){
                logger.log("error", "[clearDeletedFiles] Error while fetching files from database!");
                logger.log("error", err);
            } else {
                let fileIds = [];
                if(rows.length == 0){
                    return;
                }
                // now delete files from drive
                async.eachSeries(rows, function (file, callback) {
                    let drive = driveService.driveUtil.getDriveById(file.driveId);
                    drive.drive.deleteFile(file.nodeId, (status, resp) => {
                        if (status || resp.errors[0].reason == 'notFound') {
                            drive.update((parseInt(file.fileSize) * -1));
                            fileIds.push(file.id);
                            callback();
                        } else {
                            logger.log("error", "[clearDeletedFiles] Error while deleting file from drive!");
                            logger.log("error", resp);
                            callback();
                        }
                    }, { noLog: true });
                }, function (err) {
                    if (err) logger.log('warn', err);
                    else {
                        let deleteList = "(" + fileIds.join(',') + ")";
                        db.run('DELETE FROM Files WHERE id in '+deleteList, (err) => {
                            if (err) {
                                logger.log("error", "[clearDeletedFiles] Error while deleting file from database!");
                                logger.log("error", err);
                            } else {
                            }
                        });
                        logger.log('info', "[clearDeletedFiles] : " + rows.length + ' files deleted : ' + new Date());
                    }
                });

            }
        });

    }

}

module.exports = Task;