const jwt = require('jsonwebtoken');

class UserService {
    constructor()
    {
        console.log("[DLOG] user service initialized!");
    }

    isLoggedIn(req) {
        if(req.cookies == undefined) return false;
        const token = (req.cookies.seid);
        if(token == 'undefined') return false;
        try {
            const decoded = jwt.verify(token, "process.env.JWT_SECRET");
            return true;
        } catch (err) {
            return false;
        }
    }

    getToken(req) {
        let user = req.body.user;
        let token = jwt.sign({
            id: user
        }, "process.env.JWT_SECRET");
        return token;
    }

    async verifyUser(req) {
        let user = req.body.user;
        let password = req.body.password;
        if(user == "jishan" && password == "jishan007"){
            return true;
        }
        else{
            return false;
        }
    }

    async userLogin(req , res)
    {
        if(await this.verifyUser(req))
        {
            let token = this.getToken(req);
            res.cookie('seid', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
                sameSite: true,
                secure: true
            });
            return true;
        }
        else{
            return false;
        }
    }

    userLogout(res)
    {
        res.clearCookie('seid');
    }

}

var userService = new UserService();

module.exports = userService;