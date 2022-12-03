module.exports = {
    version: '1.0.1',
    QueryId: 'TasksTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] Tasks table creation',
    query:
        `CREATE TABLE IF NOT EXISTS Tasks
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskName TEXT UNIQUE,
        status BIT(1) DEFAULT 1,
        state bit(1) DEFAULT 1, 
        schedule TEXT, 
        param TEXT,
        failure INTEGER,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`

}
