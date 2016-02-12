class SurveyPrintView extends Backbone.View

  className: "SurveyPrintView"

  initialize: (options) ->
    @model         = @options.model
    @parent        = @options.parent
    @isObservation = @options.isObservation
    @questionViews = []
    @answered      = []
    @questions     = new Questions
    @questions.db.view = "questionsBySubtestId"
    @questions.fetch
      key: @model.id
      success: (collection) =>
        @questions = collection
        @questions.sort()
        @ready = true
        @render()

  render: ->
    if @format is "metadata"
      @$el.html "
        <table class='print-metadata'>
          <thead>
            #{
              _("name, prompt, type, hint,options".split(/, */)).map( (attribute) =>
                "<th>#{attribute}</th>"
              ).join("")
            }
          </thead>
          <tbody class='survey-questions'>
          </tbody>
        </table>
      "

    else
      @$el.html "
        <div id='#{@model.get "_id"}' class='print-page #{@format}'>
          <div class='survey-questions'></div>
        </div>
        <style>
          .survey-questions .stimuli-question{
            padding-bottom: 3%;
          }
        </style>
      "

    notAskedCount = 0
    @questions.sort()
    if @questions.models?
      for question, i in @questions.models

        oneView = new QuestionPrintView
          model         : question
          parent        : @
          isObservation : @isObservation
        oneView.on "rendered", @onQuestionRendered

        oneView.render()
        @questionViews[i] = oneView
        if @format is "metadata"
          @$el.find('.survey-questions').append $(oneView.el).html()
        else
          @$el.find('.survey-questions').append oneView.el

    if @questions.length == notAskedCount then @parent.next?()
    
    if @format is "stimuli"
      _.delay =>
        @increaseFontUntilOverflow $("##{@model.get "_id"}")[0], $("##{@model.get "_id"} .survey-questions")
      ,1000

    @trigger "rendered"

  increaseFontUntilOverflow: (outerDiv,innerDiv) ->
    overflow = 100
    incrementAmount = 3
    currentPercentage = 100
    while outerDiv.scrollWidth-1 <= $(outerDiv).innerWidth() and outerDiv.scrollHeight-1 <= $(outerDiv).innerHeight()
      break if (overflow-=1) is 0
      currentPercentage += incrementAmount
      innerDiv.css("font-size", currentPercentage + "%")
    innerDiv.css("font-size", currentPercentage - (2*incrementAmount) + "%")

  onQuestionRendered: =>
    @trigger "subRendered"
