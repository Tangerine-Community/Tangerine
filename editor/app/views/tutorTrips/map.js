(function(doc) {
  var docTime, month, year;
  if (doc.collection !== "result") {
    return;
  }
  if (!doc.tripId) {
    return;
  }
  docTime = new Date(doc.startTime || doc.start_time || doc.subtestData.start_time);
  year = docTime.getFullYear();
  month = docTime.getMonth() + 1;
  emit("year" + year + "month" + month + "workflowId" + doc.workflowId, doc.tripId);
  return emit("workflow-" + doc.workflowId, doc.tripId);
});
