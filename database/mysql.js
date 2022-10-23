const mysql = require('mysql');
const {DatabaseConfig} = require('../SystemConfig.js');
const log = require('../service/logService');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: DatabaseConfig.host,
    user: DatabaseConfig.userName,
    password: DatabaseConfig.password,
    database: DatabaseConfig.databaseName,
    debug: false
});


pool.serialize = function(callback){ callback(); }
pool.get = function (...arguments) {
    pool.getConnection((err, connection) => {
        if (err) {
            log.log('error',err);
        }
        else {
            let callback = arguments[arguments.length - 1];
            arguments[arguments.length - 1] = function (err, rows) {
                connection.release();
                if (rows != undefined && rows.constructor === Array) {
                    if (rows.length == 0) rows = false;
                    else rows = rows[0];
                }
                callback(err, rows);
            }
            connection.query(...arguments);
        }
    });
}
pool.all = function (...arguments) {
    pool.getConnection((err, connection) => {
        if (err) {
            log.log('error', err);
        }
        else {
            let callback = arguments[arguments.length - 1];
            arguments[arguments.length - 1] = function (err, rows) {
                connection.release();
                callback(err, rows);
            }
            connection.query(...arguments);
        }
    });
}
pool.run = function (...arguments) {
    pool.getConnection((err, connection) => {
        if (err) {
            log.log('error', err);
        }
        else {
            arguments[0] = arguments[0].replace('AUTOINCREMENT', 'AUTO_INCREMENT');
            if (arguments.length == 1) {
                connection.query(...arguments,()=>{
                    connection.release();
                });
            } else {
                let callback = arguments[arguments.length - 1];
                arguments[arguments.length - 1] = function (err, rows) {
                    connection.release();
                    callback(err, rows);
                }
                connection.query(...arguments);
            }
        }
    });
}



module.exports = pool;