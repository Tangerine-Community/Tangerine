class SubtestEditView extends Backbone.View

  className: "subtest_edit"

  events:
    'click .back_button'         : 'goBack'
    'click .save_subtest'        : 'saveSubtest'

    'click .richtext_edit'     : 'richtextEdit'
    'click .richtext_save'     : 'richtextSave'
    'click .richtext_cancel'   : 'richtextCancel'
    'change #display_code' : 'validateSyntax'


  richtextConfig: [
      "key"           : "enumerator"
      "attributeName" : "enumeratorHelp"
    ,
      "key"           : "dialog"
      "attributeName" : "studentDialog"
    ,
      "key"           : "transition"
      "attributeName" : "transitionComment"
  ]

  initialize: ( options ) ->

    @activity = null
    @timer = 0
    
    @richtextKeys = _.pluck(@richtextConfig, "key")

    @model      = options.model
    @assessment = options.assessment
    @config     = Tangerine.config.subtest

    @prototypeViews  = Tangerine.config.get "prototypeViews"
    @prototypeEditor = new window[@prototypeViews[@model.get 'prototype']['edit']]
      model: @model
      parent: @

    @prototypeEditor.on "question-edit", (questionId) =>
      @save
        questionSave  : false
        success       : -> Tangerine.router.navigate "question/#{questionId}", true

  goBack: =>
    Tangerine.router.navigate "edit/" + @model.get("assessmentId"), true


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

  getRichtextConfig: (event) ->

    if _.isString event
      dataKey = event
    else
      $target = $(event.target)
      dataKey = $target.parent().attr("data-richtextKey") || $target.parent().parent().attr("data-richtextKey")

    attributeName = _.where(@richtextConfig, "key":dataKey)[0].attributeName

    return {
      "dataKey"       : dataKey
      "attributeName" : attributeName
    }


  richtextEdit: (event) ->

    config = @getRichtextConfig event

    @$el.find(".#{config.dataKey}_preview, .#{config.dataKey}_edit, .#{config.dataKey}_buttons").fadeToggle(250)
    
    @editor = {} if not @editor?
    @$el.find("textarea##{config.dataKey}_textarea").html(@model.escape(config.attributeName) || "")
    @editor[config.dataKey] = CKEDITOR.replace("#{config.dataKey}_textarea")

  richtextSave: (event) ->

    config = @getRichtextConfig event
    newAttributes = {}
    newAttributes[config.attributeName] = @editor[config.dataKey].getData()

    @model.save newAttributes, 
      success: =>
        @richtextCancel(config.dataKey)
      error: =>
        alert "Save error. Please try again."

  richtextCancel: (event) ->

    config = @getRichtextConfig event

    $preview = $("div.#{config.dataKey}_preview")
    $preview.html @model.get(config.attributeName) || ""
    $preview.fadeIn(250)
    @$el.find("button.#{config.dataKey}_edit, .#{config.dataKey}_buttons").fadeToggle(250)
    @editor[config.dataKey].destroy()

  saveSubtest: -> @save()

  save: ( options={} ) =>

    return false unless @activity == null
    @activity = "saving"

    # by default save prototype as well
    options.prototypeSave = if options.prototypeSave? then options.prorotypeSave else true

    prototype = @model.get("prototype")

    @model.set
      name              : @$el.find("#subtest_name").val()
      enumeratorHelp    : @$el.find("#enumerator_help").val()
      studentDialog     : @$el.find("#student_dialog").val()
      transitionComment : @$el.find("#transition_comment").val()
      skippable         : @$el.find("#skip_radio input:radio[name=skippable]:checked").val() == "true"

      enumeratorHelp    : @$el.find("#enumerator_textarea").val()
      studentDialog     : @$el.find("#dialog_textarea").val()
      transitionComment : @$el.find("#transition_textarea").val()

      displayCode : @$el.find("#display_code").val()

      fontFamily : @$el.find("#font_family").val()

    # important not to let prototypes use success or error
    @prototypeEditor.save(options)

    # only care about errors if it's not an "on edit" save
    if @prototypeEditor.isValid() == false
      Utils.midAlert "There are errors on this page"
      @prototypeEditor.showErrors?()
      @activity = null
    else
      @model.save null,
        success: =>
          @activity = null
          # prefer the success callback
          return options.success() if options.success
          Utils.midAlert "Subtest Saved"
          clearTimeout @timer
          @timer = setTimeout @goBack, 1000

        error: =>
          @activity = null
          return options.error() if options.error?
          Utils.midAlert "Save error"


  render: ->
    assessmentName = @assessment.escape "name"
    name        = @model.escape "name"
    prototype   = @model.get "prototype"
    enummerator = @model.getString("enumeratorHelp")
    dialog      = @model.getString("studentDialog")
    transition  = @model.getString("transitionComment")
    skippable   = @model.getBoolean("skippable")
    fontFamily  = @model.getEscapedString("fontFamily")
    displayCode = @model.getString("displayCode")
    groupHandle = Tangerine.settings.getEscapedString("groupHandle")

    @$el.html "
      <h1>Subtest Editor</h1>
      <table class='basic_info'>
        <tr>
          <th>Group</th>
          <td>#{groupHandle}</td>
        </tr>
        <tr>
          <th>Assessment</th>
          <td>#{assessmentName}</td>
        </tr>
      </table>
      <button class='save_subtest command'>Done</button>
      <div id='subtest_edit_form' class='edit_form'>
        <div class='label_value'>
          <label for='subtest_name'>Name</label>
          <input id='subtest_name' value='#{name}'>
        </div>
        <div class='label_value'>
          <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent). This property is set in assessment builder when you add a subtest. It is unchangeable.'>Prototype</label><br>
          <div class='info_box'>#{prototype}</div>
        </div>
        <div class='label_value'>
          <label>Skippable</label><br>
          <div class='menu_box'>
            <div id='skip_radio' class='buttonset'>
              <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' #{'checked' if skippable}>
              <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' #{'checked' if not skippable}>
            </div>
          </div>
        </div>
        <div class='label_value' data-richtextKey='enumerator'>
          <label for='enumerator_textarea' title='If text is supplied, a help button will appear at the top of the subtest as a reference for the enumerator. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Enumerator help <button class='richtext_edit command'>Edit</button></label>
          <div class='info_box_wide enumerator_preview'>#{enummerator}</div>
          <textarea id='enumerator_textarea' class='confirmation'>#{enummerator}</textarea>
          <div class='enumerator_buttons confirmation'>
            <button class='richtext_save command'>Save</button>
            <button class='richtext_cancel command'>Cancel</button>
          </div>
        </div>
        <div class='label_value' data-richtextKey='dialog'>
          <label for='dialog_textarea' title='Generally this is a script that will be read to the student. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Student Dialog <button class='richtext_edit command'>Edit</button></label>
          <div class='info_box_wide dialog_preview'>#{dialog}</div>
          <textarea id='dialog_textarea' class='confirmation'>#{dialog}</textarea>
          <div class='dialog_buttons confirmation'>
            <button class='richtext_save command'>Save</button>
            <button class='richtext_cancel command'>Cancel</button>
          </div>
        </div>
        <div class='label_value' data-richtextKey='transition'>
          <label for='transition_testarea' title='This will be displayed with a grey background above the next button, similar to the student dialog text. If you are pasting from Word it is recommended to paste into a plain text editor first, and then into this box.'>Transition Comment <button class='richtext_edit command'>Edit</button></label>
          <div class='info_box_wide transition_preview'>#{transition}</div>
          <textarea id='transition_textarea' class='confirmation'>#{transition}</textarea>
          <div class='transition_buttons confirmation'>
            <button class='richtext_save command'>Save</button>
            <button class='richtext_cancel command'>Cancel</button>
          </div>
        </div>
        <div class='label_value'>
          <label for='font_family' title='Please be aware that whatever font is specified, must be available on the user`s system. When multiple fonts are entered separated by commas, they are ranked in order of preference from left to right. Font names with spaces must be wrapped in double quotes.'>Preferred font</label>
          <input id='font_family' value='#{fontFamily}'>
        </div>
        <div class='menu_box'>
          <div class='label_value'>
            <label for='display_code' title='This CoffeeScript code will be executed when this question is shown. This option may only be used when Focus Mode is on.'>Action on display</label>
            <textarea id='display_code'>#{displayCode}</textarea>
          </div>
        </div>

      </div>
      <div id='prototype_attributes'></div>

      <button class='save_subtest command'>Done</button>
      "

    @prototypeEditor.setElement @$el.find('#prototype_attributes')
    @prototypeEditor.render?()
    
    @trigger "rendered"

  afterRender: ->
    @prototypeEditor?.afterRender?()


  onClose: ->
    @prototypeEditor.close?()

