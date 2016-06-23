class LocationRunItemView extends Backbone.Marionette.ItemView

  className: "LocationRunItemView"

  events:
    "click .school_list li" : "autofill"
    "keyup input"  : "showOptions"
    "click .clear" : "clearInputs"
    "change select" : "onSelectChange"

  i18n: ->
    @text = 
      clear : t("LocationRunView.button.clear")
      "help" : t("SubtestRunView.button.help")

  initialize: (options) ->
    Tangerine.progress.currentSubview = @
    @i18n()

    @model  = options.model
    @parent = @model.parent
    @dataEntry = options.dataEntry

    labels = {}
    labels.text = @text
    @model.set('labels', labels)


    @levels = @model.get("levels")       || []
    @locations = @model.get("locations") || []

    if @levels.length is 1 and @levels[0] is ""
      @levels = []
    if @locations.length is 1 and @locations[0] is ""
      @locations = []

    @haystack = []

    for location, i in @locations
      @haystack[i] = []
      for locationData in location
        @haystack[i].push locationData.toLowerCase()

    template = "<li data-index='{{i}}'>"
    for level, i in @levels
      template += "{{level_#{i}}}"
      template += " - " unless i is @levels.length-1
    template += "</li>"

    @skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    @backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0
    @parent.displaySkip(@skippable)
    @parent.displayBack(@backable)

    @li = _.template(template)

  clearInputs: ->
    @$el.empty()
    @render()

  autofill: (event) ->
    @$el.find(".autofill").fadeOut(250)
    index = $(event.target).attr("data-index")
    location = @locations[index]
    for level, i in @levels
      @$el.find("#level_#{i}").val(location[i])


  showOptions: (event) ->
    needle = $(event.target).val().toLowerCase()
    fieldIndex = parseInt($(event.target).attr('data-level'))
    # hide if others are showing
    for otherField in [0..@haystack.length]
      @$el.find("#autofill_#{otherField}").hide()

    atLeastOne = false
    results = []
    for stack, i in @haystack
      isThere = ~@haystack[i][fieldIndex].indexOf(needle)
      results.push i if isThere
      atLeastOne = true if isThere

    for stack, i in @haystack
      for otherField, j in stack
        if j is fieldIndex
          continue
        isThere = ~@haystack[i][j].indexOf(needle)
        results.push i if isThere and !~results.indexOf(i)
        atLeastOne = true if isThere

    if atLeastOne
      html = ""
      for result in results
        html += @getLocationLi result
      @$el.find("#autofill_#{fieldIndex}").fadeIn(250)
      @$el.find("#school_list_#{fieldIndex}").html html

    else
      @$el.find("#autofill_#{fieldIndex}").fadeOut(250)

  getLocationLi: (i) ->
    templateInfo = "i" : i
    for location, j in @locations[i]
      templateInfo["level_" + j] = location
    return @li templateInfo

  render: ->

    schoolListElements = ""

    html = "<button class='clear command'>#{@text.clear}</button>"

    unless @dataEntry
      previous = @model.parent.result.getByHash(@model.get('hash'))

    if @typed

      for level, i in @levels
        previousLevel = ''
        if previous
          if previous.location
            previousLevel = previous.location[i]
        html += "
          <div class='label_value'>
            <label for='level_#{i}'>#{level}</label><br>
            <input data-level='#{i}' id='level_#{i}' value='#{previousLevel||''}'>
          </div>
          <div id='autofill_#{i}' class='autofill' style='display:none'>
            <h2>#{t('select one from autofill list')}</h2>
            <ul class='school_list' id='school_list_#{i}'>
            </ul>
          </div>
        "

    else

      for level, i in @levels

        previousLevel = ''
        if previous
          if previous.location
            previousLevel = previous.location[i]
        
        levelOptions = @getOptions(i, previousLevel)

        isDisabled = (i isnt 0 and not previousLevel) and "disabled='disabled'" 

        html += "
          <div class='label_value'>
            <label for='level_#{i}'>#{level}</label><br>
            <select id='level_#{i}' data-level='#{i}' #{isDisabled||''}>
              #{levelOptions}
            </select>
          </div>
        "
    @$el.html html

    @trigger "rendered"
    @trigger "ready"

  onSelectChange: (event) ->
    $target = $(event.target)
    levelChanged = parseInt($target.attr("data-level"))
    newValue = $target.val()
    nextLevel = levelChanged + 1
    if levelChanged isnt @levels.length
      @$el.find("#level_#{nextLevel}").removeAttr("disabled")
      $html = @$el.find("#level_#{nextLevel}").html @getOptions(nextLevel)
      # If there is only one option, select that option.
      if (options = $html.find("option")).length is 2
        # Programatically set the selected value.
        $(options.parent("select")).val($(options[1]).val())
        # Trigger change event that would otherwise be triggered by user-browser
        # interaction.
        $(options.parent("select")).trigger "change"

  getOptions: ( index, previousLevel ) ->

    doneOptions = []
    levelOptions = ''

    previousFlag = false

    parentValues = []
    for i in [0..index]
      break if i is index
      parentValues.push @$el.find("#level_#{i}").val()

    for location, i in @locations

      unless ~doneOptions.indexOf location[index]

        isNotChild = index is 0
        isValidChild = true
        for i in [0..Math.max(index-1,0)]

          if parentValues[i] isnt location[i] and not previousLevel
            isValidChild = false
            break

        if isNotChild or isValidChild

          doneOptions.push location[index]

          locationName = _(location[index]).escape()
          
          if location[index] is previousLevel
            selected = "selected='selected'"
            previousFlag = true
          else
            selected = ''
          levelOptions += "
            <option value='#{locationName}' #{selected or ''}>#{locationName}</option>
          "

    selectPrompt = "selected='selected'" unless previousFlag

    promptOption  = "<option #{selectPrompt or ''} disabled='disabled'>Please select a #{@levels[index]}</option>"

#    if doneOptions.length is 1
#      return levelOptions
#    else
    return "
      #{promptOption}
      #{levelOptions}
      "

  getResult: ->
    result =
      "labels"   : (level.replace(/[\s-]/g,"_") for level in @levels)
      "location" : ($.trim(@$el.find("#level_#{i}").val()) for level, i in @levels)
    hash = @model.get("hash") if @model.has("hash")
    subtestResult =
      'body' : result
      'meta' :
        'hash' : hash

  getSkipped: ->
    return {
      "labels"   : (level.replace(/[\s-]/g,"_") for level in @levels)
      "location" : ("skipped" for level, i in @levels)
    }

  isValid: ->
#    console.log("Checking Location isValid: ")
    @$el.find(".message").remove()
    inputs = @$el.find("input")
    selects = @$el.find("select")
    elements = if selects.length > 0 then selects else inputs
    for input, i in elements
#      return false unless $(input).val()
      value = $(input).val()
#      if value
      return false unless value
    true

  testValid: ->
#    console.log("LocationRunItemView testValid.")
  #    if not @prototypeRendered then return false
#    currentView = Tangerine.progress.currentSubview
    if @isValid?
      return @isValid()
    else
      return false
    true

  showErrors: ->
    inputs = @$el.find("input")
    selects = @$el.find("select")
    elements = if selects.length > 0 then selects else inputs
    for input in elements
      unless $(input).val()
        levelName = $('label[for='+$(input).attr('id')+']').text()
        $(input).after " <span class='message'>#{t("LocationRunView.message.must_be_filled", levelName : levelName)}</span>"
