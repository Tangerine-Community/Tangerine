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
        groupName = Tangerine.settings.get('groupName')
        languageCodes = {
          af_somali: 'SO',
          amharic: 'AM',
          afaan_oromo: 'OR',
          hadiyysa: 'HY',
          sidaamu_affo: 'SD',
          tigrinya: 'TG',
          wolayttatto: 'WT'
        }
        language = languageCodes[groupName];
        if typeof language == 'undefined'
          language = groupName
        Utils.sticky("<h1>APK link</h1><p><a href='http://#{a.host}/tree/#{data.token}/#{language}'>#{a.host}/tree/#{data.token}/#{language}</a></p>")
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
      lesson_plans : t("AssessmentMenuView.label.lesson_plans")
      curriculum  : t("AssessmentMenuView.label.curriculum")
      lesson_plan  : t("AssessmentMenuView.label.lesson_plan")

  initialize: (options) ->

    @i18n()

    @[key] = value for key, value of options

    @assessments.each (assessment) => assessment.on "new", @addAssessment
    @curricula.each   (curriculum) => curriculum.on "new", @addCurriculum
    Tangerine.available = [];
    Tangerine.firstLessonId = null;
    @lessonPlans.each   (lessonPlan) =>
      lessonPlan.on "new", @addLessonPlan
#      subject = Tangerine.enum.subjects[lessonPlan.get("lessonPlan_subject")]
#      grade   = lessonPlan.get("lessonPlan_grade")
      week    = lessonPlan.get("lessonPlan_week")
      day     = lessonPlan.get("lessonPlan_day")
      id      = lessonPlan.get("_id")
#      console.log("Lessons available: " + [week, day, id])
      if week == '1' && day == '1'
        Tangerine.firstLessonId = id
#        console.log("firstLesson: " + [week, day, id])
      Tangerine.available.push [week, day, id]
#    console.log("navigating to " + Tangerine.firstLessonId)
#    Tangerine.router.navigate "run/" + Tangerine.firstLessonId, false
#    window.location.reload()

    @curriculaListView = new CurriculaListView
      "curricula" : @curricula

    @lessonPlansListView = new LessonPlansListView
      "lessonPlans" : @lessonPlans
      "parent"      : @

    @assessmentsView = new AssessmentsView
      "assessments" : @assessments
      "parent"      : @

    @usersMenuView = new UsersMenuView

  render: =>

#    Tangerine.LessonMenuView   = new LessonMenuView available: Tangerine.available
#    dashboardLayout.headerRegion.reset();
#    dashboardLayout.headerRegion.show(Tangerine.LessonMenuView)
#    Tangerine.LessonMenuView.setElement($("#menu")).render()


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



    html = "
      #{groupsButton}
      #{apkButton}
      #{resultsButton}
      #{groupHandle}
      <section>
        <h1>#{@text.lesson_plans}</h1>
    "

    if isAdmin
      html += "
          #{newButton}
          #{importButton}

          <div class='new_form confirmation'>
            <div class='menu_box'>
              <input type='text' class='new_name' placeholder='Name'>
              <select id='new_type'>
                <option value='lesson_plan'>#{@text.lesson_plan}</option>
              </select><br>
              <button class='new_save command'>#{@text.save}</button> <button class='new_cancel command'>#{@text.cancel}</button>
            </div>
          </div>
          <div id='assessments_container'></div>
          <div id='lessonPlans_container'></div>
        </section>

        #{containers.join('')}

      "
    else
      html += "
        <div id='assessments_container'></div>
        <div id='lessonPlans_container'></div>
      </section>
      "

    @$el.html html

    @assessmentsView.setElement( @$el.find("#assessments_container") )
    @assessmentsView.render()

    @curriculaListView.setElement( @$el.find("#curricula_container") )
    @curriculaListView.render()

    @lessonPlansListView.setElement( @$el.find("#lessonPlans_container") )
    @lessonPlansListView.render()

    @usersMenuView.setElement( @$el.find("#users_menu_container") )
    @usersMenuView.render()

    if @klasses.length > 0
      @klassesView = new KlassesView
        klasses : @klasses
        curricula : @curricula
        teachers : @teachers
      @klassesView.setElement @$el.find("#klass_container")
      @klassesView.render()
    else
      @$el.find("#klass_container").remove()


    if @teachers.length > 0
      @teachersView = new TeachersView
        teachers : @teachers
        users : @users
      @teachersView.setElement @$el.find("#teachers_container")
      @teachersView.render()
    else
      @$el.find("#teachers_container").remove()



    @trigger "rendered"

    return


  addAssessment: (newOne) =>
    @assessments.add newOne
    newOne.on "new", @addAssessment

  addCurriculum: (newOne) =>
    @curricula.add newOne
    newOne.on "new", @addCurriculum

  addLessonPlan: (newOne) =>
    @lessonPlans.add newOne
    newOne.on "new", @addLessonPlan

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
    else if newType == "lesson_plan"
      newObject = new LessonPlan
        "name"         : name
        "lessonPlan_title"         : name
        "_id"          : newId
        "lessonPlanId" : newId
      callback = @addLessonPlan

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
