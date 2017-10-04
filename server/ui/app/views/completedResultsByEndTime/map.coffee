(doc) ->
  return if doc.collection isnt 'result'

  for subtest in doc.subtestData
    if subtest.prototype is "complete"
      emit subtest.data.end_time, null
