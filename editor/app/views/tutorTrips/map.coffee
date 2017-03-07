(doc) ->

  return unless doc.collection is "result"
  return unless doc.tripId

  #
  # by month
  #

  docTime = new Date(doc.startTime || doc.start_time || doc.subtestData.start_time)
  year  = docTime.getFullYear()
  month = docTime.getMonth() + 1
  emit "year#{year}month#{month}workflowId#{doc.workflowId}", doc.tripId

  #
  # by workflow
  #

  emit "workflow-" + doc.workflowId, doc.tripId
