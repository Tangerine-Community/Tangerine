const axios = require('axios')
const createSitewideDatabase = async (dbId) => {
  try {
    // Create databases and corresponding security settings.
    await axios.put(`${process.env.T_COUCHDB_ENDPOINT}${dbId}`)
  } catch (e) {
    // The database already exists. That's fine.
  }
  // We don't actually create CouchDB users with sitewide roles, a role is required to lock the 
  // datbase down to CouchDB admins. Optionally, if someone does need access to all databases,
  // they can create a user with the `admin-sitewide` role manually without making that user a 
  // CouchDB Admin.
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
  })
}
module.exports = createSitewideDatabase