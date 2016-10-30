class LessonPlanEditView extends Backbone.View

  className : 'lessonPlan_edit_view'

  events :
    'change #element_type_select'  : 'addElement'
    'click #archive_buttons input' : 'save'
    'click .back'                  : 'goBack'
    'click .new_element_button'    : 'toggleNewElementForm'
    'click .new_element_cancel'    : 'toggleNewElementForm'

    'keypress #new_element_name'   : 'saveNewElement'
    'click .new_element_save'      : 'saveNewElement'

    'change #basic input'          : 'save'
    'click .save'                  : 'save'

  initialize: (options) ->
    @model = options.model
    @elementListEditView = new ElementListEditView
      "lessonPlan" : @model
      "assessment" : @model

    @model.elements.on "change remove", @elementListEditView.render
    @model.elements.on "all", @updateElementLegend

  addElement: () ->
    value = $('#element_type_select').val()
    if value == 'media'  
      $('#files').show()
      $('#html_div').hide()
    if value == 'html' 
      $('#html_div').show()
      $('#files').hide()

  save: =>
    if @updateModel()
      @model.save null,
        success: =>
          Utils.midAlert "#{@model.get("name")} saved"
        error: =>
          Utils.midAlert "LessonPlan save error. Please try again."

  goBack: -> Tangerine.router.navigate "assessments", true

  updateModel: =>

#
# parse acceptable random sequences
#

    elementCount = @model.elements.models.length

    # remove everything except numbers, commas and new lines
    sequencesValue = @$el.find("#sequences").val().replace(/[^0-9,\n]/g,"")
    sequences = sequencesValue.split("\n")

    # parse strings to numbers and collect errors
    for sequence, i in sequences

      sequence = sequence.split(",")
      for element, j in sequence
        sequence[j] = parseInt(element)
        rangeError = true if sequence[j] < 0 or sequence[j] >= elementCount
        emptyError = true if isNaN(sequence[j])

      sequences[i] = sequence

      # detect errors
      tooManyError = true if sequence.length > elementCount
      tooFewError  = true if sequence.length < elementCount
      doublesError = true if sequence.length != _.uniq(sequence).length

    # show errors if they exist and sequences exist
    if not _.isEmpty _.reject( _.flatten(sequences), (e) -> return isNaN(e)) # remove unparsable empties, don't _.compact. will remove 0s
      sequenceErrors = []
      if emptyError   then sequenceErrors.push "Some sequences contain empty values."
      if rangeError   then sequenceErrors.push "Some numbers do not reference a element from the legend."
      if tooManyError then sequenceErrors.push "Some sequences are longer than the total number of all elements."
      if tooFewError  then sequenceErrors.push "Some sequences are shorter than the total number of all elements."
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
      name      : @$el.find("#lessonPlan_title").val()
      dKey      : @$el.find("#lessonPlan_d_key").val()
      lessonPlan_title      : @$el.find("#lessonPlan_title").val()
      lessonPlan_lesson_text      : @$el.find("#lessonPlan_lesson_text").val()
#      lessonPlan_subject      : @$el.find("#lessonPlan_subject").val()
      lessonPlan_subject      : @$el.find("#lessonPlan_subject_buttons input:checked").val()
      lessonPlan_grade      : @$el.find("#lessonPlan_grade").val()
      lessonPlan_week      : @$el.find("#lessonPlan_week").val()
      lessonPlan_day      : @$el.find("#lessonPlan_day").val()
