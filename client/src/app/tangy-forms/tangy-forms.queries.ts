// Stub emit function to please TS.
const emit = (key, value) => {
  return true;
}

export const TangyFormsQueries = {
  responsesByFormId: {
    map: function (doc) {
      if (doc.collection !== 'TangyFormResponse') return
      emit(`${doc.form.id}`, true)
    }.toString()
  },
  responsesCompleted: {
    map: function (doc) {
      if ((doc.collection === 'TangyFormResponse' && doc.complete === true ||
        (doc.collection === 'TangyFormResponse' && doc.form.id === 'user-profile'))) {
        emit(doc._id, true)
      }
    }.toString()
  },
  // @TODO These views are for Sync Protocol 1 only. We should move these to another module specific to SP1.
  responsesLockedAndNotUploaded: {
    map: function (doc) {
      if (doc.collection === 'TangyFormResponse' && doc.complete === true && !doc.uploadDatetime) {
        emit(doc.form.id, true)
      }
    }.toString()
  },
  responsesUnLockedAndNotUploaded: {
    map: function (doc) {
      if (doc.collection === 'TangyFormResponse' && doc.complete === false && !doc.uploadDatetime) {
        emit(doc.form.id, true)
      }
    }.toString()
  },
  responsesLockedAndUploaded: {
    map: function (doc) {
      if (doc.collection === 'TangyFormResponse' && doc.complete === true && doc.uploadDatetime) {
        emit(doc.form.id, true)
      }
    }.toString()
  },
  responsesUnLockedAndUploaded: {
    map: function (doc) {
      if (
        (doc.collection === 'TangyFormResponse' && doc.complete === false && doc.uploadDatetime && ((doc.uploadDatetime > doc.lastModified) || (doc.uploadDatetime > doc.tangerineModifiedOn)))
      ) {
        emit(doc.form.id, true)
      }
    }.toString()
  },
  responsesByLocationId: {
    map: function (doc) {
      if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
        if (doc.form.id === 'user-profile' || doc.form.id === 'reports') return
        let inputs = [];
        doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
        let location = inputs.find(input => (input.tagName === 'TANGY-LOCATION') ? true : false)
        if (location) {
          let lowestLevelLocation = location.value.pop()
          emit(lowestLevelLocation.value, true);
        }
      }
    }.toString()
  },
  responsesByYearMonthLocationId: {
    map: function (doc) {
      if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
        if (doc.form.id === 'user-profile' || doc.form.id === 'reports') return
        // @TODO Take into account timezone.
        const startDatetime = new Date(doc.startUnixtime);
        let inputs = [];
        doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
        let location = inputs.find(input => (input.tagName === 'TANGY-LOCATION') ? true : false)
        if (location) {
          const lowestLevelLocation = location.value.pop()
          const thisLocationId = lowestLevelLocation.value;
          emit(`${thisLocationId}-${startDatetime.getDate()}-${startDatetime.getMonth()}-${startDatetime.getFullYear()}`, true);
        }
      }
    }.toString()
  },
  responsesByFormIdAndStartDatetime: {
    map: function (doc) {
      if (doc.collection !== 'TangyFormResponse') return
      emit(`${doc.form.id}-${doc.startUnixtime}`, true)
    }.toString()
  },
  responseByUploadDatetime: {
    map: function (doc) {
      if (doc.collection !== 'TangyFormResponse' || !doc.uploadDatetime) return
      emit(doc.uploadDatetime, true)
    }.toString()
  }
}
