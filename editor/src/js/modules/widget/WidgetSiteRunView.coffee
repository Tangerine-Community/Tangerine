# WidgetRunView takes a list of subtests and the assessment as the model, stringifies it, and renders the Tangerine client widget.
# It listens for a result:saved:widget event from the client widget, which is created by the widgetPlay route in widget's router
# by the result:saved event thrown by AssessmentCompositeView from ResultItemView. It also listens for the result:saved:widget
# event to refresh the page when the user chooses "Perform another assessment"
class WidgetSiteRunView extends Backbone.View

  className : "WidgetSiteRunView"

  initialize: (options) ->
    @model = options.model
    groupPouch = new PouchDB(Tangerine.settings.get('groupName'))
    $('#footer').show()
    options =
      source: Tangerine.settings.location.group.db
      target: groupPouch
      complete: (info, result) ->
        Utils.logoSpinStop()
        if typeof info != 'undefined' && info != null && info.ok
          console.log "replicateToServer - onComplete: Replication is fine. "
          $('#messages').append(JSON.stringify(info))
#              Tangerine.router.landing(true)
        else
          console.log "replicateToServer - onComplete: Replication message: " + result
      change: (info, result) ->
        Utils.logoSpinStart()
#            $('#messages').html(info)
        doc_count = result?.doc_count
        doc_del_count = result?.doc_del_count
        total_docs = doc_count + doc_del_count
        doc_written = info.docs_written
        percentDone = Math.floor((doc_written/total_docs) * 100)
        if !isNaN  percentDone
          msg = "Change: docs_written: " + doc_written + " of " +  total_docs + ". Percent Done: " + percentDone + "%<br/>"
        else
          msg = "Change: docs_written: " + doc_written + "<br/>"
        console.log("Change; msg: " + msg)
        $('#messages').html(msg)
      error: (result) ->
        Utils.logoSpinStop()
        msg = "error: Replication error: " + JSON.stringify result
        console.log msg
        $('#messages').html(msg)
    try
      Utils.replicate(options)
    catch error
      console.log(error)

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

    # Spin the logo on ajax calls
    $(document).ajaxStart ->
      if $("#navigation-logo").attr("src") isnt "images/navigation-logo-spin.gif"
        $("#navigation-logo").attr "src", "images/navigation-logo-spin.gif"
    $(document).ajaxStop ->
      if $("#navigation-logo").attr("src") isnt "images/navigation-logo.png"
        $("#navigation-logo").attr "src", "images/navigation-logo.png"

    @$el.find(".assessment").append(@$appWidget)
    @trigger "rendered"

    return