#      lessonPlan_image      : @$el.find("#lessonPlan_image").val()
      lessonPlanId : @model.id
      assessmentId : @model.id
    return true

  toggleNewElementForm: (event) ->
    @$el.find(".new_element_form, .new_element_button").toggle()

    @$el.find("#new_element_name").val("")
    @$el.find("#element_type_select").val("none")


    false

  saveNewElement: (event) =>

    if event.type != "click" && event.which != 13
      return true

    # if no element type selected, show error
    if @$el.find("#element_type_select option:selected").val() == "none"
      Utils.midAlert "Please select an element type"
      return false

    # general template
    newAttributes = Tangerine.templates.get("element")

    # prototype template
    prototypeTemplate = Tangerine.templates.get("elementTypes")[@$el.find("#element_type_select").val()]

    # bit more specific template
    useTypeTemplate = Tangerine.templates.get("element");

    # extract some values from @$el.
    name = @$el.find("#new_element_name").val()
    type = @$el.find("#element_type_select").val()

    # Get the file from the form.
    file = document.getElementById("files").files[0]
    if typeof file != 'undefined'
      fileName = file.name
      fileNameArr = file.name.split('.')
      extension = fileNameArr.pop()

    # build the elementFilename
    if type == "media"
      numElements = @model.elements.length
      sanitizedName = Sanitize  name
      lessonPlanTitle = Sanitize @model.get("lessonPlan_title")
      if sanitizedName != ""
        finalName = "_" + sanitizedName
      else
        finalName = ""
      if lessonPlanTitle != ""
        finalLessonPlanTitle =  lessonPlanTitle
      else
        finalLessonPlanTitle = "LP"
      timestamp = (new Date()).getTime()
      elementFilename = finalLessonPlanTitle + "_" + type + finalName  + "_" + numElements + "_" + timestamp + "." + extension
      console.log("elementFilename: " + elementFilename)

    if typeof file != 'undefined'
      fd = new FormData()
      fd.append("file", file)
      fd.append("groupName", Tangerine.settings.get("groupName"))
      fd.append("elementFilename", elementFilename)

    newAttributes = $.extend newAttributes, prototypeTemplate
    newAttributes = $.extend newAttributes, useTypeTemplate
    newAttributes = $.extend newAttributes,
      name         : name
      element         : type
      lessonPlanId : @model.id
      assessmentId : @model.id
      order        : @model.elements.length

    if CKEDITOR.instances.html.getData() != 'undefined'
      @model.set
        "html" : CKEDITOR.instances.html.getData()
      newAttributes = $.extend newAttributes,
        html: @model.get('html')


    if typeof file != 'undefined'
      newAttributes = $.extend newAttributes,
        fileType  : file.type
        fileName  : file.name
        fileSize  : file.size
        elementFilename  : elementFilename

    if typeof file == 'undefined'
      options =
        success: (model, resp) =>
          console.log("Model created.")
        error: (model, err) =>
          console.log("Error: " + JSON.stringify(err) + " Model: " + JSON.stringify(model))
    else
      options =
        success: (model, resp) =>
  #        console.log("created: " + JSON.stringify(resp) + " Model: " + JSON.stringify(model))
          url = "#{Tangerine.config.get('robbert')}/files"
          xhr = new XMLHttpRequest();
          xhr.upload.onerror = (e) =>
            console.log("Error Uploading image: " + JSON.stringify(e))
          xhr.onreadystatechange = () =>
            if xhr.readyState == 4
              if xhr.status == 200
                console.log(xhr.responseText)
              else
                console.log("There was an error uploading the file: " + xhr.responseText + " Status: " + xhr.status)
#                alert("There was an error uploading the file: " + xhr.responseText + " Status: " + xhr.status)
          xhr.onerror =  (err) =>
            console.log("There was an error uploading the file: " + err)
#            alert("There was an error uploading the file: " + xhr.responseText + " Status: " + xhr.status)

          # define our finish fn
          loaded = ()->
  #          console.log('finished uploading')
          xhr.addEventListener 'load', loaded, false
#          progressBar = document.querySelector('progress');
#          xhr.upload.onprogress = (e) =>
#            if e.lengthComputable
#              progressBar.value = (e.loaded / e.total) * 100;
#              progressBar.textContent = progressBar.value;
#              console.log("progress: " + progressBar.value)
          xhr.open('POST', url, true);
          xhr.send(fd);
        error: (model, err) =>
          console.log("Error: " + JSON.stringify(err) + " Model: " + JSON.stringify(model))

    newElement = @model.elements.create newAttributes, options
#    newElement.on('progress', (evt) ->
#      console.log("Logging newElement: " + evt)
#    )

    @toggleNewElementForm()
    $("#files").val('');
    CKEDITOR.instances['html'].setData("");
    return false

  render: =>
    lessonPlan_title    = @model.getString("lessonPlan_title")
