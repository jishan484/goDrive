const server = require('./controller');
const scheduledTasks = require('./utilities/scheduleJobs');
server.start();
scheduledTasks.start();