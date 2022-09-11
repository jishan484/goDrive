let assert = require('./assert.js');

module.exports.Test = ()=>{
    createDriveTest();
    getDriveTest();
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