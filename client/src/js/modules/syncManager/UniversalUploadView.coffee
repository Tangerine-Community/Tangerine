class UniversalUploadView extends Backbone.View

  events:
    'click .universal_upload' : 'universalUpload'

  universalUpload: ->
    $("#upload_results").html('Uploading... <br/>')
    Utils.syncUsers (err, response) ->
      if (err)
        $("#upload_results").append('Error: Unable to upload users <br/>')
        $("#upload_results").append('Now trying to upload results... <br/>')
      Utils.universalUpload()

  i18n: ->
    @text =
      universal_upload : t("AssessmentMenuView.button.universal_upload")

  initialize: (options) ->
    @i18n()

  render: =>
    @$el.html "
      <button class='command universal_upload'>#{@text.universal_upload}</button>
      <div id='upload_results'></div>    
    "
