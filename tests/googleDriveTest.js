let assert = require('./assert.js');

module.exports.Test = ()=>{
    console.log(" [TLOG-STATUS]   Starting GoogleDriveTests.");
    createDriveTest();
    getDriveTest();
    getDrivesTest();
}

function createDriveTest(){
    let Drive = require('../utilities/driveUtil/index')
    let drive = new Drive();
    let res = drive.createDrive('googleDrive');
    assert.notNullandUndefined(res);
}

function getDriveTest(){
    let Drive = require('../utilities/driveUtil/index')
    let drive = new Drive();
    let res = drive.getDrive();
    assert.equals(res,null);
}

async function getDrivesTest(){
    let Drive = require('../utilities/driveUtil/index')
    let drive = new Drive();
    await drive.init();
    setTimeout(()=>{
        let res = drive.getDrives(0);
        assert.notNull(res);
        if(!res) return;
        assert.equals(res.length>0,true);
        if (drive.drives.ActiveDrives.length == 1){
            console.log(' [TLOG]   Skiping getDrivesTest (total drives: 1)');
            return;
        }
        if(res.length == 1){
            let res2 = drive.getDrives(res[0].freeSpace);
            assert.notNull(res2);
            assert.equals(res2.length, 2);
            if(res2.length != 2) console.log(res2);
        }
    },10);
}