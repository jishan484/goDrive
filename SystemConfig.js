const RouterConfig = {
    // If a user is not authorize , then redirect to
    force_login_redirect_uris : "/"
    // uri for home page for MiFi file storage
   ,home_page_uri : '/home'
}

const UserConfig = {
    // This can not be changed after initial setup! 
    // Changing this will break old users signin process!
    salt:'$2a$10$X.Q.T.V.Y.F.S.Y.S.alasbyqy',
    defaultRole : 'user1',
    userRegisteration : true
}

const SyatemConfig = {
    onlyHTTPCookie: true,
    // Making secureCookie false has massive security risk. Please avoid this
    // This option is only for local usages/testing and should be true in remote server
    secureCookie: false,  // make it false if site is running on http only 
    cookieMaxAge: 3600 * 1, // in seconds
    SERVER_PORT:8080
}

const DatabaseConfig = {
    databaseType: 'mysql',  // type 'mysql,miradb,sqlite3,postgreSQL'
    host: 'mifi.helioho.st',
    databaseName: 'mifi_db',
    userName: 'mifi_mifi',
    password: 'JishanMifiDb',
    port: 3306, //depends on db type [mysql:3306,postgreSQL:5432]
}



module.exports = { RouterConfig, UserConfig, SyatemConfig, DatabaseConfig };