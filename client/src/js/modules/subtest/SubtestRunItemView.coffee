
###
  SubtestRunItemView

  This is the Base Class for all Subtest Views.

  Events:
    next
    back
    skip

  Options:
    model
###

SubtestRunItemView = Backbone.Marionette.ItemView.extend

  #
  # Functions to override.
  #
  # TODO: Document more required functions.

  # AssessmentCompositeView uses this for validation before proceeding to the next Subtest.
  isValid: ->
    true

  # AssessmentCompositeView uses this for adding to it's results before the next Subtest.
  getResult: ->
    return new Result()


  #
  # Helper functions.
  #

  # Use this to run the displayCode property on your Subtest Model. You must
  # include this where it makes sense for your Subtest View. For some Views, this
  # can be included in the beginning of a render function, for others it needs
  # to be later. Including this in the initialize function will result in potential
  # events like `skip` being emitted before AssessmentCompositeView is listening.
  runDisplayCode: ->
    displayCode = @model.getString("displayCode")
    console.log displayCode

    if not _.isEmptyString(displayCode)

      try
        CoffeeScript.eval.apply(@, [displayCode])
      catch error
        name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
        message = error.message
        alert "#{name}\n\n#{message}"
        console.log "displayCode Error: " + JSON.stringify(error)


  #
  # Methods instead of using @trigger because some Display Logic code depends on them.
  #
  # TODO: Add these to migrations so we can remove them. @trigger should be the standard.

  next: -> @trigger "next"
  back: -> @trigger "back"
  skip: -> @trigger "skip"
  abort: ->
    @trigger('abort')
    @parent.abort()
