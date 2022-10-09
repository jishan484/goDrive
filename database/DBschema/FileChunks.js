module.exports = {
    version: '1.0.0',
    QueryId: 'FileChunksTable_01',  // Unique ID for every changes
    comment: '[DBinit-LOG] FileChunks table creation',
    query:
        `CREATE TABLE IF NOT EXISTS FileChunks
    (   
        chunkId TEXT,
        nodeInfo TEXT,
        orders INTEGER,
        nodeId TEXT,
        driveId TEXT
    )`

}
