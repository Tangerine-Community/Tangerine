(doc) ->

  isRightCollection = doc.collection is "lessonPlan"
  notArchived       = not ( doc.archived is true or doc.archived is "true" )

  emit doc._id, null if isRightCollection and notArchived
