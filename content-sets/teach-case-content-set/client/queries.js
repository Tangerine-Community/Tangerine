[
  {
    _id: '_design/participantSearch',
    views: {
      participantSearch: {
        map: function (doc) {
          if (doc.type === 'case' && doc.participants && Array.isArray(doc.participants)) {
            for (let participant of doc.participants) {
              if (participant.data && typeof participant.data === 'object') {
                for (let property in participant.data) {
                  emit(`${participant.data[property]}`.toLocaleLowerCase(), {
                    caseId: doc._id,
                    participantId: participant.id,
                    matchesOn: property
                  })
                }
              }
            }
          }
        }.toString()
      }
    }
  },
  {
    id: 'findParticipantByCaseFormIdAndLocationAndData',
    version: '1',
    view: {
      map: function(doc) {
        const locationLevels = [
          "region",
          "district",
          "facility"
        ]
        const variablesToIndexByRoleId = {
          'role-1': ['first_name', 'last_name', 'participant_id']
        }
        if (doc.type === 'case') {
          if (doc.location && typeof doc.location === 'object' && doc.participants && Array.isArray(doc.participants) && doc.participants.length > 0) {
            // Some groups may use a different data structure for locations.
            // The commented-out code is for location arrays.
            // let locationKeys = []
            // for (var i = 0; i < locationLevels.length; i++) {
            //   var key = locationLevels[i]
            //   for (var j = 0; j < doc.location.length; j++) {
            //     var part = doc.location[j]
            //     if (part.level === key) {
            //       locationKeys.push(part.value)
            //     }
            //   }
            // }
            const locationKeys = locationLevels.map(key => doc.location[key])
            for (let participant of doc.participants) {
              if (
                Object.keys(variablesToIndexByRoleId).includes(participant.caseRoleId) &&
                typeof participant.data === 'object'
              ) {
                for (let variableName of variablesToIndexByRoleId[participant.caseRoleId]) {
                  emit(
                    [
                      doc.form.id,
                      ...locationKeys,
                      `${participant.data[variableName]}`.toLocaleLowerCase()
                    ].join(''),
                    {
                      caseId: doc._id,
                      participantId: participant.id,
                      matchesOn: variableName
                    }
                  )
                }
              }
            }
          }
        }
      }
    }
  },
  {
    "id": "registrationResults",
    "version": "1",
    "view": {
      "map": function (doc) {
        if (doc.form && doc.form.id) {
          const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const startUnixtime = new Date(doc.startUnixtime);
          const key = doc.form.id + '_' + startUnixtime.getFullYear() + '_' + MONTHS[startUnixtime.getMonth()];
          //The emmitted value is in the form \"formId\" i.e `formId` and also \"formId_2018_May\" i.e `formId_Year_Month`
          if (doc.form.id === 'registration-role-1') {
            if (T.form.Get(doc, 'consent') === 'yes') {
              return emit(key, [1, 0]);
            } else {
              return emit(key, [0, 1]);
            }
          }
        }
      },
      "reduce": "_sum"
    }
  },
  {
    "id": "shared_responsesByStartUnixTime",
    "version": "1",
    "view": {
      "map": function (doc) {
        if (doc.collection === "TangyFormResponse") {
          return emit(doc.startUnixtime, true);
        }
      }
    }
  }
]
