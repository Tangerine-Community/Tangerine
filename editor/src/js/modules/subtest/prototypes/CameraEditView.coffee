class CameraEditView extends Backbone.View

  className : "CameraEditView"

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

    @qualityOptions = 
      30: 'Low'
      60: 'Medium'
      80: 'High'
      100: 'Maximum'

    @sizeOptions = 
      200: '200 px'
      300: '300 px'
      400: '400 px'
      500: '500 px'
      600: '600 px'
      700: '700 px'
      800: '800 px'
      900: '900 px'

  render: -> 
    variableName    = @model.get("variableName")   || ""
    captureQuality  = @model.get("captureQuality") || 60
    captureSize     = @model.get("captureSize")    || 300
    
    qualityOptionsHTML = ""
    for optK, optV of @qualityOptions 
      qualityOptionsHTML += "<option value='#{optK}' #{if (parseInt(optK) == parseInt(captureQuality)) then 'selected' else ''}>#{optV}</option>"

    sizeOptionsHTML = ""
    for optK, optV of @sizeOptions 
      sizeOptionsHTML += "<option value='#{optK}' #{if (parseInt(optK) == parseInt(captureSize)) then 'selected' else ''}>#{optV}</option>"

    @$el.html "
      <div class='label_value'>
        <label for='subtest_variable_name' title='This will be used for CSV exporting.'>Variable name</label>
        <input id='subtest_variable_name' value='#{variableName}'>
      </div>
      <p><strong>Note:</strong> Larger Quality and MaxSize choices will significantly increase the upload time of photos</p>
      <div class='label_value'>
        <label for='subtest_capture_quality' title='This defines the quality of the image captured'>Capture Quality</label>
        <select id='subtest_capture_quality'>
          #{qualityOptionsHTML}
        </select>
      </div>
      <div class='label_value'>
        <label for='subtest_capture_size' title='This defines the maximum hight/width of the image captured'>Capture Size (Max Height or Width)</label>
        <select id='subtest_capture_size'>
          #{sizeOptionsHTML}
        </select>
      </div>
      "

  save: -> 
    @model.set
      variableName:   @$el.find("#subtest_variable_name").val().replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g,"")
      captureQuality: @$el.find("#subtest_capture_quality option:selected").val()
      captureSize:    @$el.find("#subtest_capture_size option:selected").val()
  
  isValid: -> true
