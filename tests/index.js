const fs = require('fs');
const db = require('../database');

function runAllTests(){
    let testFiles = fs.readdirSync(__dirname);
    testFiles = testFiles.filter((elem)=>{
        return elem != 'assert.js' && elem != 'index.js';
    });
    testFiles.forEach((file)=>{
        require(__dirname+'/'+file).Test();
    });
}

if(db.status){
    runAllTests();
} else {
    setTimeout(()=>{
        runAllTests();
    },1800);
}