# Harry Potter
class CurriculumView extends Backbone.View

  className: "CurriculumView"

  events:
    "click .back"           : "goBack"
    "click .delete"         : "deleteCurriculum"
    "click .delete_subtest" : "deleteSubtest"
    "click .edit_in_place"  : "editInPlace"
    'click .new_subtest'    : "newSubtest"

    'change #file' : 'uploadFile'

    "focusout .editing" : "editing"
    "keyup    .editing" : "editing"
    "keydown  .editing" : "editing"

    "click .name-controls .edit"   : "editName"
    "click .name-controls .save"   : "saveName"
    "click .name-controls .cancel" : "cancelEditName"


  initialize: (options) ->

    # arguments
    @curriculum = options.curriculum
    @subtests   = options.subtests
    @questions  = options.questions
    @questionsByParentId = @questions.indexBy "subtestId"

    # primaries
    @totalAssessments  = Math.max.apply Math, @subtests.pluck("part")
    @subtestsByPart    = @subtests.indexArrayBy "part"
    @subtestProperties = 
      "grid" : [
        {
          "key"      : "itemType"
          "label"    : "Item type"
          "editable" : true
        },
        {
          "key"      : "part"
          "label"    : "Term"
          "editable" : true
        },
        {
          "key"      : "grade"
          "label"    : "Grade"
          "editable" : true
        },
        {
          "key"      : "name"
          "label"    : "Name"
          "editable" : true
          "escaped"  : true
        },
        {
          "key"      : "timer"
          "label"    : "Time<br>allowed"
          "editable" : true
        },
        {
          "key"      : "items"
          "label"    : "Items"
          "count"    : true
          "editable" : true
        }
      ],
      "survey" : [
        {
          "key" : "part"
          "label" : "Assessment"
          "editable" : true
        },
        {
          "key" : "name"
          "label" : "Name"
          "editable" : true
        },
        {
          "key"      : "reportType"
          "label"    : "Report"
          "editable" : true
        }
      ]

  htmlFileTable: ->

    return "" if _(@curriculum.getAttachments()).isEmpty()

    prefixes = ["", "KB", "MB", "GB"]
    html = "
      <h2>Attachments</h2>
      <table>
    "
    for attachment in @curriculum.getAttachments()
      bytes = attachment.size
      index  = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
      size   = Math.decimals(bytes / Math.pow(1024, index), 1) + " " + prefixes[index]
      html += "<tr><td>#{attachment.filename} (#{size})</td></tr>"

    html += "</table>"

    return html

  uploadFile: (event) ->

    file = event.target.files[0]

    @curriculum.addAttachment
      file: file
      error: =>
        Utils.midAlert "Error uploading."
      success: =>
        Utils.midAlert "File uploaded"
      complete: =>
        @curriculum.fetch
          success: => @render()


  render: ->

    subtestTable = @getSubtestTable()

    deleteButton = "<button class='command_red delete'>Delete</button>"

    newButtons = "
        <button class='command new_subtest' data-prototype='grid'>New Grid Subtest</button><br>
        <button class='command new_subtest' data-prototype='survey'>New Survey Subtest</button>

    "

    html = "

      <button class='nav-button back'>#{t('back')}</button>
      <h1 class='curriculum-name'></h1>
      <small class='name-controls'></small><br>

      <div class='small_grey'>Download key <b>#{@curriculum.id.substr(-5,5)}</b></div>

      <div id='subtest_table_container'>
        #{subtestTable}
      </div>

      #{newButtons || ""}
      <br><br>

      #{deleteButton}

    "

    @$el.html html

    @renderName()

    @trigger "rendered"

  renderName: ->
    @$el.find(".curriculum-name").html @curriculum.getEscapedString('name')
    @$el.find(".name-controls").html "
      <span class='edit'>Edit</span>
    "

  editName: ->
    $h1 = @$el.find(".curriculum-name").html "<input class='new-name' value='#{@curriculum.getEscapedString('name')}'>"
    $h1.find("input").select()
    @$el.find(".name-controls").html "
      <span class='save'>Save</span> 
      <span class='cancel'>Cancel</span>
    "
  
  saveName: ->
    newName = @$el.find(".new-name").val()
    @curriculum.save 
      name : newName
    ,
      success: =>
        Utils.topAlert "Name saved"
        @renderName()
      error: =>
        Utils.topAlert "New name did not save. Please try again."
        @renderName()

  cancelEditName: -> @renderName()

  updateTable: -> @$el.find("#subtest_table_container").html @getSubtestTable()

  getSubtestTable: (grade) ->

    html = "<table class='subtests'>"

    html += "
      <tbody>
    "

    #if grade?
    #  subtests = new Backbone.Collection @subtests.where grade : grade
    #else
    #  subtests = @subtests

    @subtestByItemType = new Backbone.Collection(@subtests.models.sort( (a,b) -> 
      a = "#{a.get("itemType")}#{a.get("part")}#{a.get("grade")}"
      b = "#{b.get("itemType")}#{b.get("part")}#{b.get("grade")}"
      if ( a < b )
        return -1
      if ( a > b )
        return 1
      return 0
    )).indexArrayBy("itemType")

    for part, subtests of @subtestByItemType
      html += "<tr><td>&nbsp;</td></tr>"
      for subtest in subtests
        items = null
        prompts = null
        headerHtml = bodyHtml = ""

        for prop in @subtestProperties[subtest.get("prototype")]
          headerHtml += "<th>#{prop.label}</th>"
          bodyHtml += @propCook(prop, subtest)

        html += "<tr>#{headerHtml}</tr>"
        html += "<tr>#{bodyHtml}"


        # add buttons for serverside editing
        html += "
          <td>
            <a href='#class/subtest/#{subtest.id}'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>
            <img class='link_icon delete_subtest' title='Delete' data-subtestId='#{subtest.id}' src='images/icon_delete.png'>
          </td>
        </tr>
        "

        # quick previews of subtest contents
        if subtest.get("prototype") == "grid"
          items = subtest.get("items").join " "
          html += "<tr><td colspan='#{@subtestProperties['grid'].length}'>#{items}</td></tr>"
        
        if subtest.get("prototype") == "survey" && @questionsByParentId[subtest.id]?
          prompts = (question.get("prompt") for question in @questionsByParentId[subtest.id]).join(", ")
          html += "<tr><td colspan='#{@subtestProperties['survey'].length}'>#{prompts}</td></tr>"


    html += "
      </tbody>
    </table>
    "

    return html

  propCook: (prop, subtest)->

    # cook the value
    value = if prop.key?   then subtest.get(prop.key)    else "&nbsp;"
    value = if prop.escape then subtest.escape(prop.key) else value
    value = value.length if prop.count?
    value = "" if not value?

    # what is it
    editOrNot   = if prop.editable then "class='edit_in_place'" else ""

    numberOrNot = if _.isNumber(value) then "data-isNumber='true'" else "data-isNumber='false'" 

    return "<td class='edit_in_place'><span data-subtestId='#{subtest.id}' data-key='#{prop.key}' data-value='#{value}' #{editOrNot} #{numberOrNot}>#{value}</div></td>"


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

    subtestId    = $span.attr("data-subtestId")
    subtest      = @subtests.get(subtestId)
    oldValue     = subtest.get(key)

    $target = $(event.target)
    classes = ($target.attr("class") || "").replace("settings","")
    margins = $target.css("margin")

    #special case
    oldValue = oldValue.join " " if key == 'items'

    transferVariables = "data-isNumber='#{isNumber}' data-key='#{key}' data-subtestId='#{subtestId}' "

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

    subtestId    = $target.attr("data-subtestId")
    subtest      = @subtests.get(subtestId)
    oldValue     = subtest.get(key)

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
      subtest.save attributes,
        success: =>
          Utils.midAlert "Subtest saved"
          subtest.fetch 
            success: =>
              @updateTable()
        error: =>
          subtest.fetch 
            success: =>
              @updateTable()
              # ideally we wouldn't have to save this but conflicts happen sometimes
              # @TODO make the model try again when unsuccessful.
              alert "Please try to save again, it didn't work that time."
    
    # this ensures we do not insert a newline character when we press enter
    return false

  goBack: -> 
    Tangerine.router.navigate "assessments", true

  deleteCurriculum: ->
    if confirm("Delete curriculum\n#{@curriculum.get('name')}?")
      @curriculum.destroy => Tangerine.router.navigate "assessments", true

  #
  # Subtest new and destroy
  #
  newSubtest: (event) ->
    prototype = $(event.target).attr("data-prototype")
    guid = Utils.guid()

    subtestAttributes = 
      "_id"          : guid
      "curriculumId" : @curriculum.id
      "prototype"    : prototype
      "captureLastAttempted" : false
      "endOfLine" : false

    protoTemps = Tangerine.templates.get "prototypes"
    subtestAttributes = $.extend(protoTemps[prototype], subtestAttributes)

    subtest = new Subtest subtestAttributes
    subtest.save null,
      success: ->
        Tangerine.router.navigate "class/subtest/#{guid}", true
      error: ->
        alert "Please try again. There was a problem creating the new subtest."

  deleteSubtest: (event) ->
    subtestId = $(event.target).attr("data-subtestId")
    subtest = @subtests.get(subtestId)
    if confirm("Delete subtest\n#{subtest.get('name')}?")
      subtest.destroy
        success: =>
          @subtests.remove(subtestId)
          @updateTable()
        error: =>
          alert "Please try again, could not delete subtest."
