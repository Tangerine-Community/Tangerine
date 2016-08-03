class ElementEditView extends Backbone.View

  className: "element_edit"

  events:
    'click .back_button'         : 'goBack'
    'click .save_element'        : 'saveElement'

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
#    @config     = Tangerine.config.element

    @elementViews  = Tangerine.config.get "elementViews"
    console.log("@model.get 'element': " + @model.get 'element')
    @elementEditor = new window[@elementViews[@model.get 'element']['edit']]
      model: @model
      parent: @

    @elementEditor.on "question-edit", (questionId) =>
      @save
        questionSave  : false
        success       : -> Tangerine.router.navigate "question/#{questionId}", true

  goBack: =>
    Tangerine.router.navigate "editLP/" + @model.get("assessmentId"), true


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

  saveElement: -> @save()

  save: ( options={} ) =>

    return false unless @activity == null
    @activity = "saving"

    # by default save element as well
    options.elementSave = if options.elementSave? then options.elementSave else true

    element = @model.get("element")

    @model.set
      name              : @$el.find("#element_name").val()
      enumeratorHelp    : @$el.find("#enumerator_help").val()
      studentDialog     : @$el.find("#student_dialog").val()
      transitionComment : @$el.find("#transition_comment").val()
      skippable         : @$el.find("#skip_radio input:radio[name=skippable]:checked").val() == "true"
      rtl               : @$el.find("#rtl_radio input:radio[name=rtl]:checked").val() == "true"
      backButton        : @$el.find("#back_button_radio input:radio[name=back_button]:checked").val() == "true"

      enumeratorHelp    : @$el.find("#enumerator_textarea").val()
      studentDialog     : @$el.find("#dialog_textarea").val()
      transitionComment : @$el.find("#transition_textarea").val()

      language : @$el.find("#language").val()


      displayCode : @$el.find("#display_code").val()

      fontFamily : @$el.find("#font_family").val()

    # important not to let elements use success or error
    @elementEditor.save(options)

    # only care about errors if it's not an "on edit" save
    if @elementEditor.isValid() == false
      Utils.midAlert "There are errors on this page"
      @elementEditor.showErrors?()
      @activity = null
    else
      @model.save null,
        success: =>
          @activity = null
          # prefer the success callback
          return options.success() if options.success
          Utils.midAlert "Element Saved"
          clearTimeout @timer
          @timer = setTimeout @goBack, 1000

        error: =>
          @activity = null
          return options.error() if options.error?
          Utils.midAlert "Save error"


  render: ->
    assessmentName = @assessment.escape "lessonPlan_title"
    name        = @model.escape "name"
    element   = @model.get "element"
    enummerator = @model.getString("enumeratorHelp")
    dialog      = @model.getString("studentDialog")
    transition  = @model.getString("transitionComment")
    skippable   = @model.getBoolean("skippable")
    rtl         = @model.getBoolean("rtl")
    backButton  = @model.getBoolean("backButton")
    fontFamily  = @model.getEscapedString("fontFamily")
    displayCode = @model.getString("displayCode")
    language    = @model.getString("language")
    groupHandle = Tangerine.settings.getEscapedString("groupHandle")

    rtlEditHtml = ""

    @$el.html "
      <h1>Element Editor</h1>
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
      <button class='save_element command'>Done</button>
      <div id='element_edit_form' class='edit_form'>
        <div class='label_value'>
          <label for='element_name'>Name</label>
          <input id='element_name' value='#{name}'>
        </div>
        <div class='label_value'>
          <label for='element_element' title='This is a basic type of element. (e.g. Survey, Grid, Location, Id, Consent). This property is set in assessment builder when you add a element. It is unchangeable.'>Element</label><br>
          <div class='info_box'>#{element}</div>
        </div>

        #{rtlEditHtml||''}

      </div>
      <div id='element_attributes'></div>

      <button class='save_element command'>Done</button>
      "

    @elementEditor.setElement @$el.find('#element_attributes')
    @elementEditor.render?()
    
    @trigger "rendered"

  afterRender: ->
    @elementEditor?.afterRender?()
    CKEDITOR.replace("html")

  onClose: ->
    @elementEditor.close?()

