( doc ) ->

  return unless doc.collection is 'question'

  id = doc.assessmentId or doc.curriculumId

  emit id, doc if id?
