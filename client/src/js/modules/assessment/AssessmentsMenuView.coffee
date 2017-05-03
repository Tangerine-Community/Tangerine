class AssessmentsMenuView extends Backbone.View

  className: "AssessmentsMenuView"

  events:
    'click .import'           : 'import'
    'click .universal_upload' : 'universalUpload'
    'click .results'          : 'results'

  results: ->        Tangerine.router.navigate "dashboard", true
  universalUpload: -> Utils.universalUpload()
  gotoGroups: -> Tangerine.router.navigate "groups", true

  import:     -> Tangerine.router.navigate "import", true

  i18n: ->
    @text =
      "new"            : t("AssessmentsMenuView.button.new")
      apk              : t("AssessmentsMenuView.button.apk")
      groups           : t("AssessmentsMenuView.button.groups")
      universal_upload : t("AssessmentsMenuView.button.universal_upload")
      sample_helper   : "Sample helper"
      results          : t("AssessmentsMenuView.button.results")
      save             : t("AssessmentsMenuView.button.save")
      cancel           : t("AssessmentsMenuView.button.cancel")
      assessment  : t("AssessmentsMenuView.label.assessment")
      assessments : t("AssessmentsMenuView.label.assessments")
      curriculum  : t("AssessmentsMenuView.label.curriculum")


  initialize: (options) ->

    @i18n()

    @[key] = value for key, value of options

    @assessments.each (assessment) => assessment.on "new", @addAssessment

    @assessmentsView = new AssessmentsView
      "assessments" : @assessments
      "parent"      : @

  render: =>
    isAdmin = Tangerine.user.isAdmin()

    newButton     = "<button class='new command'>#{@text.new}</button>"
    apkButton     = "<button class='apk navigation'>#{@text.apk}</button>"
    groupsButton  = "<button class='navigation groups'>#{@text.groups}</button>"
    uploadButton  = "<button class='command universal_upload'>#{@text.universal_upload}</button>"
    syncTabletsButton = "<button class='command sync_tablets'>#{@text.sync_tablets}</button>"
    resultsButton = "<button class='navigation results'>#{@text.results}</button>"
    groupHandle   = "<h2 class='settings grey' data-attribtue='groupHandle'>#{Tangerine.settings.getEscapedString('groupHandle') || Tangerine.settings.get('groupName')}</h2>"

    html = "
      <section>
        <h1>#{@text.assessments}</h1>
    "

    html += "
        <div id='assessments_container'></div>
      </section>
      <br>
      #{uploadButton}

    "

    @$el.html html

    @assessmentsView.setElement( @$el.find("#assessments_container") )
    @assessmentsView.render()


  # ViewManager
  closeViews: ->
    @assessmentsView.close()

  onClose: ->
    @closeViews()
