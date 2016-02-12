( doc ) ->

  return unless doc.collection is "subtest"

  id = doc.assessmentId or doc.curriculumId

  return unless id != null

  emit id, doc
