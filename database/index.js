const fs = require("fs");
let dir = '.data';
const dbFile = dir+"/sqlite.db";
const log = require("./../service/logService");
const exist = fs.existsSync(dbFile);
checkDBFile();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


init_database();


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
            db.run("CREATE TABLE DATABASECHANGES (id INTEGER PRIMARY KEY AUTOINCREMENT,QueryId TEXT, changeVersion TEXT, updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)");
        }
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
        db.get("SELECT * FROM DATABASECHANGES WHERE QueryId = ?", element.QueryId, (err, row) => {
            if (err) {
                log.log('error',err);
            }
            if (!row) {
                db.run(element.query, (err) => {
                    if (err) {
                        log.log('error','[DBschema-ERROR]',err);
                    }
                    else{
                        db.run("INSERT INTO DATABASECHANGES (QueryId, changeVersion) VALUES (?, ?)", element.QueryId, element.version, (err) => {
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