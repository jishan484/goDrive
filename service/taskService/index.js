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

    updateTask(reqParams, role, callback){
        let jobName = reqParams.name;
        let frequency = reqParams.frequency;
        let status = reqParams.status;
        if(jobName == null || jobName == undefined){
            callback(false, 'Please provide a job name!');
            return;
        }
        if((role == 'admin' || role == 'super_admin') && frequency != null && frequency != undefined)
            scheduler.updateJob(jobName, null ,frequency, callback);
        else if((role == 'admin' || role == 'super_admin') && status != null && status != undefined) {
            status = status == 'true' ? 1 : 0;
            scheduler.updateJob(jobName, status ,null, callback);
        }
        else callback(false, 'User does not have access!');
    }

}

module.exports = new TaskService();