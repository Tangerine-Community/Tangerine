class Result extends Backbone.Model

  url: "result"
  
  # name : currentView.model.get "name"
  # data : currentView.getResult()
  # subtestId : currentView.model.id
  # sum : currentView.getSum()
  #   { correct, incorrect, missing, total }
  #   

  initialize: ( options ) ->
    # could use defaults but it messes things up
    if options.blank == true
      device = device || Device || {}
      deviceInfo =
        'name'      : device.name
        'platform'  : device.platform
        'uuid'      : device.uuid
        'version'   : device.version
        'userAgent' : navigator.userAgent

      @set
        'subtestData' : []
        'start_time'  : (new Date()).getTime()
        'enumerator'  : Tangerine.user.name
        'tangerine_version' : Tangerine.version
        'device' : deviceInfo
        'instanceId' : Tangerine.settings.getString("instanceId")

      @unset "blank" # options automatically get added to the model. Lame.

  # Defined by default for all Models to provide a hash at save. not needed for results
  beforeSave: ->
    # do nothing

  add: ( subtestDataElement, callback = {}) ->
    callback.success = $.noop if not callback.success?
    callback.error = $.noop if not callback.error?
    subtestDataElement['timestamp'] = (new Date()).getTime()
    subtestData = @get 'subtestData'
    subtestData.push subtestDataElement
    @save
      'subtestData' : subtestData
    , 
      success: callback.success
      error: callback.error

  getVariable: ( key ) ->
    for subtest in @get("subtestData")
      data = subtest.data
      for variable, value of data
        if variable == key
          if _.isObject(value)
            return _.compact(((name if state == "checked") for name, state of value))
          else
            return value
    return null

  getGridScore: (id) ->
    for datum in @get 'subtestData'
      return parseInt(datum.data.attempted) if datum.subtestId == id

  getItemResultCountByVariableName: (name, result) ->
    found = false
    count = 0
    for datum in @get 'subtestData'
      if datum.data? and datum.data.variable_name? and datum.data.variable_name == name
        found = true
        items = datum.data.items
        for item in items
          count++ if item.itemResult == result
    throw new Error("Variable name \"#{name}\" not found") if not found
    return count

  gridWasAutostopped: (id) ->
    for datum in @get 'subtestData'
      return datum.data.auto_stop if datum.subtestId == id
