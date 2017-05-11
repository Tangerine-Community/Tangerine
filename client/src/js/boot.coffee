
# This file loads the most basic settings related to Tangerine and kicks off Backbone's router.
#   * The doc `configuration` holds the majority of settings.
#   * The Settings object contains many convenience functions that use configuration's data.
#   * Templates should contain objects and collections of objects ready to be used by a Factory.
# Also intialized here are: Backbone.js, and jQuery.i18n
# Anything that fails bad here should probably be failing in front of the user.

# Utils.disableConsoleLog()
# Utils.disableConsoleAssert()



Tangerine.bootSequence =

  # Basic configuration

  basicConfig : (callback) ->

    ###
    Pouch configuration
    ###

    if (window.location.hash == '#widget')
      # This is a widget and we should keep our memory temporary.
      dbname = "tangerine-" + Date.now() + Math.random()
      console.log("dbname:" + dbname)
      Tangerine.db = new PouchDB(dbname, {storage: 'temporary'})
    else
      # This is not a widget and we'll hang onto our long term memory.
      Tangerine.db = new PouchDB(Tangerine.conf.db_name)

    Backbone.sync = BackbonePouch.sync
      db: Tangerine.db
      fetch: 'view'
      view: 'tangerine/byCollection'
      viewOptions:
        include_docs : true

    Backbone.Model.prototype.idAttribute = '_id'

    # set underscore's template engine to accept handlebar-style variables
    _.templateSettings = interpolate : /\{\{(.+?)\}\}/g

    callback()

    ###
    Tangerine.db.destroy (error) ->
      return alert error if error?

      Tangerine.db = new PouchDB("tangerine")
      Backbone.sync = BackbonePouch.sync
        db: Tangerine.db


      callback()
    ###

  # Check for new database, initialize with packs if none exists
  checkDatabase: (callback) ->

    # Local tangerine database handle
    db = Tangerine.db

    db.get "initialized", (error, doc) ->

      return callback() unless error

      console.log "initializing database"

      # Save views
      db.put(
        _id: "_design/#{Tangerine.conf.design_doc}"
        views:
          ###
            Used for replication.
            Will give one key for all documents associated with an assessment or curriculum.
          ###
          byDKey:
            map: ((doc) ->
              return if doc.collection is "result"

              if doc.curriculumId
                id = doc.curriculumId
                # Do not replicate klasses
                return if doc.collection is "klass"
              else
                id = doc.assessmentId

              emit id.substr(-5,5), null
            ).toString()

          byCollection:
            map : ( (doc) ->

              return unless doc.collection

              emit doc.collection, null

              # Belongs to relationship
              if doc.collection is 'subtest'
                emit "subtest-#{doc.assessmentId}"

              # Belongs to relationship
              else if doc.collection is 'question'
                emit "question-#{doc.subtestId}"

              else if doc.collection is 'result'
                result = _id : doc._id
                doc.subtestData.forEach (subtest) ->
                  if subtest.prototype is "id" then result.participantId = subtest.data.participant_id
                  if subtest.prototype is "complete" then result.endTime = subtest.data.end_time
                result.startTime = doc.startTime
                emit "result-#{doc.assessmentId}", result

            ).toString()

      ).then ->

        if (window.location.hash != '#widget')

          #
          # Load Packs that Tree creates for an APK, then load the Packs we use for
          # development purposes.
          #

          packNumber = 0

          # Recursive function that will iterate through js/init/pack000[0-x] until
          # there is no longer a returned pack.
          doOne = ->

            paddedPackNumber = ("0000" + packNumber).slice(-4)

            $.ajax
              dataType: "json"
              url: "js/init/pack#{paddedPackNumber}.json"
              error: (res) ->
                # No more pack? We're all done here.
                if res.status is 404
                  # Mark this database as initialized so that this process does not
                  # run again on page refresh, then load Development Packs.
                  db.put({"_id":"initialized"}).then( -> callback() )
              success: (res) ->
                packNumber++
                db.bulkDocs res, (error, doc) ->
                  if error
                    return alert "could not save initialization document: #{error}"
                  doOne()

          # kick off recursive process
          doOne()
        else
          console.log("init empty db for widget.")
          db.put({"_id":"initialized"}).then( -> callback() )

  # Put this version's information in the footer
  versionTag: ( callback ) ->
