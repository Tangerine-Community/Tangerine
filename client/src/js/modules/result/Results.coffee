class Results extends Backbone.Collection
  url : 'result'
  model : Result

  pouch:
    viewOptions:
      key : 'result'

  comparator: (model) ->
    model.get('startTime') || 0

  # By default include the docs
  fetch: (options) ->
    options = {} unless options?
    options.include_docs = true unless options.include_docs?
    super(options)

class ResultPreview extends Backbone.Model


class ResultPreviews extends Backbone.Collection

  url : 'result'
  model : ResultPreview

  pouch:
    viewOptions:
      include_docs: false
      key : 'result'

  parse: (response) ->
    models = _.pluck response.rows, 'value'
    return models

  comparator: 'startTime'

  # By default include the docs
  fetch: (options) ->
    options = {} unless options?
    options.include_docs = true unless options.include_docs?
    super(options)
