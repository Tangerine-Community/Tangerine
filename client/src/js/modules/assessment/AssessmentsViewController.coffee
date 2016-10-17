class AssessmentsViewController extends Backbone.View
  
  render: ->
    assessments = new Assessments
    assessments.fetch
      success: =>
        assessmentsView = new AssessmentsMenuView
          assessments : assessments
        @$el.html(assessmentsView.el)
        assessmentsView.render()
