(function(doc) {
  var tripId = doc.tripId;
  var id = doc.assessmentId || doc.curriculumId;
  if (doc.collection === "result") {
    if(tripId) {
      return emit(tripId, doc._id);
    } else {
      return emit(id, doc._id);
    }
  }
});
