const emit = (key, value = '') => {
  return true;
}

export const TWO_WAY_SYNC_DEFAULT_USER_DOCS = [
  {
    _id: '_design/two-way-sync_conflicts',
    views: {
      'two-way-sync_conflicts': {
        map: function (doc) {
          if (doc._conflicts) {
            emit(true)
          }
        }.toString()
      }
    }
  },
  {
    _id: '_design/sync_filter-by-form-ids',
    filters: {
      "sync_filter-by-form-ids": function (doc, req) {
        var formIds = req.query.formIds.split(',')
        var docIds = req.query.docIds.split(',')
        return doc.collection === 'TangyFormResponse' &&
          (
            (
              docIds.indexOf(doc._id) !== -1
            )
            ||
            (
              doc.form &&
              doc.form.id &&
              formIds.indexOf(doc.form.id) !== -1
            )
          )
      }.toString()
    }
  } 
]