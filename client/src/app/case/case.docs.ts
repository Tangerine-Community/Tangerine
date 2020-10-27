const emit = function(key, value) { }

export const CaseDocs = [
  {
    _id: '_design/participantSearch',
    views: {
      participantSearch: {
        map: function (doc) {
          if (doc.type === 'case' && doc.participants && Array.isArray(doc.participants)) {
            for (let participant of doc.participants) {
              if (participant.data && typeof participant.data === 'object') {
                for (let property in participant.data) {
                  emit(`${participant.data[property]}`.toLocaleLowerCase(), {
                    caseId: doc._id,
                    participantId: participant.id,
                    matchesOn: property
                  })
                }
              }
            }
          }
        }.toString()
      }
    }
  }
]

