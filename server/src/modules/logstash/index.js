const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const tangyModules = require('../index.js')()

module.exports = {
  name: 'logstash',
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
        let processedResult = flatResponse
        // Don't add user-profile to the user-profile
        if (flatResponse.formId !== 'user-profile') {
          processedResult = await attachUserProfile(flatResponse, logstashDb)
        }
        try {
          createDateFields(processedResult);
        } catch (e) {
          // Do nothing...
        }
        // debugger;
        const startUnixtime = processedResult.startUnixtime;
        let startDatetimeISO = null;
        try {
          const startDatetime = new Date(startUnixtime);
          console.log("converting startUnixtime " + startUnixtime + " to startDatetime: " + startDatetime)
          if (isValidDate()) {
            startDatetimeISO = startDatetime.toISOString()
            console.log("converted startDatetime: " + startDatetime + " to startDatetimeISO: " + startDatetimeISO)
          } else {
            console.log("Error converting startDatetime: " + startDatetime + " to startDatetimeISO.")
          }
          // mic check
        } catch (e) {
          console.log("error converting " + processedResult.startUnixtime + " to startDatetime. Error: " + e)
          // console.trace()
          // let err = new Error();
          // err.stack
          console.error(e);
        }
        await pushResponse({
          _id: processedResult._id,
          formId: processedResult.formId,
          startDatetime: startDatetimeISO,
          startUnixtime: processedResult.startUnixtime,
          processedResult,
          'geoip': {
            'lat': processedResult['geoip.lat'] ? processedResult['geoip.lat'] : '',
            'lon': processedResult['geoip.lon'] ? processedResult['geoip.lon'] : ''
          }
        }, logstashDb);
        resolve(data)
      })
    }
  }
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
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
    formTitle: formResponse.form.title,
    startUnixtime: formResponse.startUnixtime,
    buildId: formResponse.buildId||'',
    buildChannel: formResponse.buildChannel||'',
    deviceId: formResponse.deviceId||'',
    groupId: formResponse.groupId||'',
    complete: formResponse.complete
  };
  function set(input, key, value) {
    flatFormResponse[key] = input.skipped
        ? process.env.T_REPORTING_MARK_SKIPPED_WITH
        : 
        input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE"
            ? process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH 
        : 
        value === undefined && process.env.T_REPORTING_MARK_UNDEFINED_WITH !== "ORIGINAL_VALUE"
            ? process.env.T_REPORTING_MARK_UNDEFINED_WITH
            : value
  }
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    for (let input of item.inputs) {
      // Simplify the keys by removing  formID.itemId
      // let firstIdSegment = `${formID}.${item.id}.`
      let firstIdSegment = ""
      if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for TANGY-LOCATION levels.
        locationKeys = []
        for (let group of input.value) {
          set(input, `${firstIdSegment}${input.name}.${group.level}`, group.value)
          locationKeys.push(group.value)
          try {
            const location = getLocationByKeys(locationKeys, locationList)
            for (let keyName in location) {
              if (keyName !== 'children') {
                set(input, `${firstIdSegment}${input.name}.${group.level}_${keyName}`, location[keyName])
              }
            }
          } catch(e) {
            set(input, `${firstIdSegment}${input.name}.${group.level}_label`, 'orphaned')
          }
        }
      } else if (input.tagName === 'TANGY-GPS') {
        set(input, `${firstIdSegment}geoip.location.lat`, input.value.latitude)
        set(input, `${firstIdSegment}geoip.location.lon`, input.value.longitude)
        // Flatter...
        set(input, `geoip.lat`, input.value.latitude)
        set(input, `geoip.lon`, input.value.longitude)

      } else if (input.tagName === 'TANGY-TIMED') {
        set(input, `${firstIdSegment}${input.name}.duration`, input.duration)
        set(input, `${firstIdSegment}${input.name}.time_remaining`, input.timeRemaining)
        // Calculate Items Per Minute.
        let numberOfItemsAttempted = input.value.findIndex(el => el.highlighted ? true : false) + 1
        let numberOfItemsIncorrect = input.value.filter(el => el.value ? true : false).length
        let numberOfItemsCorrect = numberOfItemsAttempted - numberOfItemsIncorrect
        set(input, `${firstIdSegment}${input.name}.number_of_items_correct`, numberOfItemsCorrect)
        set(input, `${firstIdSegment}${input.name}.number_of_items_attempted`, numberOfItemsAttempted)
        let timeSpent = input.duration - input.timeRemaining
        set(input, `${firstIdSegment}${input.name}.items_per_minute`, Math.round(numberOfItemsCorrect / (timeSpent / 60)))
      } else if (input && typeof input.value === 'string') {
        set(input, `${firstIdSegment}${input.name}`, input.value)
      } else if (input && typeof input.value === 'number') {
        set(input, `${firstIdSegment}${input.name}`, input.value)
      } else if (input && Array.isArray(input.value)) {
        for (let group of input.value) {
          set(input, `${firstIdSegment}${input.name}.${group.name}`, group.value)
        }
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        let elementKeys = Object.keys(input.value);
        for (let key of elementKeys) {
          set(input, `${firstIdSegment}${input.name}.${key}`, input.value[key])
        };
      }
    }
  }
  let data = await tangyModules.hook("flatFormResponse", {flatFormResponse, formResponse});
  return data.flatFormResponse;
};

