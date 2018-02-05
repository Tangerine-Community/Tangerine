class KlassSubtestEditView extends Backbone.View

  className: "subtest_edit"

  events :
    'click .back_button'  : 'goBack'
    'click .save_subtest' : 'save'
    'blur #subtest_items' : 'cleanWhitespace'
    'click .add_question'        : 'toggleAddQuestion'
    'click .add_question_cancel' : 'toggleAddQuestion'
    'click .add_question_add'    : 'addQuestion'
    'keypress #question_name'    : 'addQuestion'


  cleanWhitespace: ->
    @$el.find("#subtest_items").val( @$el.find("#subtest_items").val().replace(/\s+/g, ' ') )

  initialize: ( options ) ->
    @model      = options.model
    @curriculum = options.curriculum
    @prototype  = @model.get("prototype")

    @prototypeViews  = Tangerine.config.get "prototypeViews"

    if @prototype == "survey"
      @questions = options.questions

      @surveyEditor = new window[@prototypeViews[@prototype]['edit']]
        model  : @model
        parent : @

      @questions.ensureOrder()

      @questionsEditView = new QuestionsEditView
        questions : @questions
      
      @questionsEditView.on "question-edit", (questionId) =>
        @save null,
          questionSave  : false
          success       : -> 
            Tangerine.router.navigate "class/question/#{questionId}", true

      @questions.on "change", => @renderQuestions()
      @renderQuestions()

  goBack: =>
    Tangerine.router.navigate "curriculum/#{@model.get('curriculumId')}", true

  save: (event, options={}) ->


    #
    # Grids
    #
    if @prototype == "grid"
      @model.save
        name           : @$el.find("#name").val()
        part           : Math.max(parseInt( @$el.find("#part").val() ), 1)
        reportType     : @$el.find("#report_type").val().toLowerCase()
        itemType       : @$el.find("#item_type").val().toLowerCase()
        scoreTarget    : parseInt(@$el.find("#score_target").val())
        scoreSpread    : parseInt(@$el.find("#score_spread").val())
        order          : parseInt(@$el.find("#order").val())

        captureLastAttempted: @$el.find("#capture_last_attempted input:checked").val() == "true"
        endOfLine : @$el.find("#end_of_line input:checked").val() == "true"
        randomize : @$el.find("#randomize input:checked").val() == "true"
        timer     : Math.max(parseInt( @$el.find("#subtest_timer").val() ), 0)
        items     : _.compact( @$el.find("#subtest_items").val().split(" ") ) # mild sanitization, happens at read too
        columns   : Math.max(parseInt( @$el.find("#subtest_columns").val() ), 0)
      ,
        success: =>
          Utils.midAlert "Subtest Saved"
        error: =>
          Utils.midAlert "Save error"


    #
    # Surveys
    #

    else if @prototype == "survey"

      options.questionSave = if options.questionSave then options.questionSave else true

      # blank out our error queues
      notSaved = []
      emptyOptions = []
      requiresGrid = []

      # check for "errors"
      for question, i in @questions.models
        if question.get("type") != "open" && question.get("options")?.length == 0
          emptyOptions.push i + 1
        
          if options.questionSave
            if not question.save()
              notSaved.push i
            if question.has("linkedGridScore") && question.get("linkedGridScore") != "" && question.get("linkedGridScore") != 0 && @model.has("gridLinkId") == "" && @model.get("gridLinkId") == ""
              requiresGrid.push i
          
      # display errors
      if notSaved.length != 0
        Utils.midAlert "Error<br><br>Questions: <br>#{notSaved.join(', ')}<br>not saved"
      if emptyOptions.length != 0
        plural = emptyOptions.length > 1
        _question = if plural then "Questions" else "Question"
        _has      = if plural then "have" else "has"
        alert "Warning\n\n#{_question} #{emptyOptions.join(' ,')} #{ _has } no options."
      if requiresGrid.length != 0
        plural = emptyOptions.length > 1
        _question = if plural then "Questions" else "Question"
        _require  = if plural then "require" else "requires"
        alert "Warning\n\n#{ _question } #{requiresGrid.join(' ,')} #{ _require } a grid to be linked to this test."



      @model.save
        name           : @$el.find("#name").val()
        part           : Math.max(parseInt( @$el.find("#part").val() ), 1)
        reportType     : @$el.find("#report_type").val().toLowerCase()
        itemType       : @$el.find("#item_type").val().toLowerCase()
        scoreTarget    : parseInt(@$el.find("#score_target").val())
        scoreSpread    : parseInt(@$el.find("#score_spread").val())
        order          : Math.max(parseInt(@$el.find("#order").val()), 0)

        gridLinkId     : @$el.find("#link_select option:selected").val()
        autostopLimit  : parseInt(@$el.find("#autostop_limit").val()) || 0

      ,
        success: =>
          # prefer the success callback
          return options.success() if options.success
          Utils.midAlert "Subtest Saved"
          setTimeout @goBack, 1000

        error: ->
          return options.error() if options.error?
          Utils.midAlert "Save error"

  renderQuestions: =>
    @$el.find("#question_list_wrapper").empty()
    @questionsEditView?.render()
    @$el.find("#question_list_wrapper").append @questionsEditView?.el

  toggleAddQuestion: =>
    @$el.find("#add_question_form, .add_question").fadeToggle 250, =>
      if @$el.find("#add_question_form").is(":visible")
        @$el.find("#question_prompt").focus()
    return false

  addQuestion: (event) ->
    
    if event.type != "click" && event.which != 13
      return true

    newAttributes = $.extend Tangerine.templates.get("questionTemplate"),
      subtestId    : @model.id
      curriculumId : @curriculum.id
      id           : Utils.guid()
      order        : @questions.length
      prompt       : @$el.find('#question_prompt').val()
      name         : @$el.find('#question_name').val().safetyDance()

    nq = @questions.create newAttributes
    @$el.find("#add_question_form input").val ''
    @$el.find("#question_prompt").focus()

    return false


  render: ->

    curriculumName = @curriculum.escape "name"
    name           = @model.escape "name"
    part           = @model.getNumber "part"
    reportType     = @model.escape "reportType"
    itemType       = @model.escape "itemType"

    scoreTarget    = @model.getNumber "scoreTarget"
    scoreSpread    = @model.getNumber "scoreSpread"
    order          = @model.getNumber "order"

    #
    # Grids
    #
    if @prototype == "grid"
      endOfLine    = if @model.has("endOfLine") then @model.get("endOfLine") else true
      randomize    = if @model.has("randomize") then @model.get("randomize") else false
      captureLastAttempted = if @model.has("captureLastAttempted") then @model.get("captureLastAttempted") else true

      items        = @model.get("items").join " "
      timer        = @model.get("timer")        || 0
      columns      = @model.get("columns")      || 0

      prototypeOptions = "
        <div class='label_value'>
          <label for='subtest_items' title='These items are space delimited. Pasting text from other applications may insert tabs and new lines. Whitespace will be automatically corrected.'>Grid Items</label>
          <textarea id='subtest_items'>#{items}</textarea>
        </div>

        <label>Randomize items</label><br>
        <div class='menu_box'>
          <div id='randomize' class='buttonset'>
            <label for='randomize_true'>Yes</label><input name='randomize' type='radio' value='true' id='randomize_true' #{'checked' if randomize}>
            <label for='randomize_false'>No</label><input name='randomize' type='radio' value='false' id='randomize_false' #{'checked' if not randomize}>
          </div>
        </div><br>

        <label>Mark entire line button</label><br>
        <div class='menu_box'>
          <div id='end_of_line' class='buttonset'>
            <label for='end_of_line_true'>Yes</label><input name='end_of_line' type='radio' value='true' id='end_of_line_true' #{'checked' if endOfLine}>
            <label for='end_of_line_false'>No</label><input name='end_of_line' type='radio' value='false' id='end_of_line_false' #{'checked' if not endOfLine}>
          </div>
        </div><br>

        <label>Capture last item attempted</label><br>
        <div class='menu_box'>
          <div id='capture_last_attempted' class='buttonset'>
            <label for='capture_last_attempted_true'>Yes</label><input name='capture_last_attempted' type='radio' value='true' id='capture_last_attempted_true' #{'checked' if captureLastAttempted}>
            <label for='capture_last_attempted_false'>No</label><input name='capture_last_attempted' type='radio' value='false' id='capture_last_attempted_false' #{'checked' if not captureLastAttempted}>
          </div>
        </div><br>

        <div class='label_value'>
          <label for='subtest_columns' title='Number of columns in which to display the grid items.'>Columns</label><br>
          <input id='subtest_columns' value='#{columns}' type='number'>
        </div>

        <div class='label_value'>
          <label for='subtest_timer' title='Seconds to give the child to complete the test. Setting this value to 0 will make the test untimed.'>Timer</label><br>
          <input id='subtest_timer' value='#{timer}' type='number'>
        </div>
      "

    #
    # Survey
    #

    else if @prototype == "survey"


      gridLinkId = @model.get("gridLinkId") || ""
      autostopLimit = parseInt(@model.get("autostopLimit")) || 0

      @on "rendered", =>
        @renderQuestions()

        # get linked grid options
        subtests = new Subtests
        subtests.fetch
          key: @curriculum.id
          success: (collection) =>
            collection = new Subtests collection.where
              prototype : 'grid' # only grids can provide scores
            collection.sort()
            linkSelect = "
              <div class='label_value'>
                <label for='link_select'>Linked to grid</label><br>
                <div class='menu_box'>
                  <select id='link_select'>
                  <option value=''>None</option>"
            for subtest in collection.models
              linkSelect += "<option value='#{subtest.id}' #{if (gridLinkId == subtest.id) then 'selected' else ''}>#{subtest.get('part')} #{subtest.get 'name'}</option>"
            linkSelect += "</select></div></div>"
            @$el.find('#grid_link').html linkSelect



      prototypeOptions = "
        <div class='label_value'>
          <label for='autostop_limit' title='The survey will discontinue after the first N questions have been answered with a &quot;0&quot; value option.'>Autostop after N incorrect</label><br>
          <input id='autostop_limit' type='number' value='#{autostopLimit}'>
        </div>
        <div id='grid_link'></div>
        <div id='questions'>
          <h2>Questions</h2>
          <div class='menu_box'>
            <div id='question_list_wrapper'><img class='loading' src='images/loading.gif'></div>
            <button class='add_question command'>Add Question</button>
            <div id='add_question_form' class='confirmation'>
              <div class='menu_box'>
                <h2>New Question</h2>
                <label for='question_prompt'>Prompt</label>
                <input id='question_prompt'>
                <label for='question_name'>Variable name</label>
                <input id='question_name' title='Allowed characters: A-Z, a-z, 0-9, and underscores.'><br>
                <button class='add_question_add command'>Add</button><button class='add_question_cancel command'>Cancel</button>
              </div>
            </div> 
          </div>
        </div>
      "

    @$el.html "
      <button class='back_button navigation'>Back</button><br>
      <h1>Subtest Editor</h1>
      <table class='basic_info'>
        <tr>
          <th>Curriculum</th>
          <td>#{curriculumName}</td>
        </tr>
      </table>

      <button class='save_subtest command'>Done</button>

      <div class='label_value'>
        <label for='name'>Name</label>
        <input id='name' value='#{name}'>
      </div>

      <div class='label_value'>
        <label for='report_type'>Report Type</label>
        <input id='report_type' value='#{reportType}'>
      </div>

      <div class='label_value'>
        <label for='item_type' title='This variable is used for reports. All results from subtests with the same Item Type will show up together. Inconsistent naming will invalidate results.  '>Item Type</label>
        <input id='item_type' value='#{itemType}'>
      </div>

      <div class='label_value'>
        <label for='part'>Assessment Number</label><br>
        <input type='number' id='part' value='#{part}'>
      </div>

      <div class='label_value'>
        <label for='score_target'>Target score</label><br>
        <input type='number' id='score_target' value='#{scoreTarget}'>
      </div>

      <div class='label_value'>
        <label for='score_spread'>Score spread</label><br>
        <input type='number' id='score_spread' value='#{scoreSpread}'>
      </div>

      <div class='label_value'>
        <label for='order'>Order</label><br>
        <input type='number' id='order' value='#{order}'>
      </div>

      #{prototypeOptions}

      <button class='save_subtest command'>Done</button>
      "

    @trigger "rendered"

