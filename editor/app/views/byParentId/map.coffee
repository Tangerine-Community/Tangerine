( doc ) ->

  id = doc.assessmentId or doc.curriculumId

  rev = { r : doc._rev }

  if doc.collection is 'question'

    emit 'q' + doc.subtestId, null

    emit 'q' + id, rev

  else if doc.collection is 'subtest'

    emit 's' + id, rev

  else if doc.collection is 'result'

    emit 'r' + id, rev

  else if doc.collection is 'assessment'

    emit 'a' + id, rev

  else if doc.collection is 'element'

    emit 'e' + id, rev
