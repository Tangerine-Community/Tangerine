( doc ) ->

  return if not doc.collection?
  return if doc.collection is "result"

  if doc.curriculumId
    id = doc.curriculumId
    return if doc.collection is "klass" # don't move classes
  else
    id = doc.assessmentId

  emit id.substr(-5,5), null
