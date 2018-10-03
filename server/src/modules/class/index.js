const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog

module.exports = {
  hooks: {
    onCreateGroup: function(groupName) {
      return new Promise((resolve, reject) => {
        setTimeout(_ => {
          clog(`Class Module is hooking into onCreateGroup for group ${groupName}`)
          resolve()
        }, 1000)
      })
    }
  }
}
