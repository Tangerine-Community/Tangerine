const PouchDB = require('pouchdb')
const DB = PouchDB.defaults({
  prefix: '/tangerine/db/'
});
const fsc = require('fs')
const junk = require('junk');

const getGroups = () => {
  return new Promise(async resolve => {
    fsc.readdir('/tangerine/client/content/groups', function(err, files) {
      let filteredFiles = files.filter(junk.not)
      console.log('/groups route lists these dirs: ' + filteredFiles)
      let groups = filteredFiles.map((groupName) => {
        return {
          attributes: { 
            name: groupName 
          },
          member: [], 
          admin: [], 
          numberOfResults: 0 
        }
      })
      resolve(groups) 
    })
  })
}

let go = async () => {
  const groups = await getGroups() 
  for (let group of groups) {
    console.log(group)
    const groupDb = new DB(group.attributes.name)
    let res = await groupDb.allDocs({include_docs: true})
    console.log(res)
    let responseDocs = res.rows 
      .map(row => row.doc )
      .filter(doc => {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
          return doc
        }
      })
    console.log(responseDocs)
    for (let responseDoc of responseDocs) {
      console.log(responseDoc)
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
      await groupDb.put(responseDoc);
    }
  }
}

go()