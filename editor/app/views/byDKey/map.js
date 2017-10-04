(function(doc) {
  var id, idSuffix;
  if (doc.collection === "result") {
    return;
  }
  if (doc.curriculumId) {
    id = doc.curriculumId;
    if (doc.collection === "klass") {
      return;
    }
  } else if (doc.collection === "workflow") {
    id = doc._id;
  } else if (doc.collection === "feedback") {
    idSuffix = "-feedback";
    id = doc._id.substring(0, doc._id.length - idSuffix.length);
  } else {
    id = doc.assessmentId;
  }
  return emit(id.substr(-5, 5), null);
});
