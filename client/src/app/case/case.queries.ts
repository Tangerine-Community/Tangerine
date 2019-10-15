export const CASE_QUERIES_DESIGN_DOC = 'tangerine-case'
export const EVENT_POINTERS_BY_STATUS = 'EVENT_POINTERS_BY_STATUS' 
export const CASE_QUERIES_EVENT_POINTERS_BY_STATUS = `${CASE_QUERIES_DESIGN_DOC}/${EVENT_POINTERS_BY_STATUS}`

// Stub emit function to please TS.
const emit = (key, value) => {
  return true;
}

export interface CaseEventPointer {
  caseEventId:string
  caseId:string

}

export const CaseQueries = {
  [EVENT_POINTERS_BY_STATUS]: {
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
