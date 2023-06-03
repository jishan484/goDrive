const express = require('express');
const router = express.Router({ mergeParams: true });
const taskService = require("./../../../service/taskService");

router.get('/', getTasks);
router.post('/run', runTasks);

module.exports = router;


// MiddleWares:


function getTasks(req, res) {
    taskService.getTaskDetails((status, data) => {
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    });
}

function runTasks(req, res) {
    taskService.runTask(req.body.name, req.user, req.role, (status, data)=>{
        if (status) {
            res.status(200).json({ status: 'success', data: data, error: null, code: '200' });
        } else {
            res.status(200).json({ status: 'error', data: null, error: data, code: '204' });
        }
    });
}

module.exports = router;