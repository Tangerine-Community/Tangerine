module.exports = {
  _id: '_design/byConflictDocId',
  version: '1',
  views: {
    byConflictDocId: {
      map: function(doc) {
        emit(doc.conflictDocId, doc.conflictRev);
      }.toString(),
      reduce: '_count'
    }
  }
}