class WorkflowRunView extends Backbone.View
  
  # TODO: Is previousStep ever used? 
  events:
    "click .previous" : "previousStep"
    "click .next"     : "_onStepComplete"

  initialize: (options) ->
    @on 'step:show', @_onStepShow
    @on 'step:complete', @_onStepComplete
    @on 'workflow:done', @_onWorkflowDone

    @[key] = value for key, value of options
    
    # Set up the Trip.
    if (!options.hasOwnProperty('trip'))
      @trip = new Trip({workflow: @workflow, user: Tangerine.user})
    else
      @trip = options.trip

    # Start our index and set our current step.
    @index = 0 unless @index?
    @steps = [] unless @steps?

    # TODO: Legacy we can refactor away.
    @currentStep = @workflow.stepModelByIndex @index
    @tripId = @trip.id
    @subViewRendered = false

  _onStepShow: =>
    # Some steps emit step:complete, but Assessments and Curriculum just emit assessment:complete. This translates assessment:complete to step:complete.
    @steps[@index].view.on "assessment:complete", =>
      @trigger "step:complete"

  _onStepComplete: =>
    # When a step is complete, mark it as complete in the Trip and figure out what to do next.
    @trip.markStepComplete(@steps[@index])
    # If we don't have another step to go to, render a nice default end message, emit done, and return.
    if (@index + 1) == @workflow.getLength()
      @renderEnd()
      @trigger "workflow:done"
      return
    # If we were just on the step before last and the last step is a message, emit done.
    else if (@index + 2) == @workflow.getLength() && @workflow.collection.models[@index + 1].get('type') == 'message' 
      @trigger "workflow:done"
      @nextStep()
    else
      # No need to exit at this point, let's move to the next Step.
      @nextStep()

  _onWorkflowDone: =>
    @trip.markTripComplete()
    @trip.save()

  switch: =>
    @$el.toggle()
    @$lessonContainer.toggle()

  shouldSkip: ->
    currentStep = @workflow.stepModelByIndex @index
    return false unless currentStep?
    skipLogicCode = currentStep.getString("skipLogic-cooked")
    unless _(skipLogicCode).isEmptyString()

      try
        shouldSkip = eval(skipLogicCode)
      catch e
        Utils.sticky "Workflow skip logic error<br>#{e.message}"

      return shouldSkip

    return false

  render: ->
    if @shouldSkip()
      @subViewRendered = true
      return @nextStep()
 
    # Set next step.
    @steps[@index] = {} unless @steps[@index]?
    @currentStep = @workflow.stepModelByIndex @index
    @currentStep.workflow = @
    @steps[@index].model = @currentStep
    console.log('step set')

    stepIndicator = "<div id='workflow-progress'></div>"
    
    if @currentStep.getType() == "message" && @index != @workflow.getChildren().length - 1
      nextButton = "
        <div class='clearfix'><button class='nav-button next'>Next</button></div>
      "
    else
      nextButton = ""
  
    @$el.html "
      #{stepIndicator}
      <div id='header-container'></div>
      <div id='#{@cid}_current_step' class='workflow-step-container'></div>
      <!--button class='nav-button previous'>Previous</button-->
      #{nextButton || ''}
    "

    @renderStep()
    @checkIncompletes()

    @$el.find('#workflow-progress').progressbar value : ( (@index+1) / (@workflow.getLength()+1) * 100 )

    @trigger "rendered"
    

  afterRender: =>
    subView?.afterRender?()

  onSubViewDone: =>
    @subViewDone = true
    @nextStep()

  nextStep: =>
    ###
    # RJ: Commenting this out because it looks like this View depends on children
    # Views to modify their parent in ways we can't expect them to.
    itExists        = @subView?
    itIsRendered    = @subViewRendered
    itIsntDone      = not @subViewDone
    itsAnAssessment = @currentStep.getType() is "assessment"
    itsACurriculum  = @currentStep.getType() is "curriculum"
    itsANewObject   = @currentStep.getType() is "new"

    return false if !itIsRendered
    return @subView.next() if itExists and itIsntDone and itsAnAssessment
    return @subView.save() if itExists and itIsntDone and itsANewObject
    ###

    @subViewRendered = false
    @subViewDone = false
    @subView?.remove?()
    @subView?.unbind?()

    @subView = null

    oldIndex = @index

    # intentionally lets you go one over
    # handled with "if currentStep is null"
    @index = Math.min @index + 1, @workflow.getLength()

    # RJ: Also commented out for reasons stated above.
    #@render() if oldIndex isnt @index
    @render()

    @checkIncompletes()


  checkIncompletes: ->
    return if @checkingIncompletes is true

    # if the workflow is complete, then remove it, if possible, from resumables
    if @workflow.stepModelByIndex(@index).getName() is "Complete"
      @checkingIncompletes = true
      incomplete = Tangerine.user.getPreferences("tutor-workflows", "incomplete") || {}
      incomplete[@workflow.id] = _(incomplete[@workflow.id]).without @tripId
      Tangerine.user.setPreferences "tutor-workflows",
        "incomplete",
        incomplete, =>
          @checkingIncompletes = false


  previousStep: ->
    oldIndex = @index
    @index = Math.max( @index - 1, 0 )
    @render() if oldIndex isnt @index

  getNumber: ( key ) -> parseInt @getVariable key
  getString: ( key ) -> @getVariable key

  getVariable: ( key ) ->
    for step in @steps
      if step?.result?
        result = step.result.getVariable(key)
      if result?
        return result

  renderStep: =>
    
    if @index == @workflow.getLength()-1
      Tangerine.activity = ""
      @$el.find(".next").hide()

    return if @index == @workflow.getLength()

    switch @currentStep.getType()
      when "new"        then @renderNew()
      when "assessment" then @renderAssessment()
      when "curriculum" then @renderAssessment()
      when "message"    then @renderMessage()
      when "login"
        @$el.find("##{@cid}_current_step").html "
          <h1>Login - #{@currentStep.get('userType')}</h1>
        "
      else
        @$el.find("##{@cid}_current_step").html "
          <h1>#{@currentStep.name()} - #{@currentStep.getType()}</h1>
        "

    mediaOverlayFileScript = @workflow.get('mediaOverlayFile')
    if @currentStep.getShowLesson() and mediaOverlayFileScript?

      $content = $("#content")

      unless $content.find("#display-switch").length > 0
        $content.append("<img src='images/icon_switch.png' id='display-switch'>")
        @$button = $content.find("#display-switch")
        @$button.on "click", @switch

      $content.append("<div id='lesson-container' style='display:none;'></div>")

      @$lessonContainer = $content.find("#lesson-container")

      lessonImage = new Image
      $(lessonImage).on "load",
        (event) =>
          if lessonImage.height is 0
            @$lessonContainer?.remove?()
            @$button?.remove?()
          else
            @$lessonContainer.append(lessonImage)

      
      mediaOverlayFile = (CoffeeScript.eval.apply(@, [mediaOverlayFileScript]))
      lessonImage.src = "media_assets/#{Tangerine.settings.get('groupName')}/#{mediaOverlayFile}"

    else
      @lessonContainer?.remove?()
      @$button?.remove()

  renderMessage: ->
    @nextButton true

    coffeeMessage = @currentStep.getCoffeeMessage()
    jsMessage = CoffeeScript.compile.apply(@, ["return \"#{coffeeMessage}\""])

    htmlMessage = eval(jsMessage)

    @$el.find("##{@cid}_current_step").html htmlMessage
    @subViewRendered = true

  renderNew: ->
    @nextButton true

    view = @currentStep.getView
      workflowId : @workflow.id
      tripId     : @tripId

    @steps[@index].view   = view
    @steps[@index].result = view.getResult()

    @showView view

  renderAssessment: ->
    @nextButton true
    @currentStep.fetch
      success: =>
        view = new AssessmentCompositeView
          assessment : @currentStep.model
          inWorkflow : true
          tripId     : @tripId
          workflowId : @workflow.id
        if @assessmentResumeIndex?
          view.index = @assessmentResumeIndex
          delete @assessmentResumeIndex
        @steps[@index].view   = view
        # @steps[@index].result = view.getResult()
        @steps[@index].result = view.result
        @showView view

  renderEnd: ->
    Utils.gpsPing
    @$el.html "
      <p>You have completed this Workflow.</p>
    "
    if @workflow.get('feedbackEnabled') 
      @$el.append "
        <button class='nav-button'><a href='#feedback/#{@workflow.id}'>Go to feedback</a></button>
      "
    @$el.append "
      <button class='nav-button'><a href='#'>Main</a></button>
    "
    return

  nextButton: ( appropriate ) ->
    if appropriate
      @$el.find("button.next").show()
    else
      @$el.find("button.next").hide()
      


  onClose: ->
    @lessonContainer?.remove?()
    @$button?.remove?()

  showView: (subView, header = '') ->
    @trigger 'step:show'
    header = "<h1>#{header}</h1>" if header isnt ''
    @subView = subView
    @$el.find("#header-container").html header
    @subView.setElement @$el.find("##{@cid}_current_step")
    @listenTo @subView, "subViewDone save", @onSubViewDone
    @listenTo @subView, "rendered", =>
      @subViewRendered = true
      @trigger "rendered"
      #@afterRender()
    @subView.render()
