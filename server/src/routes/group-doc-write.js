const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

module.exports = async function routeGroupDocWrite(req, res) {
  const groupDb = new DB(req.params.groupId)
  let doc = req.body
  let existingDoc = {}
  try {
    existingDoc = await groupDb.get(req.params.docId)
  } catch (err) {
    // Do nothing. It's ok.
  }
  if (existingDoc && existingDoc._rev) {
    doc._rev = existingDoc._rev
  }
  doc._id = req.params.docId
  try {
    await groupDb.post(doc)
  } catch (err) {
    return res.status(500).send(err);
  }
  return res.send(doc)
}