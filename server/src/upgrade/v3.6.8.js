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

  responsesByMonthAndFormId: {
    map: function(doc) {
      if (doc.form && doc.form.id) {
          const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const startUnixtime = new Date(doc.startUnixtime);
              const key = doc.form.id + '_' + startUnixtime.getFullYear() + '_' + MONTHS[startUnixtime.getMonth()];
        return emit(key, doc)
      }
    }.toString()
  },

  responsesByMonthAndFormId: {
    map: function(doc) {
      if (doc.form && doc.form.id) {
          const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const startUnixtime = new Date(doc.startUnixtime);
              const key = doc.form.id + '_' + startUnixtime.getFullYear() + '_' + MONTHS[startUnixtime.getMonth()];
        return emit(key, doc)
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
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
    await exec(`cp -R /tangerine/client/default-assets/data-dashboard /tangerine/client/content/groups/${groupName}/`) 
  }
}
go()

