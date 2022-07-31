module.exports = {
    version: '1.0.0',
    subVersion: 0,
    QueryId: 'FoldersTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] Folders table creation',
    query:
        `CREATE TABLE IF NOT EXISTS Folders
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folderName TEXT, 
        parentFolderId INTEGER,
        rootFolderId INTEGER, 
        folderPath TEXT, 
        fullPath TEXT, 
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        owner TEXT,
        modifiedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, 
        permissions TEXT NOT NULL, 
        accesses TEXT, 
        priority INTEGER,
        color TEXT NOT NULL
        )`,
}

// if your are changing the table, you need to add a new unique ChangeId. 
// QueryId must be the same in every changes.