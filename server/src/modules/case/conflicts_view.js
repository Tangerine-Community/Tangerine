module.exports = {
  _id: '_design/conflicts',
  version: '1',
  views: {
    conflicts: {
      map: function (doc) {
        if (doc._conflicts) {
          emit(doc._id, doc._conflicts.length)
        }
      }.toString()
    }
  }
}