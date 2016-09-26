Tangerine =
  locales: {} # for i18next translations
  replicate:
    push: ->
      # TODO: Use CouchDB Cookie Authentication so we don't have to keep asking for a Username and Password. Also when logging into App, if CouchDB is available, that's
      # when we should authenticate to CouchDB.
      username = prompt("Please enter your username")
      password = prompt("Please enter your password")
      # TODO: We need the protocol environment variable, not hardcoded to https.
      Tangerine.db.replicate.to('http://' + username + ':' + password + '@' + Tangerine.settings.get('hostname') + '/db/group-' + Tangerine.settings.get('groupName'))
        .on 'complete', (info) ->
          alert 'Replication complete.'
          console.log(info)
        .on 'error', (err) ->
          alert 'Replication error.'
          console.log err
        .on 'denied', (info) ->
          alert 'Replication denied.'
          console.log info
    pull: ->
      username = prompt("Please enter your username")
      password = prompt("Please enter your password")
      Tangerine.db.replicate.from('http://' + username + ':' + password + '@' + Tangerine.settings.get('hostname') + '/db/group-' + Tangerine.settings.get('groupName'))
        .on 'complete', (info) ->
          alert 'Replication complete.'
          console.log(info)
        .on 'error', (err) ->
          alert 'Replication error.'
          console.log err
        .on 'denied', (info) ->
          alert 'Replication denied.'
          console.log info
