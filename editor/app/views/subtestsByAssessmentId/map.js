(function(doc) {
  var id;
  if (doc.collection !== "subtest") {
    return;
  }
  id = doc.assessmentId || doc.curriculumId;
  if (id === null) {
    return;
  }
  return emit(id, doc);
});
