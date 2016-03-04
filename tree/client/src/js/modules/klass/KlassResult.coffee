class KlassResult extends Backbone.Model

  url : "result"

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
        return @attributes.subtestData.items.length
      else if @attributes.prototype == "survey"
        return _.keys(@attributes.subtestData).length
    
    if options == "attempted"   then return @getAttempted()
    if options == "time_remain" then return @getTimeRemain()

    # if no special properties detected let's go with super
    # result = KlassResult.__super__.get.apply @, arguments

    super(options)

  gridCount: (value) ->
    count = 0
    if @attributes.prototype == "grid"
      if _.isArray(value)
        (count++ if ~value.indexOf(item.itemResult)) for item in @get("subtestData").items   
      else
        (count++ if item.itemResult == value) for item in @get("subtestData").items 
    else if @attributes.prototype == "survey"
      if _.isArray(value)
        for k, v of @attributes.subtestData
          count++ if (~value.indexOf(v) || ~value.indexOf(parseInt(v)))
      else
        for k, v of @attributes.subtestData
          count++ if (value == v || value == parseInt(v))
            
    return count

  getAttempted: ->
    return parseInt( @get("subtestData").attempted )

  getTimeRemain: ->
    return parseInt( @get("subtestData").time_remain )

  getCorrectPerSeconds: ( secondsAllowed ) ->
    Math.round( ( @get("correct") / ( secondsAllowed - @getTimeRemain() ) ) * secondsAllowed )
