(function(doc) {
  if (doc.collection) {
    emit(doc.collection, {
      "r": doc._rev
    });
  }
  if (doc.collection !== 'result') {
    return emit('forClient', {
      "r": doc._rev
    });
  }
});
