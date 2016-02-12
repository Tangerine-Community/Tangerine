( doc ) ->
  return unless doc.collection is 'result'
  id = doc.assessmentId || doc.klassId
  emit id, null
