class LessonPlans extends Backbone.Collection

  model : LessonPlan
  url : "lessonPlan"

  comparator : (model) ->
    model.get "name"

