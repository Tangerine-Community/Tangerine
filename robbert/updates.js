export.module = {
  "0.1.0": function(callback) {
    // Update all group databases with most recent code from the tangerine database.
    var couchUrl = 'http://' + process.env.T_ADMIN + ':' + process.env.T_PASS + '@127.0.0.1:5984/'
    var databases = []
    var groupDatabases = []
    unirest.get(couchUrl + '_all_dbs').send().end(function(response) { 
      databases = JSON.parse(response.body)
      databases.forEach(function(database) {
        if (database.substr(0,6) == 'group-') {
          groupDatabases.push(database)
        }
      })
      groupDatabases.forEach(function(database) {
        var packet = {
          "source": couchUrl + "tangerine",
          "target": couchUrl + database,
          "doc_ids": ["_design/ojai", "configuration"]
        }
        unirest.post(couchUrl + '_replicate')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(packet)
        .end(function(response) {
          if (response.body.ok === true) {
            console.log('Updated app in ' + database)
          }
          else {
            console.log(response.body)
            process.exit(1)
          }
        })
      })
    }) 
  }
}
