( doc ) ->

  return unless doc._conflicts?

  return if doc.collection is "result"

  docId = doc.assessmentId or doc.curriculumId

  dKey = docId.substr(-5,5);

  emit dKey,
    "_id"  : doc._id
    "_rev" : doc._rev

  for conflict in doc._conflicts
    emit dKey,
      "_id"  : doc._id
      "_rev" : conflict


