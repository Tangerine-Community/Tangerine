class Assessments extends Backbone.Collection
  model: Assessment
  url: 'assessment'
  pouch:
    viewOptions:
      key : 'assessment'

  comparator : (model) ->
    model.get "name"
