class CameraPrintView extends Backbone.View

  className: "Camera"

  initialize: (options) ->
    @model  = options.model
    @parent = options.parent
  
  render: ->
    return if @format is "stimuli" or @format is "backup"

    if @format is "content"
      @$el.html "Capture a photograph"

    @trigger "rendered"