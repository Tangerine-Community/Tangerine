( doc ) ->

  return unless doc.collection is "result"

  emit [doc.studentId, doc.subtestId], doc
