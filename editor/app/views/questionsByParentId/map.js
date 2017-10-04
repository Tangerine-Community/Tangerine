(function(doc) {
  var id;
  if (doc.collection !== 'question') {
    return;
  }
  emit(doc.subtestId, doc);
  id = doc.assessmentId || doc.curriculumId;
  if (id != null) {
    return emit(id, doc);
  }
});
