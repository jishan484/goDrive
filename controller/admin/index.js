const express = require('express');
const router = express.Router({ mergeParams: true });
const userService = require('./../../service/userService');
const { RouterConfig } = require('./../../SystemConfig');

router.use("/auth", require("../app/auth.js"));

router.use("/u/drive", require("./drive"));

module.exports = router