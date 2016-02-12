( doc ) ->

  return if doc.collection is "result"

  id = doc.assessmentId or doc.curriculumId

  return unless id?

  emit id,
    "_id" : doc._id
    "_rev" : doc._rev 
