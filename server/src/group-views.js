const emit = _ => { }

module.exports = {}

module.exports.responsesByFormId = function(doc) {
  if (doc.form && doc.form.id) {
    return emit(doc.form.id, true)
  }
} 

module.exports.responsesByStartUnixTime = function(doc) {
  if (doc.collection === "TangyFormResponse") {
    return emit(doc.startUnixtime, true)
  }
}

module.exports.responsesByMonthAndFormId = function(doc) {
  if (doc.form && doc.form.id) {
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const startUnixtime = new Date(doc.startUnixtime);
          const key = doc.form.id + '_' + startUnixtime.getFullYear() + '_' + MONTHS[startUnixtime.getMonth()];
    return emit(key, doc)
  }
}

module.exports.responsesByUserProfileId = function(doc) {
  if (doc.collection === "TangyFormResponse") {
    if (doc.form && doc.form.id === 'user-profile') {
      return emit(doc._id, true)
    }
    var inputs = doc.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
    var userProfileInput = null
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

module.exports.unpaid = function(doc) {
  if (doc.collection === "TangyFormResponse" && !doc.paid) {
    emit(true, true)
  }
}

module.exports.responsesByUserProfileShortCode = function(doc) {
  if (doc.collection === "TangyFormResponse") {
    if (doc.form && doc.form.id === 'user-profile') {
      return emit(doc._id.substr(doc._id.length-6, doc._id.length), true)
    }
    var inputs = doc.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
    var userProfileInput = null
    inputs.forEach(function(input) {
      if (input.name === 'userProfileId') {
        userProfileInput = input
      }
    })
    if (userProfileInput) {
      emit(userProfileInput.value.substr(userProfileInput.value.length-6, userProfileInput.value.length), true)
    }
  }
}

module.exports.groupIssues = function(doc) {
  if (doc.collection === "TangyFormResponse" && doc.type === "issue") {
    var lastFilledOutNode;
    if (doc.location) {
      for (var property in doc.location) {
        if (doc.location.hasOwnProperty(property)) {
          if (doc.location[property]) {
            lastFilledOutNode = doc.location[property]
          }
        }
      }
    }
    if (doc.events && doc.events[0] && doc.events[0].data && doc.events[0].data.conflict) {
      emit([doc.status,"conflict",lastFilledOutNode, doc.tangerineModifiedOn])
    } else {
      emit([doc.status,"issue",lastFilledOutNode, doc.tangerineModifiedOn])
    }
  }
}

module.exports.groupConflicts = function(doc) {
  if (doc.collection === "TangyFormResponse" && doc.type === "issue") {
    if (doc.events && doc.events[0] && doc.events[0].data && doc.events[0].data.conflict) {
      emit([doc.caseId])
    }
  }
}

module.exports.syncConflicts = function(doc) {
  if (doc._conflicts) {
    emit(true)
  }
}