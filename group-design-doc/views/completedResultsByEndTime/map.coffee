(doc) ->
  return unless doc.collection?
  return if doc.collection isnt 'result'
  return unless doc.subtestData?.length?

  for subtest in doc.subtestData
    if subtest.prototype is 'complete'
      emit subtest.data.end_time, null
