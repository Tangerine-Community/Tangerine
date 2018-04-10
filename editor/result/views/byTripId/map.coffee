(doc) ->
  tripId = doc.tripId
  id = doc.assessmentId or doc.curriculumId
  if doc.collection == "result"
    if tripId
      return emit tripId, doc._id
    else
      return emit id, doc._id
  return
