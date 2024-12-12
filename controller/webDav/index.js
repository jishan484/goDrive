const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router({ mergeParams: true });
const webDAV = require('./../../service/webDavService');

// Middleware to handle WebDAV
router.use(express.text({ type: 'application/xml' }));

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

module.exports = router
