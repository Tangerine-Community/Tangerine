class UniversalUploadView extends Backbone.View

  events:
    'click .universal_upload' : 'universalUpload'

  universalUpload: -> Utils.universalUpload()

  i18n: ->
    @text =
      universal_upload : t("AssessmentMenuView.button.universal_upload")

  initialize: (options) ->
    @i18n()

  render: =>
    @$el.html "<button class='command universal_upload'>#{@text.universal_upload}</button>"
