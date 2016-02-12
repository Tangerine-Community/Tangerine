class GpsPrintView extends Backbone.View

  className: "Gps"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  render: ->
    return if @format is "stimuli" or @format is "backup"

    if @format is "content"
      @$el.html "Capture Gps location"

    @trigger "rendered"
