class WorkflowRunView extends Backbone.View
  
  events:
    "click .previous" : "previousStep"
    "click .next"     : "nextStep"

  switch: =>
    @$el.toggle()
    @$lessonContainer.toggle()

  initialize: (options) ->
    @[key] = value for key, value of options
    
    # Set up the trip.
    if (!options.hasOwnProperty('trip'))
      @trip = new Trip()
      @trip.set('startTime', (Date.now()).toString())
    @trip.set('workflowId', @workflow.id)
    @trip.set('userId', Tangerine.user.id)
    @trip.save()
    # TODO: Legacy.
    @tripId = @trip.id

    # Start our index and set our current step.
    @index = 0 unless @index?
    @steps = [] unless @steps?
    @currentStep = @workflow.stepModelByIndex @index

    # TODO: Legacy.
    @subViewRendered = false

    # When a step is shown, set listener for when it is done so we can
    # save the result and go to the next step.
    @on 'step:show', =>
      @steps[@index].view.on "assessment:complete", =>
        @trigger "step:complete"

    # When a step is complete, save the result and figure out what to do next.
    @on 'step:complete', =>
      if @steps[@index].model.get('type') == 'assessment' || @steps[@index].model.get('type') == 'curriculum'
        result = @steps[@index].view.result
        result.set 'tripId', @tripId
        result.set 'workflowId', @workflow.id
        result.save()
        # If there was a Location Subtest in this 
        result.attributes.subtestData.forEach (subtestData) =>
          if subtestData.prototype == 'location'
            @trip.set('locationData', subtestData.data)
            @trip.save()

      # If we don't have another step to go to, end.
      if (@index + 1) == @workflow.getLength()
        @renderEnd()
        return @trigger "workflow:done"
      # If we are about to be on the last step and the last step is a message, we are done.
      if (@index + 2) == @workflow.getLength() && @workflow.collection.models[@index + 1].get('type') == 'message' 
        @trigger "workflow:done"
      @nextStep()

    # When a workflow is done, clean up shop.
    @on 'workflow:done', =>
      @trip.set('endTime', (Date.now()).toString())
      @validateTrip()
      @trip.save()


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

    if @currentStep.getShowLesson()
      
      subject      = @getVariable("subject")
      motherTongue = @getVariable("subject_mother_tongue")

      subject = ({"word": "kiswahili", "english_word" : "english", "operation" : "maths","3":"3"})[subject]
      grade   = @getVariable("class")
      week    = @getVariable("lesson_week")
      day     = @getVariable("lesson_day")

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

      if subject is "3"
        lessonImage.src = "/#{Tangerine.db_name}/_design/assets/lessons/#{motherTongue}_w#{week}_d#{day}.png"
      else
        lessonImage.src = "/#{Tangerine.db_name}/_design/assets/lessons/#{subject}_c#{grade}_w#{week}_d#{day}.png"

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

  validateTrip: ->
    tripValidation = @workflow.get('tripValidation')
    # Start with valid being true, then prove us wrong.
    valid = true
    if tripValidation != undefined && tripValidation.enabled == true
      if tripValidation.constraints.duration?
          minutes = (@trip.get('endTime') - @trip.get('startTime')) / 1000 / 60
          if minutes < tripValidation.constraints.duration.minutes
            valid = false
      if tripValidation.constraints.timeOfDay?
        tripTime = moment(parseInt(@trip.get('startTime')))
        tripTime.zone(Tangerine.settings.get("timeZone")) if Tangerine.settings.get("timeZone")?
        if tripTime.hours() < tripValidation.constraints.timeOfDay.startTime.hour or tripTime.hours() > tripValidation.constraints.timeOfDay.endTime.hour
          valid = false
    @trip.set('valid', valid)
