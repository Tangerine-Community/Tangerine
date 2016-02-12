( doc, req ) ->
  return false if doc.collection?
  return false if doc.collection isnt "result"

  return true if doc.assessmentId and doc.assessmentId.substr(-5,5) == req.query.downloadKey
      
  return false;
