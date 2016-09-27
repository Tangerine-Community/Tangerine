
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

          results :
            map: ( ( doc ) ->
              return unless doc.collection is 'result'
              if doc.klassId?
                type = "klass"
                id   = doc.klassId
              else
                type = "assessment"
                id   = doc.assessmentId
              emit id, type
            ).toString()

          spirtRotut:
            map : ( (doc) ->

              return unless doc.collection is "result"
              return unless doc.tripId

              result = {}

              #
              # validation
              #

              updated = doc.updated #"Thu Mar 06 2014 11:00:00 GMT+0300 (EAT)"
              docTime = new Date(updated)
              sMin = updated.substr(0,16) + "07:00:00" + updated.substr(-15)
              sMax = updated.substr(0,16) + "15:10:00" + updated.substr(-15)
              min = new Date(sMin)
              max = new Date(sMax)

              validTime = min < docTime < max

              result.validTime = validTime

              #
              # by month
              #

              year  = docTime.getFullYear()
              month = docTime.getMonth() + 1
              result.month = month

              #
              # by Zone, County, subject, class, gps
              #

              result.minTime = doc.startTime || doc.start_time || doc.subtestData.start_time
              result.maxTime = doc.startTime || doc.start_time || doc.subtestData.start_time

              for subtest in doc.subtestData

                result.minTime = if subtest.timestamp < result.minTime then subtest.timestamp else result.minTime
                result.maxTime = if subtest.timestamp > result.maxTime then subtest.timestamp else result.maxTime

                if subtest.prototype is "location"

                  for label, i in subtest.data.labels
                    zoneIndex   = i if label is "zone"
                    countyIndex = i if label is "county"
                    schoolIndex = i if label is "school"

                  zoneKey   = subtest.data.location[zoneIndex]
                  countyKey = subtest.data.location[countyIndex]
                  schoolKey = subtest.data.location[schoolIndex]

                  result.zone   = zoneKey   if subtest.data.location[zoneIndex]?
                  result.county = countyKey if subtest.data.location[countyIndex]?
                  result.school = schoolKey if subtest.data.location[schoolIndex]?

                  result.school = subtest.data.schoolId if subtest.data.schoolId?

                else if subtest.prototype is "survey"

                  result.subject = subtest.data.subject if subtest.data.subject?
                  result.class   = subtest.data.class   if subtest.data.class?
                  result.week    = subtest.data.lesson_week    if subtest.data.lesson_week?
                  result.day     = subtest.data.lesson_day     if subtest.data.lesson_day?

                else if subtest.prototype is "gps" and subtest.data.long? and subtest.data.lat?

                  result.gpsData = 
                    type : 'Feature'
                    properties : []
                    geometry :
                      type : 'Point'
                      coordinates : [ subtest.data.long, subtest.data.lat ]

              #
              # items per minute
              #

              # handle a class result
              if doc.subtestData.items?

                totalItems   = doc.subtestData.items.length
                correctItems = 0
                for item in doc.subtestData.items
                  correctItems++ if item.itemResult is "correct"

                totalTime    = doc.timeAllowed
                timeLeft     = doc.subtestData.time_remain
                result.itemsPerMinute = [( totalItems - ( totalItems - correctItems ) ) / ( ( totalTime - timeLeft ) / ( totalTime ) )]

              #
              # by enumerator
              #

              result.user = doc.enumerator || doc.editedBy

              #
              # number of subtests
              #

              result.subtests = doc.subtestData.length || 1 # could be a class result


              #
              # WorkflowId
              #
              result.workflowId = doc.workflowId

              #
              # _id
              #

              result.ids = [doc._id]

              emit doc.tripId, result
              ).toString()

            reduce: (

              ( keys, values, rereduce ) ->

                result =
                  subtests       : 0
                  didntMeet      : 0
                  metBenchmark   : 0
                  benchmarked    : 0
                  itemsPerMinute : []
                  ids            : []

                for value in values
                  for k, v of value

                    if k is "validTime"
                      if v is true
                        result.validTime = true
                      else
                        return { validTime : false }

                    else if k is "subtests"
                      result.subtests += v

                    else if k is "ids"
                      unless rereduce
                        result.ids.push v

                    else if k is "itemsPerMinute"

                      unless rereduce
                        for ipm in v
                          continue if ipm >= 120
                          result.itemsPerMinute.push ipm
                          result.benchmarked++

                    else if k is "minTime"
                      if result.minTime
                        result.minTime = if result.minTime < v then result.minTime else v
                      else
                        result.minTime = v

                    else if k is "maxTime"
                      if result.maxTime
                        result.maxTime = if result.maxTime > v then result.maxTime else v
                      else
                        result.maxTime = v

                    else
                      # this only works if none of the other values have the same key
                      result[k] = v

                #
                # benchmark
                #

                if result.subject and result.class and result.itemsPerMinute

                  english = result.subject is "english_word"
                  swahili = result.subject is "word"
                  class1  = result.class   is "1"
                  class2  = result.class   is "2"

                  for ipm in result.itemsPerMinute

                    result.metBenchmark++ if swahili and class1 and ipm >= 17
                    result.metBenchmark++ if swahili and class2 and ipm >= 45
                    result.metBenchmark++ if english and class1 and ipm >= 30
                    result.metBenchmark++ if english and class2 and ipm >= 65

                return result

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
                result.startTime = doc.start_time
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
    $("#footer").append("<div id='version'>#{Tangerine.version}-#{Tangerine.buildVersion}</div>")
    callback()

  # load templates
  fetchTemplates: ( callback ) ->
    (Tangerine.templates = new Template "_id" : "templates").fetch
      error: -> alert "Could not load templates."
      success: callback

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

    #  init  Tangerine as a Marionette app
    Tangerine.app = new Marionette.Application()
    Tangerine.app.rm = new Marionette.RegionManager();

    Tangerine.app.rm.addRegions siteNav: "#siteNav"
    Tangerine.app.rm.addRegions mainRegion: "#content"
    Tangerine.app.rm.addRegions dashboardRegion: "#dashboard"
    callback()

  reloadUserSession: ( callback ) ->

    Tangerine.user.sessionRefresh
      error: -> Tangerine.user.logout()
      success: callback

  startBackbone: ( callback ) ->
    Backbone.history.start()
    callback() # for testing

  monitorBrowserBack: ( callback ) ->
    window.addEventListener('popstate', (e) ->
      sendTo = Backbone.history.getFragment()
      Tangerine.router.navigate(sendTo, { trigger: true, replace: true })
    )

  getLocationList : ( callback ) ->    
    # Grab our system config doc   
    Tangerine.locationList = new Backbone.Model "_id" : "location-list"    
   
    Tangerine.locationList.fetch   
      error   : ->   
        console.log "could not fetch location-list..."   
        callback   
   
      success : callback


Tangerine.boot = ->

  sequence = [
    Tangerine.bootSequence.handleCordovaEvents
    Tangerine.bootSequence.basicConfig
    Tangerine.bootSequence.checkDatabase
    Tangerine.bootSequence.versionTag
    Tangerine.bootSequence.fetchSettings
    Tangerine.bootSequence.guaranteeInstanceId
    Tangerine.bootSequence.documentReady
    Tangerine.bootSequence.loadI18n
    Tangerine.bootSequence.loadSingletons
    Tangerine.bootSequence.getLocationList
    Tangerine.bootSequence.fetchTemplates
    Tangerine.bootSequence.reloadUserSession
    Tangerine.bootSequence.startBackbone
#    Tangerine.bootSequence.monitorBrowserBack
  ]

  Utils.execute sequence

Tangerine.boot()
