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

  universalUpload: -> Utils.universalUpload()

  apk: ->
    TangerineTree.make
      success: (data) ->
        a = document.createElement("a")
        a.href = Tangerine.settings.config.get("tree")
        Utils.sticky("<h1>APK link</h1><p><a href='http://#{a.host}/tree/#{data.token}'>#{a.host}/tree/#{data.token}</a></p>")
      error: (xhr, response) ->
        Utils.sticky response.message

  gotoGroups: -> Tangerine.router.navigate "groups", true

  import:     -> Tangerine.router.navigate "import", true

  i18n: ->
    @text =
      "new"            : t("AssessmentMenuView.button.new")
      import           : t("AssessmentMenuView.button.import")
      apk              : t("AssessmentMenuView.button.apk")
      groups           : t("AssessmentMenuView.button.groups")
      universal_upload : t("AssessmentMenuView.button.universal_upload")
      sync_tablets     : t("AssessmentMenuView.button.sync_tablets")
      results          : t("AssessmentMenuView.button.results")
      save             : t("AssessmentMenuView.button.save")
      cancel           : t("AssessmentMenuView.button.cancel")
      assessment  : t("AssessmentMenuView.label.assessment")
      assessments : t("AssessmentMenuView.label.assessments")
      curriculum  : t("AssessmentMenuView.label.curriculum")


  initialize: (options) ->

    @i18n()

    @[key] = value for key, value of options

    @assessments.each (assessment) => assessment.on "new", @addAssessment
    @curricula.each   (curriculum) => curriculum.on "new", @addCurriculum

    @curriculaListView = new CurriculaListView
      "curricula" : @curricula

    @assessmentsView = new AssessmentsView
      "assessments" : @assessments
      "parent"      : @

    @usersMenuView = new UsersMenuView

    if @curricula.length > 0
      groupPouch = new PouchDB(Tangerine.settings.get('groupName'))
      $('#footer').show()
      options =
        source: Tangerine.settings.location.group.db
        target: groupPouch
        complete: (info, result) ->
          Utils.logoSpinStop()
          if typeof info != 'undefined' && info != null && info.ok
            console.log "replicateToServer - onComplete: Replication is fine. "
            $('#messages').append(JSON.stringify(info))
  #              Tangerine.router.landing(true)
          else
            console.log "replicateToServer - onComplete: Replication message: " + result
        change: (info, result) ->
          Utils.logoSpinStart()
  #            $('#messages').html(info)
          doc_count = result?.doc_count
          doc_del_count = result?.doc_del_count
          total_docs = doc_count + doc_del_count
          doc_written = info.docs_written
          percentDone = Math.floor((doc_written/total_docs) * 100)
          if !isNaN  percentDone
            msg = "Change: docs_written: " + doc_written + " of " +  total_docs + ". Percent Done: " + percentDone + "%<br/>"
          else
            msg = "Change: docs_written: " + doc_written + "<br/>"
          console.log("Change; msg: " + msg)
          $('#messages').html(msg)
        error: (result) ->
          Utils.logoSpinStop()
          msg = "error: Replication error: " + JSON.stringify result
          console.log msg
          $('#messages').html(msg)
      try
        Utils.replicate(options)
      catch error
        console.log(error)


  render: =>

    isAdmin = Tangerine.user.isAdmin()

    newButton     = "<button class='new command'>#{@text.new}</button>"
    importButton  = "<button class='import command'>#{@text.import}</button>"
    apkButton     = "<button class='apk navigation'>#{@text.apk}</button>"
    groupsButton  = "<button class='navigation groups'>#{@text.groups}</button>"
    uploadButton  = "<button class='command universal_upload'>#{@text.universal_upload}</button>"
    syncTabletsButton = "<button class='command sync_tablets'>#{@text.sync_tablets}</button>"
    resultsButton = "<button class='navigation results'>#{@text.results}</button>"
    groupHandle   = "<h2 class='settings grey' data-attribtue='groupHandle'>#{Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')}</h2>"


    containers = []
    containers.push "<section id='curricula_container' class='CurriculaListView'></section>" if @curricula.length isnt 0
    containers.push "<section id='klass_container' class='KlassesView'></section>"         if @klasses.length isnt 0
    containers.push "<section id='teachers_container' class='TeachersView'></section>"     if @teachers.length isnt 0
    containers.push "<section id='users_menu_container' class='UsersMenuView'></section>"
    containers.push "<section id='workflow_menu_container' class='WorkflowMenuView'></section>"

    # Spin the logo on ajax calls
    $(document).ajaxStart ->
      if $("#navigation-logo").attr("src") isnt "images/navigation-logo-spin.gif"
        $("#navigation-logo").attr "src", "images/navigation-logo-spin.gif"
    $(document).ajaxStop ->
      if $("#navigation-logo").attr("src") isnt "images/navigation-logo.png"
        $("#navigation-logo").attr "src", "images/navigation-logo.png"

    html = "
      #{groupsButton}
      #{apkButton}
      #{resultsButton}
      #{groupHandle}
      <section>
        <h1>#{@text.assessments}</h1>
    "

    if isAdmin
      html += "
          #{newButton}
          #{importButton}

          <div class='new_form confirmation'>
            <div class='menu_box'>
              <input type='text' class='new_name' placeholder='Name'>
              <select id='new_type'>
                <option value='assessment'>#{@text.assessment}</option>
                <option value='curriculum'>#{@text.curriculum}</option>
              </select><br>
              <button class='new_save command'>#{@text.save}</button> <button class='new_cancel command'>#{@text.cancel}</button>
            </div>
          </div>
          <div id='assessments_container'></div>
        </section>

        #{containers.join('')}

      "
    else
      html += "
        <div id='assessments_container'></div>
      </section>
      "

    @$el.html html

    @assessmentsView.setElement( @$el.find("#assessments_container") )
    @assessmentsView.render()

    @curriculaListView.setElement( @$el.find("#curricula_container") )
    @curriculaListView.render()

    @usersMenuView.setElement( @$el.find("#users_menu_container") )
    @usersMenuView.render()

    @$el.find("#klass_container").remove()

    @$el.find("#teachers_container").remove()

    if Tangerine.settings.get('showWorkflows') == true
      @workflowMenuView = new WorkflowMenuView
        workflows : @workflows
        feedbacks : @feedbacks
      @workflowMenuView.setElement @$el.find("#workflow_menu_container")
      @workflowMenuView.render()


    @trigger "rendered"

    return


  addAssessment: (newOne) =>
    @assessments.add newOne
    newOne.on "new", @addAssessment

  addCurriculum: (newOne) =>
    @curricula.add newOne
    newOne.on "new", @addCurriculum

  # Making a new assessment
  newToggle: -> @$el.find('.new_form, .new').toggle(); false

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
      callback = @addAssessment
    else if newType == "curriculum"
      newObject = new Curriculum
        "name"         : name
        "_id"          : newId
        "curriculumId" : newId
      callback = @addCurriculum

    newObject.save null,
      success : =>
        callback(newObject)
        @$el.find('.new_form, .new').toggle()
        @$el.find('.new_name').val ""
        Utils.midAlert "#{name} saved"
      error: =>
        @$el.find('.new_form, .new').toggle()
        @$el.find('.new_name').val ""
        Utils.midAlert "Please try again. Error saving."

    return false

  # ViewManager
  closeViews: ->
    @assessmentsView.close()
    @curriculaListView.close()

  onClose: ->
    @closeViews()
