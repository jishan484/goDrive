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
                        this.jobs[rows[i].taskName] = new task(rows[i].schedule, rows[i].param);
                        this.jobs[rows[i].taskName].status = rows[i].status;
                        this.jobs[rows[i].taskName].state = rows[i].state;
                        joblist.splice(index, 1);
                        logger.log("info", "Task " + rows[i].taskName + " started!");
                    }
                }
                for(let i=0;i<joblist.length;i++){
                    logger.log("debug", "Task "+joblist[i]+" newly added to the system!");
                    let task = require(__dirname + '/' + joblist[i]);
                    let taskName = joblist[i].split('.')[0];
                    this.jobs[taskName] = new task(null,null);
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
            if(this.jobs[job].status == 1 && this.jobs[job].state == 1){
                logger.log("info", "Task " + job + " scheduled!");
                this.jobs[job].task = scheduler.schedule(this.jobs[job].frequency, () => {
                    this.jobs[job].run();
                });
            }
        }
    }
}


module.exports = new Scheduler();