module.exports = [
  {
    _id: '_design/sync_filter-by-form-ids',
    filters: {
      "sync_filter-by-form-ids": function (doc, req) {
        var formIds = req.query.formIds.split(',')
        return doc.collection === 'FormResponse' &&
          doc.form &&
          doc.form.id &&
          formIds.includes(doc.form.id)
      }.toString()
    }
  }
]