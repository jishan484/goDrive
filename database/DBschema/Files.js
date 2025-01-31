module.exports = {
    version: '1.0.0',
    QueryId: 'FilesTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] Files table creation',
    query :
    `CREATE TABLE IF NOT EXISTS Files
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT, 
        fileId TEXT(20) UNIQUE,
        fileType TEXT,
        fileSize BIGINT, 
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
        driveId TEXT,
        isDeleted INTEGER(1) DEFAULT 0 NOT NULL
    )`

}

// FIX: 1.0.0
// fileSize to BIGINT from INT (for large files support in mysql)
