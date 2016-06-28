( doc ) ->

  if (doc.collection != 'result')
    return;

  if (doc.hasOwnProperty 'klassId')
    type = "klass"
    id = doc.klassId
  else
    type = "assessment"
    id = doc.assessmentId

  return emit(id, type)
