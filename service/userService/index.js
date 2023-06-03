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
        db.get('SELECT userName,createdOn,profile,role FROM Users WHERE userName = ?', [user], (err, row) => {
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

    save(data, callback) {
        let user = data.user;
        let userRole = (UserConfig != undefined && UserConfig.defaultRole != undefined)?UserConfig.defaultRole:'user1';
        let profilePic = data.userProfilePic;
        let password = crypto.createHash('sha256').update(data.password + UserConfig.salt).digest('hex');
        db.run('INSERT INTO Users (userName,password,role,profile) VALUES (?,?,?,?)', [user, password, userRole, profilePic], (err) => {
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
                if (row == undefined && row != false) callback(false);
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
            this.verifyUser(req.body, (status, userInfo) => {
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
        }
    }

    userRegister(req, res, callback) {
        if (UserConfig != undefined && UserConfig.userRegisteration == false){
            callback(false, 'New user signup is not allowed! please contact admin('+UserConfig.adminEmail+').');
            return;
        }
        req.body.userProfilePic = '';
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
    
}

var userService = new UserService();

module.exports = userService;