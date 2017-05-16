#
# Skip logic
#

# these could easily be refactored into one.

ResultOfQuestion = (name) ->
  returnView = null
  index = vm.currentView.orderMap[vm.currentView.index]

  vm.currentView.subtestViews[index].prototypeView.questionViews.forEach (candidateView) ->
    if candidateView.model.get("name") == name
      returnView = candidateView
    else
#      console.log("name: " + candidateView.model.get("name") + " prompt: " + candidateView.model.get("prompt") )
  throw new ReferenceError("ResultOfQuestion could not find variable #{name}") if returnView == null
  if returnView.answer
#    console.log("name: " + returnView.model.get("name") + " prompt: " + returnView.model.get("prompt") + " answer! " + returnView.answer)
    return returnView.answer
  return null

ResultOfPreviousQuestions = (previousQuestions) ->
  previousAnswers = []
  for name in previousQuestions
    previousAnswer = ResultOfQuestion(name)
    if previousAnswer?
      previousAnswers.push(previousAnswer)
  return previousAnswers

ResultOfMultiple = (name) ->
  returnView = null
  index = vm.currentView.orderMap[vm.currentView.index]

  vm.currentView.subtestViews[index].prototypeView.questionViews.forEach (candidateView) ->
    if candidateView.model.get("name") == name
      returnView = candidateView
  throw new ReferenceError("ResultOfQuestion could not find variable #{name}") if returnView == null

  result = []
  for key, value of returnView.answer
    result.push key if value == "checked"
  return result

ResultOfPrevious = (name) ->
  return vm.currentView.result.getVariable(name)

ResultOfGrid = (name) ->
  return vm.currentView.result.getItemResultCountByVariableName(name, "correct")


SetPrevious = (name, value) ->
  return vm.currentView.result.setVariable(name, value)

SetResultOfQuestion = (name, value, obj) ->
  index = vm.currentView.orderMap[vm.currentView.index]
  notFound = true

  for candidateView in vm.currentView.subtestViews[index].prototypeView.questionViews
    if candidateView.model.get("name") == name
      notFound = false
      candidateView.answer = value
      if obj?
        candidateView[k] = v for k, v of obj
  throw new ReferenceError("SetResultOfQuestion could not find variable #{name}") if notFound

CreateResultOfQuestion = (name, property, value, obj) ->
  index = vm.currentView.orderMap[vm.currentView.index]
  for candidateView in vm.currentView.subtestViews[index].prototypeView.questionViews
    if candidateView.model.get("name") == name
      candidateView.model.set(property, value)
      if obj?
        candidateView[k] = v for k, v of obj

#
# Tangerine backbutton handler
#
Tangerine = if Tangerine? then Tangerine else {}
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
Backbone.Model.prototype.getNumber        = (key, def) -> return if @has(key) then Number(@get(key)) else if def isnt undefined then def else 0
Backbone.Model.prototype.getArray         = (key, def) -> return if @has(key) then @get(key)           else if def isnt undefined then def else []
Backbone.Model.prototype.getString        = (key, def) -> return if @has(key) then @get(key)           else if def isnt undefined then def else ""
Backbone.Model.prototype.getEscapedString = (key, def) -> return if @has(key) then @escape(key)        else if def isnt undefined then def else ""
Backbone.Model.prototype.getBoolean       = (key, def) -> return if @has(key) then (@get(key) is true or @get(key) is 'true') else if def isnt undefined then def
Backbone.Model.prototype.getObject        = (key, def) -> return if @has(key) then @get(key)           else if def isnt undefined then def else {}


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

  @execute: ( functions ) ->

    step = ->
      nextFunction = functions.shift()
      nextFunction?(step)
    step()

  @changeLanguage : (code, callback) ->
    i18n.setLng code, callback


  @uploadCompressed: (docList) ->

    a = document.createElement("a")
    a.href = Tangerine.settings.get("groupHost")
    allDocsUrl = "#{a.protocol}//#{a.host}/decompressor/check/#{Tangerine.settings.get('groupName')}"

    return $.ajax
      url: allDocsUrl
      type: "POST"
      dataType: "json"
      contentType: "application/json"
      data: JSON.stringify
        keys: docList
        user: Tangerine.settings.upUser
        pass: Tangerine.settings.upPass
      error: (a) ->
        alert "Error connecting"
      success: (response) =>

        rows = response.rows
        leftToUpload = []
        for row in rows
          leftToUpload.push(row.key) if row.error?

        # if it's already fully uploaded
        # make sure it's in the log

        Tangerine.db.allDocs(include_docs:true,keys:leftToUpload
        ).then( (response) ->
          docs = {"docs":response.rows.map((el)->el.doc)}
          compressedData = LZString.compressToBase64(JSON.stringify(docs))
          a = document.createElement("a")
          a.href = Tangerine.settings.get("groupHost")
          bulkDocsUrl = "#{a.protocol}//#{a.host}/decompressor/upload/#{Tangerine.settings.get('groupName')}"

          $.ajax
            type : "POST"
            url : bulkDocsUrl
            contentType: 'text/plain'
            data : compressedData
            error: =>
              alert "Server bulk docs error"
            success: =>
              Utils.sticky "Results uploaded"
              return
        )


  @universalUpload: ->
    results = new Results
    results.fetch
      options:
        key: "result"
      success: ->
        docList = results.pluck("_id")
        Utils.uploadCompressed(docList)

  @checkSession: (url, options) ->
    options = options || {};
    $.ajax
      type: "GET",
      url:  url,
      async: true,
      data: "",
      beforeSend: (xhr)->
        xhr.setRequestHeader('Accept', 'application/json')
      ,
      complete: (req) ->
        resp = $.parseJSON(req.responseText);
        if (req.status == 200)
          console.log("Logged in.")
          if options.success
            options.success(resp)
        else if (options.error)
          console.log("Error:" + req.status + " resp.error: " + resp.error)
          options.error(req.status, resp.error, resp.reason);
        else
          alert("An error occurred getting session info: " + resp.reason)

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

#          http://stackoverflow.com/a/16245768/6726094
  @b64toBlob = (b64Data, contentType, sliceSize) ->
    contentType = contentType or ''
    sliceSize = sliceSize or 512
    byteCharacters = atob(b64Data)
    byteArrays = []
    offset = 0
    while offset < byteCharacters.length
      slice = byteCharacters.slice(offset, offset + sliceSize)
      byteNumbers = new Array(slice.length)
      i = 0
      while i < slice.length
        byteNumbers[i] = slice.charCodeAt(i)
        i++
      byteArray = new Uint8Array(byteNumbers)
      byteArrays.push byteArray
      offset += sliceSize
    blob = new Blob(byteArrays, type: contentType)
    blob

#    http://stackoverflow.com/a/21797381/6726094
  @base64ToArrayBuffer = (base64) ->
    binary_string = window.atob(base64)
    len = binary_string.length
    bytes = new Uint8Array(len)
    i = 0
    while i < len
      bytes[i] = binary_string.charCodeAt(i)
      i++
    bytes.buffer

  @prepareSwish = () ->
    displaySound= {"data":"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","type":"audio/mp3","name":"swish.mp3"}
    arrayBuff = Utils.base64ToArrayBuffer(displaySound.data);

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
