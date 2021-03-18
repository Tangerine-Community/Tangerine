
module.exports = {
  name: 'csv',
  hooks: {
    install: async function() {
      // TODO: For each group, this.groupNew(group)
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
            const docWithConflicts = await sourceDb.get(doc._id, {conflicts: true})
            if (docWithConflicts._conflicts.length === 0) {
              return resolve(data)
            }
            const openConflictIssuesByDocId = await db.query('openConflictIssuesByDocId', {key: doc._id, include_docs:true})
            if (openConflictIssuesByDocId.rows.length > 0) {
              // Check to see if we need to add any conflict revs to the existing Conflict Issue.
              const conflictIssueDoc = openConflictIssuesByDocId.rows[0].doc
              const knownConflictRevs = conflictIssueDoc.conflict.map(conflict => conflict.rev)
              const newConflictRevs = docWithConflicts._conflicts.filter(rev => !knownConflictRevs.includes(rev))
              if (newConflictRevs.length > 0) {
                for (const newConflictRev of newConflictRevs) {
                  const newConflictRevDoc = await sourceDb.get(doc._id, {rev: newConflictRev})
                  conflictIssueDoc.conflictInfo.push({
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
                conflictDocId: doc._id,
                conflicts: [],
                events: [
                  // TODO
                ]
              }
              for (const conflictRev of docWithConflicts._conflicts) {
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
        await insertDataConflictsViews(groupName)
        resolve(data)
      })
    }
  }
}

