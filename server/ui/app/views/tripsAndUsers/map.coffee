# this view also 
( doc ) ->

  return unless doc.collection is 'result' and doc.workflowId

  emit doc.enumerator || doc.editedBy, doc.tripId
  emit doc.tripId, doc._id
