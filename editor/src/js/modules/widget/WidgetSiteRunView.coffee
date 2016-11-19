# WidgetRunView takes a list of subtests and the assessment as the model, stringifies it, and renders the Tangerine client widget.
# It listens for a result:saved:widget event from the client widget, which is created by the widgetPlay route in widget's router
# by the result:saved event thrown by AssessmentCompositeView from ResultItemView. It also listens for the result:saved:widget
# event to refresh the page when the user chooses "Perform another assessment"
class WidgetSiteRunView extends Backbone.View

  className : "WidgetSiteRunView"

  initialize: (options) ->
    @model = options.model

  render: ->
    $('#footer').hide()
    @$el.html "<div class='assessment'></div>
      <div class='assessment-widget-result'></div>"
    @$appWidget = $(document.createElement('iframe'))
    groupName = Tangerine.settings.get('groupName')
    @$appWidget.attr('src', '/client/index-dev.html#widgetSiteLoad/' + groupName)
    @$appWidget.attr('data-assessment', JSON.stringify(@model))
    @$appWidget.attr('data-result', '{}')
    @$appWidget.attr('width', '100%')
    @$appWidget.attr('height', 800)
    @$appWidget.attr('id', 'client-widget')


    @$el.find(".assessment").append(@$appWidget)
    @trigger "rendered"

    return

