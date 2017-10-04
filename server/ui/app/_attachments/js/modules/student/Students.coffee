class Students extends Backbone.Collection

  model: Student
  url: "student"

  comparator: (model) ->
    model.get("name").toLowerCase()
