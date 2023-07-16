const express = require('express');
const router = express.Router({ mergeParams: true });
const userService = require("./../../../service/userService");

router.get('/', getUsers);
router.post('/', createProfile);
router.put('/', updateUserStatus);

module.exports = router;


// MiddleWares:


function getUsers(req, res) {
    userService.getUsers(req.user, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    });
}

function createProfile(req, res) {
    userService.createProfile(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    });
}

function updateUserStatus(req, res) {
    userService.updateUserStatus(req, (status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    });
}

module.exports = router;