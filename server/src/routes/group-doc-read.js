const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

module.exports = async (req, res) => {
  const groupDb = new DB(req.params.groupId)
  let doc = {}
  try {
    doc = await groupDb.get(req.params.docId)
  } catch (err) {
    res.status(500).send(err);
  }
  res.send(doc)
}