class WorkflowSelectView extends Backbone.View

  events:
    'change input[type=checkbox]' : 'onCheckboxChange'

  initialize: (options) ->
    @[key] = value for key, value of options
    
    @ready = false
    @buttons = []

    @isAdmin = Tangerine.user.isAdmin()
    
    @workflows = new Workflows
    @workflows.fetch
      error: $.noop
      success: =>
        @ready = true
        @render()

  render: ->

    return unless @ready

    hiddenWorkflows = Tangerine.user.getPreferences("tutor-workflows", "hidden") || []

    htmlWorkflows = "<h1>Select Workflows</h1>"

    for workflow in @workflows.models
      checkedHtml = unless workflow.id in hiddenWorkflows
        "checked='checked'"
      else
        ""

      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:25px;'>
          <label for='#{workflow.id}-checkbox' data-id='#{workflow.id}'><input type='checkbox' #{checkedHtml} class='selectable' data-id='#{workflow.id}' id='#{workflow.id}-checkbox' #{if !@isAdmin then "disabled='disabled'" }>#{workflow.get('name')}</label>
        </li>
      "

    @$el.html htmlWorkflows

    return

  onClose: ->
    for button in @buttons
      button.close()

  onCheckboxChange: (event) ->
    $target = $(event.target)
    workflowId = $target.attr('data-id')

    return unless workflowId # don't respond to label clicks
    @$el.find("input").attr('disabled', 'disabled')

    hiddenWorkflows = Tangerine.user.getPreferences("tutor-workflows", "hidden") || []

    isChecked = $target.prop('checked')

    if not isChecked 
      hiddenWorkflows.push workflowId
    else if isChecked
      hiddenWorkflows = hiddenWorkflows.filter (e) -> (e != workflowId)
    
    Tangerine.user.setPreferences "tutor-workflows", "hidden", hiddenWorkflows, => 
      @$el.find("input").removeAttr("disabled")
      Utils.topAlert "Saved"

