const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../index.js')()

module.exports = {
  hooks: {
    clearReportingCache: async function(data) {
      const { groupNames } = data
      for (let groupName of groupNames) {
        console.log(`removing db ${groupName}-logstash`)
        const db = new DB(`${groupName}-logstash`)
        await db.destroy()
      }
      return data
    },
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
        const {doc, sourceDb} = data
        const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
        let flatResponse = await generateFlatResponse(doc, locationList);

        // Process the flatResponse
        const logstashDb = new DB(`${sourceDb.name}-logstash`);
        const processedResult = await attachUserProfile(flatResponse, logstashDb)
        await pushResponse({
          _id: processedResult._id,
          formId: processedResult.formId,
          startDatetime: new Date(processedResult.startUnixtime).toISOString(),
          startUnixtime: processedResult.startUnixtime,
          processedResult
        }, logstashDb);
        resolve(data)
      })
    }
  }
}

/** This function processes form response for csv.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 *
 * @returns {object} processed results for csv
 */

const generateFlatResponse = async function (formResponse, locationList) {
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  let flatFormResponse = {
    _id: formResponse._id,
    formId: formResponse.form.id,
    startUnixtime: formResponse.startUnixtime,
    complete: formResponse.complete
  };
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    for (let input of item.inputs) {
      if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for TANGY-LOCATION levels.
        locationKeys = []
        for (let group of input.value) {
          flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}`] = group.value;
          locationKeys.push(group.value)
          try {
            const location = getLocationByKeys(locationKeys, locationList)
            for (let keyName in location) {
              if (keyName !== 'children') {
                flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}_${keyName}`] = location[keyName]
              }
            }
          } catch(e) {
            flatFormResponse[`${formID}.${item.id}.${input.name}.${group.level}_label`] = 'orphaned';
          }
        }
      } else if (input && typeof input.value === 'string') {
        flatFormResponse[`${formID}.${item.id}.${input.name}`] = input.value;
      } else if (input && typeof input.value === 'number') {
        flatFormResponse[`${formID}.${item.id}.${input.name}`] = input.value;
      } else if (input && Array.isArray(input.value)) {
        for (let group of input.value) {
          flatFormResponse[`${formID}.${item.id}.${input.name}.${group.name}`] = group.value;
        }
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        for (let key of elementKeys) {
          flatFormResponse[`${formID}.${item.id}.${input.name}.${key}`] = input.value[key];
        };
      }
      if (input.tagName === 'TANGY-TIMED') {
        flatFormResponse[`${formID}.${item.id}.${input.name}.duration`] = input.duration
        flatFormResponse[`${formID}.${item.id}.${input.name}.time_remaining`] = input.timeRemaining
        // Calculate Items Per Minute.
        let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
        let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
        let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
        flatFormResponse[`${formID}.${item.id}.${input.name}.number_of_items_correct`] = numberOfItemsCorrect
        flatFormResponse[`${formID}.${item.id}.${input.name}.number_of_items_attempted`] = numberOfItemsAttempted
        let timeSpent = input.duration - input.timeRemaining
        flatFormResponse[`${formID}.${item.id}.${input.name}.items_per_minute`] = Math.round(numberOfItemsCorrect / (timeSpent / 60))
      }
    }
  }
  let data = await tangyModules.hook("flatFormReponse", {flatFormResponse, formResponse});
  return data.flatFormResponse;
};

async function attachUserProfile(doc, logstashDb) {
  try {
    // Find the key that points to user profile ID.
    const userProfileIdKey = Object.keys(doc).find(key => key.includes('userProfileId'))
    // Get the user profile.
    const userProfileDoc = await logstashDb.get(doc[userProfileIdKey])
    // Return with merged profile into doc but keep keys namespaced by `user-profile.`. 
    return Object.assign({}, doc, Object.keys(userProfileDoc).reduce((acc, key) => {
      return Object.assign({}, acc, { [`user-profile.${key}`]: userProfileDoc[key] })
    }, {}))
  } catch (error) {
    // There must not be a user profile yet doc uploaded yet.
    return doc 
  }

}

function pushResponse(doc, db) {
  return new Promise((resolve, reject) => {
    debugger
    db.get(doc._id)
      .then(oldDoc => {
        // Overrite the _rev property with the _rev in the db and save again.
        const updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
        db.put(updatedDoc)
          .then(_ => resolve(true))
          .catch(error => reject(`Logstash pushResponse could not save ${doc._id} because Error of ${JSON.stringify(error)}`))
      })
      .catch(error => {
        db.put(doc)
          .then(_ => resolve(true))
          .catch(error => reject(`Logstash pushResponse could not save ${doc._id} because Error of ${JSON.stringify(error)}`))
    });
  })
}
