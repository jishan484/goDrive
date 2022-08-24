// prepare active drives and local drives for storage
// call setup for particular storage type
// getDrive - get drive from active drives, saves based on priority 
// local drives as fallback

const GooglDrive = require('./googleDrive.js')
const log = require('../../service/logService');

drives = {
    AvaiableDrives: ['GoogleDrive','LocalDrive'],
    ActiveDrives: [
        {name:'LocalDrive' , priority:0 , drive: null, freeSpace: 0},
    ],
    push : function(drive){
        this.ActiveDrives.push(drive);
        this.refresh();
    },
    refresh: function(){
        this.ActiveDrives.sort(function (a, b) {
            if (a.priority == b.priority) return b.freeSpace - a.freeSpace;
            return b.priority - a.priority;
        });
    },
    get: function(index = 0){
        return this.ActiveDrives[index];
    },
    getByFreeSpace: function(freeSpace){
        for(let i = 0; i < this.ActiveDrives.length; i++){
            if(this.ActiveDrives[i].freeSpace > freeSpace){
                return this.ActiveDrives[i];
            }
        }
        return null;
    }

}


// initialize all drives

// let drivesInfo = driveService.getDrivesInfo();
// drivesInfo.forEach(driveInfo => {
//     if(driveInfo.name == 'googleDrive'){

//     }
//     else if(driveInfo.name == 'oneDrive'){
//         //onedrive
//     }
//     else if(driveInfo.name == 'dropBox'){
//         //dropbox
//     }
//     else if(driveInfo.name == 'FTP'){
//         //a ftp drive
//     }
//     else{
//         //local drive
//     }
// });



module.exports = class Drive{
    constructor(){
        this.drives = drives;
    }

    // get drive based on free space
    getDrive(fileSize){
        return this.drives.getByFreeSpace(fileSize);
    }

    createDrive(type, redirectURL){
        if(type == 'googleDrive'){
            let gdrive = new GooglDrive(null, redirectURL);
            return gdrive.init();
        }
    }

    activateDrive(data,callback){
        if(data.type == 'googleDrive'){
            let newDrive = { name: 'googleDrive', priority: 1, drive: new GooglDrive(), freeSpace: 0 }
            newDrive.drive.initListeners(data.code,(status,token)=>{
                if(status){
                    let newDriveData = {};
                    newDriveData.driveName = 'GoogleDrive';
                    newDriveData.driveType = 'googleDrive';
                    newDriveData.driveToken = JSON.stringify(token);
                    newDriveData.priority = 2; //todo
                    callback(status,newDriveData);
                } else callback(status,'Request failed');
            });
        }
    }
}