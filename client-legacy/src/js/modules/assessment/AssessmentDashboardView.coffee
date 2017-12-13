 AssessmentDashboardView = Backbone.Marionette.CompositeView.extend

  template: JST["AssessmentDashboardHeader"],
  tagName: 'div',

#  i18n: ->
#    @text =
#      "next" : t("SubtestRunView.button.next")
#      "back" : t("SubtestRunView.button.back")
#      "skip" : t("SubtestRunView.button.skip")
#      "help" : t("SubtestRunView.button.help")
#
#  initialize: (options) ->
#
#    @i18n()
#
#    @model = options.model
#    Tangerine.progress = {}
#    Tangerine.progress.index = 0
#    @index = Tangerine.progress.index
#
#    ui = {}
#    ui.enumeratorHelp = if (@model.get("enumeratorHelp") || "") != "" then "<button class='subtest_help command'>#{@text.help}</button><div class='enumerator_help' #{@fontStyle || ""}>#{@model.get 'enumeratorHelp'}</div>" else ""
#    ui.studentDialog  = if (@model.get("studentDialog")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'studentDialog'}</div>" else ""
#    ui.transitionComment  = if (@model.get("transitionComment")  || "") != "" then "<div class='student_dialog' #{@fontStyle || ""}>#{@model.get 'transitionComment'}</div> <br>" else ""
#
#    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
#    backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0
#
#    ui.skipButton = "<button class='skip navigation'>#{@text.skip}</button>" if skippable
#    ui.backButton = "<button class='subtest-back navigation'>#{@text.back}</button>" if backable
#    ui.text = @text
#    @model.set('ui', ui)
#
#  events:
#    'click .subtest-next' : 'next'
#    'click .subtest-back' : 'back'
#    'click .subtest_help' : 'toggleHelp'
#    'click .skip'         : 'skip'
#
#  onRender: ->
#    @$el.find('#progress').progressbar value : ( ( @index + 1 ) / ( @model.subtests.length + 1 ) * 100 )
#
#  next: ->
#    console.log("next")
#    @trigger "next"
#  back: -> @trigger "back"
#  toggleHelp: -> @$el.find(".enumerator_help").fadeToggle(250)
#  skip: -> @parent.skip()
#
#  showNext: => @$el.find(".controlls").show()
#  hideNext: => @$el.find(".controlls").hide()
