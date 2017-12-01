class AssessmentImportView extends Backbone.View

  className: "AssessmentImportView"

  events:
    'click .import' : 'import'
    'click .back'   : 'back'
    'click .verify' : 'verify'
    'click .group_import' : 'groupImport'
    'click .filedownload' : 'downloadSingleFile'

  groupImport: ->

    $.ajax
      url: Tangerine.settings.urlView("local", "byDKey"),
      type: "POST"
      contentType: "application/json"
      dataType: "json"
      data: "{}"
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

    @connectionVerified = true

    @docsRemaining = 0

    # there was a lot of server connection checking here
    # can probably get rid of more code / markup on another pass

    @serverStatus = "Ok"
    @updateServerStatus()

    @render()


  updateServerStatus: ->
    @$el.find("#server_connection").html @serverStatus

  back: ->
    Tangerine.router.landing()
    false

  import: =>

    dKey = @$el.find("#d_key").val()

    selectedGroup = @$el.find("select#group option:selected").attr('data-group') || ""

    return Utils.midAlert "Please select a group." if selectedGroup == "NONE"

    @newAssessment = new Assessment
    @newAssessment.on "status", @updateActivity
    @updateActivity()

    if selectedGroup == "IrisCouch"
      @newAssessment.updateFromIrisCouch dKey
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

      read    = message.docs_read
      written = message.docs_written
      failed  = message.doc_write_failures

      writtenPlural = "s" if written != 1

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
        <b>#{written}</b> document#{writtenPlural || ''} written<br>
        #{failures || ''}
        #{changes || ''}
      "
      @updateProgress null
    else if status == "import error"
      clearInterval @activeTaskInterval
      @activity = "Import error: " + JSON.stringify(message)

    @updateProgress()

  updateProgress: (key, callback=$.noop) =>

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

    callback()

  render: ->



    groupSelector = "
      <select id='group'>
        <option data-group='NONE' selected='selected'>Please select a group</option>
        #{Tangerine.user.groups().admin.map( (group) -> "<option data-group='#{_.escape(group)}'>#{group}</option>").join('')}
      </select>
    "

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
          <button class='import command'>Import</button> <br>
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

      <a id='download-" + Tangerine.$db.name + "' download=''" + Tangerine.$db.name + ".json'>Download</a>
      <input type='file' id='fileinput' />
      <button class='filedownload command'>Download</button>
      #{importStep}

    "
    readSingleFile = (evt) -> 
 
       f = evt.target.files[0]  
 
       if (f) 
         r = new FileReader()
         r.onload = (e) -> 
             contents = e.target.result             
             ct = r.result
             try 
               docs = JSON.parse(ct)

               Tangerine.$db.bulkSave {docs: docs}
             catch 
               alert('Could not parse the file you uploaded.')
               console.log e
         r.readAsText(f)
       else 
         alert("Failed to load file")
 
      @$el.find('#fileinput')[0].addEventListener('change', readSingleFile, false)
    @trigger "rendered"

  
  
  downloadFile = (filename, text) -> 
    #element = document.createElement('a')
    element = document.getElementById('download-'+Tangerine.$db.name)
    element.setAttribute('href' ,'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    #element.setAttribute('id', "download-" + filename)
    #element.setAttribute('download', filename)
    #element.style.display = 'none'
    #document.body.appendChild(element)
    #element.click()
    #document.body.removeChild(element)
    

  downloadSingleFile: ->
      $.ajax
        url: Tangerine.settings.urlView("group", "byDKey") + "?include_docs=true",
        contentType: "application/json"
        dataType: "json"
        data: "{}"
        error: (a, b, c) ->
           Utils.midAlert "Download error"
        success: (data) ->
          srt = Tangerine.$db.name
          str = srt.replace("undefined", "")
          documents = []
          for row in data.rows
            documents.push row.doc
          console.log("Success:" + str)
          downloadFile(Tangerine.$db.name + ".json", JSON.stringify(documents))
  onClose: ->
    clearTimeout @timer

  
