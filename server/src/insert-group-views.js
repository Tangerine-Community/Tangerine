const log = require('tangy-log').log
const clog = require('tangy-log').clog
const views = require(`./group-views.js`)
const dbConnection = require('./db')

module.exports = async function insertGroupViews(databaseName) {
  let db = new dbConnection(databaseName)
  let designDoc = {}
  for (let prop in views) {
    const view = views[prop]
    if (view.database) {
      db = new dbConnection(`${databaseName}-${view.database}`)
    }
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
            ...view.map ? { map: view.map.toString() } : {},
            ...view.reduce ? {reduce: view.reduce.toString() } : {}
          }
        }
      }
    }
    try {
      const existingDesignDoc = await db.get(`_design/${prop}`)
      designDoc._rev = existingDesignDoc._rev
    } catch(err) {
      // Do nothing... Assume this is the first time the views have been inserted.
    }
    try {
      let status = await db.post(designDoc)
      log.info(`group views inserted into ${db.name}`)
    } catch (error) {
      log.error(error)
    }
    // Set the database object back to default.
    if (view.database) {
      db = new dbConnection(databaseName)
    }
  }
}
