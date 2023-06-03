const scheduler = require("./../../utilities/scheduleJobs");
const log = require("./../logService");
const userService = require('./../userService');


class TaskService {

    constructor() {
        log.log("debug", "Status service initialized!");
    }


    // -------------------------------------SERVICES--------------------------------------------//

    getTaskDetails(callback){
        scheduler.getDetails((tasks)=>{
            if(tasks.length > 0){
                callback(true, tasks);
            } else {
                callback(false, 'No task found!');
            }
        })
    }

    runTask(jobName,user, role, callback){
        if(jobName == null || jobName == undefined){
            callback(false, 'Please provide a job name!');
            return;
        }
        if(role == 'admin' || role == 'super_admin')
            scheduler.runJob(jobName, user, callback);
        else callback(false, 'User does not have access!')
    }

}

module.exports = new TaskService();