module.exports = {
    version: '1.0.0',
    QueryId: 'Default_user_001',  // Unique ID for every changes
    comment: '[DBinit-LOG] Default User createion',
    query:
        `INSERT INTO Users 
        (userName, password, accessToken, role, createdOn, profile)
        VALUES ('jishan', '753e1a97603fabbbfeaa00274c7e6fc6459580b52560e6b06aa68870744b4c4b', 'admin', 'admin', CURRENT_TIMESTAMP, '')`,
}

// if your are changing the table, you need to add a new unique ChangeId. 
// QueryId must be the same in every changes.