#    $("#footer").append("<div id='version'>#{Tangerine.version}-#{Tangerine.buildVersion}</div>")
    callback()

  # get our local Tangerine settings
  # these do tend to change depending on the particular install of the
  fetchSettings : ( callback ) ->
    Tangerine.settings = new Settings "_id" : "settings"
    Tangerine.settings.fetch
      success: callback
      error: ->
        Tangerine.settings.save Tangerine.defaults.settings,
          error: ->
            console.error arguments
            alert "Could not save default settings"
          success: callback

  # for upgrades
  guaranteeInstanceId: ( callback ) ->
    unless Tangerine.settings.has("instanceId")
      Tangerine.settings.save
        "instanceId" : Utils.humanGUID()
      ,
        error: -> alert "Could not save new Instance Id"
        success: callback
    else
      callback()

  documentReady: ( callback ) -> $ ->

    #$("<button id='reload'>reload me</button>").appendTo("#footer").click -> document.location.reload()

    callback()

  loadI18n: ( callback ) ->
    i18n.init
      fallbackLng : "en-US"
      lng         : Tangerine.settings.get("language")
      resStore    : Tangerine.locales
    , (err, t) ->
      window.t = t
      callback()

  handleCordovaEvents: ( callback ) ->

    document.addEventListener "deviceready"
      ,
        ->
          document.addEventListener "online",  -> Tangerine.online = true
          document.addEventListener "offline", -> Tangerine.online = false

          ###
          # Responding to this event turns on the menu button
          document.addEventListener "menubutton", (event) ->
            console.log "menu button"
          , false
          ###

          # prevents default
          document.addEventListener "backbutton", Tangerine.onBackButton, false

      , false

# add the event listeners, but don't depend on them calling back

    # Load cordova.js if we are in a cordova context
    if(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))
      console.log("loading cordova methods")
#      xhrObj =  new XMLHttpRequest()
      try
#        xhrObj.open('GET', 'cordova.js', false)
#        xhrObj.send('')
#        se = document.createElement('script')
#        se.text = xhrObj.responseText
#        document.getElementsByTagName('head')[0].appendChild(se)

        #  /*
        # * Attach a writeTextToFile method to cordova.file API.
        # *
        # * params = {
        # *  text: 'Text to go into the file.',
        # *  path: 'file://path/to/directory',
        #*  fileName: 'name-of-the-file.txt',
        #*  append: false
        #* }
        #*
        #* callback = {
        #*   success: function(file) {},
        #*   error: function(error) {}
        #* }
        #*
        #*/
        cordova.file.writeTextToFile = (params, callback) ->
          window.resolveLocalFileSystemURL(params.path, (dir) ->
            dir.getFile(params.fileName, {create:true}, (file) ->
              if (!file)
                return callback.error('dir.getFile failed')
              file.createWriter(
                (fileWriter) ->
                  if params.append == true
                    fileWriter.seek(fileWriter.length)
                  blob = new Blob([params.text], {type:'text/plain'})
                  fileWriter.write(blob)
                  callback.success(file)
              ,(error) ->
                callback.error(error)
              )
            )
          )

        #/*
        # * Use the writeTextToFile method.
        # */
        Utils.saveRecordsToFile = (text) ->
          username = Tangerine.user.name()
          timestamp = (new Date).toISOString();
          timestamp = timestamp.replace(/:/g, "-")
          if username == null
            fileName = "backup-" + timestamp + ".json"
          else
            fileName = username + "-backup-" + timestamp + ".json"
          console.log("fileName: " + fileName)
          cordova.file.writeTextToFile({
            text:  text,
            path: cordova.file.externalDataDirectory,
            fileName: fileName,
            append: false
            },
            {
              success: (file) ->
                alert("Success! Look for the file at " + file.nativeURL)
                console.log("File saved at " + file.nativeURL)
              , error: (error) ->
                  console.log(error)
            }
          )

      catch error
        console.log("Unable to fetch script. Error: " + error)
    callback()

  loadSingletons: ( callback ) ->
    # Singletons
    window.vm = new ViewManager()
    Tangerine.router = new Router()
    Tangerine.user   = new TabletUser()
    Tangerine.nav    = new NavigationView
      user   : Tangerine.user
      router : Tangerine.router
    Tangerine.log    = new Log()
    Tangerine.session = new Session()
    callback()

  reloadUserSession: ( callback ) ->

    Tangerine.user.sessionRefresh
      error: -> Tangerine.user.logout()
      success: callback

  startBackbone: ( callback ) ->
    Backbone.history.start()
    callback() # for testing


Tangerine.boot = ->

  sequence = [
    Tangerine.bootSequence.basicConfig
    Tangerine.bootSequence.checkDatabase
    Tangerine.bootSequence.versionTag
    Tangerine.bootSequence.fetchSettings
    Tangerine.bootSequence.guaranteeInstanceId
    Tangerine.bootSequence.documentReady
    Tangerine.bootSequence.loadI18n
    Tangerine.bootSequence.handleCordovaEvents
    Tangerine.bootSequence.loadSingletons
    Tangerine.bootSequence.reloadUserSession
    Tangerine.bootSequence.startBackbone
  ]

  Utils.execute sequence

Tangerine.boot()
