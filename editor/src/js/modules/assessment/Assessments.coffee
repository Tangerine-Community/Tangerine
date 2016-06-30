class Assessments extends Backbone.Collection
  model: Assessment
  url: 'assessment'

  comparator : (model) ->
    model.get "name"
