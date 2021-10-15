// import { updateGroupSearchIndex } from '../../scripts/update-group-search-index.js'
const { updateGroupSearchIndex } = require('../../scripts/update-group-search-index.js')
// import { updateGroupArchivedIndex } from '../../scripts/update-group-archived-index.js'
const { updateGroupArchivedIndex } = require('../../scripts/update-group-archived-index.js')

const {clog} = require("tangy-log");
module.exports = {
  name: 'case',
  hooks: {
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, groupId, appConfig} = data
        clog("Creating indexes for search and archived.")
        await updateGroupSearchIndex(groupId)
        clog(`archived-index updated for group: ${groupId}`)
        await updateGroupArchivedIndex(groupId)
        clog(`archived-index updated for group: ${groupId}`)
        resolve(data)
      })
    },
  },
};
