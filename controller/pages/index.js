const express = require('express');
const path = require('path');
const userService = require('./../../service/userService');
const { RouterConfig } = require('./../../SystemConfig');

const router = express.Router({ mergeParams: true });

router.use('/', express.static(path.resolve('resources/public')));

router.get('/', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req) && userService.isUser(req)) {
        res.redirect(RouterConfig.home_page_urn);
    } else if(userService.isLoggedIn(req) && userService.isAdmin(req)) {
        res.redirect(RouterConfig.admin_home_page_urn);
    } else {
        res.sendFile(path.resolve('resources/views/login.html'));
    }
});

router.get('/register', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req) && userService.isUser(req)) {
        res.redirect(RouterConfig.home_page_urn);
    } else if (userService.isLoggedIn(req) && userService.isAdmin(req)) {
        res.redirect(RouterConfig.admin_home_page_urn);
    } else {
        res.sendFile(path.resolve('resources/views/register.html'));
    }
});

router.get('/home', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req) && userService.isUser(req)) {
        res.sendFile(path.resolve('resources/views/home.html'));
    } else if (userService.isLoggedIn(req) && !userService.isUser(req)) {
        res.sendFile(path.resolve('resources/views/deniedAccess.html'));
    } else {
        res.redirect(RouterConfig.force_login_redirect_urn);
    }
});

router.use('/admin', express.static(path.resolve('resources/admin')));

router.get('/admin', (req, res) => {
    if(userService.isLoggedIn(req) && userService.isAdmin(req)){
        res.redirect(RouterConfig.admin_home_page_urn);
    }else if(userService.isLoggedIn(req) && !userService.isAdmin(req)){
        res.sendFile(path.resolve('resources/views/deniedAccess.html'));
    }else{
        res.sendFile(path.resolve('resources/views/adminLogin.html'));
    }
});

router.get('/admin/home',(req,res)=>{
    if(userService.isLoggedIn(req) && userService.isAdmin(req)){
        res.sendFile(path.resolve('resources/views/adminHome.html'));
    }else if(userService.isLoggedIn(req) && !userService.isAdmin(req)){
        res.sendFile(path.resolve('resources/views/deniedAccess.html'));
    }else{
        res.redirect(RouterConfig.force_login_redirect_urn_admin);
    }
});

module.exports = router