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
        console.log @subtests
        @subtests = new Subtests
        @subtests.assessment = @
        @subtests.fetch
          viewOptions:
            key: "subtest-#{@id}"
          error: ->
            console.log "that failed"
          success: (subtests) ->
            subtests.ensureOrder()
            opts.success.apply subtests.assessment, arguments

