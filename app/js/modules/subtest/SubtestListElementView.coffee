class SubtestListElementView extends Backbone.View

  className : "subtest_element"
  tagName : "li"

  events: 
    'click .icon_edit'     : 'edit'
    "click .icon_delete"   : "toggleDeleteConfirm"
    "click .delete_cancel" : "toggleDeleteConfirm"
    "click .delete_delete" : "delete"
    "click .icon_copy"     : "openCopyMenu"
    "click .do_copy"       : "doCopy"
    "click .cancel_copy"   : "cancelCopy"

  toggleDeleteConfirm: -> @$el.find(".delete_confirm").fadeToggle(250); false

  delete: -> @trigger "subtest:delete", @model; false

  edit: ->
    Tangerine.router.navigate "subtest/#{@model.id}", true

  initialize: (options) ->
    @model = options.subtest
    @group = options.group # for copying

    # This is for $.sortable. Don't remove.
    @$el.attr "data-id", @model.id

  openCopyMenu: ->
    @$el.find(".copy_menu").removeClass("confirmation")
    @$el.find(".copy_select").append("<option disabled='disabled' selected='selected'>Loading assessments...</option>")
    @fetchAssessments()


  fetchAssessments: =>
    @groupAssessments = new Assessments
    @groupAssessments.fetch
      key: @group
      success: =>
        @populateAssessmentSelector()
  
  populateAssessmentSelector: =>
    optionList = ""
    for assessment in @groupAssessments.models
      optionList += "<option data-assessmentId='#{assessment.id}'>#{assessment.get("name")}</option>"
    $select = @$el.find(".copy_select").html(optionList)
      
  doCopy: (e) ->
    @model.copyTo(@$el.find(".copy_select :selected").attr('data-assessmentId'))
    @$el.find(".copy_menu").addClass("confirmation")
    
  cancelCopy: ->
    @$el.find(".copy_menu").addClass("confirmation")

  render: ->
    subtestName   = @model.get("name")
    prototype     = "<span class='small_grey'>#{@model.get("prototype")}</span>"
    iconDrag      = "<img src='images/icon_drag.png' title='Drag to reorder' class='icon sortable_handle'>"
    iconEdit      = "<img src='images/icon_edit.png' title='Edit' class='icon icon_edit'>"
    iconDelete    = "<img src='images/icon_delete.png' title='Delete' class='icon icon_delete'>"
    copyIcon      = "<img src='images/icon_copy_to.png' title='Copy to...' class='icon icon_copy'>"
    copyMenu      = "<div class='confirmation copy_menu'><select class='copy_select'></select><br><button class='do_copy command'>Copy</button> <button class='cancel_copy command'>Cancel</button></div>"
    deleteConfirm = "<br><span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_delete command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>"
    @$el.html "
      <table><tr>
      <td>#{iconDrag}</td>
      <td>
        #{subtestName}
        #{prototype}
        #{iconEdit}
        #{copyIcon}
        #{iconDelete}
        #{deleteConfirm}
        #{copyMenu}
      </td>
      </tr></table>
    "

    @trigger "rendered"
