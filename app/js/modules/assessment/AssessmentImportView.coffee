class AssessmentImportView extends Backbone.View

  className: "AssessmentImportView"

  events: 
    'click .import' : 'import'
    'click .back'   : 'back'
    'click .verify' : 'verify'
    'click .group_import' : 'groupImport'

  groupImport: ->

    $.ajax 
      url: Tangerine.settings.urlView("local", "byDKey"),
      type: "POST"
      contentType: "application/json"
      dataType: "json"
      data: JSON.stringify({})
      success: (data) =>
        keyList = []
        for datum in data.rows
          keyList.push datum.key
        keyList = _.uniq(keyList)

        $.ajax 
          url: Tangerine.settings.urlView "group", "assessmentsNotArchived"
          dataType: "jsonp"
          success: (data) =>
            dKeys = _.compact(doc.id.substr(-5, 5) for doc in data.rows).concat(keyList).join(" ")
            newAssessment = new Assessment
            newAssessment.on "status", @updateActivity
            newAssessment.updateFromServer dKeys
          error: (a, b) ->
            Utils.midAlert "Import error"

  verify: ->
    Tangerine.user.ghostLogin Tangerine.settings.upUser, Tangerine.settings.upPass

  initialize: (options) ->
    @noun = options.noun
    @connectionVerified = false

    if Tangerine.settings.get("context") != "server"
      @timer = setTimeout @verify, 20 * 1000
      # Ensure we have access to the group's documents on the server
      verReq = $.ajax 
        url: Tangerine.settings.urlView("group", "byDKey")
        dataType: "jsonp"
        data: keys: ["testtest"]
        timeout: 5000
        success: =>
          clearTimeout @timer
          @connectionVerified = true
          @render()

    else
      @connectionVerified = true
      @render()


    @docsRemaining = 0
    @serverStatus = "checking..."
    $.ajax
      dataType: "jsonp"
      url: Tangerine.settings.urlHost("group")
      success: (a, b) =>
        @serverStatus = "Ok"
        @updateServerStatus()
      error: (a, b) =>
        @serverStatus = "Not available"
        @updateServerStatus()

  updateServerStatus: ->
    @$el.find("#server_connection").html @serverStatus

  back: ->
    Tangerine.router.navigate "", true
    false

  import: =>

    dKey = @$el.find("#d_key").val()

    selectedGroup = @$el.find("select#group option:selected").attr('data-group') || ""

    return Utils.midAlert "Please select a group." if Tangerine.settings.get("context") == "server" && selectedGroup == "NONE"

    @newAssessment = new Assessment
    @newAssessment.on "status", @updateActivity
    @updateActivity()

    if selectedGroup == "LEGACY"
      @newAssessment.updateFromTrunk dKey
    else
      @newAssessment.updateFromServer dKey, selectedGroup

    @activeTaskInterval = 2# setInterval @updateFromActiveTasks, 3000


  updateFromActiveTasks: =>
    $.couch.activeTasks
      success: (tasks) => 
        for task in tasks
          if task.type.toLowerCase() == "replication"
            if not _.isEmpty(task.status) then @activity = task.status
            @updateProgress()


  updateActivity: (status, message) =>

    if message?
      read = written = failed = 0

      read    = message.docs_read    if message.docs_read?
      written = message.docs_written if message.docs_written?
      failed  = message.doc_write_failures if message.doc_write_failures?

      writtenPlural = if written != 1 then "s" else ""

      failures = "
        <b>#{failed}</b> failures<br>
      " if failed != 0

      changes = "No changes" if message.no_changes? && message.no_changes == true

    @$el.find(".status").fadeIn(250)

    @activity = ""
    if status == "import lookup"
      @activity = "Finding #{@noun}"
    else if status == "import success"
      clearInterval @activeTaskInterval
      headline = "Import successful"
      headline = "Nothing imported" if read == 0
      @activity = "#{headline}<br>
        <b>#{written}</b> document#{writtenPlural} written<br>
        #{failures || ""}
        #{changes || ""}
      "
      @updateProgress null, =>
        Utils.askToLogout() unless Tangerine.settings.get("context") == "server"
    else if status == "import error"
      clearInterval @activeTaskInterval
      @activity = "Import error: #{message}"

    @updateProgress()

  updateProgress: (key, callback={}) =>

    if key?
      if @importList[key]?
        @importList[key]++
      else
        @importList[key] = 1
  
    progressHTML = "<table>"

    for key, value of @importList
      progressHTML += "<tr><td>#{key.titleize().pluralize()}</td><td>#{value}</td></tr>"

    if @activity?
      progressHTML += "<tr><td colspan='2'>#{@activity}</td></tr>"

    progressHTML += "</table>"

    @$el.find("#progress").html progressHTML

    callback?()

  render: ->

    groupImport = "
      <button class='command group_import'>Group import</button>
    " if Tangerine.settings.get("context") != "server"

    groupSelector = "
      <select id='group'>
        <option data-group='NONE' selected='selected'>Please select a group</option>
        <option data-group='LEGACY'>Legacy Tangerine</option>
        #{("<option data-group='#{group}'>#{group}</option>" for group in Tangerine.user.get('groups')).join('')}
      </select>
    " if Tangerine.settings.get("context") == "server"

    if not @connectionVerified 
      importStep = "
        <section>
          <p>Please wait while your connection is verified.</p>
          <button class='command verify'>Try now</button>
          <p><small>Note: If verification fails, press back to return to previous screen and please try again when internet connectivity is better.</small></p>
        </section>
      "
    else
      importStep = "
        <div class='question'>
          <label for='d_key'>Download keys</label>
          
          <input id='d_key' value=''>
          #{groupSelector || ''}<br>
          <button class='import command'>Import</button> #{groupImport || ""}<br>
          <small>Server connection: <span id='server_connection'>#{@serverStatus}</span></small>
        </div>
        <div class='confirmation status'>
          <h2>Status<h2>
          <div class='info_box' id='progress'></div>
        </div>
      "

    @$el.html "

      <button class='back navigation'>Back</button>

      <h1>Tangerine Central Import</h1>

      #{importStep}

    "

    @trigger "rendered"

  onClose: ->
    clearTimeout @timer
