const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const {promisify} = require('util');
const fs = require('fs');

module.exports = {
  hooks: {
    boot: async function(data) {
      return data
    },
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
      }
      return data
    },
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        resolve(data)
      })
    }
  }
}
