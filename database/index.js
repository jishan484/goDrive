const log = require("./../service/logService");
const {DatabaseConfig} = require('../SystemConfig.js');
const fs = require("fs");
let dir = '.data';
const dbFile = dir + "/sqlite.db";
const exist = fs.existsSync(dbFile);
var db = null;

if(DatabaseConfig.databaseType == 'mysql'){
    db = require('./mysql.js');
    log.log('debug','MySQL Database config found!');
} else if(DatabaseConfig.databaseType == 'sqlite3') {
    initSqlite();
    log.log('debug','SQLite3 Database config found!');
}

function initSqlite(){
    checkDBFile();
    const sqlite3 = require("sqlite3").verbose();
    db = new sqlite3.Database(dbFile);
}
function checkDBFile() {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!exist) {
        log.log('debug','Database not found, creating a new one!');
        fs.openSync(dbFile, "w");
    }
}

db.init_database = init_database;

function init_database() {
    return new Promise((resolve, reject) => {
        log.log('debug', 'Databse initialized!');
        db.serialize(() => {
            if (!exist) {
                db.status = false;
            } else {
                db.status = true;
            }
            db.run("CREATE TABLE IF NOT EXISTS DATABASECHANGES (id INTEGER PRIMARY KEY AUTOINCREMENT,QueryId TEXT, changeVersion TEXT, updatedOn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");
            let DBChanges = require("./DBschema");
            log.log('debug', 'Executing database changes...');
            reloadDBSchema(DBChanges.changes.firstOrder).then(() => {
                reloadDBSchema(DBChanges.changes.secondOrder).then(() => {
                    log.log('debug', 'Database changes completed!');
                    resolve();
                });
            });
        });
    });
}

async function reloadDBSchema(changes)
{
    return new Promise(async (resolve, reject) => {
        for (let i = 0; i < changes.length; i++) {
            let element = changes[i];
            await new Promise((resolve, reject) => {
                db.get("SELECT * FROM DATABASECHANGES WHERE QueryId = ?", [element.QueryId], (err, row) => {
                    if (err) {
                        log.log('error', err);
                    }
                    if (!row) {
                        db.run(element.query, (err) => {
                            if (err) {
                                log.log('error', '[DBschema-ERROR]' + err);
                                resolve();
                            }
                            else {
                                db.run("INSERT INTO DATABASECHANGES (QueryId, changeVersion) VALUES (?, ?)", [element.QueryId, element.version], (err) => {
                                    resolve();
                                    if (err) {
                                        log.log('error', err);
                                    } else {
                                        log.log('debug', element.comment + ' : ' + 'Completed');
                                    }
                                });
                            }
                        });
                    } else {
                        resolve();
                    }
                });
            });
        }
        resolve();
    });
}

module.exports=db;