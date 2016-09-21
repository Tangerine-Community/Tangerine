#
# AssessmentCompositeView
#
# AssessmentCompositeView renders every time a new subtest is shown. When next
# or back is clicked, the step(incrementToMoveToSubtestReferencedByViewIndex) method is
# eventually called which calls render.
#
# Listens for "result:saved" and "result:another" events triggered by the ResultItemView subtest and makes it
# available for consumption (via triggerSaved and triggerAnother) by external users such as Widget.


AssessmentCompositeView = Backbone.Marionette.CompositeView.extend

  # Initialize
  #
  # @params
  # {
  #   assessment: An Assessment Model.
  #   result: (optional) A Result model to pick up where you left off.
  # }

  initialize: (options) ->

    #
    # Set properties.
    #

    # Set @collection to an empty collection because before:render we will determine
    # which Subtest model to place in @collection.models.
    @collection = new Backbone.Collection()

    # Set @model and @assessment to the same options.assessment. @model satisfies
    # Marionette.CompositeView while @assessment satisfies code readability.
    if options.assessment
      @assessment = options.assessment
      @model = options.assessment
      # TODO: This most likely violates the separation of concerns.
      @model.parent = @

    # Set @result.
    if typeof options.result == 'undefined'
      @result = new Result
        assessmentId   : @model.id
        assessmentName : @model.get "name"
        blank          : true
    else
      @result = options.result

    #
    # Set States.
    #

    @index = if options.hasOwnProperty('result') then options.result.get('subtestData').length else 0
    @abortAssessment = false
    @enableCorrections = false  # toggled if user hits the back button.

    #
    # Initialize i18n strings.
    #

    @i18n()

    #
    # Set some globals for Skip Logic code to use.
    #
    Tangerine.tempData = {}


  #
  # Configure the View
  #

  # for Backbone.Marionette.CompositeView Composite Model
  template: JST["AssessmentView"],

  # for Backbone.Marionette.CompositeView
  childViewContainer: '#subtest_wrapper',

  # TODO: Documentation
  i18n: ->
    @text =
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")
      "previousQuestion" : t("SurveyRunView.button.previous_question")
      "nextQuestion" : t("SurveyRunView.button.next_question")

  #
  # Bind Events.
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

  #
  # Handle Rendering and Closing of the View.
  #

  # Set up before render.
  render:->
    console.log('AssessmentCompositeView.onBeforeRender')

    # Get @currentChildModel
    # Depending on the @index, set appropriate child model for the collection.
    # In most cases this will be a subtest model, except for when there are no
    # more subtests, then set it to be the result model.
    if @assessment.subtests.models[@assessment.getOrderMap()[@index]]
      @currentChildModel = @assessment.subtests.models[@assessment.getOrderMap()[@index]]
    else
      @trigger('assessment:complete')
      @currentChildModel = @result

    # TODO: This is not nice but some things require it for now.
    @currentChildModel.parent = @

    # Check to see if this subtest is related to another subtest via the gridLinkId
    # property and if the related subtest was autostopped, skip this subtest.
    parentSubtestId = @currentChildModel.get('gridLinkId')
    parentSubtestResult = false
    this.result.attributes.subtestData.forEach( (subtestResult) ->
      if subtestResult.subtestId == parentSubtestId
        parentSubtestResult = subtestResult
    )
    if parentSubtestResult isnt false and parentSubtestResult.data.auto_stop is true
      @skip()

    # Get @currentChildView
    childViewClass = @getChildViewClass(@currentChildModel)
    @currentChildView = new childViewClass({model: @currentChildModel})
    @currentChildView.on 'skip', =>
      console.log 'AssessmentCompositeView detected skip'
      @skip()

    # TODO: It looks like Skip Logic requires us to put this in a global. We should
    # look into how to localize this.
    Tangerine.progress =
      currentSubview : @currentChildView
      index: @index
    Tangerine.tempData.index = @index

    this.$el.html "
      <h1>#{@assessment.get('name')}</h1>
      <div id='progress'></div>
      <h2>#{@currentChildModel.get('name')}</h2>
      <div id='subtest_wrapper'></div>
      <div class='controlls clearfix'>
          <button class='subtest-back navigation hidden'>#{@text.back}</button>
          <button class='subtest-next navigation'>#{@text.next}</button>
          <button class='skip navigation hidden'>#{@text.skip}</button>
      </div>
      "

    # Attach and Render @currentChildView.
    subtestWrapper = this.$el.find('#subtest_wrapper')
    $(subtestWrapper).html(@currentChildView.el)
    @currentChildView.render()

    # Update the progress bar.
    @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )


  # TODO: Documentation
  onClose: ->
    for view in @subtestViews
      view.close()
    @result.clear()
    Tangerine.nav.setStudent ""

  # TODO: Documentation
  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  # TODO: Documentation
  displaySkip: (skippable)->
    if skippable
      $( ".skip" ).show();
    else
      $( ".skip" ).hide();

  # TODO: Documentation
  displayBack: (backable)->
    if backable
      $( ".subtest-back" ).removeClass("hidden");
    else
      $( ".subtest-back" ).addClass("hidden");

  #
  # Methods for handling flow of Subtests: step, abort, and skip
  #

  # Step to another Subtest.
  step: (increment) ->

    # Run validation on the current Subtest View before we move on.
    if @currentChildView.hasOwnProperty('testValid')
      valid = @currentChildView.testValid()
      if valid
        @saveResult( @currentChildView, increment )
      else
        return @currentChildView.showErrors()

    # Set the index for the next render to pick appropriate Subtest Model.
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment

    @saveResult( @currentChildView )

    # Now that we've prepared, let's render again.
    @trigger "assessment:step"
    @render()
    window.scrollTo 0, 0

  next: ->
    @step 1

  back: ->
    @step -1

  abort: ->
    @abortAssessment = true
    @step 1

  skip: ->
    @step 1


  #
  # Methods for handling Subtest Views
  #

  # for Backbone.Marionette.CollectionView
  childEvents:
    'render:collection': 'addChildPostRender'

  getChildViewClass: (model) ->
    # TODO: This is probably breaking the separation of concerns.
    model.parent = @
    # TODO: Every Subtest Model gets a Questions Collection? This doesn't seem right.
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

    return currentSubview

  # TODO: Documentation
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

  # TODO: Documentation.
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
  # Helper methods for working with Grid Subtest.
  #

  # TODO: Documentation
  getGridScore: ->
    link = @currentChildModel.get('gridLinkId') || ""
    if link == "" then return
    grid = @model.subtests.get @currentChildModel.get('gridLinkId')
    gridScore = @result.getGridScore grid.id
    gridScore

  # TODO: Documentation
  gridWasAutostopped: ->
    link = @currentChildModel.get('gridLinkId') || ""
    if link == "" then return
    grid = @assessment.subtests.get @currentChildModel.get('gridLinkId')
    gridWasAutostopped = @result.gridWasAutostopped grid.id


  #
  # Helper methods for working with Results.
  #

  # TODO: Documentation
  saveResult: ( currentView ) ->

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

    else
      @result.add
        name        : currentView.model.get "name"
        data        : subtestResult.body
        subtestHash : subtestResult.meta.hash
        subtestId   : currentView.model.id
        prototype   : currentView.model.get "prototype"
        sum         : getSum

  # TODO: Documentation
  getSum: ->
    if Tangerine.progress.currentSubview.getSum?
      return Tangerine.progress.currentSubview.getSum()
    else
      return {correct:0,incorrect:0,missing:0,total:0}
