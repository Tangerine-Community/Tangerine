class Students extends Backbone.Collection

  model: Student
  url: "student"

  pouch:
    viewOptions:
      key : 'student'

  comparator: (model) ->
    model.get("name").toLowerCase()
