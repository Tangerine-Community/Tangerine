# Harry Potter
class CurriculumView extends Backbone.View

  className: "CurriculumView"

  events:
    "click .back"           : "goBack"
    "click .delete"         : "deleteCurriculum"
    "click .delete_subtest" : "deleteSubtest"
    "click .edit_in_place"  : "editInPlace"
    'click .new_subtest'    : "newSubtest"

    "focusout .editing" : "editing"
    "keyup    .editing" : "editing"
    "keydown  .editing" : "editing"

  initialize: (options) ->

    # arguments
    @curriculum = options.curriculum
    @subtests   = options.subtests
    @questions  = options.questions
    @questionsBySubtestId = @questions.indexBy "subtestId"

    # primaries
    @totalAssessments  = Math.max.apply Math, @subtests.pluck("part")
    @subtestsByPart    = @subtests.indexArrayBy "part"
    @subtestProperties = 
      "grid" : [
        {
          "key"      : "part"
          "label"    : "Assessment"
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
          "key"      : "reportType"
          "label"    : "Report"
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


  render: ->

    subtestTable = @getSubtestTable()

    deleteButton = if Tangerine.settings.get("context") == "server" then "<button class='command_red delete'>Delete</button>" else ""

    newButtons = "
        <button class='command new_subtest' data-prototype='grid'>New Grid Subtest</button><br>
        <button class='command new_subtest' data-prototype='survey'>New Survey Subtest</button>
    " if Tangerine.settings.get("context") == "server"

    html = "

      <button class='navigation back'>#{t('back')}</button>
      <h1>#{@options.curriculum.get('name')}</h1>

      <div class='small_grey'>Download key <b>#{@curriculum.id.substr(-5,5)}</b></div>
      
      <div id='subtest_table_container'>
        #{subtestTable}
      </div>

      #{newButtons || ""}
      <br><br>

      #{deleteButton}

    "

    @$el.html html
    @trigger "rendered"

  updateTable: -> @$el.find("#subtest_table_container").html @getSubtestTable()

  getSubtestTable: ->

    html = "<table class='subtests'>"

    html += "
      <tbody>
    "
    @subtestsByPart = @subtests.indexArrayBy "part"
    for part, subtests of @subtestsByPart
      html += "<tr><td>&nbsp;</td></tr>"
      for subtest in subtests
        headerHtml = bodyHtml = ""

        for prop in @subtestProperties[subtest.get("prototype")]
          headerHtml += "<th>#{prop.label}</th>"
          bodyHtml += @propCook(prop, subtest)

        html += "<tr>#{headerHtml}</tr>"
        html += "<tr>#{bodyHtml}"


        # add buttons for serverside editing
        if Tangerine.settings.get("context") == "server"
          html += "
            <td>
              <a href='#class/subtest/#{subtest.id}'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>
              <img class='link_icon delete_subtest' title='Delete' data-subtestId='#{subtest.id}' src='images/icon_delete.png'>
              <a href='#class/run/test/#{subtest.id}'><img class='link_icon testRun' title='Test run' src='images/icon_run.png'></a>
            </td>
          </tr>
          "

        # quick previews of subtest contents
        if subtest.get("prototype") == "grid"
          items = subtest.get("items").join " "
          html += "<tr><td colspan='#{@subtestProperties['grid'].length}'>#{items}</td></tr>"
        
        if subtest.get("prototype") == "survey" && @questionsBySubtestId[subtest.id]?
          prompts = (question.get("prompt") for question in @questionsBySubtestId[subtest.id]).join(", ")
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
    editOrNot   = if prop.editable && Tangerine.settings.get("context") == "server" then "class='edit_in_place'" else ""

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
    if Tangerine.settings.get("context") == "server" 
      Tangerine.router.navigate "assessments", true
    else if Tangerine.settings.get("context") == "class"
      Tangerine.router.navigate "class", true

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
