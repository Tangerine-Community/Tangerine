class LessonPlanEditView extends Backbone.View

  className: "LessonPlanEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: -> # do nothing