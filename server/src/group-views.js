const emit = _ => { }

module.exports = {}

module.exports.responsesByFormId = function(doc) {
  if (doc.form && doc.form.id) {
    return emit(doc.form.id, true)
  }
} 
