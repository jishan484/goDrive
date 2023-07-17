const jwt = require('jsonwebtoken');
const db = require('../../database');
const { UserConfig, SyatemConfig } = require('./../../SystemConfig.js');
const { keyValidator } = require('./../keyValidation');
const log = require('./../logService');
const crypto = require('crypto');

class UserService {
    constructor() {
        log.log("debug","user service initialized!");
    }



    
    // -------------------------------------ENTITIES--------------------------------------------//

    get(data, callback) {
        let user = data.user;
        db.get('SELECT userName,createdOn,profile,status FROM Users WHERE userName = ?', [user], (err, row) => {
            if (err) {
                callback(false);
                log.log("error",err);
            }
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }

    getAll(callback){
        db.all('SELECT userName,createdOn,profile,role,status FROM Users', [], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }

    getLike(data, callback){
        let user = data.user;
        db.all('SELECT userName,createdOn,profile,role,status FROM Users WHERE userName LIKE ?', ['%'+user+'%'], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }

    save(data, callback) {
        let user = data.user;
        let userRole = data.role;
        let profilePic = data.userProfilePic;
        let password = crypto.createHash('sha256').update(data.password + UserConfig.salt).digest('hex');
        db.run('INSERT INTO Users (userName,password,role,profile,status) VALUES (?,?,?,?,1)', [user, password, userRole, profilePic], (err) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else callback(true);
        });
    }

    update(data, type, callback) {
        if (type == 'role') {
            db.run('UPDATE Users SET role = ? WHERE userName = ?', [data.role, data.user], (err) => {
                if (err) callback(false);
                else callback(true);
            });
        }
        else if (type == 'password') {
            let password = crypto.createHash('sha256').update(data.password + UserConfig.salt).digest('hex');
            db.run('UPDATE Users SET password = ? WHERE userName = ?', [password, data.user], (err) => {
                if (err) {
                    callback(false);
                    log.log("error", err);
                }
                else callback(true);
            });
        }
        else if (type == 'status') {
            db.run('UPDATE Users SET status = ? WHERE userName = ?', [data.status, data.user], (err) => {
                if (err) callback(false);
                else callback(true);
            });
        }
    }

    verifyUser(data, callback) {
        let user = data.user;
        let password = crypto.createHash('sha256').update(data.password + UserConfig.salt).digest('hex');
        db.get('SELECT * FROM Users WHERE userName = ? AND password = ? and role in ("user1","user2","user_vip")', [user, password], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                console.log(row);
                if (row == undefined && row != false) callback(false, null, "Incorrect username or password entered! Please try again.");
                else if(row.status != 1 || row.status != '1') callback(false,null,'User account is disabled!');
                else callback(true, row);
            }
        });
    }

    verifyAdmin(data, callback) {
        let user = data.user;
        let password = crypto.createHash('sha256').update(data.password + UserConfig.salt).digest('hex');
        db.get('SELECT * FROM Users WHERE userName = ? AND password = ? and role in ("super_admin","admin")', [user, password], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                if (row == undefined && row != false) callback(false);
                else callback(true, row);
            }
        });
    }



    // -------------------------------------SERVICES--------------------------------------------//

    getUser(data, callback) {
        let user = data.user;
        this.get(data, (result) => {
            if (result) {
                callback(result);
            }
            else {
                callback(false);
            }
        });
    }

    getUsers(currentUser, callback) {
        let users = {};
        users.currentUser = currentUser;
        this.getAll((result) => {
            if (result) {
                users.list = result
                callback(true, users);
            }
            else {
                callback(false,'Something went wrong!');
            }
        });
    }

    getUserName(token) {
        return jwt.verify(token, "process.env.JWT_SECRET").id;
    }

    isLoggedIn(req){
        if (req.cookies == undefined) return false;
        const token = (req.cookies.seid);
        if (token == 'undefined') return false;
        try {
            let decoded = jwt.verify(token, "process.env.JWT_SECRET");
            req.user = decoded.id;
            req.role = decoded.role;
            return true;
        } catch (err) {
            log.log("error",err);
            return false;
        }
    }

    isLoggedIn(req, modKey, status, extendSession) {
        if (req.cookies == undefined) return false;
        const token = (req.cookies.seid);
        if (token == undefined) return false;
        try {
            let decoded = jwt.verify(token, "process.env.JWT_SECRET");
            req.user = decoded.id;
            req.role = decoded.role;
            if (modKey != null && status != null)
            {
                if(keyValidator.validate(modKey,decoded))
                {
                    status.status = true;
                }
                else{
                    status.status = false;
                }
            }
            if (extendSession != undefined && extendSession.isSet && (decoded.exp-(Date.now())/1000)<=300000){
                extendSession.res.cookie('seid', this.getUserToken({ user: decoded.id,modKey:decoded.modKey }, decoded.role), {
                    httpOnly: (SyatemConfig != undefined && SyatemConfig.onlyHTTPCookie != undefined) ? SyatemConfig.onlyHTTPCookie : true,
                    maxAge: (SyatemConfig != undefined && SyatemConfig.cookieMaxAge != undefined) ? SyatemConfig.cookieMaxAge * 1000 : 1000 * 60 * 60,
                    sameSite: true,
                    overwrite: true,
                    secure: (SyatemConfig != undefined && SyatemConfig.secureCookie != undefined) ? SyatemConfig.secureCookie : true
                });
            }
            return true;
        } catch (err) {
            log.log("error",err);
            return false;
        }
    }

    isUser(req) {
        if(req.role == 'user1') return true;
        else if(req.role == 'user2') return true;
        else if(req.role == 'user_vip') return true;
        else return false;
    }

    isAdmin(req) {
        if(req.role == 'admin') return true;
        else if(req.role == 'super_admin') return true;
        else return false;
    }

    getUserToken(data, role) {
        let user = data.user;
        let modKey = (data.modKey != undefined && data.modKey != null)?data.modKey:Math.random().toString(36).substr(2, 7);
        let token = jwt.sign({
            id: user,
            modKey: modKey,
            role: role
        }, "process.env.JWT_SECRET", {
            expiresIn: (SyatemConfig != undefined && SyatemConfig.cookieMaxAge != undefined) ? SyatemConfig.cookieMaxAge * 1000 : 1000 * 60 * 60,
        });
        return token;
    }

    userLogin(req, res, callback) {
        if(req.body.accountType != undefined && req.body.accountType == 'admin'){
            this.verifyAdmin(req.body, (status, userInfo) => {
                if (status) {
                    let token = this.getUserToken(req.body, userInfo.role);
                    res.cookie('seid', token, {
                        httpOnly: (SyatemConfig != undefined && SyatemConfig.onlyHTTPCookie != undefined) ? SyatemConfig.onlyHTTPCookie : true,
                        maxAge: (SyatemConfig != undefined && SyatemConfig.cookieMaxAge != undefined) ? SyatemConfig.cookieMaxAge * 1000 : 1000 * 60 * 60,
                        sameSite: true,
                        secure: (SyatemConfig != undefined && SyatemConfig.secureCookie != undefined) ? SyatemConfig.secureCookie : true
                    });
                    callback(true);
                }
                else {
                    callback(false);
                }
            });
        } else {
            this.verifyUser(req.body, (status, userInfo,error) => {
                if (status) {
                    let token = this.getUserToken(req.body, userInfo.role);
                    res.cookie('seid', token, {
                        httpOnly: (SyatemConfig != undefined && SyatemConfig.onlyHTTPCookie != undefined) ? SyatemConfig.onlyHTTPCookie : true,
                        maxAge: (SyatemConfig != undefined && SyatemConfig.cookieMaxAge != undefined) ? SyatemConfig.cookieMaxAge * 1000 : 1000 * 60 * 60,
                        sameSite: true,
                        secure: (SyatemConfig != undefined && SyatemConfig.secureCookie != undefined) ? SyatemConfig.secureCookie : true
                    });
                    callback(true);
                }
                else {
                    callback(false, error);
                }
            });
        }
    }

    userRegister(req, res, callback) {
        if (UserConfig != undefined && UserConfig.userRegisteration == false){
            callback(false, 'New user signup is not allowed! please contact admin('+UserConfig.adminEmail+').');
            return;
        }
        if (req.body.password != null && req.body.password != undefined && req.body.password.length < 8) {
            callback(false, 'Password must be atleast 8 characters long!');
            return;
        }
        if (req.body.user != null && req.body.user != undefined && req.body.user.length < 4) {
            callback(false, 'Username must be atleast 4 characters long!');
            return;
        }
        req.body.userProfilePic = '';
        req.body.role = (UserConfig != undefined && UserConfig.defaultRole != undefined) ? UserConfig.defaultRole : 'user1';
        this.get(req.body,(result)=>{
            if(!result){
                this.save(req.body, (status) => {
                    if (status) {
                        let token = this.getUserToken(req.body, UserConfig.defaultRole);
                        res.cookie('seid', token, {
                            httpOnly: (SyatemConfig != undefined && SyatemConfig.onlyHTTPCookie != undefined) ? SyatemConfig.onlyHTTPCookie : true,
                            maxAge: (SyatemConfig != undefined && SyatemConfig.cookieMaxAge != undefined) ? SyatemConfig.cookieMaxAge * 1000 : 1000 * 60 * 60,
                            sameSite: true,
                            secure: (SyatemConfig != undefined && SyatemConfig.secureCookie != undefined) ? SyatemConfig.secureCookie : true
                        });
                        callback(true);
                    }
                    else {
                        callback(false, '502 SYSTEM_ERROR');
                    }
                }
                );
            }
            else{
                callback(false, 'UserName not allowed or already exist! Please choose another username.');
            }
        });
    }

    userLogout(res) {
        res.clearCookie('seid');
    }
    
    // create user profile from admin panel
    // only allowed for admin
    createProfile(req, callback) {
        req.body.userProfilePic = '';
        if(req.body.password != null && req.body.password != undefined && req.body.password.length < 8){
            callback(false, 'Password must be atleast 8 characters long!');
            return;
        }
        if (req.body.user != null && req.body.user != undefined && req.body.user.length < 4) {
            callback(false, 'Username must be atleast 4 characters long!');
            return;
        }
        this.get(req.body,(result)=>{
            if(!result){
                this.save(req.body, (status) => {
                    if (status) {
                        callback(true);
                    }
                    else {
                        callback(false, '502 SYSTEM_ERROR');
                    }
                }
                );
            }
            else{
                callback(false, 'UserName not allowed or already exist! Please choose another username.');
            }
        });
    }

    // update user status
    updateUserStatus(req, callback){
        if(!this.isAdmin(req)){
            callback(false, 'You are not authorized to perform this action!');
            return;
        }
        if (req.body.user == req.user || req.body.user == 'admin') {
            callback(false, 'You can not change your own status!');
            return;
        }
        if(req.body.status == 'active' || req.body.status == 'disable'){
            req.body.status = (req.body.status == 'active') ? 1 : 0;
            this.get(req.body, (result) => {
                if(result){
                    this.update(req.body, 'status', (status) => {
                        if (status) {
                            callback(true);
                        }
                        else {
                            callback(false, '502 SYSTEM_ERROR');
                        }
                    });
                } else {
                    callback(false, 'User not found!');
                }
            });
        } else {
            callback(false, 'Invalid status!');
        }
    }

    // search user
    searchUsers(req, callback){
        if(!this.isAdmin(req)){
            callback(false, 'You are not authorized to perform this action!');
            return;
        }
        let users = {};
        users.currentUser = req.user;
        this.getLike(req.body, (result) => {
            if(result){
                users.list = result;
                callback(true, users);
            } else {
                callback(false, 'User not found!');
            }
        });
    }
}

    

module.exports = new UserService();