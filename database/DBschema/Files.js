module.exports = {
    version: '1.0.0',
    QueryId: 'FilesTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] Files table creation',
    query :
    `CREATE TABLE IF NOT EXISTS Files
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT, 
        fileId TEXT UNIQUE,
        fileType TEXT,
        fileSize INTEGER, 
        filePath TEXT, 
        fileFormat TEXT, 
        uploadOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        owner TEXT, 
        lastAccessedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        modifiedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, 
        nodeId TEXT, 
        accesses TEXT, 
        star INTEGER,
        parentFolderId TEXT, 
        driveId TEXT
        )`

}
