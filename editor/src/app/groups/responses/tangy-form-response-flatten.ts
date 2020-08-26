
export const generateFlatResponse = async function (formResponse, locationList, sanitized) {
  const process = {
    env: {
      T_REPORTING_MARK_SKIPPED_WITH: 'SKIPPED',
      T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH: "ORIGINAL_VALUE"
    }
  }
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  let flatFormResponse = {
    _id: formResponse._id,
    id: formResponse._id.substr(0,6),
    formId: formResponse.form.id,
    startUnixtime: formResponse.startUnixtime||'',
    endUnixtime: formResponse.endUnixtime||'',
    lastSaveUnixtime: formResponse.lastSaveUnixtime||'',
    buildId: formResponse.buildId||'',
    buildChannel: formResponse.buildChannel||'',
    deviceId: formResponse.deviceId||'',
    groupId: formResponse.groupId||'',
    complete: formResponse.complete,
    tangerineModifiedByUserId: formResponse.tangerineModifiedByUserId,
    ...formResponse.caseId ? {
      caseId: formResponse.caseId,
      eventId: formResponse.eventId,
      eventFormId: formResponse.eventFormId,
      participantId: formResponse.participantId || ''
    } : {}
  };
  function set(input, key, value) {
    flatFormResponse[key] = input.skipped
        ? process.env.T_REPORTING_MARK_SKIPPED_WITH
        : input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE"
            ? process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH
            : value
  }
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    flatFormResponse[`${item.id}_firstOpenTime`]= item.firstOpenTime? item.firstOpenTime:''
    for (let input of item.inputs) {
      let sanitize = false;
      if (sanitized) {
        if (input.identifier) {
          sanitize = true
        }
      }
      if (!sanitize) {
        if (input.tagName === 'TANGY-LOCATION') {
          // Populate the ID and Label columns for TANGY-LOCATION levels.
          const locationKeys = []
          for (let group of input.value) {
            locationKeys.push(group.value)
            try {
              const location = getLocationByKeys(locationKeys, locationList)
              set(input, location.level, location.label)
            } catch (e) {
              set(input, group.level, 'orphaned')
            }
          }
        } else if (input.tagName === 'TANGY-RADIO-BUTTONS') {
          set(input, `${input.name}`, input.value.find(input => input.value == 'on')
              ? input.value.find(input => input.value == 'on').name
              : ''
          )
        } else if (input.tagName === 'TANGY-RADIO-BUTTON') {
          set(input, `${input.name}`, input.value
              ? '1'
              : '0'
          )
        } else if (input.tagName === 'TANGY-CHECKBOXES') {
          for (let checkboxInput of input.value) {
            set(input, `${input.name}_${checkboxInput.name}`, checkboxInput.value
                ? "1"
                : "0"
            )
          }
          ;
        } else if (input.tagName === 'TANGY-CHECKBOX') {
          set(input, `${input.name}`, input.value
              ? "1"
              : "0"
          )
        } else if (input.tagName === 'TANGY-TIMED') {
          let hitLastAttempted = false
          for (let toggleInput of input.value) {
            let derivedValue = ''
            if (hitLastAttempted === true) {
              // Not attempted.
              derivedValue = '.'
            } else if (toggleInput.value === 'on' || toggleInput.pressed === true) {
              // If toggle is 'on' (manually pressed) or pressed is true (row marked), the item is incorrect.
              derivedValue = '0'
            } else {
              // Correct.
              derivedValue = '1'
            }
            set(input, `${input.name}_${toggleInput.name}`, derivedValue)
            if (toggleInput.highlighted === true) {
              hitLastAttempted = true
            }
          }
          ;
          set(input, `${input.name}.duration`, input.duration)
          set(input, `${input.name}.time_remaining`, input.timeRemaining)
          set(input, `${input.name}.gridAutoStopped`, input.gridAutoStopped)
          set(input, `${input.name}.autoStop`, input.autoStop)
          set(input, `${input.name}.item_at_time`, input.gridVarItemAtTime ? input.gridVarItemAtTime : '')
          set(input, `${input.name}.time_intermediate_captured`, input.gridVarTimeIntermediateCaptured ? input.gridVarTimeIntermediateCaptured : '')
          // Calculate Items Per Minute.
          let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
          let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
          let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
          set(input, `${input.name}.number_of_items_correct`, numberOfItemsCorrect)
          set(input, `${input.name}.number_of_items_attempted`, numberOfItemsAttempted)
          let timeSpent = input.duration - input.timeRemaining
          set(input, `${input.name}.items_per_minute`, Math.round(numberOfItemsCorrect / (timeSpent / 60)))
        } else if (input.tagName === 'TANGY-UNTIMED-GRID') {
          let hitLastAttempted = false
          for (let toggleInput of input.value) {
            let derivedValue = ''
            if (hitLastAttempted === true) {
              // Not attempted.
              derivedValue = '.'
            } else if (toggleInput.value === 'on') {
              // Incorrect.
              derivedValue = '0'
            } else {
              // Correct.
              derivedValue = '1'
            }
            set(input, `${input.name}_${toggleInput.name}`, derivedValue)
            if (toggleInput.highlighted === true) {
              hitLastAttempted = true
            }
          }
          ;
          let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
          let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
          let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
          set(input, `${input.name}.number_of_items_correct`, numberOfItemsCorrect)
          set(input, `${input.name}.number_of_items_attempted`, numberOfItemsAttempted)
          set(input, `${input.name}.gridAutoStopped`, input.gridAutoStopped)
          set(input, `${input.name}.autoStop`, input.autoStop)
        } else if (input.tagName === 'TANGY-BOX' || input.name === '') {
          // Do nothing :).
        } else if (input && typeof input.value === 'string') {
          set(input, `${input.name}`, input.value)
        } else if (input && typeof input.value === 'number') {
          set(input, `${input.name}`, input.value)
        } else if (input && Array.isArray(input.value)) {
          for (let group of input.value) {
            set(input, `${input.name}.${group.name}`, group.value)
          }
        } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
          let elementKeys = Object.keys(input.value);
          for (let key of elementKeys) {
            set(input, `${input.name}.${key}`, input.value[key])
          }
          ;
        }
      } // sanitize
    }
  }
  return flatFormResponse;
};

