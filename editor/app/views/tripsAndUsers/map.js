(function(doc) {
  if (!(doc.collection === 'result' && doc.workflowId)) {
    return;
  }
  emit(doc.enumerator || doc.editedBy, doc.tripId);
  return emit(doc.tripId, doc._id);
});
