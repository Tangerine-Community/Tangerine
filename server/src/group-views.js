const emit = _ => { }

module.exports = {}

module.exports.docCountByLocationId = {
  map: function(doc) {
    if (doc.location) {
      Object.getOwnPropertyNames(doc.location).forEach(function(locationLevel) {
        // Emit location's ID and add one.
        emit(doc.location[locationLevel], 1)
      })
    }
  },
  reduce: '_sum'
}

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
      return emit(doc._id.trim(), true)
    }
    var inputs = doc.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
    var userProfileInput = null
    inputs.forEach(function(input) {
      if (input.name === 'userProfileId') {
        userProfileInput = input
      }
    })
    if (userProfileInput) {
      emit(userProfileInput.value.trim(), true)
    }
  }
}

module.exports.unpaid = function(doc) {
  if (doc.collection === "TangyFormResponse" && !doc.paid) {
    emit(true, true)
  }
}

// T_USER_SHORT_CODE_LENGTH will get replaced when called by insert-group-view.js and default to 6 if not set.
module.exports.responsesByUserProfileShortCode = {
  map: function (doc) {
    const userShortCodeLength = T_USER_SHORT_CODE_LENGTH || 6
    if (doc.form && doc.form.id === 'user-profile') {
      const userProfileId = doc._id.trim()
      if (userProfileId.length < userShortCodeLength) {
        return emit(userProfileId, 1)
      } else {
        return emit(userProfileId.substr(userProfileId.length - userShortCodeLength, userProfileId.length), 1)
      }
    }
    var inputs = doc.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
    var userProfileInput = null
    inputs.forEach(function(input) {
      if (input.name === 'userProfileId') {
        userProfileInput = input
      }
    })
    if (userProfileInput) {
      const userProfileInputValue = userProfileInput.value.trim()
      if (userProfileInputValue.length < userShortCodeLength) {
        emit(userProfileInputValue, 1)
      } else {
        emit(userProfileInputValue.substr(userProfileInputValue.length-userShortCodeLength, userProfileInputValue.length), 1)
      }
    }
  },
  reduce: '_count'
}

// T_USER_SHORT_CODE_LENGTH will get replaced when called by insert-group-view.js and default to 6 if not set.
module.exports.userProfileByUserProfileShortCode = function (doc) {
  const userShortCodeLength = T_USER_SHORT_CODE_LENGTH || 6
  if (doc.collection === "TangyFormResponse" && doc.form && doc.form.id === 'user-profile') {
    const userProfileId = doc._id.trim()
    if (userProfileId.length < userShortCodeLength) {
      return emit(userProfileId, true)
    } else {
      return emit(userProfileId.substr(userProfileId.length - userShortCodeLength, userProfileId.length), true);
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

module.exports.issuesByCaseId = function(doc) {
  if (doc.collection === "TangyFormResponse" && doc.type === "issue") {
    emit(doc.caseId, true)
  }
}

module.exports.issuesByFormResponseId = function(doc) {
  if (doc.collection === "TangyFormResponse" && doc.type === "issue") {
    emit(doc.formResponseId, true)
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

module.exports.conflicts = function(doc) {
  if (doc._conflicts) {
    emit(doc._id, doc._conflicts.length)
  }
}

module.exports.cases = function(doc) {
  if (doc.type === 'case') {
    emit(doc._id, true)
  }
}

module.exports.caseEvents = function(doc) {
  if (doc.type === 'case') {
    if (doc.events && doc.events.length > 0) {
      doc.events.forEach(function (caseEvent) {
        emit(caseEvent.id, true)
      })
    }
  }
}

module.exports.eventForms = function(doc) {
  if (doc.type === 'case') {
    if (doc.events && doc.events.length > 0) {
      doc.events.forEach(function (caseEvent) {
        if (caseEvent.eventForms && caseEvent.eventForms.length > 0) {
          caseEvent.eventForms.forEach(function(eventForm) {
            emit(eventForm.id, true)
          })
        }
      })
    }
  }
}
module.exports.participants = function(doc) {
  if (doc.type === 'case') {
    if (doc.participants && doc.participants.length > 0) {
      doc.participants.forEach(function (participant) {
        emit(participant.id, true)
      })
    }
  }
}

// Is this still useful?
module.exports.issuesOfTypeConflictByConflictingDocTypeAndConflictingDocId = function (doc) {
  if (doc.events && doc.events[0] && doc.events[0].data && doc.events[0].data.conflict && doc.events[0].data.conflict.diffInfo) {
    emit([doc.events[0].data.conflict.diffInfo.a.type, doc.events[0].data.conflict.diffInfo.a._id], true)
  }
}

// I think this is the useful one.
module.exports.issuesOfTypeConflictByConflictingDocId = {
  map: function (doc) {
    if (doc.events && doc.events[0] && doc.events[0].data && doc.events[0].data.conflict && doc.events[0].data.conflict.diffInfo) {
      emit(doc.events[0].data.conflict.diffInfo.a._id, doc._id)
    }
  },
  reduce: '_count'
} 

module.exports.listDevices =  {
  database: 'devices',
  map: function (doc) {
    var replicationStatus
    if (doc.replicationStatuses && doc.replicationStatuses.length > 0) {
      replicationStatus = doc.replicationStatuses[doc.replicationStatuses.length - 1]
    }
    var status = {
      _id: doc._id,
      token: doc.token,
      claimed:doc.claimed,
      verified:doc.verified,
      description: doc.description,
      registeredOn: doc.registeredOn,
      syncedOn: doc.syncedOn,
      updatedOn: doc.updatedOn,
      assignedLocation: doc.assignedLocation,
      syncLocations: doc.syncLocations,
      replicationStatus: replicationStatus
    }
    emit(doc._id, status);
  }
}

module.exports.byConflictDocId =  {
  database: 'conflict-revs',
  map: function(doc) {
    emit(doc.conflictDocId, doc.conflictRev);
  }.toString(),
  reduce: '_count'
}
