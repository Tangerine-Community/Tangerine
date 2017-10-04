(function(doc) {
  var id, rev;
  id = doc.assessmentId || doc.curriculumId;
  rev = {
    r: doc._rev
  };
  if (doc.collection === 'question') {
    emit('q' + doc.subtestId, null);
    return emit('q' + id, rev);
  } else if (doc.collection === 'subtest') {
    return emit('s' + id, rev);
  } else if (doc.collection === 'result') {
    return emit('r' + id, rev);
  } else if (doc.collection === 'assessment') {
    return emit('a' + id, rev);
  }
});
