# WidgetRunView takes a list of subtests and the assessment as the model, stringifies it, and renders the Tangerine client widget.
class WidgetRunView extends Backbone.View

  className : "WidgetRunView"

  initialize: (options) ->
    @model = options.model

  render: ->
    $('#footer').hide()
    @$el.html '<div class="assessment"></div>
      <div class="assessment-widget-result"></div>'

    @$assessmentWidget = $(document.createElement('iframe'))
    @$assessmentWidget.attr('src', '/client/index.html#widget')
    @$assessmentWidget.attr('data-assessment', JSON.stringify(@model))
    @$assessmentWidget.attr('data-result', '{}')
    @$assessmentWidget.attr('width', '100%')
    @$assessmentWidget.attr('height', 600)
    @$assessmentWidget.attr('id', 'client-widget')
    @$assessmentWidget.on('result-save', (event) ->
      console.log("saving...")
      $('.result').html(event.target.getAttribute('data-result'))
    )
    @$assessmentWidget.on('result-saved', (event) ->
      console.log("saved")
    )

    @$assessmentWidget.on('load', (event) ->
      console.log("loaded")
#      trigger rendered here?
      $('#client-widget').find(".save").click(() ->
          alert("test")
        )
#      $('body', $('#client-widget').contents()).click((event) ->
#        console.log('Clicked! ' + event.pageX + ' - ' + event.pageY);
#      );
      iframe = $('#client-widget').contents();
      iframe.on('result-saved', (event) ->
        console.log("saved iframe")
      )
#      iframe.find(".save").click(() ->
#        alert("test")
#      )
    )

    @$el.find(".assessment").append(@$assessmentWidget)
    @trigger "rendered"

    return

