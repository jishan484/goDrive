// need a system to run job in single node/cluster(if multiple nodes are present)
// take help of database to run job in single node/cluster
// use lock to run job in single node/cluster
// nodes can be added/removed dynamically but execution of job should be done
// in server which claimed the job runner lock first
// reset the lock if server is down
// rest all nodes will try to claim the lock 

// Load all jobs from database
// save logs in database [high priority]

// change corn details if admin change it from admin panel
// run job if admin run it from admin panel
// stop job if admin stop it from admin panel
// pause next job schedules if admin pause it from admin panel


// Status = 0 : job is disabled
// Status = 1 : job is enabled
// state = 0 : job is ready to run
// state = 1 : job is active and runnable
// state = 2 : job is already running
// state = 3 : job is paused due to some internal fatal error
// state = 4 : job is stopped by admin
// Rest all states are reserved for future use

const scheduler = require('node-cron');
const db = require('../../database');
const fs = require('fs');
const logger = require('../../service/logService');

class Scheduler{
    constructor(){
        logger.log("debug", "Scheduler initialized!");
        this.jobs = {};
    }

    async start(){
        setTimeout(() => {
            this.init();
        }, 3000);
    }



    //------------------ runtime job controls------------------
    getDetails(){
        let details = [];
        for(let job in this.jobs){
            let detail = {};
            detail.name = job;
            detail.status = this.jobs[job].status;
            detail.state = this.jobs[job].state;
            detail.frequency = this.jobs[job].frequency;
            detail.lastRun = this.jobs[job].lastRun;
            detail.executionTime = this.jobs[job].executionTime;
            details.push(detail);
        }
    }
    stopJob(jobName, callback){
        if (this.jobs[jobName] != null && this.jobs[jobName].state == 2) {
            this.jobs[jobName].stop();
            logger.log("debug", "Job stopped : " + jobName);
            this.jobs[jobName].state = 4;
            callback(true, "Job stopped : " + jobName);
        } else if(this.jobs[jobName] != null){
            callback(false, "Job " + jobName + " is not found or not valid!");
        } else if(this.jobs[jobName].state < 2){
            callback(false, "Job " + jobName + " is not running!");
        } else {
            callback(false, "Job " + jobName + " already stopped!");
        }
    }
    startJob(jobName, callback){
        if (this.jobs[jobName] != null && this.jobs[job].state != 2) {
            this.jobs[jobName].start();
            logger.log("debug", "Job started : " + jobName);
            callback(true, "Job started : " + jobName);
        } else if(this.jobs[jobName] != null){
            callback(false, "Job " + jobName + " is not found or not valid!");
        }else {
            callback(false, "Job " + jobName + " already started!");
        }
    }
    updateJobStatus(jobName, status, frequency, callback){
        if (this.jobs[jobName] != null) {
            if(this.jobs[jobName].status == status && this.jobs[jobName].frequency == frequency){
                callback(false, "Job " + jobName + " already has same status and frequency!");
                return;
            }
            status = (status == null)? this.jobs[jobName].status : status;
            frequency = (frequency == null)? this.jobs[jobName].frequency : frequency;
            this.jobs[jobName].job.stop();
            delete this.jobs[jobName].job;
            this.jobs[jobName].state = 1;
            this.jobs[jobName].status = status;
            this.jobs[jobName].frequency = frequency;
            this.schedule();
            db.run('UPDATE Tasks SET status = ? WHERE taskName = ?', [status, jobName], (err) => {
                if(err){
                    callback(false, "Failed to update job status in DB!");
                    logger.log("error", err);
                }
                else{
                    callback(true, "Job status updated!");
                }
            });
        } else {
            callback(false, "Job " + jobName + " is not found or not valid!");
        }
    }
    // ------------------ runtime job controls end------------------






    async init(){
        let joblist = fs.readdirSync(__dirname).filter((elem) => {
            return elem != 'index.js';
        });
        db.all('SELECT * FROM Tasks', (err, rows) => {
            if(err){
                logger.log("error", "Error while fetching tasks from database!");
                logger.log("error", err);
            } else {
                for(let i=0;i<rows.length;i++){
                    // check if job already exist in joblist array
                    let index = joblist.indexOf(rows[i].taskName + '.js');
                    if(index != -1){
                        logger.log("info", "Task " + rows[i].taskName + " initiated!");
                        let task = require(__dirname+'/'+joblist[index]);
                        this.jobs[rows[i].taskName] = new task(rows[i].schedule ,rows[i].param);
                        this.jobs[rows[i].taskName].status = rows[i].status;
                        this.jobs[rows[i].taskName].state = rows[i].state;
                        joblist.splice(index, 1);
                    }
                }
                for(let i=0;i<joblist.length;i++){
                    logger.log("debug", "Task "+joblist[i]+" newly added to the system!");
                    let task = require(__dirname + '/' + joblist[i]);
                    let taskName = joblist[i].split('.')[0];
                    this.jobs[taskName] = new task(null);
                    this.jobs[taskName].status = 1;
                    this.jobs[taskName].state = 1;
                    db.run('INSERT INTO Tasks (taskName, schedule, param) VALUES (?,?,?)', [this.jobs[taskName].taskName, this.jobs[taskName].frequency, this.jobs[taskName].param], (err) => {
                        if(err){
                            logger.log("error", "Error while inserting new task in database!");
                            logger.log("error", err);
                        }
                    });
                }
                // start scheduler after all jobs are loaded in memory and database is updated with new jobs if any
                this.schedule();
            }
        });
    }

    schedule(){
        // schedule all jobs
        for(let job in this.jobs){
            if(this.jobs[job].status == 1 && this.jobs[job].state <= 1){
                logger.log("info", "Task " + job + " scheduled!");
                this.jobs[job].task = scheduler.schedule(this.jobs[job].frequency, async () => {
                    this.jobs[job].run();
                });
                this.jobs[job].task.start();
                this.jobs[job].state = 2;
            }
        }
    }
}


module.exports = new Scheduler();