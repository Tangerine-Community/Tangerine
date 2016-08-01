class LessonPlanRunItemView extends Backbone.Marionette.CompositeView

  template: JST["Survey"],
  childView: QuestionRunItemView,
  tagName: "p",
  className: "LessonPlanRunItemView"

  events:
    'click .next_question' : 'nextQuestion'
    'click .prev_question' : 'prevQuestion'
#    'collectionPopulated': 'collectionPopulated'
#
#  collectionPopulated: ->
#    console.log("collectionPopulated.")

  initialize: (options) ->

    @model         = options.model
    @parent        = @model.parent
    @dataEntry     = options.dataEntry
    @isObservation = options.isObservation
    @focusMode     = @model.getBoolean("focusMode")
    @questionIndex = 0 if @focusMode
    @questionViews = []
    @answered      = []
    @renderCount   = 0
    @notAskedCount = 0
    vm =
      currentView: Tangerine.progress.currentSubview
#    @childViewOptions =
#        parent: this

    @i18n()
#    this.listenTo(@model.collection,'change', this.viewRender)
#      this.listenTo(model.collection, 'reset', this.render);
#    if @model.questions.length == 0
#      console.log("No questions.")
    @collection = @model.questions
    @questions = @collection

#    @model.questions.fetch
#      viewOptions:
#        key: "question-#{@model.id}"
#      success: (collection) =>
##        @model.questions.sort()
#        collection.sort()
#        @model.collection.models = collection.models
#        @render()

    Tangerine.progress.currentSubview = @
    labels = {}
    labels.text = @text
    @model.set('labels', labels)

    @skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    @backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0
    @parent.displaySkip(@skippable)
    @parent.displayBack(@backable)

    @listenTo

  updateProgressButtons: ->

    isAvailable = []
    for qv, i in @questionViews
      if qv?
        isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable.push @questionIndex

    $prev = @parent.$el.find(".prev_question")
    $next = @parent.$el.find(".next_question")

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

  updateQuestionVisibility: ->

    return unless @model.get("focusMode")? && @model.get("focusMode") is true

    if @questionIndex == @questionViews.length
#      $("#summary_container").html "
#        last page here
#      "
      $(".next_question").hide()
    else
      $("#summary_container").empty()
      $(".next_question").show()

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
#    @updateProgressButtons()

  updateExecuteReady: (ready) ->
    @executeReady = ready

    return if not @triggerShowList?

    if @triggerShowList.length > 0
      for index in @triggerShowList
        @questionViews[index]?.trigger "show"
      @triggerShowList = []

    @updateSkipLogic() if @executeReady

  i18n: ->
    @text =
      pleaseAnswer : t("SurveyRunView.message.please_answer")
      correctErrors : t("SurveyRunView.message.correct_errors")
      notEnough : _(t("SurveyRunView.message.not_enough")).escape()

      previousQuestion : t("SurveyRunView.button.previous_question")
      nextQuestion : t("SurveyRunView.button.next_question")
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")

  # when a question is answered
  onQuestionAnswer: (element) ->
#    console.log("onQuestionAnswer @renderCount:" + @renderCount + "  @questions.length: " +  @questions.length)
#    this is not good. Should test for ==
    return unless @renderCount >= @questions.length

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

  updateSkipLogic: ->
#    console.log("updateSkipLogic")
#    console.log("@questionViews" + @questionViews.length)
    @questionViews.forEach (qv) ->
      question = qv.model
      skipLogicCode = question.getString "skipLogic"
      unless skipLogicCode is ""
        try
          result = CoffeeScript.eval.apply(@, [skipLogicCode])
#          console.log("skipLogicCode: " + skipLogicCode)
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
#          console.log("pop up an error")
          return false
#    , @
    return true

  testValid: ->
#    console.log("SurveyRinItem testValid.")
#    if not @prototypeRendered then return false
#    currentView = Tangerine.progress.currentSubview
#    if @isValid?
#    console.log("testvalid: " + @isValid?)
    return @isValid()
#    else
#      return false
#    true


  # @TODO this should probably be returning multiple, single type hash values
  getSkipped: ->
    result = {}
    @questionViews.forEach (qv, i) ->
      result[@questions.models[i].get("name")] = "skipped"
    , @
    return result

  getResult: ->
    result = {}
    @questionViews.forEach (qv, i) ->
#      result[@questions.models[i].get("name")] =
      result[qv.name] =
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
    hash = @model.get("hash") if @model.has("hash")
    subtestResult =
      'body' : result
      'meta' :
        'hash' : hash
#    return result

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

          if first == true
            @showQuestion(i) if views == @questionViews
            qv.$el.scrollTo()
            Utils.midAlert @text.correctErrors
            first = false
        qv.setMessage message
    , @


  getSum: ->
    return {correct:0,incorrect:0,missing:0,total:0}

  childEvents:
    'answer scroll': 'onQuestionAnswer'
    'answer': 'onQuestionAnswer'
    'rendered': 'onQuestionRendered'
#    'render:collection': 'renderCol'
#    'attach': 'attachChild'

  # This tests if add:child is triggered on the subtest instead of on AssessmentCompositeView.
  foo: ->
    console.log("test 123 SV child foo")

#  renderCol: ->
#    console.log("onRenderCol")
#
#  attachChild: ->
#    console.log("attachChild")
#    @trigger "childAttached"

  # populates @questionViews for this view.
  buildChildView: (child, ChildViewClass, childViewOptions) ->
    options = _.extend({model: child}, childViewOptions);
    childView = new ChildViewClass(options)
    required = child.getNumber "linkedGridScore"
    isNotAsked = ( ( required != 0 && @parent.getGridScore() < required ) || @parent.gridWasAutostopped() ) && @parent.getGridScore() != false
    child.set  "notAsked", isNotAsked
    if isNotAsked then @notAskedCount++
    Marionette.MonitorDOMRefresh(childView);
    @questionViews[childViewOptions.index] = childView

    return childView
  ,

