(document) ->
  if document.collection is "result"
    result =
      resultId: document._id
      enumerator: document.enumerator
      assessmentName: document.assessmentName
      startTime: document.start_time
      tangerineVersion: document.tangerine_version
      numberOfSubtests: document.subtestData.length
      subtests: []
    for subtestResult in document.subtestData
      result.subtests.push subtestResult.name if subtestResult.name
      subtestPrototype = subtestResult["prototype"]
      if subtestPrototype is "id"
        result["id"] = subtestResult.data.participant_id
      if subtestPrototype is "location"
        for label,index in subtestResult.data.labels
         result["Location: #{label}"] = subtestResult.data.location[index]
    emit document.assessmentId, result
