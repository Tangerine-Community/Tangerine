class KlassResult extends Backbone.Model

  url : "result"

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
        'subtestData'       : []
        'start_time'        : (new Date()).getTime()
        'enumerator'        : Tangerine.user.name()
        'tangerine_version' : Tangerine.version
        'device'            : deviceInfo
        'instanceId'        : Tangerine.settings.getString("instanceId")

      @unset "blank" # options automatically get added to the model. Lame.

  add: ( subtestDataElement, callback ) ->
    @save
      'subtestData' : subtestDataElement
    ,
      success: => callback()

  getItemized: (options) ->
  
    if @attributes.prototype == "grid"
      itemized = @attributes.subtestData.items
    else if @attributes.prototype == "survey"
      itemized = []
      for key, value of @attributes.subtestData
        itemized.push
          itemLabel: key
          itemResult: value

    return itemized

  get: (options) ->
    if options == "correct"     then return @gridCount ["correct", 1]
    if options == "incorrect"   then return @gridCount ["incorrect", 0]
    if options == "missing"     then return @gridCount ["missing", 9]

    if options == "total"
      if @attributes.prototype == "grid"
        return @attributes.subtestData.body.items.length
      else if @attributes.prototype == "survey"
        return _.keys(@attributes.subtestData.body).length
    
    if options == "attempted"   then return @getAttempted()
    if options == "time_remain" then return @getTimeRemain()

    # if no special properties detected let's go with super
    # result = KlassResult.__super__.get.apply @, arguments

    super(options)

  gridCount: (value) ->
    count = 0
    if @attributes.prototype == "grid"
      if _.isArray(value)
        (count++ if ~value.indexOf(item.itemResult)) for item in @get("subtestData").body.items
      else
        (count++ if item.itemResult == value) for item in @get("subtestData").body.items
    else if @attributes.prototype == "survey"
      if _.isArray(value)
        for k, v of @attributes.subtestData.body
          count++ if (~value.indexOf(v) || ~value.indexOf(parseInt(v)))
      else
        for k, v of @attributes.subtestData.body
          count++ if (value == v || value == parseInt(v))
            
    return count

  getAttempted: ->
    return parseInt( @get("subtestData").body.attempted )

  getTimeRemain: ->
    return parseInt( @get("subtestData").body.time_remain )

  getCorrectPerSeconds: ( secondsAllowed ) ->
    Math.round( ( @get("correct") / ( secondsAllowed - @getTimeRemain() ) ) * secondsAllowed )

  getByHash: ( hash ) ->
    if (hash?)
      for subtest in @get("subtestData")
        if hash is subtest.subtestHash
          return subtest.data
    return null
