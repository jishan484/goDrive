const Drive = require('../../utilities/driveUtil');
const driveInfo = require('./driveInfo.js');
const log = require("./../logService");


class DriveService{
    addNewDrive(req, callback){
        let type = req.body.type;
        switch(type){
            case 'googleDrive':
                let drive = new Drive();
                let res = drive.createDrive('googleDrive', req.body.redirectURL);
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
            let drive = new Drive();
            let res = drive.activateDrive({type:'googleDrive',code:code},(status,drive)=>{
                if(status){
                    // save the token to database
                    
                    driveInfo.saveDrive(drive,(status,data)=>{
                        if(status)
                            callback(status, 'Google Drive saved');
                        else callback(status, 'Failed to save new Google drive!');
                        return;
                    });
                } else{
                    callback(false, 'Failed to save new GDrive account!');
                    return;
                }              
            });
        }
    }
}

module.exports = new DriveService();