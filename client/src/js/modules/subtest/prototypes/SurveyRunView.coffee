class SurveyRunView extends Backbone.View

  className: "SurveyRunView"

  events:
    'click .next_question' : 'nextQuestion'
    'click .prev_question' : 'prevQuestion'

  avNext: =>
    qv = @questionViews[@currentQuestion]
    return @showErrors(qv) unless @isValid([qv])

    console.log("avNext:"+ @currentQuestion)
    qv.$el.find('.av-question').css('display', 'none')
    @currentQuestion++
    if @questionViews.length is @currentQuestion
      return @parent.next()
    qv = @questionViews[@currentQuestion]
    #if @questionViews.length - 1 is @currentQuestion
    #  qv.$el.find('.av-question').css('position', 'relative')

    qv.startAv()
    @updateQuestionProgress()

  updateQuestionProgress: ->
    qv = @questionViews[@currentQuestion]
    console.log("updateQuestionProgress @currentQuestion: " + @currentQuestion)
    qv.setProgress(@currentQuestion+1, @questionViews.length)

  avPrev: =>
    return if @currentQuestion == 0
    qv = @questionViews[@currentQuestion]
    return @showErrors(qv) unless @isValid([qv])

    qv.$el.find('.av-question').css('display', 'none')
    @currentQuestion--
    qv = @questionViews[@currentQuestion]

    qv.$el.find('.av-question').css('display', 'block')
    @updateQuestionProgress()

  nextQuestion: ->

    currentQuestionView = @questionViews[@questionIndex]

    # show errors before doing anything if there are any
    return @showErrors(currentQuestionView) unless @isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in @questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e > @questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = @questionIndex
    else
      plannedIndex = Math.min.apply(plannedIndex, isAvailable)

    if @questionIndex != plannedIndex
      @questionIndex = plannedIndex
      @updateQuestionVisibility()
      @updateProgressButtons()

  prevQuestion: ->

    currentQuestionView = @questionViews[@questionIndex]

    # show errors before doing anything if there are any
    return @showErrors(currentQuestionView) unless @isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in @questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e < @questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = @questionIndex
    else
      plannedIndex = Math.max.apply(plannedIndex, isAvailable)

    if @questionIndex != plannedIndex
      @questionIndex = plannedIndex
      @updateQuestionVisibility()
      @updateProgressButtons()

  updateProgressButtons: ->

    isAvailable = []
    for qv, i in @questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable.push @questionIndex

    $prev = @$el.find(".prev_question")
    $next = @$el.find(".next_question")

    minimum = Math.min.apply( minimum, isAvailable )
    maximum = Math.max.apply( maximum, isAvailable )

    if @questionIndex == minimum
      $prev.hide()
    else
      $prev.show()

    if @questionIndex == maximum
      $next.hide()
    else
      $next.show()

  updateExecuteReady: (ready) =>

    @executeReady = ready

    return if not @triggerShowList?

    if @triggerShowList.length > 0
      for index in @triggerShowList
        @questionViews[index]?.trigger "show"
      @triggerShowList = []

    @updateSkipLogic() if @executeReady


  updateQuestionVisibility: ->

    return unless @model.get("focusMode")

    if @questionIndex == @questionViews.length
      @$el.find("#summary_container").html "
        last page here
      "
      @$el.find("#next_question").hide()
    else
      @$el.find("#summary_container").empty()
      @$el.find("#next_question").show()

    $questions = @$el.find(".question")
    $questions.hide()
    $questions.eq(@questionIndex).show()

    # trigger the question to run it's display code if the subtest's displaycode has already ran
    # if not, add it to a list to run later.
    if @executeReady
      @questionViews[@questionIndex].trigger "show"
    else
      @triggerShowList = [] if not @triggerShowList
      @triggerShowList.push @questionIndex

  showQuestion: (index) ->
    @questionIndex = index if _.isNumber(index) && index < @questionViews.length && index > 0
    @updateQuestionVisibility()
    @updateProgressButtons()

  i18n: ->
    @text =
      pleaseAnswer : t("SurveyRunView.message.please_answer")
      correctErrors : t("SurveyRunView.message.correct_errors")
      notEnough : _(t("SurveyRunView.message.not_enough")).escape()

      previousQuestion : t("SurveyRunView.button.previous_question")
      nextQuestion : t("SurveyRunView.button.next_question")



  initialize: (options) ->

    @model         = options.model
    @parent        = options.parent
    @dataEntry     = options.dataEntry
    @isObservation = options.isObservation
    @focusMode     = @model.getBoolean("focusMode")
    @questionIndex = 0 if @focusMode
    @questionViews = []
    @answered      = []
    @renderCount   = 0

    @i18n()

    # used by av questions
    @inputAudio = @model.getObject('inputAudio', false)
    if @inputAudio
      @audio = new Audio("data:#{@inputAudio.type};base64,#{@inputAudio.data}")


    @questions     = new Questions()
    # @questions.db.view = "questionsBySubtestId" Bring this back when prototypes make sense again
    @questions.fetch
      viewOptions:
        key: "question-#{@model.id}"
      success: (collection) =>
        @questions.sort()
        if @questions.first().get("type") is "av"
          @avMode = true
          $(window).on 'resize', @handleResize
        @ready = true
        @render()

  handleResize: =>
    @questionViews.forEach (qv)-> qv.render()

    qv = @questionViews[@currentQuestion]
    @updateQuestionProgress()
    qv.$el.find('.av-question').css 'display': 'block'
    qv.resizeAvImages()
    qv.highlightPrevious()

  # when a question is answered
  onQuestionAnswer: (element) =>

    return unless @renderCount == @questions.length

    # auto stop after limit
    @autostopped    = false
    autostopLimit   = @model.getNumber "autostopLimit"
    longestSequence = 0
    autostopCount   = 0

    if autostopLimit > 0
      for i in [1..@questionViews.length] # just in case they can't count
        currentAnswer = @questionViews[i-1].answer
        if currentAnswer == "0" or currentAnswer == "9"
          autostopCount++
        else
          autostopCount = 0
        longestSequence = Math.max(longestSequence, autostopCount)
        # if the value is set, we've got a threshold exceeding run, and it's not already autostopped
        if autostopLimit != 0 && longestSequence >= autostopLimit && not @autostopped
          @autostopped = true
          @autostopIndex = i
    @updateAutostop()
    @updateSkipLogic()

  updateAutostop: ->
    autostopLimit = @model.getNumber "autostopLimit"
    @questionViews.forEach (view, i) ->
      if i > (@autostopIndex - 1)
        if @autostopped
          view.isAutostopped = true
          view.$el.addClass    "disabled_autostop"
        else
          view.isAutostopped = false
          view.$el.removeClass "disabled_autostop"
    , @

  updateSkipLogic: =>
    @questionViews.forEach (qv) ->
      question = qv.model
      skipLogicCode = question.getString "skipLogic"
      unless skipLogicCode is ""
        try
          result = CoffeeScript.eval.apply(@, [skipLogicCode])
        catch error
          name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
          message = error.message
          alert "Skip logic error in question #{question.get('name')}\n\n#{name}\n\n#{message}"

        if result
          qv.$el.addClass "disabled_skipped"
          qv.isSkipped = true
        else
          qv.$el.removeClass "disabled_skipped"
          qv.isSkipped = false
      qv.updateValidity()
    , @

  isValid: (views = @questionViews) ->
    return true if not views? # if there's nothing to check, it must be good
    views = [views] if not _.isArray(views)
    for qv, i in views 
      qv.updateValidity()
      # can we skip it?
      if not qv.model.getBoolean("skippable")
        # is it valid
        if not qv.isValid
          # red alert!!
          return false

    return true


  # @TODO this should probably be returning multiple, single type hash values
  getSkipped: ->
    result = {}
    @questionViews.forEach (qv, i) ->
      result[@questions.models[i].get("name")] = 'skipped'
    , @
    return result

  addAvResult: (result, qv) ->

    name = qv.model.get('name')
    result["#{name}_response_time"] = qv.responseTime || null
    result["#{name}_display_time"] = qv.displayTime
    if qv.forcedTime?
      result["#{name}_forced_time"] = qv.forcedTime


  getResult: =>
    result = {}
    @questionViews.forEach (qv, i) ->
      result[@questions.models[i].get("name")] =
        if qv.notAsked # because of grid score
          qv.notAskedResult
        else if not _.isEmpty(qv.answer) # use answer
          qv.answer
        else if qv.skipped
          qv.skippedResult
        else if qv.isSkipped
          qv.logicSkippedResult
        else if qv.isAutostopped
          qv.notAskedAutostopResult
        else
          qv.answer
    , @
    return result

  showErrors: (views = @questionViews) ->
    @$el.find('.message').remove()
    first = true
    views = [views] if not _.isArray(views)
    views.forEach (qv, i) ->
      if not _.isString(qv)
        message = ""
        if not qv.isValid

          # handle custom validation error messages
          customMessage = qv.model.get("customValidationMessage")
          if not _.isEmpty(customMessage)
            message = customMessage
          else
            message = @text.pleaseAnswer

          if first == true && qv.model.get('type') isnt 'av'
            @showQuestion(i) if views == @questionViews
            qv.$el.scrollTo()
            Utils.midAlert @text.correctErrors
            first = false
        qv.setMessage message
    , @

  render: ->
    return unless @ready
    @$el.empty()

    container = document.createDocumentFragment()

    unless @dataEntry
      previous = @parent.parent.result.getByHash(@model.get('hash'))

    notAskedCount = 0

    @questions.sort()
    if @questions.models?
      @questions.models.forEach (question, i) ->
        # skip the rest if score not high enough

        required = question.getNumber "linkedGridScore"

        isNotAsked = ( ( required != 0 && @parent.getGridScore() < required ) || @parent.gridWasAutostopped() ) && @parent.getGridScore() != false

        if isNotAsked then notAskedCount++

        name   = question.escape("name").replace /[^A-Za-z0-9_]/g, "-"
        answer = previous[name] if previous

        oneView = new QuestionRunView
          model         : question
          parent        : @
          dataEntry     : @dataEntry
          notAsked      : isNotAsked
          isObservation : @isObservation
          answer        : answer

        @listenTo oneView, "rendered",      @onQuestionRendered
        @listenTo oneView, "answer scroll", @onQuestionAnswer
        @listenTo oneView, "av-next",       @avNext
        @listenTo oneView, "av-prev",       @avPrev
        @listenTo oneView, 'abort',         => @abort()

        @questionViews[i] = oneView
        container.appendChild oneView.el
      , @

      @questionViews.forEach (questionView) -> questionView.render()

      if @focusMode
        @updateQuestionVisibility()
        container.appendChild $ "
          <div id='summary_container'></div>
          <button class='navigation prev_question'>#{@text.previousQuestion}</button>
          <button class='navigation next_question'>#{@text.nextQuestion}</button>
        "
        @updateProgressButtons()

    if @questions.length == notAskedCount
      if Tangerine.settings.get("context") != "class"
        @parent.next?()
      else
        container.appendChild $ "<p class='grey'>#{@text.notEnough}</p>"

    @$el.append container
    @trigger "rendered"

  abort: ->
    @trigger 'abort'

  onQuestionRendered: =>
    @renderCount++
    if @renderCount == @questions.length
      @trigger "ready"
      @updateSkipLogic()
      @avStart() if @avMode
    @trigger "subRendered"

  avStart: ->
    start = =>
      @currentQuestion = 0
      @questionViews[@currentQuestion].startAv()
      @updateQuestionProgress()

    if @model.getString('studentDialog') isnt ''
      Utils.sticky @model.get('studentDialog'), "Ok", start
    else
      start()

  onClose:->
    for qv in @questionViews
      qv.close?()
    @questionViews = []
