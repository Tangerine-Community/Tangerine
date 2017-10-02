# Displays a group header and a list of assessments
# events
# re-renders on @assessments "add destroy"
#
class AssessmentsView extends Backbone.View

  className : "AssessmentsView"
  tagName : "section"

  events :
    "click .toggle_archived" : "toggleArchived"

  toggleArchived: (event) ->

    if @archivedIsVisible
      @archivedIsVisible = false
      $container = @$el.find(".archived_list").addClass "confirmation"
      @$el.find(".toggle_archived").html "Show"
    else
      @archivedIsVisible = true
      $container = @$el.find(".archived_list").removeClass "confirmation"
      @$el.find(".toggle_archived").html "Hide"

  initialize: (options) ->

    options.assessments.on "add destroy remove update", @render

    @parent      = options.parent
    @assessments = options.assessments

    @subviews          = [] # used to keep track of views to close
    @archivedIsVisible = false # toggled


  render: (event) =>

    @closeViews()

    assessments = @assessments.models

    # create archived and active arrays of <li>
    activeViews   = []
    archivedViews = []
    for assessment in assessments

      newView = new AssessmentListElementView
        "model"     : assessment
        "showAll"   : @showAll


      if assessment.isArchived()
        archivedViews.push newView
      else
        activeViews.push newView

    @subviews = archivedViews.concat activeViews

    # escape if no assessments in non-public list
    if @subviews.length == 0
      @$el.html "<p class='grey'>No assessments yet. Click <b>new</b> to get started.</p>"
      return @trigger "rendered"


    # templating and components

    archivedContainer = "
      <div class='archived_container'>
        <h2>Archived (#{archivedViews.length}) <button class='command toggle_archived'>Show</button></h2>
        <ul class='archived_list assessment_list confirmation'></ul>
      </div>
    "

    showArchived = archivedViews.length != 0

    @$el.html "
      <ul class='active_list assessment_list'></ul>
      #{ if showArchived then archivedContainer else "" }
    "

    # fill containers
    $ul = @$el.find(".active_list")
    for view in activeViews
      view.render()
      $ul.append view.el

    if showArchived
      $ul = @$el.find(".archived_list")
      for view in archivedViews
        view.render()
        $ul.append view.el

    # all done
    @trigger "rendered"

  closeViews: ->
    for view in @subviews
      view.close()
    @subviews = []

  onClose: ->
    @closeViews()