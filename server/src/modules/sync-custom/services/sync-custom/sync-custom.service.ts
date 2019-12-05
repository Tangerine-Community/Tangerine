import { Injectable } from '@nestjs/common';
const DB = require('../../../../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const pako = require('pako')



@Injectable()
export class SyncCustomService {

  async processPush(groupId, data) {
    let db = new DB(groupId)
    try {
      const payload = pako.inflate(data, { to: 'string' })
      const packet = JSON.parse(payload)
      // Force insert even if doc exists.
      try {
        let doc = await db.get(packet.doc._id)
        packet.doc._rev = doc._rev
      } catch (err) {
        delete packet.doc._rev
      }
      await db.put(packet.doc).catch(err => log.error(err))
      return { status: 'ok'}
    } catch (e) { 
      log.error(e)
    }
  }

  processPull() {

  }
}