#    lessonPlan_lesson_text    = @model.getString("lessonPlan_lesson_text")
    lessonPlan_subject    = @model.getString("lessonPlan_subject")
    lessonPlan_grade    = @model.getString("lessonPlan_grade")
    lessonPlan_week    = @model.getString("lessonPlan_week")
    lessonPlan_day    = @model.getString("lessonPlan_day")
    sequences = ""
    if @model.has("sequences")
      sequences = @model.get("sequences")
      sequences = sequences.join("\n")

      if _.isArray(sequences)
        for sequences, i in sequences
          sequences[i] = sequences.join(", ")

    elementLegend = @updateElementLegend()

    arch = @model.get('archived')
    archiveChecked    = if (arch == true or arch == 'true') then "checked" else ""
    notArchiveChecked = if archiveChecked then "" else "checked"

    lessonPlan_subject_Afaan_Oromo    = if (lessonPlan_subject == '1') then "checked" else ""
    lessonPlan_subject_Af_Somali = if (lessonPlan_subject == '2') then "checked" else ""
    lessonPlan_subject_Amharic = if (lessonPlan_subject == '3') then "checked" else ""
    lessonPlan_subject_Hadiyyisa = if (lessonPlan_subject == '4') then "checked" else ""
    lessonPlan_subject_Sidaamu_Afoo = if (lessonPlan_subject == '5') then "checked" else ""
    lessonPlan_subject_Tigrinya = if (lessonPlan_subject == '6') then "checked" else ""
    lessonPlan_subject_Wolayttatto = if (lessonPlan_subject == '7') then "checked" else ""


    # list of "templates"
    elementTypeSelect = "<select id='element_type_select'>
      <option value='none' disabled='disabled' selected='selected'>Please select a element type</option>"
    for key, value of Tangerine.templates.get("elementTypes")
#      elementTypeSelect += "<optgroup label='#{key.humanize()}'>"
#      for subKey, subValue of value
        elementTypeSelect += "<option value='#{key}' data-template='#{key}'>#{key.humanize()}</option>"
#      elementTypeSelect += "</optgroup>"
    elementTypeSelect += "</select>"
    html = @model.get("html") || ""

    @$el.html "
      <button class='back navigation'>Back</button>
        <h1>LessonPlan Builder</h1>
      <div id='basic'>
      

        <label for='lessonPlan_d_key' title='This key is used to import the lessonPlan from a tablet.'>Download Key</label><br>
        <div class='info_box'>#{@model.id.substr(-5,5)}</div>
      </div>

      <label title='Only active lessonPlans will be displayed in the main lessonPlan list.'>Status</label><br>
      <div id='archive_buttons' class='buttonset'>
        <input type='radio' id='archive_false' name='archive' value='false' #{notArchiveChecked}><label for='archive_false'>Active</label>
        <input type='radio' id='archive_true'  name='archive' value='true'  #{archiveChecked}><label for='archive_true'>Archived</label>
      </div>

      <div class='label_value'>
        <label for='lessonPlan_title'>LessonPlan Title</label>
        <input id='lessonPlan_title' value='#{lessonPlan_title}'>
      </div>

      <label title='You must choose one of these subjects.' for='lessonPlan_subject_buttons'>LessonPlan subject</label><br>
      <div id='lessonPlan_subject_buttons' class='buttonset'>
        <input type='radio' id='lessonPlan_subject_Afaan_Oromo' name='lessonPlan_subject' value='1' #{lessonPlan_subject_Afaan_Oromo}><label for='lessonPlan_subject_Afaan_Oromo'>Afaan Oromo</label>
        <input type='radio' id='lessonPlan_subject_Af_Somali'  name='lessonPlan_subject' value='2'  #{lessonPlan_subject_Af_Somali}><label for='lessonPlan_subject_Af_Somali'>Af-Somali</label>
        <input type='radio' id='lessonPlan_subject_Amharic'  name='lessonPlan_subject' value='3'  #{lessonPlan_subject_Amharic}><label for='lessonPlan_subject_Amharic'>Amharic</label>
        <input type='radio' id='lessonPlan_subject_Hadiyyisa'  name='lessonPlan_subject' value='4'  #{lessonPlan_subject_Hadiyyisa}><label for='lessonPlan_subject_Hadiyyisa'>Hadiyyisa</label>
        <input type='radio' id='lessonPlan_subject_Sidaamu_Afoo'  name='lessonPlan_subject' value='5'  #{lessonPlan_subject_Sidaamu_Afoo}><label for='lessonPlan_subject_Sidaamu_Afoo'>Sidaamu Afoo</label>
        <input type='radio' id='lessonPlan_subject_Tigrinya'  name='lessonPlan_subject' value='6'  #{lessonPlan_subject_Tigrinya}><label for='lessonPlan_subject_Tigrinya'>Tigrinya</label>
        <input type='radio' id='lessonPlan_subject_Wolayttatto'  name='lessonPlan_subject' value='7'  #{lessonPlan_subject_Wolayttatto}><label for='lessonPlan_subject_Wolayttatto'>Wolayttatto</label>
      </div>
        <div class='label_value'>
        <label for='lessonPlan_grade'>LessonPlan Grade</label>
      <input id='lessonPlan_grade' value='#{lessonPlan_grade}'>
      </div>
        <div class='label_value'>
        <label for='lessonPlan_week'>LessonPlan Week</label>
      <input id='lessonPlan_week' value='#{lessonPlan_week}'>
      </div>
        <div class='label_value'>
        <label for='lessonPlan_day'>LessonPlan Day</label>
      <input id='lessonPlan_day' value='#{lessonPlan_day}'>
      </div>

      <h2>Elements</h2>
      <div class='menu_box'>