function getLocationByKeys(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return currentLevel
}

function saveFormInfo(flatResponse, db) {
  return new Promise(async (resolve, reject) => {
    // Find any new headers and insert them into the headers doc.
    let foundNewHeaders = false
    let formDoc = {
      _id: flatResponse.formId,
      columnHeaders: []
    }
    // Get the doc if it already exists.
    try {
      let doc = await db.get(formDoc._id)
      formDoc = doc
    } catch(e) {
      // It's a new doc, no worries.
    }
    Object.keys(flatResponse).forEach(key => {
      if (formDoc.columnHeaders.find(header => header.key === key) === undefined) {
        // Carve out the string that editor puts in IDs in order to make periods more reliable for determining data according to period delimited convention.
        let safeKey = key.replace('form-0.', '')
        // Make the header property (AKA label) just the variable name.
        const firstOccurenceIndex = safeKey.indexOf('.')
        const secondOccurenceIndex = safeKey.indexOf('.', firstOccurenceIndex+1)
        let keyArray = key.split('.')
        // console.log("key: " + key + " keyArray: " + JSON.stringify(keyArray))
        // Preserve the namespacing of user-profile
        if (keyArray[0] === 'user-profile') {
          formDoc.columnHeaders.push({ key, header: safeKey })
        } else {
          formDoc.columnHeaders.push({ key, header: safeKey.substr(secondOccurenceIndex+1, safeKey.length) })
        }
        foundNewHeaders = true
      }
    })
    if (foundNewHeaders) {
      try {
        await db.put(formDoc)
      } catch(err) {
        reject(err)
      }
    }
    resolve(true)
  })
}
