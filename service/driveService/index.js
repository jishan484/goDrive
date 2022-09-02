const DriveUtil = require('../../utilities/driveUtil');
const fileService = require('./../fileService');
const driveInfo = require('./driveInfo.js');
const log = require("./../logService");


class DriveService{

    constructor(){
        this.driveUtil = new DriveUtil();
        this.driveUtil.init();
        log.log('debug','Drive Manager service initialized!');
    }

    getAllDrive(callback){
        if (this.driveUtil.drives.ActiveDrives.length == 0){
            callback(false,'No Drive available!')
        }
        else{
            let allDrives = [];
            for(let i=0;i<this.driveUtil.drives.ActiveDrives.length;i++){
                let drive = {};
                drive.name = this.driveUtil.drives.ActiveDrives[i].name;
                drive.type = this.driveUtil.drives.ActiveDrives[i].type;
                drive.priority = this.driveUtil.drives.ActiveDrives[i].priority;
                drive.freeSpace = this.driveUtil.drives.ActiveDrives[i].freeSpace;
                drive.status = this.driveUtil.drives.ActiveDrives[i].status;
                drive.lastUsed = this.driveUtil.drives.ActiveDrives[i].lastUsed;
                // if (this.driveUtil.drives.ActiveDrives[i].drive != null &&
                //     this.driveUtil.drives.ActiveDrives[i].drive.storageInfo.image != null){
                //     drive.icon = this.driveUtil.drives.ActiveDrives[i].drive.storageInfo.image; 
                // } // NOT PLANNED : FUTURE UPDATE
                allDrives.push(drive);
            }
            callback(true,allDrives);
        }
    }

    addNewDrive(req, callback){
        let type = req.body.type;
        switch(type){
            case 'googleDrive':
                let res = this.driveUtil.createDrive('googleDrive', req.body.redirectURL);
                callback(true, res);
                break;
            default:
                callback(false,'Drive type is not valid');
                break;
        }
    }

    saveNewDriveToken(req,callback){
        let code = req.body.code;
        let scope = req.body.scope;
        if(scope != undefined && scope.match("google")){
            let res = this.driveUtil.activateDrive({type:'googleDrive',code:code},(status,drive)=>{
                if(status){
                    // save the token to database
                    driveInfo.getByName(drive,(row)=>{
                        if(row){
                            driveInfo.update(drive,(status)=>{
                                if(status){
                                    callback(true, 'Drive already present. New token updated!');
                                    log.log('info', 'Google Drive token updated for email ' + drive.driveName);
                                } else {
                                    callback(false, 'Drive already present. Token update failed!');
                                    log.log('error', 'Google Drive token update failed for email ' + drive.driveName);
                                }
                            });
                        } else {
                            driveInfo.saveDrive(drive, (status, data) => {
                                if (status)
                                    callback(status, 'Google Drive saved');
                                else callback(status, 'Failed to save new Google drive!');
                                return;
                            });
                        }
                    });
                } else{
                    callback(false, 'Failed to retrive new GDrive account info!');
                    return;
                }              
            });
        }
    }


    uploadFile(req,callback) {
        let drive = this.driveUtil.getDrive(req.body.fileSize);
        if(drive == null && this.driveUtil.drives.length() > 0){
            callback(false,'Storage full! File cant be saved!');
        } else if (this.driveUtil.drives.length() == 0){
            callback(false, 'There is no active Drive found!');
        }else{
            drive.drive.writeFile(req.body.fileName,req.body.mimetype,req,(status,resp)=>{
                if(status){
                    req.body.nodeId = resp.id;
                    req.body.fileSize = resp.size;
                    req.body.driveId = drive.id;
                    callback(true,'File uploaded');
                } else{
                    callback(false,'Failed to save this file! code : ERRDRV');
                }
            });
        }
    }

    downloadFile(req,callback){
        let drive = this.driveUtil.getDriveById(req.body.driveId);
        if (drive == null && this.driveUtil.drives.length() > 0) {
            callback(false, 'The system cannot find the file specified');
        } else if (this.driveUtil.drives.length() == 0) {
            callback(false, 'There is no active Drive found!');
        } else if(drive.drive == null){
            callback(false, 'Drives not intiated. Please wait for 10 seconds!');
        } else{
            drive.drive.readFile(req.body.nodeId,(status,resp)=>{
                if(status){
                    req.body.nodeId = resp.id;
                    req.body.fileSize = resp.size;
                    req.body.driveId = drive.id;
                    callback(true,resp);
                } else{
                    callback(false,'Failed to download this file! code : ERRDRV');
                }
            });
        }
    }
}

module.exports = new DriveService();