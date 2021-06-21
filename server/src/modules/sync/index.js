const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const axios = require('axios')
const PouchDB = require('pouchdb')

module.exports = {
  name: 'sync',
  hooks: {
    groupNew: async function(data) {
      const {groupName, appConfig} = data
      // Attach a sync role for sync users to use.
      const securityInfo = (await axios.get(`${process.env.T_COUCHDB_ENDPOINT}${groupName}/_security`)).data
      const updatedSecurityInfo = {...securityInfo, ...{
        members: {
          roles: [
            `sync-${groupName}`
          ]
        }
      }}
      const response = await axios.put(`${process.env.T_COUCHDB_ENDPOINT}${groupName}/_security`, updatedSecurityInfo)
      const groupsDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/groups`)
      const groupDoc = await groupsDb.get(groupName)
      await groupsDb.put({...groupDoc, ...{
        config: {
          ...groupDoc.config,
          sync: {
            formIds: []
          }
        }
      }})
      return data
    }
  }
}

