module.exports = {
    version: '1.0.0',
    QueryId: 'SharedFileInfo_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] SharedFileInfo table creation',
    query :
    `CREATE TABLE IF NOT EXISTS sharedFileInfo
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tokenId TEXT,
        fileId TEXT,
        folderId TEXT,
        pin BIGINT, 
        type TEXT,
        sharedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        owner TEXT, 
        lastAccessedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expireAfter INTEGER,
        isPinProtected INTEGER(1) DEFAULT 0 NOT NULL
    )`

}

// FIX: 1.0.0
// fileSize to BIGINT from INT (for large files support in mysql)
