#
# AssessmentCompositeView
#
# AssessmentCompositeView on render displays a Subtest View one at a time according
# to what the current @index state is and what is in @assessment.subtests.
# @getChildViewClass method is used to determine what Class of View to instantiate
# for the given Subtest Model.
# creating a View for each Subtest renders every time a new subtest is shown. When next
# or back is clicked, the step(incrementToMoveToSubtestReferencedByViewIndex) method is
# eventually called which calls render.
#
# Options:
#   assessment (required) - An Assessment Model
#   result: (optional) - A Result model to pick up where you left off.
#
# Events:
#   assessment:complete - Triggers when all Subtests have completed.
#   assessment:step - Triggers when a new Subtest View is displayed.
#   nextQuestionRendered - Triggers when a new Question has been rendered.
#

AssessmentCompositeView = Backbone.Marionette.CompositeView.extend

  #
  # Initialize
  #

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
  # Handle Rendering.
  #

  i18n: ->
    @text =
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")
      "previousQuestion" : t("SurveyRunView.button.previous_question")
      "nextQuestion" : t("SurveyRunView.button.next_question")

  events:
    'click .subtest-next' : 'next'
    'click .subtest-back' : 'back'
    'click .subtest_help' : 'toggleHelp'
    'click .skip'         : 'skip'
    'click .next_question' : 'nextQuestion'
    'click .prev_question' : 'prevQuestion'
    'nextQuestionRendered': 'nextQuestionRenderedBoom'

  render:->
    console.log('AssessmentCompositeView.onBeforeRender')

    #
    # Prepare @currentChildModel
    #

    # Depending on the @index, set appropriate child model. In most cases this
    # will be a subtest model, except for when there are no more subtests, then
    # set it to be the result model.
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

    #
    # Prepare @currentChildView
    #

    childViewClass = @getChildViewClass(@currentChildModel)
    @currentChildView = new childViewClass({model: @currentChildModel})
    @currentChildView.on 'skip', =>
      console.log 'AssessmentCompositeView detected skip'
      @skip()


    #
    # Set Globals to be accessed in Subtest Display Logic.
    #

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


  #
  # Method for deciding what Subtest View Class to use.
  #

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


  #
  # Methods for handling flow of Subtests: step, next, back, abort, and skip
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
  # Helper method for working with Results.
  #

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












  #
  # Poorly understood and potentially removeable methods and documentation.
  #

  # Listens for "result:saved" and "result:another" events triggered by the ResultItemView subtest and makes it
  # available for consumption (via triggerSaved and triggerAnother) by external users such as Widget.

  onClose: ->
    for view in @subtestViews
      view.close()
    @result.clear()
    Tangerine.nav.setStudent ""

  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)

  displaySkip: (skippable)->
    if skippable
      $( ".skip" ).show();
    else
      $( ".skip" ).hide();

  displayBack: (backable)->
    if backable
      $( ".subtest-back" ).removeClass("hidden");
    else
      $( ".subtest-back" ).addClass("hidden");

  subTestRenderCollection:->
    console.log("onRenderCollection")
    currentSubtest = @children.findByIndex(0)
    focusMode = currentSubtest.model.getBoolean("focusMode")
    if focusMode
      currentSubtest.updateQuestionVisibility()
      currentSubtest.updateProgressButtons()

  childEvents:
    'render:collection': 'addChildPostRender'

  # This is simply used to alert the test it('Should contain a next question button') that the page has finished rendering.
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

  getGridScore: ->
    link = @currentChildModel.get('gridLinkId') || ""
    if link == "" then return
    grid = @model.subtests.get @currentChildModel.get('gridLinkId')
    gridScore = @result.getGridScore grid.id
    gridScore

  gridWasAutostopped: ->
    link = @currentChildModel.get('gridLinkId') || ""
    if link == "" then return
    grid = @assessment.subtests.get @currentChildModel.get('gridLinkId')
    gridWasAutostopped = @result.gridWasAutostopped grid.id

  getSum: ->
    if Tangerine.progress.currentSubview.getSum?
      return Tangerine.progress.currentSubview.getSum()
    else
      return {correct:0,incorrect:0,missing:0,total:0}
