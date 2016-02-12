(doc) ->
  if doc.collection == 'result'
    emit doc.assessmentId, 1
