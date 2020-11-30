import { CaseDocs } from './../../../case/case.docs';
import { AppDocs } from './../../../app.docs';
import { CaseHomeDocs } from './../../../case-home/case-home.docs';
import { UserService } from "src/app/shared/_services/user.service";
import PouchDB from 'pouchdb'
import {TangyFormsDocs} from '../../../tangy-forms/tangy-forms.docs';
import {VariableService} from "../../../shared/_services/variable.service";
PouchDB.defaults({auto_compaction: true, revs_limit: 1})
const bcrypt = window['dcodeIO'].bcrypt

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
    requiresViewsUpdate: false,
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
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService:UserService) => {
      console.log('Updating to v3.3.0...')
    }
  },
  {
    script: async (userDb, appConfig, userService:UserService, variableService:VariableService) => {
      // Prevent this update from running for every user. We handle that in this update.
      if (await variableService.get('ran-update-v3.4.0')) return
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
        /*
         * This update is too heavy for some tablets.

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
        */
      }
      // Doing this later.
      //await userService.updateAllDefaultUserDocs()
      // Doing this later.
      //await userService.indexAllUserViews()
      await variableService.set('ran-update-v3.4.0', 'true')
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService:UserService) => {
      // Do nothing because we likely will be doing it in the next update.
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService:UserService, variableService:VariableService) => {
      if (await variableService.get('ran-update-v3.7.5')) return
      console.log('Updating to v3.7.5...')
      // skip, covered in future updates.
      //await userService.updateAllDefaultUserDocs()
      // skip, covered in future updates.
      //await userService.indexAllUserViews()
      await variableService.set('ran-update-v3.7.5', 'true')
    }
  },
  {
    script: async (userDb, appConfig, userService:UserService, variableService:VariableService) => {
      // Prevent this update from running for every user. We handle that in this update.
      if (await variableService.get('ran-update-v3.8.0')) return
      console.log('Updating to v3.8.0...')
      const usersDb = new PouchDB('users')
      // Update user account docs so they have the new initialProfileComplete flag set to true.
      // We used to infer wether or not the user profile in various situations, now we set it explicitly.
      const salt = bcrypt.genSaltSync(10);
      const userDocs = (await usersDb.allDocs({include_docs: true}))
        .rows
        .map(row => {
          return {
            ...row.doc,
            password: bcrypt.hashSync(row.doc.password, salt),
            securityQuestionResponse: bcrypt.hashSync(row.doc.securityQuestionResponse, salt),
            initialProfileComplete:true
          }
        })
      for (let userDoc of userDocs) {
        await usersDb.put(userDoc)
      }
      await variableService.set('ran-update-v3.8.0', 'true')
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService: UserService, variableService:VariableService) => {
      // syncProtocol uses a single shared db for all users. Update only once.
      if (appConfig.syncProtocol === '2' && await variableService.get('ran-update-v3.9.0')) return
      console.log('Updating to v3.9.0...')
      try {
        const view = await userDb.get('_design/responsesUnLockedAndNotUploaded')
        TangyFormsDocs[0]['_rev'] = view._rev
      } catch (e) {
      }
      await userDb.put(TangyFormsDocs[0])
      await userDb.query('responsesUnLockedAndNotUploaded')
      await variableService.set('ran-update-v3.9.0', 'true')
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService: UserService, variableService:VariableService) => {
      if (appConfig.syncProtocol === '2' && await variableService.get('ran-update-v3.9.1')) return
      console.log('Updating to v3.9.1...')
      try {
        const view = await userDb.get('_design/case-events-by-all-days')
        CaseHomeDocs[0]['_rev'] = view._rev
      } catch (e) {
      }
      await userDb.put(CaseHomeDocs[0])
      await userDb.query('case-events-by-all-days')
      await variableService.set('ran-update-v3.9.1', 'true')
    }
  },
  {
    requiresViewsUpdate: true,
    script: async (userDb, appConfig, userService: UserService, variableService:VariableService) => {
      console.log('Updating to v3.12.0...')
      if ( await variableService.get('ran-update-v3.12.0')) return
      await variableService.set('ran-update-v3.12.0', 'true')
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService: UserService, variableService:VariableService) => {
      console.log('Updating to v3.13.0...')
      if (appConfig.syncProtocol === '2' && await variableService.get('ran-update-v3.13.0')) return
      // Set up and index new byType query.
      try {
        const view = await userDb.get('_design/byType')
        AppDocs[0]['_rev'] = view._rev
      } catch (e) {
      }
      await userDb.put(AppDocs[0])
      await userDb.query('byType')
      await variableService.set('ran-update-v3.13.0', 'true')
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService: UserService, variableService:VariableService) => {
      console.log('Updating to v3.14.0...')
      if (appConfig.syncProtocol === '2' && await variableService.get('ran-update-v3.14.0')) return
      // Reset sync-push-last_seq
      await variableService.set('sync-push-last_seq', 0);
      await variableService.set('ran-update-v3.14.0', 'true')
    }
  },
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService: UserService, variableService:VariableService) => {
      if (appConfig.syncProtocol === '2' && await variableService.get('ran-update-v3.15.0')) return
      console.log('Updating to v3.15.0...')
     // Remove old search indexes.
      const searchDb = new PouchDB(`${userDb.name}-index`)
      await searchDb.destroy()
      // Create new search index.
      await window['T'].search.createIndex()
      await variableService.set('ran-update-v3.15.0', 'true')
    }
  }
]
