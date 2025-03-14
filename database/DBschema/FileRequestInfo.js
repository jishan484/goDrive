module.exports = {
    version: '1.0.0',
    QueryId: 'FileRequestInfoTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] FileRequestInfo table creation',
    query :
    `CREATE TABLE IF NOT EXISTS FileRequestInfo
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId VARCHAR(20) UNIQUE,
        type VARCHAR(6),
        fileId VARCHAR(20) UNIQUE,
        fileName TEXT, 
        fileType TEXT,
        filePath TEXT,
        description TEXT,
        note TEXT,
        lebel VARCHAR(20),
        fileFilter TEXT,
        owner TEXT,
        assignedTo TEXT,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        modifiedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, 
        status INTEGER(1) DEFAULT 0,
        linkedTo TEXT, 
        priority INTEGER(1) DEFAULT 0 NOT NULL
    )`

}

// FIX: 1.0.0
// fileSize to BIGINT from INT (for large files support in mysql)
