# WidgetRunView takes a list of subtests and the assessment as the model, stringifies it, and renders the Tangerine client widget.
# It listens for a result-save-final event from the widget, which is created by the widgetPlay route in widget's router
# by the result:saved event thrown by AssessmentCompositeView from ResultItemView.
class WidgetRunView extends Backbone.View

  className : "WidgetRunView"

  initialize: (options) ->
    @i18n()
    @model = options.model

  events:
    'click .saveToCouchDB'    : 'save'

  i18n: ->
    @text =
      "save"               : t("WidgetRunView.button.save")
      "saved"               : t("WidgetRunView.button.saved")

  save: ->
    console.log("save to Couchdb")
    assessment = $('.assessment-widget-result').html()
#    result = JSON.parse assessment
    @model = new Result JSON.parse assessment
    if @model.save()
      Tangerine.activity = ""
      Utils.midAlert @text.saved

  render: ->
    $('#footer').hide()
    @$el.html "<div class='assessment'></div>
      <p><button id='saveToCouchDB' class='saveToCouchDB'>#{@text.save}</button></p>
      <div class='assessment-widget-result'></div>"
    @$assessmentWidget = $(document.createElement('iframe'))
    @$assessmentWidget.attr('src', '/client/index.html#widget')
    @$assessmentWidget.attr('data-assessment', JSON.stringify(@model))
    @$assessmentWidget.attr('data-result', '{}')
    @$assessmentWidget.attr('width', '100%')
    @$assessmentWidget.attr('height', 600)
    @$assessmentWidget.attr('id', 'client-widget')
    @$assessmentWidget.on('result-save-final', (event) ->
      console.log("Final save")
      $('#saveToCouchDB').show()
      $('.assessment-widget-result').html(event.target.getAttribute('data-result'))
    )

    @$el.find(".assessment").append(@$assessmentWidget)
    @trigger "rendered"

    return
