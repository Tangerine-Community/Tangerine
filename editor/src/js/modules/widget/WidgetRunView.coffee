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

  render: ->
    $('#footer').hide()
    @$el.html "<div class='assessment'></div>
      <p><button id='saveToCouchDB' class='saveToCouchDB'>#{@text.save}</button></p>
      <div class='assessment-widget-result'></div>"
    $('#saveToCouchDB').hide()

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

    save: ->
      console.log("save to Couchdb")

    @$assessmentWidget.on('load', (event) ->
      console.log("loaded")
      iframe = $('#client-widget').contents();
      iframe.find(".save").click((event) ->
        console.log("saved iframe")
      )
    )

    @$el.find(".assessment").append(@$assessmentWidget)
    @trigger "rendered"

    return

