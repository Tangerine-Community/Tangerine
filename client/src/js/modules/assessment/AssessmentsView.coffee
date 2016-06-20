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

    @assessments = options.assessments

    @subviews          = [] # used to keep track of views to close
    @archivedIsVisible = false # toggled


  render: (event) =>

    @closeViews()

    # escape if no assessments in non-public list
    if @assessments.length is 0
      return @$el.html "<p class='grey'>No assessments.</p>"

    @subviews  = []
    htmlList = ""

    @assessments.each (assessment) =>

      newView = new AssessmentListElementView
        "model"     : assessment
        "showAll"   : @showAll

      @subviews.push newView
      htmlList += "<li class='AssessmentListElementView' id='#{assessment.id}'></li>"

    @$el.html "
      <ul class='active_list assessment_list'>
        #{htmlList}
      </ul>
    "

    for view in @subviews
      view.setElement(@$el.find("##{view.model.id}")).render()

  closeViews: ->
    for view in @subviews
      view.close()
    @subviews = []

  onClose: ->
    @closeViews()