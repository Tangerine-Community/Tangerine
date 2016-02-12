(doc) ->
  if doc.collection == 'result'
    result ={}
    if doc.timestamp? then result.timestamp = doc.timestamp
    for subtest in doc.subtestData
      if subtest.prototype is "id" then result.participant_id = subtest.data.participant_id
      if subtest.prototype is "complete" then result.end_time = subtest.data.end_time
    result.start_time = doc.start_time

    emit doc.assessmentId, result
     
