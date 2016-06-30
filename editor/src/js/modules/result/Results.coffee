class Results extends Backbone.Collection

  url : "result"
  model : Result
  db:
    view: "byParentId"

  comparator: (model) ->
    model.get('start_time') || 0

  # By default include the docs
  fetch: (options) ->
    options = {} unless options?
    options.include_docs = true unless options.include_docs?
    super(options)
