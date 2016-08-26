class LessonPlans extends Backbone.Collection

  model : LessonPlan
  url : "lessonPlan"
  pouch:
    viewOptions:
      key : 'lessonPlan'

  comparator : (model) ->
    model.get "name"