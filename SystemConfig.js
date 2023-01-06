const RouterConfig = {
    // If a user is not authorize , then redirect to
    force_login_redirect_urn : "/"
    // uri for home page for MiFi file storage
   ,home_page_urn : '/home',
    // uri for admin home page
    admin_home_page_urn : '/admin/home',
    // port to listen if not provided in command line/ env variable
    // priority : command line > env variable > default_port
    default_port : 8080,
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
    databaseType: 'sqlite3',  // type 'mysql,miradb,sqlite3,postgreSQL'
    host:'',
    databaseName:'',
    userName:'',
    password:'',
    port: 3306, //depends on db type [mysql:3306,postgreSQL:5432]
}


module.exports = { RouterConfig, UserConfig, SyatemConfig, DatabaseConfig };