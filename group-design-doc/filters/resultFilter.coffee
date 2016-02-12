(doc, req) ->
  if doc.collection && doc.collection == "result" && doc.assessmentId is req.query.assessmentId
    return true
  return false
