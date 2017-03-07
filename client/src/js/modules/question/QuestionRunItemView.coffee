QuestionRunItemView = Backbone.Marionette.ItemView.extend
  template: JST["QuestionView"],
  className: "question"

  events:
    'change input'           : 'update'
    'change textarea'        : 'update'
    'click .autoscroll_icon' : 'scroll'

  scroll: (event) ->
    @trigger "scroll", event, @model.get("order")

  initialize: (options) ->
    @on "show", => @onShow()
    @model     = options.model
    @parent    = options.parent
    @dataEntry = options.dataEntry
    @fontFamily = @parent.model.get('fontFamily')
    @fontStyle = "style=\"font-family: #{@parent.model.get('fontFamily')} !important;\"" if @parent.model.get("fontFamily") != ""
    unless @dataEntry
      @answer = options.answer
    else
      @answer = {}

    @name     = @model.escape("name").replace /[^A-Za-z0-9_]/g, "-"
    @type     = @model.get "type"
    @options  = @model.get "options"
    @notAsked = options.notAsked
    @isObservation = options.isObservation

    @defineSpecialCaseResults()

    if @model.getBoolean("skippable")
      @isValid = true
      @skipped = true
    else
      @isValid = false
      @skipped = false

    if @notAsked == true
      @isValid = true
      @updateResult()

    if @type == "single" or @type == "multiple"
      model = new Button({foo: "bar"})
      @button = new ButtonItemView
        model   : model
        options : @options
        mode    : @type
        dataEntry  : @dataEntry
        answer     : @answer
        fontFamily : @fontFamily

      @button.on "change rendered", => @update()

  previousAnswer: =>
    @parent.questionViews[@parent.questionIndex - 1].answer if @parent.questionIndex >= 0

  onShow: ->

    showCode = @model.getString("displayCode")

    return if _.isEmptyString(showCode)

    try
      CoffeeScript.eval.apply(@, [showCode])
    catch error
      name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
      message = error.message
      alert "Display code error\n\n#{name}\n\n#{message}\n\n#{showCode}"

  update: (event) ->
    @updateResult()
    @updateValidity()
    @trigger "answer", event, @model.get("order")

  updateResult: ->
    if @notAsked == true
      if @type == "multiple"
        for option, i in @options
          @answer[@options[i].value] = "not_asked"
      else
        @answer = "not_asked"
    else
      if @type == "open"
        @answer = @$el.find("##{@cid}_#{@name}").val()

        id = "#_#{@name}"
#        console.log("@answer: " + @answer + " id: " + id)
        @answer = $(id).val()
#        console.log("@answer: " + @answer)
      else
        @answer = @button.answer

  updateValidity: ->

    isSkippable    = @model.getBoolean("skippable")
    isAutostopped  = @$el.hasClass("disabled_autostop")
    isLogicSkipped = @$el.hasClass("disabled_skipped")

    # have we or can we be skipped?
    if isSkippable or ( isLogicSkipped or isAutostopped )
      # YES, ok, I guess we're valid
      @isValid = true
      @skipped = if _.isEmptyString(@answer) then true else false
    else
      # NO, some kind of validation must occur now
      customValidationCode = @model.get("customValidationCode")
      @answer = "" unless @answer
      if customValidationCode? && not _.isEmptyString(customValidationCode)
        try
          @isValid = CoffeeScript.eval.apply(@, [customValidationCode])
        catch e
          alert "Custom Validation error from customValidationCode: " + customValidationCode + "\n\n#{e}"
      else
        @isValid =
          switch @type
            when "open"
#              console.log(" prompt: " + @model.get("prompt") + " @name: " + @name + " @answer: " + @answer)
              if _.isEmptyString(@answer) || (_.isEmpty(@answer) && _.isObject(@answer)) then false else true # don't use isEmpty here
            when "multiple"
              if ~_.values(@answer).indexOf("checked") then true  else false
            when "single"
              invalid = _.isEmptyString(@answer) || (_.isEmpty(@answer) && _.isObject(@answer))
