const emit = (key, value?:any) => {
  return true;
}

export const CaseHomeDocs = [
  {
    _id: '_design/case-events-by-all-days',
    views: {
      'case-events-by-all-days': {
        map: function (doc) {
          if (doc.collection === 'TangyFormResponse' && doc.type === 'case' && doc.events && doc.events.length > 0) {
            for (let event of doc.events) {
              if (event.scheduledDay) {
                emit(event.scheduledDay, { caseId: doc._id, eventId: event.id })
              }
              if (event.occuredOnDay) {
                emit(event.occuredOnDay, { caseId: doc._id, eventId: event.id })
              }
              if (event.estimatedDay) {
                emit(event.estimatedDay, { caseId: doc._id, eventId: event.id })
              }
            }
          }
        }.toString()
      }
    }
  }
]
