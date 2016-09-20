 SubtestRunItemView = Backbone.Marionette.ItemView.extend

  tagName: 'p'
  template: JST["SubtestRunItemView"]

  className : "SubtestRunItemView"

  events:
    'click .subtest-next' : 'next'
    'click .subtest-back' : 'back'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'

  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  i18n: ->
    @text =
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")

  initialize: (options) ->

    @i18n()

    @model       = options.model
    @parent      = @model.parent
    @fontStyle = "style=\"font-family: #{@model.get('fontFamily')} !important;\"" if @model.get("fontFamily") != ""

    @prototypeRendered = false

    @delegateEvents()

    ui = {}
    ui.enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<div class='enumerator_help' #{@fontStyle || ""}>#{@model.get 'enumeratorHelp'}</div>" else ""
    ui.studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'studentDialog'}</div>" else ""
    ui.transitionComment  = if (@model.get("transitionComment")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'transitionComment'}</div> <br>" else ""

    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0

    ui.skipButton = "<button class='skip navigation'>#{@text.skip}</button>" if skippable
    ui.backButton = "<button class='subtest-back navigation'>#{@text.back}</button>" if backable
    ui.text = @text
    @model.set('ui', ui)

    @on 'rendered', =>
      displayCode = @model.getString("displayCode")
      console.log displayCode

      if not _.isEmptyString(displayCode)

        try
          CoffeeScript.eval.apply(@, [displayCode])
        catch error
          name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
          message = error.message
          alert "#{name}\n\n#{message}"
          console.log "displayCode Error: " + JSON.stringify(error)

      @prototypeView?.updateExecuteReady?(true)

  onRender: ->

    _render = =>

      # Prototype specific views follow this capitalization convention: GpsRunView
      console.log @model
      @prototypeView = new window["#{@model.get('prototype').titleize()}RunView"]
        model  : @model
        parent : @
      @prototypeView.on "rendered",    => @flagRender("prototype")
      @prototypeView.on "subRendered", => @trigger "subRendered"
      @prototypeView.on "showNext",    => @showNext()
      @prototypeView.on "hideNext",    => @hideNext()
      @prototypeView.on "ready",       => @prototypeRendered = true
      @prototypeView.setElement(@$el.find('#prototype_wrapper'))
      @prototypeView.render()

      @flagRender "subtest"

    languageCode = @model.get("language")
    if languageCode
      i18n.setLng languageCode, (t) =>
        window.t = t
        _render()
    else
      i18n.setLng Tangerine.settings.get("language"), (t) =>
        _render()

  flagRender: ( flag ) =>
    @renderFlags = {} if not @renderFlags
    @renderFlags[flag] = true

    if @renderFlags['subtest'] && @renderFlags['prototype']
      @trigger "rendered"

  afterRender: =>
    @prototypeView?.afterRender?()
    @onShow()

  showNext: => @$el.find(".controlls").show()
  hideNext: => @$el.find(".controlls").hide()

  onShow: ->
    displayCode = @model.getString("displayCode")

    if not _.isEmptyString(displayCode)

      try
        CoffeeScript.eval.apply(@, [displayCode])
      catch error
        name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
        message = error.message
        alert "#{name}\n\n#{message}"
        console.log "displayCode Error: " + JSON.stringify(error)

    @prototypeView?.updateExecuteReady?(true)

  getGridScore: ->
    link = @model.get("gridLinkId") || ""
    if link == "" then return
    grid = @parent.model.subtests.get @model.get("gridLinkId")
    gridScore = @parent.result.getGridScore grid.id
    gridScore

  gridWasAutostopped: ->
    link = @model.get("gridLinkId") || ""
    if link == "" then return
    grid = @parent.model.subtests.get @model.get("gridLinkId")
    gridWasAutostopped = @parent.result.gridWasAutostopped grid.id

  onClose: ->
    @prototypeView?.close?()

  isValid: ->
    if not @prototypeRendered then return false
    if @prototypeView.isValid?
      return @prototypeView.isValid()
    else
      return false
    true

  showErrors: ->
    @prototypeView.showErrors()

  getSum: ->
    if @prototypeView.getSum?
      return @prototypeView.getSum()
    else
      # maybe a better fallback
      return {correct:0,incorrect:0,missing:0,total:0}

  abort: ->
    @parent.abort()

  getResult: ->
    result = @prototypeView.getResult()
    hash = @model.get("hash") if @model.has("hash")
    return {
      'body' : result
      'meta' :
        'hash' : hash
    }

  getSkipped: ->
    if @prototypeView.getSkipped?
      return @prototypeView.getSkipped()
    else
      throw "Prototype skipping not implemented"

  next: -> @trigger "next"
  back: -> @trigger "back"
  skip: -> @trigger "skip"
