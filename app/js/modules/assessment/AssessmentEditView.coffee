class AssessmentEditView extends Backbone.View

  className : 'assessment_edit_view'

  events :
    'click #archive_buttons input' : 'save'
    'click .back'                  : 'goBack'
    'click .new_subtest_button'    : 'toggleNewSubtestForm'
    'click .new_subtest_cancel'    : 'toggleNewSubtestForm'

    'keypress #new_subtest_name'   : 'saveNewSubtest'
    'click .new_subtest_save'      : 'saveNewSubtest'

    'change #basic input'          : 'save'
    'click .save'                  : 'save'

  initialize: (options) ->
    @model = options.model
    @subtestListEditView = new SubtestListEditView
      "assessment" : @model

    @model.subtests.on "change remove", @subtestListEditView.render
    @model.subtests.on "all", @updateSubtestLegend

  save: =>
    if @updateModel()
      @model.save null,
        success: =>
          Utils.midAlert "#{@model.get("name")} saved" 
        error: =>
          Utils.midAlert "Assessment save error. Please try again." 

  goBack: -> Tangerine.router.navigate "assessments", true

  updateModel: =>

    #
    # parse acceptable random sequences
    #

    subtestCount = @model.subtests.models.length

    # remove everything except numbers, commas and new lines
    sequencesValue = @$el.find("#sequences").val().replace(/[^0-9,\n]/g,"")
    sequences = sequencesValue.split("\n")

    # parse strings to numbers and collect errors
    for sequence, i in sequences

      sequence = sequence.split(",")
      for element, j in sequence
        sequence[j] = parseInt(element)
        rangeError = true if sequence[j] < 0 or sequence[j] >= subtestCount
        emptyError = true if isNaN(sequence[j])
      
      sequences[i] = sequence
      
      # detect errors
      tooManyError = true if sequence.length > subtestCount
      tooFewError  = true if sequence.length < subtestCount
      doublesError = true if sequence.length != _.uniq(sequence).length
    
    # show errors if they exist and sequences exist
    if not _.isEmpty _.reject( _.flatten(sequences), (e) -> return isNaN(e)) # remove unparsable empties, don't _.compact. will remove 0s
      sequenceErrors = []
      if emptyError   then sequenceErrors.push "Some sequences contain empty values."
      if rangeError   then sequenceErrors.push "Some numbers do not reference a subtest from the legend."
      if tooManyError then sequenceErrors.push "Some sequences are longer than the total number of all subtests."
      if tooFewError  then sequenceErrors.push "Some sequences are shorter than the total number of all subtests."
      if doublesError then sequenceErrors.push "Some sequences contain doubles."

      if sequenceErrors.length == 0
        # if there's no errors, clean up the textarea content
        validatedSequences = (sequence.join(", ") for sequence in sequences).join("\n")
        @$el.find("#sequences").val(validatedSequences)
      else # if there's errors, they can still save. Just show a warning
        alert "Warning\n\n#{sequenceErrors.join("\n")}"

    # nothing resembling a valid sequence was found
    else
      @$el.find("#sequences").val("") # clean text area

    @model.set
      sequences : sequences
      archived  : @$el.find("#archive_buttons input:checked").val() == "true"
      name      : @$el.find("#assessment_name").val()
      dKey      : @$el.find("#assessment_d_key").val()
      assessmentId : @model.id
    return true

  toggleNewSubtestForm: (event) ->
    @$el.find(".new_subtest_form, .new_subtest_button").fadeToggle(250, => 
      @$el.find("#new_subtest_name").val("")
      @$el.find("#subtest_type_select").val("none")
    )
    false

  saveNewSubtest: (event) =>
    
    if event.type != "click" && event.which != 13
      return true
    
    # if no subtest type selected, show error
    if @$el.find("#subtest_type_select option:selected").val() == "none"
      Utils.midAlert "Please select a subtest type"
      return false
    
    # general template
    newAttributes = Tangerine.templates.get("subtest")
    
    # prototype template
    prototypeTemplate = Tangerine.templates.get("prototypes")[@$el.find("#subtest_type_select").val()]
    
    # bit more specific template
    useType = @$el.find("#subtest_type_select :selected").attr 'data-template'
    useTypeTemplate = Tangerine.templates.get("subtestTemplates")[@$el.find("#subtest_type_select").val()][useType]

    newAttributes = $.extend newAttributes, prototypeTemplate
    newAttributes = $.extend newAttributes, useTypeTemplate
    newAttributes = $.extend newAttributes,
      name         : @$el.find("#new_subtest_name").val()
      assessmentId : @model.id
      order        : @model.subtests.length
    newSubtest = @model.subtests.create newAttributes
    @toggleNewSubtestForm()
    return false
  
  render: =>
    sequences = ""
    if @model.has("sequences") 
      sequences = @model.get("sequences")
      sequences = sequences.join("\n")

      if _.isArray(sequences)
        for sequences, i in sequences 
          sequences[i] = sequences.join(", ")

    subtestLegend = @updateSubtestLegend()

    arch = @model.get('archived')
    archiveChecked    = if (arch == true or arch == 'true') then "checked" else ""
    notArchiveChecked = if archiveChecked then "" else "checked"

    # list of "templates"
    subtestTypeSelect = "<select id='subtest_type_select'>
      <option value='none' disabled='disabled' selected='selected'>Please select a subtest type</option>"
    for key, value of Tangerine.templates.get("subtestTemplates")
      subtestTypeSelect += "<optgroup label='#{key.humanize()}'>"
      for subKey, subValue of value
        subtestTypeSelect += "<option value='#{key}' data-template='#{subKey}'>#{subKey}</option>"
      subtestTypeSelect += "</optgroup>"
    subtestTypeSelect += "</select>"

    
    @$el.html "
      <button class='back navigation'>Back</button>
        <h1>Assessment Builder</h1>
      <div id='basic'>
        <label for='assessment_name'>Name</label>
        <input id='assessment_name' value='#{@model.escape("name")}'>

        <label for='assessment_d_key' title='This key is used to import the assessment from a tablet.'>Download Key</label><br>
        <div class='info_box'>#{@model.id.substr(-5,5)}</div>
      </div>

      <label title='Only active assessments will be displayed in the main assessment list.'>Status</label><br>
      <div id='archive_buttons' class='buttonset'>
        <input type='radio' id='archive_false' name='archive' value='false' #{notArchiveChecked}><label for='archive_false'>Active</label>
        <input type='radio' id='archive_true'  name='archive' value='true'  #{archiveChecked}><label for='archive_true'>Archived</label>
      </div>
      <h2>Subtests</h2>
      <div class='menu_box'>
        <div>
        <ul id='subtest_list'>
        </ul>
        </div>
        <button class='new_subtest_button command'>Add Subtest</button>
        <div class='new_subtest_form confirmation'>
          <div class='menu_box'>
            <h2>New Subtest</h2>
            <label for='subtest_type_select'>Type</label><br>
            #{subtestTypeSelect}<br>
            <label for='new_subtest_name'>Name</label><br>
            <input type='text' id='new_subtest_name'>
            <button class='new_subtest_save command'>Add</button> <button class='new_subtest_cancel command'>Cancel</button>
          </div>
        </div>
      </div>
      <h2>Options</h2>
      <div class='label_value'>
        <label for='sequences' title='This is a list of acceptable orders of subtests, which will be randomly selected each time an assessment is run. Subtest indicies are separated by commas, new lines separate sequences. '>Random Sequences</label>
        <div id='subtest_legend'>#{subtestLegend}</div>
        <textarea id='sequences'>#{sequences}</textarea>
      </div>
      <button class='save command'>Save</button>
      "

    # render new subtest views
    @subtestListEditView.setElement(@$el.find("#subtest_list"))
    @subtestListEditView.render()
    
    # make it sortable
    @$el.find("#subtest_list").sortable
      handle : '.sortable_handle'
      start: (event, ui) -> ui.item.addClass "drag_shadow"
      stop:  (event, ui) -> ui.item.removeClass "drag_shadow"
      update : (event, ui) =>
        for id, i in ($(li).attr("data-id") for li in @$el.find("#subtest_list li"))
          @model.subtests.get(id).set({"order":i},{silent:true}).save(null,{silent:true})
        @model.subtests.sort()

    @trigger "rendered"

  
  updateSubtestLegend: =>
    subtestLegend = ""
    @model.subtests.each (subtest, i) ->
      subtestLegend += "<div class='small_grey'>#{i} - #{subtest.get("name")}</div><br>"
    $subtestWrapper = @$el.find("#subtest_legend")
    $subtestWrapper.html(subtestLegend) if $subtestWrapper.length != 0
    return subtestLegend

  onClose: ->
    @subtestListEditView.close()
    
