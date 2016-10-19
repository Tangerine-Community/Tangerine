class AssessmentsViewController extends Backbone.View
  
  render: ->
    assessments = new Assessments
    assessments.fetch
      success: =>
        assessmentsView = new AssessmentsView
          assessments : assessments
        @$el.html(assessmentsView.el)
        assessmentsView.render()
