(doc) ->

  return unless doc.collection is 'result'

  result = {}

  if doc.timestamp? then result.timestamp = doc.timestamp

  for subtest in doc.subtestData
    result.participant_id = subtest.data.participant_id if subtest.prototype is "id"
    result.end_time       = subtest.data.end_time       if subtest.prototype is "complete"

  result.start_time = doc.start_time

  emit doc.assessmentId, result
