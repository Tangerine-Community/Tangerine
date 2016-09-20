class Result extends Backbone.Model

  url: "result"

  initialize: ( options ) ->

    # could use defaults but it messes things up
    if options.blank == true
      device = window.Device || {}
      deviceInfo =
        'name'      : device.name
        'platform'  : device.platform
        'uuid'      : device.uuid
        'version'   : device.version
        'userAgent' : navigator.userAgent

      @set
        'collection'        : 'result'
        'subtestData'       : []
        'start_time'        : (new Date()).getTime()
        'enumerator'        : Tangerine.user.name()
        'tangerine_version' : Tangerine.version
        'device'            : deviceInfo
        'instanceId'        : Tangerine.settings.getString("instanceId")

      @unset "blank" # options automatically get added to the model. Lame.

  add: ( subtestDataElement, callbacks = {}) ->
    @setSubtestData subtestDataElement, callbacks
    @save null, 
      success: callbacks.success || $.noop
      error:   callbacks.error   || $.noop

  insert: (newElement) ->
    oldSubtestData = @get("subtestData")
    newSubtestData = oldSubtestData
    for oldElement, i in oldSubtestData
      if oldElement.subtestId is newElement.subtestId
        newSubtestData[i] = newElement
        break

    @set "subtestData", newSubtestData


  setSubtestData: (subtestDataElement, subtestId) ->
    subtestDataElement['timestamp'] = (new Date()).getTime()
    subtestData = @get 'subtestData'
    subtestData.push subtestDataElement
    @set 'subtestData', subtestData

  getVariable: ( key ) ->
    for subtest in @get("subtestData")
      data = subtest.data
      if data.labels?
        for label, i in data.labels
          return data.location[i] if label is key
      else
        for variable, value of data
          if variable == key
            if _.isObject(value)
              return _.compact(((name if state == "checked") for name, state of value))
            else
              return value
    return null

  getByHash: ( hash ) ->
    if (hash?)
      for subtest in @get("subtestData")
        if hash is subtest.subtestHash
          return subtest.data
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
