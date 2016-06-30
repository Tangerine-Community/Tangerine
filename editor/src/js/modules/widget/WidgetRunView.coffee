class WidgetRunView extends Backbone.View

  className : "WidgetRunView"

  initialize: (options) ->
    @model = options.model

  render: ->
    @$el.html '<div class="assessment"></div>
      <h2>Output of result</h2>
      <div class="result"></div>'

    @$assessmentWidget = $(document.createElement('iframe'))
    @$assessmentWidget.attr('src', '/client/index.html#widget')
    @$assessmentWidget.attr('data-assessment', JSON.stringify(@model))
    @$assessmentWidget.attr('data-result', '{}')
    @$assessmentWidget.attr('width', 800)
    @$assessmentWidget.attr('height', 600)
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

