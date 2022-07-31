const jwt = require('jsonwebtoken');
const db = require('../../database');
const { UserConfig } = require('./../../SystemConfig.js');
const crypto = require('crypto');

class UserService {
    constructor() {
        console.log("[DLOG] user service initialized!");
    }



    
    // -------------------------------------ENTITIES--------------------------------------------//

    get(req, callback) {
        let user = req.body.user;
        db.get('SELECT userName,createdOn,profile,role FROM Users WHERE userName = ?', [user], (err, row) => {
            if (err) callback(false);
            else {
                if (row == undefined) callback(false);
                else callback(row);
            }
        });
    }

    save(req, callback) {
        let user = req.body.user;
        let userRole = UserConfig.defaultRole;
        let profilePic = req.body.userProfilePic;
        let password = crypto.createHash('sha256').update(req.body.password + UserConfig.salt).digest('hex');
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

    verifyUser(req, callback) {
        let user = req.body.user;
        let password = crypto.createHash('sha256').update(req.body.password + UserConfig.salt).digest('hex');
        db.get('SELECT * FROM Users WHERE userName = ? AND password = ?', [user, password], (err, row) => {
            if (err) callback(false);
            else {
                if (row == undefined) callback(false);
                else callback(true);
            }
        });
    }



    // -------------------------------------SERVICES--------------------------------------------//




    isLoggedIn(req) {
        if (req.cookies == undefined) return false;
        const token = (req.cookies.seid);
        if (token == 'undefined') return false;
        try {
            const decoded = jwt.verify(token, "process.env.JWT_SECRET");
            return true;
        } catch (err) {
            return false;
        }
    }

    getUserToken(req) {
        let user = req.body.user;
        let token = jwt.sign({
            id: user
        }, "process.env.JWT_SECRET");
        return token;
    }

    userLogin(req, res, callback) {
        this.verifyUser(req, (status) => {
            if (status) {
                let token = this.getUserToken(req);
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
        this.get(req,(result)=>{
            if(!result){
                this.save(req, (status) => {
                    if (status) {
                        let token = this.getUserToken(req);
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