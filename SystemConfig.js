const RouterConfig = {
    // If a user is not authorize , then redirect to
    force_login_redirect_uris : "/"
    // uri for home page for MiFi file storage
   ,home_page_uri : '/home'
}

const UserConfig = {
    salt:'$2a$10$X.Q.T.V.Y.F.S.Y.S.alasbyqy',
    defaultRole : 'user1',
    userRegisteration : true
}


module.exports = {RouterConfig , UserConfig};