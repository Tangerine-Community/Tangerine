const EventEmitter = require('events');
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const log = require('tangy-log').log

class PouchDbChangesFeedWorker extends EventEmitter {

  // @TODO Instead of napTime, we could subscribe to the changes feed and wake on activity.
  constructor (feeds = [], changeProcessor, PouchDB, batchSize = 5, sleepTimeAfterBatchProcessed = 0, sleepTimeAfterNoChanges = 3000, batchLimit = undefined) {
    super()
    this._feeds = feeds
    this._changeProcessor = changeProcessor
    this._PouchDB = PouchDB
    this._batchSize = batchSize
    this._sleepTimeAfterBatchProcessed = sleepTimeAfterBatchProcessed 
    this._sleepTimeAfterNoChanges = sleepTimeAfterNoChanges 
    this._batchLimit = batchLimit
    this._batchCount = 0
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
        }
      }
      this._batchCount++
      this.emit('batchProcessed')
      if (this._batchLimit !== undefined && this._batchCount === this._batchLimit) {
        this.stop()
      } else if (this._shouldProcess === true) { 
        await sleep(this._sleepTimeAfterBatchProcessed)
        // Sleep if there was not a batch to process. All is quiet.
        if (changesProcessed === 0) {
          await sleep(this._sleepTimeAfterNoChanges)
        }
      }
    }
    this.emit('done', this._feeds)
  }


}

exports.PouchDbChangesFeedWorker = PouchDbChangesFeedWorker 



