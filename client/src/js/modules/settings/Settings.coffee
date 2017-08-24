# handles settings that are group specific
class Settings extends Backbone.Model

  url : "settings"

  initialize: ->
    @ipRange = _.uniq((x for x in [100..200]).concat((x for x in [0..255])))
    @config = Tangerine.config
    @on "change", => @update()

  sync: (method, model) =>
    # Get the settings doc, and then if there is a configuration doc, override
    # settings with the properties found in configuration.
    if method == 'read'
      data = {}
      Tangerine.db.get('settings').then (doc) =>
        data = doc
        Tangerine.db.get('configuration').then (doc) =>
          Object.assign(data, doc)
          model.set(data)
          model.trigger 'sync'
        .error =>
          model.set(data)
          model.trigger 'sync'
      .error =>
        alert 'Unable to fetch settings'
    else
      Backbone.Model.prototype.sync.call(@);

  update: =>
    groupHost = @getString "groupHost"
    groupName = @getString "groupName"
    groupDDoc = @getString "groupDDoc"

    @upUser = "uploader-#{groupName}"
    @upPass = @get "upPass"

    designDoc  = Tangerine.design_doc

    prefix     = Tangerine.conf.groupPrefix

    @groupDB = "#{prefix}#{groupName}"

    subnetBase = Tangerine.conf.subnet_base

    port = Tangerine.conf.tablet_port


    if Tangerine.settings.get("context") != "server"
      splitGroup = groupHost.split("://")
      groupHost = "#{splitGroup[0]}://#{@upUser}:#{@upPass}@#{splitGroup[1]}"

    @location =
      group:
        url : "#{groupHost}/"
        db  : "#{groupHost}/#{prefix}#{groupName}/"
      subnet : 
        url : ("http://#{subnetBase}#{@ipRange[x]}:#{port}/"                      for x in [0..255])
        db  : ("http://#{subnetBase}#{@ipRange[x]}:#{port}/#{Tangerine.db_name}/" for x in [0..255])

    @couch = 
      view  : "_design/#{designDoc}/_view/"
      index : "_design/#{designDoc}/index.html"

    @groupCouch = 
      view  : "_design/#{groupDDoc}/_view/"
      index : "_design/#{groupDDoc}/index.html"

  urlBulkDocs : ->
    bulkDocsURL = "/" + Tangerine.db_name + "/_bulk_docs"

  urlIndex : ( groupName, hash = null ) ->
    groupHost = @get "groupHost"

    # port number only for local, iriscouch always uses 80, confuses cors
    port   = if groupName == "local" then ":"+Tangerine.conf.tablet_port else ""
    hash   = if hash? then "##{hash}" else ""

    if groupName == "trunk"
      groupName = "tangerine"
    else 
      groupName = Tangerine.conf.groupPrefix + groupName

    return "#{groupHost}#{port}/#{groupName}/#{@couch.index}#{hash}"

  urlHost  : ( location ) -> "#{@location[location].url}"
  
  urlDB    : ( location, pass = null ) -> 
    if location == "local"
      result = "#{@location[location].db}".slice(1,-1)
    else
      result = "#{@location[location].db}".slice(0, -1)

    splitDB = result.split("://")

    if pass is true
      result = "#{splitDB[0]}://#{@upUser}:#{@upPass}@#{splitDB[1]}"
    else if pass?
      result = "#{splitDB[0]}://#{Tangerine.user.name()}:#{pass}@#{splitDB[1]}"

    return result

  urlDDoc : ( location ) ->
    dDoc = Tangerine.designDoc
    return "#{@urlDB('trunk')}/_design/#{dDoc}"

  urlView  : ( location, view ) ->
    if location == "group"
      "#{@location[location].db}#{@groupCouch.view}#{view}"
    else
      "#{@location[location].db}#{@couch.view}#{view}"

  urlList  : ( location, list ) ->
    if location == "group"
      "#{@location[location].db}#{@groupCouch.list}#{list}"
    else
      "#{@location[location].db}#{@couch.list}#{list}"

  urlShow  : ( location, show ) ->
    if location == "group"
      "#{@location[location].db}#{@groupCouch.show}#{show}"
    else
      "#{@location[location].db}#{@couch.show}#{show}"
  
  # these two are a little weird. I feel like subnetAddress should be a class with properties IP, URL and index
  urlSubnet: ( ip ) ->
    port   = Tangerine.conf.tablet_port
    dbName = Tangerine.conf.db_name

    "http://#{ip}:#{port}/#{dbName}"

  subnetIP: ( index ) ->
    base = Tangerine.conf.subnet_base
    "#{base}#{@ipRange[index]}"





