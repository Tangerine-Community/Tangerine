module.exports = {
  _id: '_design/byParticipant',
  version: '1',
  views: {
    byParticipant: {
      map: function (doc) {
        if (doc.type === 'participant') {
          emit(doc._id, 1);
        }
      }.toString()
    }
  }
}