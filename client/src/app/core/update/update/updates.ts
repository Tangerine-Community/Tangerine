import { UserService } from "src/app/shared/_services/user.service";
import PouchDB from 'pouchdb'
PouchDB.defaults({auto_compaction: true, revs_limit: 1})

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
      console.log('Updating to v3.0.0-beta12...')
    }
  },
  {
    requiresViewsUpdate: false,
    script: (userDb) => {
      console.log('Updating to v3.0.0-beta13...')
    }
  },
  {
    requiresViewsUpdate: true,
    script: async (userDb) => {
      console.log('Updating to v3.1.0...')
      await userDb.compact()
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig) => {
      console.log('Updating to v3.2.0...')
    }
  },
  {
    requiresViewsUpdate: true,
    script: async (userDb, appConfig, userService:UserService) => {
      console.log('Updating to v3.3.0...')
    }
  },
  {
    script: async (userDb, appConfig, userService:UserService) => {
      // Prevent this update from running for every user. We handle that in this update.
      if (localStorage.getItem('ran-update-v3.4.0')) return
      console.log('Updating to v3.4.0...')
      const usersDb = new PouchDB('users')
      const userDocs = (await usersDb.allDocs({include_docs: true}))
        .rows
        .map(row => row.doc)
        .filter(doc => doc._id.indexOf('_design') === -1)
      for (let userDoc of userDocs) {
        const userDb = new PouchDB(userDoc.username);
        // Fix issue where userDoc.userUUID did not point to the actual user's profile document.
        let validUserProfileDoc = (await userDb.query('tangy-form/responsesByFormId', { key: 'user-profile', include_docs: true })).rows[0].doc
        let invalidUserProfileDoc = await userDb.get(userDoc.userUUID)
        await userDb.remove(invalidUserProfileDoc)
        userDoc.userUUID = validUserProfileDoc._id
        await usersDb.put(userDoc)
        // Fix issue where docs did not always have lastModified and uploadDatetime.
        const allDocs = (await userDb.allDocs({include_docs: true}))
          .rows
          .map(row => row.doc)
          .filter(doc => doc.collection === 'TangyFormResponse')
        for (let doc of allDocs) {
          // This is confusing because it takes into account a couple of different inconsistent scenarios. 
          // The most important thing to know is that if it did not have an uploadDatetime, it will now
          // be queued for upload and all docs will end up having a lastModified.
          if (doc.uploadDatetime && doc.lastModified) {
            // Do nothing, this is a doc that has been uploaded :).
          }
          else if (!doc.uploadDatetime && !doc.lastModified) {
            // Queue for upload.
            doc = {
              ...doc, 
              uploadDatetime: Date.now(),
              lastModified: Date.now() + 1
            }
          }
          else if (!doc.uploadDatetime && doc.lastModified) {
            // Queue for upload.
            doc = {
              ...doc, 
              uploadDatetime: doc.lastModified - 1 
            }
          } 
          else if (doc.uploadDatetime && !doc.lastModified) {
            // This may result in user profiles being queued for upload again but it's ok.
            doc.lastModified = Date.now()
          }
          await userDb.put(doc)
        }
      }
      await userService.updateAllDefaultUserDocs()
      await userService.indexAllUserViews()
      localStorage.setItem('ran-update-v3.4.0', 'true')
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService:UserService) => {
      if (localStorage.getItem('ran-update-v3.7.2')) return
      console.log('Updating to v3.7.2...')
      await userService.updateAllDefaultUserDocs()
      await userService.indexAllUserViews()
      localStorage.setItem('ran-update-v3.7.2', 'true')
    }
  }
]
