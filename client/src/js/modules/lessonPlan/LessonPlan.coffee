LessonPlan = Backbone.Model.extend

  url: 'lessonPlan'

  VERIFY_TIMEOUT : 20 * 1000

  initialize: ( options={} ) ->
    # this collection doesn't get saved
    # changes update the subtest view, it keeps order
    @elements = new Elements
    # @getResultCount()

  deepFetch: ( opts = {} ) ->

    opts.error   = opts.error   || $.noop
    opts.success = opts.success || $.noop

    @fetch
      error: opts.error
      success: =>
#        console.log "@elements: " + @elements
        @elements = new Elements
        @elements.lessonPlan = @
        @elements.fetch
          viewOptions:
            key: "element-#{@id}"
          error: ->
            console.log "deepFetch of Element failed"
          success: (elements) ->
#            console.log "elements: " + JSON.stringify(elements)
            elements.ensureOrder()
            opts.success.apply elements.lessonPlan, arguments

