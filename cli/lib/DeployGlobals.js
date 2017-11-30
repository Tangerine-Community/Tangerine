var unirest = require('unirest')
const JSON_OPTS = {
  'Content-Type' : 'application/json',
  'Accept'       : 'application/json'
};

module.exports = function(options, callback) {

  var env = options.env
  if (!env) env = process.env
  var couchUrl = options.couchUrl
  if (!couchUrl) couchUrl = `http://${env.T_ADMIN}:${env.T_PASS}@localhost:5984`

  var settingsDocs = []
  var configurationDocs = []
  var groupDbs = []

  return (new Promise(function startDeployGlobals(resolve, reject) {
    console.log("Deploying globals...")
    resolve()
  }))
  .then(function getGroupDbs(resolve, reject) {
    return new Promise(function getGroupDbsPromise(resolve, reject) {
      console.log('Getting all Group databases.')
      unirest.get( couchUrl + '/_all_dbs' )
        .end( function onGroupDbsUrlGet(response) {
          var dbs = JSON.parse(response.body)
          dbs.forEach(function(db) {
            if (db.indexOf('group-') !== -1) {
              groupDbs.push(db)
            }
          })
          groupDbs.push('tangerine')
          console.log(`Found ${groupDbs.length} group databases.`)
          resolve()
        })
    })
  })
  .then(function getConfigurationDocs(resolve, reject) {
    return new Promise(function getConfigurationDocsPromise(resolve, reject) {
      var iterate = function recursivelyGetConfigurationDocs(store) {
        // Boilerplate async iterator. 
        var self = this
        if (!self.hasOwnProperty('i')) {
          self.i = 0
          self.store = store
        }
        else {
          self.i++
        }
        if ( self.i == self.store.length) {
          return resolve()
        }
        self.item = self.store[self.i]
        // Do something with the item.
        var db = self.item
        unirest.get( `${couchUrl}/${db}/configuration` )
          .end(function onGetConfiguration(response) {
            var doc = JSON.parse(response.body) 
            configurationDocs.push({ 
              doc: doc,  
              path: `/${db}/${doc._id}` 
            })
            return iterate(store)
          })
      }
      iterate(groupDbs)
    })
  })
  .then(function updateConfigurationDocs(resolve, reject) {
    return new Promise(function updateConfigurationDocsPromise(resolve, reject) {
      console.log(`Updating ${configurationDocs.length} configuration docs`)
      var self = {}
      var iterate = function recursivelyGetSettingsDocs(store) {
        // Boilerplate async iterator. 
        if (!self.hasOwnProperty('i')) {
          self.i = 0
          self.store = store
        }
        else {
          self.i++
        }
        if ( self.i == self.store.length) {
          return resolve()
        }
        self.item = self.store[self.i]
        var doc = Object.assign(self.item.doc, 
          {
            "local": `${env.T_HOST_NAME}/db`,
            "update" : {
                "dbName" : "update",
                "host"   : `${env.T_HOST_NAME}/db`,
                "login"  : ""
            },
            "trunk" : {
              "dbName" : "tangerine",
              "host" : `${env.T_HOST_NAME}/db`
            },

            "tree"    : `${env.T_TREE_URL}`,
            "robbert" : `${env.T_PROTOCOL}://${env.T_HOST_NAME}/robbert`,
            "defaults" : {
              "settings" : {
               "groupDDoc" : "ojai",
               "language" : "en-US",
               "log" : [""],
               "groupName" : "",
               "groupHost" : `${env.T_PROTOCOL}://${env.T_HOST_NAME}/db`,
               "upPass" : "pass"
             }
           }
          }
        )
        // Do something with the item.
        unirest.put(couchUrl + self.item.path)
          .headers({ 'Content-Type' : 'application/json'})
          .json(doc)
          .end(function onConfigurationDocUpdate(response) {
            if (response.status !== 201) throw new Error(`Updating configuration doc ${self.item.path} failed with status of ${response.status}`) 
            console.log(`Configuration doc ${self.item.path} updated.`) 
            return iterate(store)
          })
      }
      iterate(configurationDocs)
    })
  })
  .then(function getSettingsDocs(resolve, reject) {
    return new Promise(function getGroupDbsPromise(resolve, reject) {
      console.log('Getting settings docs.')
      var self = {}
      var iterate = function recursivelyGetSettingsDocs(store) {
        // Boilerplate async iterator. 
        if (!self.hasOwnProperty('i')) {
          self.i = 0
          self.store = store
        }
        else {
          self.i++
        }
        if ( self.i == self.store.length) {
          console.log('resolve settings')
          return resolve()
        }
        self.item = self.store[self.i]
        // Do something with the item.
        var db = self.item
        unirest.get( `${couchUrl}/${db}/settings` )
          .end(function onGetSettings(response) {
            var doc = JSON.parse(response.body) 
            settingsDocs.push({ 
              doc: doc,  
              path: `/${db}/${doc._id}` 
            })
            return iterate(store)
          })
      }
      iterate(groupDbs)
    })
  })
  .then(function updateSettingsDocs(resolve, reject) {
    return new Promise(function updateSettingsDocsPromise(resolve, reject) {
      console.log(`Updating ${settingsDocs.length} settings docs`)
      var self = {}
      var iterate = function recursivelyGetSettingsDocs(store) {
        // Boilerplate async iterator. 
        if (!self.hasOwnProperty('i')) {
          self.i = 0
          self.store = store
        }
        else {
          self.i++
        }
        if ( self.i == self.store.length) {
          return resolve()
        }
        self.item = self.store[self.i]
        var doc = Object.assign(self.item.doc, {
          "hostname": env.T_HOST_NAME,
          "groupHost": `${env.T_PROTOCOL}://${env.T_HOST_NAME}`,
        })
        // Do something with the item.
        unirest.put(couchUrl + self.item.path)
          .headers({ 'Content-Type' : 'application/json'})
          .json(doc)
          .end(function onSettingsDocUpdate(response) {
            if (response.status !== 201) throw new Error(`Updating settings doc ${self.item.path} failed with status of ${response.status}`) 
            console.log(`Settings doc ${self.item.path} updated.`) 
            return iterate(store)
          })
      }
      iterate(settingsDocs)
    })
  })
  .then(function doneDeployingGlobals(resolve, reject) {
    return new Promise(function doneDeployingGlobals(resolve, reject) {
      callback(null, {message: "cool."})
    })
  })
  .catch(function catchDeployingGlobals(err) {
    callback(err)
  })
}

