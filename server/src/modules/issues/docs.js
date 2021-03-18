// Stub for type checking.
function emit(key, value) { }

module.exports = [
  {
    _id: '_design/issuesByIssueTypeAndStatusAndFormResponseId',
    views: {
      issuesByIssueTypeAndStatusAndFormResponseId: {
        map: function(doc) {
          if (doc.type === 'issue') {
            const issueType = doc.issueType
              ? doc.issueType
              : doc.events && doc.events[0].conflict
                ? 'auto-merge'
                : 'eventForm'
            emit([issueType, doc.status, doc.formResponseId], true)
          }
        }.toString()
      }
    }
  },
  {
    _id: '_design/issuesByCreatedOnDate',
    views: {
      issuesByCreatedOnDate: {
        map: function(doc) {
          if (doc.type === 'issue' && doc.issueType === 'conflict') {
            emit(doc.conflictDocId, true)
          }
        }.toString()
      }
    }
  }
]

