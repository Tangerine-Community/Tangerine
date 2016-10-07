class AssessmentsMenuView extends Backbone.View

  className: "AssessmentsMenuView"

  events:
    'click .import'      : 'import'
    'click .universal_upload' : 'universalUpload'
    'click .sync_tablets' : 'syncTablets'
    'click .results'        : 'results'
    'click .emergency_sync'        : 'emergencySync'
    'click .save_to_disk'        : 'saveToDisk'

  syncTablets: =>
    @tabletManager.sync()

  results: -> Tangerine.router.navigate "dashboard", true

  universalUpload: -> Utils.universalUpload()

  emergencySync: -> Utils.replicateToServer(null,null)

  apk: ->
    TangerineTree.make
      success: (data) ->
        a = document.createElement("a")
        a.href = Tangerine.settings.config.get("tree")
        Utils.sticky("<h1>APK link</h1><p>#{a.host}/apk/#{data.token}</p>")
      error: (xhr, response) ->
        Utils.sticky response.error

  saveToDisk: ->
    Utils.saveDocListToFile()

  gotoGroups: -> Tangerine.router.navigate "groups", true

  import:     -> Tangerine.router.navigate "import", true

  i18n: ->
    @text =
      "new"            : t("AssessmentMenuView.button.new")
      apk              : t("AssessmentMenuView.button.apk")
      groups           : t("AssessmentMenuView.button.groups")
      universal_upload : t("AssessmentMenuView.button.universal_upload")
      emergency_sync : t("AssessmentMenuView.button.emergency_sync")
      sync_tablets     : t("AssessmentMenuView.button.sync_tablets")
      results          : t("AssessmentMenuView.button.results")
      save             : t("AssessmentMenuView.button.save")
      cancel           : t("AssessmentMenuView.button.cancel")
      save_to_disk  : t("AssessmentMenuView.button.save_to_disk")
      assessment  : t("AssessmentMenuView.label.assessment")
      assessments : t("AssessmentMenuView.label.assessments")
      curriculum  : t("AssessmentMenuView.label.curriculum")

  initialize: (options) ->

    @i18n()

    @tabletManager = new TabletManagerView
      docTypes : ["result"]
      callbacks:
        completePull: => @tabletManager.pushDocs()

    @[key] = value for key, value of options
      
#    @assessments.each (assessment) => assessment.on "new", @addAssessment
    @lessonPlans.each   (lessonPlan) =>
      lessonPlan.on "new", @addLessonPlan
#      subject = Tangerine.enum.subjects[lessonPlan.get("lessonPlan_subject")]
#      grade   = lessonPlan.get("lessonPlan_grade")
      week    = lessonPlan.get("lessonPlan_week")
      day     = lessonPlan.get("lessonPlan_day")
      id      = lessonPlan.get("_id")
      console.log("Lessons available: " + [week, day, id])
      if week == '1' && day == '1'
        Tangerine.firstLessonId = id
        console.log("firstLesson: " + [week, day, id])
      Tangerine.available.push [week, day, id]
    console.log("navigating to " + Tangerine.firstLessonId)
    Tangerine.router.navigate "runMar/" + Tangerine.firstLessonId, false
    window.location.reload()

    @lessonPlansListView = new LessonPlansListView
      "lessonPlans" : @lessonPlans
      "parent"      : @

  render: =>

    isAdmin = Tangerine.user.isAdmin()
    
    newButton     = "<button class='new command'>#{@text.new}</button>"
    apkButton     = "<button class='apk navigation'>#{@text.apk}</button>"
    groupsButton  = "<button class='navigation groups'>#{@text.groups}</button>"
    uploadButton  = "<button class='command universal_upload'>#{@text.universal_upload}</button>"
    emergencySyncButton  = "<button class='command emergency_sync'>#{@text.emergency_sync}</button>"
    syncTabletsButton = "<button class='command sync_tablets'>#{@text.sync_tablets}</button>"
    resultsButton = "<button class='navigation results'>#{@text.results}</button>"
    saveToDiskButton = "<button class='command save_to_disk'>#{@text.save_to_disk}</button>"
    groupHandle   = "<h2 class='settings grey' data-attribtue='groupHandle'>#{Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')}</h2>"

    html = "
      <section>
        <h1>Lesson Plans</h1>
    "

    html += "
        <div id='lessonPlans_container'></div>
      </section>
    "

    @$el.html html

    @lessonPlansListView.setElement( @$el.find("#lessonPlans_container") )
    @lessonPlansListView.render()


  # ViewManager
  closeViews: ->
    @lessonPlansListView.close()

  onClose: ->
    @closeViews()
