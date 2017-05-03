class AssessmentListElementView extends Backbone.View

  className : "AssessmentListElementView"

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

    # arguments
    @model    = options.model
    @parent   = options.parent

    # switches and things
    @isAdmin     = Tangerine.user.isAdmin()

  respondToLink: (event) ->
    $target = $(event.target)
    route   = $target.attr("href")
    Tangerine.router.navigate(route, true)

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
        Utils.updateFromServer @model

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

    # commands

    # indicators and variables

    toggleButton     = "<div class='assessment_menu_toggle sp_right'><div></div></div>"
    name             = "<button class='name clickable'>#{@model.get('name')}</button>"
    adminName        = "<button class='admin_name clickable'>#{@model.get('name')}</button>"
    resultCount      = "<span class='result_count no_help'>Results <b>#{@resultCount}</b></span>"
    selected         = " selected='selected'"

    if @isAdmin
      @$el.html "
        <div>
          #{toggleButton}
          #{adminName}
        </div>
      " + @ul
        cssClass: "assessment_menu"
        links : ["run","results","update","delete"]
        other : deleteConfirm


    else
      @$el.html "
        <div class='non_admin'>
          #{@spriteListLink("span",'run')}#{name} #{@spriteListLink("span",'results')}
        </div>
      "


    @trigger "rendered"
