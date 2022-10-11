"use strict"

const DriveUtil = require('../../utilities/driveUtil');
const fileService = require('./../fileService');
const driveInfo = require('./driveInfo.js');
const log = require("./../logService");
const ChunkUploader = require('./chunkUploader.js');
const ChunkDownloader = require('./chunkDownloader.js');


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
                drive.inUseSpace = this.driveUtil.drives.ActiveDrives[i].inUseSpace;
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

    saveNewDriveToken(req, callback){
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


    uploadFile(req, callback) {
        let drive = this.driveUtil.getDrive(req.body.fileSize);
        let reset = false;
        if(drive == null && this.driveUtil.drives.length() > 0){
            let drives = this.driveUtil.getDrives(req.body.fileSize);
            if(drives){
                // get config for drives
                let configs = this.getDriveConfigs(req.body, parseInt(req.headers['content-length']), drives);
                let uploader = new ChunkUploader(configs, req.body, (status,drivesInfo)=>{
                    req.body.chunked = true;
                    req.body.nodesInfo = drivesInfo;
                    if(status){
                        callback(true, 'File uploaded');
                    }
                    configs.forEach(config => {
                        config.drive.clear(config.size);
                    });
                });

                req.pipe(uploader);
                req.on('close', () => {
                    req.unpipe();
                    uploader.clearUploads();
                });
            } else {
                callback(false, 'Storage full! File can not be saved!');
            }
        } else if (this.driveUtil.drives.length() == 0){
            callback(false, 'There is no active Drive found!');
        }else{
            let iscancelled = false;
            drive.set(parseInt(req.headers['content-length']));
            req.on('close', () => {
                iscancelled = true;
                if(!reset) drive.clear(parseInt(req.headers['content-length']));
                reset = true;
            });
            drive.drive.writeFile(req.body.fileName,req.body.mimetype,req,(status,resp)=>{
                if(!reset) drive.clear(parseInt(req.headers['content-length']));
                reset = true;
                if(iscancelled){
                    drive.drive.deleteFile(resp.id,(status,data)=>{
                        if(!status) log.error(data);
                    });
                    return;
                }
                if (status) {
                    req.body.chunked = false;
                    req.body.nodeId = resp.id;
                    req.body.fileSize = resp.size;
                    req.body.driveId = drive.id;
                    drive.update(parseInt(req.body.fileSize));
                    callback(true,'File uploaded');
                } else{
                    callback(false,'Failed to save this file! code : ERRDRV');
                }
            });
        }
    }

    downloadFile(req, callback){
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
                    callback(true, resp);
                } else{
                    callback(false,'Failed to download this file! code : ERRDRV');
                }
            });
        }
    }

    downloadChunkedFile(nodes, callback){
        if(nodes.length < 2){
            callback(false, 'Part of this file not present in system!');
            log.error('Chunk length less than 2 \n'+JSON.stringify(nodes));
            return;
        }
        for(let i=0;i<nodes.length;i++){
            let driveInfo = this.driveUtil.getDriveById(nodes[i].driveId);
            if (driveInfo == null) {
                callback(false, 'The system cannot find the file specified');
                return;
            } else {
                nodes[i].drive = driveInfo.drive;
            }
        }
        let downloader = new ChunkDownloader(nodes,(status,data)=>{
            callback(status, data);
        })
    }


    deleteFile(req, callback){
        let drive = this.driveUtil.getDriveById(req.body.driveId);
        if (drive == null && this.driveUtil.drives.length() > 0) {
            callback(false, 'The system cannot find the file specified');
        } else if (this.driveUtil.drives.length() == 0) {
            callback(false, 'There is no active Drive found!');
        } else if (drive.drive == null) {
            callback(false, 'Drives not intiated. Please wait for 10 seconds!');
        } else {
            drive.drive.deleteFile(req.body.nodeId, (status, resp) => {
                if (status) {
                    drive.update((parseInt(req.body.fileSize) * -1));
                    callback(true, resp);
                } else {
                    callback(false, 'Failed to download this file! code : ERRDRV');
                }
            });
        }
    }

    getDriveConfigs(reqBody,size, drives){
        let fileSize = parseInt(size);
        let drivesCount = drives.length , i = 0;
        let driveConfig = [];
        while(fileSize > 0 && drivesCount > 0){
            let config = {
                triggered:false,
                drive: drives[i],
                size: (drives[i].freeSpace < fileSize) ? drives[i].freeSpace - 65536 : fileSize,
            };
            config.drive.set(config.size);
            driveConfig.push(config);
            fileSize -= (drives[i].freeSpace - 65536);
            i++;
        }
        return driveConfig;
    }

}

module.exports = new DriveService();