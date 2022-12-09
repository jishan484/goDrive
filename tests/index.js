const fs = require('fs');
const db = require('../database');

async function runAllTests(){
    await db.init_database();
    let testFiles = fs.readdirSync(__dirname);
    testFiles = testFiles.filter((elem)=>{
        return elem != 'assert.js' && elem != 'index.js';
    });
    for(let i=0;i<testFiles.length;i++){
        await wait();
        require(__dirname + '/' + testFiles[i]).Test();
    }
}

runAllTests();


async function wait() {
    return new Promise(async (resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
}