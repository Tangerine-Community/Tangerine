#
# AssessmentCompositeView
#
# AssessmentCompositeView renders every time a new subtest is shown. When next
# or back is clicked, the reset(incrementTomoveToSubtestViewIndex) method is
# eventually called which calls render. `reset` method seems familiar because
# there is `reset` on Backbone.Collection, but this reset on a View is it's own
# thing. `AssessmentCompositeView.reset` and `AssessmentCompositeView.initialize`
# ensure that there is only one model in `AssessmentCompositeView.collection` for
# `AssessmentCompositeView.render` to render. Which Model should be in that
# `AssessmentCompositeView.collection` is determined by `AssessmentCompositeView.index`.
# Listens for "result:saved" and "result:another" events triggered by the ResultItemView subtest and makes it
# available for consumption (via triggerSaved and triggerAnother) by external users such as Widget.


AssessmentCompositeView = Backbone.Marionette.CompositeView.extend

  # Initialize
  #
  # options = {
  #   assessment: An Assessment Model.
  #   result: (optional) A Result model to pick up where you left off.
  # }

  initialize: (options) ->

    @i18n()

    @on "before:render", @setChromeData
    @on "assessment:reset", =>
      if (@index + 1) == @subtestViews.length
        this.trigger('assessment:complete')

    # Set @assessment and @model
    #
    # Assessment should come from options.assessment, but in case it was assigned
    # to @model, also place it in @assessment.
    if options.assessment
      @model = options.assessment
      @assessment = options.assessment
    else
      @assessment = @model
      console.log("@model:" + JSON.stringify(@model))
      console.log("@assessment:" + JSON.stringify(@assessment))

    if typeof options.result == 'undefined'
      @result = new Result
        assessmentId   : @model.id
        assessmentName : @model.get "name"
        blank          : true
    else
      @result = options.result

    @index = (@result.get('subtestData')).length
    Tangerine.progress = {}
    Tangerine.progress.index = @index

    @abortAssessment = false
    @enableCorrections = false  # toggled if user hits the back button.

    Tangerine.tempData = {}

    @rendered = {
      "assessment" : false
      "subtest" : false
    }

    Tangerine.activity = "assessment run"
    @subtestViews = []
    @model.parent = @
    @model.subtests.sort()
    @model.subtests.each (model) =>
      model.parent = @
      @subtestViews.push new SubtestRunItemView
        model  : model
        parent : @
    this.listenTo(Backbone, 'result:saved', @triggerSaved);
    this.listenTo(Backbone, 'result:another', @triggerAnother);

    # Figure out the @orderMap which is either derived from the assessment, the
    # result with a prior orderMap, or lastly no specified order map in which case
    # we create a linear orderMap.
    @orderMap = []
    hasSequences = @model.has("sequences") && not _.isEmpty(_.compact(_.flatten(@model.get("sequences"))))
    if hasSequences and !options.result
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
      @result.set("order_map" : @orderMap)
    else if hasSequences and options.result
      @orderMap = options.result.get('order_map')
    else
      for i in [0..@subtestViews.length]
        @orderMap[i] = i
      @result.set("order_map" : @orderMap)

    resultView = new ResultView
      model          : @result
      assessment     : @model
      assessmentView : @
    @subtestViews.push resultView

    # Given this.index, get ONE MODEL to place as the SINGLE MODEL IN THE COLLECTION
    # for the Composite View to render.
    col = {}
    col.models = []
    #    model = @model.subtests.models[@index]
    model = @subtestViews[@orderMap[@index]].model
    col.models.push model
    @collection = col

    ui = {}
    ui.enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<div class='enumerator_help' #{@fontStyle || ""}>#{@model.get 'enumeratorHelp'}</div>" else ""
    ui.studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'studentDialog'}</div>" else ""
    ui.transitionComment  = if (@model.get("transitionComment")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'transitionComment'}</div> <br>" else ""

    ui.text = @text
    @model.set('ui', ui)
    @.on "nextQuestionRendered", => @nextQuestionRenderedBoom()

  # @todo Documentation
  setChromeData:->
    @model.set('subtest', @subtestViews[@orderMap[@index]].model.toJSON())

  #
  # Configure the View
  #

  # for Backbone.View
  events:
    'click .subtest-next' : 'next'
    'click .subtest-back' : 'back'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'
    'click .next_question' : 'nextQuestion'
    'click .prev_question' : 'prevQuestion'
    'nextQuestionRendered': 'nextQuestionRenderedBoom'

  # for Backbone.Marionette.CompositeView Composite Model
  template: JST["AssessmentView"],

  # for Backbone.Marionette.CompositeView
  childViewContainer: '#subtest_wrapper',

  # for Backbone.Marionette.CollectionView
  childEvents:
    'render:collection': 'addChildPostRender'
    'subRendered': 'subRendered'

  # @todo Documentation
  i18n: ->
    @text =
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")
      "previousQuestion" : t("SurveyRunView.button.previous_question")
      "nextQuestion" : t("SurveyRunView.button.next_question")

  #
  # Handle Rendering and Closing.
  #

  # @todo Documentation
  onRender:->

    # Check to see if this subtest is related to another subtest via the gridLinkId
    # property and if the related subtest was autostopped, skip this subtest.
    currentSubtestModel = @collection.models[0]
    parentSubtestId = currentSubtestModel.get('gridLinkId')
    parentSubtestResult = false
    this.result.attributes.subtestData.forEach( (subtestResult) ->
      if subtestResult.subtestId == parentSubtestId
        parentSubtestResult = subtestResult
    )
    if parentSubtestResult isnt false and parentSubtestResult.data.auto_stop is true
      @reset(1)

    @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )
    Tangerine.progress.currentSubview.on "rendered",    => @flagRender "subtest"
    Tangerine.progress.currentSubview.on "subRendered", => @trigger "subRendered"

    Tangerine.progress.currentSubview.on "next",    =>
      console.log("currentView next")
      @step 1
    Tangerine.progress.currentSubview.on "back",    => @step -1

    @flagRender "assessment"

  # @todo Documentation
  afterRender: ->
    @subtestViews[@orderMap[@index]]?.afterRender?()

  # @todo Documentation
  onClose: ->
    for view in @subtestViews
      view.close()
    @result.clear()
    Tangerine.nav.setStudent ""

  # @todo Documentation
  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  # @todo Documentation
  displaySkip: (skippable)->
    if skippable
      $( ".skip" ).show();
    else
      $( ".skip" ).hide();

  # @todo Documentation
  displayBack: (backable)->
    if backable
      $( ".subtest-back" ).removeClass("hidden");
    else
      $( ".subtest-back" ).addClass("hidden");

  #
  # Callbacks to handle flow of Subtests
  #

  # @todo Documentation
  reset: (increment) ->
    @rendered.subtest = false
    @rendered.assessment = false
    Tangerine.progress.currentSubview.close();
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment
    model = @subtestViews[@orderMap[@index]].model
    # Now that we have our model we want to render, assign that model to the
    # Composite View's Collection as the ONLY model to render.
    @collection.models = [model]
    @.trigger('assessment:reset')
    @render()
    window.scrollTo 0, 0

  # @todo Documentation
  step: (increment) ->
    this.trigger "assessment:step"
    if @abortAssessment
      currentView = Tangerine.progress.currentSubview
      @saveResult( currentView )
      return

    currentView = Tangerine.progress.currentSubview

    if currentView.testValid?
      valid = currentView.testValid()
      if valid
        @saveResult( currentView, increment )
      else
        currentView.showErrors()
    else
      currentView.showErrors()

  # @todo Documentation
  next: ->
    @step 1

  # @todo Documentation
  back: ->
    @step -1

  # @todo Documentation
  abort: ->
    @abortAssessment = true
    @step 1

  # @todo Documentation
  skip: =>
    currentView = Tangerine.progress.currentSubview
    @result.add
      name      : currentView.model.get "name"
      data      : currentView.getSkipped()
      subtestId : currentView.model.id
      skipped   : true
      prototype : currentView.model.get "prototype"
    ,
      success: =>
        @reset 1


  #
  # Methods for handling Subtest Views
  #

  # for Backbone.Marionette.CompositeView
  getChildView: (model) ->
    model.parent = @
    if !model.questions
      model.questions     = new Questions()
    if model.get("collection") == 'result'
      currentSubview =  ResultItemView
    else
      prototypeName = model.get('prototype').titleize() + "RunItemView"
      if  (prototypeName == 'SurveyRunItemView')
        currentSubview = SurveyRunItemView
      else if  (prototypeName == 'GridRunItemView')
        currentSubview = GridRunItemView
      else if  (prototypeName == 'GpsRunItemView')
        currentSubview = GpsRunItemView
      else if  (prototypeName == 'DatetimeRunItemView')
        currentSubview = DatetimeRunItemView
      else if  (prototypeName == 'IdRunItemView')
        currentSubview = IdRunItemView
      else if  (prototypeName == 'LocationRunItemView')
        currentSubview = LocationRunItemView
      else if  (prototypeName == 'ConsentRunItemView')
        currentSubview = ConsentRunItemView
      else
        currentSubview =  null
        console.log(prototypeName + "  Subview is not defined.")

    @ready = true
    return currentSubview

  # for Backbone.Marionette.CompositeView
  # Populate the questions in the model of the subtest.
  childViewOptions: (model, index) ->
    model.questions.fetch
      viewOptions:
        key: "question-#{model.id}"
      success: (collection) =>
        model.questions.sort()
        model.collection = model.questions
        @collection.models = collection.models
      error: (model, err, cb) ->
        console.log("childViewOptions id: " +  model.id + " err:" + JSON.stringify(err))

  #    TODO: This is a work-around: it may be fixed by doing something better. This code was added to resolve an issue
  #    where the SurveyRunItemView was rendering twice, and the second time it rendered, updateSkipLogic() was not getting executed.
  subRendered: ->
    currentSubtest = @children.findByIndex(0)
    currentSubtest.updateSkipLogic()

  # @todo Documentation
  subTestRenderCollection:->
    console.log("onRenderCollection")
    currentSubtest = @children.findByIndex(0)
    focusMode = currentSubtest.model.getBoolean("focusMode")
    if focusMode
      currentSubtest.updateQuestionVisibility()
      currentSubtest.updateProgressButtons()


  #    This is simply used to alert the test it('Should contain a next question button') that the page has finished rendering.
  nextQuestionRenderedBoom: ->
    console.log("nextQuestionRenderedBoom")

  # Triggered by `add:child` of this.childEvents
  addChildPostRender: ->
    currentSubtest = @children.findByIndex(0)
    focusMode = currentSubtest.model.getBoolean("focusMode")
    if focusMode
      if !@$el.find("#summary_container").length
        @$el.find("#subtest_wrapper").after $ "
              <div id='summary_container'></div>
              <button class='navigation prev_question'>#{@text.previousQuestion}</button>
              <button class='navigation next_question'>#{@text.nextQuestion}</button>
            "
      currentSubtest.updateQuestionVisibility()
      currentSubtest.updateProgressButtons()
      @trigger "nextQuestionRendered"


  #
  # Methods for handling Focus Mode on Survey Subtests.
  #

  nextQuestion: ->

    currentSubtest = @children.findByIndex(0)

    currentQuestionView = currentSubtest.questionViews[currentSubtest.questionIndex]

    # show errors before doing anything if there are any
    return currentSubtest.showErrors(currentQuestionView) unless currentSubtest.isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in currentSubtest.questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e > currentSubtest.questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = currentSubtest.questionIndex
    else
      plannedIndex = Math.min.apply(plannedIndex, isAvailable)

    if currentSubtest.questionIndex != plannedIndex
      currentSubtest.questionIndex = plannedIndex
      currentSubtest.updateQuestionVisibility()
      currentSubtest.updateProgressButtons()

  # @todo
  prevQuestion: ->

    currentSubtest = @children.findByIndex(0)

    currentQuestionView = currentSubtest.questionViews[currentSubtest.questionIndex]

    # show errors before doing anything if there are any
    return currentSubtest.showErrors(currentQuestionView) unless currentSubtest.isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in currentSubtest.questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e < currentSubtest.questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = currentSubtest.questionIndex
    else
      plannedIndex = Math.max.apply(plannedIndex, isAvailable)

    if currentSubtest.questionIndex != plannedIndex
      currentSubtest.questionIndex = plannedIndex
      currentSubtest.updateQuestionVisibility()
      currentSubtest.updateProgressButtons()

  #
  # Trigger methods that should probably should not be used, trigger directly instead.
  #

  triggerSaved: ->
    console.log("Reslt has been saved to internal PouchDB.")
    @trigger "result:saved"

  triggerAnother: ->
    console.log("User wishes to do another Assessment.")
    @trigger "result:another"

  # @todo Documentation
  flagRender: (object) ->
    @rendered[object] = true

    if @rendered.assessment && @rendered.subtest
      @trigger "rendered"

  #
  # Helper methods for working with Grid Subtest.
  #

  # @todo Documentation
  getGridScore: ->
    link = @model.get("subtest").gridLinkId || ""
    if link == "" then return
    grid = @model.subtests.get @model.get("subtest").gridLinkId
    gridScore = @result.getGridScore grid.id
    gridScore

  # @todo Documentation
  gridWasAutostopped: ->
    link = @model.get("subtest").gridLinkId || ""
    if link == "" then return
    grid = @model.subtests.get @model.get("subtest").gridLinkId
    gridWasAutostopped = @result.gridWasAutostopped grid.id

  #
  # Helper methods for working with Results.
  #

  # @todo Documentation
  saveResult: ( currentView, increment ) ->

    subtestResult = currentView.getResult()
    subtestId = currentView.model.id
    prototype = currentView.model.get "prototype"
    subtestReplace = null

    for result, i in @result.get('subtestData')
      if subtestId == result.subtestId
        subtestReplace = i

    if subtestReplace != null
      if typeof currentView.getSum != 'function'
        getSum = {correct:0,incorrect:0,missing:0,total:0}

      # Don't update the gps subtest.
      if prototype != 'gps'
        @result.insert
          name        : currentView.model.get "name"
          data        : subtestResult.body
          subtestHash : subtestResult.meta.hash
          subtestId   : currentView.model.id
          prototype   : currentView.model.get "prototype"
          sum         : getSum
      @reset increment

    else
      @result.add
        name        : currentView.model.get "name"
        data        : subtestResult.body
        subtestHash : subtestResult.meta.hash
        subtestId   : currentView.model.id
        prototype   : currentView.model.get "prototype"
        sum         : getSum
      ,
        success : =>
          @reset increment

  # @todo Documentation
  getSum: ->
    if Tangerine.progress.currentSubview.getSum?
      return Tangerine.progress.currentSubview.getSum()
    else
      # maybe a better fallback
      return {correct:0,incorrect:0,missing:0,total:0}
