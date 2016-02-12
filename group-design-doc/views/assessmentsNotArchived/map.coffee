(doc) ->

  rightCollection = doc.collection is 'curriculum' or doc.collection is 'assessment'
  return if not rightCollection
  
  isArchived = doc.archived is "false" or doc.archived is false
  return if isArchived
  
  emit doc.id, null
