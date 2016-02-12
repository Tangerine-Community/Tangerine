class ConsentPrintView extends Backbone.View

  className : "ConsentPrintView"

  initialize: (options) ->
    @confirmedNonConsent = false
    @model  = @options.model
    @parent = @options.parent
  
  render: ->
    return if @format is "stimuli"
    if @format is "content" or @format is "backup"
      spanClass = "print-question-option"
      markingArea = "☐"
      @$el.html "
        <span class='#{spanClass}'>#{@model.get('prompt') || 'Does the child consent?'} #{markingArea}</span>
      "

    @trigger "rendered"
