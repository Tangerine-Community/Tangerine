class AssessmentRunView extends Backbone.View

  className : "AssessmentRunView"

  initialize: (options) ->

    @abortAssessment = false
    @index = 0
    @model = options.model
    @orderMap = []

    Tangerine.tempData = {}

    @rendered = {
      "assessment" : false
      "subtest" : false
    }

    Tangerine.activity = "assessment run"
    @subtestViews = []
    @model.subtests.sort()
    @model.subtests.each (model) =>
      @subtestViews.push new SubtestRunView 
        model  : model
        parent : @

    hasSequences = @model.has("sequences") && not _.isEmpty(_.compact(_.flatten(@model.get("sequences"))))

    if hasSequences
      sequences = @model.get("sequences")
      @orderMap = sequences[Math.floor(Math.random() * sequences.length)]
      @orderMap[@orderMap.length] = @orderMap.length
    else
      for i in [0..@subtestViews.length]
        @orderMap[i] = i

    @result = new Result
      assessmentId   : @model.id
      assessmentName : @model.get "name"
      blank          : true
    
    if hasSequences then @result.set("order_map" : @orderMap)
      
    resultView = new ResultView
        model          : @result
        assessment     : @model
        assessmentView : @
    @subtestViews.push resultView

  render: ->
    currentView = @subtestViews[@orderMap[@index]]
    
    if @model.subtests.length == 0
      @$el.append "<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>"
    else
      @$el.html "
        <h1>#{@model.get 'name'}</h1>
        <div id='progress'></div>
      "
      @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )

      currentView.on "rendered",    => @flagRender "subtest"
      currentView.on "subRendered", => @trigger "subRendered"

      currentView.render()
      @$el.append currentView.el

    @flagRender "assessment"

  flagRender: (object) ->
    @rendered[object] = true

    if @rendered.assessment && @rendered.subtest
      @trigger "rendered"


  afterRender: ->
    @subtestViews[@orderMap[@index]]?.afterRender?()

  onClose: ->
    for view in @subtestViews
      view.close()
    @result.clear()
    $("#current_student_id").fadeOut(250, -> $(@).html("").show())
    $("#current_student").fadeOut(250)
    
  abort: ->
    @abortAssessment = true
    @next()

  skip: =>
    currentView = @subtestViews[@orderMap[@index]]
    @result.add
      name      : currentView.model.get "name"
      data      : currentView.getSkipped()
      subtestId : currentView.model.id
      skipped   : true
      prototype : currentView.model.get "prototype"
      sum       : currentView.getSum()
    ,
      success: =>
        @resetNext()

  next: =>
    if @abortAssessment == true
      @resetNext()
      return 

    currentView = @subtestViews[@orderMap[@index]]
    if currentView.isValid()
      subtestResult = currentView.getResult()

      @result.add
        name        : currentView.model.get "name"
        data        : subtestResult.body
        subtestHash : subtestResult.meta.hash
        subtestId   : currentView.model.id
        prototype   : currentView.model.get "prototype"
        sum         : currentView.getSum()
      ,
        success : =>
          @resetNext()
    else
      currentView.showErrors()
  
  resetNext: =>
    @rendered.subtest = false
    @rendered.assessment = false
    currentView = @subtestViews[@orderMap[@index]]
    currentView.close()
    @index = 
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + 1
    @render()
    window.scrollTo 0, 0