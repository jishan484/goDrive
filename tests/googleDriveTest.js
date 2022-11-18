let assert = require('./assert.js');

module.exports.Test = ()=>{
    createDriveTest();
    getDriveTest();
    getDrivesTest();
    getDrivesMultiPartTest();
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

function getDrivesTest(){
    let Drive = require('../utilities/driveUtil/index')
    let drive = new Drive();
    drive.init();
    setTimeout(()=>{
        let res = drive.getDrives(1);
        assert.notNull(res);
        assert.equals(res.length>0,true);
        if(res.length == 1){
            let res2 = drive.getDrives(res[0].freeSpace);
            assert.notNull(res2);
            assert.equals(res2.length, 2);
            if(res2.length != 2) console.log(res2);
        }
    },10000);
}

function getDrivesMultiPartTest() {
    let Drive = require('../utilities/driveUtil/index')
    let drive = new Drive();
    drive.init();
    setTimeout(() => {
        let res = drive.getDrive(1, true);
        assert.notNull(res);
        assert.equals(res.length > 0, true);
        assert.equals(res[0].supportMultiPart, true);
    }, 10000);
}