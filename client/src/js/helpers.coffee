#
# Skip logic
#

# these could easily be refactored into one.

ResultOfQuestion = (name) ->
  returnView = null
#  viewMaster.subtestViews[index].prototypeView.questionViews.forEach (candidateView) ->
  Tangerine.progress.currentSubview.questionViews.forEach (candidateView) ->
    if candidateView.model.get("name") == name
      returnView = candidateView
  throw new ReferenceError("ResultOfQuestion could not find variable #{name}") if returnView == null
  return returnView.answer if returnView.answer
  return null

ResultOfMultiple = (name) ->
  returnView = null
#  viewMaster.subtestViews[index].prototypeView.questionViews.forEach (candidateView) ->
  Tangerine.progress.currentSubview.questionViews.forEach (candidateView) ->
    if candidateView.model.get("name") == name
      returnView = candidateView
  throw new ReferenceError("ResultOfQuestion could not find variable #{name}") if returnView == null

  result = []
  for key, value of returnView.answer
    result.push key if value == "checked"
  return result

ResultOfPrevious = (name) ->
  if typeof vm.currentView.result == 'undefined'
#    console.log("Using Tangerine.progress.currentSubview")
    return Tangerine.progress.currentSubview.model.parent.result.getVariable(name)
  else
    return vm.currentView.result.getVariable(name)

ResultOfGrid = (name) ->
  if typeof vm.currentView.result == 'undefined'
    console.log("Using Tangerine.progress.currentSubview")
    return Tangerine.progress.currentSubview.model.parent.result.getItemResultCountByVariableName(name, "correct")
  else
    return vm.currentView.result.getVariable(name)
#
# Tangerine backbutton handler
#
$.extend(Tangerine,TangerineVersion)
Tangerine.onBackButton = (event) ->
  if Tangerine.activity == "assessment run"
    if confirm t("NavigationView.message.incomplete_main_screen")
      Tangerine.activity = ""
      window.history.back()
    else
      return false
  else
    window.history.back()



# Extend every view with a close method, used by ViewManager
Backbone.View.prototype.close = ->
  @remove()
  @unbind()
  @onClose?()



# Returns an object hashed by a given attribute.
Backbone.Collection.prototype.indexBy = ( attr ) ->
  result = {}
  @models.forEach (oneModel) ->
    if oneModel.has(attr)
      key = oneModel.get(attr)
      result[key] = [] if not result[key]?
      result[key].push(oneModel)
  return result

# Returns an object hashed by a given attribute.
Backbone.Collection.prototype.indexArrayBy = ( attr ) ->
  result = []
  @models.forEach (oneModel) ->
    if oneModel.has(attr)
      key = oneModel.get(attr)
      result[key] = [] if not result[key]?
      result[key].push(oneModel)
  return result


# This is for PouchDB's style of returning documents
Backbone.Collection.prototype.parse = (result) ->
  return _.pluck result.rows, 'doc'


# by default all models will save a timestamp and hash of significant attributes
Backbone.Model.prototype._save = Backbone.Model.prototype.save
Backbone.Model.prototype.save = ->
  @beforeSave?()
  @stamp()
  @_save.apply(@, arguments)

Backbone.Model.prototype.stamp = ->
  @set
    editedBy : Tangerine?.user?.name() || "unknown"
    updated : (new Date()).toString()
    fromInstanceId : Tangerine.settings.getString("instanceId")
    collection : @url
  , silent: true


#
# This series of functions returns properties with default values if no property is found
# @gotcha be mindful of the default "blank" values set here
#
Backbone.Model.prototype.getNumber =        (key, fallback = 0)  -> return if @has(key) then parseInt(@get(key)) else fallback
Backbone.Model.prototype.getArray =         (key, fallback = []) -> return if @has(key) then @get(key)           else fallback
Backbone.Model.prototype.getString =        (key, fallback = '') -> return if @has(key) then @get(key)           else fallback
Backbone.Model.prototype.getEscapedString = (key, fallback = '') -> return if @has(key) then @escape(key)        else fallback
# this seems too important to use a default
Backbone.Model.prototype.getBoolean =       (key) -> return if @has(key) then (@get(key) == true or @get(key) == 'true')


#
# handy jquery functions
#
( ($) ->

  $.fn.scrollTo = (speed = 250, callback) ->
    try
      $('html, body').animate {
        scrollTop: $(@).offset().top + 'px'
        }, speed, null, callback
    catch e
      console.log "error", e
      console.log "Scroll error with 'this'", @

    return @

  # place something top and center
  $.fn.topCenter = ->
    @css "position", "absolute"
    @css "top", $(window).scrollTop() + "px"
    @css "left", (($(window).width() - @outerWidth()) / 2) + $(window).scrollLeft() + "px"

  # place something middle center
  $.fn.middleCenter = ->
    @css "position", "absolute"
    @css "top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px"
    @css "left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px"


)(jQuery)


