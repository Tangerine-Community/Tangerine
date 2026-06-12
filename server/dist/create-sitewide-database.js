const axios = require('axios');
const createSitewideDatabase = async (dbId) => {
    try {
        await axios.put(`${process.env.T_COUCHDB_ENDPOINT}${dbId}`);
    }
    catch (e) {
    }
    await axios.put(`${process.env.T_COUCHDB_ENDPOINT}${dbId}/_security`, {
        admins: {
            roles: [
                `admin-sitewide`
            ]
        },
        members: {
            roles: [
                `member-sitewide`
            ]
        }
    });
};
module.exports = createSitewideDatabase;
//# sourceMappingURL=create-sitewide-database.js.map