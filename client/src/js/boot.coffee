
# This file loads the most basic settings related to Tangerine and kicks off Backbone's router.
#   * The doc `configuration` holds the majority of settings.
#   * The Settings object contains many convenience functions that use configuration's data.
#   * Templates should contain objects and collections of objects ready to be used by a Factory.
# Also intialized here are: Backbone.js, and jQuery.i18n
# Anything that fails bad here should probably be failing in front of the user.

# Utils.disableConsoleLog()
# Utils.disableConsoleAssert()

Tangerine.bootSequence =

  wait: (callback) ->
    setTimeout callback, 1000

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
    else if (window.location.hash.startsWith('#widgetSiteLoad'))
#       This is a widget for editor and we should keep it in our long-term memory
      hashArr = window.location.hash.split("/")
      groupName = hashArr[1]
      Tangerine.db = new PouchDB(groupName)
    else
      groupName = $.cookie("groupName")
      if typeof groupName != 'undefined' && groupName != null
        Tangerine.db = new PouchDB(groupName)
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

    # Load custom backbone-forms elements
    Backbone.Form.editors.LocationElement = LocationElement

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
      
      # Load Views and then load packs.
      Tangerine.loadViews (err) =>
        if (err)
          alert 'Error loading views'
          console.log err

        if ((window.location.hash != '#widget'))

          #
          # Load Packs that Tree creates for an APK, then load the Packs we use for
          # development purposes.
          #

          indexViews = ->
            Tangerine.db.query('tangerine/byCollection', {key: 'workflows'}).then((res) ->
              markDatabaseAsInitialized()
            ).catch( (err) ->
              console.log('Could not index views. Error: ' + err)
#              alert('Could not index views. Error: ' + err)
            )

          markDatabaseAsInitialized = ->
            Tangerine.db.put({"_id":"initialized"}).then( => callback() )

          if (!window.location.hash.startsWith('#widgetSiteLoad'))

            # Recursive function that will iterate through js/init/pack000[0-x] until
            # there is no longer a returned pack.
            packNumber = 0
            doOne = ->

              paddedPackNumber = ("0000" + packNumber).slice(-4)
              finishInit = ->
#               Mark this database as initialized so that this process does not
#               run again on page refresh, then load Development Packs.
                indexViews()
                #                  Load the admin user
                Utils.importDoc('js/init/user-admin.json')
              $.ajax
                dataType: "json"
                url: "js/init/pack#{paddedPackNumber}.json"
                error: (res) ->
                  # No more pack? We're all done here.
                  if res.status is 404
                    finishInit()
                success: (res) ->
                  if res.docs?
                    docs = res.docs
                  else
                    docs = res
                  if docs.length == 0
                    finishInit()
                  console.log('Found ' + docs.length + ' docs')
                  packNumber++
                  query =
                    docs: docs
                    new_edits: false

                  Tangerine.db.bulkDocs query, (error, doc) ->
                    if error
                      console.log "could not save initialization documents: #{error}"
#                      return alert "could not save initialization documents: #{error}"
                    doOne()

            # kick off recursive process
            doOne()
          else
            if (window.location.hash.startsWith('#widgetSiteLoad'))
              indexViews().then( -> callback() )
            else
              console.log("init empty db for widget.")
              db.put({"_id":"initialized"}).then( -> callback() )

  # Put this version's information in the footer
  versionTag: ( callback ) ->
    $("#footer").append("<div id='version'>#{Tangerine.version}-#{Tangerine.buildVersion}</div>")
    callback()

  # load templates
  fetchTemplates: ( callback ) ->
    if ((window.location.hash != '#widget') && (!window.location.hash.startsWith('#widgetSiteLoad')))
      (Tangerine.templates = new Template "_id" : "templates").fetch
        error: -> alert "Could not load templates."
        success: callback
    else return callback()

  # Grab our system config doc. These generally don't change very often unless
  # major system changes are required. New servers, etc.
  fetchConfiguration: ( callback ) ->
#    if ((window.location.hash != '#widget') && (!window.location.hash.startsWith('#widgetSiteLoad')))
    if ((window.location.hash != '#widget'))
      Tangerine.config = new Config "_id" : "configuration"
      Tangerine.config.fetch
        error   : (err) ->
          msg = "Tangerine.config.fetch error: " + JSON.stringify(err)
          console.log msg
          alert msg
        success : callback
    else return callback()

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

  applySettings: ( callback ) ->
    if (Tangerine.settings.has('userSchema')) then window.TabletUser = window.TabletUser.extend({schema: Tangerine.settings.get('userSchema')})
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
    if ((window.location.hash != '#widget') && (!window.location.hash.startsWith('#widgetSiteLoad')))
      # Grab our system config doc
      Tangerine.locationList = new Backbone.Model "_id" : "location-list"

      Tangerine.locationList.fetch
        error   : ->
          console.log "could not fetch location-list..."
          callback
        success : callback
      callback()
    else return callback()

  removeLoadingOverlay: ( callback ) ->
    removeOverlay = ->
      $('#loading-overlay').animate({opacity: 0, height: "toggle"}, 450)
    setTimeout(removeOverlay, 1500)
    callback()

  initGPS : (callback) ->
    $ ->
      Utils.gpsPing
      callback()

Tangerine.boot = ->

  sequence = [
    Tangerine.bootSequence.wait
    Tangerine.bootSequence.handleCordovaEvents
    Tangerine.bootSequence.basicConfig
    Tangerine.bootSequence.checkDatabase
    Tangerine.bootSequence.initGPS
    Tangerine.bootSequence.versionTag
    Tangerine.bootSequence.fetchSettings
    Tangerine.bootSequence.fetchConfiguration
    Tangerine.bootSequence.applySettings
    Tangerine.bootSequence.guaranteeInstanceId
    Tangerine.bootSequence.documentReady
    Tangerine.bootSequence.loadI18n
    Tangerine.bootSequence.loadSingletons
    Tangerine.bootSequence.getLocationList
    Tangerine.bootSequence.fetchTemplates
    Tangerine.bootSequence.reloadUserSession
    Tangerine.bootSequence.startBackbone
    Tangerine.bootSequence.removeLoadingOverlay
#    Tangerine.bootSequence.monitorBrowserBack
  ]

  Utils.execute sequence

Tangerine.boot()
