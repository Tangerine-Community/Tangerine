
export const updates = [
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      return new Promise(resolve => {
        console.log(`This update will never run :-).`);
        resolve();
      })
    }
  },
  // Transform array style input.value from ['foo', 'bar'] to [{name: 'foo', value: 'on'}, {name: 'bar', value: 'on'}]
  {
    requiresViewsUpdate: false,
    script: (userDb) => {
      return new Promise(async resolve => {
        let res = await userDb.allDocs({include_docs: true})
        let responseDocs = res.rows 
          .map(row => row.doc )
          .filter(doc => {
            if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
              return doc
            }
          })
        for (let responseDoc of responseDocs) {
          for (let input of responseDoc['inputs']) {
            if (input['tagName'] === 'TANGY-LOCATION') {
              if (input['value'] && Array.isArray(input['value'])) {
                let newValue = [];
                input['value'].forEach(subInput => newValue.push({name: subInput['level'], value: subInput['value']}))
                input['value'] = newValue;
              } else {
                input['value'] = [];
              }
            }
            if (input['tagName'] === 'TANGY-GPS') {
              if (input['value']) {
                let newValue = [];
                if (input['value']['recordedLatitude']) {
                  newValue.push({ name: 'recordedLatitude', value: input['value']['recordedLatitude']});
                }
                if (input['value']['recordedLongitude']) {
                  newValue.push({ name: 'recordedLongitude', value: input['value']['recordedLongitude']});
                }
                if (input['value']['recordedAccuracy']) {
                  newValue.push({ name: 'recordedAccuracy', value: input['value']['recordedAccuracy']});
                }
                input['value'] = newValue;
              } else {
                input['value'] = [];
              }
            }
            if (input['tagName'] === 'TANGY-RADIO-BUTTONS') {
              if (input['value']) {
                let newValue = [];
                newValue.push({ name: input['value'], value: 'on'})
                input['value'] = newValue;
              } else {
                input['value'] = [];
              }
            }
            if (input['tagName'] === 'TANGY-CHECKBOXES' || input['tagName'] === 'TANGY-TIMED') {
              let newValue = [];
              if (Array.isArray(input['value'])) {
                input['value'].forEach(subinputName => newValue.push({ name: subinputName, value: 'on'}))
                input['value'] = newValue;
              } else {
                input['value'] = [];
              }
            }
          }
          await userDb.put(responseDoc);
        }
        resolve();
      })
    }
  },
  // Move inputs from TangyFormResponse.inputs to TangyFormResponse.items[index].inputs.
  {
    requiresViewsUpdate: false,
    script: (userDb) => {
      return new Promise(async resolve => {
        let res = await userDb.allDocs({include_docs: true})
        let responseDocs = res.rows 
          .map(row => row.doc )
          .filter(doc => {
            if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
              return doc
            }
          })
        for (let responseDoc of responseDocs) {
          for (let item of responseDoc['items']) {
            if (item['inputs'] && Array.isArray(item['inputs'])) {
              item['inputs'].forEach((inputName, itemInputIndex) => {
                if (typeof inputName === 'string') {
                  let input = responseDoc['inputs'].find(input => (inputName === input['name']));
                  if (input) {
                    item['inputs'][itemInputIndex] = Object.assign({}, input);
                  }
                }
              })
            }
          }
          await userDb.put(responseDoc);
        }
        resolve();
      })
    }
  },
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      console.log('Updating views...')
    }
  },
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      console.log('Updating views...')
    }
  },
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      console.log('Updating to v3.0.0...')
    }
  }
]
