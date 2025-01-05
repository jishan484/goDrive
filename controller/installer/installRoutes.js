// get for status of all 3 steps
// post for update by /:step param

const express = require('express');
const router = express.Router({ mergeParams: true });
const installationService = require('../../service/installService');


router.get('/', getInstallationStatus);
router.post('/:step', updateInstallationStatus);



function getInstallationStatus(req, res) {
    installationService.getInstallationStatus((status, installerInfo) => {
        res.status(200).json({
            status: installerInfo
        });
    });
}

function updateInstallationStatus(req, res) {
    let step = req.params.step;
    installationService.updateInstallationStatus(req.body, step, req.onCompleteTask, (status) => {
        res.status(200).json({
            status: status
        });
    });
}

module.exports = router;