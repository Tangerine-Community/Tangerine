(doc) ->
  return if doc.collection isnt 'result'
  if doc.uploadDate 
    emit doc.uploadDate, null
