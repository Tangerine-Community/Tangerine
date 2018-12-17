const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const pako = require('pako')

module.exports = async function groupUpload(req, res) {
  let db = new DB(req.params.groupId)
  try {
    const payload = pako.inflate(req.body, { to: 'string' })
    const packet = JSON.parse(payload)
    // Force insert even if doc exists.
    try {
      let doc = await db.get(packet.doc._id)
      packet.doc._rev = doc._rev
    } catch (err) {
      delete packet.doc._rev
    }
    await db.put(packet.doc).catch(err => log.error(err))
    res.send({ status: 'ok'})
  } catch (e) { 
    log.error(e)
  }

}