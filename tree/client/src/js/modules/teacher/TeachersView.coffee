class TeachersView extends Backbone.View

  className: "TeachersView"

  events :
    "click .edit_in_place"  : "editInPlace"
    "focusout .editing" : "editing"
    "keyup    .editing" : "editing"
    "keydown  .editing" : "editing"
    'click    .change_password' : "changePassword"
    'change   .show_password' : "showPassword"
    'click    .save_password' : 'savePassword'
    'click    .back' : 'goBack'

  goBack: ->
    window.history.back()

  initialize: (options) ->
    @teachers = options.teachers
    @users    = options.users

    @usersByTeacherId = @users.indexBy("teacherId")

    @teacherProperties = 
      [
        {
          "key"      : "name"
          "editable" : true
          "headerless" : true
        },
        {
          "key"      : "first"
          "label"    : "First"
          "editable" : true
          "escaped"  : true
        },
        {
          "key"      : "last"
          "label"    : "Last"
          "editable" : true
          "escaped"  : true
        },
        {
          "key"      : "gender"
          "label"    : "Gender"
          "editable" : true
        },
        {
          "key"      : "school"
          "label"    : "School name"
          "editable" : true
        },
        {
          "key"      : "contact"
          "label"    : "Contact Information"
          "editable" : true
        };
      ]

  showPassword: (event) ->
    $target = $(event.target)
    teacherId = $target.attr("data-teacherId")
    if @$el.find(".#{teacherId}_password").attr("type") == "password"
      @$el.find(".#{teacherId}_password").attr("type", "text")
    else
      @$el.find(".#{teacherId}_password").attr("type", "password")


  changePassword: (event) ->
    $target = $(event.target)
    teacherId = $target.attr("data-teacherId")
    @$el.find(".#{teacherId}_menu").toggleClass("confirmation")
    @$el.find(".#{teacherId}").scrollTo()
    @$el.find(".#{teacherId}_password").focus()

  savePassword: (event) ->
    $target = $(event.target)
    teacherId = $target.attr("data-teacherId")

    teacherModel = @teachers.get(teacherId)
    userModel    = @usersByTeacherId[teacherId][0]
    userModel.setPassword @$el.find(".#{teacherId}_password").val()
    userModel.save null,
      success: =>
        Utils.midAlert "Teacher's password saved"
        @$el.find(".#{teacherId}_password").val("")
        @$el.find(".#{teacherId}_menu").toggleClass("confirmation")
      error: =>
        Utils.midAlert "Save error"



  render: ->

    teacherTable = @getTeacherTable()

    deleteButton = if Tangerine.settings.get("context") == "server" then "<button class='command_red delete'>Delete</button>" else ""

    backButton = "
      <button class='navigation back'>#{t('back')}</button>
    " unless Tangerine.settings.get("context") is "server"

    html = "

      #{backButton||''}

      <h1>Teachers</h1>

      <div id='teacher_table_container'>
        #{teacherTable}
      </div>

    "

    @$el.html html
    @trigger "rendered"

  updateTable: -> @$el.find("#teacher_table_container").html @getTeacherTable()

  getTeacherTable: ->

    html = ""

    for teacher in @teachers.models

      html += "
      <table class='class_table teachers #{teacher.id}' >
        <tbody>
      "  

      for prop in @teacherProperties
        html += @propCookRow(prop, teacher)

      html += "
          <tr class='last'><th><button class='change_password command' data-teacherId='#{teacher.id}'>Change Password</button><br>

            <div class='#{teacher.id}_menu confirmation'>
              <div class='menu_box'>
                <input type='password' class='#{teacher.id}_password'>
                <table><tr>
                  <th style='padding:0;'><label for='#{teacher.id}_show_password'>Show password</label></th>
                  <th style='padding:10px'><input type='checkbox' id='#{teacher.id}_show_password' class='show_password' data-teacherId='#{teacher.id}'></th>
                </tr></table>
                <button class='save_password command' data-teacherId='#{teacher.id}'>Save</button>
              </div>
            </div>

            </th>
          </tr>
        </tbody>
      </table>
      "

    return html


  propCookRow: (prop, teacher) ->

    if prop.headerless
      prop.tagName = "th"
    else
      header = "<th>#{prop.label}</th>" 

    "<tr>#{header||""}#{@propCook(prop, teacher)}</tr>"

  propCook: (prop, teacher)->

    # cook the value
    value = if prop.key?   then teacher.get(prop.key)    else "&nbsp;"
    value = if prop.escape then teacher.escape(prop.key) else value
    value = "_" if not value?

    # calculate tag
    tagName = prop.tagName || "td"

    # what is it
    editOrNot   = if prop.editable then "edit_in_place" else ""

    numberOrNot = if _.isNumber(value) then "data-isNumber='true'" else "data-isNumber='false'" 

    return "<#{tagName} class='#{editOrNot}'><span data-teacherId='#{teacher.id}' data-key='#{prop.key}' data-value='#{value}' #{editOrNot} #{numberOrNot}>#{value}</div></#{tagName}>"


  editInPlace: (event) ->

    return if @alreadyEditing
    @alreadyEditing = true

    # save state
    # replace with text area
    # on save, save and re-replace
    $span = $(event.target)

    if $span.prop("tagName") == "TD"
      $span = $span.find("span")
      return if $span.length == 0
    $td  = $span.parent()

    @$oldSpan = $span.clone()

    return if $span.prop("tagName") == "TEXTAREA"

    guid         = Utils.guid()

    key          = $span.attr("data-key")
    isNumber     = $span.attr("data-isNumber") == "true"

    teacherId    = $span.attr("data-teacherId")
    teacher      = @teachers.get(teacherId)
    oldValue     = 
      if isNumber 
        teacher.getNumber(key)
      else
        teacher.getString(key)

    $target = $(event.target)
    classes = ($target.attr("class") || "").replace("settings","")
    margins = $target.css("margin")

    #special case
    oldValue = oldValue.join " " if key == 'items'

    transferVariables = "data-isNumber='#{isNumber}' data-key='#{key}' data-teacherId='#{teacherId}' "

    # sets width/height with style attribute
    $td.html("<textarea id='#{guid}' #{transferVariables} class='editing #{classes}' style='margin:#{margins}'>#{oldValue}</textarea>")
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

    @alreadyEditing = false

    key          = $target.attr("data-key")
    isNumber     = $target.attr("data-isNumber") == "true"

    teacherId    = $target.attr("data-teacherId")
    teacher      = @teachers.get(teacherId)
    oldValue     = teacher.get(key)

    newValue = $target.val()
    newValue = if isNumber then parseInt(newValue) else newValue

    #special case

    # this is not DRY. repeated in grid prototype.
    if key == "items"
      # clean whitespace, give reminder if tabs or commas found, convert back to array
      newValue = newValue.replace(/\s+/g, ' ')
      if /\t|,/.test(newValue) then alert "Please remember\n\nGrid items are space \" \" delimited"
      newValue = _.compact newValue.split(" ")

    # If there was a change, save it
    if String(newValue) != String(oldValue)
      attributes = {}
      attributes[key] = newValue
      teacher.save attributes,
        success: =>
          Utils.topAlert "Teacher saved"
          teacher.fetch 
            success: =>
              @updateTable()
        error: =>
          teacher.fetch 
            success: =>
              @updateTable()
              # ideally we wouldn't have to save this but conflicts happen sometimes
              # @TODO make the model try again when unsuccessful.
              alert "Please try to save again, it didn't work that time."
    
    # this ensures we do not insert a newline character when we press enter
    return false
