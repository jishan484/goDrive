const db = require('../database');
let assert = require('./assert.js');

module.exports.Test = async () => {
    await createFolderTest();
    await createFolderTest2();
    await createFolderTest3();
    await updateFolderPathTest();
    await clearDb();
}


async function createFolderTest() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test37';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data,async (status, message) => {
            assert.equals(status, true);
            resolve(true);
        });
    });
}

async function createFolderTest2() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test378';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data,async (status, message) => {
            assert.equals(status, true);
            resolve(true);
        });
    });
}

async function createFolderTest3() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test38';
        data.body.folderPath = '/home/Test37';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data,async (status, message) => {
            assert.equals(status, true);
            resolve(true);
        });
    });
}

async function updateFolderPathTest() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.data = {}; data.cookies = {};
        data.body.folderName = 'Test37';
        data.body.folderPath = '/home';
        data.body.data.folderName = 'testMaster';
        data.body.data.folderPath = '/home/Test378';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data,async (status, message) => {
            assert.equals(status, true);
            db.all('SELECT * FROM Folders where owner="test" and folderName="Test38"',(err,rows)=>{
                assert.equals(rows[0].fullPath,'/home/Test378/testMaster/Test38');
                resolve(true);
            });
        });
    });
}

async function clearDb() {
    return new Promise((resolve) => {
        let db = require('../database');
        db.run('DELETE FROM Folders where owner = "test"',async (err) => {
            if (!err) {
                console.log(' [TLOG]   DB cleared for all test data! [file: folderPathUpdateTest.js]');
            } else {
                console.log(err)
            }
            resolve(true);
        });
    });
}
