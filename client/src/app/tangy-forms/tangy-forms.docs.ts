const emit = (key: any, value?:any) => {
  return true;
}

export const TangyFormsDocs = [
  {
    _id: '_design/responsesUnLockedAndNotUploaded',
    views: {
      'responsesUnLockedAndNotUploaded': {
        map: function (doc: any) {
          if (doc.collection === 'TangyFormResponse' && doc.complete === false && (!doc.uploadDatetime || doc.lastModified > doc.uploadDatetime)) {
            emit(doc.form.id, true)
          }
        }.toString()
      }
    }
  }
]
