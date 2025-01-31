const installService = require('./service/installService');

installService.check().then(() => {
    const DB = require('./database');
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
        const DB = require('./database');
        DB.init_database().then(() => {
            const server = require('./controller');
            const scheduledTasks = require('./utilities/scheduleJobs');
            server.start();
            scheduledTasks.start();
        });
    });
});