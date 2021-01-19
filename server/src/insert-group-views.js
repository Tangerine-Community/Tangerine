const log = require('tangy-log').log
const clog = require('tangy-log').clog
const views = require(`./group-views.js`)
const dbConnection = require('./db')

module.exports = async function insertGroupViews(databaseName) {
  let groupDb = new dbConnection(databaseName)
  let designDoc = {}
  for (let prop in views) {
    const view = views[prop]
    // Views may just be a map function, else they are an object with a map and a reduce.
    if (typeof view === 'function') {
      designDoc = {
        _id: `_design/${prop}`,
        views: {
          [prop]: {
            map: view.toString()
          }
        }
      }
    } else {
      designDoc = {
        _id: `_design/${prop}`,
        views: {
          [prop]: {
            map: view.map.toString(),
            reduce: view.reduce.toString()
          }
        }
      }
    }
    try {
      const existingDesignDoc = await groupDb.get(`_design/${prop}`)
      designDoc._rev = existingDesignDoc._rev
    } catch(err) {
      // Do nothing... Assume this is the first time the views have been inserted.
    }
    try {
      let status = await groupDb.post(designDoc)
      log.info(`group views inserted into ${databaseName}`)
    } catch (error) {
      log.error(error)
    }
  }
}