<!--
        <progress min='0' max='100' value='0'></progress>
-->
        <div>
        <ul id='element_list'>
        </ul>
        </div>
        <button class='new_element_button command'>Add Element</button>
        <div class='new_element_form confirmation'>
          <div class='menu_box'>
            <h2>New Element</h2>
            <label for='element_type_select'>Type</label><br>
            #{elementTypeSelect}<br>
            <label for='new_element_name'>Name</label><br>
            <input type='text' id='new_element_name'>
            <input type='file' name='files' id='files' multiple='multiple' />
            <div id='html_div' class='label_value'>
              <label for='html'>Html</label>
              <textarea id='html'>#{html}</textarea>
            </div>
            <button class='new_element_save command'>Add</button> <button class='new_element_cancel command'>Cancel</button>
          </div>
        </div>
      </div>
      <h2></h2>
      <div class='label_value' style='display: none;'> 
        <label for='sequences' title='This is a list of acceptable orders of elements, which will be randomly selected each time an lessonPlan is run. Element indicies are separated by commas, new lines separate sequences. '>Random Sequences</label>
        <div id='element_legend'>#{elementLegend}</div>
        <textarea id='sequences'>#{sequences}</textarea>
      </div>
      <button class='save command'>Save</button>
      "

    # render new element views
    @elementListEditView.setElement(@$el.find("#element_list"))
    @elementListEditView.render()

    # make it sortable
    @$el.find("#element_list").sortable
      handle : '.sortable_handle'
      start: (event, ui) -> ui.item.addClass "drag_shadow"
      stop:  (event, ui) -> ui.item.removeClass "drag_shadow"
      update : (event, ui) =>
        for id, i in ($(li).attr("data-id") for li in @$el.find("#element_list li"))
          @model.elements.get(id).set({"order":i},{silent:true}).save(null,{silent:true})
        @model.elements.sort()

    @trigger "rendered"


  updateElementLegend: =>
    elementLegend = ""
    @model.elements.each (element, i) ->
      elementLegend += "<div class='small_grey'>#{i} - #{element.get("name")}</div><br>"
    $elementWrapper = @$el.find("#element_legend")
    $elementWrapper.html(elementLegend) if $elementWrapper.length != 0
    return elementLegend

  onClose: ->
    @elementListEditView.close()
  
  afterRender: ->
    @elementEditor?.afterRender?()
    CKEDITOR.replace("html")
    $('#files').hide()
    $('#html_div').hide()