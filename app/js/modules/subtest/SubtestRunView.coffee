class SubtestRunView extends Backbone.View

  className : "SubtestRunView"

  events:
    'click .next'         : 'next'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'

  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  initialize: (options) ->
    @protoViews  = Tangerine.config.get "prototypeViews"
    @model       = options.model
    @parent      = options.parent
    @fontStyle = "style=\"font-family: #{@model.get('fontFamily')} !important;\"" if @model.get("fontFamily") != "" 
    
    @prototypeRendered = false

  render: ->

    enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>help</button><div class='enumerator_help' #{@fontStyle || ""}>#{@model.get 'enumeratorHelp'}</div>" else ""
    studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'studentDialog'}</div>" else ""
    transitionComment  = if (@model.get("transitionComment")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'transitionComment'}</div> <br>" else ""

    skipButton = "<button class='skip navigation'>Skip</button>"
    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"

    @$el.html "
      <h2>#{@model.get 'name'}</h2>
      #{enumeratorHelp}
      #{studentDialog}
      <div id='prototype_wrapper'></div>
      
      <div class='controlls clearfix'>
        #{transitionComment}
        <button class='next navigation'>#{t('next')}</button>#{if skippable then skipButton else "" }
      </div>
    "
  
    # Use prototype specific views here
    @prototypeView = new window[@protoViews[@model.get 'prototype']['run']]
      model  : @model
      parent : @
    @prototypeView.on "rendered",    => @flagRender("prototype")
    @prototypeView.on "subRendered", => @trigger "subRendered"
    @prototypeView.on "showNext",    => @showNext()
    @prototypeView.on "hideNext",    => @hideNext()
    @prototypeView.on "ready",       => @prototypeRendered = true;
    @prototypeView.setElement(@$el.find('#prototype_wrapper'))
    @prototypeView.render()

    @flagRender "subtest"

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

    @prototypeView.updateExecuteReady?(true)

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

  next: -> @parent.next()
  skip: -> @parent.skip()
