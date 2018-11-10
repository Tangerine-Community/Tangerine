const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const insertGroupReportingViews = require(`../../insert-group-reporting-views.js`)

module.exports = {
  hooks: {
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        const db = DB(`${groupName}-reporting`)
        await db.destroy()
        await insertGroupReportingViews(groupName)
      }
      return data
    },
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
          const {flatResponse, doc, sourceDb} = data
          // @TODO Rename `-reporting` to `-csv`.
          const REPORTING_DB = new DB(`${sourceDb.name}-reporting`);
          // @TODO Ensure design docs are in the database.
          await saveFormInfo(flatResponse, REPORTING_DB);
          await saveFlatFormResponse(flatResponse, REPORTING_DB);
          // Index the view now.
          await REPORTING_DB.query('tangy-reporting/resultsByGroupFormId', {limit: 0})
          resolve(data)
      })
    }
  }
}

function saveFormInfo(flatResponse, db) {
  return new Promise(async (resolve, reject) => {
    // Find any new headers and insert them into the headers doc.
    let foundNewHeaders = false
    let formDoc = {
      _id: flatResponse.formId,
      columnHeaders: []
    }
    // Get the doc if it already exists.
    try {
      let doc = await db.get(formDoc._id)
      formDoc = doc
    } catch(e) {
      // It's a new doc, no worries.
    }
    Object.keys(flatResponse).forEach(key => {
      if (formDoc.columnHeaders.find(header => header.key === key) === undefined) {
        // Make the header property (AKA label) just the variable name.
        const firstOccurenceIndex = key.indexOf('.')
        const secondOccurenceIndex = key.indexOf('.', firstOccurenceIndex+1)
        formDoc.columnHeaders.push({ key, header: key.substr(secondOccurenceIndex+1, key.length) })
        foundNewHeaders = true
      }
    })
    if (foundNewHeaders) {
      try {
        await db.put(formDoc)
      } catch(err) {
        log.error(err)
        reject(err)
      }
    }
    resolve(true)
  })
}

function saveFlatFormResponse(doc, db) {
  return new Promise((resolve, reject) => {
    db.get(doc._id)
      .then(oldDoc => {
        // Overrite the _rev property with the _rev in the db and save again.
        const updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
        db.put(updatedDoc)
          .then(_ => resolve(true))
          .catch(error => reject(`Could not save Flattened Form Response ${JSON.stringify(updatedDoc._id)} because Error of ${JSON.stringify(error)}`))
      })
      .catch(error => {
        db.put(doc)
          .then(_ => resolve(true))
          .catch(error => reject(`Could not save Flattened Form Response ${JSON.stringify(doc)._id} because Error of ${JSON.stringify(error)}`))
    });
  })
}
