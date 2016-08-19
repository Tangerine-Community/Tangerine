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



#
# Skip logic
#

# these could easily be refactored into one.

ResultOfQuestion = (name) ->
  returnView = null
  index = vm.currentView.orderMap[vm.currentView.index]

  for candidateView in vm.currentView.subtestViews[index].prototypeView.questionViews
    if candidateView.model.get("name") == name
      returnView = candidateView
  throw new ReferenceError("ResultOfQuestion could not find variable #{name}") if returnView == null
  return returnView.answer if returnView.answer
  return null

ResultOfMultiple = (name) ->
  returnView = null
  index = vm.currentView.orderMap[vm.currentView.index]

  for candidateView in vm.currentView.subtestViews[index].prototypeView.questionViews
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
  for oneModel in @models
    if oneModel.has(attr)
      key = oneModel.get(attr)
      result[key] = [] if not result[key]?
      result[key].push(oneModel)
  return result

# Returns an object hashed by a given attribute.
Backbone.Collection.prototype.indexArrayBy = ( attr ) ->
  result = []
  for oneModel in @models
    if oneModel.has(attr)
      key = oneModel.get(attr)
      result[key] = [] if not result[key]?
      result[key].push(oneModel)
  return result

Backbone.Model.prototype.conform = ( standard = {} ) ->
  throw "Cannot conform to empty standard. Use @clear() instead." if _.isEmpty(standard)
  for key, value of standard
    @set(key, value()) if @has(key) or @get(key) is ""

Backbone.Model.prototype.prune = ( shape = {} ) ->
  throw "Cannot conform to empty standard. Use @clear() instead." if _.isEmpty(standard)
  for key, value of @attributes
    @unset(key) unless key in standard

# hash the attributes of a model
Backbone.Model.prototype.toHash = ->
  significantAttributes = {}
  for key, value of @attributes
    significantAttributes[key] = value if !~['_rev', '_id','hash','updated','editedBy'].indexOf(key)
  return b64_sha1(JSON.stringify(significantAttributes))

# by default all models will save a timestamp and hash of significant attributes
Backbone.Model.prototype._beforeSave = ->
  @beforeSave?()
  @stamp()

Backbone.Model.prototype.stamp = ->
  @set
    "editedBy" : Tangerine?.user?.name() || "unknown"
    "updated" : (new Date()).toString()
    "hash" : @toHash()
    "fromInstanceId" : Tangerine.settings.getString("instanceId")


#
# This series of functions returns properties with default values if no property is found
# @gotcha be mindful of the default "blank" values set here
#
Backbone.Model.prototype.getNumber =        (key) -> return if @has(key) then parseInt(@get(key)) else 0
Backbone.Model.prototype.getArray =         (key) -> return if @has(key) then @get(key)           else []
Backbone.Model.prototype.getString =        (key) -> return if @has(key) then @get(key)           else ""
Backbone.Model.prototype.getEscapedString = (key) -> return if @has(key) then @escape(key)        else ""
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

  $.fn.widthPercentage = ->
    return Math.round(100 * @outerWidth() / @offsetParent().width()) + '%'

  $.fn.heightPercentage = ->
    return Math.round(100 * @outerHeight() / @offsetParent().height()) + '%'


  $.fn.getStyleObject = ->

      dom = this.get(0)

      returns = {}

      if window.getComputedStyle

          camelize = (a, b) -> b.toUpperCase()

          style = window.getComputedStyle dom, null

          for prop in style
              camel = prop.replace /\-([a-z])/g, camelize
              val = style.getPropertyValue prop
              returns[camel] = val

          return returns

      if dom.currentStyle

          style = dom.currentStyle

          for prop in style

              returns[prop] = style[prop]

          return returns

      return this.css()



)(jQuery)

