const express = require('express');
const userService = require('../../service/userService');
const { RouterConfig } = require('../../SystemConfig');
const router = express.Router({ mergeParams: true });


router.post('/login', userLogin);
router.use('/logout', userLogout);
router.post('/register', userRegister);

module.exports = router;


// MiddleWares:

function userLogin(req, res) {
    if (userService.isLoggedIn(req)) {
        res.redirect(RouterConfig.home_page_urn);
    }
    else {
        userService.userLogin(req, res , (status)=>{
            if (status) {
                res.status(200).send({ status: 'success', error: null, code: '200' });
            }
            else {
                res.status(200).send({ status: 'failed', error: "Incorrect username or password entered! Please try again.", code: '204' });
            }
        });
    }
}

function userLogout(req, res) {
    if(!userService.isLoggedIn(req)){
        res.redirect(RouterConfig.force_login_redirect_urn);
        return;
    }
    userService.userLogout(res);
    if (userService.isUser(req)){
        res.redirect(RouterConfig.force_login_redirect_urn);
    } else {
        res.redirect(RouterConfig.force_login_redirect_urn_admin);
    }
}


function userRegister(req, res) {
    userService.userRegister(req, res, (status,err) => {
        if (status) {
            res.status(200).send({ status: 'success', error: null, code: '200' });
        }
        else {
            res.status(200).send({ status: 'failed', error: err, code: '204' });
        }
    }
    );
}