class LessonPlanListElementView extends Backbone.View

  className : "LessonPlanListElementView"

  tagName : "li"

  events: if Modernizr.touch then {
    'click .assessment_menu_toggle'       : 'assessmentMenuToggle'
    'click .admin_name'                   : 'assessmentMenuToggle'
    'click .sp_assessment_delete'         : 'assessmentDeleteToggle'
    'click .sp_assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'click .sp_assessment_delete_confirm' : 'assessmentDelete'
    'click .sp_copy'                      : 'copyTo'
    'click .sp_duplicate'                 : 'duplicate'
    'click .sp_update'                    : 'update'
    'click .sp_print'                     : 'togglePrint'
    'click .archive'                      : 'archive'
    'click a' : 'respondToLink'

    'change #print_format'             : 'print'
  } else {
    'click .assessment_menu_toggle'       : 'assessmentMenuToggle'
    'click .admin_name'                   : 'assessmentMenuToggle'
    'click .sp_assessment_delete'         : 'assessmentDeleteToggle'
    'click .sp_assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'click .sp_assessment_delete_confirm' : 'assessmentDelete'
    'click .sp_copy'                      : 'copyTo'
    'click .sp_duplicate'                 : 'duplicate'
    'click .sp_update'                    : 'update'
    'click .sp_print'                     : 'togglePrint'
    'click .archive'                      : 'archive'

    'change #print_format'             : 'print'
  }


  blankResultCount: "-"

  initialize: (options) ->
    
    #arguments
    @model    = options.model
    @parent   = options.parent

    # switches and things
    @isAdmin     = Tangerine.user.isAdmin()

  respondToLink: (event) ->
    $target = $(event.target)
    route   = $target.attr("href")
    Tangerine.router.navigate(route, true)

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
    @$el.find(".print_format_wrapper").toggle()

  print: ->
    format = @$el.find("#print_format option:selected").attr("data-format")

    if format == "cancel"
      @$el.find(".print_format_wrapper").toggle()
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
    @$el.find('.assessment_menu_toggle').toggleClass('sp_down').toggleClass('sp_right')
    @$el.find('.assessment_menu').toggle()

  assessmentDeleteToggle: ->
    @$el.find(".sp_assessment_delete_confirm").toggle(); false

# deep non-gerneric delete
  assessmentDelete: =>
# removes from collection
    @model.destroy()

  spriteListLink: ( tagName, names... ) ->
    result = ""
    for name in names
      result += "<#{tagName} class='sp_#{name.underscore()}'><a href='##{name}/#{@model.id}'>#{name.underscore().titleize()}</a></#{tagName}>"
    return result

  spriteEvents: ( tagName, names...) ->
    result = ""
    for name in names
      result += "<#{tagName}><button class='sp_#{name.underscore()}' title='#{name.underscore().titleize()}'>#{name.underscore().titleize()}</button></#{tagName}> "
    return result

  ul: (options)->

    html = "<ul #{if options.cssClass then "class='#{options.cssClass}'" else ''}>"
    html += @spriteListLink.apply @, ["li"].concat(options.links)
    html += options.other || ''
    html += "</ul>"

  render: ->

# indicators and variables
    name = @model.get('lessonPlan_title')
    id = @model.id

    @$el.html "<a href='#runMar/#{id}'>#{name}</a>"

    @trigger "rendered"
