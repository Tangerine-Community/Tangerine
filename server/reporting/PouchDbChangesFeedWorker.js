const EventEmitter = require('events');
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const log = require('tangy-log').log

class PouchDbChangesFeedWorker extends EventEmitter {

  // @TODO Instead of napTime, we could subscribe to the changes feed and wake on activity.
  constructor (feeds = [], changeProcessor, PouchDB, batchSize = 5, sleepTimeAfterBatchProcessed = 0, sleepTimeAfterNoChanges = 3000) {
    super()
    this._feeds = feeds
    this._changeProcessor = changeProcessor
    this._PouchDB = PouchDB
    this._batchSize = batchSize
    this._sleepTimeAfterBatchProcessed = sleepTimeAfterBatchProcessed 
    this._sleepTimeAfterNoChanges = sleepTimeAfterNoChanges 
  }

  start() {
    this._shouldProcess = true
    this._process()
  }

  stop() {
    this._shouldProcess = false
  }

  addFeed(feed) {
    this._feeds.push(feed)
  }

  async _process() {
    // Keep the cache processing alive.
    while (this._shouldProcess) {
      let changesProcessed = 0
      for (let feed of this._feeds) { 
        const db = new this._PouchDB(feed.dbName)
        const changes = await db.changes({ since: feed.sequence, limit: this._batchSize, include_docs: false })
        if (changes.results.length > 0) {
          const batch = changes.results.map(change => this._changeProcessor(change, db))
          let batchResponses = await Promise.all(batch)
          feed.sequence = changes.results[changes.results.length-1].seq
          changesProcessed += changes.results.length
          this.emit('batchProcessed')
          await sleep(this._sleepTimeAfterBatchProcessed)
        }
      }
      // Sleep if there was not a batch to process. All is quiet.
      if (changesProcessed === 0) {
        this.emit('done', this._feeds)
        await sleep(this._sleepTimeAfterNoChanges)
      }  
    }
  }


}

exports.PouchDbChangesFeedWorker = PouchDbChangesFeedWorker 



