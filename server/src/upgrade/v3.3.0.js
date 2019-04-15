#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const axios = require('axios')
const DB = require('../db')
// Stub emit function to please TS.
const emit = (key, value) => {
  return true;
}

const SharedQueries = {

  conflicts: {
    map: function (doc) {
      if (doc._conflicts) {
        emit(true, true)
      }
    }.toString()
  },

  responsesByFormId: {
    map: function(doc) {
      if (doc.form && doc.form.id) {
        emit(doc.form.id, true)
      }
    }.toString()
  },

  responsesByStartUnixTime: {
    map: function(doc) {
      if (doc.collection === "TangyFormResponse") {
        return emit(doc.startUnixtime, true)
      }
    }.toString()
  },

  responsesByUserProfileId: {
    map: function(doc) {
      if (doc.collection === "TangyFormResponse") {
        if (doc.form && doc.form.id === 'user-profile') {
          return emit(doc._id, true)
        }
        var inputs = doc.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
        var userProfileInput = null
        inputs.forEach(function(input) {
          if (input.name === 'userProfileId') {
            userProfileInput = input
          }
        })
        if (userProfileInput) {
          emit(userProfileInput.value, true)
        }
      }
    }.toString()
  },

  unpaid: {
    map: function(doc) {
      if (doc.collection === "TangyFormResponse" && !doc.paid) {
        emit(true, true)
      }
    }.toString()
  },

  responsesByUserProfileShortCode: {
    map: function(doc) {
      if (doc.collection === "TangyFormResponse") {
        if (doc.form && doc.form.id === 'user-profile') {
          return emit(doc._id.substr(doc._id.length-6, doc._id.length), true)
        }
        var inputs = doc.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
        var userProfileInput = null
        inputs.forEach(function(input) {
          if (input.name === 'userProfileId') {
            userProfileInput = input
          }
        })
        if (userProfileInput) {
          emit(userProfileInput.value.substr(userProfileInput.value.length-6, userProfileInput.value.length), true)
        }
      }
    }.toString()
  }

}

async function go() {
  try {
    console.log('Updating translations. On your next group release, Russian translation will be available.')
    //await exec(`translations-update`)
    console.log('Updating existing group names that were created before you could have spaces and special characters as a group label.')
    const groupList = await groupsListLegacy()
    for (let groupId of groupList) {
      const groupDb = new DB(groupId)
      try {
        await axios.post(`http://${process.env.T_ADMIN}:${process.env.T_PASS}@couchdb:5984/groups`, { _id: groupId, label: groupId })
        console.log(`Setup ${groupId}`)
      } catch (e) {
        console.log(`Failed to setup ${groupId}`)
      }
      console.log('Updating group views to new namespaced views...')
      for (const viewName in SharedQueries) {
        try {
          const deprecatedView = await groupDb.get(`_design/${viewName}`)
          await groupDb.remove(deprecatedView)
          await groupDb.put({
            _id: `_design/shared_${viewName}`,
            views: {
              [`shared_${viewName}`]: SharedQueries[viewName]
            }
          })
        } catch (e) {
          // ok if we ran this script more than once...
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}
go()

