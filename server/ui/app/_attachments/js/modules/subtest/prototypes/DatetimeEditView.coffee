class DatetimeEditView extends Backbone.View

  className : "DatetimeEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  save: -> #do nothing
  
  isValid: -> true