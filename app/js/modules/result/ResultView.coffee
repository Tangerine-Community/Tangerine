class ResultView extends Backbone.View

  className: "result_view"

  events:
    'click .save'    : 'save'
    'click .another' : 'another'

  another: ->
    Tangerine.router.navigate "restart/#{@assessment.id}", true

  save: ->
    @model.add
      name : "Assessment complete"
      prototype: "complete"
      data :
        "comment" : @$el.find('#additional_comments').val() || ""
        "end_time" : (new Date()).getTime()
      subtestId : "result"
      sum :
        correct : 1
        incorrect : 0
        missing : 0
        total : 1

    if @model.save()
      Tangerine.activity = ""
      Utils.midAlert "Result saved"
      @$el.find('.save_status').html "saved"
      @$el.find('.save_status').removeClass('not_saved')
      @$el.find('.question').fadeOut(250)

      $button = @$el.find("button.save")

      $button.removeClass('save').addClass('another').html "Perform another assessment"
    else
      Utils.midAlert "Save error"
      @$el.find('.save_status').html "Results may not have saved"

  initialize: ( options ) ->

    @model = options.model
    @assessment = options.assessment
    @saved = false
    @resultSumView = new ResultSumView
      model       : @model
      finishCheck : false

  render: ->
    @$el.html "
      <h2>Assessment complete</h2>

      <button class='save command'>Save result</button>
      <div class='info_box save_status not_saved'>Not saved yet</div>
      <br>

      <div class='question'>
        <div class='prompt'>Additional comments (optional)</div>
        <textarea id='additional_comments' class='full_width'></textarea>
      </div>

      <div class='label_value'>
        <h2>Subtests completed</h2>
        <div id='result_sum' class='info_box'></div>
      </div>
    "

    @resultSumView.setElement(@$el.find("#result_sum"))
    @resultSumView.render()

    @trigger "rendered"
    
  onClose: ->
    @resultSumView.close()
