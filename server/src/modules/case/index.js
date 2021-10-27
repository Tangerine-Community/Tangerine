const DB = require("../../db.js");
const {log} = require("tangy-log");
const conflictsDdoc = require(`./conflicts_view.js`)
const byConflictDocIdDdoc = require(`./byConflictDocId_view.js`)

module.exports = {
  name: 'case',
  hooks: {
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        let groupLogDb = new DB(`${groupName}-log`)
        try {
          let doc = await groupLogDb.put({"_id":"foo"})
          log.info(`Init doc inserted into ${groupName}-log`)
          await groupLogDb.remove(doc)
        } catch (error) {
          log.error(error)
        }
        
        let groupDb = new DB(`${groupName}`)
        log.info(`${groupName}-log database created.`)
        let conflictsViewDDoc = Object.assign({}, conflictsDdoc)
        try {
          let status = await groupDb.post(conflictsViewDDoc)
          log.info(`group conflictsViewDDoc inserted into ${groupName}-log`)
        } catch (error) {
          log.error(error)
        }
        const dbConflictRev = new DB(`${groupName}-conflict-revs`)
        try {
          let status = await dbConflictRev.put(byConflictDocIdDdoc)
          log.info(`group byConflictDocIdDdoc inserted into ${groupName}-conflict-revs`)
        } catch (error) {
          log.error(error)
        }
        
        
        resolve(data)
      })
    }
  },
};
