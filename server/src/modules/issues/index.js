const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const docs = require(`./docs.js`)
const groupsList = require('/tangerine/server/src/groups-list.js')
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../index.js')()

module.exports = {
  name: 'issues',
  insertIssuesDocs: async function insertIssuesDocs(groupId) { 
    const groupDb = new DB(groupId)
    for (const doc of docs) {
      try {
        await groupDb.put(doc)
      } catch (error) {
        try {
          const currentDoc = await groupDb.get(doc._id)
          await groupDb.put({
            ...doc,
            _rev: currentDoc._rev
          })
        } catch (error) {
          log.error(error)
        }
      }
    }
  },
  hooks: {
    enable: async function() {
      const groups = await groupsList()
      for (groupId of groups) {
        await this.insertIssuesDocs(groupId)
      }
    },
    clearReportingCache: async function(data) {
      // TODO?
      const { groupNames } = data
      for (let groupName of groupNames) {
      }
      return data
    },
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
        try {
          const {doc, sourceDb} = data
          if (doc.type !== 'issue') {
            const currentConflictRevs = (await sourceDb.get(doc._id, {conflicts: true}))._conflicts
            if (currentConflictRevs.length === 0) {
              return resolve(data)
            }
            const openConflictIssuesByDocId = await db.query('issuesByIssueTypeAndStatusAndFormResponseId', {key: ['conflict', 'OPEN', doc._id], include_docs:true})
            if (openConflictIssuesByDocId.rows.length > 0) {
              // Check to see if we need to add any conflict revs to the existing Conflict Issue.
              const conflictIssueDoc = openConflictIssuesByDocId.rows[0].doc
              const knownConflictRevs = conflictIssueDoc.conflict.map(conflict => conflict.rev)
              const newConflictRevs = currentConflictRevs.filter(rev => !knownConflictRevs.includes(rev))
              if (newConflictRevs.length > 0) {
                for (const newConflictRev of newConflictRevs) {
                  const newConflictRevDoc = await sourceDb.get(doc._id, {rev: newConflictRev})
                  conflictIssueDoc.conflicts.push({
                    currentRev: doc._rev,
                    rev: newConflictRev,
                    doc: newConflictRevDoc,
                    resolved: false
                  })
                }
                sourceDb.save(conflictIssueDoc)
              }
            } else {
              // Create a new Conflict Issue.
              const conflictIssueDoc = {
                type: 'issue',
                issueType: 'conflict',
                conflicts: [],
                events: [
                  // TODO
                ],
                label: `Conflict on ${doc._id}`,
                location: doc.location,
                createdOn: Date.now(),
                createdAppContext: 'SERVER',
                resolveOnAppContexts: ['EDITOR'],
                status: 'OPEN',
                formResponseId: doc._id
              }
              for (const conflictRev of currentConflictRevs) {
                const conflictDoc = await sourceDb.get(doc._id, {rev: conflictRev})
                conflictIssueDoc.conflicts.push({
                  currentRev: doc._rev,
                  rev: conflictRev,
                  doc: conflictDoc,
                  resolved: false
                })
              }
              await sourceDb.post(conflictIssueDoc)
            }
          }
          resolve(data)
        } catch(e) {
          reject(e)
        }
      })
    },
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        await this.insertIssuesDocs(groupName)
        resolve(data)
      })
    }
  }
}

