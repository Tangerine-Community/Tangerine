(doc) ->
  if doc.collection == 'result'
    total = doc.subtestData[doc.subtestData.length-1].timestamp - doc.start_time
    emit doc.assessmentId, total
