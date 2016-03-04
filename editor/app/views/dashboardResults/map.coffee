( doc ) ->

  return unless doc.collection is "result"

  result =
    resultId         : doc._id
    enumerator       : doc.enumerator
    assessmentName   : doc.assessmentName
    startTime        : doc.start_time
    tangerineVersion : doc.tangerine_version
    numberOfSubtests : doc.subtestData.length
    subtests         : []

  for subtest in doc.subtestData

    result.subtests.push subtest.name if subtest.name
    prototype = subtest.prototype

    if prototype is "id"
      result.id = subtest.data.participant_id

    if prototype is "location"
      for label, i in subtest.data.labels
       result["Location: #{label}"] = subtest.data.location[i]

  emit doc.assessmentId, result
