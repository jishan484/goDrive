// username : DemoUser
// password : Mifi@User

module.exports = {
    version: '1.0.0',
    QueryId: 'Default_user_001',  // Unique ID for every changes
    comment: '[DBinit-LOG] Default User createion',
    query:
        `INSERT INTO Users 
        (userName, password, accessToken, role, createdOn, profile)
        VALUES ('DemoUser', '7fd6597564869248ab50f5f24a6002bb39861d6a343e543024338d3c33f5bed9', 'user', 'user1', CURRENT_TIMESTAMP, '')`,
}
