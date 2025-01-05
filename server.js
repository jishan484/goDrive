const DB = require('./database');
const installService = require('./service/installService');

installService.check().then(() => {
    DB.init_database().then(() => {
        const server = require('./controller');
        const scheduledTasks = require('./utilities/scheduleJobs');
        server.start();
        scheduledTasks.start();
    });
}).catch(() => {
    const server = require('./controller/installer');
    server.start();
    server.onComplete(() => {
        server.stop();
        const appServer = require('./controller');
        const scheduledTasks = require('./utilities/scheduleJobs');
        appServer.start();
        scheduledTasks.start();
    });
});