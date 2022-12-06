const DB = require('./database');
DB.init_database().then(() => {
    const server = require('./controller');
    const scheduledTasks = require('./utilities/scheduleJobs');
    server.start();
    scheduledTasks.start();
});