#  Passes options to each childView instance
  childViewOptions: (model, index)->
    unless @dataEntry
      previous = @model.parent.result.getByHash(@model.get('hash'))

    name   = model.escape("name").replace /[^A-Za-z0-9_]/g, "-"
    answer = previous[name] if previous
    labels = {}
    labels.text = @text
    model.set('labels', labels)
    options =
      model         : model
      parent        : @
      dataEntry     : @dataEntry
      notAsked      : model.get "notAsked"
      isObservation : @isObservation
      answer        : answer
      index  : index
    return options

  onChildviewRender: () ->
#    console.log("childViewRendered.");
    @trigger "childViewRendered"

  onBeforeRender: ->
#    @questions.sort()

  onRender: ->

    notAskedCount = 0
    if @model.questions?
      @model.questions.models.forEach (question, i) =>
# skip the rest if score not high enough
        required = question.getNumber "linkedGridScore"
        isNotAsked = ( ( required != 0 && @parent.getGridScore() < required ) || @parent.gridWasAutostopped() ) && @parent.getGridScore() != false
        question.set  "notAsked", isNotAsked
        if isNotAsked then @notAskedCount++
    @trigger "ready"

#    if @focusMode
#      $('#subtest_wrapper').after $ "
#            <div id='summary_container'></div>
#            <button class='navigation prev_question'>#{@text.previousQuestion}</button>
#            <button class='navigation next_question'>#{@text.nextQuestion}</button>
#          "

  onRenderCollection:->
#    if @focusMode
#      $('#subtest_wrapper').after $ "
#            <div id='summary_container'></div>
#            <button class='navigation prev_question'>#{@text.previousQuestion}</button>
#            <button class='navigation next_question'>#{@text.nextQuestion}</button>
#          "
    @updateExecuteReady(true)
    @updateQuestionVisibility()
    @updateProgressButtons()

    if @questions.length == @notAskedCount
      if Tangerine.settings.get("context") != "class"
        @parent.next?()
      else
#        container.appendChild $ "<p class='grey'>#{@text.notEnough}</p>"
        alert @text.notEnough

#    @trigger "ready"
    @trigger "subRendered"



#  onShow: ->
#    console.log("onShow")
#    if @focusMode
#      $('#subtest_wrapper').after $ "
#            <div id='summary_container'></div>
#            <button class='navigation prev_question'>#{@text.previousQuestion}</button>
#            <button class='navigation next_question'>#{@text.nextQuestion}</button>
#          "
#    @updateExecuteReady(true)
#    @updateQuestionVisibility()
#    @updateProgressButtons()
#
#    if @questions.length == @notAskedCount
#      if Tangerine.settings.get("context") != "class"
#        @parent.next?()
#      else
##        container.appendChild $ "<p class='grey'>#{@text.notEnough}</p>"
#        alert @text.notEnough
#
#    #    @trigger "ready"
#    @trigger "subRendered"

  onShow: ->
    displayCode = @model.getString("displayCode")

    if not _.isEmptyString(displayCode)
#      displaycodeFixed = displayCode.replace("vm.currentView.subtestViews[vm.currentView.index].prototypeView","Tangerine.progress.currentSubview")
#      displaycodeFixed = displaycodeFixed.replace("@prototypeView","Tangerine.progress.currentSubview")
      displaycodeFixed = displayCode
      if _.size(Tangerine.displayCode_migrations) > 0
        for k,v of Tangerine.displayCode_migrations
          displaycodeFixed = displaycodeFixed.replace(k,v)
      try
        CoffeeScript.eval.apply(@, [displaycodeFixed])
      catch error
        name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
        message = error.message
        alert "#{name}\n\n#{message}"
        console.log "displaycodeFixed Error: " + JSON.stringify(error)

    @prototypeView?.updateExecuteReady?(true)

#  onDomRefresh: ->
#    console.log("I get too attached to people.")

# @todo Documentation
  skip: =>
    currentView = Tangerine.progress.currentSubview
    @parent.result.add
      name      : currentView.model.get "name"
      data      : currentView.getSkipped()
      subtestId : currentView.model.id
      skipped   : true
      prototype : currentView.model.get "prototype"
    ,
      success: =>
        @parent.reset 1

  # Doubt this is happening after the question was rendered. TODO: find the right place.
  onQuestionRendered:->
#    console.log("onQuestionRendered @renderCount: " + @renderCount)
    @renderCount++
#    console.log("onQuestionRendered @renderCount incremented: " + @renderCount)
    if @renderCount == @questions.length
      @trigger "ready"
      @updateSkipLogic()
#      @updateQuestionVisibility()
#      @updateProgressButtons()
#    @trigger "subRendered"

#  onShow:->
#    console.log("iShown!")
#    @onRenderCollection()

  onClose:->
    for qv in @questionViews
      qv.close?()
    @questionViews = []

  reset: (increment) ->
    console.log("reset")
    @rendered.subtest = false
    @rendered.assessment = false
    #    currentView = @subtestViews[@orderMap[@index]]
    #    currentView.close()
    Tangerine.progress.currentSubview.close();
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment
    @render()
    window.scrollTo 0, 0

  next: () ->
    console.log("next")
    @model.parent.next?()
