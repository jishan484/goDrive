let assert = require('./assert.js');

function Test1(){
    let Drive = require('../utilities/driveUtil/index')
    let drive = new Drive();
    let res = drive.createDrive('googleDrive');
    assert.notNullandUndefined(res);
}

function Test2(){
    let Drive = require('../utilities/driveUtil/index')
    let drive = new Drive();
    let res = drive.getDrive();
    assert.equals(res,null);
}

Test1();
Test2();