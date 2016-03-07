class ResultView extends Backbone.View

  className: "result_view"

  events:
    'click .save'    : 'save'
    'click .another' : 'another'

  another: ->
    window.location.reload()
    #Tangerine.router.navigate "restart/#{@assessment.id}", true

  save: ->
    @model.add
      name : "Assessment complete"
      prototype: "complete"
      data :
        "comment" : @$el.find('#additional-comments').val() || ""
        "end_time" : (new Date()).getTime()
      subtestId : "result"
    ,
      success: =>
        Tangerine.activity = ""
        Utils.midAlert @text.saved
        @$el.find('.save_status').html @text.saved
        @$el.find('.save_status').removeClass('not_saved')
        @$el.find('.question').fadeOut(250)

        $button = @$el.find("button.save")

        $button.removeClass('save').addClass('another').html @text.another
      error: =>
        Utils.midAlert "Save error"
        @$el.find('.save_status').html "Results may not have saved"


  i18n: ->
    @text =
      "assessmentComplete" : t("ResultView.label.assessment_complete")
      "comments"           : t("ResultView.label.comments")
      "subtestsCompleted"  : t("ResultView.label.subtests_completed")

      "save"               : t("ResultView.button.save")
      "another"            : t("ResultView.button.another")

      "saved"              : t("ResultView.message.saved")
      "notSaved"           : t("ResultView.message.not_saved")


  initialize: ( options ) ->

    @i18n()

    @model = options.model
    @assessment = options.assessment
    @saved = false
    @resultSumView = new ResultSumView
      model       : @model
      finishCheck : false

  render: ->
    @$el.html "
      <h2>#{@text.assessmentComplete}</h2>

      <button class='save command'>#{@text.save}</button>
      <div class='info_box save_status not_saved'>#{@text.notSaved}</div>
      <br>

      <div class='question'>
        <label class='prompt' for='additional-comments'>#{@text.comments}</label>
        <textarea id='additional-comments' class='full_width'></textarea>
      </div>

      <div class='label_value'>
        <h2>#{@text.subtestsCompleted}</h2>
        <div id='result_sum' class='info_box'></div>
      </div>
    "

    @resultSumView.setElement(@$el.find("#result_sum"))
    @resultSumView.render()

    @trigger "rendered"

  onClose: ->
    @resultSumView.close()
