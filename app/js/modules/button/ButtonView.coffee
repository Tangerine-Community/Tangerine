class ButtonView extends Backbone.View

  className : "ButtonView"

  events : 
      if Modernizr.touch
        "touchstart .button" : "onClick"
      else
        "click .button"      : "onClick"

  onChange: (event) ->

    value = _.map($(event.target).find("option:selected"), (x) -> $(x).attr('data-answer'))
    @trigger "change", @el

  onClick : (event) ->

    $target = $(event.target)

    value         = $target.attr('data-value')
    checkedBefore = $target.hasClass("selected")

    if @mode == "hybrid"

      @$el.find(".button").removeClass "selected"

      if not checkedBefore
        $target.addClass "selected"
        @answer = ""
      else
        @answer = value

    else if @mode == "single"

      @$el.find(".button").removeClass "selected"

      $target.addClass "selected"
      @answer = value

    else if @mode == "multiple"

      if checkedBefore
        $target.removeClass "selected"
      else 
        $target.addClass "selected"

      @answer[value] =
        if checkedBefore
          "unchecked"
        else
          "checked"

    @trigger "change", @el

  initialize : ( options ) ->
    @mode    = options.mode
    @options = options.options
    @answer = "" if @mode == "single" or @mode == "open"
    if @mode == "multiple"
      @answer = {}
      for option in @options
        @answer[option.value] = "unchecked"

  render : ->

    htmlOptions = ""

    for option, i in @options

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
        if @mode == "multiple" && @answer[value] == "checked"
          "selected"
        else if @mode == "single" && @answer == value
          "selected"
        else
          ""

      htmlOptions += "<div class='button #{styleClass} #{selectedClass}' data-value='#{value}'>#{label}</div>"

    @$el.html("
      #{htmlOptions}
    ").addClass(@className) # Why do I have to do this?

    @trigger "rendered"

