class WorkflowMenuView extends Backbone.View

  className : "WorkflowMenuView"

  events:
    "click .workflow-new"    : 'new'
    "click .workflow-delete" : "delete"
    "click .workflow-run"    : "run"
    "click .workflow-edit"   : "edit"
    "click .workflow-csv"    : "csvPromptMonth"
    'click .remove-resume'   : 'removeResume'

  removeResume: (event) ->

    $target = $(event.target)
    workflowId = $target.attr("data-workflowId")
    tripId     = $target.attr("data-tripId")
    return unless confirm "Are you sure you want to remove the option to resume this workflow?"

    incomplete = Tangerine.user.getPreferences("tutor-workflows", "incomplete") || {}

    incomplete[workflowId] = _(incomplete[workflowId]).without tripId

    Tangerine.user.setPreferences "tutor-workflows", "incomplete", incomplete, =>
      @updateWorkflows()

  new: ->
    guid = Utils.guid()
    Tangerine.router.navigate "workflow/edit/#{guid}", false
    workflow = new Workflow "_id" : guid
    view = new WorkflowEditView workflow : workflow
    vm.show view

  delete: (event) ->
    $target = $(event.target)
    workflowId = $target.parent("li").attr('id')
    name = @workflows.get(workflowId).get('name')
    if confirm "Are you sure you want to delete workflow #{name}?"
      @workflows.get(workflowId).destroy
        success: =>
          @render()

  MONTHS: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  csvPromptMonth: (event) ->
    $target = $(event.target)

    workflowTitle = $target.parent().find(".workflow-title").html
    reportUrl = $target.attr('href')

    d = new Date
    thisMonth = d.getMonth() + 1
    thisYear  = d.getFullYear()

    modalContent = "
      <div id='csvReportForm'>
      <h1>CSV Reporting</h1>
      <input id='csvUrl' name='csvUrl' type='hidden' value='#{reportUrl}'>
      <p>Select the month that you would like to generate:</p>
      <label for='csvYear'>Year:</label>
      <select id='csvYear' name='csvYear'>
        #{("<option  value='#{year}' #{if year is thisYear then 'selected' else ''}>#{year}</option>" for year in [thisYear-1..thisYear+1]).join('')}
      </select>
      <br/>
      <label for='csvMonth'>Month:</label>
      <select id='csvMonth' name='csvName'>
        #{("<option  value='#{index}' #{if index is thisMonth then 'selected="true"' else ''}>#{@MONTHS[index]}</option>"  for index in [1..12]).join('')}
      </select>
      <br/>
      <button class='command' data-action='cancel'>Cancel</button>
      <button class='command' data-action='generate'>Generate Report</button>
      </div>
    "
    
    Utils.modal modalContent

    $button = $("#csvReportForm button")

    $button.on "click", (event) ->
      $button.off "click"

      if $(event.target).attr("data-action") == "generate"

        $csvUrl = $("#csvReportForm #csvUrl").val()
        $csvYear = $("#csvReportForm #csvYear option:selected").val()
        $csvMonth = $("#csvReportForm #csvMonth").val()

        url = [
          $csvUrl
          $csvYear
          $csvMonth
        ].join('/')
        
        document.location = url

      Utils.modal false

    false

  initialize: (options) ->
    @[key] = value for key, value of options
    @workflows = new Workflows
    @workflows.fetch
      success: =>
        @feedbacks = new Feedbacks 
        @feedbacks.fetch
          success: =>
            @ready = true
            @render()

  render: ->

    return unless @ready is true

    htmlWorkflows = ""

    for workflow in @workflows.models
      
      csvUrl = "/brockman/workflow/#{Tangerine.db_name}/#{workflow.id}"
      
      feedback = @feedbacks.get(workflow.id+"-feedback")

      if feedback? and feedback.get("children")?.length > 0
        feedbackHtml = "<a href='#feedback/#{workflow.id}'>feedback</a>"
      else
        feedbackHtml = ""

      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:15px;'>
          <span class='workflow-title'>#{workflow.get('name')}</span>
          <br>
          <!--- <a href='#workflow/run/#{workflow.id}'>run</a> --->
          #{feedbackHtml}
          <a href='#workflow/edit/#{workflow.id}'>edit</a>
          <a class='workflow-csv' href='#{csvUrl}'>csv</a>
          <span class='workflow-delete link'>delete</span>
        </li>
        "

    @$el.html "
      <h1>Workflows</h1>
      <button class='workflow-new command'>New</button>
      <ul class='workflow-menu'>#{htmlWorkflows}</ul>
    "


  renderMobile: =>

    @$el.html "
      <ul class='workflow-menu'></ul>
    "

    @updateWorkflows()
    
    @trigger "rendered"

  updateWorkflows: ->

    hiddenWorkflows = Tangerine.user.getPreferences("tutor-workflows", "hidden") || []

    htmlWorkflows = ""

    @workflows.models.sort( (a,b) ->
      if a.get('name').toLowerCase() < b.get('name').toLowerCase()
        return -1
      else if a.get('name').toLowerCase() > b.get('name').toLowerCase()
        return 1
      else
        return 0
    )

    for workflow in @workflows.models
      continue if workflow.id in hiddenWorkflows

      feedback = @feedbacks.get(workflow.id+"-feedback")

      if workflow.getBoolean("enableFeedback") and feedback? and feedback.get("children")?.length > 0
        feedbackHtml = "<button class='command'><a href='#feedback/#{workflow.id}'>Feedback</a></button>"
      else
        feedbackHtml = ""

      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:12px; padding-bottom: 12px; border-bottom: 1px solid #eee;'>
            <a href='#workflow/run/#{workflow.id}' class='workflow-button-link'>#{workflow.get('name')}</a>
            #{feedbackHtml}
            <div id='resume-workflow-#{workflow.id}'></div>
        </li>
        "
    @$el.find(".workflow-menu").html htmlWorkflows

    @renderResumeInfo()

  renderResumeInfo: ->

      incompleteWorkflows = Tangerine.user.getPreferences('tutor-workflows', 'incomplete') || {}

      for workflowId, tripIds of incompleteWorkflows
        if tripIds.length isnt 0
          for tripId in tripIds
            Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
              key: tripId
              include_docs : true
              success: (data) =>
                first = data.rows[0].doc
                timeAgo = moment(first.updated).fromNow()
                @$el.find("#resume-workflow-#{first.workflowId}").append "
                  <a href='#workflow/resume/#{first.workflowId}/#{first.tripId}'><button class='command'>Resume</button></a> #{timeAgo} <button class='command remove-resume' data-workflowId='#{first.workflowId}' data-tripId='#{first.tripId}'>X</button><br>
                "
