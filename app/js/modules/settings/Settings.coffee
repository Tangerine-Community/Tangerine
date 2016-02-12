# handles settings that are group specific
class Settings extends Backbone.Model

  url : "settings"

  initialize: ->

    @ipRange = _.uniq((x for x in [100..200]).concat((x for x in [0..255])))
    @config = Tangerine.config
    @on "all", => @update()

  contextualize: (callbacks={}) ->
    result = ""
    if @get("context") == "server" and callbacks.server?
      result += if _.isFunction(callbacks.server) then callbacks.server() else callbacks.server
    else if @get("context") == "satellite" and callbacks.satellite?
      result += if _.isFunction(callbacks.satellite) then callbacks.satellite() else callbacks.satellite
    else if @get("context") == "mobile" and callbacks.mobile?
      result += if _.isFunction(callbacks.mobile) then callbacks.mobile() else callbacks.mobile
    else if @get("context") == "class" and callbacks.klass?
      result += if _.isFunction(callbacks.klass) then callbacks.klass() else callbacks.klass
    else if @get("context") != "server" and callbacks.notServer?
      result += if _.isFunction(callbacks.notServer) then callbacks.notServer() else callbacks.notServer
    else if @get("context") != "satellite" and callbacks.notSatellite?
      result += if _.isFunction(callbacks.notSatellite) then callbacks.notSatellite() else callbacks.notSatellite
    else if @get("context") != "mobile" and callbacks.notMobile?
      result += if _.isFunction(callbacks.notMobile) then callbacks.notMobile() else callbacks.notMobile
    else if @get("context") != "class" and callbacks.notKlass?
      result += if _.isFunction(callbacks.notKlass) then callbacks.notKlass() else callbacks.notKlass
    else if callbacks.allElse
      result += if _.isFunction(callbacks.allElse) then callbacks.allElse() else callbacks.allElse

    return result

  update: =>
    groupHost = @get "groupHost"
    groupName = @get "groupName"
    groupDDoc = @get "groupDDoc"

    @upUser = "uploader-#{groupName}"
    @upPass = @get "upPass"

    update     = @config.get "update"

    trunk      = @config.get "trunk"
    local      = @config.get "local"
    port       = @config.get "port"

    designDoc  = Tangerine.design_doc

    prefix     = @config.get "groupDBPrefix"

    @groupDB = "#{prefix}#{groupName}"
    @trunkDB = trunk.dbName

    subnetBase = @config.get("subnet").base


    if Tangerine.settings.get("context") != "server"
      splitGroup = groupHost.split("://")
      groupHost = "#{splitGroup[0]}://#{@upUser}:#{@upPass}@#{splitGroup[1]}"

    @location =
      local:
        url : "#{local.host}:#{port}/"
        db  : "/#{local.dbName}/"
      trunk:
        url : "http://#{trunk.host}/"
        db  : "http://#{trunk.host}/#{trunk.dbName}/"
      group:
        url : "#{groupHost}/"
        db  : "#{groupHost}/#{prefix}#{groupName}/"
      update :
        url : "http://#{update.host}/"
        db  : "http://#{update.host}/#{update.dbName}/"
        target : update.target
      subnet : 
        url : ("http://#{subnetBase}#{@ipRange[x]}:#{port}/"                 for x in [0..255])
        db  : ("http://#{subnetBase}#{@ipRange[x]}:#{port}/#{local.dbName}/" for x in [0..255])
      satellite : 
        url : ("#{subnetBase}#{x}:#{port}/"                       for x in [0..255])
        db  : ("#{subnetBase}#{x}:#{port}/#{prefix}#{groupName}/" for x in [0..255])

    @couch = 
      view  : "_design/#{designDoc}/_view/"
      show  : "_design/#{designDoc}/_show/"
      list  : "_design/#{designDoc}/_list/"
      index : "_design/#{designDoc}/index.html"

    @groupCouch = 
      view  : "_design/#{groupDDoc}/_view/"
      show  : "_design/#{groupDDoc}/_show/"
      list  : "_design/#{groupDDoc}/_list/"
      index : "_design/#{groupDDoc}/index.html"

  urlBulkDocs : ->
    if @get("context") == "server"
      bulkDocsURL = "/" + @groupDB + "/_bulk_docs"
    else
      bulkDocsURL = @location.local.db + "_bulk_docs"


  urlIndex : ( groupName, hash = null ) ->
    groupHost = @get "groupHost"

    # port number only for local, iriscouch always uses 80, confuses cors
    port   = if groupName == "local" then ":"+@config.get("port") else ""
    hash   = if hash? then "##{hash}" else ""

    if groupName == "trunk"
      groupName = "tangerine"
    else 
      groupName = @config.get("groupDBPrefix") + groupName

    return "#{groupHost}#{port}/#{groupName}/#{@couch.index}#{hash}"

  urlHost  : ( location ) -> "#{@location[location].url}"
  
  urlDB    : ( location, pass = null ) -> 
    if location == "local"
      result = "#{@location[location].db}".slice(1,-1)
    else
      result = "#{@location[location].db}".slice(0, -1)

    splitDB = result.split("://")

    if pass?
      result = "#{splitDB[0]}://#{Tangerine.user.name}:#{pass}@#{splitDB[1]}"

    return result

  urlDDoc : ( location ) ->
    dDoc = Tangerine.designDoc
    return "#{@urlDB('trunk')}/_design/#{dDoc}"

  urlView  : ( location, view ) ->
    if location == "group" || Tangerine.settings.get("context") == "server"
      "#{@location[location].db}#{@groupCouch.view}#{view}"
    else
      "#{@location[location].db}#{@couch.view}#{view}"

  urlList  : ( location, list ) ->
    if location == "group" || Tangerine.settings.get("context") == "server"
      "#{@location[location].db}#{@groupCouch.list}#{list}"
    else
      "#{@location[location].db}#{@couch.list}#{list}"

  urlShow  : ( location, show ) ->
    if location == "group" || Tangerine.settings.get("context") == "server"
      "#{@location[location].db}#{@groupCouch.show}#{show}"
    else
      "#{@location[location].db}#{@couch.show}#{show}"
  
  # these two are a little weird. I feel like subnetAddress should be a class with properties IP, URL and index
  urlSubnet: ( ip ) ->
    port   = @config.get "port"
    dbName = @config.get("local").dbName

    "http://#{ip}:#{port}/#{dbName}"

  subnetIP: ( index ) ->
    base = @config.get("subnet").base
    "#{base}#{@ipRange[index]}"





