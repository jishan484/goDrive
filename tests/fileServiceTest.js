let assert = require('./assert.js');

module.exports.Test = async () => {
    console.log(" [TLOG-STATUS]   Starting FileServiceTests");
    await createFileTest();
    await getFilesTest().then(async files=>{
        if(files.length >= 1){
            let file = files[0];
            await updateFileTest();
            await getFilesTest2();
            await updateFileTest2();
            await updateFileTest();
            await updateFileTest3();
            await updateFileTest4();
            // delete can't be tested using this method
            // test it manually by uploading a file and then deleting it from browser
        }
    })
    await clearDb();
}

async function createFileTest() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.filePath = '/home';
        data.body.fileName = 'Test.txt';
        data.body.fileType = 'text/plain';
        data.body.driveId = 'UI0909';
        data.body.fileSize = 0;
        data.body.owner = 'test';
        data.body.nodeId = 'DV088';
        
        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let fileService = require('../service/fileService');
        fileService.saveFile(data, (status, message) => {
            assert.equals(status, true);
            fileService.saveFile(data, (status2, message2) => {
                assert.equals(status2, true);
                resolve(true);
            });
        });
    });
}

async function getFilesTest() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.filePath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let fileService = require('../service/fileService');
        fileService.getFiles(data, async (status, resp) => {
            assert.equals(status, true);
            assert.equals(resp.files.length > 0, true);
            resolve(resp.files);
        });
    });
}

async function getFilesTest2(file) {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.filePath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let fileService = require('../service/fileService');
        fileService.getFiles(data, async (status, resp) => {
            assert.equals(status, true);
            assert.equals(resp.files.length == 1, true);
            resolve(resp.files);
        });
    });
}

async function updateFileTest() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.fileName = 'Test.txt';
        data.body.filePath = '/home';
        data.body.updates.fileName = 'test.txt';
        data.body.updates.filePath = '/home/test';
        data.body.updates.parentFolderId = 'DV088';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let fileService = require('../service/fileService');
        fileService.updateFile(data, async (status, message) => {
            assert.equals(status, true);
            assert.equals(message == 'File details updated', true);
            if (!status) {
                console.log(message);
            }
            resolve(true);
        });
    });
}

async function updateFileTest2() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.fileName = 'test.txt';
        data.body.filePath = '/home/test';
        data.body.updates.fileName = 'test.txt';
        data.body.updates.filePath = '/home/test';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let fileService = require('../service/fileService');
        fileService.updateFile(data, async (status, message) => {
            assert.equals(status, false);
            assert.equals(message == 'No updates found!', true);
            resolve(true);
        });
    });
}

async function updateFileTest3() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.fileName = 'Test.txt';
        data.body.filePath = '/home';
        data.body.updates.fileName = 'test.txt';
        data.body.updates.filePath = '/home/test';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let fileService = require('../service/fileService');
        fileService.updateFile(data, async (status, message) => {
            assert.equals(status, false);
            assert.equals(message == 'File Not Found!', true);
            resolve(true);
        });
    });
}

async function updateFileTest4() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.fileName = 'test.txt';
        data.body.filePath = '/home/test';
        data.body.updates.fileName = 'Test.txt';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let fileService = require('../service/fileService');
        fileService.updateFile(data, async (status, message) => {
            assert.equals(status, true);
            assert.equals(message == 'File details updated', true);
            resolve(true);
        });
    });
}


async function clearDb() {
    return new Promise((resolve) => {
        let db = require('../database');
        db.run('DELETE FROM Files where owner = "test"', async (err) => {
            if (!err) {
                console.log(' [TLOG]   DB cleared for all test data! [file: fileServiceTest.js]');
            } else {
                console.log(err)
            }
            resolve(true);
        });
    });
}