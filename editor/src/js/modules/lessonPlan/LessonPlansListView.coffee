class LessonPlansListView extends Backbone.View

  className: "LessonPlansListView"
  tagName: "ul"

  initialize: (options) ->
    @views = []
    @lessonPlans = options.lessonPlans
    @lessonPlans.on? "all", @render


  render: =>
#    return if @lessonPlans.length == 0
    @$el.html "<h1>Lesson Plans</h1>"
    @closeViews
    # escape if no assessments in non-public list
    if @lessonPlans.length == 0
      @$el.html "<p class='grey'>No Lesson Plans yet. Click <b>new</b> to get started.</p>"
      return @trigger "rendered"
    @lessonPlans.each (lessonPlan) =>
      view = new LessonPlanListElementView
        "lessonPlan" : lessonPlan
      view.render()
      @$el.append view.el
      @views.push view

    @trigger "rendered"
  
  onClose: ->
    @closeViews()
  
  closeViews: ->
    for view in @views
      view.close?()
  