class AccountView extends Backbone.View

  className: "AccountView"

  events:
    'click .leave'       : 'leaveGroup'
    'click .join_cancel' : 'joinToggle'
    'click .join'        : 'joinToggle'
    'click .join_group'  : 'join'
    'click .back'        : 'goBack'
    'click .update' : 'update'
    'click .restart' : 'restart'
    'click .send_debug' : 'sendDebug'

    "click .edit_in_place"  : "editInPlace"
    "focusout .editing" : "editing"
    "keyup    .editing" : "editing"
    "keydown  .editing" : "editing"

    'click .change_password' : "togglePassword"
    'click .confirm_password' : "saveNewPassword"

  togglePassword: -> 
    $menu = @$el.find(".password_menu")
    $menu.toggle()
    if $menu.is(":visible")
      @$el.find("#new_password").focus().scrollTo()


  saveNewPassword: ->
    pass = @$el.find(".new_password").val()
    Tangerine.user.setPassword(pass)
    Tangerine.user.save null,
      success: =>
        @$el.find(".new_password").val('')
        @togglePassword()
        Utils.midAlert "Password changed"


  sendDebug: ->
    Tangerine.$db.view "#{Tangerine.design_doc}/byCollection"
    ,

      keys: ["teacher", "klass", "student", "config", "settings"]

      success: (response) -> 
        
        docId = "debug-report-#{Tangerine.settings.get('instanceId')}"

        saveReport = (response, oldRev = null, docId) ->
          doc =
            _id        : docId
            _rev       : oldRev
            docs       : _.pluck(response.rows,"value")
            collection : "debug_report"

          delete doc._rev unless doc._rev?

          Tangerine.$db.saveDoc doc, 
            success: ->
              $.couch.replicate Tangerine.db_name, Tangerine.settings.urlDB("group"),
                success: ->
                  Utils.sticky "Debug report sent", "Ok"
              ,
                doc_ids: [docId]


        Tangerine.$db.openDoc docId, 
          success: (oldDoc) ->
            saveReport response, oldDoc._rev, docId
          error: (error) ->
            saveReport response, null, docId


  update: ->
    doResolve = @$el.find("#attempt_resolve").is(":checked")
    
    Utils.updateTangerine(doResolve)

  restart: ->
    Utils.restartTangerine()

  goBack: ->
    if Tangerine.settings.get("context") == "server"
      Tangerine.router.navigate "groups", true
    else
      window.history.back()

  joinToggle: ->
    @$el.find(".join, .join_confirmation").fadeToggle(0)
    @$el.find("#group_name").val ""

  join: ->
    group = @$el.find("#group_name").val().databaseSafetyDance()
    return if group.length == 0
    @user.joinGroup group, =>
      @joinToggle()

  leaveGroup: (event) ->
    group = $(event.target).parent().attr('data-group')
    @user.leaveGroup group

  initialize: ( options ) ->

    @user = options.user
    @teacher = options.teacher

    models = []
    models.push @user if @user?
    models.push @teacher if @teacher?

    @models = new Backbone.Collection(models)
    @user.on "group-join group-leave group-refresh", @renderGroups
  
  renderGroups: =>
    html = "<ul>"
    for group in (@user.get("groups") || [])
      html += "<li data-group='#{_.escape(group)}'>#{group} <button class='command leave'>Leave</button></li>"
    html += "</ul>"
    @$el.find("#group_wrapper").html html

  render: ->

    groupSection = "
      <section>
        <div class='label_value'>
          <label>Groups</label>
          <div id='group_wrapper'></div>
          <button class='command join'>Join or create a group</button>
          <div class='confirmation join_confirmation'>
            <div class='menu_box'>
              <input id='group_name' placeholder='Group name'>
              <div class='small_grey'>Please be specific.<br>
              Good examples: malawi_jun_2012, mike_test_group_2012, egra_group_aug-2012<br>
              Bad examples: group, test, mine</div><br>
              <button class='command join_group'>Join Group</button>
              <button class='command join_cancel'>Cancel</button>
            </div>
          </div>
        </section>
    " if Tangerine.settings.get("context") == "server"


    if Tangerine.settings.get("context") != "server" && Tangerine.user.isAdmin()
      settingsButton = "<a href='#settings' class='navigation'><button class='navigation'>Settings</button></a>"
      logsButton = "<a href='#logs' class='navigation'><button class='navigation'>Logs</button></a>"

    applicationMenu = "
      <section>
        <h2>Application</h2>
        <button class='command restart'>Restart</button><br>
      </section>

      
    " if Tangerine.user.isAdmin() && Tangerine.settings.get("context") != "server"

    teachersButton = "
      <a href='#teachers' class='navigation'><button class='navigation'>Teachers</button></a>
    " if Tangerine.user.isAdmin() && Tangerine.settings.get("context") == "class"

    userEdits = 
      if "server" is Tangerine.settings.get("context")
        @getEditableRow({key:"email", name:"Email"}, @user) +
        @getEditableRow({key:"first", name:"First name"}, @user) +
        @getEditableRow({key:"last", name:"Last name"}, @user)

      else if "mobile" is Tangerine.settings.get("context")
        @getEditableRow({key:"email", name:"Email"}, @user)

      else if "class" is Tangerine.settings.get("context")
        @getEditableRow({key:"first",   name:"First name"}, @teacher)   +
        @getEditableRow({key:"last",    name:"Last name"}, @teacher)    +
        @getEditableRow({key:"gender",  name:"Gender"}, @teacher)       +
        @getEditableRow({key:"school",  name:"School"}, @teacher)       +
        @getEditableRow({key:"contact", name:"Contact info"}, @teacher)
    
    passwordReset = "
      <button class='change_password command'>Change password</button></td>
      <div class='password_menu' style='display:none;'>
        <label for='new_password'>New Password</label><br>
        <input id='new_password'><br>
        <button class='confirm_password command'>Change</button>
      </div>
    " if "class" is Tangerine.settings.get("context")

    html = "
      <button class='back navigation'>Back</button>
      <h1>Manage</h1>
      #{settingsButton || ""}
      #{logsButton || ""}
      #{teachersButton || ""}
      
      #{applicationMenu || ""}

      <section>
        <h2>Account</h2>
          <table class='class_table'>
            <tr>
              <td style='color:black'>Name</td>
              <td style='color:black'>#{@user.name()}</td>
            </tr>
            #{userEdits || ''}
          </table>
          #{passwordReset || ''}
      </section>
      #{groupSection || ""}
      </div>
    "

    @$el.html html
    @renderGroups() if Tangerine.settings.get("context") == "server"

    @trigger "rendered"


  getEditableRow: (prop, model) ->
    "<tr><td>#{prop.name}</td><td>#{@getEditable(prop, model)}</td></tr>"

  getEditable: (prop, model) ->

    # cook the value
    value = if prop.key?   then model.get(prop.key)    else "&nbsp;"
    value = if prop.escape then model.escape(prop.key) else value
    value = "not set" if not value? or _.isEmptyString(value)

    # what is it
    editOrNot   = if prop.editable && Tangerine.settings.get("context") == "server" then "class='edit_in_place'" else ""

    numberOrNot = if _.isNumber(value) then "data-isNumber='true'" else "data-isNumber='false'" 

    return "<div class='edit_in_place'><span data-modelId='#{model.id}' data-key='#{prop.key}' data-value='#{value}' data-name='#{prop.name}' #{editOrNot} #{numberOrNot}>#{value}</div></div>"


  editInPlace: (event) ->

    return if @alreadyEditing
    @alreadyEditing = true

    # save state
    # replace with text area
    # on save, save and re-replace
    $span = $(event.target)

    $td  = $span.parent()

    @$oldSpan = $span.clone()

    return if $span.hasClass("editing")

    guid     = Utils.guid()

    key      = $span.attr("data-key")
    name     = $span.attr("data-name")
    isNumber = $span.attr("data-isNumber") == "true"

    modelId  = $span.attr("data-modelId")
    model    = @models.get(modelId)
    oldValue = model.get(key) || ""
    oldValue = "" if oldValue == "not set"

    $target = $(event.target)
    classes = ($target.attr("class") || "").replace("settings","")
    margins = $target.css("margin")

    transferVariables = "data-isNumber='#{isNumber}' data-key='#{key}' data-modelId='#{modelId}' "

    # sets width/height with style attribute
    $td.html("<textarea placeholder='#{name}' id='#{guid}' rows='#{1+oldValue.count("\n")}' #{transferVariables} class='editing #{classes}' style='margin:#{margins}' data-name='#{name}'>#{oldValue}</textarea>")
    # style='width:#{oldWidth}px; height: #{oldHeight}px;'
    $textarea = $("##{guid}")
    $textarea.focus()

  editing: (event) ->

    $target = $(event.target)
    $td = $target.parent()

    if event.which == 27 or event.type == "focusout"
      $target.remove()
      $td.html(@$oldSpan)
      @alreadyEditing = false
      return

    # act normal, unless it's an enter key on keydown
    return true unless event.which == 13 and event.type == "keydown"

    #return true if event.which == 13 and event.altKey

    @alreadyEditing = false

    key        = $target.attr("data-key")
    isNumber   = $target.attr("data-isNumber") == "true"

    modelId    = $target.attr("data-modelId")
    name       = $target.attr("data-name")

    model      = @models.get(modelId)
    oldValue   = model.get(key)

    newValue = $target.val()
    newValue = if isNumber then parseInt(newValue) else newValue

    # If there was a change, save it
    if String(newValue) != String(oldValue)
      attributes = {}
      attributes[key] = newValue
      model.save attributes,
        success: =>
          Utils.midAlert "#{name} saved"
          model.fetch 
            success: =>
              if @updateDisplay?
                @updateDisplay()
              else
                @render()
        error: =>
          model.fetch 
            success: =>
              if @updateDisplay?
                @updateDisplay()
              else
                @render()
              # ideally we wouldn't have to save this but conflicts happen sometimes
              # @TODO make the model try again when unsuccessful.
              alert "Please try to save again, it didn't work that time."
    
    # this ensures we do not insert a newline character when we press enter
    return false

  goBack: ->
    window.history.back()
