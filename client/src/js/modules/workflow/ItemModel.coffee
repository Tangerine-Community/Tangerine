class ItemModel extends Backbone.ParentModel

  url : "item"

  Child           : Element
  ChildCollection : ElementCollection

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