#
# CouchDB error handling
#
$.ajaxSetup
  statusCode:
    404: (xhr, status, message) ->
      code = xhr.status
      statusText = xhr.statusText
      seeUnauthorized = ~xhr.responseText.indexOf("unauthorized")
      if seeUnauthorized
        Utils.midAlert "Session closed<br>Please log in and try again."
        Tangerine.user.logout()


# debug codes
km = {"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"a":65,"b":66,"c":67,"d":68,"e":69,"f":70,"g":71,"h":72,"i":73,"j":74,"k":75,"l":76,"m":77,"n":78,"o":79,"p":80,"q":81,"r":82,"s":83,"t":84,"u":85,"v":86,"w":87,"x":88,"y":89,"z":90}
sks = [ { q : (km["2001update"[i]] for i in [0..9]), i : 0, c : -> Utils.updateTangerine( -> Utils.midAlert("Updated, please refresh.") ) } ]
$(document).keydown (e) -> ( if e.keyCode == sks[j].q[sks[j].i++] then sks[j]['c']() if sks[j].i == sks[j].q.length else sks[j].i = 0 ) for sk, j in sks


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
  return true if aString is null or aString is undefined
  return false unless _.isString(aString) or _.isNumber(aString)
  aString = String(aString) if _.isNumber(aString)
  return true if aString.replace(/\s*/, '') == ''
  return false

_.prototype.isEmptyString = ->
  _.isEmptyString(@_wrapped)

_.indexBy = ( propertyName, objectArray ) ->
  result = {}
  for oneObject in objectArray
    if oneObject[propertyName]?
      key = oneObject[propertyName]
      result[key] = [] if not result[key]?
      result[key].push(oneObject)
  return result

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



class Utils


  @changeLanguage : (code, callback) ->
    i18n.setLng code, callback

  @resave: () ->
    updateModels = (models, callback) ->
      if models.length is 0
        return callback()
      models.pop().save null,
        success: (model) ->
          console.log model.url
          updateModels(models, callback)


    updateCollections = (collections, callback) ->
      if collections.length is 0
        return callback()

      collection = new (collections.pop())
      collection.fetch
        success: ->
          updateModels collection, ->
            updateCollections( collections, callback )

    updateCollections [ Assessments, Subtests, Questions ], ->
      console.log "All done"



  @execute: ( functions ) ->

    step = ->
      nextFunction = functions.shift()
      nextFunction?(step)
    step()

  @loadCollections : ( loadOptions ) ->

    throw "You're gonna want a callback in there, buddy." unless loadOptions.complete?

    toLoad = loadOptions.collections || []

    getNext = (options) ->
      if current = toLoad.pop()
        memberName = current.underscore().camelize(true)
        options[memberName] = new window[current]
        options[memberName].fetch
          success: ->
            getNext options
      else
        loadOptions.complete options

    getNext {}

  @universalUpload: ->
    $.ajax
      url: Tangerine.settings.urlView("local", "byCollection")
      type: "POST"
      dataType: "json"
      contentType: "application/json"
      data: JSON.stringify(
        keys : ["result"]
      )
      success: (data) ->
        docList = _.pluck(data.rows,"id")

        $.couch.replicate(
          Tangerine.settings.urlDB("local"),
          Tangerine.settings.urlDB("group"),
            success: =>
              Utils.sticky "Results synced to cloud successfully."
            error: (code, message) =>
              Utils.sticky "Upload error<br>#{code} #{message}"
          ,
            doc_ids: docList
        )

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
      Utils.documentCounter = null


  @updateTangerine: (doResolve = true, options = {}) ->

    return unless Tangerine.user.isAdmin()

    Utils.documentCounter = 0

    dDoc = "ojai"
    targetDB = options.targetDB || Tangerine.db_name
    docIds = options.docIds || ["_design/#{dDoc}", "configuration"]


    Utils.midAlert "Updating..."
    Utils.working true
    # save old rev for later
    Tangerine.$db.allDocs
      keys : docIds
      success: (response) ->
        oldDocs = []
        for row in response.rows
          oldDocs.push {
            "_id"  : row.id
            "_rev" : row.value.rev
          }
        # replicate from update database
        $.couch.replicate Tangerine.settings.urlDB("update"), targetDB,
          error: (error) ->
            Utils.working false
            Utils.midAlert "Update failed replicating<br>#{error}"
            Utils.documentCounter = null
          success: ->
            unless doResolve
              Utils.onUpdateSuccess(1)
              return
            totalDocs = docIds.length
            for docId, i in docIds
              oldDoc = oldDocs[i]
              do (docId, oldDoc, totalDocs) ->
                Tangerine.$db.openDoc docId,
                  conflicts: true
                  success: (data) ->
                    if data._conflicts?
                      Tangerine.$db.removeDoc oldDoc,
                        success: ->
                          Utils.working false
                          Utils.onUpdateSuccess(totalDocs)
                        error: (error) ->
                          Utils.documentCounter = null
                          Utils.working false
                          Utils.midAlert "Update failed resolving conflict<br>#{error}"
                    else
                      Utils.onUpdateSuccess(totalDocs)
        , doc_ids : docIds

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
    $button = $("#pass_form button")

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

  @oldConsoleLog = null
  @enableConsoleLog: -> return unless oldConsoleLog? ; window.console.log = oldConsoleLog
  @disableConsoleLog: -> oldConsoleLog = console.log ; window.console.log = $.noop

  @oldConsoleAssert = null
  @enableConsoleAssert: -> return unless oldConsoleAssert?    ; window.console.assert = oldConsoleAssert
  @disableConsoleAssert: -> oldConsoleAssert = console.assert ; window.console.assert = $.noop

# Robbert interface
class Robbert


  @fetchUsers: (group, callback) ->
    return Robbert.req
      type: 'GET'
      url: "/group/#{group}"
      success : callback
      error : callback

  @req: (options) ->
    options.url = Tangerine.config.get("robbert") + options.url
    options.contentType = 'application/json'
    options.accept = 'application/json'
    options.dataType = 'json'
    options.data = JSON.stringify(options.data)
    console.log(options)
    return $.ajax(options)

  @fetchUser: (options) ->
    Robbert.req
      type : 'GET'
      url  :  "/user/" + Tangerine.user.get("name")
      success: ( data ) =>
        options.success? data
      error: ( data ) =>
        options.error? data

  @newGroup: (options) ->
    Robbert.req
      type : 'PUT'
      url  : '/group'
      data :
        name : options.name
      success: ( data ) =>
        options.success? data
      error: ( data ) =>
        options.error? data

  @leaveGroup: (options) ->
    Robbert.req
      type : 'DELETE'
      url  : "/group/#{options.group}/#{options.user}"
      success: ( data ) =>
        options.success? data
      error: ( data ) =>
        options.error? data

  @signup: (options) ->
    return Robbert.req
      type : 'PUT'
      url  : '/user'
      data :
        name : options.name
        pass : options.pass
      success: ( data ) =>
        options.success? data
      error: ( data ) =>
        options.error? data

  @rolePost: (url, user, callback) ->
    options =
      type : 'POST'
      url : "/group/#{Tangerine.settings.get("groupName")}" + url
      data :
        user : user
      success : callback
      error : callback
      complete : (res) ->
        Utils.midAlert res.responseJSON.message

    return Robbert.req options

  @addAdmin: (user, callback) ->     Robbert.rolePost "/add-admin", user, callback
  @addMember: (user, callback) ->    Robbert.rolePost "/add-member", user, callback
  @removeAdmin: (user, callback) ->  Robbert.rolePost "/remove-admin", user, callback
  @removeMember: (user, callback) -> Robbert.rolePost "/remove-member", user, callback


# Tree interface
class TangerineTree
  
  @generateJsonAndMAke: ->

    url = Tangerine.settings.urlView "group", "assessmentsNotArchived"
    console.log("url: " + url)

    $.ajax
      url: Tangerine.settings.urlView "group", "assessmentsNotArchived"
      dataType: "json"
      success: (data) =>
        console.log("data: " + JSON.stringify(data))
#        dKeys = _.compact(doc.id.substr(-5, 5) for doc in data.rows).concat(keyList).join(" ")
        dKeys = data.rows.map((row) => row.id.substr(-5))
        dKeyQuery =
          keys: dKeys
        console.log("dKeyQuery:" + JSON.stringify(dKeyQuery))
        url = Tangerine.settings.urlView("group", "byDKey")
        console.log("url: " + url)
        $.ajax
          url: Tangerine.settings.urlView("group", "byDKey"),
          type: "POST"
          contentType: "application/json"
          dataType: "json"
          data: JSON.stringify(dKeyQuery)
          success: (data) =>
            console.log("data: " + JSON.stringify(data))
            keyList = []
#            for datum in data.rows
#              keyList.push datum.key
            keyList = data.rows.map((row) => row.id);
            keyList = _.uniq(keyList)
            keyList.push("settings");
            console.log("keyList: " + JSON.stringify(keyList));
#            keyListQuery = {
#              keys: keyList,
#              include_docs:true
#            }
            Tangerine.$db.allDocs
              keys : keyList
              success: (response) ->
  #              let docs = response.body.rows.map( (row) => row.doc );
                docs = []
                for row in response.rows
                  docs.push row.doc
                body =
                  docs: docs
                return body
      error: (a, b) ->
        console.log("a: " + a)
        Utils.midAlert "Import error"

  @make: (options) ->

    Utils.working true
    url = Tangerine.settings.urlView "group", "assessmentsNotArchived"
#    console.log("url: " + url)

    $.ajax
      url: Tangerine.settings.urlView "group", "assessmentsNotArchived"
      dataType: "json"
      success: (data) =>
#        console.log("data: " + JSON.stringify(data))
        #        dKeys = _.compact(doc.id.substr(-5, 5) for doc in data.rows).concat(keyList).join(" ")
        dKeys = data.rows.map((row) => row.id.substr(-5))
        dKeyQuery =
          keys: dKeys
#        console.log("dKeyQuery:" + JSON.stringify(dKeyQuery))
        url = Tangerine.settings.urlView("group", "byDKey")
#        console.log("url: " + url)
        $.ajax
          url: Tangerine.settings.urlView("group", "byDKey"),
          type: "POST"
          contentType: "application/json"
          dataType: "json"
          data: JSON.stringify(dKeyQuery)
          success: (data) =>
#            console.log("data: " + JSON.stringify(data))
            keyList = []
            #            for datum in data.rows
            #              keyList.push datum.key
            keyList = data.rows.map((row) => row.id);
            keyList = _.uniq(keyList)
            keyList.push("settings");
#            console.log("keyList: " + JSON.stringify(keyList));
            #            keyListQuery = {
            #              keys: keyList,
            #              include_docs:true
            #            }
            Tangerine.$db.allDocs
              keys : keyList
              include_docs:true
              success: (response) ->
#                console.log("response: " + JSON.stringify(response))
#              let docs = response.body.rows.map( (row) => row.doc );
                docs = []
                for row in response.rows
                  docs.push row.doc
                body =
                  docs: docs
                success = options.success
                error   = options.error

                payload = JSON.stringify(body)
#                console.log("payload:" + JSON.stringify(body))

                delete options.success
                delete options.error

                $.ajax
                  type     : 'POST'
                  crossDomain : true
                  url      : "#{Tangerine.config.get('tree')}/group-#{Tangerine.settings.get('groupName')}/#{Tangerine.settings.get('hostname')}"
                  dataType : 'json'
                  contentType: "application/json"
                  data     : payload
                  success: ( data ) =>
                    success data
                  error: ( data ) =>
                    error data, JSON.parse(data.responseText)
                  complete: ->
                    Utils.working false
      error: (a, b) ->
        console.log("a: " + a)
        Utils.midAlert "Import error"


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
