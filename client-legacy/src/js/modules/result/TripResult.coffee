class TripResult extends Backbone.Model

  initialize: ->

  fetch: ->
    # do nothing, just in case

  save: ->
    # do nothing, just in case

  getVariable: ( key ) ->
    result = _(@get("data")).where("key":key)
    return result[0].value if result.length > 0
    return "not found"

  add: (results) ->
    results = [results] unless _(results).isArray()
    @models = @models.concat results
