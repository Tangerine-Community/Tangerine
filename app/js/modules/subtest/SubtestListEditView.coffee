class SubtestListEditView extends Backbone.View

  className: "SubtestListEditView"

  tagName : "ul"
  
  initialize: (options) ->
    @assessment = options.assessment
    @views = []

  render: =>
    @closeViews()
    @assessment.subtests.sort()
    @assessment.subtests.each (subtest) =>
      oneView = new SubtestListElementView
        "subtest" : subtest
      @views.push oneView
      oneView.render()
      oneView.on "subtest:delete", @deleteSubtest
      @$el.append oneView.el

  deleteSubtest: (subtest) =>
    @assessment.subtests.remove subtest
    subtest.destroy()
    
  closeViews: ->
    for view in @views
      view.close()
    @views = []
