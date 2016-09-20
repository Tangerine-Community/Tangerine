Assessment = Backbone.Model.extend

  url: 'assessment'

  VERIFY_TIMEOUT : 20 * 1000

  initialize: ( options={} ) ->
    # this collection doesn't get saved
    # changes update the subtest view, it keeps order
    @subtests = new Subtests
    # @getResultCount()

  # refactor to events
  verifyConnection: ( callbacks = {} ) =>
    @timer = setTimeout(callbacks.error, @VERIFY_TIMEOUT) if callbacks.error?
    $.ajax
      url: Tangerine.settings.urlView("group", "byDKey")
      dataType: "jsonp"
      data: keys: ["testtest"]
      timeout: @VERIFY_TIMEOUT
      success: =>
        clearTimeout @timer
        callbacks.success?()

  deepFetch: ( opts = {} ) ->

    opts.error   = opts.error   || $.noop
    opts.success = opts.success || $.noop

    @fetch
      error: opts.error
      success: =>
#        console.log "@subtests: " + @subtests
        @subtests = new Subtests
        @subtests.assessment = @
        @subtests.fetch
          viewOptions:
            key: "subtest-#{@id}"
          error: ->
            console.log "deepFetch of Assessment failed"
          success: (subtests) ->
#            console.log "subtests: " + JSON.stringify(subtests)
            subtests.ensureOrder()
            opts.success.apply subtests.assessment, arguments

  # @todo The Assessment model should know how to sort itself.
  getOrderMap: ->

    # Figure out the @orderMap which is either derived from the assessment, the
    # result with a prior orderMap, or lastly no specified order map in which case
    # we create a linear orderMap.

    orderMap = []
    hasSequences = @has("sequences") && not _.isEmpty(_.compact(_.flatten(@get("sequences"))))
    if hasSequences
      sequences = @get("sequences")
      # get or initialize sequence places
      places = Tangerine.settings.get("sequencePlaces")
      places = {} unless places?
      places[@id] = 0 unless places[@id]?
      if places[@id] < sequences.length - 1
        places[@id]++
      else
        places[@id] = 0
      Tangerine.settings.save("sequencePlaces", places)
      orderMap = sequences[places[@id]]
      orderMap[orderMap.length] = @subtests.models.length
    else
      for i in [0..@subtests.models.length]
        orderMap[i] = i
    return orderMap
