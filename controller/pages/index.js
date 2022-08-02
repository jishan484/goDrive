const express = require('express');
const path = require('path');
const userService = require('./../../service/userService');
const { RouterConfig } = require('./../../SystemConfig');

const router = express.Router({ mergeParams: true });

router.use('/', express.static(path.resolve('resources/public')));

router.get('/', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req)) {
        res.redirect(RouterConfig.home_page_uri);
    } else {
        res.sendFile(path.resolve('resources/views/login.html'));
    }
});

router.get('/register', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req)) {
        res.redirect(RouterConfig.home_page_uri);
    } else {
        res.sendFile(path.resolve('resources/views/register.html'));
    }
});

router.get('/home', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store');
    if (userService.isLoggedIn(req)) {
        res.sendFile(path.resolve('resources/views/home.html'));
    } else {
        res.redirect(RouterConfig.force_login_redirect_uris);
    }
});

module.exports = router