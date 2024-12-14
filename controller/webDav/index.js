const express = require('express');
const router = express.Router({ mergeParams: true });
const userService = require('./../../service/userService');
const webDAV = require('./../../service/webDavService');

router.use(express.text({ type: 'application/xml' }));
router.use(checkUser);

// Route to handle different WebDAV methods
router.all('/*', (req, res) => {
  res.set("Allow", "GET, PUT, DELETE, PROPFIND, MKCOL, OPTIONS, MOVE, LOCK, UPDATE, UNLOCK");
  res.set("Public", "GET, PUT, DELETE, PROPFIND, MKCOL, OPTIONS, MOVE, LOCK, UPDATE, UNLOCK");
  res.set('DAV', '1, 2');
  switch (req.method) {
    case 'PROPFIND':
        webDAV.handlePropfind(req,res);
      break;
    case 'PROPPATCH':
        webDAV.handleProppatch(req,res);
      break;
    case 'GET':
      webDAV.handleGet(req, res);
      break;
    case 'PUT':
      webDAV.handlePut(req, res);
      break;
    case 'DELETE':
      webDAV.handleDelete(req, res);
      break;
    case 'MKCOL':
      webDAV.handleMkcol(req, res);
      break;
    case 'OPTIONS':
      webDAV.handleOptions(req, res);
      break;
    case 'HEAD':
      webDAV.handleHead(req, res);
      break;
    default:
      res.status(405).send('Method Not Allowed');
  }
});

function checkUser(req, res, next) {
  if (req.headers["authorization"] == undefined) {
      res.append('WWW-Authenticate', 'Basic realm="www.dlp-test.com"');
      res.status(401).send("You are not authorized").end();
  } else {
    let creds = Buffer.from(req.headers["authorization"].slice(6), 'base64').toString('utf8').split(":");
    req.userName = creds[0];
    req.password = creds[1];    
    userService.userLoginByToken(req, res, (status, err)=>{      
      if(status){
        next();
      } else {
        res.status(401).send("You are not authorized").end();
      }
    });
  }
}





module.exports = router
