class ObservationPrintView extends Backbone.View

  className: "ObservationPrintView"

  events:
    "click .start_time" : "startObservations"
    "click .stop_time"  : "stopObservations"
    "click .done" : "completeObservation"

  initialize: (options) ->

    @model  = @options.model
    @parent = @options.parent



  initializeSurvey: ->
    @onClose() if @survey? # if we're REinitializing close the old views first
    
    attributes = $.extend(@model.get('surveyAttributes'), { "_id" : @model.id })

    # 1-indexed array, convenient because the 0th observation doesn't take place, but the nth does.
    # makes an array of identical models based on the above attributes
    models = (new Backbone.Model attributes for i in [1..parseInt(@model.get('totalSeconds')/@model.get('intervalLength'))])
    models.unshift("")
    
    @skippableView = new SurveyRunView
      "model"         : models[1]
      "parent"        : @
      "isObservation" : true

    
    @survey =
      "models"    : models
      "results"   : []

  initializeFlags: ->
    @iAm =
      "counting" : false
      "recording" : false
    @iHavent =
      "warned" : true
    @iHave =
      "runOnce" : false
      "finished" : false
    @my =
      "time" :
        "start"   : 0
        "elapsed" : 0
      "observation" :
        "index"     : 0
        "oldIndex"  : 0
        "completed" : 0
        "total"     : parseInt( @model.get('totalSeconds') / @model.get('intervalLength') )


  startObservations: ->
    # don't respond for these reasons
    if @iAm.counting || @iHave.runOnce then return

    @$el.find(".stop_button_wrapper, .next_display, .completed_display").removeClass("confirmation")
    @$el.find(".start_button_wrapper").addClass("confirmation")
    @timerInterval   = setInterval @tick, 1000
    @iAm.counting    = true
    @my.time.start   = @getTime()
    @my.time.elapsed = 0

  stopObservations: (e) ->
    clearInterval @timerInterval
    fromClick = e?
    isntPrematureStop = ! e?
    if e? 
      @trigger "showNext"

    if isntPrematureStop && not @iHave.finished
      if @iAm.recording
        @resetObservationFlags()
        @saveCurrentSurvey()
      @my.observation.index++
      @renderSurvey()
    else
      @$el.find(".stop_button_wrapper").addClass("confirmation")
      Utils.midAlert "Observations finished"
    @$el.find(".next_display").addClass("confirmation")
    @iHave.finished = true
    @iHave.runOnce = true
    

  # runs every second the timer is running
  tick: =>
    @my.time.elapsed = @getTime() - @my.time.start
    @checkIfOver()
    @updateObservationIndex()
    @updateProgressDisplay()
    @checkSurveyDisplay()
    @checkObservationPace()
    @checkWarning()

  checkObservationPace: =>
    # if we're still entering observations and it's time for the next one
    if @iAm.recording && @my.observation.completed < (@my.observation.index-1) && @my.observation.index != 0 # starts at 0, then goes to 1
      @iHave.forcedProgression = true
      @resetObservationFlags()
      @saveCurrentSurvey()
      @renderSurvey()

  checkWarning: =>
    projectedIndex = Math.floor( (@my.time.elapsed + @warningSeconds) / @model.get('intervalLength') )
    iShouldWarn = @my.observation.index < projectedIndex && ! @iHave.finished
    # if we're still entering observations, warn the user
    if @iAm.recording && @iHavent.warned && iShouldWarn && @my.observation.index != 0 # first one doesn't count
      Utils.midAlert "Observation ending soon"
      @iHavent.warned = false
  
  gridWasAutostopped: ->
    return false

  checkIfOver: =>
    if @my.time.elapsed >= @model.get("totalSeconds")
      @stopObservations()

  checkSurveyDisplay: =>
    # change, needs to display new survey
    if @my.observation.oldIndex != @my.observation.index && !@iHave.finished && !@iAm.recording
      @renderSurvey()
      @my.observation.oldIndex = @my.observation.index

  updateObservationIndex: =>
    @my.observation.index = Math.floor( ( @my.time.elapsed ) / @model.get('intervalLength') )
    if @my.observation.index > @survey.models.length - 1
      @my.observation.index = @survey.models.length - 1

  updateProgressDisplay: ->
    # backbone.js, y u no have data bindings? abstract more
    @$el.find(".current_observation").html @my.observation.index
    @$el.find(".completed_count").html     @my.observation.completed

    timeTillNext = Math.max(((@my.observation.index + 1) * @model.get('intervalLength')) - @my.time.elapsed, 0)
    @$el.find(".time_till_next").html timeTillNext

    if not @iAm.recording && not @iHave.finished
      @$el.find(".next_display, .completed_display").removeClass "confirmation" 

  resetObservationFlags: ->
    @iAm.recording  = false
    @iHavent.warned = true

  getTime: -> parseInt( ( new Date() ).getTime() / 1000 )

  completeObservation: (option) ->

    if @survey.view.isValid()
      @saveCurrentSurvey()
      @trigger "showNext" if @iHave.finished
    else
      @survey.view.showErrors()

    @tick() # update displays




  saveCurrentSurvey: =>
    @resetObservationFlags()
    @my.observation.completed++
    @survey.results.push
      observationNumber : @survey.view.index # view's index
      data              : @survey.view.getResult()
      saveTime          : @my.time.elapsed
    @survey.view.close()
    @$el.find(".done").remove()


  render: ->
    return if @format is "stimuli"

    @trigger "hideNext"
    totalSeconds = @model.get("totalSeconds")

    @$el.html "
      <div class='timer_wrapper'>
        <div class='progress clearfix'>
          <span class='completed_display confirmation'>Completed <div class='info_box completed_count'>#{@my.observation.completed}</div></span>
          <span class='next_display confirmation'>Next observation <div class='info_box time_till_next'>#{@model.get('intervalLength')}</div></span>
        </div>
        <div>
          <div class='start_button_wrapper'><button class='start_time command'>Start</button></div>
          <div class='stop_button_wrapper confirmation'><button class='stop_time command'>Abort <i>all</i> observations</button></div>
        </div>
      </div>
      <div id='current_survey'></div>
    "

    @trigger "rendered"

  renderSurvey: (e) ->
    if not @iAm.counting then return
    @iAm.recording = true
    
    @survey.view  = new SurveyRunView
      "model"         : @survey.models[@my.observation.index]
      "parent"        : @
      "isObservation" : true
    @survey.view.index = do => @my.observation.index # add an index for reference

    # listen for render events, pass them up
    @survey.view.on "rendered subRendered", => @trigger "subRendered"

    @survey.view.render()

    @$el.find("#current_survey").html("<span class='observation_display confirmation'>Observation <div class='info_box current_observation'>#{@my.observation.index}</div></span>")
    @$el.find("#current_survey").append @survey.view.el
    @$el.find("#current_survey").append "<button class='command done'>Done with <i>this</i> observation</button>"
    
    @$el.find("#current_survey").scrollTo 250, => 
      if @iHave.forcedProgression
        Utils.midAlert "Please continue with the next observation."
        @iHave.forcedProgression = false
      else if @iHave.finished
        Utils.midAlert "Please enter last observation"


  onClose: ->
    @survey.view?.close()
    @skippableView.close()

  getResult: ->
    {
      "surveys"               : @survey.results
      "variableName"          : @model.get("variableName")
      "totalTime"             : @model.get("totalTime")
      "intervalLength"        : @model.get("intervalTime")
      "completedObservations" : @my.observation.completed
    }

  getSum: ->
    {
      "total" : @my.observation.completed 
    }

  getSkipped: ->
    viewResult = @skippableView.getSkipped()
    skippedResults = []
    for i in [1..(@survey.models.length-1)]
      skippedResults.push
        observationNumber : i # view's index
        data              : viewResult
        saveTime          : "skipped"

    return {
      "surveys"               : skippedResults
      "variableName"          : "skipped"
      "totalTime"             : "skipped"
      "intervalLength"        : "skipped"
      "completedObservations" : "skipped"
    }

  isValid: ->
    @iHave.finished

  showErrors: ->
    @$el.find("messages").html @validator.getErrors().join(", ")

  updateNavigation: ->
    Tangerine.nav.setStudent @$el.find('#participant_id').val()
