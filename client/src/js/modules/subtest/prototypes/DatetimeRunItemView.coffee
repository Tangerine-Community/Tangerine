class DatetimeRunItemView extends Backbone.Marionette.ItemView

  template: JST["Datetime"]
  className: "datetimeitem"

  i18n: ->

    @text =
      year : t("DatetimeRunView.label.year")
      month : t("DatetimeRunView.label.month")
      day : t("DatetimeRunView.label.day")
      time : t("DatetimeRunView.label.time")
      "help" : t("SubtestRunView.button.help")

  initialize: (options) ->
    Tangerine.progress.currentSubview = @
    @i18n()

    @model  = options.model
#    @parent = options.parent
    @parent = @model.parent
    @dataEntry = options.dataEntry
    labels = {}
    labels.text = @text
    @model.set('labels', labels)

    ui = {}
#    ui.skipButton = "<button class='skip navigation'>#{@text.skip}</button>" if skippable
#    ui.backButton = "<button class='subtest-back navigation'>#{@text.back}</button>" if backable
    ui.text = @text
    @model.set('ui', ui)

    @skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    @backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0
    @parent.displaySkip(@skippable)
    @parent.displayBack(@backable)

  onBeforeRender: ->
    dateTime = new Date()
    formElements = {}
    formElements.year     = dateTime.getFullYear()
    formElements.months   = [t("jan"),t("feb"),t("mar"),t("apr"),t("may"),t("jun"),t("jul"),t("aug"),t("sep"),t("oct"),t("nov"),t("dec")]
    formElements.month    = formElements.months[dateTime.getMonth()]
    formElements.day      = dateTime.getDate()
    minutes                      = dateTime.getMinutes()
    formElements.minutes  = minutes
    formElements.minutes  = "0" + minutes if minutes < 10
    formElements.time     = dateTime.getHours() + ":" + minutes

    unless @dataEntry

      previous =  @model.parent.result.getByHash(@model.get('hash'))

      if previous
        formElements.year  = previous.year
        formElements.month = previous.month
        formElements.day   = previous.day
        formElements.time  = previous.time

    @model.set('formElements', formElements)
    @trigger "rendered"
    @trigger "ready"

  getResult: ->
    result =
      "year"  : @$el.find("#year").val()
      "month" : @$el.find("#month").val()
      "day"   : @$el.find("#day").val()
      "time"  : @$el.find("#time").val()
    hash = @model.get("hash") if @model.has("hash")
    subtestResult =
      'body' : result
      'meta' :
        'hash' : hash

  getSkipped: ->
    return {
      "year"  : "skipped"
      "month" : "skipped"
      "day"   : "skipped"
      "time"  : "skipped"
    }

  isValid: ->
    true

  testValid: ->
#    console.log("DatetimerunITem testValid.")
    true
#    if not @prototypeRendered then return false
#    currentView = Tangerine.progress.currentSubview
#    if isValid?
#      return isValid()
#    else
#      return false
#    true

  showErrors: ->
    true

  next: ->
    console.log("next!!")
    @prototypeView.on "click .next",    =>
      console.log("clickme!")
      this.next()
    @parent.next()
  back: -> @parent.back()