String.prototype.safetyDance = -> this.replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g,"")
String.prototype.databaseSafetyDance = -> this.replace(/\s/g, "_").toLowerCase().replace(/[^a-z0-9_-]/g,"")
String.prototype.count = (substring) -> this.match(new RegExp substring, "g")?.length || 0


Math.ave = ->
  result = 0
  result += x for x in arguments
  result /= arguments.length
  return result

Math.isInt    = -> return typeof n == 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n)
Math.decimals = (num, decimals) -> m = Math.pow( 10, decimals ); num *= m; num =  num+(`num<0?-0.5:+0.5`)>>0; num /= m
Math.commas   = (num) -> parseInt(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
Math.limit    = (min, num, max) -> Math.max(min, Math.min(num, max))

# method name slightly misleading
# returns true for falsy values
#   null, undefined, and '\s*'
# other false values like
#   false, 0
# return false
_.isEmptyString = ( aString ) ->
  return true if aString is null
  return false unless _.isString(aString) or _.isNumber(aString)
  aString = String(aString) if _.isNumber(aString)
  return true if aString.replace(/\s*/, '') == ''
  return false

_.indexBy = ( propertyName, objectArray ) ->
  result = {}
  for oneObject in objectArray
    if oneObject[propertyName]?
      key = oneObject[propertyName]
      result[key] = [] if not result[key]?
      result[key].push(oneObject)
  return result


class Utils

  @execute: ( functions, scope, progress ) ->

    totalFunctions = functions.length

    step = ->
      progress?.apply?(scope||step, [totalFunctions, functions.length])
      nextFunction = functions.shift()
      if typeof nextFunction is "function"
        nextFunction.apply(scope||step, [step])
    step()

  @changeLanguage : (code, callback) ->
    i18n.setLng code, callback


  @uploadCompressed: (docList) ->

    a = document.createElement("a")
    a.href = Tangerine.settings.get("groupHost")
    if Tangerine.settings.get("groupHost") == "localhost"
      allDocsUrl = "http://#{Tangerine.settings.get("groupHost")}/_cors_bulk_docs/check/#{Tangerine.settings.groupDB}"
    else
      if a.host == "databases.tangerinecentral.org"
        allDocsUrl = "#{a.protocol}//#{a.host}/_cors_bulk_docs/check/#{Tangerine.settings.groupDB}"
      else if a.host == "databases-qa.tangerinecentral.org"
        allDocsUrl = "#{a.protocol}//#{a.host}/_cors_bulk_docs/check/#{Tangerine.settings.groupDB}"
      else
        allDocsUrl = "#{a.protocol}//#{a.host}/decompressor/check/#{Tangerine.settings.get('groupName')}"

    $("#upload_results").append(t("Utils.message.checkingServer") + '&nbsp' + docList.length + '<br/>')

    return $.ajax
      url: allDocsUrl
      type: "POST"
      dataType: "json"
      contentType: "application/json"
      data: JSON.stringify
        keys: docList
        user: Tangerine.settings.upUser
        pass: Tangerine.settings.upPass
      error: (e) ->
        errorMessage = JSON.stringify e
        alert "Error connecting" + errorMessage
        $("#upload_results").append('Error connecting to : ' + allDocsUrl + ' - Error: ' + errorMessage + '<br/>')
      success: (response) =>
        $("#upload_results").append('Received response from server.<br/>')
        rows = response.rows
        leftToUpload = []
        for row in rows
          leftToUpload.push(row.key) if row.error?

        if leftToUpload.length > 0
          $("#upload_results").append(t("Utils.message.countTabletResults") + '&nbsp' + leftToUpload.length + '<br/>')
        else
          $("#upload_results").append(t("Utils.message.noUpload") + '<br/>')

        # if it's already fully uploaded
        # make sure it's in the log

        Tangerine.db.allDocs(include_docs:true,keys:leftToUpload
        ).then( (response) ->
          docs = {"docs":response.rows.map((el)->el.doc)}
          compressedData = LZString.compressToBase64(JSON.stringify(docs))
          a = document.createElement("a")
          a.href = Tangerine.settings.get("groupHost")
          if Tangerine.settings.get("groupHost") == "localhost"
            bulkDocsUrl = "http://#{Tangerine.settings.get("groupHost")}/_cors_bulk_docs/upload/#{Tangerine.settings.groupDB}"
          else
            if a.host == "databases.tangerinecentral.org"
              bulkDocsUrl = "#{a.protocol}//#{a.host}/_cors_bulk_docs/upload/#{Tangerine.settings.groupDB}"
            else if a.host == "databases-qa.tangerinecentral.org"
              bulkDocsUrl = "#{a.protocol}//#{a.host}/_cors_bulk_docs/upload/#{Tangerine.settings.groupDB}"
            else
              bulkDocsUrl = "#{a.protocol}//#{a.host}/decompressor/upload/#{Tangerine.settings.get('groupName')}"

          $.ajax
            type : "POST"
            url : bulkDocsUrl
            data : compressedData
            error: (e) =>
              errorMessage = JSON.stringify e
              alert "Server bulk docs error" + errorMessage
              $("#upload_results").append(t("Utils.message.bulkDocsError") + bulkDocsUrl + ' - ' + t("Utils.message.error") + ': ' + errorMessage + '<br/>')
            success: =>
              Utils.sticky t("Utils.message.resultsUploaded")
              $("#upload_results").append(t("Utils.message.universalUploadComplete")+ '<br/>')
              return
        )

  # send tablet user docs to the server
  @syncUsers: ( callback ) ->
    tabletUsers = new TabletUsers
    tabletUsers.fetch
      error: -> callback?()
      success: ->
        docIds = tabletUsers.pluck "_id"

        Tangerine.db.allDocs 
          keys: _.without(docIds, "user-admin")
          include_docs: true
        , (err, response) =>
          if (err)
            return alert("Unable to sync Users because of" + err)
          docs = {"docs":response.rows.map((el)->el.doc)}
          compressedData = LZString.compressToBase64(JSON.stringify(docs))
          a = document.createElement("a")
          a.href = Tangerine.settings.get("groupHost")
          bulkDocsUrl = "#{a.protocol}//#{a.host}/decompressor/upload/#{Tangerine.settings.get('groupName')}?force=true"
          $.ajax
            type : "post"
            url : bulkDocsUrl
            data : compressedData
            error: (response) =>
              console.log "User Upload: Server bulk docs error", response
              callback(response)
            success: (response) =>
              console.log "Users Uploaded", response
              callback(null, response)


  @universalUpload: ->
    results = new Results
    results.fetch
      success: ->
        docList = results.pluck("_id")
        Utils.uploadCompressed(docList)

  @saveDocListToFile: ->
#    Tangerine.db.allDocs(include_docs:true).then( (response) ->
#      Utils.saveRecordsToFile(JSON.stringify(response))
#    )
    results = new Results
    results.fetch
      success: ->
#        console.log("results: " + JSON.stringify(results))
        Utils.saveRecordsToFile(JSON.stringify(results))

  @checkSession: (url, options) ->
    options = options || {};
    console.log("checkSession started")
    $.ajax
      type: "GET",
      url:  url,
      data: "",
      beforeSend: (xhr)->
        xhr.setRequestHeader('Accept', 'application/json')
      ,
      error: (jqXHR, textStatus, errorThrown) ->
        console.log("Error: " + textStatus + " jqXHR: " + JSON.stringify(jqXHR))
      complete: (req) ->
        console.log("checkSession about to run the parseJSON: " + JSON.stringify(req))
        resp = $.parseJSON(req.responseText);
        console.log("checkSession about to run the Promise")

        Promise.resolve(req.responseJSON);
        console.log("checkSession just ran the Promise")
        if (req.status == 200)
          console.log("Logged in.")
          if options.success
            options.success(resp)
        else if (options.error)
          console.log("Error:" + req.status + " resp.error: " + resp.error)
          options.error(req.status, resp.error, resp.reason);
        else
          alert("An error occurred getting session info: " + resp.reason)

#  @startReplication =  () ->
#    credentials = account.username + ":" + account.password;
#    couchdb =  "troubletickets_" +  account.site;
#    subdomain =  "ug" +  account.site;
#    remoteCouch = "http://" + credentials + "@localhost:5984/" + couchdb + "/";
#    a = document.createElement("a")
#    a.href = Tangerine.settings.get("groupHost")
#    bulkDocsUrl = "#{a.protocol}//#{a.host}/#{Tangerine.settings.groupDB}"
#    console.log("start replication with " + remoteCouch)
#    opts = {continuous: false,
#      withCredentials:true,
#    #//cookieAuth: {username:account.username, password:account.password},
#    auth: {username:account.username, password:account.password},
#    complete: CoconutUtils.onComplete,
#    timeout: 60000};
#    Backbone.sync.defaults.db.replicate.to(remoteCouch, opts, CoconutUtils.ReplicationErrorLog);

  @importDoc = (file) ->
    return p = new Promise (resolve, reject) ->
      $.ajax
        dataType: "json"
        url: file
        error: (res) ->
          console.log("Error: " + res)
        success: (res) ->
          if res.docs?
            docs = res.docs
          else
            docs = res
          Tangerine.db.put docs, (error, doc) ->
            if error
              return alert "could not save user documents: #{error}"

  @cloud_url_with_credentials: (cloud_url)->
#    cloud_credentials = "username:password"
    cloud_credentials = Tangerine.settings.get("replicationCreds")
    cloud_url.replace(/http:\/\//,"http://#{cloud_credentials}@")

  @cloud_url_with_uploader_creds: (cloud_url)->
    upName = "uploader-" + Tangerine.settings.get("groupName")
    upPass = Tangerine.settings.get("upPass")
    uploader_creds = upName + ":" + upPass
    cloud_url.replace(/http:\/\//,"http://#{uploader_creds}@")

  @groupHost_url_with_creds = ->
    a = document.createElement("a")
    a.href = Tangerine.settings.get("groupHost")
    url = "#{a.protocol}//#{a.host}/#{Tangerine.settings.groupDB}"
    credUrl = @cloud_url_with_credentials(url)
    return credUrl

  @groupDb_url_with_creds = ->
    a = document.createElement("a")
    a.href = Tangerine.settings.get("groupDb")
    url = "#{a.protocol}//#{a.host}/#{Tangerine.settings.groupDB}"
    credUrl = @cloud_url_with_credentials(url)
    return credUrl

  @groupDb_url_with_uploader_creds = ->
    a = document.createElement("a")
    a.href = Tangerine.settings.get("groupDb")
    url = "#{a.protocol}//#{a.host}/#{Tangerine.settings.groupDB}"
    credUrl = @cloud_url_with_uploader_creds(url)
    return credUrl

  @ensureServerAuth: (callbacks = {}) ->

    groupHost = Tangerine.settings.get('groupDb')
    protocolAndDomain = groupHost.split(':\/\/')
#    sessionUrl = protocolAndDomain[0] + '://uploader-' + Tangerine.settings.get('groupName') + ':' + Tangerine.settings.get('upPass') + '@' + protocolAndDomain[1] + '/_session'
    sessionUrl = protocolAndDomain[0] + '://' + Tangerine.settings.get('replicationCreds')  + '@' + protocolAndDomain[1] + '/_session'
    $.ajax
      url: sessionUrl
      type: "GET"
      dataType: "json"
      xhrFields:
        withCredentials: true
      error: $.noop
      success: (response) ->

        if response.userCtx.name is null
          callbacks.error?()
        else
          callbacks.success?()

  @replicate: (options, divId) ->
    options = {} if !options
    opts =
#      live:true
#      retry:true
      continuous: false
#      batch_size:5
#      filter: filter
#      batches_limit:1
      withCredentials:true
#      auth:
#        username:account.username
#        password:account.password
      error: (result) ->
        console.log "error: Replication error: " + JSON.stringify result
      timeout: 60000

#    _.extend options, opts

#    complete = (result) ->
#      if typeof result != 'undefined' && result != null && result.ok
#        console.log "replicateToServer - onComplete: Replication is fine. "
#      else
#        console.log "replicateToServer - onComplete: Replication message: " + result

    source = options.source
    target = options.target

    remotePouch = PouchDB.defaults(
      prefix: source
    )

    remotePouch = new PouchDB(source)

#    console.log("about to @checkSession")
#    @checkSession(source).then((result) ->
    console.log("about to replicate")
    rep = PouchDB.replicate(remotePouch, target, opts).on('change', (info) ->
      doc_count = result?.doc_count
      doc_del_count = result?.doc_del_count
      total_docs = doc_count + doc_del_count
      doc_written = info.docs_written
      percentDone = Math.floor((doc_written/total_docs) * 100)
      if !isNaN  percentDone
        msg = "Change: docs_written: " + doc_written + " of " +  total_docs + ". Percent Done: " + percentDone + "%<br/>"
      else
        msg = "Change: docs_written: " + doc_written + "<br/>"
      console.log("Change; msg: " + msg)
      if typeof divId != 'undefined'
        $(divId).append msg
    ).on('complete', (info) ->
      console.log "Complete: " + JSON.stringify info
      if (options.complete?)
        options.complete(info)
    ).on('error',  (err) ->
      console.log "error: " + JSON.stringify err
    ).then(
      console.log("I'm done")
      Tangerine.db.info().then((result) ->
        console.log("result: " + JSON.stringify(result)))
    )
#    )

#    Coconut.menuView.checkReplicationStatus();

  @restartTangerine: (message, callback) ->
    Utils.midAlert "#{message || 'Restarting Tangerine'}"
    _.delay( ->
      document.location.reload()
      callback?()
    , 2000 )

  @onUpdateSuccess: (totalDocs) ->
    Utils.documentCounter++
    if Utils.documentCounter == totalDocs
      Utils.restartTangerine "Update successful", ->
        Tangerine.router.navigate "", false
        Utils.askToLogout() unless Tangerine.settings.get("context") == "server"
      Utils.documentCounter = null


  @log: (self, error) ->
    className = self.constructor.toString().match(/function\s*(\w+)/)[1]
    console.log "#{className}: #{error}"

  # if args is one object save it to temporary hash
  # if two strings, save key value pair
  # if one string, use as key, return value
  @data: (args...) ->
    if args.length == 1
      arg = args[0]
      if _.isString(arg)
        return Tangerine.tempData[arg]
      else if _.isObject(arg)
        Tangerine.tempData = $.extend(Tangerine.tempData, arg)
      else if arg == null
        Tangerine.tempData = {}
    else if args.length == 2
      key = args[0]
      value = args[1]
      Tangerine.tempData[key] = value
      return Tangerine.tempData
    else if args.length == 0
      return Tangerine.tempData


  @working: (isWorking) ->
    if isWorking
      if not Tangerine.loadingTimer?
        Tangerine.loadingTimer = setTimeout(Utils.showLoadingIndicator, 3000)
    else
      if Tangerine.loadingTimer?
        clearTimeout Tangerine.loadingTimer
        Tangerine.loadingTimer = null

      $(".loading_bar").remove()

  @showLoadingIndicator: ->
    $("<div class='loading_bar'><img class='loading' src='images/loading.gif'></div>").appendTo("body").middleCenter()

  # asks for confirmation in the browser, and uses phonegap for cool confirmation
  @confirm: (message, options) ->
    if navigator.notification?.confirm?
      navigator.notification.confirm message,
        (input) ->
          if input == 1
            options.callback true
          else if input == 2
            options.callback false
          else
            options.callback input
      , options.title, options.action+",Cancel"
    else
      if window.confirm message
        options.callback true
        return true
      else
        options.callback false
        return false
    return 0

  # this function is a lot like jQuery.serializeArray, except that it returns useful output
  # works on textareas, input type text and password
  @getValues: ( selector ) ->
    values = {}
    $(selector).find("input[type=text], input[type=password], textarea").each ( index, element ) ->
      values[element.id] = element.value
    return values

  # converts url escaped characters
  @cleanURL: (url) ->
    if url.indexOf?("%") != -1
      url = decodeURIComponent url
    else
      url

  # Disposable alerts
  @topAlert: (alertText, delay = 2000) ->
    Utils.alert "top", alertText, delay

  @midAlert: (alertText, delay=2000) ->
    Utils.alert "middle", alertText, delay

  @alert: ( where, alertText, delay = 2000 ) ->

    switch where
      when "top"
        selector = ".top_alert"
        aligner = ( $el ) -> return $el.topCenter()
      when "middle"
        selector = ".mid_alert"
        aligner = ( $el ) -> return $el.middleCenter()


    if Utils["#{where}AlertTimer"]?
      clearTimeout Utils["#{where}AlertTimer"]
      $alert = $(selector)
      $alert.html( $alert.html() + "<br>" + alertText )
    else
      $alert = $("<div class='#{selector.substring(1)} disposable_alert'>#{alertText}</div>").appendTo("#content")

    aligner($alert)

    do ($alert, selector, delay) ->
      computedDelay = ((""+$alert.html()).match(/<br>/g)||[]).length * 1500
      Utils["#{where}AlertTimer"] = setTimeout ->
          Utils["#{where}AlertTimer"] = null
          $alert.fadeOut(250, -> $(this).remove() )
      , Math.max(computedDelay, delay)



  @sticky: (html, buttonText = "Close", callback, position = "middle") ->
    div = $("<div class='sticky_alert'>#{html}<br><button class='command parent_remove'>#{buttonText}</button></div>").appendTo("#content")
    if position == "middle"
      div.middleCenter()
    else if position == "top"
      div.topCenter()
    div.on("keyup", (event) -> if event.which == 27 then $(this).remove()).find("button").click callback

  @topSticky: (html, buttonText = "Close", callback) ->
    Utils.sticky(html, buttonText, callback, "top")



  @modal: (html) ->
    if html == false
      $("#modal_back, #modal").remove()
      return

    $("body").prepend("<div id='modal_back'></div>")
    $("<div id='modal'>#{html}</div>").appendTo("#content").middleCenter().on("keyup", (event) -> if event.which == 27 then $("#modal_back, #modal").remove())

  @passwordPrompt: (callback) ->
    html = "
      <div id='pass_form' title='User verification'>
        <label for='password'>Please re-enter your password</label>
        <input id='pass_val' type='password' name='password' id='password' value=''>
        <button class='command' data-verify='true'>Verify</button>
        <button class='command'>Cancel</button>
      </div>
    "

    Utils.modal html

    $pass = $("#pass_val")
    $button = $("#pass_valform button")

    $pass.on "keyup", (event) ->
      return true unless event.which == 13
      $button.off "click"
      $pass.off "change"

      callback $pass.val()
      Utils.modal false

    $button.on "click", (event) ->
      $button.off "click"
      $pass.off "change"

      callback $pass.val() if $(event.target).attr("data-verify") == "true"

      Utils.modal false



  # returns a GUID
  @guid: ->
   return @S4()+@S4()+"-"+@S4()+"-"+@S4()+"-"+@S4()+"-"+@S4()+@S4()+@S4()
  @S4: ->
   return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString(16).substring(1)

  @humanGUID: -> return @randomLetters(4)+"-"+@randomLetters(4)+"-"+@randomLetters(4)
  @safeLetters = "abcdefghijlmnopqrstuvwxyz".split("")
  @randomLetters: (length) ->
    result = ""
    while length--
      result += Utils.safeLetters[Math.floor(Math.random()*Utils.safeLetters.length)]
    return result

  # turns the body background a color and then returns to white
  @flash: (color="red", shouldTurnItOn = null) ->

    if not shouldTurnItOn?
      Utils.background color
      setTimeout ->
        Utils.background ""
      , 1000

  @background: (color) ->
    if color?
      $("#content_wrapper").css "backgroundColor" : color
    else
      $("#content_wrapper").css "backgroundColor"

  # Retrieves GET variables
  # http://ejohn.org/blog/search-and-dont-replace/
  @$_GET: (q, s) ->
    vars = {}
    parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) ->
        value = if ~value.indexOf("#") then value.split("#")[0] else value
        vars[key] = value.split("#")[0];
    )
    vars


  # not currently implemented but working
  @resizeScrollPane: ->
    $(".scroll_pane").height( $(window).height() - ( $("#navigation").height() + $("#footer").height() + 100) )

  # asks user if they want to logout
  @askToLogout: -> Tangerine.user.logout() if confirm("Would you like to logout now?")

  @updateFromServer: (model) ->

    dKey = model.id.substr(-5, 5)

    @trigger "status", "import lookup"

    sourceDB = Tangerine.settings.urlDB("group")
    targetDB = Tangerine.conf.db_name

    sourceDKey = Tangerine.settings.urlView("group", "byDKey")

    ###
    Gets a list of documents on both the server and locally. Then replicates all by id.
    ###

    $.ajax
      url: sourceDKey,
      type: "POST"
      dataType: "json"
      data: JSON.stringify(keys:dKey)
      error: (a, b) -> model.trigger "status", "import error", "#{a} #{b}"
      success: (data) ->
        docList = data.rows.reduce ((obj, cur) -> obj[cur.id] = true), {}

        Tangerine.db.query("#{Tangerine.conf.design_doc}/byDKey",
          key: dKey
        ).then (response) ->
          console.warn response unless response.rows?
          docList = data.rows.reduce ((obj, cur) -> obj[cur.id] = true), docList
          docList = Object.keys(docList)
          $.couch.replicate(
            sourceDB,
            targetDB, {
              success: (response) ->
                model.trigger "status", "import success", response
              error: (a, b)      -> model.trigger "status", "import error", "#{a} #{b}"
            },
              doc_ids: docList
          )

  @loadDevelopmentPacks: (callback) ->
    $.ajax
      dataType: "json"
      url: "packs.json"
      error: (res) ->
        callback(res)
      success: (res) ->
        Tangerine.db.bulkDocs res, {new_edits: false}, (error, response) ->
          if error then callback(error) else callback()

  @getAssessments: (T_ADMIN, T_PASS, group, success, error) ->

    SOURCE_GROUP = "http://" + T_ADMIN + ":" + T_PASS + "@databases.tangerinecentral.org/group-" + group;


    # helper method for json get requests
    # needs opts.url.
    # Chain handlers to .end(f)
    get = (opts) ->
      data = opts.data || {};
      return $.getJSON(opts.url)
#        .header('Accept', 'application/json')
#        .header('Content-Type', 'application/json');


    # helper method for json post requests
    # needs opts.data and opts.url.
    # Chain handlers to .end(f)
    post = (opts) ->
      data = opts.data || {};
      return $.post(
        url: opts.url
        dataType: 'json'
        data: data
      )
#      .header('Accept', 'application/json')
#      .header('Content-Type', 'application/json')
#      .send(data)

    assessments = ""
    get({url: SOURCE_GROUP}).done((res) ->
      if res.code != 200
        console.log(res.code)
        console.log(res.rawbody)
        error(res.rawbody)
    )
    post(
      url: SOURCE_GROUP + "/_design/ojai/_view/assessmentsNotArchived"
      ).done((res) ->
#       transform them to dKeys
      list_query_data =
          keys: res.body.rows.map( (row) ->
            return row.id.substr(-5)
            )
#      get a list of files associated with those assessments
        post(
          url: SOURCE_GROUP + "/_design/ojai/_view/byDKey",
          data: list_query_data
        ).done((res) ->
          id_list = res.body.rows.map((row) ->
            return row.id;
          )
          id_list.push("settings")
          pack_number = 0;
          padding = "0000";

          fse.ensureDirSync(PACK_PATH); # make sure the directory is there
          doOne() ->
            ids = id_list.splice(0, PACK_DOC_SIZE); # get X doc ids
            #get n docs
            get(
              url: SOURCE_GROUP + "/_all_docs?include_docs=true&keys=" + JSON.stringify(ids)
            )
            .done((res) ->
#              file_name = PACK_PATH + "/pack" + (padding + pack_number).substr(-4) + ".json";
              docs = res.body.rows.map((row) ->
                return row.doc;
                )
              body = JSON.stringify(
                docs: docs
                )
              assessments = assessments + body
              console.log(pack_number + " added to assessments");
              if ids.length != 0
                pack_number++;
                doOne()
              else
                console.log("All done")

            ) # END of get _all_docs
          doOne()
          ) # END of byDKey callback
    ) # END of assessmentsNotArchived callback

# Robbert interface
class Robbert

  @request: (options) ->

    success = options.success
    error   = options.error

    delete options.success
    delete options.error

    $.ajax
      type        : "POST"
      crossDomain : true
      url         : Tangerine.config.get("robbert")
      dataType    : "json"
      data        : options
      success: ( data ) =>
        success data
      error: ( data ) =>
        error data

# Tree interface
class TangerineTree

  @make: (options) ->

    Utils.working true
    success = options.success
    error   = options.error

    delete options.success
    delete options.error

    options.user = Tangerine.user.name()

    $.ajax
      type     : "POST"
      crossDomain : true
      url      : Tangerine.config.get("tree") + "make/#{Tangerine.settings.get('groupName')}"
      dataType : "json"
      data     : options
      success: ( data ) =>
        success data
      error: ( data ) =>
        error data, JSON.parse(data.responseText)
      complete: ->
        Utils.working false



##UI helpers
$ ->
  # ###.clear_message
  # This little guy will fade out and clear him and his parents. Wrap him wisely.
  # `<span> my message <button class="clear_message">X</button>`
  $("#content").on("click", ".clear_message",  null, (a) -> $(a.target).parent().fadeOut(250, -> $(this).empty().show() ) )
  $("#content").on("click", ".parent_remove", null, (a) -> $(a.target).parent().fadeOut(250, -> $(this).remove() ) )

  # disposable alerts = a non-fancy box
  $("#content").on "click",".alert_button", ->
    alert_text = if $(this).attr("data-alert") then $(this).attr("data-alert") else $(this).val()
    Utils.disposableAlert alert_text
  $("#content").on "click", ".disposable_alert", ->
    $(this).stop().fadeOut 100, ->
      $(this).remove()

  # $(window).resize Utils.resizeScrollPane
  # Utils.resizeScrollPane()

# Handlebars partials
Handlebars.registerHelper('gridLabel', (items,itemMap,index) ->
#  _.escape(items[itemMap[done]])
  _.escape(items[itemMap[index]])
)
Handlebars.registerHelper('startRow', (index) ->
  console.log("index: " + index)
  if index == 0
    "<tr>"
)
Handlebars.registerHelper('endRow', (index) ->
  console.log("index: " + index)
  if index == 0
    "</tr>"
)

Handlebars.registerHelper('startCell', (index) ->
  console.log("index: " + index)
  if index == 0
    "<td></td>"
)

#/*
#   * Use this to turn on logging:
#   */
Handlebars.logger.log = (level)->
  if  level >= Handlebars.logger.level
    console.log.apply(console, [].concat(["Handlebars: "], _.toArray(arguments)))

##// DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3,
Handlebars.registerHelper('log', Handlebars.logger.log);
##// Std level is 3, when set to 0, handlebars will log all compilation results
Handlebars.logger.level = 3;

#/*
#   * Log can also be used in templates: '{{log 0 this "myString" accountName}}'
#   * Logs all the passed data when logger.level = 0
#   */

Handlebars.registerHelper("debug", (optionalValue)->
  console.log("Current Context")
  console.log("====================")
  console.log(this)

  if optionalValue
    console.log("Value")
    console.log("====================")
    console.log(optionalValue)
)

Handlebars.registerHelper('monthDropdown', (months, currentMonth)->
  renderOption = (month, currentMonth)->
    out = "<option value='" + month + "'"
    if month == currentMonth
      out = out + "selected='selected'"
    out = out +  ">" + month.titleize() + "</option>"
    return out
  renderOption(month, currentMonth) for month in months
)

class Backbone.EditView extends Backbone.View

  events :
    "click .edit_in_place" : "editInPlace"
    "focusout .editing"    : "editing"
    "keyup    .editing"    : "editing"
    "keydown  .editing"    : "editing"

  getEditable: (options) =>

    model        = options.model
    attribute    = options.attribute
    name         = options.name        || "Value"
    placeholder  = options.placeholder || "none"
    prepare      = options.prepare

    @preparations                     = {} unless @preparations?
    @preparations[model.id]           = {} unless @preparations[model.id]?
    @preparations[model.id][attribute.key] = prepare

    @htmlGenCatelog = {} unless @htmlGenCatelog?
    @htmlGenCatelog[model.id] = {} unless @htmlGenCatelog[model.id]?
    @htmlGenCatelog[model.id][attribute.key] = htmlFunction = do (model, attribute, name, placeholder) -> 
      -> 

        key    = attribute.key
        escape = attribute.escape
        type   = attribute.type || ''

        # cook the value
        value = if model.has(key) then model.get(key) else placeholder
        value = placeholder if _(value).isEmptyString()

        value = _(value).escape() if escape
        untitled = " data-untitled='true' " if value is placeholder

        # what is it
        editOrNot   = if attribute.editable && Tangerine.settings.get("context") == "server" then "class='edit_in_place'" else ""

        numberOrNot = if _.isNumber(value) then "data-is-number='true'" else "data-is-number='false'" 

        result = "<div class='edit_in_place #{key}-edit-in-place' id='#{model.id}-#{key}'><span data-model-id='#{model.id}' data-type='#{type}' data-key='#{key}' data-value='#{value}' data-name='#{name}' #{editOrNot} #{numberOrNot} #{untitled||''}>#{value}</span></div>"

        return result

    return htmlFunction()


  editInPlace: (event) =>

    return if @alreadyEditing
    @alreadyEditing = true

    # save state
    # replace with text area
    # on save, save and re-replace
    $span = $(event.target)

    $parent  = $span.parent()

    return if $span.hasClass("editing")

    guid     = Utils.guid()

    key      = $span.attr("data-key")
    name     = $span.attr("data-name")
    type     = $span.attr("data-type")
    isNumber = $span.attr("data-is-number") == "true"

    modelId  = $span.attr("data-model-id")
    model    = @models.get(modelId)

    oldValue = model.get(key) || ""
    oldValue = "" if $span.attr("data-untitled") == "true"

    $target = $(event.target)
    classes = ($target.attr("class") || "").replace("settings","")
    margins = $target.css("margin")

    transferVariables = "data-is-number='#{isNumber}' data-key='#{key}' data-model-id='#{modelId}' "

    if type is "boolean"
      $span

    # sets width/height with style attribute
    rows = 1 + oldValue.count("\n")
    rows = parseInt(Math.max(oldValue.length / 30, rows))
    $parent.html("<textarea placeholder='#{name}' id='#{guid}' rows='#{rows}' #{transferVariables} class='editing #{classes} #{key}-editing' style='margin:#{margins}' data-name='#{name}'>#{oldValue}</textarea>")
    # style='width:#{oldWidth}px; height: #{oldHeight}px;'
    $textarea = $("##{guid}")
    $textarea.select()

  editing: (event) =>

    return false if event.which == 13 and event.type == "keyup"

    $target = $(event.target)

    $parent = $target.parent()

    key        = $target.attr("data-key")
    isNumber   = $target.attr("data-is-number") == "true"

    modelId    = $target.attr("data-model-id")
    name       = $target.attr("data-name")

    model      = @models.get(modelId)
    oldValue   = model.get(key)

    newValue = $target.val()
    newValue = if isNumber then parseInt(newValue) else newValue

    if event.which == 27 or event.type == "focusout"
      @$el.find("##{modelId}-#{key}").html @htmlGenCatelog[modelId][key]?()
      @alreadyEditing = false
      return

    # act normal, unless it's an enter key on keydown
    keyDown = event.type is "keydown"
    enter   = event.which is 13
    altKey  = event.altKey

    return true if enter and altKey
    return true unless enter and keyDown

    @alreadyEditing = false

    # If there was a change, save it
    if String(newValue) != String(oldValue)
      attributes = {}
      attributes[key] = newValue
      if @preparations?[modelId]?[key]?
        try
          attributes[key+"-cooked"] = @preparations[modelId][key](newValue)
        catch e
          Utils.sticky("Problem cooking value<br>#{e.message}")
          return
      model.save attributes,
        success: =>
          Utils.topAlert "#{name} saved"
          @$el.find("##{modelId}-#{key}").html @htmlGenCatelog[modelId][key]?()
        error: =>
          alert "Please try to save again, it didn't work that time."
          @render()
    else
      @$el.find("##{modelId}-#{key}").html @htmlGenCatelog[modelId][key]?()

    # this ensures we do not insert a newline character when we press enter
    return false





class Backbone.ChildModel extends Backbone.Model

  save: (attributes, options={}) =>
    options.success = $.noop unless options.success?
    options.error = $.noop unless options.error?
    @set attributes
    options.childSelf = @
    @parent.childSave(options)


class Backbone.ChildCollection extends Backbone.Collection


class Backbone.ParentModel extends Backbone.Model

  Child: null
  ChildCollection: null

  constructor: (options) ->
    @collection = new @ChildCollection()
    @collection.on "remove", => @updateAttributes()
    super(options)

  getLength: -> @collection.length || @attributes.children.length

  fetch: (options) ->
    oldSuccess = options.success
    delete options.success
    
    options.success = (model, response, options) =>
      childrenModels = []
      for child in @getChildren()
        childModel = new @Child(child)
        childModel.parent = @
        childrenModels.push childModel
      @collection.reset childrenModels
      @collection.sort()
      oldSuccess(model, response, options)

    super(options)

  getChildren: ->
    @getArray("children")

  updateAttributes: ->
    @attributes.children = []
    for model in @collection.models
      @attributes.children.push model.attributes

  updateCollection: =>
    @collection.reset(@attributes.children)
    @collection.each (child) =>
      child.parent = @

  newChild: (attributes={}, options) =>
    newChild = new @Child
    newChild.set("_id", Utils.guid())
    newChild.parent = @
    @collection.add(newChild, options)
    newChild.save attributes,
      success: =>
        

  childSave: (options = {}) =>
    oldSuccess = options.success
    delete options.success
    options.success = (a, b, c) =>
      oldSuccess.apply(options.childSelf, [a, b, c])
    @updateAttributes()

    @save null, options


_.prototype.isEmptyString = ->
  _.isEmptyString(@_wrapped)

_.prototype.indexBy = ( index ) ->

  anArray = @_wrapped
  anArray = @_wrapped.models if @_wrapped.models?

  _.indexBy(index, anArray)

_.prototype.tally = ->
  _.tally(@_wrapped)

_.tally = ( anArray ) ->
  counts = {}
  for element in anArray
    if element?
      counts[element] = 0 unless counts[element]?
      counts[element]++
  counts


