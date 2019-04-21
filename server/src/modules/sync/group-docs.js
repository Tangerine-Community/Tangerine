module.exports = [
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