( doc ) ->

  return unless doc.collection is 'question'
  emit doc.subtestId, doc
  
  id = doc.assessmentId or doc.curriculumId
  
  emit id, doc if id?
