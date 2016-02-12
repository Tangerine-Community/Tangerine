# Provides an "li" tag for the questions edit view
class QuestionsEditListElementView extends Backbone.View

  className : "question_list_element"
  tagName : "li"

  events:
    'click .edit'        : 'edit'
    'click .show_copy'   : 'showCopy'
    'change .copy_select' : 'copy'

    'click .delete'        : 'toggleDelete'
    'click .delete_cancel' : 'toggleDelete'
    'click .delete_delete' : 'delete'


  showCopy: (event) ->
    $copy = @$el.find(".copy_container")
    $copy.html "
      Copy to <select class='copy_select'><option disabled='disabled' selected='selected'>Loading...</option></select>
    "
    @getSurveys()

  getSurveys: =>
    $.ajax
      "url"         : Tangerine.settings.urlView("group", "subtestsByAssessmentId")
      "type"        : "POST"
      "dataType"    : "json"
      "contentType" : "application/json"
      "data"        : JSON.stringify
        keys : [@question.get("assessmentId")]
      "success" : (data) =>
        subtests = _.compact((row.value if row.value.prototype == "survey") for row in data.rows)
        @populateSurveySelect subtests

  populateSurveySelect : (subtests) ->
    subtests.push    _id : 'cancel', name : @text.cancel_button
    subtests.unshift _id : '',       name : @text.select
    htmlOptions = ("<option data-subtestId='#{subtest._id}' #{subtest.attrs || ""}>#{subtest.name}</option>" for subtest in subtests).join("")
    @$el.find(".copy_select").html htmlOptions

  copy: (event) =>
    $target = $(event.target).find("option:selected")
    subtestId = $target.attr("data-subtestId")
    if subtestId == "cancel"
      @$el.find(".copy_container").empty()
      return
    newQuestion = @question.clone()
    newQuestion.save
      "_id"       : Utils.guid()
      "subtestId" : subtestId
    ,
      success: =>
        if subtestId == @question.get("subtestId")
          Utils.midAlert("Question duplicated")
          @trigger "duplicate" 
        else
          Tangerine.router.navigate "subtest/#{subtestId}", true # this will guarantee that it assures the order of the target subtest
          Utils.midAlert("Question copied to #{$target.html()}")
      error: ->
        Utils.midAlert("Copy error")

  edit: (event) ->
    @trigger "question-edit", @question.id
    return false

  toggleDelete: ->
    @$el.find(".delete_confirm").fadeToggle(250)

  delete: (event) ->
    @question.collection.remove(@question.id)
    @question.destroy()
    @trigger "deleted"
    return false

  initialize: ( options ) ->
    @text = 
      "edit"          : t("QuestionsEditListElementView.help.edit")
      "delete"        : t("QuestionsEditListElementView.help.delete")
      "copy"          : t("QuestionsEditListElementView.help.copy_to")
      "cancel_button" : t("QuestionsEditListElementView.button.cancel")
      "delete_button" : t("QuestionsEditListElementView.button.delete")
      "select"        : t("QuestionsEditListElementView.label.select")
      "loading"       : t("QuestionsEditListElementView.label.loading")
      "delete_confirm" : t("QuestionsEditListElementView.label.delete_confirm")

    @question = options.question
    @$el.attr("data-id", @question.id)

  render: ->
    @$el.html "
      <table>
        <tr>
          <td>
            <img src='images/icon_drag.png' class='sortable_handle'>
          </td>
          <td>
            <span>#{@question.get 'prompt'}</span> <span>[<small>#{@question.get 'name'}, #{@question.get 'type'}</small>]</span>
            
            <img src='images/icon_edit.png' class='link_icon edit' title='#{@text.edit}'>
            <img src='images/icon_copy_to.png' class='link_icon show_copy' title='#{@text.copy}'>
            <span class='copy_container'></span>
            <img src='images/icon_delete.png' class='link_icon delete' title='#{@text.delete}'><br>
            <div class='confirmation delete_confirm'>
              <div class='menu_box'>#{@text.delete_confirm}<br><button class='delete_delete command_red'>Delete</button><button class='delete_cancel command'>#{@text.cancel_button}</button>
            </div>
          </td>
        </tr>
      </table>
      "
    @trigger "rendered"
