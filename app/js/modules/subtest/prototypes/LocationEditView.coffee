class LocationEditView extends Backbone.View

  className: "LocationEditView"

  events: 
    'keyup #data'               : 'updateData'
    'keyup #levels'             : 'updateLevels'
    'click #data_format input'   : 'updateData'
    'click #levels_format input' : 'updateLevels'


  updateData: (event) ->
    if event?.type == "click"
      if $(event.target).val() == "Tabs" 
        @dataCommaToTab()
        hasTabs   = true
        hasCommas = false
      else
        @dataTabToComma()
        hasTabs   = false
        hasCommas = true
      
    else
      data = @$el.find("#data").val()
      hasTabs = data.match(/\t/g)?
      hasCommas = data.match(/,/g)?

    if hasTabs
      @$el.find("#data_format :radio[value='Tabs']").attr("checked", "checked").button("refresh")
    else
      @$el.find("#data_format :radio[value='Commas']").attr("checked", "checked").button("refresh")

  updateLevels: (event) ->
    if event?.type == "click"
      if $(event.target).val() == "Tabs" 
        @levelsCommaToTab()
        hasTabs   = true
        hasCommas = false
      else
        @levelsTabToComma()
        hasTabs   = false
        hasCommas = true
      
    else
      levels    = @$el.find("#levels").val()
      hasTabs   = levels.match(/\t/g)?
      hasCommas = levels.match(/,/g)?

    levels = @$el.find("#levels").val()
    hasTabs   = levels.match(/\t/g)?
    hasCommas = levels.match(/,/g)?
    if hasTabs
      @$el.find("#levels_format :radio[value='Tabs']").attr("checked", "checked").button("refresh")
    else
      @$el.find("#levels_format :radio[value='Commas']").attr("checked", "checked").button("refresh")


  dataTabToComma: -> @$el.find("#data").val(String(@$el.find("#data").val()).replace(/\t/g,", "))
  dataCommaToTab: -> @$el.find("#data").val(@$el.find("#data").val().replace(/, */g, "\t"))
  levelsTabToComma: -> @$el.find("#levels").val(String(@$el.find("#levels").val()).replace(/\t/g,", "))
  levelsCommaToTab: -> @$el.find("#levels").val(@$el.find("#levels").val().replace(/, */g, "\t"))

  save: ->
    if @$el.find("#data").val().match(/\t/g)?
      @$el.find("#data_format :radio[value='Tabs']").attr("checked", "checked").button("refresh")
      @dataTabToComma()
    if @$el.find("#levels").val().match(/\t/g)?
      @levelsTabToComma()
      @$el.find("#levels_format :radio[value='Tabs']").attr("checked", "checked").button("refresh")
      
    levels = @$el.find("#levels").val().split(/, */g)
    for level, i in levels
      levels[i] = $.trim(level).replace(/[^a-zA-Z0-9']/g,"")

    # removes /\s/
    locationsValue = $.trim(@$el.find("#data").val())

    locations = locationsValue.split("\n")

    for location, i in locations
      locations[i] = location.split(/, */g)

    @model.set
      "levels"    : levels
      "locations" : locations

  isValid: ->
    levels = @model.get("levels")
    for location in @model.get("locations")
      if location.length != levels.length
        @errors.push "column_match" unless "column_match" in @errors
    return @errors.length == 0

  showErrors: ->
    alertText = "Please correct the following errors:\n\n"
    for error in @errors
      alertText += @errorMessages[error]
    alert alertText
    @errors = []

  initialize: ( options ) ->
    @errors = []
    @model = options.model
    @errorMessages = 
      "column_match" : "Some columns in the location data do not match the number of columns in the geographic levels."

  render: ->
    levels    = @model.get("levels")    || []
    locations = @model.get("locations") || []

    levels = _.escape(levels.join(", "))

    locations = locations.join("\n")
    if _.isArray(locations)
      for location, i in locations 
        locations[i] = _.escape(location.join(", "))

    @$el.html  "
      <div class='label_value'>
        <div class='menu_box'>
          <label for='levels' title='This is a comma separated list of geographic levels. (E.g. Country, Province, District, School Id) These are the levels that you would consider individual fields on the location form.'>Geographic Levels</label>
          <input id='levels' value='#{levels}'>
          <label title='Tangerine uses comma separated values. If you copy and paste from another program like Excel, the values will be tab separated. These buttons allow you to switch back and forth, however, Tangerine will always save the comma version.'>Format</label><br>
          <div id='levels_format' class='buttonset'>
            <label for='levels_tabs'>Tabs</label>
            <input id='levels_tabs' name='levels_format' type='radio' value='Tabs'>
            <label for='levels_commas'>Commas</label>
            <input id='levels_commas' name='levels_format' type='radio' value='Commas'>
          </div>
        </div>

      </div>
      <div class='label_value'>
        <div class='menu_box'>
          <label for='data' title='Comma sperated values, with multiple rows separated by line. This information will be used to autofill the location data.'>Location data</label>
          <textarea id='data'>#{locations}</textarea><br>
          <label title='Tangerine uses comma separated values. If you copy and paste from another program like Excel, the values will be tab separated. These buttons allow you to switch back and forth, however, Tangerine will always save the comma version.'>Format</label><br>        <div id='data_format' class='buttonset'>
            <label for='data_tabs'>Tabs</label>
            <input id='data_tabs' name='data_format' type='radio' value='Tabs'>
            <label for='data_commas'>Commas</label>
            <input id='data_commas' name='data_format' type='radio' value='Commas'>
        </div>
        
      </div>
    "

  afterRender: ->
    @updateLevels()
    @updateData()

