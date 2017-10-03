class ResultsSaveAsFileView extends Backbone.View

  events:
    'click .save_to_disk'        : 'saveToDisk'

  saveToDisk: ->
    Utils.saveDocListToFile()

  i18n: ->
    @text =
      save_to_disk  : t("AssessmentMenuView.button.save_to_disk")

  initialize: (options) ->
    @i18n()
      
  render: =>
    @$el.html "<button class='command save_to_disk'>#{@text.save_to_disk}</button>"
