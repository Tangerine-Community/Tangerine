class AssessmentsMenuView extends Backbone.View

  className: "AssessmentsMenuView"

  events:
    'keypress .new_name' : 'newSave'
    'click .new_save'    : 'newSave'
    'click .new_cancel'  : 'newToggle'
    'click .new'         : 'newToggle'
    'click .import'      : 'import'
    'click .apk'         : 'apk'
    'click .groups'      : 'gotoGroups'
    'click .universal_upload' : 'universalUpload'

    'click .sync_tablets' : 'syncTablets'

    'click .results'        : 'results'
    'click .settings'       : 'editInPlace'
    'keyup .edit_in_place'  : 'saveInPlace'
    'change .edit_in_place'  : 'saveInPlace'

  syncTablets: =>
    @tabletManager.sync()

  editInPlace: (event) ->
    return unless Tangerine.user.isAdmin()
    $target    = $(event.target)
    attribute  = $target.attr("data-attribtue")
    @oldTarget = $target.clone()
    classes = $target.attr("class").replace("settings","")
    margins = $target.css("margin")
    $target.after("<input type='text' style='margin:#{margins};' data-attribute='#{attribute}' class='edit_in_place #{classes}' value='#{_.escape($target.html())}'>")
    input = $target.next().focus()
    $target.remove()

  saveInPlace: (event) ->
    return if @alreadySaving
    if event.keyCode
      if event.keyCode == 27
        $(event.target).after(@oldTarget).remove()
        return
      else if event.keyCode != 13
        return true

    @alreadySaving = true
    $target   = $(event.target)
    attribute = $target.attr("data-attribute")
    value     = $target.val()

    updatedAttributes            = {}
    updatedAttributes[attribute] = value

    Tangerine.settings.save updatedAttributes, 
      success: =>
        @alreadySaving = false
        Utils.topAlert("Saved")
        $target.after(@oldTarget.html(value)).remove()
      error: =>
        @alreadySaving = false
        Utils.topAlert("Save error")
        $target.after(@oldTarget).remove()

  results: -> Tangerine.router.navigate "dashboard", true

  universalUpload: ->
    $.ajax 
      url: Tangerine.settings.urlView("local", "byCollection")
      type: "POST"
      dataType: "json"
      contentType: "application/json"
      data: JSON.stringify(
        keys : ["result"]
      )
      success: (data) ->
        rows = data.rows
        docList = []
        for result in rows
          docList.push result.id

        $.couch.replicate(
          Tangerine.settings.urlDB("local"),
          Tangerine.settings.urlDB("group"),
            timeout: 5 * 60 * 1000
            success: =>
              Utils.sticky "Results synced to cloud successfully."
            error: (code, message) =>
              Utils.sticky "Upload error<br>#{code} #{message}"
          ,
            doc_ids: docList
        )


  apk: ->
    TangerineTree.make
      success: (data) ->
        a = document.createElement("a")
        a.href = Tangerine.settings.config.get("tree")
        Utils.sticky("<h1>APK link</h1><p>#{a.host}/apk/#{data.token}</p>")
      error: (xhr, response) ->
        Utils.sticky response.error

  gotoGroups: -> Tangerine.router.navigate "groups", true

  import:     -> Tangerine.router.navigate "import", true

  initialize: (options) ->

    if Tangerine.settings.get("context") == "mobile"
      @tabletManager = new TabletManagerView
        docTypes : ["result"]
        callbacks: 
          completePull: => @tabletManager.pushDocs()


    @assessments = options.assessments
    @curricula = options.curricula

    @assessments.each (assessment) =>
      assessment.on "new", @addToCollection

    @curricula.each (curriculum) =>
      curriculum.on "new", @addToCollection

    @isAdmin = Tangerine.user.isAdmin()

    @curriculaListView = new CurriculaListView
      "curricula" : @curricula

    @assessmentsView = new AssessmentsView
      "assessments" : @assessments
      "parent"      : @

    @usersMenuView = new UsersMenuView

  render: =>
    newButton     = "<button class='new command'>New</button>"
    importButton  = "<button class='import command'>Import</button>"
    apkButton     = "<button class='apk navigation'>APK</button>"
    groupsButton  = "<button class='navigation groups'>Groups</button>"
    uploadButton  = "<button class='command universal_upload'>Universal Upload</button>"
    syncTabletsButton = "<button class='command sync_tablets'>Sync Tablets</button>"
    resultsButton = "<button class='navigation results'>Results</button>"
    groupHandle   = "<h2 class='settings grey' data-attribtue='groupHandle'>#{Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')}</h2>"

    html = "
      #{Tangerine.settings.contextualize(
        server : "
          #{groupsButton}
          #{apkButton}
          #{resultsButton} 
          #{groupHandle}
          "
        ) }
      <h1>Assessments</h1>
    "

    if @isAdmin
      html += "
        #{if Tangerine.settings.get("context") == "server" then newButton else "" }
        #{importButton}

        

        <div class='new_form confirmation'>
          <div class='menu_box_wide'>
            <input type='text' class='new_name' placeholder='Name'>
            <select id='new_type'>
              <option value='assessment'>Assessment</option>
              <option value='curriculum'>Curriculum</option>
            </select><br>
            <button class='new_save command'>Save</button> <button class='new_cancel command'>Cancel</button>
          </div>
        </div>
        <div id='assessments_container'></div>
        <div id='curricula_container'></div>
        <div id='klass_container'></div>
        <br>
        #{if Tangerine.settings.get("context") == "mobile" then syncTabletsButton else "" }
        #{if Tangerine.settings.get("context") == "mobile" then uploadButton else "" }

        <div id='users_menu_container' class='UsersMenuView'></div>
      "
    else
      html += "
        <div id='assessments_container'></div>
        <br>
        #{if Tangerine.settings.get("context") == "mobile" then syncTabletsButton else "" }
        #{if Tangerine.settings.get("context") == "mobile" then uploadButton else "" }
      "

    @$el.html html

    @assessmentsView.setElement( @$el.find("#assessments_container") )
    @assessmentsView.render()

    @curriculaListView.setElement( @$el.find("#curricula_container") )
    @curriculaListView.render()

    if Tangerine.settings.get("context") == "server"
      @usersMenuView.setElement( @$el.find("#users_menu_container") )
      @usersMenuView.render()
    

    @trigger "rendered"

    return

  addToCollection: (newAssessment) =>
    if newAssessment.has("curriculumId")
      @curricula.add newAssessment    
    else
      @assessments.add newAssessment
    newAssessment.on "new", @addToCollection

  # Making a new assessment
  newToggle: -> @$el.find('.new_form, .new').fadeToggle(250); false

  newSave: (event) =>

    # this handles ambiguous events
    # the idea is to support clicks and the enter key
    # logic:
    # it it's a keystroke and it's not enter, act normally, just a key stroke
    # if it's a click or enter, process the form

    if event.type != "click" && event.which != 13
      return true

    name    = @$el.find('.new_name').val()
    newType = @$el.find("#new_type option:selected").val()
    newId   = Utils.guid()

    if name.length == 0
      Utils.midAlert "<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>"
      return false

    if newType == "assessment"
      newObject = new Assessment
        "name"         : name
        "_id"          : newId
        "assessmentId" : newId
        "archived"     : false
    else if newType == "curriculum"
      newObject = new Curriculum
        "name"         : name
        "_id"          : newId
        "curriculumId" : newId

    newObject.save null,
      success : => 
        @addToCollection(newObject)
        @$el.find('.new_form, .new').fadeToggle(250, => @$el.find('.new_name').val(""))
        Utils.midAlert "#{name} saved"
      error: =>
        @$el.find('.new_form, .new').fadeToggle(250, => @$el.find('.new_name').val(""))
        Utils.midAlert "Please try again. Error saving."

    return false

  # ViewManager
  closeViews: ->
    @assessmentsView.close()
    @curriculaListView.close()

  onClose: ->
    @closeViews()
