( doc ) ->

  return if doc.collection is "result"

  # Otherwise byDKey will give 
  if doc.curriculumId
    id = doc.curriculumId
    return if doc.collection is "klass"
  else
    id = doc.assessmentId

  emit id.substr(-5,5), null
