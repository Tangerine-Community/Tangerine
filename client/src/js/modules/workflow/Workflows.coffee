class Workflows extends Backbone.Collection

  model: Workflow
  url: 'workflow'
  pouch:
    viewOptions:
      key : 'workflow'

  comparator : (model) ->
    model.get "name"
