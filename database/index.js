const log = require("./../service/logService");
const {DatabaseConfig} = require('../SystemConfig.js');
const fs = require("fs");
let dir = '.data';
const dbFile = dir + "/sqlite.db";
const exist = fs.existsSync(dbFile);
var db = null;

if(DatabaseConfig.databaseType == 'mysql'){
    db = require('./mysql.js');
} else if(DatabaseConfig.databaseType == 'sqlite3') {
    initSqlite();
}

init_database();

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

function init_database() {
    log.log('debug','Databse initialized!');
    db.serialize(() => {
        if (!exist) {
            db.status = false;
        } else {
            db.status = true;
        }
        db.run("CREATE TABLE IF NOT EXISTS DATABASECHANGES (id INTEGER PRIMARY KEY AUTOINCREMENT,QueryId TEXT, changeVersion TEXT, updatedOn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");
        let DBChanges = require("./DBschema");
        reloadDBSchema(DBChanges.changes.firstOrder);
        setTimeout(() => {
            reloadDBSchema(DBChanges.changes.secondOrder);
        },1500);
    });
}

async function reloadDBSchema(changes)
{
    changes.forEach(element => {
        db.get("SELECT * FROM DATABASECHANGES WHERE QueryId = ?", [element.QueryId], (err, row) => {
            if (err) {
                log.log('error',err);
            }
            if (!row) {
                db.run(element.query, (err) => {
                    if (err) {
                        log.log('error','[DBschema-ERROR]' + err);
                    }
                    else{
                        db.run("INSERT INTO DATABASECHANGES (QueryId, changeVersion) VALUES (?, ?)", [element.QueryId, element.version], (err) => {
                            if (err) {
                                log.log('error',err);
                            } else {
                                log.log('debug', element.comment + ' : ' + 'Completed');
                            }
                        });
                    }
                });
            }
        });
    });
}

module.exports=db;