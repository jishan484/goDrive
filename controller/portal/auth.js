const express = require('express');

const userService = require('../../service/userService');

const router = express.Router({ mergeParams: true });


router.post('/login', userLogin);
router.use('/logout', userLogout);
router.post('/register', userRegister);

module.exports = router;


// Services:

function userLogin(req, res) {
    if (userService.isLoggedIn(req)){
        res.redirect('/home');
    }
    else{
        userService.userLogin(req , res);
    }
}

function userLogout(req, res) {
    userService.userLogout(res);
    res.redirect('/');
}


function userRegister(req, res) {
    res.send("ok");
}