#              console.log("invalid: " + invalid + " @answer: " + @answer + " _.isEmptyString(@answer)" + _.isEmptyString(@answer) + " _.isEmpty(@answer): " + " _.isObject(@answer):" + _.isObject(@answer))
              if invalid then false else true

  setOptions: (options) =>
    @button.options = options
    @button.render()

  setAnswer: (answer) =>
    alert "setAnswer Error\nTried to set #{@type} type #{@name} question to string answer." if _.isString(answer) && @type == "multiple"
    alert "setAnswer Error\n#{@name} question requires an object" if not _.isObject(answer) && @type == "multiple"

    if @type == "multiple"
      @button.answer = $.extend(@button.answer, answer)
    else if @type == "single"
      @button.answer = answer
    else
      @answer = answer

    @updateValidity()
    @button.render()

  setMessage: (message) ->
    @$el.find(".error_message").html message
#    $(".error_message").html message
#    $("#" + @el.id + " .error_message").html  message

  setPrompt: (prompt) =>
#    @$el.find(".prompt").html prompt
    $(".prompt").html prompt

  setHint: (hint) =>
#    @$el.find(".hint").html hint
    $(".hint").html hint

  setName: ( newName = @model.get('name') ) =>
    @model.set("name", newName)
    @name = @model.escape("name").replace /[^A-Za-z0-9_]/g, "-"

  getName: =>
    @model.get("name")

  onBeforeRender: ->
    @$el.attr "id", "question-#{@name}"
    if not @notAsked
      if @type == "open"
        @model.set('isOpen', true)
        if _.isString(@answer) && not _.isEmpty(@answer)
          answerValue = @answer
          @model.set('answerValue', @answer)
        if @model.get("multiline")
          @model.set('isMultiline', true)
#      if @type == "single" or @type == "multiple"
#        @button.setElement(@$el.find(".button_container"))
#        @button.on "rendered", => @trigger "rendered"
#        @button.render()
#      else
#        @trigger "rendered"
    else
      @$el.hide()
#      @trigger "rendered"

  onRender: ->
#    console.log("onRender name:" + @model.get("name") + " answer: " + @model.get("prompt"))
    if @type == "single" or @type == "multiple"
      @button.setElement @$el.find ".button_container"
      @button.on "rendered", => @trigger "rendered"
      @button.render()
    else if @type == "open"
      @trigger "rendered"

  renderNOT: ->
    @$el.attr "id", "question-#{@name}"

    if not @notAsked

      html = "<div class='error_message'></div><div class='prompt' #{@fontStyle || ""}>#{@model.get 'prompt'}</div>
      <div class='hint' #{@fontStyle || ""}>#{(@model.get('hint') || "")}</div>"

      if @type == "open"
        if _.isString(@answer) && not _.isEmpty(@answer)
          answerValue = @answer
        if @model.get("multiline")
          html += "<div><textarea id='#{@cid}_#{@name}' data-cid='#{@cid}' value='#{answerValue || ''}'></textarea></div>"
        else
          html += "<div><input id='#{@cid}_#{@name}' data-cid='#{@cid}' value='#{answerValue || ''}'></div>"

      else
        html += "<div class='button_container'></div>"

      html += "<img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='#{@cid}'>" if @isObservation
      @$el.html html

      if @type == "single" or @type == "multiple"
        @button.setElement(@$el.find(".button_container"))
        @button.on "rendered", => @trigger "rendered"
        @button.render()
      else
        @trigger "rendered"

    else
      @$el.hide()
      @trigger "rendered"

  defineSpecialCaseResults: ->
    list = ["missing", "notAsked", "skipped", "logicSkipped", "notAskedAutostop"]
    for element in list
      if @type == "single" || @type == "open"
        @[element+"Result"] = element
      if @type == "multiple"
        @[element+"Result"] = {}
        @[element+"Result"][@options[i].value] = element for option, i in @options
    return


class SurveyReviewView extends Backbone.View

  className: "QuestionReviewView"

  initialize: (options) ->
    @views = options.views

  render: ->

    answers = ("
      <div class='label_value'>
        <h3></h3>
      </div>

    " for view in @views).join("")

    @$el.html "

      <h2>Please review your answers and press next when ready.</h2>

      #{answers}
    "
