(function(doc) {
  var conflict, dKey, docId, i, len, ref, results;
  if (doc._conflicts == null) {
    return;
  }
  if (doc.collection === "result") {
    return;
  }
  docId = doc.assessmentId || doc.curriculumId;
  dKey = docId.substr(-5, 5);
  emit(dKey, {
    "_id": doc._id,
    "_rev": doc._rev
  });
  ref = doc._conflicts;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    conflict = ref[i];
    results.push(emit(dKey, {
      "_id": doc._id,
      "_rev": conflict
    }));
  }
  return results;
});
