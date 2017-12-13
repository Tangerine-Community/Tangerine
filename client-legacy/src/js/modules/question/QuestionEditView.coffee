class QuestionEditView extends Backbone.View

  className : "question_list_element"

  events :
    'click .back'             : 'goBack'
    'click .done'             : 'done'
    'click .add_option'       : 'addOption'
    'click .delete_option'    : 'showDeleteConfirm'
    'click .delete_cancel'    : 'hideDeleteConfirm'
    'click .delete_delete'    : 'deleteOption'
    'click #question_type input:radio'       : 'changeQuestionType'
    'change .option_select'   : 'templateFill'
    'keypress .option_value'  : 'quickAddWithEnter'
    'keypress .option_label'  : 'quickFocusValue'
    'change #custom_validation_code' : 'validateSyntax'
    'change #display_code'           : 'validateSyntax'
    'change #skip_logic'             : 'validateSyntax'

  initialize: (options) ->

    @activity   = null
    @timer = 0

    @question   = options.question
    @subtest    = options.subtest
    @assessment = options.assessment


  validateSyntax: (event) ->
    $target = $(event.target)
    code = $target.val()
    if not _.isEmpty(code)
      try
        oldAnswer = @answer
        @answer = {}
        @isValid = CoffeeScript.compile.apply(@, [code])
        if oldAnswer? then @answer = oldAnswer else delete this["answer"]
      catch error
        name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
        where = $target.attr('id').humanize()
        message = error.message
        alert "Error in #{where}\n\n#{name}\n\n#{message}"

  quickAddWithEnter: (event) ->
    if event.keyCode? && event.keyCode != 13 then return true
    @addOption()

  quickFocusValue: (event) ->
    if event.keyCode? && event.keyCode != 13 then return true
    $(event.target).parent().find(".option_value").focus()

  templateFill: (event) ->
    index = $(event.target).find("option:selected").attr('data-index')
    optionTemplates = Tangerine.templates.get("optionTemplates")
    if optionTemplates[index]?
      @question.set "options", optionTemplates[index].options
      @$el.find('#option_list_wrapper').html @getOptionList()
    return false

  getOptionList: ->
    options = @question.get "options"
    html = "<h2>Options</h2>
      <div class='menu_box'>
        <ul id='option_list'>
    "

    for option, i in options
      
      html += "
      <li class='question'>
        <table><tr><td>
          <img src='images/icon_drag.png' class='sortable_handle'>
        </td>
        <td>
          <div style='display: block;'>
            <div class='option_label_value'>
              <label class='edit' for='options.#{i}.label'>Label</label>
              <input id='options.#{i}.label' value='#{_.escape(option.label)}' placeholder='Option label' class='option_label'><br>
              <label class='edit' for='options.#{i}.value' title='Allowed characters&#58; A-Z, a-z, 0-9, and underscores.'>Value</label>
              <input id='options.#{i}.value' value='#{_.escape(option.value)}' placeholder='Option value' class='option_value'><br>
            </div>
            <img src='images/icon_delete.png' class='delete_option' data-index='#{i}'>
            <div class='confirmation delete_confirm_#{i}'>
              <button class='delete_delete command_red' data-index='#{i}'>Delete</button>
              <button data-index='#{i}' class='delete_cancel command'>Cancel</button>
            </div>
          </div>
        </td></tr></table>
      </li>
      "
    html += "</ul>

      <button class='add_option command'>Add option</button>
    </div>
    "

  #
  # Adding an option
  #
  addOption: ->

    @updateModel()

    options = @question.get "options"
    options.push
      label : ""
      value : ""
    @question.set "options", options

    @refreshOptionList()

    # focus on next
    optionListElements = @$el.find("#option_list_wrapper li")
    if optionListElements.length != 0
      $(optionListElements.last()).scrollTo().find("input:first").focus()

  render: ->

    assessmentName = @assessment.escape("name")
    subtestName    = @subtest.escape("name")

    name           = @question.getEscapedString("name")
    prompt         = @question.getEscapedString("prompt")
    hint           = @question.getEscapedString("hint")
    skipLogic      = @question.getEscapedString("skipLogic")

    customValidationCode    = @question.getEscapedString("customValidationCode")
    customValidationMessage = @question.getEscapedString("customValidationMessage")
    displayCode             = @question.getString("displayCode")

    type            = @question.get "type"
    options         = @question.get "options"
    linkedGridScore = @question.getNumber("linkedGridScore")
    skippable       = @question.getBoolean("skippable")

    checkOrRadio = if type == "multiple" then "checkbox" else "radio"

    @$el.html "
      <button class='back navigation'>Back</button>
      <h1>Question Editor</h1>
      <table class='basic_info'>
        <tr>
          <th>Subtest</th>
          <td>#{subtestName}</td>
        </tr>
        <tr>
          <th>Assessment</th>
          <td>#{assessmentName}</td>
        </tr>
      </table>
      <button class='done command'>Done</button>
      <div class='edit_form'>
        <div class='label_value'>
          <label for='name'>Variable name</label>
          <input id='name' type='text' value='#{name}'>
        </div>
        <div class='label_value'>
          <label for='prompt'>Prompt</label>
          <input id='prompt' type='text' value='#{prompt}'>
        </div>
        <div class='label_value'>
          <label for='hint'>Note to enumerator</label>
          <input id='hint' type='text' value='#{hint}'>
        </div>
        <div class='label_value'>
          <label for='skip_logic' title='This statement will be skiped if it evaluates to true. example: ResultOfQuestion(\"maze1\") isnt \"2\" Example 2: \"red\" in ResultOfMultiple(\"fave_colors\")'>Skip if</label>
          <textarea rows='2' id='skip_logic'>#{skipLogic}</textarea>
        </div>

        <div class='menu_box'>
          <label>Custom validation</label>
          <div class='label_value'>
            <label for='custom_validation_code' title='Intended for open questions. This code should evaluate to true or false. False will trigger an error message for this question. E.g. @answer == \"1\" will evaluate to false for any value other than 1.'>Valid when</label>
            <input id='custom_validation_code' type='text' value='#{customValidationCode}'>
          </div>
          <div class='label_value'>
            <label for='custom_validation_message'>Error message</label>
            <input id='custom_validation_message' type='text' value='#{customValidationMessage}'>
          </div>
        </div><br>

        <div class='menu_box'>
          <div class='label_value'>
            <label for='display_code' title='This CoffeeScript code will be executed when this question is shown. This option may only be used when Focus Mode is on.'>Action on display</label>
            <textarea id='display_code' rows='2'>#{displayCode}</textarea>
          </div>
        </div>


        <div class='label_value'>
          <label>Skippable</label>
          <div id='skip_radio' class='buttonset'>
            <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' #{'checked' if skippable}>
            <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' #{'checked' if not skippable}>
          </div>
        </div>
        <div class='label_value'>
          <label for='linked_grid_score'>Items attempted required on linked grid</label>
          <input id='linked_grid_score' type='number' value='#{linkedGridScore}'>
        </div>
        <div class='label_value' id='question_type' class='question_type'>
          <label>Question Type</label>
          <div class='buttonset'>
            <label for='single'>single</label>
            <input id='single' name='type' type='radio' value='single' #{'checked' if type == 'single'}>
            <label for='multiple'>multiple</label>
            <input id='multiple' name='type'  type='radio' value='multiple' #{'checked' if type == 'multiple'}>
            <label for='open'>open</label>
            <input id='open' name='type'  type='radio' value='open' #{'checked' if type == 'open'}>
          </div>
        </div>
        "

    if type != "open"
      optionHTML = "
        <div class='label_value'>
        <label for='question_template_select'>Fill from template</label><br>
        <div class='menu_box'>
          <select id='question_template_select' class='option_select'>
            <option selected='selected'>Select template</option>
        "
      # ok to refernce things by index if not an object
      optionTemplates = Tangerine.templates.get("optionTemplates")
      for option, i in optionTemplates
        optionHTML += "<option data-index='#{i}' class='template_option'>#{option.name}</option>"

      optionHTML += "</select>
        </div>
        <div id='option_list_wrapper'>#{@getOptionList()}</div>
        "
      @$el.append optionHTML

      @refreshSortable()
      
    @$el.append "<button class='done command'>Done</button>
      </div>
      "
    @trigger "rendered"

  refreshOptionList: ->
    @$el.find("#option_list_wrapper").html @getOptionList()
    @refreshSortable()

  refreshSortable: ->
    @$el.find("#option_list").sortable
      handle : '.sortable_handle'
      start: (event, ui) -> ui.item.addClass "drag_shadow"
      stop:  (event, ui) -> ui.item.removeClass "drag_shadow"
      update : (event, ui) =>
        @updateModel()


  hijackEnter: (event) ->
    if event.which == 13
      @$el.find(event.target).blur()
      return false

  changeQuestionType: (event) ->
    $target = $(event.target)
    # if it changes, redo the rendering
    if ($target.val() != "open" && @question.get("type") == "open") || ($target.val() == "open" && @question.get("type") != "open")
      @updateModel()
      @question.set "type", $target.val()
      @question.set "options", []
      @render()

  #
  # Saving
  #
  done: ->
    return false unless @activity == null
    @activity = "saving"

    @updateModel()
    @question.save null,
      success: =>
        @activity = null
        Utils.midAlert "Question Saved"
        clearTimeout @timer # go with the last timeout
        @timer = setTimeout @goBack, 500
      error: =>
        @activity = null
        Utils.midAlert "Save error"
    return false

  goBack: =>
    classOrNot = 'class/' if @question.has("curriculumId")
    Tangerine.router.navigate "#{classOrNot||""}subtest/#{@question.get('subtestId')}", true
    return false

  updateModel: =>
    # basics
    @question.set
      "prompt"          : @$el.find("#prompt").val()
      "name"            : @$el.find("#name").val().safetyDance()
      "hint"            : @$el.find("#hint").val()
      "skipLogic"       : @$el.find("#skip_logic").val()
      "linkedGridScore" : parseInt(@$el.find("#linked_grid_score").val())
      "type"            : @$el.find("#question_type input:checked").val()
      "skippable"       : @$el.find("#skip_radio input:radio[name=skippable]:checked").val() == "true"
      "customValidationCode"    : @$el.find("#custom_validation_code").val()
      "customValidationMessage" : @$el.find("#custom_validation_message").val()
      "displayCode"             : @$el.find("#display_code").val()
      
    # options
    options = []
    i = 0
    optionListElements = @$el.find("#option_list li")
    for li in optionListElements
      label = $(li).find(".option_label").val()
      value = $(li).find(".option_value").val().safetyDance()

      if label? || value?
        options[i] =
          label : label
          value : value
        i++
    
    # validate not empty
    if options.length != 0 
      last = options.pop()
      if last.label != "" && last.value != "" then options.push last

    @question.set "options", options

  #
  # Deleting an option
  #
  showDeleteConfirm: (event) -> @$el.find(".delete_confirm_#{@$el.find(event.target).attr('data-index')}").fadeIn(250)
  hideDeleteConfirm: (event) -> @$el.find(".delete_confirm_#{@$el.find(event.target).attr('data-index')}").fadeOut(250)
  deleteOption: (event) ->
    @updateModel()
    options = @question.get "options"
    options.splice @$el.find(event.target).attr('data-index'), 1
    @question.set "options", options
    @refreshOptionList()
    return false
