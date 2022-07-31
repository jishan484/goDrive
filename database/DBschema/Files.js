module.exports = {
    version: '1.0.0',
    QueryId: 'FilesTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] Files table creation',
    query :
    `CREATE TABLE IF NOT EXISTS Files
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT, 
        fileType TEXT,
        fileSize INTEGER, 
        filePath TEXT, 
        fileFormat TEXT, 
        uploadOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        owner TEXT, 
        lastAccessedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        modifiedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, 
        nodeId TEXT, 
        nodeURL TEXT NOT NULL, 
        accesses TEXT, 
        priority INTEGER,
        parentFolderId INTEGER NOT NULL, 
        encriptionKey TEXT NOT NULL
        )`,

}

// if your are changing the table, you need to add a new unique ChangeId. 
// QueryId must be the same in every changes.