const createGroupDatabase = require('../../create-group-database.js')
const groupsList = require('/tangerine/server/src/groups-list.js')
module.exports = {
  name: 'sync-protocol-2',
  hooks: {
    enable: async function() {
      const groups = await groupsList()
      for (groupId of groups) {
        await createGroupDatabase(groupId, '-devices')
      }
    },
    groupNew: async function(data) {
      const {groupName} = data
      const groupId = groupName
      await createGroupDatabase(groupName, '-devices')
      return data
    }
  }
}
 
