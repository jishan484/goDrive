const express = require('express');
const { RouterConfig } = require('./../../SystemConfig')
const router = express.Router({ mergeParams: true });


router.post('/login', userLogin);
router.use('/logout', userLogout);
router.post('/register', userRegister);

module.exports = router;


// MiddleWares:

function userLogin(req, res) {
    if (userService.isLoggedIn(req)) {
        res.redirect(RouterConfig.home_page_uri);
    }
    else {
        userService.userLogin(req, res).then((status) => {
            if (status) {
                res.status(200).send({ status: 'success', error: null, code: '200' });
            }
            else {
                res.status(200).send({ status: 'failed', error: "Username and Password not matched", code: '204' });
            }
        });
    }
}

function userLogout(req, res) {
    userService.userLogout(res);
    res.redirect(RouterConfig.force_login_redirect_uris);
}


function userRegister(req, res) {
    res.send("ok");
}

function userValidationMiddleware(req, res, next) {
    if (this.isLoggedIn(req)) {
        next();
    }
    else {
        res.redirect(RouterConfig.force_login_redirect_uris);
    }
}