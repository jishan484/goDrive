// Task will remove all files which are marked as deleted from database
// once deleted from drives, it will also remove the entry from the database
const db = require('../../database');
const logger = require('../../service/logService');
const driveService = require('../../service/driveService');
const async = require('async');


class Task {
    constructor(frequency, param) {
        this.taskName = 'refreshDriveInfo';
        let defaultJobParam = {};
        this.lastRun = new Date();
        this.executionTime = 0;
        // frequency can be changed from database
        this.frequency = (frequency == null) ? '*/1 * * * *' : frequency; // default frequency for the task
        this.param = (param == null) ? defaultJobParam : param;
        this.driveUtil = driveService.getDriveUtil();
    }

    async run() {
        // worker thread is not required for this task as of now
        // so we are using the main thread to run this
        this.lastRun = new Date();
        this.executionTime++;
        // retrive attached drives
        if(this.driveUtil != null){
            this.driveUtil.drives.ActiveDrives.forEach(drive => {
                if (drive.type == 'googleDrive'){
                    try {
                        drive.drive.refresh();
                        drive.freeSpace = drive.drive.freeSpace;
                    } catch (error) {
                        drive.status = 'Inactive';
                    }
                }
            });
        }
    }

}

module.exports = Task;
