const emit = _ => { }

module.exports = {}

module.exports.responsesByFormId = function(doc) {
  if (doc.form && doc.form.id) {
    return emit(doc.form.id, true)
  }
} 

module.exports.responsesByStartUnixTime = function(doc) {
  if (doc.collection = "TangyFormResponse") {
    return emit(doc.startUnixtime, true)
  }
}

module.exports.responsesByUserProfileId = function(doc) {
  if (doc.collection = "TangyFormResponse") {
    var inputs = doc.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
    var userProfileInput = null
    if (doc.form && doc.form.id === 'user-profile') {
      return emit(doc._id, true)
    }
    inputs.forEach(function(input) {
      if (input.name === 'userProfileId') {
        userProfileInput = input
      }
    })
    if (userProfileInput) {
      emit(userProfileInput.value, true)
    }
  }
}
