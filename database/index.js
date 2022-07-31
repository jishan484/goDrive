const fs = require("fs");
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
checkDBFile();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


init_database();

function checkDBFile() {
    if (!exists) {
        console.log('[DLOG] Database not found, creating a new one!');
        fs.openSync(dbFile, "w");
    }
}

function init_database() {
    console.log('[DLOG] Databse initialized!');
    db.serialize(() => {
        if (!exists) {
            db.run("CREATE TABLE DATABASECHANGES (id INTEGER PRIMARY KEY AUTOINCREMENT,QueryId TEXT, changeVersion TEXT, updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)");
        }
        reloadDBSchema();
    });
}

async function reloadDBSchema()
{
    let DBChanges = require("./DBschema");
    DBChanges.changes.forEach(element => {
        db.get("SELECT * FROM DATABASECHANGES WHERE QueryId = ?", element.QueryId, (err, row) => {
            if (err) {
                console.log(err);
            }
            if (!row) {
                db.run(element.query, (err) => {
                    if (err) {
                        console.log('[DBschema-ERROR]',err);
                    }
                    else{
                        db.run("INSERT INTO DATABASECHANGES (QueryId, changeVersion) VALUES (?, ?)", element.QueryId, element.version, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            }
        });
    });
}

module.exports=db;