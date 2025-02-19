module.exports = {
    version: '1.0.1',
    QueryId: 'TasksTable_01.1',  // Unique ID for every changes
    comment: '[DBinit-LOG] Tasks table creation',
    query:
        `CREATE TABLE IF NOT EXISTS Tasks
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskName VARCHAR(30) UNIQUE,
        status INTEGER DEFAULT 1,
        state INTEGER DEFAULT 1, 
        schedule TEXT, 
        param TEXT,
        failure INTEGER,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`

}
