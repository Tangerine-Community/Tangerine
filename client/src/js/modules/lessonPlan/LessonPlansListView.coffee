class LessonPlansListView extends Backbone.View

  className: "LessonPlansListView"
  tagName: "ul"

  initialize: (options) ->
    @views = []
    @lessonPlans = options.lessonPlans
    @lessonPlans.on? "all", @render


  render: =>
##    return if @lessonPlans.length == 0
#    @$el.html "<h1>Lesson Plans</h1>"
#    @closeViews
#    # escape if no assessments in non-public list
#    if @lessonPlans.length == 0
#      @$el.html "<p class='grey'>No Lesson Plans yet. Click <b>new</b> to get started.</p>"
#      return @trigger "rendered"
#    @lessonPlans.each (lessonPlan) =>
#      view = new LessonPlanListElementView
#        "model"     : lessonPlan
#        "showAll"   : @showAll
#      view.render()
#      @$el.append view.el
#      @views.push view
#
#    @trigger "rendered"

    @closeViews()

    lessonPlans = @lessonPlans.models

    # create archived and active arrays of <li>
    activeViews   = []
    archivedViews = []
    for lessonPlan in lessonPlans

      newView = new LessonPlanListElementView
        "model"     : lessonPlan
        "showAll"   : @showAll

      activeViews.push newView

    @subviews = archivedViews.concat activeViews

#    @$el.html "<h1>Lesson Plans</h1>"

    # escape if no assessments in non-public list
#    if @subviews.length == 0
#      @$el.html "<p class='grey'>No lesson plans yet. Click <b>new</b> to get started.</p>"
#      return @trigger "rendered"


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
  
  onClose: ->
    @closeViews()
  
  closeViews: ->
    for view in @views
      view.close?()
  