String.prototype.rjust = function( width, padding ) {
  padding = padding || " ";
  padding = padding.substr( 0, 1 );
  if( this.length < width )
    return padding.repeat( width - this.length ) + this;
  else
    return this;
}

/**
 * Loop through date fields and add year, month, and day fields
 * Old versions of Tusome do not have a date_start field, so we need to loop through them.
 * @param processedResult
 */
function createDateFields(processedResult) {
  let fields = ['lesson_start_date', 'date_start']
  fields.some(key => {
    if (typeof processedResult[key] !== 'undefined') {
      let done = addDatefields(processedResult[key], processedResult)
      if (done) {
        return true;
      }
    }
  })
}

function addDatefields(val, doc) {
  let startDateTimeValues = val.split('-')
  doc['day_of_the_month'] = startDateTimeValues[2].rjust(2,'0')
  doc['year_value'] = startDateTimeValues[0]
  if(startDateTimeValues[1].rjust(2,'0') === '01') {
    doc['month_value'] = 'Jan'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '02') {
    doc['month_value'] = 'Feb'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '03') {
    doc['month_value'] = 'Mar'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '04') {
    doc['month_value'] = 'Apr'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '05') {
    doc['month_value'] = 'May'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '06') {
    doc['month_value'] = 'Jun'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '07') {
    doc['month_value'] = 'Jul'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '08') {
    doc['month_value'] = 'Aug'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '09') {
    doc['month_value'] = 'Sep'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '10') {
    doc['month_value'] = 'Oct'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '11') {
    doc['month_value'] = 'Nov'
  }
  else if(startDateTimeValues[1].rjust(2,'0') === '12') {
    doc['month_value'] = 'Dec'
  }
  return true
}

async function attachUserProfile(doc, logstashDb) {
  try {
    // Find the key that points to user profile ID.
    const userProfileIdKey = Object.keys(doc).find(key => key.includes('userProfileId'))
    // Get the user profile.
    const userProfileDoc = await logstashDb.get(doc[userProfileIdKey])

    // Return with merged profile into doc but keep keys namespaced by `user-profile.`. 
    return Object.assign({}, doc, Object.keys(userProfileDoc.processedResult).reduce((acc, key) => {
      return Object.assign({}, acc, { [`user-profile.${key}`]: userProfileDoc.processedResult[key] })
    }, {}))
  } catch (error) {
    // There must not be a user profile yet doc uploaded yet.
    return doc 
  }
}

function pushResponse(doc, db) {
  return new Promise((resolve, reject) => {
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

function getLocationByKeys(keys, locationList) {
  let locationKeys = [...keys]
  let currentLevel = locationList.locations[locationKeys.shift()]
  for (let key of locationKeys ) {
    currentLevel = currentLevel.children[key]
  }
  return currentLevel
}
