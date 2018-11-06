const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog

module.exports = {
  hooks: {
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
          const {flatResponse, doc, sourceDb} = data
          const logstashDb = new DB(`${sourceDb.name}-logstash`);
          const builtResponse = await attachUserProfile(flatResponse, logstashDb)
          await pushResponse(builtResponse, logstashDb);
          resolve(data)
      })
    }
  }
}

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
