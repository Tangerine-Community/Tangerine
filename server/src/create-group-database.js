const axios = require('axios')
const createGroupDatabase = async (groupId, suffix = '', addSyncRole = false) => {
  const databaseName = `${groupId}${suffix ? suffix : ''}`
  try {
    // Create databases and corresponding security settings.
    await axios.put(`${process.env.T_COUCHDB_ENDPOINT}${databaseName}`)
  } catch (e) {
    // The database already exists. That's fine.
  }
  await axios.put(`${process.env.T_COUCHDB_ENDPOINT}${databaseName}/_security`, {
    admins: {
      roles: [
        `admin-sitewide`,
        `admin-${groupId}`
      ]
    },
    members: {
      roles: [
        `member-sitewide`,
        `member-${groupId}`, 
        ...addSyncRole ? [`sync-${groupId}`] : []
      ]
    }
  })
}
module.exports = createGroupDatabase