class AssessmentRunView extends Backbone.View

  className : "AssessmentRunView"

  initialize: (options) ->

    @abortAssessment = false
    @index = 0
    @model = options.model
    @orderMap = []
    @enableCorrections = false  # toggled if user hits the back button.

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

      # get or initialize sequence places
      places = Tangerine.settings.get("sequencePlaces")
      places = {} unless places?
      places[@model.id] = 0 unless places[@model.id]?

      if places[@model.id] < sequences.length - 1
        places[@model.id]++
      else
        places[@model.id] = 0

      Tangerine.settings.save("sequencePlaces", places)

      @orderMap = sequences[places[@model.id]]
      @orderMap[@orderMap.length] = @subtestViews.length
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
      @$el.html "<h1>Oops...</h1><p>\"#{@model.get 'name'}\" is blank. Perhaps you meant to add some subtests.</p>"
      @trigger "rendered"
    else
      @$el.html "
        <h1>#{@model.get 'name'}</h1>
        <div id='progress'></div>
      "
      @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )

      currentView.on "rendered",    => @flagRender "subtest"
      currentView.on "subRendered", => @trigger "subRendered"

      currentView.on "next",    => @step 1
      currentView.on "back",    => @step -1

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
    Tangerine.nav.setStudent ""

  abort: ->
    @abortAssessment = true
    @step 1

  skip: =>
    currentView = @subtestViews[@orderMap[@index]]
    @result.add
      name      : currentView.model.get "name"
      data      : currentView.getSkipped()
      subtestId : currentView.model.id
      skipped   : true
      prototype : currentView.model.get "prototype"
    ,
      success: =>
        @reset 1

  step: (increment) =>

    if @abortAssessment
      currentView = @subtestViews[@orderMap[@index]]
      @saveResult( currentView )
      return

    currentView = @subtestViews[@orderMap[@index]]
    if currentView.isValid()
      @saveResult( currentView, increment )
    else
      currentView.showErrors()

  reset: (increment) =>
    @rendered.subtest = false
    @rendered.assessment = false
    currentView = @subtestViews[@orderMap[@index]]
    currentView.close()
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment
    @render()
    window.scrollTo 0, 0

  saveResult: ( currentView, increment ) =>

    subtestResult = currentView.getResult()
    subtestId = currentView.model.id
    prototype = currentView.model.get "prototype"
    subtestReplace = null

    for result, i in @result.get('subtestData')
      if subtestId == result.subtestId
        subtestReplace = i

    if subtestReplace != null
      # Don't update the gps subtest.
      if prototype != 'gps'
        @result.insert
          name        : currentView.model.get "name"
          data        : subtestResult.body
          subtestHash : subtestResult.meta.hash
          subtestId   : currentView.model.id
          prototype   : currentView.model.get "prototype"
          sum         : currentView.getSum()
      @reset increment

    else
      @result.add
        name        : currentView.model.get "name"
        data        : subtestResult.body
        subtestHash : subtestResult.meta.hash
        subtestId   : currentView.model.id
        prototype   : currentView.model.get "prototype"
        sum         : currentView.getSum()
      ,
        success : =>
          @reset increment
