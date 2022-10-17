const mysql = require('mysql');
const {DatabaseConfig} = require('../SystemConfig.js');

const connection = mysql.createConnection({
    host: DatabaseConfig.host,
    user: DatabaseConfig.userName,
    password: DatabaseConfig.password,
    database: DatabaseConfig.databaseName
});
connection.serialize = function(callback){ callback(); }
connection.get = function (...arguments) {
    let callback = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = function(err,rows){
        if(rows != undefined && rows.constructor === Array){
            if (rows.length == 0) rows = false;
            else rows = rows[0];
        }
        callback(err,rows);
    }
    connection.query(...arguments);
}
connection.all = function (...arguments) {
    connection.query(...arguments);
}
connection.run = function (...arguments) {
    arguments[0] = arguments[0].replace('AUTOINCREMENT', 'AUTO_INCREMENT');
    connection.query(...arguments);
}



// connection.get = function (...arguments) {
    // connection.query(...arguments);
    // query = connection.prepare(query,arr);
    // connection.query(query,function (error, results, fields) {
    //     if (results != undefined && results.constructor === Array){
    //         if(results.length == 0) results = false;
    //         else results = results[0];
    //     }
    //     if(callback != null)
    //         callback(error, results);
    // });
// }
// connection.all = function (query, arr, callback) {
//     query = connection.prepare(query, arr);
//     connection.query(query, arr, function (error, results, fields) {
//         callback(error, results);
//     });
// }
// connection.run = function (query, arr, callback) {
//     query = query.replace('AUTOINCREMENT','AUTO_INCREMENT');
//     console.log(query)
//     connection.query(query, arr, function (error, results, fields) {
//         console.log(error)
//         if (callback != null)
//             callback(error, results);
//     });
// }

// connection.prepare = function(query,arr){
//     if (arr == undefined || arr.constructor == undefined ||arr.constructor != Array) {
//         return query;
//     }
//     for(let i=0;i<arr.length;i++){
//         query = query.replace('?',arr[i]);
//     }
//     console.log(query)
//     return query;
// }

module.exports = connection;