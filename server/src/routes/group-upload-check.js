const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

module.exports = async function groupUploadCheck(req, res) {
  try {
    const groupDb = new DB(req.params.groupId)
    const keys = req.body.keys
    let response = await groupDb.allDocs({keys})
    res.send(response.rows
      .filter(row => !row.error)
      .map(row => row.key))
  } catch(error) {
    log.error(error)
  }
}