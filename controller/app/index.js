const express = require('express');
const router = express.Router({ mergeParams: true });
const userService = require('./../../service/userService');
const { RouterConfig } = require('./../../SystemConfig');

router.use("/auth", require("./auth.js"));
router.use("/u/*", (req, res, next) => {
    let status = { status: false };
    if (userService.isLoggedIn(req, req.headers.xauthtoken,status)) {
        if(status.status){
            next();
        }
        else{
            req.on('data', (data) => {
                req.socket.destroy();
            });
            res.status(401).send({ status: 'failed', error: "Unauthorized", code: '401' });
        }
    }
    else {
        // req.pause();
        // res.status(403).end("You are not logged in");
        // // res.socket.destroy();
        // res.redirect('back');
        req.removeListener('data', ()=>{}); // we need to remove the event listeners so that we don't end up here more than once
        req.removeListener('end', ()=>{});
        res.header('Connection', 'close'); // with the Connection: close header set, node will automatically close the socket...
        res.status(401).send('Upload too large');
    }
});


router.use("/u/folder", require("./folder"));
router.use("/u/file", require("./file"));

module.exports = router