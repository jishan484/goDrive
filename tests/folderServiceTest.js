let assert = require('./assert.js');

module.exports.Test = async () => {
    await deleteFolderTest();
    await createFolderTest();
    await updateFolderTest();
    await updateFolderTest2();
    await updateFolderTest3();
    await updateFolderTest3a();
    await updateFolderTest3b();
    await updateFolderTest4();
    await updateFolderTest5();
    await getFoldersTest();
    await deleteFolderTest();
    await createFolderTest();
    await deleteFolderTest();
    await clearDb();
}

async function createFolderTest() {
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

async function getFoldersTest(){
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.getFolderTree(data,async (status, message) => {
            assert.equals(status, true);
            resolve(message);
        });
    });
}

async function deleteFolderTest(){
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.deleteFolder(data,async (status, message) => {
            assert.equals(status, true);
            resolve(true);
        });
    });
}

async function updateFolderTest(){
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';
        data.body.updates.folderName = 'test';
        data.body.updates.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data,async (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'New folder Location and Old folder Location is same!');
            resolve(true);
        });
    });
}

async function updateFolderTest2() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';
        data.body.updates.folderName = 'test';
        data.body.updates.folderPath = '/home/demor';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data,async (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'New folder location is not valid!');
            resolve(true);
        });
    });
}


async function updateFolderTest3() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.folderName = 'Test33';
        data.body.folderPath = '/home/Test';
        data.body.updates.folderName = 'Test2';
        data.body.updates.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data,async (status, message) => {
            assert.equals(status, true);
            folderService.updateFolder(data,async (status, message) => {
                assert.equals(status, true);
                data.body.folderPath = '/home';
                folderService.getFolderTree(data,(status2,folder)=>{
                    assert.equals(status2,true);
                    folder.subFolders.forEach((x)=>{
                        if(x.folderName == 'Test2'){
                            assert.equals(x.folderPath, '/home');
                            assert.equals(x.parentFolderId, '0');
                            resolve(true);
                        }
                    });
                });
            });
        });
    });
}

async function updateFolderTest3a() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.folderName = 'Test4';
        data.body.folderPath = '/home';
        data.body.updates.folderPath = '/home/Test2';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data,async (status, message) => {
            assert.equals(status, true);
            folderService.updateFolder(data,async (status, message) => {
                data.body.folderName = 'Test4';
                data.body.folderPath = '/home/Test2';
                folderService.getFolderTree(data,async (status2, folder) => {
                    assert.equals(status2, true);
                    folder.subFolders.forEach((x) => {
                        if (x.folderName == 'Test4') {
                            assert.equals(x.folderPath, '/home/Test2');
                            resolve(true);
                        }
                    });
                });
                assert.equals(status, true);
            });
        });
    });
}

async function updateFolderTest3b() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.folderName = 'Test4';
        data.body.folderPath = '/home/Test2/Test4';
        data.body.updates.folderName = 'Test454';
        data.body.updates.folderPath = '/home/Test2';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.createFolder(data,async (status, message) => {
            assert.equals(status, true);
            folderService.updateFolder(data,async (status, message) => {
                data.body.folderName = 'Test4';
                data.body.folderPath = '/home/Test2';
                folderService.getFolderTree(data,async (status2, folder) => {
                    assert.equals(status2, true);
                    folder.subFolders.forEach((x) => {
                        if (x.folderName == 'Test454') {
                            assert.equals(x.folderPath, '/home/Test2');
                            resolve(true);
                        }
                    });
                });
                assert.equals(status, true);
            });
        });
    });
}

async function updateFolderTest4() {
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';
        data.body.updates.folderName = 'test';
        data.body.updates.folderPath = '/home/Test';
        data.body.updates.permissions = 'RW';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data,async (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'Folder permission can not be changed with Name and Location update!');
            resolve(true);
        });
    });
}

async function updateFolderTest5() {
    console.log(" [TLOG-STATUS]   Starting FolderServiceTests.");
    return new Promise((resolve) => {
        let data = {};
        data.body = {}; data.body.updates = {}; data.cookies = {};
        data.body.folderName = 'Test';
        data.body.folderPath = '/home';

        let userService = require('../service/userService');
        data.cookies.seid = userService.getUserToken({ user: 'test' });

        let folderService = require('../service/folderService');
        folderService.updateFolder(data,async (status, message) => {
            assert.equals(status, false);
            assert.equals(message, 'No valid changes menioned for this folder!');
            resolve(true);
        });
    });
}

async function clearDb() {
    return new Promise((resolve) => {
        let db = require('../database');
        db.run('DELETE FROM Folders where owner = "test"',async (err) => {
            if (!err) {
                console.log(' [TLOG]   DB cleared for all test data! [file: folderServiceTest.js]');
            } else {
                console.log(err)
            }
            resolve(true);
        });
    });
}