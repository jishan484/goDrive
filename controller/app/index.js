const express = require('express');
const fs = require("fs");
const router = express.Router({ mergeParams: true });
const userService = require('./../../service/userService');
const { RouterConfig } = require('./../../SystemConfig');

router.use("/auth", require("./auth.js"));

router.use("/u/*", checkAuth);

router.use("/u/status", require("./status"));
router.use("/u/folder", require("./folder"));
router.use("/u/file", require("./file"));

// UI component handler : document No. 'D-01'
// Please check documentation for this feature / function

router.use("/u/ui/component", sendUIComponent);

module.exports = router



// ============== middleware ================== //

function checkAuth(req,res,next){
    let status = { status: false };
    let extendSession = {
        isSet:(req.method == 'POST' && req.baseUrl == '/app/u/file'),
    };
    if(extendSession.isSet){
        extendSession.res = res;
    }
    if (userService.isLoggedIn(req, req.headers.xauthtoken, status, extendSession)) {
        if (status.status) {
            next();
        }
        else {
            // for file download : check token param
            if (req.method == 'GET' && req.baseUrl == '/app/u/file/download') {
                // no requirement for xauthtoken check...JWT token is enough
                next();
                return;
            }

            req.on('data', (data) => {
                setTimeout(()=>{
                    req.unpipe();
                    req.socket.destroy();
                },100);
            });
            res.set("connection", "close");
            res.status(403).send({
                uri: RouterConfig.force_login_redirect_urn,
                error: "You are not allowed to call APIs outside UI App!",
                code: "403",
                data: null
            }).end();
        }
    }
    else {
        req.on('data', (data) => {
            setTimeout(()=>{
                req.unpip
                req.socket.destroy();
            },100);
        });

        res.set("connection", "close");
        res.status(403).send({
            urn: RouterConfig.force_login_redirect_urn,
            error: "You are not logged in!",
            code: "403",
            data: null
        }).end();
        
        return;
    }
}


function sendUIComponent(req, res) {
    let requestedComponent = __dirname + '/../../resources/views/UIcomponents/USER_' + req.query.name + '.html';
    if (fs.existsSync(requestedComponent)) {
        res.status(200).json({ status: 'success', data: fs.readFileSync(requestedComponent, 'utf8'), error: 'data', code: '204' });
    }
    else {
        res.status(200).json({ status: 'error', data: null, error: 'component not found!', code: '204' });
    }
}