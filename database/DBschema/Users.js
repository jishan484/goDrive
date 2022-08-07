module.exports = {
    version: '1.0.0',
    QueryId: 'UsersTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] Users table creation',
    query:
        `CREATE TABLE IF NOT EXISTS Users
    (   
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userName TEXT, 
        password TEXT,
        accessToken TEXT,
        role TEXT, 
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        profile TEXT
    )`,

}

// if your are changing the table, you need to add a new unique ChangeId. 
// QueryId must be the same in every changes.