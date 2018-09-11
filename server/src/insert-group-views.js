const log = require('tangy-log').log
const clog = require('tangy-log').clog
const views = require(`./group-views.js`)
const dbConnection = require('./db')

module.exports = async function insertGroupViews(databaseName) {
  let groupDb = new dbConnection(databaseName)
  for (let prop in views) {
    const view = views[prop]
    designDoc = {
      _id: `_design/${prop}`,
      views: {
        [prop]: {
          map: view.toString()
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
