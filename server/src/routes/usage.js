const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const fs = require('fs')
const util = require('util');
const readFile = util.promisify(fs.readFile)
const groupUsageTemplate = {
    "uploadDate" : "",
    "enumerator" : "",
    "users" : {
       "member" : [],
       "admin" : []
    },
    "attributes" : {
       "name" : ""
    },
    "numberOfResults" : 0
}

module.exports = async (req, res) => {
  const state = JSON.parse(await readFile('/paid-worker-state.json'))
  const response = state.groups.map(groupEntry => {
    return Object.assign({}, groupUsageTemplate, { 
      attributes: {
        name: groupEntry.name
      }, 
      numberOfResults: groupEntry.totalMarkedPaid,
      totalMarkedPaid: groupEntry.totalMarkedPaid
    })
  })
  // @TODO Should we get unpaid? Can just 
  // ... get(`${process.env.T_COUCH_URL}/${groupName}/_design/unpaid`).total
  res.send(response);
}