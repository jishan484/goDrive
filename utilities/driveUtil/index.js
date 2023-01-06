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
            if (this.ActiveDrives[i].name == drive.name){
                log.log('warn', 'Admin tries to add same drive account!' + drive.name);
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
            if((this.ActiveDrives[i].freeSpace + this.ActiveDrives[i].inUseSpace) > freeSpace && this.ActiveDrives[i].status == 'Active'){
                return this.ActiveDrives[i];
            }
        }
        return null;
    },

    getDrivesByFreeSpace: function (freeSpace) {
        let totalFreeSpace = 0;
        let drives = [];
        let lookup = new Array(this.ActiveDrives.length).fill(false);
        for (let i = 0; i < this.ActiveDrives.length; i++) {
            let usableSpace = (this.ActiveDrives[i].freeSpace - this.ActiveDrives[i].inUseSpace);
            if (usableSpace < 65536) continue;
            totalFreeSpace += usableSpace - 65536;
            lookup[i] = true;
        }
        if(freeSpace <= totalFreeSpace){
            for (let j = 0; (j < this.ActiveDrives.length) && (freeSpace >= 0); j++) {
                if(lookup[j] == false) continue;
                freeSpace -= (this.ActiveDrives[j].freeSpace - this.ActiveDrives[j].inUseSpace - 65536);
                drives.push(this.ActiveDrives[j]);
            }
            return drives;
        }else{
            return false;
        }
    }

}


function initDrives(resolve){
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
                    lastUsed:null,
                    inUseSpace: 0,
                    set: function(inUseSize){
                        this.inUseSpace+=inUseSize;
                    },
                    update: function(inUseSize){
                        this.freeSpace -= inUseSize;
                    },
                    clear: function(inUseSize){
                        this.inUseSpace -= inUseSize;
                    }
                };
                drives.push(driveObj);
            }
            initDrive(0, resolve);
        }
    });
}

function initDrive(index=0, resolve){
    if(index >= drives.length()) {
        resolve();
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
                if(resolve == undefined || resolve == null){
                    resolve = function(){};
                }
                initDrive(index+1, resolve);
            } else {
                drive.status = 'Deactive';
                log.log('error', 'Drive intializantion failed!');
            }
        });
    } else {
        initDrive(index + 1, resolve);
    }
}



module.exports = class Drive{
    constructor(){
        this.drives = drives;
    }

    init(){
        return new Promise((resolve, reject) => {
            initDrives(resolve);
        });
    }
    // get drive based on free space
    getDrive(fileSize){
        let drive = this.drives.getByFreeSpace(fileSize);
        if(drive && drive != null) drive.lastUsed = Date.now();
        return drive;
    }

    // get multiple drives based on free space for chunk upload
    getDrives(fileSize) {
        let drives = this.drives.getDrivesByFreeSpace(fileSize);
        if (drives && drives != null){
            drives.forEach(drive => {
                drive.lastUsed = Date.now();
            });
        }
        return drives;
    }

    getDriveById(id){
        let drive = this.drives.getById(id);
        if(drive != null){
            drive.lastUsed = Date.now();
            if (drive.status == 'Active') return drive;
            else return null;
        }
        return drive;
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