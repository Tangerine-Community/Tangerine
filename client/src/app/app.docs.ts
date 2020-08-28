const emit = (key, value?:any) => {
  return true;
}

export const AppDocs = [
  {
    _id: '_design/byType',
    views: {
      'byType': {
        map: function (doc) {
          emit(doc.type, true)
        }.toString()
      }
    }
  }
]
