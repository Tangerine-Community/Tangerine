module.exports = {
  _id: '_design/byType',
  version: '1',
  views: {
    'byType': {
      map: function (doc) {
        emit(doc.type, true)
      }.toString()
    }
  }
}