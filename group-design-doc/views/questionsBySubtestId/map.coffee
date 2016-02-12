(doc) ->

  return unless doc.collection is 'question'

  emit doc.subtestId, doc
