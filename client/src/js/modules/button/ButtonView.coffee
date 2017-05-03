class ButtonView extends Backbone.View

  className : "ButtonView"

  c:
    CHECKED   : "C"
    UNCHECKED : "U"

  events :
    if Modernizr.touch
      "touchstart .button" : "onClick"
    else
      "click .button"      : "onClick"

  getValue: -> @answer

  setValue: (values = []) ->

    values = [values] unless _(values).isArray()

    @answer = _.union(values, @options)

    selector = @answer.map( (value) -> "[data-value='#{value}']" ).join(',')

    @$el.find(".button").removeClass "selected"
    @$el.find(selector).addClass "selected"


  onChange: (event) ->

    value = _.map($(event.target).find("option:selected"), (x) -> $(x).attr('data-answer'))
    @trigger "change", @el

  hybridClick: (opts) ->
    @$el.find(".button").removeClass "selected"

    if not opts.checkedBefore
      opts.$target.addClass "selected"
      @answer = ""
    else
      @answer = opts.value

  singleClick: (opts) ->
    @$el.find(".button").removeClass "selected"
    opts.$target.addClass "selected"
    @answer = opts.value


  multipleClick: (opts) ->

    if opts.checkedBefore
      opts.$target.removeClass "selected"
    else
      opts.$target.addClass "selected"

    @answer[opts.value] =
      if opts.checkedBefore
        @c.UNCHECKED
      else
        @c.CHECKED


  onClick : (event) ->

    options =
      $target       : $(event.target)
      value         : $(event.target).attr('data-value')
      checkedBefore : $(event.target).hasClass("selected")

    @["#{@mode}Click"](options)
    @trigger "change", @el

  initialize : ( options ) ->
    @mode    = options.mode
    @options = options.options

    if @mode == "single" or @mode == "open"
      answer = ""
    else if @mode == "multiple"
      answer = {}
      @options.forEach (option) ->
        answer[option.value] = @c.UNCHECKED
      , @

    @answer = answer

  render : ->

    htmlOptions = ""

    @options.forEach (option, i) ->

      styleClass =
        if i == 0
          "left"
        else if i == @options.length-1
          "right"
        else
          ""

      value = option.value
      label = option.label

      selectedClass =
        if @mode == "multiple" && @answer[value] == @c.CHECKED
          "selected"
        else if @mode == "single" && @answer == value
          "selected"
        else
          ""

      htmlOptions += "<div class='button #{styleClass} #{selectedClass}' data-value='#{value}'>#{label}</div>"
    , @

    @$el.html("
      #{htmlOptions}
    ").addClass(@className) # Why do I have to do this?

    @trigger "rendered"
