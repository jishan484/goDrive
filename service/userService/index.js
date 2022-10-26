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
        db.get('SELECT * FROM Users WHERE userName = ? AND password = ?', [user, password], (err, row) => {
            if (err) {
                callback(false);
                log.log("error", err);
            }
            else {
                if (row == undefined && row != false) callback(false);
                else callback(true);
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

    getUserName(token) {
        return jwt.verify(token, "process.env.JWT_SECRET").id;
    }

    isLoggedIn(req){
        if (req.cookies == undefined) return false;
        const token = (req.cookies.seid);
        if (token == 'undefined') return false;
        try {
            let decoded = jwt.verify(token, "process.env.JWT_SECRET");
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
            const decoded = jwt.verify(token, "process.env.JWT_SECRET");
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
                extendSession.res.cookie('seid', this.getUserToken({ user: decoded.id,modKey:decoded.modKey }), {
                    httpOnly: (SyatemConfig != undefined && SyatemConfig.onlyHTTPCookie != undefined) ? SyatemConfig.onlyHTTPCookie : true,
                    maxAge: (SyatemConfig != undefined && SyatemConfig.cookieMaxAge != undefined) ? SyatemConfig.cookieMaxAge * 1000 : 1000 * 60 * 60,
                    sameSite: true,
                    overwrite: true,
                    secure: (SyatemConfig != undefined && SyatemConfig.secureCookie != undefined) ? SyatemConfig.secureCookie : true
                });
                console.log('cookie refreshed')
            }
            return true;
        } catch (err) {
            log.log("error",err);
            return false;
        }
    }

    getUserToken(data) {
        let user = data.user;
        let modKey = (data.modKey != undefined && data.modKey != null)?data.modKey:Math.random().toString(36).substr(2, 7);
        let token = jwt.sign({
            id: user,
            modKey: modKey,
        }, "process.env.JWT_SECRET", {
            expiresIn: (SyatemConfig != undefined && SyatemConfig.cookieMaxAge != undefined) ? SyatemConfig.cookieMaxAge * 1000 : 1000 * 60 * 60,
        });
        return token;
    }

    userLogin(req, res, callback) {
        this.verifyUser(req.body, (status) => {
            if (status) {
                let token = this.getUserToken(req.body);
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

    userRegister(req, res, callback) {
        if (UserConfig != undefined && UserConfig.userRegisteration == false){
            callback(false, 'New user signup is not allowed!');
            return;
        }
        req.body.userProfilePic = '';
        this.get(req.body,(result)=>{
            if(!result){
                this.save(req.body, (status) => {
                    if (status) {
                        let token = this.getUserToken(req.body);
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
                callback(false, 'UserName not allowed / already exist!');
            }
        });
    }

    userLogout(res) {
        res.clearCookie('seid');
    }
    
}

var userService = new UserService();

module.exports = userService;