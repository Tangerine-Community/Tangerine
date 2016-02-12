class AssessmentListElementView extends Backbone.View

  className : "AssessmentListElementView"

  tagName : "li"

  events:
    'click .assessment_menu_toggle'    : 'assessmentMenuToggle'
    'click .admin_name'                : 'assessmentMenuToggle'
    'click .assessment_delete'         : 'assessmentDeleteToggle'
    'click .assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'click .assessment_delete_confirm' : 'assessmentDelete'
    'click .copy'                      : 'copyTo'
    'click .duplicate'                 : 'duplicate'
    'click .archive'                   : 'archive'
    'click .update'                    : 'update'
    'click .print'                     : 'togglePrint'
    'change #print_format'             : 'print'

  blankResultCount: "-"

  initialize: (options) ->

    # events
    # options.model.on "resultCount", @updateResultCount

    #arguments
    @model    = options.model
    @parent   = options.parent

    # switches and things
    @isAdmin     = Tangerine.user.isAdmin()

  duplicate: ->
    newName = "Copy of " + @model.get("name")
    @model.duplicate { name : newName }, null, null, (assessment) => 
      @model.trigger "new", assessment

  copyTo: (group) ->
    @model.replicate group, =>
      window.location = Tangerine.settings.urlIndex(group, "assessments")

  ghostLogin: =>
    Tangerine.user.ghostLogin Tangerine.settings.upUser, Tangerine.settings.upPass

  update: =>
    Utils.midAlert "Verifying connection"
    Utils.working true

    @model.verifyConnection
      error: =>
        Utils.working false
        Utils.midAlert "Verifying connection<br>Please retry update."
        _.delay =>
          @ghostLogin()
        , 5000

      success: =>
        Utils.working false
        @model.on "status", (message) =>
          if message == "import lookup"
            Utils.midAlert "Update starting"
          else if message == "import success"
            Utils.midAlert "Updated"
            Utils.working false
            @model.fetch
              success: =>
                @render()
          else if message == "import error"
            Utils.working false
            Utils.midAlert "Update failed"
        Utils.working true
        @model.updateFromServer()

  togglePrint: ->
    @$el.find(".print_format_wrapper").fadeToggle(150)

  print: ->
    format = @$el.find("#print_format option:selected").attr("data-format")

    if format == "cancel"
      @$el.find(".print_format_wrapper").fadeToggle 150, =>
        @$el.find("#print_format").val("reset")
      return

    Tangerine.router.navigate "print/#{@model.id}/#{format}", true


  updateResultCount: =>
    #@resultCount = Math.commas @model.resultCount
    #@$el.find(".result_count").html "Results <b>#{@resultCount}</b>" 

  archive: ->
    result = @$el.find(".archive :selected").val() == "true"
    if result == true
      @$el.find(".admin_name").addClass "archived_assessment"
    else
      @$el.find(".admin_name").removeClass "archived_assessment"
    
    @model.save
      archived : result
    return true

  assessmentMenuToggle: ->
    @$el.find('.assessment_menu_toggle').toggleClass 'icon_down'
    @$el.find('.assessment_menu').fadeToggle(250)

  assessmentDeleteToggle: -> @$el.find(".assessment_delete_confirm").fadeToggle(250); false

  # deep non-gerneric delete
  assessmentDelete: =>
    # remove from collection
    @model.destroy()

  render: ->

    isArchived = @model.getBoolean('archived')

    # do not display archived assessments for enumerators
    return if not @isAdmin and isArchived and Tangerine.settings.get("context") == "mobile"
    
    # commands

    # indicators and variables
    archiveClass     = if isArchived then " archived_assessment" else ""

    toggleButton     = "<span class='assessment_menu_toggle icon_ryte'> </span>"
    name             = "<span class='name clickable '>#{@model.get('name')}</span>"
    adminName        = "<span class='admin_name clickable #{archiveClass}'>#{@model.get('name')}</span>"
    adminResultCount = "<label class='result_count small_grey no_help' title='Result count. Click to update.'>Results <b>#{@resultCount}</b></label>"
    resultCount      = "<span class='result_count no_help'>Results <b>#{@resultCount}</b></span>"
    selected         = " selected='selected'"
      
    # navigation
    editButton      = "<a href='#edit/#{@model.id}'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>"
    runButton       = "<a href='#run/#{@model.id}'><img class='link_icon run' title='Run' src='images/icon_run.png'></a>"
    resultsButton   = "<a href='#results/#{@model.id}'><img class='link_icon results' title='Results' src='images/icon_results.png'></a>"
    printButton    = "<img class='link_icon print' title='Print' src='images/icon_print.png'> "
    printButtons    = "
      <a href='#print/#{@model.id}/content'><img class='link_icon print' title='Print' src='images/icon_print.png'></a>
      <a href='#print/#{@model.id}/stimuli'><img class='link_icon print' title='Print' src='images/icon_print.png'></a>
      <a href='#print/#{@model.id}/backup'><img class='link_icon print' title='Print' src='images/icon_print.png'></a>
    "
    printSelector   = "
      <div class='print_format_wrapper confirmation'>
        <select id='print_format'>
        <option disabled='disabled' selected='selected' value='reset'>Select a print format</option>
        #{("<option data-format='#{format.key}'>#{format.name}</option>") for format in Tangerine.settings.config.get("printFormats")}
        <option data-format='cancel'>Cancel</option>
        </select>

      </div>
    "

    copyButton      = "<img class='link_icon copy' title='Copy to' src='images/icon_copy_to.png'>"
    deleteButton    = "<img class='assessment_delete link_icon' title='Delete' src='images/icon_delete.png'>"
    deleteConfirm   = "<span class='assessment_delete_confirm'><div class='menu_box'>Confirm <button class='assessment_delete_yes command_red'>Delete</button> <button class='assessment_delete_cancel command'>Cancel</button></div></span>"
    duplicateButton = "<img class='link_icon duplicate' title='Duplicate' src='images/icon_duplicate.png'>"
    updateButton    = "<img class='link_icon update' title='Update' src='images/icon_sync.png'>"

    syncButton      = "<a href='#sync/#{@model.id}'><img class='link_icon' title='Sync' src='images/icon_sync.png'></a>"

    downloadKey     = "<span class='download_key small_grey'>Download key <b>#{@model.id.substr(-5,5)}</b></span>"
    archiveSwitch   = "
    <select class='archive'>
      <option value='false' #{if isArchived then selected else ''}>Active</option>
      <option value='true'  #{if isArchived then selected else ''}>Archived</option>
    </select>
    "

    if @isAdmin
      # admin standard
      html = "
        <div>
          #{toggleButton}
          #{adminName}
        </div>
      "
      html += Tangerine.settings.contextualize
        server: "
          <div class='assessment_menu'>
            #{runButton}
            #{resultsButton}
            #{editButton}
            #{syncButton}
            #{printButton}
            #{duplicateButton}
            #{deleteButton}
            #{downloadKey}
            #{deleteConfirm}
            #{printSelector}
          </div>"
        satellite: "
          <div class='assessment_menu'>
            #{runButton}
            #{editButton}
            #{syncButton}
            #{printButton}
            #{duplicateButton}
            #{deleteButton}
            #{downloadKey}
            #{deleteConfirm}
            #{printSelector}
          </div>"
        allElse: "
          <div class='assessment_menu'>
            #{runButton}
            #{resultsButton}
            #{updateButton}
            #{deleteButton}
            #{deleteConfirm}
          </div>"
    # enumerator user
    else
      html = "<div>#{runButton}#{name} #{resultsButton}</div>"

    @$el.html html

    @trigger "rendered"
