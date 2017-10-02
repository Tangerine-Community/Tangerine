class CurriculaView extends Backbone.View

  className : "CurriculaView"

  events :
    'click .import' : 'gotoImport'
    'click .back'   : 'goBack'

  goBack: -> history.back()

  gotoImport: ->
    Tangerine.router.navigate "curriculumImport", true

  initialize: (options )->
    @subView = new CurriculaListView
      curricula : options.curricula

  render: ->
    @$el.html "
      <button class='back navigation'>#{t('back')}</button><br>
      <button class='command import'>#{t('import')}</button>
      <br>
      <div id='curricula_list'></div>
    "

    @subView.setElement @$el.find('#curricula_list')
    @subView.render()

    @trigger "rendered"

  onClose: ->
    @subView?.close()