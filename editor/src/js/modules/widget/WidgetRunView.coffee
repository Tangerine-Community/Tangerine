# WidgetRunView takes a list of subtests and the assessment as the model, stringifies it, and renders the Tangerine client widget.
class WidgetRunView extends Backbone.View

  className : "WidgetRunView"

  initialize: (options) ->
    @model = options.model

  render: ->
    $('#footer').hide()
    @$el.html '<div class="assessment"></div>
      <h2>Output of result</h2>
      <div class="result"></div>'

    @$assessmentWidget = $(document.createElement('iframe'))
    @$assessmentWidget.attr('src', '/client/index.html#widget')
    @$assessmentWidget.attr('data-assessment', JSON.stringify(@model))
    @$assessmentWidget.attr('data-result', '{}')
    @$assessmentWidget.attr('width', '100%')
    @$assessmentWidget.attr('height', 600)
    @$assessmentWidget.attr('id', 'client-widget')
    @$assessmentWidget.on('result-save', (event) ->
      $('.result').html(event.target.getAttribute('data-result'))
    )

    @$assessmentWidget.on('load', (event) ->
      console.log("loaded")
#      trigger rendered here?
    )

    @$el.find(".assessment").append(@$assessmentWidget)
    @trigger "rendered"

    return

