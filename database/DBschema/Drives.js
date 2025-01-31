module.exports = {
    version: '1.0.0',
    QueryId: 'DrivesTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] Drives table creation',
    query:
        `CREATE TABLE IF NOT EXISTS Drives
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driveName TEXT,
        driveId TEXT(20) UNIQUE,
        driveType TEXT, 
        drivePath TEXT, 
        driveToken TEXT,
        priority INTEGER,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`

}
