// prepare active drives and local drives for storage
// call setup for particular storage type
// getDrive - get drive from active drives, saves based on priority 
// local drives as fallback

const GooglDrive = require('./googleDrive.js');
const log = require('../../service/logService');
const driveInfo = require('./../../service/driveService/driveInfo.js');

drives = {
    AvaiableDrives: ['GoogleDrive','LocalDrive'],
    ActiveDrives: [],
    length :  function(){ return this.ActiveDrives.length; },
    push : function(drive){
        for(let i=0;i<this.ActiveDrives.length;i++){
            if (this.ActiveDrives[i].driveName == drive.name){
                log.log('error', 'Admin tries to add same drive account!' + drive.name);
                return;
            }
        }
        this.ActiveDrives.push(drive);
        this.refresh();
    },
    refresh: function(){
        this.ActiveDrives.sort(function (a, b) {
            if (a.priority == b.priority) return b.freeSpace - a.freeSpace;
            return b.priority - a.priority;
        });
    },
    clear: function(){
        this.ActiveDrives = [];
    },
    get: function(index = 0){
        return this.ActiveDrives[index];
    },
    getById(id){
        for (let i = 0; i < this.ActiveDrives.length; i++) {
            if (this.ActiveDrives[i].id == id) {
                return this.ActiveDrives[i];
            }
        }
        return null;
    },
    getByFreeSpace: function(freeSpace){
        for(let i = 0; i < this.ActiveDrives.length; i++){
            if(this.ActiveDrives[i].freeSpace > freeSpace && this.ActiveDrives[i].status == 'Active'){
                return this.ActiveDrives[i];
            }
        }
        return null;
    }

}


function initDrives(){
    driveInfo.getAll((storages)=>{
        if(storages){
            for(let i=0;i<storages.length;i++) {
                let drive = storages[i];
                let driveObj = {
                    name: drive.driveName,
                    type: drive.driveType,
                    priority: drive.priority,
                    drive: null,
                    id: drive.driveId,
                    token:drive.driveToken,
                    freeSpace: null,
                    status:'Uninitiated',
                    lastUsed:null
                };
                drives.push(driveObj);
            }
            initDrive(0);
        }
    });
}

function initDrive(index=0){
    if(index >= drives.length()) {
        return;
    }
    let drive = drives.get(index);
    if (drive.type == 'googleDrive' && drive.drive == null) {
        let gdrive = new GooglDrive(JSON.parse(drive.token));
        gdrive.setup((status) => {
            if (status) {
                drive.drive = gdrive;
                drive.freeSpace = gdrive.freeSpace;
                drive.token = undefined;
                drive.status = 'Active';
                initDrive(index+1);
            } else {
                drive.status = 'Deactive';
                log.log('error', 'Drive intializantion failed!');
            }
        });
    } else {
        initDrive(index + 1);
    }
}



module.exports = class Drive{
    constructor(){
        this.drives = drives;
    }

    init(){
        setTimeout(() => {
            initDrives();
        }, 2100);
    }
    // get drive based on free space
    getDrive(fileSize){
        let drive = this.drives.getByFreeSpace(fileSize);
        drive.lastUsed = Date.now();
        return drive;
    }

    getDriveById(id){
        return this.drives.getById(id);
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
            newDrive.drive.initListeners(data.code,(status,token,email)=>{
                if(status){
                    let newDriveData = {};
                    newDriveData.driveName = email;
                    newDriveData.driveType = 'googleDrive';
                    newDriveData.driveToken = JSON.stringify(token);
                    newDriveData.priority = 2; //todo
                    callback(status,newDriveData);
                    setTimeout(()=>{this.drives.clear();initDrives();},1500);
                } else callback(status,'Request failed');
            });
        }
    }
}