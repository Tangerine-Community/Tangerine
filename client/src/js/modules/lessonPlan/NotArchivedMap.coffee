( doc ) ->

  return if doc.collection is "result"

  id = doc.assessmentId
  notArchived = !(doc.archived == true || doc.archived == "true");
  emit id.substr(-5,5), null if notArchived

