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
      oneView.on "subtest:copy", @copySubtest
      @$el.append oneView.el

  copySubtest: (targetAssessmentId, subtestId) =>
    Utils.midAlert "Copying..."
    subtests = @views.filter( (view) -> view.selected == true ).map( (view) -> view.model )

    if subtests.length is 0 
      subtests = [@assessment.subtests.get(subtestId)]
    
    targetSubtestCount = 0
    (new Subtests).fetch
      key: + targetAssessmentId
      success: (collection) =>

        targetSubtestCount = collection.length
        newSubtestCount = 0
        doOne = ->
          if subtests.length
            subtest = subtests.shift()
            newSubtestCount++
            subtest.copyTo 
              assessmentId : targetAssessmentId
              order: targetSubtestCount + newSubtestCount
              callback: -> doOne()
          else
            Tangerine.router.navigate("edit/#{targetAssessmentId}", true)
        doOne()

  deleteSubtest: (subtest) =>
    @assessment.subtests.remove subtest
    subtest.destroy()
    
  closeViews: ->
    for view in @views
      view.close()
    @views = []
