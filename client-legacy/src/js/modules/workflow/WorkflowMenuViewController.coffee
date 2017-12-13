class WorkflowMenuViewController extends Backbone.View
  render: ->
    (workflows = new Workflows).fetch
      success: =>
        feedbacks = new Feedbacks feedbacks
        feedbacks.fetch
          success: =>
            view = new WorkflowMenuView
              workflows : workflows
              feedbacks : feedbacks
            @$el.html(view.el)
            view.render()
