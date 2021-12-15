const createGroupDatabase = require('../../create-group-database.js')
module.exports = {
  name: 'sync-protocol-2',
  hooks: {
    groupNew: async function(data) {
      const {groupName} = data
      const groupId = groupName
      await createGroupDatabase(groupName, '-devices')
      return data
    }
  }
}
 
