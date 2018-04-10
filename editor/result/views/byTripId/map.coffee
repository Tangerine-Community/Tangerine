(doc) ->
  tripId = doc.tripId
  id = doc.assessmentId or doc.curriculumId
  if doc.collection == "result"
    if tripId
      emit tripId, doc._id
    else
      emit id, doc._id
  return
