class IdEditView extends Backbone.View

  className: "IdEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: -> # do nothing