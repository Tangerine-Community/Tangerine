(function(doc) {
  if (doc.parent_id) {
    emit(doc.parent_id, doc._id);
    return emit(doc.parent_id + "_" + doc.result_year + "_" + doc.result_month, doc._id);
  }
});
