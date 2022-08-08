const jwt = require('jsonwebtoken');
const db = require('../../database');
const { UserConfig } = require('./../../SystemConfig.js');
const { keyValidator } = require('./../keyValidation');
const crypto = require('crypto');

class UserService {
    constructor() {
        console.log("[DLOG] user service initialized!");
    }



    
    // -------------------------------------ENTITIES--------------------------------------------//

    get(data, callback) {
        let user = data.user;
        db.get('SELECT userName,createdOn,profile,role FROM Users WHERE userName = ?', [user], (err, row) => {
            if (err) callback(false);
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }

    save(data, callback) {
        let user = data.user;
        let userRole = UserConfig.defaultRole;
        let profilePic = data.userProfilePic;
        let password = crypto.createHash('sha256').update(data.password + UserConfig.salt).digest('hex');
        db.run('INSERT INTO Users (userName,password,role,profile) VALUES (?,?,?,?)', [user, password, userRole, profilePic], (err) => {
            if (err) callback(false);
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
                if (err) callback(false);
                else callback(true);
            });
        }
    }

    verifyUser(data, callback) {
        let user = data.user;
        let password = crypto.createHash('sha256').update(data.password + UserConfig.salt).digest('hex');
        db.get('SELECT * FROM Users WHERE userName = ? AND password = ?', [user, password], (err, row) => {
            if (err) callback(false);
            else {
                if (row == undefined) callback(false);
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
            const decoded = jwt.verify(token, "process.env.JWT_SECRET");
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    isLoggedIn(req , modKey,status) {
        if (req.cookies == undefined) return false;
        const token = (req.cookies.seid);
        if (token == 'undefined') return false;
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
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    getUserToken(data) {
        let user = data.user;
        let token = jwt.sign({
            id: user,
            modKey: Math.random().toString(36).substr(2, 7)
        }, "process.env.JWT_SECRET");
        return token;
    }

    userLogin(req, res, callback) {
        this.verifyUser(req.body, (status) => {
            if (status) {
                let token = this.getUserToken(req.body);
                res.cookie('seid', token, {
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60,
                    sameSite: true,
                    secure: true
                });
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }

    userRegister(req, res, callback) {
        req.body.userProfilePic = '';
        this.get(req.body,(result)=>{
            if(!result){
                this.save(req.body, (status) => {
                    if (status) {
                        let token = this.getUserToken(req.body);
                        res.cookie('seid', token, {
                            httpOnly: true,
                            maxAge: 1000 * 60 * 60,
                            sameSite: true,
                            secure: true
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
                callback(false, '503 USER_ALREADY_EXISTS');
            }
        });
    }

    userLogout(res) {
        res.clearCookie('seid');
    }
    
}

var userService = new UserService();

module.exports = userService;