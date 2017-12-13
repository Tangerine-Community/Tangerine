class Subtest extends Backbone.Model

  url: "subtest"

  initialize: (options) ->
    if options.itemType?
      @set('variableName', options.itemType)
    if @has 'itemType'
      @set('variableName', @get('itemType'))




