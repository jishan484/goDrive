const db = require('../database');
let assert = require('./assert.js');

module.exports.Test = async () => {
    await createFolderTest();
    await wait();
    await createFolderTest2();
    await wait();
    await updateFolderPathTest();
    clearDb();
}


function createFolderTest() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test37';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data, (status, message) => {
            assert.equals(status, true);
            resolve(true);
        });
    });
}
function createFolderTest2() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test38';
        data.body.folderPath = '/home/Test37';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data, (status, message) => {
            assert.equals(status, true);
            resolve(true);
        });
    });
}

function updateFolderPathTest() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.data = {}; data.cookies = {};
        data.body.folderName = 'Test37';
        data.body.folderPath = '/home';
        data.body.data.folderName = 'testMaster';
        data.body.data.folderPath = '/home/Test2';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data, (status, message) => {
            assert.equals(status, true);
            db.all('SELECT * FROM Folders where owner="test" and folderName="Test38"',(err,rows)=>{
                assert.equals(rows[0].fullPath,'/home/Test2/testMaster/Test38');
            });
            resolve(true);
        });
    });
}

function clearDb() {
    let db = require('../database');
    db.run('DELETE FROM Folders where owner = "test"', (err) => {
        if (!err) {
            console.log(' [TLOG]   DB cleared for all test data! [file: FolderPathUpdateTest.js]');
        } else {
            console.log(err)
        }
    });
}

function wait(){
    return new Promise((resolve) => {
        setTimeout(()=>{
            resolve(true);
        },200);
    });
}
