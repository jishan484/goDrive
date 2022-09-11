let assert = require('./assert.js');

module.exports.Test = async () => {
    await deleteFolderTest();
    await createFolderTest();
    await updateFolderTest();
    await updateFolderTest2();
    await updateFolderTest3();
    await updateFolderTest4();
    await updateFolderTest5();
    await getFoldersTest();
    await deleteFolderTest();
    await createFolderTest();
    await deleteFolderTest();
    setTimeout(()=>{
        clearDb();
    },500);
}

function createFolderTest() {
    return new Promise((resolve)=>{
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data,(status, message) => {
            assert.equals(status, true);
            folderService.createFolder(data,(status2, message2) => {
                assert.equals(status2, false);
                resolve(true);
            });
        });
    });
}

function getFoldersTest(){
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.getFolderTree(data, (status, message) => {
            assert.equals(status, true);
            resolve(message);
        });
    });
}

function deleteFolderTest(){
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.deleteFolder(data, (status, message) => {
            assert.equals(status, true);
            resolve(true);
        });
    });
}

function updateFolderTest(){
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.data = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';
        data.body.data.folderName = 'test';
        data.body.data.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data, (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'New folder Location and Old folder Location is same!');
            resolve(true);
        });
    });
}

function updateFolderTest2() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.data = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';
        data.body.data.folderName = 'test';
        data.body.data.folderPath = '/home/demo';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data, (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'New folder location is not valid!');
            resolve(true);
        });
    });
}


function updateFolderTest3() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.data = {}; data.cookies = {};
        data.body.folderName = 'Test3';
        data.body.folderPath = '/home/Test';
        data.body.data.folderName = 'Test2';
        data.body.data.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data, (status, message) => {
            assert.equals(status, true);
            folderService.updateFolder(data, (status, message) => {
                assert.equals(status, true);
                resolve(true);
            });
        });
    });
}

function updateFolderTest4() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.data = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';
        data.body.data.folderName = 'test';
        data.body.data.folderPath = '/home/Test';
        data.body.data.permissions = 'RW';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data, (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'Folder permission can not be changed with Name and Location update!');
            resolve(true);
        });
    });
}

function updateFolderTest5() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.data = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data, (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'No valid changes menioned for this folder!');
            resolve(true);
        });
    });
}

function clearDb() {
    let db = require('../database');
    db.run('DELETE FROM Folders where owner = "test"', (err) => {
        if(!err){
            console.log(' [TLOG]   DB cleared for all test data! [file: folderServiceTest.js]');
        } else {
            console.log(err)
        }
    });
}