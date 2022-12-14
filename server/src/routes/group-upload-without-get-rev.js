const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const pako = require('pako')

module.exports = async function groupUpload(req, res) {
  let db = new DB(req.params.groupId)
  // try {
    const payload = pako.inflate(req.body, { to: 'string' })
    const packet = JSON.parse(payload)
  // log.debug("PUTting the payload without doing a GET first. doc._id: " + packet.doc._id + " doc.rev: " + packet.doc._rev)
    // await db.put(packet.doc).catch(async err => {
    await db.put(packet.doc, {force:true}).catch(async err => {
      log.error("PUTting the payload without doing a GET first FAILED. doc._id: " + packet.doc._id + " doc.rev: " + packet.doc._rev)
      log.error(err)
      const nuDoc = packet.doc
      nuDoc.originalId = packet.doc._id
      delete nuDoc._id
      await db.post(nuDoc).then(resp => {
        log.debug("POSTed the payload. resp.id: " + resp.id + " nuDoc.originalId: " + nuDoc.originalId)
        log.debug("resp: " + JSON.stringify(resp))
      }).catch(err => {
        log.error("POST the payload without doing a GET first FAILED. nuDoc.originalId: " + nuDoc.originalId)
        log.error(err)
      })
    })
    res.send({ status: 'ok'})
  // } catch (e) { 
  //   log.error(e)
  // }

}