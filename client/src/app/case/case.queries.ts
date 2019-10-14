// Stub emit function to please TS.
const emit = (key, value) => {
  return true;
}

export interface CaseEventPointer {
  caseEventId:string
  caseId:string

}

export const CaseQueries = {
  caseEventPointersByStatus: {
    map: function (doc) {
      if (doc.collection === 'TangyFormResponse' && doc.type === 'case' && Array.isArray(doc.events)) {
        for (let caseEvent of doc.events) {
          emit(caseEvent.status, <CaseEventPointer>{
            caseEventId: caseEvent.id,
            caseId: doc._id
          })
        }
      }
    }.toString()
  }
}
