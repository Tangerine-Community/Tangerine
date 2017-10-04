(function(doc) {
  if (doc.collection !== "result") {
    return;
  }
  return emit([doc.studentId, doc.subtestId], doc);
});
