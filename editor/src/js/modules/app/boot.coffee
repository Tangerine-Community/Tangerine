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

    $.couch.urlPrefix = '/db'

    locationPath = window.location.pathname.split("/")
    Tangerine.db_name    = locationPath[2]
    Tangerine.design_doc = "ojai"

    # Local tangerine database handle
    Tangerine.$db = $.couch.db(Tangerine.db_name)

    urlParser = document.createElement("a")
    urlParser.href = window.location

    # Backbone configuration
    Backbone.couch_connector.config.base_url  = "#{urlParser.protocol}//#{urlParser.host}/db"
    Backbone.couch_connector.config.db_name   = Tangerine.db_name
    Backbone.couch_connector.config.ddoc_name = Tangerine.design_doc
    Backbone.couch_connector.config.global_changes = false

    # set underscore's template engine to accept handlebar-style variables
    _.templateSettings = interpolate : /\{\{(.+?)\}\}/g

    callback()

  # Put this version's information in the footer
  versionTag: ( callback ) ->
    $("#footer").append("<div id='version'>#{Tangerine.version}-#{Tangerine.build}</div>")
    callback()

  # Grab our system config doc. These generally don't change very often unless
  # major system changes are required. New servers, etc.
  fetchConfiguration: ( callback ) ->

    Tangerine.config = new Config "_id" : "configuration"
    Tangerine.config.fetch
      error   : ->
        console.log "Could not fetch configuration; need to login."
#        redirect to login
        rootPath = window.location.origin
        window.location = rootPath
      success : callback



  # get our local Tangerine settings
  # these do tend to change depending on the particular install of the
  fetchSettings : ( callback ) ->
    Tangerine.settings = new Settings "_id" : "settings"
    Tangerine.settings.fetch
      success: callback

      error: ->
        defaultSettings = Tangerine.config.get("defaults")?.settings
        alert "Missing default settings in configuration" unless defaultSettings?

        Tangerine.settings.set defaultSettings # @todo, figure out why save, only calls beforesave
        Tangerine.settings.save null,
          error: -> alert "Could not save default settings"
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

  # load templates
  fetchTemplates: ( callback ) ->
    (Tangerine.templates = new Template "_id" : "templates").fetch
      error: -> alert "Could not load templates."
      success: callback



  documentReady: ( callback ) -> $ ->

    #$("<button id='reload'>reload me</button>").appendTo("#footer").click -> document.location.reload()

    callback()

  loadI18n: ( callback ) ->
    i18n.init
      fallbackLng : "en-US"
      lng         : Tangerine.settings.get("language")
      resStore    : Tangerine.locales
    , ->
      window.t = i18n.t
      callback()

  loadSingletons: ( callback ) ->
    # Singletons
    window.vm = new ViewManager()
    Tangerine.router = new Router()
    Tangerine.user   = new User()
    Tangerine.nav    = new NavigationView
      user   : Tangerine.user
      router : Tangerine.router
    Tangerine.log    = new Log()
    callback()

  reloadUserSession: ( callback ) ->

    Tangerine.user.sessionRefresh
      error: -> Tangerine.user.logout()
      success: -> callback()

  startBackbone: ( callback ) ->
    Backbone.history.start()
    callback() # for testing

Tangerine.enum =
  subjects :
    1 : "Afaan Oromo"
    2 : "Af-Somali"
    3 : "Amharic"
    4 : "Hadiyyisa"
    5 : "Sidaamu Afoo"
    6 : "Tigrinya"
    7 : "Wolayttatto"
  iSubjects :
    "Afaan Oromo": "1"
    "Af-Somali" : "2"
    "Amharic" : "3"
    "Hadiyyisa" : "4"
    "Sidaamu Afoo" : "5"
    "Tigrinya" : "6"
    "Wolayttatto" : "7"

# callback is used for testing
Tangerine.boot = (callback) ->

  sequence = [
    Tangerine.bootSequence.basicConfig
    Tangerine.bootSequence.versionTag
    Tangerine.bootSequence.fetchConfiguration
    Tangerine.bootSequence.fetchSettings
    Tangerine.bootSequence.guaranteeInstanceId
    Tangerine.bootSequence.fetchTemplates
    Tangerine.bootSequence.documentReady
    Tangerine.bootSequence.loadI18n
    Tangerine.bootSequence.loadSingletons
    Tangerine.bootSequence.reloadUserSession
    Tangerine.bootSequence.startBackbone
  ]

  sequence.push callback if callback?

  Utils.execute sequence

Tangerine.boot()




