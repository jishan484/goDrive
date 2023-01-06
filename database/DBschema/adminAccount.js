// username : admin
// password : Mifi@Admin

module.exports = {
    version: '1.0.0',
    QueryId: 'Admin_account_001',  // Unique ID for every changes
    comment: '[DBinit-LOG] Admin account createion',
    query:
        `INSERT INTO Users 
        (userName, password, accessToken, role, createdOn, profile)
        VALUES ('admin', 'ca1ebd9607dd9a3fe57a2705270874d9b16f1d22022d74053d2859ce86f91208', 'super_admin_token', 'super_admin', CURRENT_TIMESTAMP, '')`,
}